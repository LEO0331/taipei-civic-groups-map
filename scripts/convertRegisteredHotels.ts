import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { parseCsv } from './convertCivicGroups';
import {
  buildRegisteredHotelSummary, parseHotelAddress, parseNumberField, roomCountBucket,
} from '../src/lib/registeredHotels';
import { normalizeColumnName, normalizeText } from '../src/lib/civicGroups';
import type { RegisteredHotel } from '../src/types';

const rawDir = join(process.cwd(), 'data/raw/registered-hotels');
const outputDir = join(process.cwd(), 'public/data');
const reportPath = join(outputDir, 'conversion-report.json');
const source = '臺北市一般旅館名冊';
const sourceAgency = '觀傳局';

function decodeCsv(bytes: Uint8Array) {
  try {
    return { text: new TextDecoder('utf-8', { fatal: true }).decode(bytes).replace(/^\uFEFF/, ''), encoding: 'UTF-8-SIG / UTF-8' };
  } catch {
    return { text: new TextDecoder('big5', { fatal: true }).decode(bytes).replace(/^\uFEFF/, ''), encoding: 'CP950 / Big5-compatible' };
  }
}

export async function convertRegisteredHotels(filePath?: string) {
  const csvFile = filePath ? undefined : (await readdir(rawDir)).find((file) => file.toLowerCase().endsWith('.csv'));
  if (!filePath && !csvFile) throw new Error('No registered hotel CSV found. Run npm run data:fetch:registered-hotels.');
  const inputPath = filePath ?? join(rawDir, csvFile!);
  const { text, encoding } = decodeCsv(await readFile(inputPath));
  const [rawHeaders, ...rows] = parseCsv(text);
  if (!rawHeaders) throw new Error('Invalid registered hotel CSV: file is empty.');
  const headers = rawHeaders.map(normalizeColumnName);
  const required = ['縣市代碼', '專用標識編號', '旅館名稱', '電話或手機號碼', '營業地址', '客房最低定價', '客房最高定價', '房間數'];
  const missing = required.filter((header) => !headers.includes(header));
  if (missing.length) throw new Error(`Invalid registered hotel CSV: missing columns ${missing.join(', ')}.`);

  const districtWarnings: string[] = [];
  const numericWarnings: string[] = [];
  const duplicateRegistrationIds: string[] = [];
  const seen = new Set<string>();
  const records = rows.flatMap((row, index): RegisteredHotel[] => {
    const values = Object.fromEntries(headers.map((header, column) => [header, normalizeText(row[column])]));
    const hotelName = values['旅館名稱'];
    const registrationId = values['專用標識編號'];
    if (!hotelName || !registrationId) return [];
    const address = parseHotelAddress(values['營業地址']);
    const listedMinRoomRateNtd = parseNumberField(values['客房最低定價']);
    const listedMaxRoomRateNtd = parseNumberField(values['客房最高定價']);
    const roomCount = parseNumberField(values['房間數']);
    if (!address.district && districtWarnings.length < 20) districtWarnings.push(values['營業地址'] ?? '');
    (['客房最低定價', '客房最高定價', '房間數'] as const).forEach((field) => {
      if (values[field] && parseNumberField(values[field]) === undefined && numericWarnings.length < 20) numericWarnings.push(`${field}: ${values[field]}`);
    });
    if (seen.has(registrationId) && duplicateRegistrationIds.length < 20) duplicateRegistrationIds.push(registrationId);
    seen.add(registrationId);
    const hasListedRoomRate = listedMinRoomRateNtd !== undefined && listedMaxRoomRateNtd !== undefined;
    return [{
      id: createHash('sha1').update(`${registrationId}|${hotelName}|${index}`).digest('hex').slice(0, 12),
      module: 'registered_hotels',
      cityCode: values['縣市代碼'],
      registrationId,
      hotelName,
      phone: values['電話或手機號碼'],
      address: address.address,
      addressWithoutPostalCode: address.addressWithoutPostalCode,
      postalCode: address.postalCode,
      district: address.district,
      listedMinRoomRateNtd,
      listedMaxRoomRateNtd,
      listedRoomRateSpreadNtd: hasListedRoomRate ? listedMaxRoomRateNtd - listedMinRoomRateNtd : undefined,
      roomCount,
      roomCountBucket: roomCountBucket(roomCount),
      hasPhone: Boolean(values['電話或手機號碼']),
      hasListedRoomRate,
      hasRoomCount: roomCount !== undefined,
      locationPrecision: 'address_only',
      source,
      sourceAgency,
    }];
  });

  const fileInfo = await stat(inputPath);
  let report = {};
  try { report = JSON.parse(await readFile(reportPath, 'utf8')); } catch { /* first conversion */ }
  const registeredHotels = {
    source, sourceAgency, sourcePage: 'https://data.taipei/dataset/detail?id=4d7d0b46-2e90-4ee7-b000-c0f2f3a37651',
    theme: '觀光', description: '臺北市合法一般旅館名冊', updateFrequency: '每3月',
    inputFile: basename(inputPath), convertedAt: new Date().toISOString(), fileSize: fileInfo.size, encoding,
    inputRows: rows.length, outputRecords: records.length,
    recordsWithoutDistrict: records.filter((record) => !record.district).length,
    recordsWithPhone: records.filter((record) => record.hasPhone).length,
    recordsWithListedRoomRate: records.filter((record) => record.hasListedRoomRate).length,
    recordsWithRoomCount: records.filter((record) => record.hasRoomCount).length,
    totalRoomCount: records.reduce((total, record) => total + (record.roomCount ?? 0), 0),
    failedDistrictExamples: districtWarnings, failedNumericExamples: numericWarnings, duplicateRegistrationIds,
    notes: ['UTF-8-SIG decoded with Big5 fallback', 'Strings trimmed', 'Empty strings normalized', 'No coordinates supplied; records use address_only precision', 'Listed room-rate fields are registry fields, not real-time booking prices'],
  };
  await mkdir(outputDir, { recursive: true });
  await Promise.all([
    writeFile(join(outputDir, 'registered-hotels.json'), JSON.stringify(records)),
    writeFile(join(outputDir, 'registered-hotel-summary.json'), JSON.stringify(buildRegisteredHotelSummary(records))),
    writeFile(reportPath, JSON.stringify({ ...report, registeredHotels }, null, 2)),
  ]);
  console.log(`Converted ${records.length} registered hotel records from ${basename(inputPath)}.`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await convertRegisteredHotels(process.argv.find((arg) => arg.startsWith('--file='))?.slice(7));
}
