import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { parseCsv } from './convertCivicGroups';
import { buildRegisteredLaborUnionSummary, classifyRegisteredLaborUnionType, parseLaborUnionContactAddress, parseLaborUnionPhone, parsePostalCode } from '../src/lib/registeredLaborUnions';
import { normalizeColumnName, normalizeText, TAIPEI_DISTRICT_CENTROIDS } from '../src/lib/civicGroups';
import type { RegisteredLaborUnion } from '../src/types';

const rawDir = join(process.cwd(), 'data/raw/registered-labor-unions');
const outputDir = join(process.cwd(), 'public/data');
const reportPath = join(outputDir, 'conversion-report.json');
const source = '臺北市各工會名單及聯絡方式';
const sourceAgency = '臺北市政府勞動局';

function decodeCsv(bytes: Uint8Array) {
  try { return { text: new TextDecoder('big5', { fatal: true }).decode(bytes).replace(/^\uFEFF/, ''), encoding: 'CP950 / Big5-compatible' }; }
  catch { return { text: new TextDecoder('utf-8', { fatal: true }).decode(bytes).replace(/^\uFEFF/, ''), encoding: 'UTF-8-SIG / UTF-8' }; }
}

export async function convertRegisteredLaborUnions(filePath?: string) {
  const csvFile = filePath ? undefined : (await readdir(rawDir)).find((file) => file.toLowerCase().endsWith('.csv'));
  if (!filePath && !csvFile) throw new Error('No registered labor union CSV found. Run npm run data:fetch:labor-unions.');
  const inputPath = filePath ?? join(rawDir, csvFile!);
  const { text, encoding } = decodeCsv(await readFile(inputPath));
  const [rawHeaders, ...rows] = parseCsv(text);
  if (!rawHeaders) throw new Error('Invalid registered labor union CSV: file is empty.');
  const headers = rawHeaders.map(normalizeColumnName);
  const required = ['項次', '工會屬性', '工會名稱', '理事長', '郵遞區號', '通訊地址', '聯絡電話'];
  const missing = required.filter((header) => !headers.includes(header));
  if (missing.length) throw new Error(`Invalid registered labor union CSV: missing columns ${missing.join(', ')}.`);

  const addressWarnings: string[] = [], phoneWarnings: string[] = [], postalCodeWarnings: string[] = [], duplicateKeys: string[] = [];
  const seen = new Set<string>();
  const records = rows.flatMap((row): RegisteredLaborUnion[] => {
    const values = Object.fromEntries(headers.map((header, column) => [header, normalizeText(row[column])]));
    const unionName = values['工會名稱'];
    if (!unionName) return [];
    const sourceSequenceNumber = /^\d+$/.test(values['項次'] ?? '') ? Number(values['項次']) : undefined;
    const postalCode = parsePostalCode(values['郵遞區號']);
    const address = parseLaborUnionContactAddress(values['通訊地址'], postalCode);
    const phone = parseLaborUnionPhone(values['聯絡電話']);
    const point = address.isTaipeiAddress && address.district ? TAIPEI_DISTRICT_CENTROIDS[address.district] : undefined;
    if (address.warning && addressWarnings.length < 20) addressWarnings.push(values['通訊地址'] ?? '');
    if (phone.warning && phoneWarnings.length < 20) phoneWarnings.push(values['聯絡電話'] ?? '');
    if (postalCode && !/^\d{3,5}$/.test(postalCode) && postalCodeWarnings.length < 20) postalCodeWarnings.push(postalCode);
    const key = `${sourceSequenceNumber ?? ''}|${unionName}|${address.addressNormalized ?? ''}|${phone.phone ?? ''}`;
    if (seen.has(key)) { if (duplicateKeys.length < 20) duplicateKeys.push(key); return []; }
    seen.add(key);
    return [{
      id: createHash('sha1').update(key).digest('hex').slice(0, 12),
      module: 'registered_labor_unions',
      sourceSequenceNumber,
      unionAttributeRaw: values['工會屬性'],
      unionType: classifyRegisteredLaborUnionType(values['工會屬性']),
      unionName,
      chairpersonName: values['理事長'],
      hasChairpersonName: Boolean(values['理事長']),
      postalCode,
      contactAddress: address.contactAddress,
      addressNormalized: address.addressNormalized,
      city: address.city,
      district: address.district,
      roadName: address.roadName,
      isTaipeiAddress: address.isTaipeiAddress,
      addressLocationCategory: address.addressLocationCategory,
      phone: phone.phone,
      phoneDisplay: phone.phoneDisplay,
      phoneDialHref: phone.phoneDialHref,
      phoneType: phone.phoneType,
      hasPhone: Boolean(phone.phone),
      locationPrecision: address.addressLocationCategory === 'taipei_address' ? 'district_centroid' : address.addressLocationCategory === 'missing' ? 'missing' : 'outside_taipei_or_unparsed',
      latitude: point?.latitude,
      longitude: point?.longitude,
      source,
      sourceAgency,
    }];
  });

  const fileInfo = await stat(inputPath);
  let report = {};
  try { report = JSON.parse(await readFile(reportPath, 'utf8')); } catch { /* first conversion */ }
  const summary = buildRegisteredLaborUnionSummary(records);
  const registeredLaborUnions = {
    source, sourceAgency, officialSourceAgencyShort: '勞動局',
    sourcePage: 'https://data.taipei/dataset/detail?id=bea69229-8349-4208-8a68-988718f4ea48',
    category: '勞動', serviceCategory: '求職及就業', datasetType: '原始資料', updateFrequency: '每3月',
    inputFile: basename(inputPath), convertedAt: new Date().toISOString(), fileSize: fileInfo.size, encoding,
    inputRows: rows.length, outputRecords: records.length, duplicateKeys,
    recordsWithoutPhone: summary.recordsMissingPhone,
    recordsWithoutChairpersonName: summary.recordsMissingChairpersonName,
    taipeiAddressCount: summary.taipeiAddressCount,
    nonTaipeiAddressCount: summary.nonTaipeiAddressCount,
    postalBoxOrUnparsedAddressCount: summary.postalBoxOrUnparsedAddressCount,
    addressWarningExamples: addressWarnings, phoneWarningExamples: phoneWarnings, postalCodeWarningExamples: postalCodeWarnings,
    notes: ['CP950/Big5 decoded with UTF-8-SIG fallback', 'Strings and column names trimmed', 'Phone values preserved as source text', 'No geocoding used; Taipei addresses use district centroids only', 'Chairperson names are preserved but shown only in source details'],
  };
  await mkdir(outputDir, { recursive: true });
  await Promise.all([
    writeFile(join(outputDir, 'registered-labor-unions.json'), JSON.stringify(records)),
    writeFile(join(outputDir, 'registered-labor-union-summary.json'), JSON.stringify(summary)),
    writeFile(reportPath, JSON.stringify({ ...report, registeredLaborUnions }, null, 2)),
  ]);
  console.log(`Converted ${records.length} registered labor union records from ${basename(inputPath)}.`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await convertRegisteredLaborUnions(process.argv.find((arg) => arg.startsWith('--file='))?.slice(7));
}
