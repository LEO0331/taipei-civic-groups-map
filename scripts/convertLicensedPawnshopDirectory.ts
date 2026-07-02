import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { parseCsv } from './convertCivicGroups';
import { TAIPEI_DISTRICT_CENTROIDS } from '../src/lib/civicGroups';
import { buildLicensedPawnshopDirectorySummary, cleanText, createPawnshopMapQuery, normalizePawnshopName, normalizeText, parseCityCounty, parseIntegerText, parsePawnshopBusinessAddress, parsePawnshopLicenseNumber } from '../src/lib/licensedPawnshopDirectory';
import type { LicensedPawnshopDirectoryRecord } from '../src/types';

const rawDir = join(process.cwd(), 'data/raw/licensed-pawnshop-directory');
const outputDir = join(process.cwd(), 'public/data');
const reportPath = join(outputDir, 'conversion-report.json');
const source = '臺北市政府警察局當舖業資料清冊';
const sourceAgency = '臺北市政府警察局刑事警察大隊';
const decode = (bytes: Uint8Array) => { try { return { text: new TextDecoder('big5', { fatal: true }).decode(bytes).replace(/^\uFEFF/, ''), encoding: 'CP950 / Big5-compatible' }; } catch { return { text: new TextDecoder('utf-8', { fatal: true }).decode(bytes).replace(/^\uFEFF/, ''), encoding: 'UTF-8-SIG / UTF-8' }; } };
const duplicates = (values: Array<string | undefined>) => [...values.reduce((map, value) => value ? map.set(value, (map.get(value) ?? 0) + 1) : map, new Map<string, number>())].filter(([, count]) => count > 1).slice(0, 30).map(([value, count]) => ({ value, count }));

export async function convertLicensedPawnshopDirectory(filePath?: string) {
  const csvFile = filePath ? undefined : (await readdir(rawDir)).find((file) => file.toLowerCase().endsWith('.csv'));
  if (!filePath && !csvFile) throw new Error('No licensed pawnshop CSV found. Run npm run data:fetch:licensed-pawnshops.');
  const inputPath = filePath ?? join(rawDir, csvFile!), { text, encoding } = decode(await readFile(inputPath)), [rawHeaders, ...rows] = parseCsv(text);
  if (!rawHeaders) throw new Error('Invalid licensed pawnshop CSV: file is empty.');
  const headers = rawHeaders.map((header) => cleanText(header) ?? ''), required = ['序號', '許可證號', '當舖名稱', '營業地址', '縣市'], missing = required.filter((header) => !headers.includes(header));
  if (missing.length) throw new Error(`Invalid licensed pawnshop CSV: missing columns ${missing.join(', ')}.`);

  const licenseNumberWarnings: string[] = [], addressWarnings: string[] = [], cityCountyWarnings: string[] = [], duplicateKeys: string[] = [], duplicateSourceSequenceNumbers = duplicates(rows.map((row) => cleanText(row[headers.indexOf('序號')])));
  const seenKeys = new Set<string>();
  const records = rows.flatMap((row, index): LicensedPawnshopDirectoryRecord[] => {
    const values = Object.fromEntries(headers.map((header, column) => [header, cleanText(row[column])]));
    const pawnshopName = cleanText(values.當舖名稱);
    if (!pawnshopName) return [];
    const sourceSequenceNumber = parseIntegerText(values.序號), license = parsePawnshopLicenseNumber(values.許可證號), address = parsePawnshopBusinessAddress(values.營業地址), city = parseCityCounty(values.縣市);
    if (license.warning && licenseNumberWarnings.length < 20) licenseNumberWarnings.push(`${pawnshopName}:${license.licenseNumber ?? ''}`);
    if (address.warning && addressWarnings.length < 20) addressWarnings.push(`${pawnshopName}:${address.warning}`);
    if (city.warning && cityCountyWarnings.length < 20) cityCountyWarnings.push(`${pawnshopName}:${city.cityCounty ?? ''}`);
    const primaryKey = [sourceSequenceNumber, license.licenseNumberNormalized, normalizePawnshopName(pawnshopName)].filter(Boolean).join('|');
    const fallbackKey = [license.licenseNumberNormalized, normalizePawnshopName(pawnshopName), normalizeText(address.businessAddress)].filter(Boolean).join('|');
    const key = primaryKey || fallbackKey;
    if (seenKeys.has(key) && duplicateKeys.length < 20) duplicateKeys.push(key); seenKeys.add(key);
    const point = address.taipeiDistrict ? TAIPEI_DISTRICT_CENTROIDS[address.taipeiDistrict] : undefined;
    const sourceRecordHash = createHash('sha1').update(`${key}|${index}`).digest('hex');
    return [{ id: sourceRecordHash.slice(0, 12), module: 'licensed_pawnshop_directory', sourceSequenceNumber, ...license, licenseNumber: license.licenseNumber ?? '', pawnshopName, pawnshopNameNormalized: normalizePawnshopName(pawnshopName), ...address, businessAddress: address.businessAddress ?? '', ...city, locationPrecision: point ? 'district_centroid' : (address.businessAddress ? 'address_only' : 'missing'), latitude: point?.latitude, longitude: point?.longitude, googleMapsQuery: createPawnshopMapQuery({ pawnshopName, businessAddress: address.businessAddress }), sourceRecordHash, source, sourceAgency }];
  });
  const fileInfo = await stat(inputPath), report = await readFile(reportPath, 'utf8').then(JSON.parse).catch(() => ({}));
  const licensedPawnshopDirectory = {
    source, sourceAgency: '警察局刑警大隊', sourcePage: 'https://data.taipei/dataset/detail?id=024da777-25b0-4bee-b1b9-2f8ceb8bd68a',
    category: '治安', serviceCategory: '生活安全及品質', datasetType: '原始資料', officialResourceUpdateTime: '2025-06-17 09:21:00', officialMetadataUpdateTime: '2025-06-17 09:21:21', updateFrequency: '不定期更新',
    inputFile: basename(inputPath), convertedAt: new Date().toISOString(), fileSize: fileInfo.size, encoding, inputRows: rows.length, outputRecords: records.length,
    duplicateLicenseNumbers: duplicates(records.map((record) => record.licenseNumberNormalized)),
    duplicatePawnshopNames: duplicates(records.map((record) => record.pawnshopNameNormalized)),
    duplicateBusinessAddresses: duplicates(records.map((record) => record.businessAddressNormalized)),
    duplicateSourceSequenceNumbers, duplicateFallbackKeys: duplicateKeys,
    licenseNumberWarnings, addressWarnings, cityCountyWarnings,
    notes: ['Big5 / CP950 decoded with UTF-8-SIG fallback', 'License numbers preserved as text and not parsed as numbers', 'No geocoding performed; map uses district centroid summaries only', 'This is not crime, fraud-risk, complaint, violation, law-enforcement, real-time operating-status, credit-rating, loan-advice, investment-advice, financial-advice, legal-advice, quality-ranking, recommendation, or endorsement data'],
  };
  await mkdir(outputDir, { recursive: true });
  await Promise.all([
    writeFile(join(outputDir, 'licensed-pawnshop-directory.json'), JSON.stringify(records)),
    writeFile(join(outputDir, 'licensed-pawnshop-directory-summary.json'), JSON.stringify(buildLicensedPawnshopDirectorySummary(records))),
    writeFile(reportPath, JSON.stringify({ ...report, licensedPawnshopDirectory }, null, 2)),
  ]);
  console.log(`Converted ${records.length} licensed pawnshop records from ${basename(inputPath)}.`);
}

if (import.meta.url === `file://${process.argv[1]}`) await convertLicensedPawnshopDirectory(process.argv.find((arg) => arg.startsWith('--file='))?.slice(7));
