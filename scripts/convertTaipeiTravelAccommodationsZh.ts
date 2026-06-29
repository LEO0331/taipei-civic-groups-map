import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { parseCsv } from './convertCivicGroups';
import { TAIPEI_DISTRICT_CENTROIDS } from '../src/lib/civicGroups';
import {
  accommodationMatchKey, buildTaipeiTravelAccommodationZhSummary, classifyRoomCountBucket, classifyTaipeiTravelAccommodationCategory,
  cleanText, parseAccommodationFax, parseAccommodationPhone, parseRoomCount, parseTaipeiTravelAccommodationAddress,
} from '../src/lib/taipeiTravelAccommodationsZh';
import type { RegisteredHotel, TaipeiTravelAccommodationZhRecord } from '../src/types';

const rawDir = join(process.cwd(), 'data/raw/taipei-travel-accommodations-zh');
const outputDir = join(process.cwd(), 'public/data');
const reportPath = join(outputDir, 'conversion-report.json');
const source = '臺北市臺北旅遊網住宿資料(中文)';
const sourceAgency = '臺北市政府觀光傳播局';

function decodeCsv(bytes: Uint8Array) {
  try { return { text: new TextDecoder('utf-8', { fatal: true }).decode(bytes).replace(/^\uFEFF/, ''), encoding: 'UTF-8-SIG / UTF-8' }; }
  catch { return { text: new TextDecoder('big5', { fatal: true }).decode(bytes).replace(/^\uFEFF/, ''), encoding: 'CP950 / Big5-compatible' }; }
}

export async function convertTaipeiTravelAccommodationsZh(filePath?: string) {
  const csvFile = filePath ? undefined : (await readdir(rawDir)).find((file) => file.toLowerCase().endsWith('.csv'));
  if (!filePath && !csvFile) throw new Error('No Taipei Travel accommodation CSV found. Run npm run data:fetch:travel-accommodations.');
  const inputPath = filePath ?? join(rawDir, csvFile!);
  const { text, encoding } = decodeCsv(await readFile(inputPath));
  const [rawHeaders, ...rows] = parseCsv(text);
  if (!rawHeaders) throw new Error('Invalid Taipei Travel accommodation CSV: file is empty.');
  const headers = rawHeaders.map((header) => cleanText(header) ?? '');
  const required = ['旅館類別', '旅宿名稱', '地址', '電話或手機號碼', '傳真', '房間數'];
  const missing = required.filter((header) => !headers.includes(header));
  if (missing.length) throw new Error(`Invalid Taipei Travel accommodation CSV: missing columns ${missing.join(', ')}.`);

  let registeredHotelKeys = new Set<string>();
  try {
    const hotels = JSON.parse(await readFile(join(outputDir, 'registered-hotels.json'), 'utf8')) as RegisteredHotel[];
    registeredHotelKeys = new Set(hotels.map((hotel) => accommodationMatchKey(hotel.hotelName, hotel.addressWithoutPostalCode ?? hotel.address, hotel.phone)));
  } catch { /* optional comparison */ }

  const duplicates: string[] = [], roomWarnings: string[] = [], addressWarnings: string[] = [], phoneWarnings: string[] = [];
  const seen = new Set<string>();
  const records = rows.flatMap((row): TaipeiTravelAccommodationZhRecord[] => {
    const values = Object.fromEntries(headers.map((header, column) => [header, cleanText(row[column])]));
    const accommodationName = values['旅宿名稱'];
    if (!accommodationName) return [];
    const address = parseTaipeiTravelAccommodationAddress(values['地址']);
    const phone = parseAccommodationPhone(values['電話或手機號碼']);
    const fax = parseAccommodationFax(values['傳真']);
    const roomCount = parseRoomCount(values['房間數']);
    if (values['房間數'] && roomCount === undefined && roomWarnings.length < 20) roomWarnings.push(values['房間數']);
    if (address.warning && addressWarnings.length < 20) addressWarnings.push(`${accommodationName}:${values['地址'] ?? ''}`);
    if (phone.warning && phoneWarnings.length < 20) phoneWarnings.push(values['電話或手機號碼'] ?? '');
    const key = address.addressNormalized
      ? `${accommodationName}|${address.addressNormalized}`
      : `${accommodationName}|${phone.phone ?? ''}`;
    if (seen.has(key)) { if (duplicates.length < 20) duplicates.push(key); return []; }
    seen.add(key);
    const point = address.district ? TAIPEI_DISTRICT_CENTROIDS[address.district] : undefined;
    const matchKey = accommodationMatchKey(accommodationName, address.addressNormalized, phone.phone);
    return [{
      id: createHash('sha1').update(key).digest('hex').slice(0, 12),
      module: 'taipei_travel_accommodations_zh',
      accommodationCategoryRaw: values['旅館類別'],
      accommodationCategory: classifyTaipeiTravelAccommodationCategory(values['旅館類別']),
      accommodationName,
      address: address.address,
      addressNormalized: address.addressNormalized,
      district: address.district,
      roadName: address.roadName,
      phone: phone.phone,
      phoneDisplay: phone.phoneDisplay,
      phoneDialHref: phone.phoneDialHref,
      phoneType: phone.phoneType,
      hasPhone: Boolean(phone.phone),
      fax: fax.fax,
      faxDisplay: fax.faxDisplay,
      hasFax: Boolean(fax.fax),
      roomCount,
      hasRoomCount: roomCount !== undefined,
      roomCountBucket: classifyRoomCountBucket(roomCount),
      possibleRegisteredHotelMatchKey: registeredHotelKeys.has(matchKey) ? matchKey : undefined,
      locationPrecision: point ? 'district_centroid' : 'address_only',
      latitude: point?.latitude,
      longitude: point?.longitude,
      source,
      sourceAgency,
    }];
  });

  const fileInfo = await stat(inputPath);
  let report = {};
  try { report = JSON.parse(await readFile(reportPath, 'utf8')); } catch { /* first conversion */ }
  const summary = buildTaipeiTravelAccommodationZhSummary(records);
  const taipeiTravelAccommodationsZh = {
    source, sourceAgency, officialSourceAgencyShort: '觀傳局',
    sourcePage: 'https://data.taipei/dataset/detail?id=58093ba6-4c98-4148-b27a-50ad97d7afca',
    category: '觀光', serviceCategory: '休閒旅遊', datasetType: '網路服務', updateFrequency: '不定期更新', language: '中文',
    inputFile: basename(inputPath), convertedAt: new Date().toISOString(), fileSize: fileInfo.size, encoding,
    inputRows: rows.length, outputRecords: records.length, duplicateKeys: duplicates,
    roomWarningExamples: roomWarnings, addressWarningExamples: addressWarnings, phoneWarningExamples: phoneWarnings,
    totalRoomCount: summary.totalRoomCount,
    notes: ['UTF-8-SIG decoded with Big5 fallback', 'Strings and column names trimmed', 'Phone and fax values preserved as source text', 'No geocoding used; records use district centroids only when district is parsed', 'This is not booking, vacancy, price, quality, ranking, travel-advice, or safety-guarantee data'],
  };
  await mkdir(outputDir, { recursive: true });
  await Promise.all([
    writeFile(join(outputDir, 'taipei-travel-accommodations-zh.json'), JSON.stringify(records)),
    writeFile(join(outputDir, 'taipei-travel-accommodation-zh-summary.json'), JSON.stringify(summary)),
    writeFile(reportPath, JSON.stringify({ ...report, taipeiTravelAccommodationsZh }, null, 2)),
  ]);
  console.log(`Converted ${records.length} Taipei Travel accommodation records from ${basename(inputPath)}.`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await convertTaipeiTravelAccommodationsZh(process.argv.find((arg) => arg.startsWith('--file='))?.slice(7));
}
