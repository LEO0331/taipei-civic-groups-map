import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { parseCsv } from './convertCivicGroups';
import { buildLicensedElectronicGameArcadeOperatorSummary, cleanArcadeText, createLicensedArcadeMapQuery, parseBusinessPremisesAddress, parseBusinessRegistrationNumber, parseCompanyOrBusinessName, parseNote, parseSourceSequenceNumber, parseTaipeiDistrictName } from '../src/lib/licensedElectronicGameArcadeOperators';
import type { LicensedElectronicGameArcadeOperatorRecord } from '../src/types';

const rawDir = join(process.cwd(), 'data/raw/licensed-electronic-game-arcade-operators');
const outputDir = join(process.cwd(), 'public/data');
const reportPath = join(outputDir, 'conversion-report.json');
const source = '臺北市合法電子遊戲場業者清冊';
const sourceAgency = '臺北市政府產業發展局商業處';
const decode = (bytes: Uint8Array) => { try { return { text: new TextDecoder('utf-8', { fatal: true }).decode(bytes).replace(/^\uFEFF/, ''), encoding: 'UTF-8-SIG / UTF-8' }; } catch { return { text: new TextDecoder('big5', { fatal: true }).decode(bytes).replace(/^\uFEFF/, ''), encoding: 'CP950 / Big5-compatible' }; } };
const duplicates = (values: Array<string | undefined>) => [...values.reduce((map, value) => value ? map.set(value, (map.get(value) ?? 0) + 1) : map, new Map<string, number>())].filter(([, count]) => count > 1).slice(0, 30).map(([value, count]) => ({ value, count }));

export async function convertLicensedElectronicGameArcadeOperators(filePath?: string) {
  const csvFile = filePath ? undefined : (await readdir(rawDir)).find((file) => file.toLowerCase().endsWith('.csv'));
  if (!filePath && !csvFile) throw new Error('No licensed arcade CSV found. Run npm run data:fetch:licensed-arcades.');
  const inputPath = filePath ?? join(rawDir, csvFile!), { text, encoding } = decode(await readFile(inputPath)), [rawHeaders, ...rows] = parseCsv(text);
  if (!rawHeaders) throw new Error('Invalid licensed arcade CSV: file is empty.');
  const headers = rawHeaders.map((header) => cleanArcadeText(header) ?? '');
  const col = (names: string[]) => names.map((name) => headers.indexOf(name)).find((index) => index >= 0) ?? -1;
  const idx = { seq: col(['序號', 'seqno']), name: col(['公司/商業名稱']), number: col(['統一編號']), district: col(['行政區']), address: col(['營業場所地址']), note: col(['備註']) };
  const missingColumns = Object.entries(idx).filter(([, index]) => index < 0).map(([key]) => key);
  if (missingColumns.length) throw new Error(`Invalid licensed arcade CSV: missing columns ${missingColumns.join(', ')}.`);

  const warnings = { sequence: [] as string[], registration: [] as string[], district: [] as string[], address: [] as string[] };
  const records = rows.flatMap((row, index): LicensedElectronicGameArcadeOperatorRecord[] => {
    const seq = parseSourceSequenceNumber(row[idx.seq]), name = parseCompanyOrBusinessName(row[idx.name]), number = parseBusinessRegistrationNumber(row[idx.number]), district = parseTaipeiDistrictName(row[idx.district]), address = parseBusinessPremisesAddress(row[idx.address]), note = parseNote(row[idx.note]);
    if (seq.warning && warnings.sequence.length < 20) warnings.sequence.push(`${index + 2}:${seq.warning}`);
    if (number.warning && warnings.registration.length < 20) warnings.registration.push(`${name.companyOrBusinessName ?? index + 2}:${number.warning}`);
    if (district.warning && warnings.district.length < 20) warnings.district.push(`${name.companyOrBusinessName ?? index + 2}:${district.districtName ?? ''}`);
    if (address.warning && warnings.address.length < 20) warnings.address.push(`${name.companyOrBusinessName ?? index + 2}:${address.warning}`);
    if (!name.companyOrBusinessName) return [];
    const locationPrecision = district.districtName && address.businessPremisesAddress ? 'district_address' : district.districtName ? 'district_only' : 'missing';
    const key = number.businessRegistrationNumberNormalized || [name.companyOrBusinessNameNormalized, district.districtNameNormalized, address.businessPremisesAddressNormalized].filter(Boolean).join('|');
    const sourceRecordHash = createHash('sha1').update(`${key}|${index}`).digest('hex');
    return [{ id: sourceRecordHash.slice(0, 12), module: 'licensed_electronic_game_arcade_operators', ...seq, companyOrBusinessName: name.companyOrBusinessName, companyOrBusinessNameNormalized: name.companyOrBusinessNameNormalized, businessRegistrationNumber: number.businessRegistrationNumber ?? '', businessRegistrationNumberNormalized: number.businessRegistrationNumberNormalized, validBusinessRegistrationNumberFormat: number.validBusinessRegistrationNumberFormat, districtName: district.districtName ?? '', districtNameNormalized: district.districtNameNormalized, isTaipeiDistrict: district.isTaipeiDistrict, businessPremisesAddress: address.businessPremisesAddress ?? '', businessPremisesAddressNormalized: address.businessPremisesAddressNormalized, roadName: address.roadName, addressLooksLikeComplexUnit: address.addressLooksLikeComplexUnit, ...note, coordinateSource: 'none', geocodingStatus: 'not_geocoded_address_only', locationPrecision, googleMapsQuery: createLicensedArcadeMapQuery({ districtName: district.districtName, businessPremisesAddress: address.businessPremisesAddress, companyOrBusinessName: name.companyOrBusinessName }), sourceRecordHash, source, sourceAgency }];
  });
  const summary = buildLicensedElectronicGameArcadeOperatorSummary(records), fileInfo = await stat(inputPath), report = await readFile(reportPath, 'utf8').then(JSON.parse).catch(() => ({}));
  const licensedElectronicGameArcadeOperators = {
    source, sourceAgency: '產業局商業處', sourcePage: 'https://data.taipei/dataset/detail?id=20774fbb-5671-4850-b307-af6b5976077d',
    category: '觀光', serviceCategory: '休閒旅遊', datasetType: '原始資料', resourceName: source, officialResourceUpdateTime: '2025-10-31 16:25:06', officialMetadataUpdateTime: '2026-03-02 15:05:59', updateFrequency: '不定期更新',
    inputFile: basename(inputPath), convertedAt: new Date().toISOString(), fileSize: fileInfo.size, encoding, inputRows: rows.length, outputRecords: records.length,
    duplicateSequenceNumbers: duplicates(records.map((record) => record.sourceSequenceNumberNormalized)),
    duplicateCompanyOrBusinessNames: duplicates(records.map((record) => record.companyOrBusinessNameNormalized)),
    duplicateBusinessRegistrationNumbers: duplicates(records.map((record) => record.businessRegistrationNumberNormalized)),
    duplicateBusinessPremisesAddresses: duplicates(records.map((record) => record.businessPremisesAddressNormalized)),
    duplicateFallbackKeys: duplicates(records.map((record) => [record.companyOrBusinessNameNormalized, record.districtNameNormalized, record.businessPremisesAddressNormalized].filter(Boolean).join('|'))),
    warnings, dataQuality: summary.dataQuality,
    notes: ['UTF-8-SIG decoded with Big5 / CP950 fallback', 'Business registration numbers preserved as text to keep leading zeros', 'No automatic geocoding performed; no exact map markers created', 'External map lookup links are query strings only, not official coordinates', 'No business/company matching generated in v1', 'This is not real-time operating status, opening-hours, admission, age-restriction, consumer-advice, public-safety-risk, violation-record, legal-advice, investment-advice, credit-rating, or endorsement data'],
  };
  await mkdir(outputDir, { recursive: true });
  await Promise.all([
    writeFile(join(outputDir, 'licensed-electronic-game-arcade-operators.json'), JSON.stringify(records)),
    writeFile(join(outputDir, 'licensed-electronic-game-arcade-operator-summary.json'), JSON.stringify(summary)),
    writeFile(reportPath, JSON.stringify({ ...report, licensedElectronicGameArcadeOperators }, null, 2)),
  ]);
  console.log(`Converted ${records.length} licensed electronic game arcade operator records from ${basename(inputPath)}.`);
}

if (import.meta.url === `file://${process.argv[1]}`) await convertLicensedElectronicGameArcadeOperators(process.argv.find((arg) => arg.startsWith('--file='))?.slice(7));
