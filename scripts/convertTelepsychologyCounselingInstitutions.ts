import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { parseCsv } from './convertCivicGroups';
import { TAIPEI_DISTRICT_CENTROIDS } from '../src/lib/civicGroups';
import {
  buildTelepsychologyCounselingInstitutionSummary,
  cleanText,
  classifyTelepsychologyInstitutionType,
  deriveTelepsychologyContactMethods,
  normalizeInstitutionName,
  parseDistrictCode,
  parseIntegerText,
  parseTelepsychologyAddress,
  parseTelepsychologyExtension,
  parseTelepsychologyMobile,
  parseTelepsychologyPhone,
} from '../src/lib/telepsychologyCounselingInstitutions';
import type { TelepsychologyCounselingInstitutionRecord } from '../src/types';

const rawDir = join(process.cwd(), 'data/raw/telepsychology-counseling-institutions');
const outputDir = join(process.cwd(), 'public/data');
const reportPath = join(outputDir, 'conversion-report.json');
const source = '臺北市可執行通訊心理諮商之心理機構';
const sourceAgency = '臺北市政府衛生局';

function decodeCsv(bytes: Uint8Array) {
  try { return { text: new TextDecoder('big5', { fatal: true }).decode(bytes).replace(/^\uFEFF/, ''), encoding: 'CP950 / Big5-compatible' }; }
  catch { return { text: new TextDecoder('utf-8', { fatal: true }).decode(bytes).replace(/^\uFEFF/, ''), encoding: 'UTF-8-SIG / UTF-8' }; }
}

const duplicateSamples = (values: string[]) => [...values.reduce((map, value) => map.set(value, (map.get(value) ?? 0) + 1), new Map<string, number>())].filter(([, count]) => count > 1).slice(0, 20).map(([value, count]) => ({ value, count }));

export async function convertTelepsychologyCounselingInstitutions(filePath?: string) {
  const csvFile = filePath ? undefined : (await readdir(rawDir)).find((file) => file.toLowerCase().endsWith('.csv'));
  if (!filePath && !csvFile) throw new Error('No telepsychology counseling institution CSV found. Run npm run data:fetch:telepsychology.');
  const inputPath = filePath ?? join(rawDir, csvFile!);
  const { text, encoding } = decodeCsv(await readFile(inputPath));
  const [rawHeaders, ...rows] = parseCsv(text);
  if (!rawHeaders) throw new Error('Invalid telepsychology counseling institution CSV: file is empty.');
  const headers = rawHeaders.map((header) => cleanText(header) ?? '');
  const required = ['序號', '機構類型', '行政區', '機構名稱', '地址', '電話', '分機', '手機'];
  const missing = required.filter((header) => !headers.includes(header));
  if (missing.length) throw new Error(`Invalid telepsychology counseling institution CSV: missing columns ${missing.join(', ')}.`);

  const seen = new Set<string>(), duplicateKeys: string[] = [], addressWarnings: string[] = [], phoneWarnings: string[] = [], mobileWarnings: string[] = [];
  const rawNames: string[] = [], rawAddresses: string[] = [], fallbackKeys: string[] = [];
  const records = rows.flatMap((row): TelepsychologyCounselingInstitutionRecord[] => {
    const values = Object.fromEntries(headers.map((header, column) => [header, cleanText(row[column])]));
    const institutionName = values['機構名稱'];
    if (!institutionName) return [];
    const sourceSequenceNumber = parseIntegerText(values['序號']);
    const districtCodeRaw = parseDistrictCode(values['行政區']);
    const address = parseTelepsychologyAddress(values['地址'], districtCodeRaw);
    if (address.warning && addressWarnings.length < 20) addressWarnings.push(`${institutionName}:${address.warning}`);
    const phone = parseTelepsychologyPhone(values['電話']);
    if (phone.warning && phoneWarnings.length < 20) phoneWarnings.push(values['電話'] ?? '');
    const extension = parseTelepsychologyExtension(values['分機']);
    const mobile = parseTelepsychologyMobile(values['手機']);
    if (mobile.warning && mobileWarnings.length < 20) mobileWarnings.push(values['手機'] ?? '');
    const hasPhone = Boolean(phone.phone), hasExtension = Boolean(extension.extension), hasMobile = Boolean(mobile.mobile);
    const contactMethods = deriveTelepsychologyContactMethods({ hasPhone, hasExtension, hasMobile });
    const fallbackKey = `${normalizeInstitutionName(institutionName) ?? ''}|${address.addressNormalized ?? ''}|${phone.phone ?? ''}|${mobile.mobile ?? ''}`;
    const key = sourceSequenceNumber ? String(sourceSequenceNumber) : fallbackKey;
    rawNames.push(institutionName);
    if (address.addressNormalized) rawAddresses.push(address.addressNormalized);
    fallbackKeys.push(fallbackKey);
    if (seen.has(key)) { if (duplicateKeys.length < 20) duplicateKeys.push(key); return []; }
    seen.add(key);
    const point = address.district ? TAIPEI_DISTRICT_CENTROIDS[address.district] : undefined;
    return [{
      id: createHash('sha1').update(key).digest('hex').slice(0, 12),
      module: 'telepsychology_counseling_institutions',
      sourceSequenceNumber,
      institutionTypeRaw: values['機構類型'],
      institutionType: classifyTelepsychologyInstitutionType(values['機構類型']),
      districtCodeRaw,
      districtCode: districtCodeRaw,
      institutionName,
      institutionNameNormalized: normalizeInstitutionName(institutionName),
      district: address.district,
      districtNormalized: address.district,
      address: address.address,
      addressNormalized: address.addressNormalized,
      roadName: address.roadName,
      phone: phone.phone,
      phoneDisplay: phone.phoneDisplay,
      phoneDialHref: phone.phoneDialHref,
      phoneType: phone.phoneType,
      hasPhone,
      extension: extension.extension,
      extensionDisplay: extension.extensionDisplay,
      hasExtension,
      mobile: mobile.mobile,
      mobileDisplay: mobile.mobileDisplay,
      mobileDialHref: mobile.mobileDialHref,
      hasMobile,
      contactMethods,
      contactMethodCount: contactMethods.length,
      hasAnyContact: contactMethods.length > 0,
      locationPrecision: point ? 'district_centroid' : (address.address ? 'address_only' : 'missing'),
      latitude: point?.latitude,
      longitude: point?.longitude,
      source,
      sourceAgency,
    }];
  });

  const fileInfo = await stat(inputPath);
  let report = {};
  try { report = JSON.parse(await readFile(reportPath, 'utf8')); } catch { /* first conversion */ }
  const summary = buildTelepsychologyCounselingInstitutionSummary(records);
  const telepsychologyCounselingInstitutions = {
    source, sourceAgency, officialSourceAgencyShort: '衛生局',
    sourcePage: 'https://data.taipei/dataset/detail?id=428a78d5-867a-4e55-9630-040a89c8cd94',
    category: '醫療', serviceCategory: '公共資訊', datasetType: '原始資料', updateFrequency: '不定期更新',
    inputFile: basename(inputPath), convertedAt: new Date().toISOString(), fileSize: fileInfo.size, encoding,
    inputRows: rows.length, outputRecords: records.length, duplicateKeys,
    duplicateNames: duplicateSamples(rawNames), duplicateAddresses: duplicateSamples(rawAddresses), duplicateFallbackKeys: duplicateSamples(fallbackKeys),
    addressWarningExamples: addressWarnings, phoneWarningExamples: phoneWarnings, mobileWarningExamples: mobileWarnings,
    notes: ['CP950 / Big5-compatible decoded with UTF-8-SIG fallback', 'All CSV values treated as strings before parsing', 'Institution type, district code, address, road, phone, extension, and mobile values preserved or normalized for display', 'No geocoding used; records use district centroids only when district is parsed', 'This is not diagnosis, therapy recommendation, appointment availability, fee, insurance, crisis-service, quality, ranking, medical-advice, psychotherapy-advice, or endorsement data'],
    topDistrict: summary.byDistrict[0],
    topInstitutionType: summary.byInstitutionType[0],
  };
  await mkdir(outputDir, { recursive: true });
  await Promise.all([
    writeFile(join(outputDir, 'telepsychology-counseling-institutions.json'), JSON.stringify(records)),
    writeFile(join(outputDir, 'telepsychology-counseling-institution-summary.json'), JSON.stringify(summary)),
    writeFile(reportPath, JSON.stringify({ ...report, telepsychologyCounselingInstitutions }, null, 2)),
  ]);
  console.log(`Converted ${records.length} telepsychology counseling institution records from ${basename(inputPath)}.`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await convertTelepsychologyCounselingInstitutions(process.argv.find((arg) => arg.startsWith('--file='))?.slice(7));
}
