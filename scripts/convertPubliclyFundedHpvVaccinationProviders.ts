import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { parseCsv } from './convertCivicGroups';
import { buildPubliclyFundedHpvVaccinationProviderSummary, createHpvProviderMapQuery, normalizeProviderName, normalizeText, parseIntegerText, parseMedicalProviderAddress, parseMedicalProviderPhone, parseTaipeiDistrictCode, reconcileDistrict } from '../src/lib/publiclyFundedHpvVaccinationProviders';
import { cleanText } from '../src/lib/contractedVaccinationMedicalProviders';
import { normalizeColumnName } from '../src/lib/civicGroups';
import type { PubliclyFundedHpvVaccinationProviderRecord } from '../src/types';

const rawDir = join(process.cwd(), 'data/raw/publicly-funded-hpv-vaccination-providers'), outputDir = join(process.cwd(), 'public/data'), reportPath = join(outputDir, 'conversion-report.json');
const source = '臺北市公費HPV疫苗特約醫療院所', sourceAgency = '臺北市政府衛生局';
const decode = (bytes: Uint8Array) => { try { return { text: new TextDecoder('utf-8', { fatal: true }).decode(bytes).replace(/^\uFEFF/, ''), encoding: 'UTF-8-SIG / UTF-8' }; } catch { return { text: new TextDecoder('big5', { fatal: true }).decode(bytes).replace(/^\uFEFF/, ''), encoding: 'CP950 / Big5-compatible' }; } };
const duplicates = (values: Array<string | undefined>) => [...values.reduce((map, value) => value ? map.set(value, (map.get(value) ?? 0) + 1) : map, new Map<string, number>())].filter(([, count]) => count > 1).slice(0, 30).map(([value, count]) => ({ value, count }));

export async function convertPubliclyFundedHpvVaccinationProviders(filePath?: string) {
  const csvFile = filePath ? undefined : (await readdir(rawDir)).find((file) => file.toLowerCase().endsWith('.csv'));
  if (!filePath && !csvFile) throw new Error('No publicly funded HPV vaccination provider CSV found. Run npm run data:fetch:hpv-providers.');
  const inputPath = filePath ?? join(rawDir, csvFile!), { text, encoding } = decode(await readFile(inputPath)), [rawHeaders, ...rows] = parseCsv(text);
  if (!rawHeaders) throw new Error('Invalid HPV provider CSV: file is empty.');
  const headers = rawHeaders.map(normalizeColumnName), required = ['項次', '行政區', '醫療院所名稱', '地址', '聯絡電話'], missing = required.filter((header) => !headers.includes(header));
  if (missing.length) throw new Error(`Invalid HPV provider CSV: missing columns ${missing.join(', ')}.`);
  const unknownDistrictCodes: string[] = [], addressWarnings: string[] = [], districtMismatchWarnings: string[] = [], phoneWarnings: string[] = [], duplicateKeys: string[] = [], seenKeys = new Set<string>();
  const records = rows.flatMap((row, index): PubliclyFundedHpvVaccinationProviderRecord[] => {
    const values = Object.fromEntries(headers.map((header, column) => [header, cleanText(row[column])])), providerName = cleanText(values['醫療院所名稱']);
    if (!providerName) return [];
    const districtCode = parseTaipeiDistrictCode(values['行政區']), address = parseMedicalProviderAddress(values['地址']), district = reconcileDistrict({ districtFromCode: districtCode.districtFromCode, districtFromAddress: address.districtFromAddress }), phone = parseMedicalProviderPhone(values['聯絡電話']);
    if (districtCode.warning && districtCode.districtCode && unknownDistrictCodes.length < 20) unknownDistrictCodes.push(districtCode.districtCode);
    if (address.warning && addressWarnings.length < 20) addressWarnings.push(values['地址'] ?? '');
    if (district.warning && districtMismatchWarnings.length < 20) districtMismatchWarnings.push(`${providerName}: ${districtCode.districtFromCode ?? '-'} / ${address.districtFromAddress ?? '-'}`);
    if (phone.warning && phoneWarnings.length < 20) phoneWarnings.push(values['聯絡電話'] ?? '');
    const sourceSequenceNumber = parseIntegerText(values['項次']);
    const key = [normalizeText(sourceSequenceNumber), normalizeText(providerName), normalizeText(address.address)].join('|') || [normalizeText(providerName), normalizeText(address.address), normalizeText(phone.phone)].join('|');
    if (seenKeys.has(key) && duplicateKeys.length < 20) duplicateKeys.push(key); seenKeys.add(key);
    const sourceRecordHash = createHash('sha1').update(`${key}|${index}`).digest('hex');
    return [{ id: sourceRecordHash.slice(0, 12), module: 'publicly_funded_hpv_vaccination_providers', sourceSequenceNumber, ...districtCode, providerName, providerNameNormalized: normalizeProviderName(providerName), ...address, ...district, ...phone, hasPhone: phone.phoneType !== 'missing', locationPrecision: 'address_only', googleMapsQuery: createHpvProviderMapQuery({ providerName, address: address.address }), sourceRecordHash, source, sourceAgency }];
  });
  const fileInfo = await stat(inputPath), report = await readFile(reportPath, 'utf8').then(JSON.parse).catch(() => ({}));
  const publiclyFundedHpvVaccinationProviders = { source, sourceAgency: '衛生局', sourcePage: 'https://data.taipei/dataset/detail?id=96f143fe-4c95-4d88-9985-77f28e2d2c3d', theme: '醫療', serviceCategory: '就醫', updateFrequency: '不定期更新', officialResourceUpdateTime: '2026-04-14 17:33:04', officialMetadataUpdateTime: '2026-06-18 09:33:20', inputFile: basename(inputPath), convertedAt: new Date().toISOString(), fileSize: fileInfo.size, encoding, inputRows: rows.length, outputRecords: records.length, unknownDistrictCodes, addressWarnings, districtMismatchWarnings, phoneWarnings, duplicateProviderNames: duplicates(records.map((record) => record.providerNameNormalized)), duplicateAddresses: duplicates(records.map((record) => record.addressNormalized)), duplicatePhones: duplicates(records.map((record) => record.phone)), duplicateFallbackKeys: duplicateKeys, notes: ['UTF-8-SIG decoded with Big5 fallback', 'District codes preserved as strings and mapped to Taipei district names', 'No geocoding performed; map uses district centroid summaries only'] };
  await mkdir(outputDir, { recursive: true });
  await Promise.all([writeFile(join(outputDir, 'publicly-funded-hpv-vaccination-providers.json'), JSON.stringify(records)), writeFile(join(outputDir, 'publicly-funded-hpv-vaccination-provider-summary.json'), JSON.stringify(buildPubliclyFundedHpvVaccinationProviderSummary(records))), writeFile(reportPath, JSON.stringify({ ...report, publiclyFundedHpvVaccinationProviders }, null, 2))]);
  console.log(`Converted ${records.length} publicly funded HPV vaccination provider records from ${basename(inputPath)}.`);
}
if (import.meta.url === `file://${process.argv[1]}`) await convertPubliclyFundedHpvVaccinationProviders(process.argv.find((arg) => arg.startsWith('--file='))?.slice(7));
