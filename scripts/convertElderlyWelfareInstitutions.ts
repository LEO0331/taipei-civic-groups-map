import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { parseCsv } from './convertCivicGroups';
import {
  buildElderlyWelfareInstitutionSummary,
  classifyElderlyWelfareInstitutionAttribute,
  cleanText,
  createElderlyWelfareInstitutionMapQuery,
  deriveBedCountConsistency,
  ELDERLY_CARE_LABELS_ZH,
  normalizeTaipeiDistrict,
  normalizeText,
  parseBedCount,
  parseElderlyCareRecipientCategories,
  parseElderlyWelfareInstitutionAddress,
  parseElderlyWelfareInstitutionPhone,
  parseIntegerText,
} from '../src/lib/elderlyWelfareInstitutions';
import type { ElderlyWelfareInstitutionRecord } from '../src/types';

const rawDir = join(process.cwd(), 'data/raw/elderly-welfare-institutions');
const outputDir = join(process.cwd(), 'public/data');
const reportPath = join(outputDir, 'conversion-report.json');
const source = '臺北市老人福利機構名冊';
const sourceAgency = '臺北市政府社會局';

function decodeCsv(bytes: Uint8Array) {
  try { return { text: new TextDecoder('utf-8', { fatal: true }).decode(bytes).replace(/^\uFEFF/, ''), encoding: 'UTF-8-SIG / UTF-8' }; }
  catch { return { text: new TextDecoder('big5', { fatal: true }).decode(bytes).replace(/^\uFEFF/, ''), encoding: 'CP950 / Big5-compatible' }; }
}
const duplicateSamples = (values: string[]) => [...values.reduce((map, value) => map.set(value, (map.get(value) ?? 0) + 1), new Map<string, number>())].filter(([, count]) => count > 1).slice(0, 20).map(([value, count]) => ({ value, count }));

export async function convertElderlyWelfareInstitutions(filePath?: string) {
  const csvFile = filePath ? undefined : (await readdir(rawDir)).find((file) => file.toLowerCase().endsWith('.csv'));
  if (!filePath && !csvFile) throw new Error('No elderly welfare institution CSV found. Run npm run data:fetch:elderly-welfare.');
  const inputPath = filePath ?? join(rawDir, csvFile!);
  const { text, encoding } = decodeCsv(await readFile(inputPath));
  const [rawHeaders, ...rows] = parseCsv(text);
  if (!rawHeaders) throw new Error('Invalid elderly welfare institution CSV: file is empty.');
  const headers = rawHeaders.map((header) => cleanText(header) ?? '');
  const required = ['編號', '屬性', '機構名稱', '區域別', '地址', '電話', '收容對象', '核定總床位數量', '長照床位數量', '養護床位數量', '失智床位數量', '安養床位數量'];
  const missing = required.filter((header) => !headers.includes(header));
  if (missing.length) throw new Error(`Invalid elderly welfare institution CSV: missing columns ${missing.join(', ')}.`);

  const seen = new Set<string>(), duplicateKeys: string[] = [], addressWarnings: string[] = [], bedWarnings: string[] = [], phoneWarnings: string[] = [];
  const names: string[] = [], addresses: string[] = [], phones: string[] = [], fallbackKeys: string[] = [];
  const records = rows.flatMap((row): ElderlyWelfareInstitutionRecord[] => {
    const values = Object.fromEntries(headers.map((header, column) => [header, cleanText(row[column])]));
    const institutionName = values['機構名稱'];
    if (!institutionName) return [];
    const sourceSequenceNumber = parseIntegerText(values['編號']);
    const address = parseElderlyWelfareInstitutionAddress(values['地址']);
    const district = normalizeTaipeiDistrict(values['區域別'], address.addressNormalized);
    if (address.warning && addressWarnings.length < 20) addressWarnings.push(`${institutionName}:${address.warning}`);
    if (district && address.districtFromAddress && district !== address.districtFromAddress && addressWarnings.length < 20) addressWarnings.push(`${institutionName}:district mismatch ${district}/${address.districtFromAddress}`);
    const phone = parseElderlyWelfareInstitutionPhone(values['電話']);
    if (phone.phoneType === 'unknown' && phoneWarnings.length < 20) phoneWarnings.push(`${institutionName}:${phone.phone ?? ''}`);
    const careRecipientCategories = parseElderlyCareRecipientCategories(values['收容對象']);
    const approvedTotalBedCount = parseBedCount(values['核定總床位數量']);
    const longTermCareBedCount = parseBedCount(values['長照床位數量']);
    const nursingCareBedCount = parseBedCount(values['養護床位數量']);
    const dementiaCareBedCount = parseBedCount(values['失智床位數量']);
    const residentialCareBedCount = parseBedCount(values['安養床位數量']);
    const beds = deriveBedCountConsistency({ approvedTotalBedCount, longTermCareBedCount, nursingCareBedCount, dementiaCareBedCount, residentialCareBedCount });
    if (beds.warning && bedWarnings.length < 20) bedWarnings.push(`${institutionName}:${beds.warning}`);
    const fallbackKey = `${normalizeText(institutionName) ?? ''}|${district ?? ''}|${address.addressNormalized ?? ''}|${phone.phone ?? ''}`;
    const key = sourceSequenceNumber !== undefined ? String(sourceSequenceNumber) : fallbackKey;
    names.push(institutionName);
    if (address.addressNormalized) addresses.push(address.addressNormalized);
    if (phone.phone) phones.push(phone.phone);
    fallbackKeys.push(fallbackKey);
    if (seen.has(key)) { if (duplicateKeys.length < 20) duplicateKeys.push(key); return []; }
    seen.add(key);
    return [{
      id: createHash('sha1').update(key).digest('hex').slice(0, 12),
      module: 'elderly_welfare_institutions',
      sourceSequenceNumber,
      institutionAttributeRaw: values['屬性'],
      institutionAttribute: classifyElderlyWelfareInstitutionAttribute(values['屬性']),
      institutionAttributeNormalized: values['屬性'],
      institutionName,
      institutionNameNormalized: normalizeText(institutionName),
      district,
      districtNormalized: district,
      address: address.address,
      addressNormalized: address.addressNormalized,
      roadName: address.roadName,
      ...phone,
      hasPhone: phone.phoneType !== 'missing',
      careRecipientCategoryRaw: values['收容對象'],
      careRecipientCategories,
      careRecipientCategoryLabels: careRecipientCategories.map((item) => ELDERLY_CARE_LABELS_ZH[item]),
      approvedTotalBedCount,
      longTermCareBedCount,
      nursingCareBedCount,
      dementiaCareBedCount,
      residentialCareBedCount,
      hasLongTermCareBeds: (longTermCareBedCount ?? 0) > 0,
      hasNursingCareBeds: (nursingCareBedCount ?? 0) > 0,
      hasDementiaCareBeds: (dementiaCareBedCount ?? 0) > 0,
      hasResidentialCareBeds: (residentialCareBedCount ?? 0) > 0,
      ...beds,
      locationPrecision: address.address ? 'address_only' : 'missing',
      googleMapsQuery: createElderlyWelfareInstitutionMapQuery({ institutionName, address: address.addressNormalized ?? address.address }),
      source,
      sourceAgency,
    }];
  });

  const fileInfo = await stat(inputPath);
  const summary = buildElderlyWelfareInstitutionSummary(records);
  let report = {};
  try { report = JSON.parse(await readFile(reportPath, 'utf8')); } catch { /* first conversion */ }
  const elderlyWelfareInstitutions = {
    source, sourceAgency, officialSourceAgencyShort: '社會局',
    sourcePage: 'https://data.taipei/dataset/detail?id=d455b149-1a2f-4d5a-a9a8-315eb71f51f6',
    category: '社福', serviceCategory: '老年安養', datasetType: '網路服務', updateFrequency: '每1年',
    inputFile: basename(inputPath), convertedAt: new Date().toISOString(), fileSize: fileInfo.size, encoding,
    inputRows: rows.length, outputRecords: records.length, duplicateKeys,
    duplicateInstitutionNames: duplicateSamples(names), duplicateAddresses: duplicateSamples(addresses), duplicatePhones: duplicateSamples(phones), duplicateFallbackKeys: duplicateSamples(fallbackKeys),
    addressWarningExamples: addressWarnings, bedWarningExamples: bedWarnings, phoneWarningExamples: phoneWarnings,
    notes: ['UTF-8-SIG decoded with Big5 fallback', 'All values treated as strings before parsing', 'No coordinates provided; map uses district centroids only', 'Bed counts are source fields and not real-time vacancy data'],
    topDistrict: summary.byDistrict[0],
  };
  await mkdir(outputDir, { recursive: true });
  await Promise.all([
    writeFile(join(outputDir, 'elderly-welfare-institutions.json'), JSON.stringify(records)),
    writeFile(join(outputDir, 'elderly-welfare-institution-summary.json'), JSON.stringify(summary)),
    writeFile(reportPath, JSON.stringify({ ...report, elderlyWelfareInstitutions }, null, 2)),
  ]);
  console.log(`Converted ${records.length} elderly welfare institution records from ${basename(inputPath)}.`);
}

if (import.meta.url === `file://${process.argv[1]}`) await convertElderlyWelfareInstitutions(process.argv.find((arg) => arg.startsWith('--file='))?.slice(7));
