import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { parseCsv } from './convertCivicGroups';
import { TAIPEI_DISTRICT_CENTROIDS } from '../src/lib/civicGroups';
import {
  buildChildMedicalSubsidyContractedProviderSummary, cleanText, createChildMedicalProviderMapQuery,
  normalizeProviderName, normalizeText, parseAdministrativeArea, parseIntegerText,
  parseMedicalProviderAddress, parseMedicalProviderPhone, parseProviderCode, reconcileProviderArea,
} from '../src/lib/childMedicalSubsidyContractedProviders';
import type { ChildMedicalSubsidyContractedProviderRecord } from '../src/types';

const rawDir = join(process.cwd(), 'data/raw/child-medical-subsidy-contracted-providers');
const outputDir = join(process.cwd(), 'public/data');
const reportPath = join(outputDir, 'conversion-report.json');
const source = '臺北市兒童醫療補助特約院所名冊';
const sourceAgency = '臺北市政府衛生局';
const decode = (bytes: Uint8Array) => { try { return { text: new TextDecoder('utf-8', { fatal: true }).decode(bytes).replace(/^\uFEFF/, ''), encoding: 'UTF-8-SIG / UTF-8' }; } catch { return { text: new TextDecoder('big5', { fatal: true }).decode(bytes).replace(/^\uFEFF/, ''), encoding: 'CP950 / Big5-compatible' }; } };
const duplicates = (values: Array<string | undefined>) => [...values.reduce((map, value) => value ? map.set(value, (map.get(value) ?? 0) + 1) : map, new Map<string, number>())].filter(([, count]) => count > 1).slice(0, 30).map(([value, count]) => ({ value, count }));

export async function convertChildMedicalSubsidyContractedProviders(filePath?: string) {
  const csvFile = filePath ? undefined : (await readdir(rawDir)).find((file) => file.toLowerCase().endsWith('.csv'));
  if (!filePath && !csvFile) throw new Error('No child medical subsidy provider CSV found. Run npm run data:fetch:child-medical-subsidy-providers.');
  const inputPath = filePath ?? join(rawDir, csvFile!), { text, encoding } = decode(await readFile(inputPath)), [rawHeaders, ...rows] = parseCsv(text);
  if (!rawHeaders) throw new Error('Invalid child medical subsidy provider CSV: file is empty.');
  const headers = rawHeaders.map((header) => cleanText(header) ?? ''), required = ['編號', '院所代碼', '診所名稱', '行政區', '地址', '電話'], missing = required.filter((header) => !headers.includes(header));
  if (missing.length) throw new Error(`Invalid child medical subsidy provider CSV: missing columns ${missing.join(', ')}.`);

  const areaWarnings: string[] = [], addressWarnings: string[] = [], mismatchWarnings: string[] = [], phoneWarnings: string[] = [], duplicateKeys: string[] = [], seenKeys = new Set<string>();
  const firstPass = rows.flatMap((row, index) => {
    const values = Object.fromEntries(headers.map((header, column) => [header, cleanText(row[column])])), providerName = cleanText(values['診所名稱']);
    if (!providerName) return [];
    const sourceSequenceNumber = parseIntegerText(values['編號']), providerCode = parseProviderCode(values['院所代碼']), area = parseAdministrativeArea(values['行政區']), address = parseMedicalProviderAddress(values['地址']), reconciliation = reconcileProviderArea(area), phone = parseMedicalProviderPhone(values['電話']);
    if (area.warning && areaWarnings.length < 20) areaWarnings.push(`${providerName}:${area.warning}`);
    if (address.warning && addressWarnings.length < 20) addressWarnings.push(`${providerName}:${address.warning}`);
    if (reconciliation.warning && mismatchWarnings.length < 20) mismatchWarnings.push(`${providerName}:${reconciliation.warning}`);
    if (phone.warning && phoneWarnings.length < 20) phoneWarnings.push(values['電話'] ?? '');
    const primaryKey = [normalizeText(sourceSequenceNumber), normalizeText(providerCode), normalizeProviderName(providerName)].join('|');
    const fallbackKey = [normalizeProviderName(providerName), normalizeText(address.address), normalizeText(phone.phone)].join('|');
    const key = primaryKey.replaceAll('|', '') ? primaryKey : fallbackKey;
    if (seenKeys.has(key) && duplicateKeys.length < 20) duplicateKeys.push(key); seenKeys.add(key);
    const sourceRecordHash = createHash('sha1').update(`${key}|${index}`).digest('hex'), point = area.taipeiDistrict ? TAIPEI_DISTRICT_CENTROIDS[area.taipeiDistrict] : undefined;
    return [{ id: sourceRecordHash.slice(0, 12), module: 'child_medical_subsidy_contracted_providers' as const, sourceSequenceNumber, providerCode, providerCodeNormalized: providerCode, providerName, providerNameNormalized: normalizeProviderName(providerName), ...area, ...address, ...reconciliation, ...phone, hasPhone: phone.phoneType !== 'missing', duplicateProviderCode: false, locationPrecision: point ? 'district_centroid' as const : (address.address ? 'address_only' as const : 'missing' as const), latitude: point?.latitude, longitude: point?.longitude, googleMapsQuery: createChildMedicalProviderMapQuery({ providerName, address: address.address }), sourceRecordHash, source, sourceAgency }];
  });
  const duplicateProviderCodes = new Set(duplicates(firstPass.map((record) => record.providerCodeNormalized)).map((item) => item.value));
  const records: ChildMedicalSubsidyContractedProviderRecord[] = firstPass.map((record) => ({ ...record, duplicateProviderCode: Boolean(record.providerCodeNormalized && duplicateProviderCodes.has(record.providerCodeNormalized)) }));
  const fileInfo = await stat(inputPath), report = await readFile(reportPath, 'utf8').then(JSON.parse).catch(() => ({}));
  const childMedicalSubsidyContractedProviders = {
    source, sourceAgency: '衛生局', sourcePage: 'https://data.taipei/dataset/detail?id=3cc250f5-9f5a-4670-ac7b-f13ecd316032',
    category: '醫療', serviceCategory: '就醫', datasetType: '原始資料', updateFrequency: '不定期更新',
    officialResourceUpdateTime: '2026-06-17 08:46:03', officialMetadataUpdateTime: '2026-06-17 08:46:26',
    inputFile: basename(inputPath), convertedAt: new Date().toISOString(), fileSize: fileInfo.size, encoding, inputRows: rows.length, outputRecords: records.length,
    duplicateProviderNames: duplicates(records.map((record) => record.providerNameNormalized)),
    duplicateProviderCodes: duplicates(records.map((record) => record.providerCodeNormalized)),
    duplicateAddresses: duplicates(records.map((record) => record.addressNormalized)),
    duplicatePhones: duplicates(records.map((record) => record.phone)),
    duplicateFallbackKeys: duplicateKeys,
    areaWarnings, addressWarnings, districtMismatchWarnings: mismatchWarnings, phoneWarnings,
    outsideTaipeiAreas: [...new Set(records.flatMap((record) => record.outsideTaipeiArea ?? []))],
    notes: ['UTF-8-SIG decoded with Big5 fallback', 'Provider codes preserved as text', 'Outside-Taipei area values preserved and not forced into Taipei districts', 'No geocoding performed; Taipei records use district centroid summaries only', 'This is not appointment, subsidy-eligibility, fee, medical-advice, pediatric-recommendation, emergency, quality-ranking, or endorsement data'],
  };
  await mkdir(outputDir, { recursive: true });
  await Promise.all([
    writeFile(join(outputDir, 'child-medical-subsidy-contracted-providers.json'), JSON.stringify(records)),
    writeFile(join(outputDir, 'child-medical-subsidy-contracted-provider-summary.json'), JSON.stringify(buildChildMedicalSubsidyContractedProviderSummary(records))),
    writeFile(reportPath, JSON.stringify({ ...report, childMedicalSubsidyContractedProviders }, null, 2)),
  ]);
  console.log(`Converted ${records.length} child medical subsidy provider records from ${basename(inputPath)}.`);
}

if (import.meta.url === `file://${process.argv[1]}`) await convertChildMedicalSubsidyContractedProviders(process.argv.find((arg) => arg.startsWith('--file='))?.slice(7));
