import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { parseCsv } from './convertCivicGroups';
import { TAIPEI_DISTRICT_CENTROIDS } from '../src/lib/civicGroups';
import {
  buildDentureSubsidyMedicalProviderSummary, cleanText, createDentureSubsidyProviderMapQuery,
  normalizeMedicalProviderName, normalizeText, parseAdministrativeArea, parseDentureSubsidyType,
  parseMedicalProviderAddress, parseMedicalProviderPhone, reconcileProviderArea,
} from '../src/lib/dentureSubsidyMedicalProviders';
import type { DentureSubsidyMedicalProviderRecord } from '../src/types';

const rawDir = join(process.cwd(), 'data/raw/denture-subsidy-medical-providers');
const outputDir = join(process.cwd(), 'public/data');
const reportPath = join(outputDir, 'conversion-report.json');
const source = '臺北市假牙補助醫療院所名單';
const sourceAgency = '臺北市政府社會局';
const decode = (bytes: Uint8Array) => { try { return { text: new TextDecoder('big5', { fatal: true }).decode(bytes).replace(/^\uFEFF/, ''), encoding: 'CP950 / Big5-compatible' }; } catch { return { text: new TextDecoder('utf-8', { fatal: true }).decode(bytes).replace(/^\uFEFF/, ''), encoding: 'UTF-8-SIG / UTF-8' }; } };
const duplicates = (values: Array<string | undefined>) => [...values.reduce((map, value) => value ? map.set(value, (map.get(value) ?? 0) + 1) : map, new Map<string, number>())].filter(([, count]) => count > 1).slice(0, 30).map(([value, count]) => ({ value, count }));

export async function convertDentureSubsidyMedicalProviders(filePath?: string) {
  const csvFile = filePath ? undefined : (await readdir(rawDir)).find((file) => file.toLowerCase().endsWith('.csv'));
  if (!filePath && !csvFile) throw new Error('No denture subsidy provider CSV found. Run npm run data:fetch:denture-subsidy-providers.');
  const inputPath = filePath ?? join(rawDir, csvFile!), { text, encoding } = decode(await readFile(inputPath)), [rawHeaders, ...rows] = parseCsv(text);
  if (!rawHeaders) throw new Error('Invalid denture subsidy provider CSV: file is empty.');
  const headers = rawHeaders.map((header) => cleanText(header) ?? ''), required = ['補助類型', '區域', '院所名稱', '地址', '連絡電話'], missing = required.filter((header) => !headers.includes(header));
  if (missing.length) throw new Error(`Invalid denture subsidy provider CSV: missing columns ${missing.join(', ')}.`);

  const subsidyWarnings: string[] = [], areaWarnings: string[] = [], addressWarnings: string[] = [], mismatchWarnings: string[] = [], phoneWarnings: string[] = [], duplicateKeys: string[] = [], seenKeys = new Set<string>();
  const records = rows.flatMap((row, index): DentureSubsidyMedicalProviderRecord[] => {
    const values = Object.fromEntries(headers.map((header, column) => [header, cleanText(row[column])])), providerName = cleanText(values['院所名稱']);
    if (!providerName) return [];
    const subsidy = parseDentureSubsidyType(values['補助類型']), area = parseAdministrativeArea(values['區域']), address = parseMedicalProviderAddress(values['地址']), reconciliation = reconcileProviderArea(area), phone = parseMedicalProviderPhone(values['連絡電話']);
    if (subsidy.warning && subsidy.subsidyTypeRaw && subsidyWarnings.length < 20) subsidyWarnings.push(`${providerName}:${subsidy.subsidyTypeRaw}`);
    if (area.warning && areaWarnings.length < 20) areaWarnings.push(`${providerName}:${area.warning}`);
    if (address.warning && addressWarnings.length < 20) addressWarnings.push(`${providerName}:${address.warning}`);
    if (reconciliation.warning && mismatchWarnings.length < 20) mismatchWarnings.push(`${providerName}:${reconciliation.warning}`);
    if (phone.warning && phoneWarnings.length < 20) phoneWarnings.push(values['連絡電話'] ?? '');
    const primaryKey = [normalizeText(subsidy.subsidyType), normalizeMedicalProviderName(providerName), normalizeText(address.address)].join('|');
    const fallbackKey = [normalizeMedicalProviderName(providerName), normalizeText(phone.phone)].join('|');
    const key = primaryKey.replaceAll('|', '') ? primaryKey : fallbackKey;
    if (seenKeys.has(key) && duplicateKeys.length < 20) duplicateKeys.push(key); seenKeys.add(key);
    const sourceRecordHash = createHash('sha1').update(`${key}|${index}`).digest('hex'), point = area.taipeiDistrict ? TAIPEI_DISTRICT_CENTROIDS[area.taipeiDistrict] : undefined;
    return [{ id: sourceRecordHash.slice(0, 12), module: 'denture_subsidy_medical_providers', ...subsidy, providerName, providerNameNormalized: normalizeMedicalProviderName(providerName), ...area, ...address, ...reconciliation, ...phone, hasPhone: phone.phoneType !== 'missing', locationPrecision: point ? 'district_centroid' : (address.address ? 'address_only' : 'missing'), latitude: point?.latitude, longitude: point?.longitude, googleMapsQuery: createDentureSubsidyProviderMapQuery({ providerName, address: address.address }), sourceRecordHash, source, sourceAgency }];
  });
  const fileInfo = await stat(inputPath), report = await readFile(reportPath, 'utf8').then(JSON.parse).catch(() => ({}));
  const dentureSubsidyMedicalProviders = {
    source, sourceAgency: '社會局', sourcePage: 'https://data.taipei/dataset/detail?id=76b8b514-e793-4cca-8dcf-065d5af4b760',
    category: '社福', serviceCategory: '老年安養', datasetType: '原始資料', updateFrequency: '不定期更新',
    officialResourceUpdateTime: '2024-12-18 17:17:58', officialMetadataUpdateTime: '2025-12-11 20:01:36',
    inputFile: basename(inputPath), convertedAt: new Date().toISOString(), fileSize: fileInfo.size, encoding, inputRows: rows.length, outputRecords: records.length,
    duplicateProviderNames: duplicates(records.map((record) => record.providerNameNormalized)),
    duplicateAddresses: duplicates(records.map((record) => record.addressNormalized)),
    duplicatePhones: duplicates(records.map((record) => record.phone)),
    duplicateFallbackKeys: duplicateKeys,
    subsidyWarnings, areaWarnings, addressWarnings, districtMismatchWarnings: mismatchWarnings, phoneWarnings,
    notes: ['Big5 / CP950 decoded with UTF-8-SIG fallback', 'Subsidy type and hospital branch names preserved', 'No geocoding performed; map uses district centroid summaries only', 'This is not appointment, subsidy-eligibility, subsidy-amount, fee, dental-treatment-advice, medical-advice, emergency, quality-ranking, or endorsement data'],
  };
  await mkdir(outputDir, { recursive: true });
  await Promise.all([
    writeFile(join(outputDir, 'denture-subsidy-medical-providers.json'), JSON.stringify(records)),
    writeFile(join(outputDir, 'denture-subsidy-medical-provider-summary.json'), JSON.stringify(buildDentureSubsidyMedicalProviderSummary(records))),
    writeFile(reportPath, JSON.stringify({ ...report, dentureSubsidyMedicalProviders }, null, 2)),
  ]);
  console.log(`Converted ${records.length} denture subsidy provider records from ${basename(inputPath)}.`);
}

if (import.meta.url === `file://${process.argv[1]}`) await convertDentureSubsidyMedicalProviders(process.argv.find((arg) => arg.startsWith('--file='))?.slice(7));
