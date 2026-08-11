import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { parseCsv } from './convertCivicGroups';
import { buildEnterpriseHeadquartersSummary, cleanEnterpriseHeadquartersText, convertEnterpriseHeadquartersTwd97Tm2ToWgs84, createEnterpriseHeadquartersMapQuery, enterpriseCoordinatePairKey, enterpriseCoordinateQuality, enterpriseLocationPrecision, parseEnterpriseHeadquartersAddress, parseEnterpriseHeadquartersCompanyName, parseEnterpriseHeadquartersIndustryCategory, parseEnterpriseHeadquartersSourceCoordinate, parseEnterpriseHeadquartersUseDate } from '../src/lib/enterpriseHeadquartersDistribution';
import type { EnterpriseHeadquartersRecord } from '../src/types';

const rawDir = join(process.cwd(), 'data/raw/enterprise-headquarters-distribution');
const outputDir = join(process.cwd(), 'public/data/enterprise-headquarters-distribution');
const reportPath = join(process.cwd(), 'public/data/conversion-report.json');
const source = '臺北市企業營運總部分布圖';
const sourceAgency = '臺北市政府產業發展局';
const decode = (bytes: Uint8Array) => { try { return { text: new TextDecoder('utf-8', { fatal: true }).decode(bytes).replace(/^\uFEFF/, ''), encoding: 'UTF-8-SIG / UTF-8' }; } catch { return { text: new TextDecoder('big5', { fatal: true }).decode(bytes).replace(/^\uFEFF/, ''), encoding: 'CP950 / Big5-compatible' }; } };
const duplicates = (values: Array<string | undefined>) => [...values.reduce((map, value) => value ? map.set(value, (map.get(value) ?? 0) + 1) : map, new Map<string, number>())].filter(([, count]) => count > 1).slice(0, 30).map(([value, count]) => ({ value, count }));
const range = (values: number[]) => values.length ? { min: Math.min(...values), max: Math.max(...values) } : undefined;

export async function convertEnterpriseHeadquartersDistribution(filePath?: string) {
  const csvFile = filePath ? undefined : (await readdir(rawDir)).find((file) => file.toLowerCase().endsWith('.csv'));
  if (!filePath && !csvFile) throw new Error('No enterprise headquarters CSV found. Run npm run data:fetch:enterprise-headquarters.');
  const inputPath = filePath ?? join(rawDir, csvFile!), { text, encoding } = decode(await readFile(inputPath)), [rawHeaders, ...rows] = parseCsv(text);
  if (!rawHeaders) throw new Error('Invalid enterprise headquarters CSV: file is empty.');
  const headers = rawHeaders.map((header) => cleanEnterpriseHeadquartersText(header) ?? '');
  const col = (name: string) => headers.indexOf(name);
  const idx = { name: col('NAME'), useDate: col('USEDATE'), address: col('ADDR'), category: col('CATEGORY'), x: col('ADDR_X'), y: col('ADDR_Y') };
  const missing = Object.entries(idx).filter(([, index]) => index < 0).map(([key]) => key);
  if (missing.length) throw new Error(`Invalid enterprise headquarters CSV: missing columns ${missing.join(', ')}.`);
  const warnings = { companyName: [] as string[], useDate: [] as string[], address: [] as string[], category: [] as string[], coordinate: [] as string[] };
  const records = rows.flatMap((row, index): EnterpriseHeadquartersRecord[] => {
    const company = parseEnterpriseHeadquartersCompanyName(row[idx.name]), period = parseEnterpriseHeadquartersUseDate(row[idx.useDate]), address = parseEnterpriseHeadquartersAddress(row[idx.address]), category = parseEnterpriseHeadquartersIndustryCategory(row[idx.category]), x = parseEnterpriseHeadquartersSourceCoordinate(row[idx.x]), y = parseEnterpriseHeadquartersSourceCoordinate(row[idx.y]);
    if (company.warning && warnings.companyName.length < 20) warnings.companyName.push(`${index + 2}:${company.warning}`);
    if (period.warning && warnings.useDate.length < 20) warnings.useDate.push(`${company.companyName ?? index + 2}:${period.useDateRaw ?? ''}`);
    if (address.warning && warnings.address.length < 20) warnings.address.push(`${company.companyName ?? index + 2}:${address.companyAddress ?? ''}`);
    if (category.warning && warnings.category.length < 20) warnings.category.push(`${company.companyName ?? index + 2}:${category.industryCategoryRaw ?? ''}`);
    const converted = x.value === undefined || y.value === undefined ? { status: 'missing' as const } : convertEnterpriseHeadquartersTwd97Tm2ToWgs84(x.value, y.value);
    if ((x.warning || y.warning || converted.status !== 'converted_from_twd97_tm2') && warnings.coordinate.length < 20) warnings.coordinate.push(`${company.companyName ?? index + 2}:x=${x.raw ?? ''},y=${y.raw ?? ''},status=${converted.status}`);
    if (!company.companyName || !period.useDateRaw || !address.companyAddress || !category.industryCategoryRaw) return [];
    const coordinateQuality = enterpriseCoordinateQuality(converted.status), coordinateValid = coordinateQuality === 'valid_converted_wgs84_taipei' || coordinateQuality === 'valid_wgs84_taipei';
    const key = company.companyNameNormalized || [company.companyName, address.companyAddressNormalized, category.industryCategoryRaw, period.useDateRaw].filter(Boolean).join('|');
    const sourceRecordHash = createHash('sha1').update(`${key}|${index}`).digest('hex');
    return [{
      id: sourceRecordHash.slice(0, 12), module: 'enterprise_headquarters_distribution',
      companyName: company.companyName, companyNameNormalized: company.companyNameNormalized,
      useDateRaw: period.useDateRaw, recognitionPeriodRaw: period.recognitionPeriodRaw ?? period.useDateRaw, recognitionStartRocDate: period.recognitionStartRocDate, recognitionEndRocDate: period.recognitionEndRocDate, recognitionStartGregorianDate: period.recognitionStartGregorianDate, recognitionEndGregorianDate: period.recognitionEndGregorianDate, recognitionPeriodParsed: period.recognitionPeriodParsed, recognitionStatusRelativeToBuildDate: (period.recognitionStatusRelativeToBuildDate ?? 'unknown') as EnterpriseHeadquartersRecord['recognitionStatusRelativeToBuildDate'],
      companyAddress: address.companyAddress, companyAddressNormalized: address.companyAddressNormalized, districtNameFromAddress: address.districtNameFromAddress, isTaipeiDistrict: address.isTaipeiDistrict, roadName: address.roadName, addressLooksLikeMultiFloorOrUnit: address.addressLooksLikeMultiFloorOrUnit,
      industryCategoryRaw: category.industryCategoryRaw, industryCategoryNormalized: category.industryCategoryNormalized, industryCategoryGroup: category.industryCategoryGroup,
      sourceCoordinateX: x.raw ?? '', sourceCoordinateY: y.raw ?? '', sourceCoordinateXNumber: x.value, sourceCoordinateYNumber: y.value, sourceCoordinateSystem: 'twd97_tm2_zone_121',
      longitude: converted.longitude, latitude: converted.latitude, coordinateConversionStatus: converted.status, coordinateValid, coordinateQuality, coordinatePairKey: coordinateValid ? enterpriseCoordinatePairKey(converted.longitude, converted.latitude) : undefined,
      locationPrecision: enterpriseLocationPrecision({ coordinateConversionStatus: converted.status, districtNameFromAddress: address.districtNameFromAddress, companyAddress: address.companyAddress }),
      googleMapsQuery: createEnterpriseHeadquartersMapQuery({ companyName: company.companyName, companyAddress: address.companyAddress }),
      sourceRecordHash, source, sourceAgency,
    }];
  });
  const summary = buildEnterpriseHeadquartersSummary(records), fileInfo = await stat(inputPath), report = await readFile(reportPath, 'utf8').then(JSON.parse).catch(() => ({}));
  const xs = records.flatMap((r) => r.sourceCoordinateXNumber ?? []), ys = records.flatMap((r) => r.sourceCoordinateYNumber ?? []), lngs = records.flatMap((r) => r.longitude ?? []), lats = records.flatMap((r) => r.latitude ?? []);
  const enterpriseHeadquartersDistribution = {
    source, sourceAgency: '產業局', sourcePage: 'https://data.taipei/dataset/detail?id=d23e6ef4-3b78-4e74-8f8e-93cbe0c66515',
    category: '經濟', serviceCategory: '開創事業', datasetType: '原始資料', resourceName: source, officialResourceUpdateTime: '2026-06-02 09:00:54', officialMetadataUpdateTime: '2026-06-02 15:10:31', updateFrequency: '每6月', collectionPeriodStart: '2008-01-01',
    inputFile: basename(inputPath), convertedAt: new Date().toISOString(), fileSize: fileInfo.size, encoding, inputRows: rows.length, outputRecords: records.length,
    sourceCoordinateRange: { x: range(xs), y: range(ys) }, assumedSourceCoordinateSystem: 'TWD97_TM2_121', convertedCoordinateRange: { longitude: range(lngs), latitude: range(lats) },
    duplicateCompanyNames: duplicates(records.map((r) => r.companyNameNormalized)), duplicateCompanyAddresses: duplicates(records.map((r) => r.companyAddressNormalized)), duplicateRecognitionPeriods: duplicates(records.map((r) => r.useDateRaw)), duplicateConvertedCoordinatePairs: duplicates(records.map((r) => r.coordinatePairKey)), duplicateFallbackKeys: duplicates(records.map((r) => [r.companyNameNormalized, r.companyAddressNormalized, r.industryCategoryRaw, r.useDateRaw].filter(Boolean).join('|'))),
    warnings, coordinateQuality: summary.coordinateQuality, dataQuality: summary.dataQuality,
    notes: ['UTF-8-SIG decoded with Big5 / CP950 fallback', 'ADDR_X / ADDR_Y are treated as projected TWD97 TM2 zone 121 coordinates, not longitude / latitude', 'Converted WGS84 points are for enterprise headquarters source-record lookup only, not company boundaries, office boundaries, entrances, real-time operating status, hiring status, compliance, credit, stock, investment, or real-estate advice'],
  };
  await mkdir(outputDir, { recursive: true });
  await Promise.all([
    writeFile(join(outputDir, 'records.json'), JSON.stringify(records)),
    writeFile(join(outputDir, 'summary.json'), JSON.stringify(summary)),
    writeFile(reportPath, JSON.stringify({ ...report, enterpriseHeadquartersDistribution }, null, 2)),
  ]);
  console.log(`Converted ${records.length} enterprise headquarters records from ${basename(inputPath)}.`);
}

if (import.meta.url === `file://${process.argv[1]}`) await convertEnterpriseHeadquartersDistribution(process.argv.find((arg) => arg.startsWith('--file='))?.slice(7));
