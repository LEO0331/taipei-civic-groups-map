import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { parseCsv } from './convertCivicGroups';
import { buildLicensedSpecialEntertainmentBusinessOperatorSummary, cleanSpecialEntertainmentText, coordinatePairKey, createSpecialEntertainmentMapQuery, getCoordinateQuality, getLocationPrecision, parseBusinessPremisesAddress, parseBusinessRegistrationNumber, parseCompanyOrBusinessName, parseCoordinateNumber, parseOperatingIndustry, parseResponsiblePersonName, parseSourceSequenceNumber, parseTaipeiDistrictName } from '../src/lib/licensedSpecialEntertainmentBusinessOperators';
import type { LicensedSpecialEntertainmentBusinessOperatorRecord } from '../src/types';

const rawDir = join(process.cwd(), 'data/raw/licensed-special-entertainment-business-operators');
const outputDir = join(process.cwd(), 'public/data');
const reportPath = join(outputDir, 'conversion-report.json');
const source = '臺北市合法八大行業業者清冊';
const sourceAgency = '臺北市政府產業發展局商業處';
const decode = (bytes: Uint8Array) => { try { return { text: new TextDecoder('utf-8', { fatal: true }).decode(bytes).replace(/^\uFEFF/, ''), encoding: 'UTF-8-SIG / UTF-8' }; } catch { return { text: new TextDecoder('big5', { fatal: true }).decode(bytes).replace(/^\uFEFF/, ''), encoding: 'CP950 / Big5-compatible' }; } };
const duplicates = (values: Array<string | undefined>) => [...values.reduce((map, value) => value ? map.set(value, (map.get(value) ?? 0) + 1) : map, new Map<string, number>())].filter(([, count]) => count > 1).slice(0, 30).map(([value, count]) => ({ value, count }));

export async function convertLicensedSpecialEntertainmentBusinessOperators(filePath?: string) {
  const csvFile = filePath ? undefined : (await readdir(rawDir)).find((file) => file.toLowerCase().endsWith('.csv'));
  if (!filePath && !csvFile) throw new Error('No licensed special entertainment CSV found. Run npm run data:fetch:licensed-special-entertainment.');
  const inputPath = filePath ?? join(rawDir, csvFile!), { text, encoding } = decode(await readFile(inputPath)), [rawHeaders, ...rows] = parseCsv(text);
  if (!rawHeaders) throw new Error('Invalid licensed special entertainment CSV: file is empty.');
  const headers = rawHeaders.map((header) => cleanSpecialEntertainmentText(header) ?? '');
  const col = (names: string[]) => names.map((name) => headers.indexOf(name)).find((index) => index >= 0) ?? -1;
  const idx = { seq: col(['序號']), name: col(['公司商業名稱', '公司/商業名稱']), number: col(['統一編號']), responsible: col(['負責人']), industry: col(['經營行業']), district: col(['行政區']), address: col(['營業場所地址']), longitude: col(['經度', 'Longitude']), latitude: col(['緯度', 'Latitude']) };
  const missingColumns = Object.entries(idx).filter(([, index]) => index < 0).map(([key]) => key);
  if (missingColumns.length) throw new Error(`Invalid licensed special entertainment CSV: missing columns ${missingColumns.join(', ')}.`);

  const warnings = { sequence: [] as string[], registration: [] as string[], industry: [] as string[], district: [] as string[], address: [] as string[], coordinate: [] as string[] };
  const records = rows.flatMap((row, index): LicensedSpecialEntertainmentBusinessOperatorRecord[] => {
    const seq = parseSourceSequenceNumber(row[idx.seq]), name = parseCompanyOrBusinessName(row[idx.name]), number = parseBusinessRegistrationNumber(row[idx.number]), responsible = parseResponsiblePersonName(row[idx.responsible]), industry = parseOperatingIndustry(row[idx.industry]), district = parseTaipeiDistrictName(row[idx.district]), address = parseBusinessPremisesAddress(row[idx.address]), lon = parseCoordinateNumber(row[idx.longitude]), lat = parseCoordinateNumber(row[idx.latitude]);
    if (seq.warning && warnings.sequence.length < 20) warnings.sequence.push(`${index + 2}:${seq.warning}`);
    if (number.warning && warnings.registration.length < 20) warnings.registration.push(`${name.companyOrBusinessName ?? index + 2}:${number.warning}`);
    if (industry.warning && warnings.industry.length < 20) warnings.industry.push(`${name.companyOrBusinessName ?? index + 2}:${industry.warning}`);
    if (district.warning && warnings.district.length < 20) warnings.district.push(`${name.companyOrBusinessName ?? index + 2}:${district.districtName ?? ''}`);
    if (address.warning && warnings.address.length < 20) warnings.address.push(`${name.companyOrBusinessName ?? index + 2}:${address.warning}`);
    const coordinateQuality = getCoordinateQuality(lon.value, lat.value, lon.quality, lat.quality);
    if (coordinateQuality !== 'valid_wgs84_taipei' && warnings.coordinate.length < 20) warnings.coordinate.push(`${name.companyOrBusinessName ?? index + 2}:${coordinateQuality}`);
    if (!name.companyOrBusinessName) return [];
    const locationPrecision = getLocationPrecision(coordinateQuality, district.districtName, address.businessPremisesAddress);
    const key = number.businessRegistrationNumberNormalized || [name.companyOrBusinessNameNormalized, district.districtNameNormalized, address.businessPremisesAddressNormalized].filter(Boolean).join('|');
    const sourceRecordHash = createHash('sha1').update(`${key}|${index}`).digest('hex');
    return [{ id: sourceRecordHash.slice(0, 12), module: 'licensed_special_entertainment_business_operators', ...seq, companyOrBusinessName: name.companyOrBusinessName, companyOrBusinessNameNormalized: name.companyOrBusinessNameNormalized, businessRegistrationNumber: number.businessRegistrationNumber ?? '', businessRegistrationNumberNormalized: number.businessRegistrationNumberNormalized, businessRegistrationNumberValidFormat: number.businessRegistrationNumberValidFormat, ...responsible, ...industry, districtName: district.districtName ?? '', districtNameNormalized: district.districtNameNormalized, isTaipeiDistrict: district.isTaipeiDistrict, businessPremisesAddress: address.businessPremisesAddress ?? '', businessPremisesAddressNormalized: address.businessPremisesAddressNormalized, roadName: address.roadName, addressLooksLikeComplexUnit: address.addressLooksLikeComplexUnit, longitude: lon.value, latitude: lat.value, coordinateQuality, coordinateValid: coordinateQuality === 'valid_wgs84_taipei', coordinatePairKey: coordinateQuality === 'valid_wgs84_taipei' ? coordinatePairKey(lon.value, lat.value) : undefined, locationPrecision, googleMapsQuery: createSpecialEntertainmentMapQuery({ districtName: district.districtName, businessPremisesAddress: address.businessPremisesAddress, companyOrBusinessName: name.companyOrBusinessName }), sourceRecordHash, source, sourceAgency }];
  });
  const summary = buildLicensedSpecialEntertainmentBusinessOperatorSummary(records), fileInfo = await stat(inputPath), report = await readFile(reportPath, 'utf8').then(JSON.parse).catch(() => ({}));
  const licensedSpecialEntertainmentBusinessOperators = {
    source, sourceAgency: '產業局商業處', sourcePage: 'https://data.taipei/dataset/detail?id=dd0548f2-0372-4e4f-8c74-9a4121f27d35',
    category: '觀光', serviceCategory: '休閒旅遊', datasetType: '原始資料', resourceName: source, officialResourceUpdateTime: '2025-10-31 16:20:26', officialMetadataUpdateTime: '2026-03-02 15:04:36', updateFrequency: '不定期更新',
    inputFile: basename(inputPath), convertedAt: new Date().toISOString(), fileSize: fileInfo.size, encoding, inputRows: rows.length, outputRecords: records.length,
    duplicateSequenceNumbers: duplicates(records.map((record) => record.sourceSequenceNumberNormalized)),
    duplicateCompanyOrBusinessNames: duplicates(records.map((record) => record.companyOrBusinessNameNormalized)),
    duplicateBusinessRegistrationNumbers: duplicates(records.map((record) => record.businessRegistrationNumberNormalized)),
    duplicateBusinessPremisesAddresses: duplicates(records.map((record) => record.businessPremisesAddressNormalized)),
    duplicateCoordinatePairs: summary.duplicateCoordinatePairs,
    duplicateFallbackKeys: duplicates(records.map((record) => [record.companyOrBusinessNameNormalized, record.districtNameNormalized, record.businessPremisesAddressNormalized].filter(Boolean).join('|'))),
    warnings, dataQuality: summary.dataQuality,
    notes: ['UTF-8-SIG decoded with Big5 / CP950 fallback', 'Business registration numbers preserved as text to keep leading zeros', 'Official WGS84 coordinates are used only when both latitude and longitude are finite and within broad Taipei bounds', 'Same-coordinate records are grouped in the map UI instead of adding a clustering dependency', 'No automatic coordinate swapping performed', 'No business/company matching generated in v1', 'This is not real-time operating status, opening-hours, admission, age-restriction, consumer-advice, public-safety-risk, violation-record, legal-advice, investment-advice, credit-rating, or endorsement data'],
  };
  await mkdir(outputDir, { recursive: true });
  await Promise.all([
    writeFile(join(outputDir, 'licensed-special-entertainment-business-operators.json'), JSON.stringify(records)),
    writeFile(join(outputDir, 'licensed-special-entertainment-business-operator-summary.json'), JSON.stringify(summary)),
    writeFile(reportPath, JSON.stringify({ ...report, licensedSpecialEntertainmentBusinessOperators }, null, 2)),
  ]);
  console.log(`Converted ${records.length} licensed special entertainment business operator records from ${basename(inputPath)}.`);
}

if (import.meta.url === `file://${process.argv[1]}`) await convertLicensedSpecialEntertainmentBusinessOperators(process.argv.find((arg) => arg.startsWith('--file='))?.slice(7));
