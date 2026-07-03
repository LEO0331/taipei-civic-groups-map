import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { parseCsv } from './convertCivicGroups';
import { buildRegisteredFactorySummary, cleanFactoryText, coordinatePairKey, convertTwd97Tm2ToWgs84, createRegisteredFactoryMapQuery, factoryCoordinateQuality, factoryLocationPrecision, parseFactoryAddress, parseFactoryName, parseFactoryRegistrationId, parseFactorySourceCoordinate, parseResponsiblePersonName } from '../src/lib/registeredFactoryDistribution';
import type { RegisteredFactoryRecord } from '../src/types';

const rawDir = join(process.cwd(), 'data/raw/registered-factory-distribution');
const outputDir = join(process.cwd(), 'public/data');
const reportPath = join(outputDir, 'conversion-report.json');
const source = '臺北市登記工廠分布圖及基本資料';
const sourceAgency = '臺北市政府產業發展局';
const decode = (bytes: Uint8Array) => { try { return { text: new TextDecoder('utf-8', { fatal: true }).decode(bytes).replace(/^\uFEFF/, ''), encoding: 'UTF-8-SIG / UTF-8' }; } catch { return { text: new TextDecoder('big5', { fatal: true }).decode(bytes).replace(/^\uFEFF/, ''), encoding: 'CP950 / Big5-compatible' }; } };
const duplicates = (values: Array<string | undefined>) => [...values.reduce((map, value) => value ? map.set(value, (map.get(value) ?? 0) + 1) : map, new Map<string, number>())].filter(([, count]) => count > 1).slice(0, 30).map(([value, count]) => ({ value, count }));
const range = (values: number[]) => values.length ? { min: Math.min(...values), max: Math.max(...values) } : undefined;

export async function convertRegisteredFactoryDistribution(filePath?: string) {
  const csvFile = filePath ? undefined : (await readdir(rawDir)).find((file) => file.toLowerCase().endsWith('.csv'));
  if (!filePath && !csvFile) throw new Error('No registered factory CSV found. Run npm run data:fetch:registered-factories.');
  const inputPath = filePath ?? join(rawDir, csvFile!), { text, encoding } = decode(await readFile(inputPath)), [rawHeaders, ...rows] = parseCsv(text);
  if (!rawHeaders) throw new Error('Invalid registered factory CSV: file is empty.');
  const headers = rawHeaders.map((header) => cleanFactoryText(header) ?? '');
  const col = (name: string) => headers.indexOf(name);
  const idx = { id: col('REGI_ID'), name: col('FACT_NAME'), address: col('FACT_ADDR'), person: col('BNAME'), x: col('ADDR_X'), y: col('ADDR_Y') };
  const missing = Object.entries(idx).filter(([, index]) => index < 0).map(([key]) => key);
  if (missing.length) throw new Error(`Invalid registered factory CSV: missing columns ${missing.join(', ')}.`);
  const warnings = { registrationId: [] as string[], address: [] as string[], coordinate: [] as string[] };
  const records = rows.flatMap((row, index): RegisteredFactoryRecord[] => {
    const id = parseFactoryRegistrationId(row[idx.id]), name = parseFactoryName(row[idx.name]), address = parseFactoryAddress(row[idx.address]), person = parseResponsiblePersonName(row[idx.person]), x = parseFactorySourceCoordinate(row[idx.x]), y = parseFactorySourceCoordinate(row[idx.y]);
    if (id.warning && warnings.registrationId.length < 20) warnings.registrationId.push(`${index + 2}:${id.warning}`);
    if (address.warning && warnings.address.length < 20) warnings.address.push(`${id.factoryRegistrationId ?? index + 2}:${address.factoryAddress ?? ''}`);
    const converted = x.value === undefined || y.value === undefined ? { status: 'missing' as const } : convertTwd97Tm2ToWgs84(x.value, y.value);
    if ((x.warning || y.warning || converted.status !== 'converted_from_twd97_tm2') && warnings.coordinate.length < 20) warnings.coordinate.push(`${id.factoryRegistrationId ?? index + 2}:x=${x.raw ?? ''},y=${y.raw ?? ''},status=${converted.status}`);
    if (!id.factoryRegistrationId || !name.factoryName || !address.factoryAddress) return [];
    const coordinateQuality = factoryCoordinateQuality(converted.status), coordinateValid = coordinateQuality === 'valid_converted_wgs84_taipei' || coordinateQuality === 'valid_wgs84_taipei';
    const key = id.factoryRegistrationIdNormalized || [name.factoryNameNormalized, address.factoryAddressNormalized, x.raw, y.raw].filter(Boolean).join('|');
    const sourceRecordHash = createHash('sha1').update(`${key}|${index}`).digest('hex');
    const record: RegisteredFactoryRecord = {
      id: sourceRecordHash.slice(0, 12), module: 'registered_factory_distribution',
      factoryRegistrationId: id.factoryRegistrationId, factoryRegistrationIdNormalized: id.factoryRegistrationIdNormalized,
      factoryName: name.factoryName, factoryNameNormalized: name.factoryNameNormalized,
      factoryAddress: address.factoryAddress, factoryAddressNormalized: address.factoryAddressNormalized, districtNameFromAddress: address.districtNameFromAddress, isTaipeiDistrict: address.isTaipeiDistrict, roadName: address.roadName, addressLooksLikeMultiFloorOrUnit: address.addressLooksLikeMultiFloorOrUnit,
      responsiblePersonName: person.responsiblePersonName ?? '', responsiblePersonNameNormalized: person.responsiblePersonNameNormalized,
      sourceCoordinateX: x.raw, sourceCoordinateY: y.raw, sourceCoordinateXNumber: x.value, sourceCoordinateYNumber: y.value, sourceCoordinateSystem: 'twd97_tm2_zone_121',
      longitude: converted.longitude, latitude: converted.latitude, coordinateConversionStatus: converted.status, coordinateValid, coordinateQuality, coordinatePairKey: coordinateValid ? coordinatePairKey(converted.longitude, converted.latitude) : undefined,
      locationPrecision: factoryLocationPrecision({ coordinateConversionStatus: converted.status, districtNameFromAddress: address.districtNameFromAddress, factoryAddress: address.factoryAddress }),
      googleMapsQuery: createRegisteredFactoryMapQuery({ factoryName: name.factoryName, factoryAddress: address.factoryAddress }),
      sourceRecordHash, source, sourceAgency,
    };
    return [record];
  });
  const summary = buildRegisteredFactorySummary(records), fileInfo = await stat(inputPath), report = await readFile(reportPath, 'utf8').then(JSON.parse).catch(() => ({}));
  const xs = records.flatMap((r) => r.sourceCoordinateXNumber ?? []), ys = records.flatMap((r) => r.sourceCoordinateYNumber ?? []), lngs = records.flatMap((r) => r.longitude ?? []), lats = records.flatMap((r) => r.latitude ?? []);
  const registeredFactoryDistribution = {
    source, sourceAgency: '產業局', sourcePage: 'https://data.taipei/dataset/detail?id=c8215f0d-20fa-4350-bcd9-da82432c2c9d',
    category: '經濟', serviceCategory: '開創事業', datasetType: '原始資料', resourceName: source, officialResourceUpdateTime: '2026-06-02 09:07:38', officialMetadataUpdateTime: '2026-06-02 14:37:03', updateFrequency: '每1月', collectionPeriodStart: '1952-01-01',
    inputFile: basename(inputPath), convertedAt: new Date().toISOString(), fileSize: fileInfo.size, encoding, inputRows: rows.length, outputRecords: records.length,
    sourceCoordinateRange: { x: range(xs), y: range(ys) }, assumedSourceCoordinateSystem: 'TWD97_TM2_121', convertedCoordinateRange: { longitude: range(lngs), latitude: range(lats) },
    duplicateFactoryRegistrationIds: duplicates(records.map((r) => r.factoryRegistrationIdNormalized)),
    duplicateFactoryNames: duplicates(records.map((r) => r.factoryNameNormalized)),
    duplicateFactoryAddresses: duplicates(records.map((r) => r.factoryAddressNormalized)),
    duplicateConvertedCoordinatePairs: duplicates(records.map((r) => r.coordinatePairKey)),
    duplicateFallbackKeys: duplicates(records.map((r) => [r.factoryNameNormalized, r.factoryAddressNormalized, r.sourceCoordinateX, r.sourceCoordinateY].filter(Boolean).join('|'))),
    multiFloorAddressExamples: records.filter((r) => r.addressLooksLikeMultiFloorOrUnit).slice(0, 20).map((r) => r.factoryAddress),
    warnings, coordinateQuality: summary.coordinateQuality, dataQuality: summary.dataQuality,
    notes: ['UTF-8-SIG decoded with Big5 / CP950 fallback', 'Factory registration IDs are preserved as text', 'ADDR_X / ADDR_Y are treated as projected TWD97 TM2 zone 121 coordinates, not longitude / latitude', 'Converted WGS84 points are for source-record lookup only, not factory boundaries, entrances, production areas, operating status, pollution risk, safety risk, compliance, credit, or investment advice'],
  };
  await mkdir(outputDir, { recursive: true });
  await Promise.all([
    writeFile(join(outputDir, 'registered-factory-distribution.json'), JSON.stringify(records)),
    writeFile(join(outputDir, 'registered-factory-summary.json'), JSON.stringify(summary)),
    writeFile(reportPath, JSON.stringify({ ...report, registeredFactoryDistribution }, null, 2)),
  ]);
  console.log(`Converted ${records.length} registered factory records from ${basename(inputPath)}.`);
}

if (import.meta.url === `file://${process.argv[1]}`) await convertRegisteredFactoryDistribution(process.argv.find((arg) => arg.startsWith('--file='))?.slice(7));
