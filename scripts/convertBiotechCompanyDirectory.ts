import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { parseCsv } from './convertCivicGroups';
import { buildBiotechCompanyDirectorySummary, classifyBiotechIndustryCategory, cleanText, createBiotechCompanyMapQuery, normalizeResponsiblePerson, normalizeText, parseBiotechCompanyAddress, parseBiotechCompanyCoordinates, parseCompanyPhone, parseUnifiedBusinessNumber } from '../src/lib/biotechCompanyDirectory';
import { normalizeColumnName } from '../src/lib/civicGroups';
import type { BiotechCompanyDirectoryRecord } from '../src/types';

const rawDir = join(process.cwd(), 'data/raw/biotech-company-directory'), outputDir = join(process.cwd(), 'public/data'), reportPath = join(outputDir, 'conversion-report.json');
const source = '臺北市生技廠商企業名錄', sourceAgency = '臺北市政府產業發展局';
const decode = (bytes: Uint8Array) => { try { return { text: new TextDecoder('utf-8', { fatal: true }).decode(bytes).replace(/^\uFEFF/, ''), encoding: 'UTF-8-SIG / UTF-8' }; } catch { return { text: new TextDecoder('big5', { fatal: true }).decode(bytes).replace(/^\uFEFF/, ''), encoding: 'CP950 / Big5-compatible' }; } };
const duplicates = (values: Array<string | undefined>) => [...values.reduce((map, value) => value ? map.set(value, (map.get(value) ?? 0) + 1) : map, new Map<string, number>())].filter(([, count]) => count > 1).slice(0, 30).map(([value, count]) => ({ value, count }));

export async function convertBiotechCompanyDirectory(filePath?: string) {
  const csvFile = filePath ? undefined : (await readdir(rawDir)).find((file) => file.toLowerCase().endsWith('.csv'));
  if (!filePath && !csvFile) throw new Error('No biotech company directory CSV found. Run npm run data:fetch:biotech-companies.');
  const inputPath = filePath ?? join(rawDir, csvFile!), { text, encoding } = decode(await readFile(inputPath)), [rawHeaders, ...rows] = parseCsv(text);
  if (!rawHeaders) throw new Error('Invalid biotech company directory CSV: file is empty.');
  const headers = rawHeaders.map(normalizeColumnName), required = ['單位名稱', '統一編號', '登記地址', '公司電話', '產業範疇'], missing = required.filter((header) => !headers.includes(header));
  if (missing.length) throw new Error(`Invalid biotech company directory CSV: missing columns ${missing.join(', ')}.`);
  const xHeader = headers.includes('位置X座標(經度)') ? '位置X座標(經度)' : '位置X座標', yHeader = headers.includes('位置Y座標(緯度)') ? '位置Y座標(緯度)' : '位置Y座標';
  const addressWarnings: string[] = [], coordinateWarnings: string[] = [], phoneWarnings: string[] = [], unusualBusinessNumbers: string[] = [], seenKeys = new Set<string>(), duplicateKeys: string[] = [];
  const records = rows.flatMap((row, index): BiotechCompanyDirectoryRecord[] => {
    const values = Object.fromEntries(headers.map((header, column) => [header, cleanText(row[column])])), companyName = cleanText(values['單位名稱']);
    if (!companyName) return [];
    const unifiedBusinessNumber = parseUnifiedBusinessNumber(values['統一編號']), responsiblePerson = normalizeResponsiblePerson(values['負責人']), address = parseBiotechCompanyAddress(values['登記地址']), phone = parseCompanyPhone(values['公司電話']);
    const industryCategoryRaw = cleanText(values['產業範疇']), industryCategoryType = classifyBiotechIndustryCategory(industryCategoryRaw), coordinates = parseBiotechCompanyCoordinates(values[xHeader], values[yHeader]);
    if (unifiedBusinessNumber && !/^\d{8}$/.test(unifiedBusinessNumber) && unusualBusinessNumbers.length < 20) unusualBusinessNumbers.push(unifiedBusinessNumber);
    if (!address.district && addressWarnings.length < 20) addressWarnings.push(values['登記地址'] ?? '');
    if (coordinates.coordinateStatus !== 'valid' && coordinateWarnings.length < 20) coordinateWarnings.push(`${values[xHeader] ?? ''},${values[yHeader] ?? ''}`);
    if (phone.companyPhoneType === 'unknown' && phoneWarnings.length < 20) phoneWarnings.push(values['公司電話'] ?? '');
    const key = [normalizeText(unifiedBusinessNumber), normalizeText(companyName), normalizeText(address.registeredAddress)].join('|') || [normalizeText(companyName), normalizeText(address.registeredAddress), normalizeText(phone.companyPhone)].join('|');
    if (seenKeys.has(key) && duplicateKeys.length < 20) duplicateKeys.push(key); seenKeys.add(key);
    const sourceRecordHash = createHash('sha1').update(`${key}|${index}`).digest('hex');
    return [{ id: sourceRecordHash.slice(0, 12), module: 'biotech_company_directory', companyName, companyNameNormalized: normalizeText(companyName), unifiedBusinessNumber, unifiedBusinessNumberNormalized: normalizeText(unifiedBusinessNumber), responsiblePerson, responsiblePersonNormalized: normalizeText(responsiblePerson), ...address, ...phone, hasPhone: phone.companyPhoneType !== 'missing', industryCategoryRaw, industryCategory: industryCategoryRaw, industryCategoryNormalized: normalizeText(industryCategoryRaw), industryCategoryType, ...coordinates, hasValidCoordinates: coordinates.coordinateStatus === 'valid', googleMapsQuery: createBiotechCompanyMapQuery({ companyName, registeredAddress: address.registeredAddress }), sourceRecordHash, source, sourceAgency }];
  });
  const fileInfo = await stat(inputPath), report = await readFile(reportPath, 'utf8').then(JSON.parse).catch(() => ({}));
  const biotechCompanyDirectory = { source, sourceAgency: '產業局', sourcePage: 'https://data.taipei/dataset/detail?id=a05ee8ee-d7f1-4024-86c1-e2f97f2120bf', theme: '經濟', serviceCategory: '開創事業', updateFrequency: '每2年', officialResourceUpdateTime: '2026-04-02 10:10:45', officialMetadataUpdateTime: '2026-04-02 11:04:05', inputFile: basename(inputPath), convertedAt: new Date().toISOString(), fileSize: fileInfo.size, encoding, inputRows: rows.length, outputRecords: records.length, coordinateAliases: { xHeader, yHeader }, coordinateQuality: buildBiotechCompanyDirectorySummary(records).coordinateQuality, duplicateUnifiedBusinessNumbers: duplicates(records.map((r) => r.unifiedBusinessNumber)), duplicateAddresses: duplicates(records.map((r) => r.registeredAddressNormalized)), duplicatePhones: duplicates(records.map((r) => r.companyPhone)), duplicateFallbackKeys: duplicateKeys, unusualBusinessNumbers, addressWarnings, coordinateWarnings, phoneWarnings, notes: ['UTF-8-SIG decoded with Big5 fallback', 'Unified business numbers and phone values preserved as strings', 'TWD97 / EPSG:3826-like coordinates are converted to WGS84', 'Responsible person is preserved for expanded details only'] };
  await mkdir(outputDir, { recursive: true });
  await Promise.all([writeFile(join(outputDir, 'biotech-company-directory.json'), JSON.stringify(records)), writeFile(join(outputDir, 'biotech-company-directory-summary.json'), JSON.stringify(buildBiotechCompanyDirectorySummary(records))), writeFile(reportPath, JSON.stringify({ ...report, biotechCompanyDirectory }, null, 2))]);
  console.log(`Converted ${records.length} biotech company directory records from ${basename(inputPath)}.`);
}
if (import.meta.url === `file://${process.argv[1]}`) await convertBiotechCompanyDirectory(process.argv.find((arg) => arg.startsWith('--file='))?.slice(7));
