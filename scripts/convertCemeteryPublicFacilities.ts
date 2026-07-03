import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { parseCsv } from './convertCivicGroups';
import { buildCemeteryPublicFacilitySummary, cleanText, coordinatePairKey, createCemeteryMapQuery, getLocationPrecision, parseCemeteryBurialStatus, parseCemeteryCoordinate, parseCemeteryLocationDescription, parseCemeteryName, parseCemeteryNote, parseCemeteryOpeningHours, parseCemeteryType, parseSourceSequenceNumber, parseTaipeiDistrictName } from '../src/lib/cemeteryPublicFacilities';
import type { CemeteryCoordinateQuality, CemeteryPublicFacilityRecord } from '../src/types';

const rawDir = join(process.cwd(), 'data/raw/cemetery-public-facilities');
const outputDir = join(process.cwd(), 'public/data');
const reportPath = join(outputDir, 'conversion-report.json');
const source = '臺北市各區公墓資訊(含禁葬/未禁葬公墓及坐標資訊)';
const sourceAgency = '臺北市政府民政局殯葬管理處';
const decode = (bytes: Uint8Array) => { try { return { text: new TextDecoder('utf-8', { fatal: true }).decode(bytes).replace(/^\uFEFF/, ''), encoding: 'UTF-8-SIG / UTF-8' }; } catch { return { text: new TextDecoder('big5', { fatal: true }).decode(bytes).replace(/^\uFEFF/, ''), encoding: 'CP950 / Big5-compatible' }; } };
const duplicates = (values: Array<string | undefined>) => [...values.reduce((map, value) => value ? map.set(value, (map.get(value) ?? 0) + 1) : map, new Map<string, number>())].filter(([, count]) => count > 1).slice(0, 30).map(([value, count]) => ({ value, count }));
const quality = (lat: ReturnType<typeof parseCemeteryCoordinate>, lon: ReturnType<typeof parseCemeteryCoordinate>): CemeteryCoordinateQuality => {
  if (lat.coordinateQuality === 'missing' || lon.coordinateQuality === 'missing') return 'missing';
  if (lat.coordinateQuality === 'invalid' || lon.coordinateQuality === 'invalid') return 'invalid';
  if (lat.coordinateQuality === 'outside_taipei_bounds' || lon.coordinateQuality === 'outside_taipei_bounds') return 'outside_taipei_bounds';
  return 'valid_wgs84_taipei';
};

export async function convertCemeteryPublicFacilities(filePath?: string) {
  const csvFile = filePath ? undefined : (await readdir(rawDir)).find((file) => file.toLowerCase().endsWith('.csv'));
  if (!filePath && !csvFile) throw new Error('No cemetery public facilities CSV found. Run npm run data:fetch:cemeteries.');
  const inputPath = filePath ?? join(rawDir, csvFile!), { text, encoding } = decode(await readFile(inputPath)), [rawHeaders, ...rows] = parseCsv(text);
  if (!rawHeaders) throw new Error('Invalid cemetery public facilities CSV: file is empty.');
  const headers = rawHeaders.map((header) => cleanText(header) ?? '');
  const col = (name: string) => headers.indexOf(name);
  const idx = { seq: col('序號'), type: col('類型'), district: col('行政區'), name: col('墓區名稱'), location: col('墓區位置'), status: col('葬區狀態'), hours: col('開放時間'), latitude: col('緯度'), longitude: col('經度'), note: col('備註') };
  const missingColumns = Object.entries(idx).filter(([, index]) => index < 0).map(([key]) => key);
  if (missingColumns.length) throw new Error(`Invalid cemetery public facilities CSV: missing columns ${missingColumns.join(', ')}.`);

  const warnings = { sequence: [] as string[], cemeteryType: [] as string[], district: [] as string[], location: [] as string[], burialStatus: [] as string[], openingHours: [] as string[], coordinate: [] as string[] };
  const records = rows.flatMap((row, index): CemeteryPublicFacilityRecord[] => {
    const seq = parseSourceSequenceNumber(row[idx.seq]), type = parseCemeteryType(row[idx.type]), district = parseTaipeiDistrictName(row[idx.district]), name = parseCemeteryName(row[idx.name]), location = parseCemeteryLocationDescription(row[idx.location]), status = parseCemeteryBurialStatus(row[idx.status]), hours = parseCemeteryOpeningHours(row[idx.hours]), lat = parseCemeteryCoordinate(row[idx.latitude], 'latitude'), lon = parseCemeteryCoordinate(row[idx.longitude], 'longitude'), note = parseCemeteryNote(row[idx.note]);
    if (seq.warning && warnings.sequence.length < 20) warnings.sequence.push(`${index + 2}:${seq.warning}`);
    if (type.warning && warnings.cemeteryType.length < 20) warnings.cemeteryType.push(`${name.cemeteryName ?? index + 2}:${type.cemeteryTypeRaw ?? ''}`);
    if (district.warning && warnings.district.length < 20) warnings.district.push(`${name.cemeteryName ?? index + 2}:${district.districtName ?? ''}`);
    if (location.locationDescriptionLooksApproximate && warnings.location.length < 20) warnings.location.push(`${name.cemeteryName ?? index + 2}:${location.cemeteryLocationDescription ?? ''}`);
    if (status.warning && warnings.burialStatus.length < 20) warnings.burialStatus.push(`${name.cemeteryName ?? index + 2}:${status.burialStatusRaw ?? ''}`);
    if (hours.warning && warnings.openingHours.length < 20) warnings.openingHours.push(`${name.cemeteryName ?? index + 2}:${hours.openingHoursRaw ?? ''}`);
    if ((lat.warning || lon.warning) && warnings.coordinate.length < 20) warnings.coordinate.push(`${name.cemeteryName ?? index + 2}:lat=${row[idx.latitude] ?? ''},lng=${row[idx.longitude] ?? ''}`);
    if (!name.cemeteryName) return [];
    const coordinateValid = lat.valid && lon.valid, coordinateQuality = quality(lat, lon), pairKey = coordinateValid ? coordinatePairKey(lon.value, lat.value) : undefined;
    const fallback = [type.cemeteryTypeRaw, district.districtName, name.cemeteryName, location.cemeteryLocationDescription].map(cleanText).filter(Boolean).join('|');
    const key = seq.sourceSequenceNumberNormalized || fallback;
    const sourceRecordHash = createHash('sha1').update(`${key}|${index}`).digest('hex');
    return [{
      id: sourceRecordHash.slice(0, 12), module: 'cemetery_public_facilities', ...seq,
      cemeteryTypeRaw: type.cemeteryTypeRaw ?? '', cemeteryTypeCategory: type.cemeteryTypeCategory,
      districtName: district.districtName ?? '', districtNameNormalized: district.districtNameNormalized, isTaipeiDistrict: district.isTaipeiDistrict,
      cemeteryName: name.cemeteryName, cemeteryNameNormalized: name.cemeteryNameNormalized,
      cemeteryLocationDescription: location.cemeteryLocationDescription ?? '', cemeteryLocationDescriptionNormalized: location.cemeteryLocationDescriptionNormalized, roadName: location.roadName, locationDescriptionLooksApproximate: location.locationDescriptionLooksApproximate,
      burialStatusRaw: status.burialStatusRaw ?? '', burialStatusCategory: status.burialStatusCategory, isBurialProhibited: status.isBurialProhibited, isApplicationMentioned: status.isApplicationMentioned,
      openingHoursRaw: hours.openingHoursRaw ?? '', openingHoursCategory: hours.openingHoursCategory, isAllDayOpen: hours.isAllDayOpen,
      latitude: lat.value, longitude: lon.value, coordinateValid, coordinateQuality, coordinatePairKey: pairKey, locationPrecision: getLocationPrecision({ coordinateValid, districtName: district.districtName, cemeteryLocationDescription: location.cemeteryLocationDescription }),
      ...note, googleMapsQuery: createCemeteryMapQuery({ cemeteryName: name.cemeteryName, districtName: district.districtName, cemeteryLocationDescription: location.cemeteryLocationDescription }),
      sourceRecordHash, source, sourceAgency,
    }];
  });
  const summary = buildCemeteryPublicFacilitySummary(records), fileInfo = await stat(inputPath), report = await readFile(reportPath, 'utf8').then(JSON.parse).catch(() => ({}));
  const cemeteryPublicFacilities = {
    source, sourceAgency: '民政局殯葬處', sourcePage: 'https://data.taipei/dataset/detail?id=041287ab-e528-49c6-99eb-a37ef329a121',
    category: '民政', serviceCategory: '生命禮儀', datasetType: '原始資料', resourceName: '殯葬設施(列管公墓及公墓)彙整表', officialResourceUpdateTime: '2025-12-24 09:15:59', officialMetadataUpdateTime: '2025-12-24 09:16:10', updateFrequency: '每1年', collectionPeriodStart: '2020-05-01', collectionPeriodEnd: '2025-12-24',
    inputFile: basename(inputPath), convertedAt: new Date().toISOString(), fileSize: fileInfo.size, encoding, inputRows: rows.length, outputRecords: records.length,
    duplicateSequenceNumbers: duplicates(records.map((r) => r.sourceSequenceNumberNormalized)),
    duplicateCemeteryNames: duplicates(records.map((r) => r.cemeteryNameNormalized)),
    duplicateLocationDescriptions: duplicates(records.map((r) => r.cemeteryLocationDescriptionNormalized)),
    duplicateCoordinatePairs: duplicates(records.map((r) => r.coordinatePairKey)),
    duplicateFallbackKeys: duplicates(records.map((r) => [r.cemeteryTypeRaw, r.districtName, r.cemeteryName, r.cemeteryLocationDescription].map(cleanText).filter(Boolean).join('|'))),
    approximateLocationExamples: records.filter((r) => r.locationDescriptionLooksApproximate).slice(0, 20).map((r) => r.cemeteryLocationDescription),
    warnings, dataQuality: summary.dataQuality,
    notes: ['UTF-8-SIG decoded with Big5 / CP950 fallback', 'Markers use validated source coordinates only', 'Points are cemetery reference locations, not boundaries, entrances, routes, individual grave locations, availability, eligibility, legal advice, tourism recommendation, or endorsement'],
  };
  await mkdir(outputDir, { recursive: true });
  await Promise.all([
    writeFile(join(outputDir, 'cemetery-public-facilities.json'), JSON.stringify(records)),
    writeFile(join(outputDir, 'cemetery-public-facility-summary.json'), JSON.stringify(summary)),
    writeFile(reportPath, JSON.stringify({ ...report, cemeteryPublicFacilities }, null, 2)),
  ]);
  console.log(`Converted ${records.length} cemetery public facility records from ${basename(inputPath)}.`);
}

if (import.meta.url === `file://${process.argv[1]}`) await convertCemeteryPublicFacilities(process.argv.find((arg) => arg.startsWith('--file='))?.slice(7));
