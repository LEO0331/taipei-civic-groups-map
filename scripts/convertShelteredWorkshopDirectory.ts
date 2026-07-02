import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { parseCsv } from './convertCivicGroups';
import {
  buildShelteredWorkshopDirectorySummary, cleanText, createShelteredWorkshopMapQuery,
  normalizeShelteredWorkshopName, normalizeText, parseContactName, parseIntegerText,
  parseResourceAddress, parseResourcePhone, parseRocYear, parseShelteredWorkshopBusinessItem,
  parseUnifiedBusinessNumber,
} from '../src/lib/shelteredWorkshopDirectory';
import { TAIPEI_DISTRICT_CENTROIDS } from '../src/lib/civicGroups';
import type { ShelteredWorkshopDirectoryRecord } from '../src/types';

const rawDir = join(process.cwd(), 'data/raw/sheltered-workshop-directory');
const outputDir = join(process.cwd(), 'public/data');
const reportPath = join(outputDir, 'conversion-report.json');
const source = '臺北市庇護工場名冊';
const sourceAgency = '臺北市政府勞動局勞動力重建運用處';
const decode = (bytes: Uint8Array) => { try { return { text: new TextDecoder('big5', { fatal: true }).decode(bytes).replace(/^\uFEFF/, ''), encoding: 'CP950 / Big5-compatible' }; } catch { return { text: new TextDecoder('utf-8', { fatal: true }).decode(bytes).replace(/^\uFEFF/, ''), encoding: 'UTF-8-SIG / UTF-8' }; } };
const duplicates = (values: Array<string | undefined>) => [...values.reduce((map, value) => value ? map.set(value, (map.get(value) ?? 0) + 1) : map, new Map<string, number>())].filter(([, count]) => count > 1).slice(0, 30).map(([value, count]) => ({ value, count }));

export async function convertShelteredWorkshopDirectory(filePath?: string) {
  const csvFile = filePath ? undefined : (await readdir(rawDir)).find((file) => file.toLowerCase().endsWith('.csv'));
  if (!filePath && !csvFile) throw new Error('No sheltered workshop CSV found. Run npm run data:fetch:sheltered-workshops.');
  const inputPath = filePath ?? join(rawDir, csvFile!), { text, encoding } = decode(await readFile(inputPath)), [rawHeaders, ...rows] = parseCsv(text);
  if (!rawHeaders) throw new Error('Invalid sheltered workshop CSV: file is empty.');
  const headers = rawHeaders.map((header) => cleanText(header) ?? ''), required = ['編號', '年度', '工場名稱', '營業項目', '聯絡人', '地址', '電話', '統一編號'], missing = required.filter((header) => !headers.includes(header));
  if (missing.length) throw new Error(`Invalid sheltered workshop CSV: missing columns ${missing.join(', ')}.`);

  const yearWarnings: string[] = [], businessItemWarnings: string[] = [], addressWarnings: string[] = [], phoneWarnings: string[] = [], unifiedBusinessNumberWarnings: string[] = [], duplicateKeys: string[] = [], duplicateSourceSequenceNumbers = duplicates(rows.map((row) => cleanText(row[headers.indexOf('編號')])));
  const seenKeys = new Set<string>();
  const records = rows.flatMap((row, index): ShelteredWorkshopDirectoryRecord[] => {
    const values = Object.fromEntries(headers.map((header, column) => [header, cleanText(row[column])]));
    const workshopName = cleanText(values.工場名稱);
    if (!workshopName) return [];
    const sourceSequenceNumber = parseIntegerText(values.編號), year = parseRocYear(values.年度), business = parseShelteredWorkshopBusinessItem(values.營業項目), contact = parseContactName(values.聯絡人), address = parseResourceAddress(values.地址), phone = parseResourcePhone(values.電話), ubn = parseUnifiedBusinessNumber(values.統一編號);
    if (year.warning && yearWarnings.length < 20) yearWarnings.push(`${workshopName}:${values.年度 ?? ''}`);
    if (business.warning && businessItemWarnings.length < 20) businessItemWarnings.push(`${workshopName}:${business.businessItem ?? ''}`);
    if (address.warning && addressWarnings.length < 20) addressWarnings.push(`${workshopName}:${address.warning}`);
    if (phone.warning && phoneWarnings.length < 20) phoneWarnings.push(values.電話 ?? '');
    if (ubn.warning && unifiedBusinessNumberWarnings.length < 20) unifiedBusinessNumberWarnings.push(`${workshopName}:${values.統一編號 ?? ''}`);
    const primaryKey = [sourceSequenceNumber, year.sourceRocYear ?? year.sourceYear, normalizeShelteredWorkshopName(workshopName), ubn.unifiedBusinessNumberNormalized].filter(Boolean).join('|');
    const fallbackKey = [normalizeShelteredWorkshopName(workshopName), normalizeText(address.address), normalizeText(phone.phone)].filter(Boolean).join('|');
    const key = primaryKey || fallbackKey;
    if (seenKeys.has(key) && duplicateKeys.length < 20) duplicateKeys.push(key); seenKeys.add(key);
    const point = address.taipeiDistrict ? TAIPEI_DISTRICT_CENTROIDS[address.taipeiDistrict] : undefined;
    const sourceRecordHash = createHash('sha1').update(`${key}|${index}`).digest('hex');
    return [{ id: sourceRecordHash.slice(0, 12), module: 'sheltered_workshop_directory', sourceSequenceNumber, ...year, workshopName, workshopNameNormalized: normalizeShelteredWorkshopName(workshopName), ...business, ...contact, ...address, ...phone, hasPhone: phone.phoneType !== 'missing', ...ubn, locationPrecision: point ? 'district_centroid' : (address.address ? 'address_only' : 'missing'), latitude: point?.latitude, longitude: point?.longitude, googleMapsQuery: createShelteredWorkshopMapQuery({ workshopName, address: address.address }), sourceRecordHash, source, sourceAgency }];
  });
  const fileInfo = await stat(inputPath), report = await readFile(reportPath, 'utf8').then(JSON.parse).catch(() => ({}));
  const shelteredWorkshopDirectory = {
    source, sourceAgency: '勞動局重建處', sourcePage: 'https://data.taipei/dataset/detail?id=fb88e4fd-c287-4fbb-91ab-0ed1fbeaf28c',
    category: '勞動', serviceCategory: '公共資訊', datasetType: '原始資料', officialResourceUpdateTime: '2026-04-16 09:06:57', officialMetadataUpdateTime: '2026-04-16 09:07:18', updateFrequency: '不定期更新',
    inputFile: basename(inputPath), convertedAt: new Date().toISOString(), fileSize: fileInfo.size, encoding, inputRows: rows.length, outputRecords: records.length,
    duplicateWorkshopNames: duplicates(records.map((record) => record.workshopNameNormalized)),
    duplicateAddresses: duplicates(records.map((record) => record.addressNormalized)),
    duplicatePhones: duplicates(records.map((record) => record.phone)),
    duplicateUnifiedBusinessNumbers: duplicates(records.map((record) => record.unifiedBusinessNumberNormalized)),
    duplicateSourceSequenceNumbers, duplicateFallbackKeys: duplicateKeys,
    yearWarnings, businessItemWarnings, addressWarnings, phoneWarnings, unifiedBusinessNumberWarnings,
    notes: ['Big5 / CP950 decoded with UTF-8-SIG fallback', 'ROC years converted to Gregorian years', 'Business item and service categories are UI helper groupings, not official classifications', 'No geocoding performed; map uses district centroid summaries only', 'This is not job-vacancy, real-time service-capacity, placement-guarantee, subsidy/welfare-eligibility, vocational-rehabilitation/disability-assessment, quality-ranking, accessibility-certification, legal-compliance, procurement/consumption-recommendation, medical-advice, legal-advice, or endorsement data'],
  };
  await mkdir(outputDir, { recursive: true });
  await Promise.all([
    writeFile(join(outputDir, 'sheltered-workshop-directory.json'), JSON.stringify(records)),
    writeFile(join(outputDir, 'sheltered-workshop-directory-summary.json'), JSON.stringify(buildShelteredWorkshopDirectorySummary(records))),
    writeFile(reportPath, JSON.stringify({ ...report, shelteredWorkshopDirectory }, null, 2)),
  ]);
  console.log(`Converted ${records.length} sheltered workshop records from ${basename(inputPath)}.`);
}

if (import.meta.url === `file://${process.argv[1]}`) await convertShelteredWorkshopDirectory(process.argv.find((arg) => arg.startsWith('--file='))?.slice(7));
