import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { parseCsv } from './convertCivicGroups';
import {
  buildBusinessPremisesPublicLiabilityInsuranceSummary,
  cleanText,
  classifyPublicLiabilityBusinessCategory,
  daysUntil,
  getPolicyExpiryStatus,
  normalizeBusinessName,
  parseBusinessPremisesAddress,
  parseBusinessPremisesCoordinates,
  parseIntegerText,
  parsePolicyExpiryDate,
  parseRegistrationNumber,
} from '../src/lib/businessPremisesPublicLiabilityInsurance';
import type { BusinessPremisesPublicLiabilityInsuranceRecord } from '../src/types';

const rawDir = join(process.cwd(), 'data/raw/business-premises-public-liability-insurance');
const outputDir = join(process.cwd(), 'public/data');
const reportPath = join(outputDir, 'conversion-report.json');
const source = '臺北市營業場所投保公共意外險清冊';
const sourceAgency = '臺北市政府產業發展局商業處';

function decodeCsv(bytes: Uint8Array) {
  try { return { text: new TextDecoder('utf-8', { fatal: true }).decode(bytes).replace(/^\uFEFF/, ''), encoding: 'UTF-8-SIG / UTF-8' }; }
  catch { return { text: new TextDecoder('big5', { fatal: true }).decode(bytes).replace(/^\uFEFF/, ''), encoding: 'CP950 / Big5-compatible' }; }
}
const duplicateSamples = (values: string[]) => [...values.reduce((map, value) => map.set(value, (map.get(value) ?? 0) + 1), new Map<string, number>())].filter(([, count]) => count > 1).slice(0, 20).map(([value, count]) => ({ value, count }));

export async function convertBusinessPremisesPublicLiabilityInsuranceRecords(filePath?: string) {
  const csvFile = filePath ? undefined : (await readdir(rawDir)).find((file) => file.toLowerCase().endsWith('.csv'));
  if (!filePath && !csvFile) throw new Error('No public liability insurance CSV found. Run npm run data:fetch:public-liability-insurance.');
  const inputPath = filePath ?? join(rawDir, csvFile!);
  const { text, encoding } = decodeCsv(await readFile(inputPath));
  const [rawHeaders, ...rows] = parseCsv(text);
  if (!rawHeaders) throw new Error('Invalid public liability insurance CSV: file is empty.');
  const headers = rawHeaders.map((header) => cleanText(header) ?? '');
  const lngHeader = headers.includes('經度') ? '經度' : 'Longitude';
  const latHeader = headers.includes('緯度') ? '緯度' : 'Latitude';
  const required = ['序號', '統一立案編號', '類別', '名稱', '營業地址', '保單到期日', lngHeader, latHeader];
  const missing = required.filter((header) => !headers.includes(header));
  if (missing.length) throw new Error(`Invalid public liability insurance CSV: missing columns ${missing.join(', ')}.`);

  const buildDate = new Date().toISOString().slice(0, 10);
  const seen = new Set<string>(), duplicateKeys: string[] = [], addressWarnings: string[] = [], dateWarnings: string[] = [], coordinateWarnings: string[] = [];
  const rawNames: string[] = [], rawAddresses: string[] = [], rawRegistrationNumbers: string[] = [], fallbackKeys: string[] = [];
  const records = rows.flatMap((row): BusinessPremisesPublicLiabilityInsuranceRecord[] => {
    const values = Object.fromEntries(headers.map((header, column) => [header, cleanText(row[column])]));
    const businessName = values['名稱'];
    if (!businessName) return [];
    const registrationNumber = parseRegistrationNumber(values['統一立案編號']);
    const businessAddress = parseBusinessPremisesAddress(values['營業地址']);
    if (businessAddress.warning && addressWarnings.length < 20) addressWarnings.push(`${businessName}:${businessAddress.warning}`);
    const expiry = parsePolicyExpiryDate(values['保單到期日']);
    if (expiry.warning && dateWarnings.length < 20) dateWarnings.push(`${businessName}:${values['保單到期日'] ?? ''}`);
    const coordinates = parseBusinessPremisesCoordinates(values[lngHeader], values[latHeader]);
    if (coordinates.warning && coordinateWarnings.length < 20) coordinateWarnings.push(`${businessName}:${coordinates.warning}:${values[lngHeader] ?? ''},${values[latHeader] ?? ''}`);
    const fallbackKey = `${normalizeBusinessName(businessName) ?? ''}|${businessAddress.businessAddressNormalized ?? ''}|${expiry.policyExpiryDateRaw ?? ''}`;
    const key = `${registrationNumber ?? ''}|${fallbackKey}`;
    rawNames.push(businessName);
    if (businessAddress.businessAddressNormalized) rawAddresses.push(businessAddress.businessAddressNormalized);
    if (registrationNumber) rawRegistrationNumbers.push(registrationNumber);
    fallbackKeys.push(fallbackKey);
    if (seen.has(key)) { if (duplicateKeys.length < 20) duplicateKeys.push(key); return []; }
    seen.add(key);
    const policyExpiryStatus = getPolicyExpiryStatus(expiry.policyExpiryDate, buildDate);
    return [{
      id: createHash('sha1').update(key).digest('hex').slice(0, 12),
      module: 'business_premises_public_liability_insurance_records',
      sourceSequenceNumber: parseIntegerText(values['序號']),
      registrationNumber,
      registrationNumberNormalized: registrationNumber,
      hasRegistrationNumber: Boolean(registrationNumber),
      businessCategoryRaw: values['類別'],
      businessCategory: classifyPublicLiabilityBusinessCategory(values['類別']),
      businessCategoryNormalized: values['類別'],
      businessName,
      businessNameNormalized: normalizeBusinessName(businessName),
      businessAddress: businessAddress.businessAddress,
      businessAddressNormalized: businessAddress.businessAddressNormalized,
      district: businessAddress.district,
      roadName: businessAddress.roadName,
      ...expiry,
      daysUntilPolicyExpiry: daysUntil(expiry.policyExpiryDate, buildDate),
      policyExpiryStatus,
      ...coordinates,
      hasCoordinates: coordinates.coordinateStatus === 'valid',
      source,
      sourceAgency,
    }];
  });

  const fileInfo = await stat(inputPath);
  let report = {};
  try { report = JSON.parse(await readFile(reportPath, 'utf8')); } catch { /* first conversion */ }
  const summary = buildBusinessPremisesPublicLiabilityInsuranceSummary(records);
  const businessPremisesPublicLiabilityInsuranceRecords = {
    source, sourceAgency, officialSourceAgencyShort: '產業局商業處',
    sourcePage: 'https://data.taipei/dataset/detail?id=5880bb98-ab6a-476c-ae55-37564b0d0fc9',
    category: '觀光', serviceCategory: '公共資訊', datasetType: '原始資料', updateFrequency: '每1月',
    inputFile: basename(inputPath), convertedAt: new Date().toISOString(), buildDate, fileSize: fileInfo.size, encoding,
    inputRows: rows.length, outputRecords: records.length, duplicateKeys,
    duplicateNames: duplicateSamples(rawNames), duplicateAddresses: duplicateSamples(rawAddresses), duplicateRegistrationNumbers: duplicateSamples(rawRegistrationNumbers), duplicateFallbackKeys: duplicateSamples(fallbackKeys),
    addressWarningExamples: addressWarnings, dateWarningExamples: dateWarnings, coordinateWarningExamples: coordinateWarnings,
    notes: ['UTF-8-SIG decoded with Big5 fallback', 'All CSV values treated as strings before parsing', 'Expiry status is calculated only from source policy expiry date and build date', 'Source coordinates validated against Taipei bounds; no geocoding used', 'This is not legal compliance, current coverage, claim eligibility, venue safety, legal-advice, insurance-advice, risk-ranking, or endorsement data'],
    topDistrict: summary.byDistrict[0],
    topBusinessCategory: summary.byBusinessCategory[0],
  };
  await mkdir(outputDir, { recursive: true });
  await Promise.all([
    writeFile(join(outputDir, 'business-premises-public-liability-insurance-records.json'), JSON.stringify(records)),
    writeFile(join(outputDir, 'business-premises-public-liability-insurance-summary.json'), JSON.stringify(summary)),
    writeFile(reportPath, JSON.stringify({ ...report, businessPremisesPublicLiabilityInsuranceRecords }, null, 2)),
  ]);
  console.log(`Converted ${records.length} public liability insurance records from ${basename(inputPath)}.`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await convertBusinessPremisesPublicLiabilityInsuranceRecords(process.argv.find((arg) => arg.startsWith('--file='))?.slice(7));
}
