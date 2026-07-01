import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { parseCsv } from './convertCivicGroups';
import { TAIPEI_DISTRICT_CENTROIDS } from '../src/lib/civicGroups';
import {
  buildDisabilityEmploymentResourceSummary, cleanText, createDisabilityEmploymentResourceMapQuery,
  normalizeDisabilityEmploymentResourceName, normalizeText, parseBusinessItem, parseContactName,
  parseDisabilityType, parseIntegerText, parseResourceAddress, parseResourcePhone, parseRocYear,
} from '../src/lib/disabilityEmploymentResourceMap';
import type { DisabilityEmploymentResourceRecord } from '../src/types';

const rawDir = join(process.cwd(), 'data/raw/disability-employment-resource-map');
const outputDir = join(process.cwd(), 'public/data');
const reportPath = join(outputDir, 'conversion-report.json');
const source = '臺北市身障就業資源地圖';
const sourceAgency = '臺北市政府勞動局勞動力重建運用處';
const decode = (bytes: Uint8Array) => { try { return { text: new TextDecoder('big5', { fatal: true }).decode(bytes).replace(/^\uFEFF/, ''), encoding: 'CP950 / Big5-compatible' }; } catch { return { text: new TextDecoder('utf-8', { fatal: true }).decode(bytes).replace(/^\uFEFF/, ''), encoding: 'UTF-8-SIG / UTF-8' }; } };
const duplicates = (values: Array<string | undefined>) => [...values.reduce((map, value) => value ? map.set(value, (map.get(value) ?? 0) + 1) : map, new Map<string, number>())].filter(([, count]) => count > 1).slice(0, 30).map(([value, count]) => ({ value, count }));

export async function convertDisabilityEmploymentResourceMap(filePath?: string) {
  const csvFile = filePath ? undefined : (await readdir(rawDir)).find((file) => file.toLowerCase().endsWith('.csv'));
  if (!filePath && !csvFile) throw new Error('No disability employment resource CSV found. Run npm run data:fetch:disability-employment-resources.');
  const inputPath = filePath ?? join(rawDir, csvFile!), { text, encoding } = decode(await readFile(inputPath)), [rawHeaders, ...rows] = parseCsv(text);
  if (!rawHeaders) throw new Error('Invalid disability employment resource CSV: file is empty.');
  const headers = rawHeaders.map((header) => cleanText(header) ?? ''), required = ['SEQNO', 'Year', 'name', 'type', 'business item', 'contact', 'address', 'telephone'], missing = required.filter((header) => !headers.includes(header));
  if (missing.length) throw new Error(`Invalid disability employment resource CSV: missing columns ${missing.join(', ')}.`);

  const yearWarnings: string[] = [], disabilityTypeWarnings: string[] = [], businessItemWarnings: string[] = [], addressWarnings: string[] = [], phoneWarnings: string[] = [], duplicateKeys: string[] = [], duplicateSourceSequenceNumbers = duplicates(rows.map((row) => cleanText(row[headers.indexOf('SEQNO')])));
  const seenKeys = new Set<string>();
  const records = rows.flatMap((row, index): DisabilityEmploymentResourceRecord[] => {
    const values = Object.fromEntries(headers.map((header, column) => [header, cleanText(row[column])]));
    const resourceName = cleanText(values.name);
    if (!resourceName) return [];
    const sourceSequenceNumber = parseIntegerText(values.SEQNO), year = parseRocYear(values.Year), disability = parseDisabilityType(values.type), business = parseBusinessItem(values['business item']), contact = parseContactName(values.contact), address = parseResourceAddress(values.address), phone = parseResourcePhone(values.telephone);
    if (year.warning && yearWarnings.length < 20) yearWarnings.push(`${resourceName}:${values.Year ?? ''}`);
    if (disability.warning && disabilityTypeWarnings.length < 20) disabilityTypeWarnings.push(`${resourceName}:${disability.disabilityType ?? ''}`);
    if (business.warning && businessItemWarnings.length < 20) businessItemWarnings.push(`${resourceName}:${business.businessItem ?? ''}`);
    if (address.warning && addressWarnings.length < 20) addressWarnings.push(`${resourceName}:${address.warning}`);
    if (phone.warning && phoneWarnings.length < 20) phoneWarnings.push(values.telephone ?? '');
    const primaryKey = [sourceSequenceNumber, year.sourceRocYear ?? year.sourceYear, normalizeDisabilityEmploymentResourceName(resourceName)].filter(Boolean).join('|');
    const fallbackKey = [normalizeDisabilityEmploymentResourceName(resourceName), normalizeText(address.address), normalizeText(phone.phone)].filter(Boolean).join('|');
    const key = primaryKey || fallbackKey;
    if (seenKeys.has(key) && duplicateKeys.length < 20) duplicateKeys.push(key); seenKeys.add(key);
    const point = address.taipeiDistrict ? TAIPEI_DISTRICT_CENTROIDS[address.taipeiDistrict] : undefined;
    const sourceRecordHash = createHash('sha1').update(`${key}|${index}`).digest('hex');
    return [{ id: sourceRecordHash.slice(0, 12), module: 'disability_employment_resource_map', sourceSequenceNumber, ...year, resourceName, resourceNameNormalized: normalizeDisabilityEmploymentResourceName(resourceName), ...disability, ...business, ...contact, ...address, ...phone, hasPhone: phone.phoneType !== 'missing', locationPrecision: point ? 'district_centroid' : (address.address ? 'address_only' : 'missing'), latitude: point?.latitude, longitude: point?.longitude, googleMapsQuery: createDisabilityEmploymentResourceMapQuery({ resourceName, address: address.address }), sourceRecordHash, source, sourceAgency }];
  });
  const fileInfo = await stat(inputPath), report = await readFile(reportPath, 'utf8').then(JSON.parse).catch(() => ({}));
  const disabilityEmploymentResourceMap = {
    source, sourceAgency: '勞動局重建處', sourcePage: 'https://data.taipei/dataset/detail?id=c5aafda8-ef14-4f66-a6b7-d5da995a14b5',
    category: '勞動', serviceCategory: '求職及就業', datasetType: '原始資料',
    inputFile: basename(inputPath), convertedAt: new Date().toISOString(), fileSize: fileInfo.size, encoding, inputRows: rows.length, outputRecords: records.length,
    duplicateResourceNames: duplicates(records.map((record) => record.resourceNameNormalized)),
    duplicateAddresses: duplicates(records.map((record) => record.addressNormalized)),
    duplicatePhones: duplicates(records.map((record) => record.phone)),
    duplicateSourceSequenceNumbers, duplicateFallbackKeys: duplicateKeys,
    yearWarnings, disabilityTypeWarnings, businessItemWarnings, addressWarnings, phoneWarnings,
    notes: ['Big5 / CP950 decoded with UTF-8-SIG fallback', 'ROC years converted to Gregorian years', 'Business item and service categories are UI helper groupings, not official classifications', 'No geocoding performed; map uses district centroid summaries only', 'This is not job-vacancy, real-time service-capacity, eligibility, employment-placement-guarantee, disability-assessment, medical-advice, legal-advice, accessibility-certification, quality-ranking, compliance, or endorsement data'],
  };
  await mkdir(outputDir, { recursive: true });
  await Promise.all([
    writeFile(join(outputDir, 'disability-employment-resource-map.json'), JSON.stringify(records)),
    writeFile(join(outputDir, 'disability-employment-resource-map-summary.json'), JSON.stringify(buildDisabilityEmploymentResourceSummary(records))),
    writeFile(reportPath, JSON.stringify({ ...report, disabilityEmploymentResourceMap }, null, 2)),
  ]);
  console.log(`Converted ${records.length} disability employment resource records from ${basename(inputPath)}.`);
}

if (import.meta.url === `file://${process.argv[1]}`) await convertDisabilityEmploymentResourceMap(process.argv.find((arg) => arg.startsWith('--file='))?.slice(7));
