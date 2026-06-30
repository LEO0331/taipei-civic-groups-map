import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { parseCsv } from './convertCivicGroups';
import { TAIPEI_DISTRICT_CENTROIDS } from '../src/lib/civicGroups';
import {
  buildContractedVaccinationMedicalProviderSummary,
  cleanText,
  deriveVaccinationServiceItems,
  normalizeProviderName,
  normalizeTaipeiDistrict,
  parseHealthcareProviderPhone,
  parseVaccinationProviderAddress,
  parseVaccinationServiceFlag,
} from '../src/lib/contractedVaccinationMedicalProviders';
import type { ContractedVaccinationMedicalProviderRecord } from '../src/types';

const rawDir = join(process.cwd(), 'data/raw/contracted-vaccination-medical-providers');
const outputDir = join(process.cwd(), 'public/data');
const reportPath = join(outputDir, 'conversion-report.json');
const source = '臺北市各項預防接種合約醫療院所';
const sourceAgency = '臺北市政府衛生局';
const serviceColumns = ['卡介苗門診', '幼兒常規', '幼兒流感3歲以下', '幼兒流感3歲以上', '成人流感', 'COVID-19', '肺炎鏈球菌', '輪狀病毒', 'M痘門診', '腸病毒門診'];

function decodeCsv(bytes: Uint8Array) {
  try { return { text: new TextDecoder('utf-8', { fatal: true }).decode(bytes).replace(/^\uFEFF/, ''), encoding: 'UTF-8-SIG / UTF-8' }; }
  catch { return { text: new TextDecoder('big5', { fatal: true }).decode(bytes).replace(/^\uFEFF/, ''), encoding: 'CP950 / Big5-compatible' }; }
}
const parseSequence = (raw: unknown) => {
  const text = cleanText(raw);
  return text && /^\d+$/.test(text) ? Number(text) : undefined;
};

export async function convertContractedVaccinationMedicalProviders(filePath?: string) {
  const csvFile = filePath ? undefined : (await readdir(rawDir)).find((file) => file.toLowerCase().endsWith('.csv'));
  if (!filePath && !csvFile) throw new Error('No contracted vaccination provider CSV found. Run npm run data:fetch:vaccination-providers.');
  const inputPath = filePath ?? join(rawDir, csvFile!);
  const { text, encoding } = decodeCsv(await readFile(inputPath));
  const [rawHeaders, ...rows] = parseCsv(text);
  if (!rawHeaders) throw new Error('Invalid contracted vaccination provider CSV: file is empty.');
  const headers = rawHeaders.map((header) => cleanText(header) ?? '');
  const required = ['序號', '行政區', '院所名稱', ...serviceColumns, '地址', '電話', '語音預約'];
  const missing = required.filter((header) => !headers.includes(header));
  if (missing.length) throw new Error(`Invalid contracted vaccination provider CSV: missing columns ${missing.join(', ')}.`);

  const duplicates: string[] = [], districtWarnings: string[] = [], addressWarnings: string[] = [], phoneWarnings: string[] = [], flagWarnings: string[] = [];
  const seen = new Set<string>();
  const records = rows.flatMap((row): ContractedVaccinationMedicalProviderRecord[] => {
    const values = Object.fromEntries(headers.map((header, column) => [header, cleanText(row[column])]));
    const providerName = values['院所名稱'];
    if (!providerName) return [];
    const sourceSequenceNumber = parseSequence(values['序號']);
    const sourceDistrict = normalizeTaipeiDistrict(values['行政區']);
    if (values['行政區'] && !sourceDistrict && districtWarnings.length < 20) districtWarnings.push(values['行政區']);
    const address = parseVaccinationProviderAddress(values['地址'], sourceDistrict);
    if (address.warning && addressWarnings.length < 20) addressWarnings.push(`${providerName}:${address.warning}`);
    const phone = parseHealthcareProviderPhone(values['電話']);
    if (phone.warning && phoneWarnings.length < 20) phoneWarnings.push(values['電話'] ?? '');
    const rawFlags = serviceColumns.flatMap((column) => {
      const value = values[column];
      return value && !/^(?:0|1|v|V|y|Y|是|有|○|●|否|無|n|N)$/.test(value) ? [`${column}:${value}`] : [];
    });
    flagWarnings.push(...rawFlags.slice(0, Math.max(0, 20 - flagWarnings.length)));
    const flags = {
      hasBcgClinic: parseVaccinationServiceFlag(values['卡介苗門診']),
      hasChildRoutineVaccination: parseVaccinationServiceFlag(values['幼兒常規']),
      hasChildFluUnder3: parseVaccinationServiceFlag(values['幼兒流感3歲以下']),
      hasChildFluOver3: parseVaccinationServiceFlag(values['幼兒流感3歲以上']),
      hasAdultFlu: parseVaccinationServiceFlag(values['成人流感']),
      hasCovid19: parseVaccinationServiceFlag(values['COVID-19']),
      hasPneumococcal: parseVaccinationServiceFlag(values['肺炎鏈球菌']),
      hasRotavirus: parseVaccinationServiceFlag(values['輪狀病毒']),
      hasMpoxClinic: parseVaccinationServiceFlag(values['M痘門診']),
      hasEnterovirusClinic: parseVaccinationServiceFlag(values['腸病毒門診']),
    };
    const serviceItems = deriveVaccinationServiceItems(flags);
    const key = sourceSequenceNumber ? String(sourceSequenceNumber) : `${normalizeProviderName(providerName)}|${address.addressNormalized ?? ''}|${phone.phone ?? ''}`;
    if (seen.has(key)) { if (duplicates.length < 20) duplicates.push(key); return []; }
    seen.add(key);
    const point = address.district ? TAIPEI_DISTRICT_CENTROIDS[address.district] : undefined;
    return [{
      id: createHash('sha1').update(key).digest('hex').slice(0, 12),
      module: 'contracted_vaccination_medical_providers',
      sourceSequenceNumber,
      providerName,
      providerNameNormalized: normalizeProviderName(providerName),
      district: address.district,
      districtNormalized: address.district,
      address: address.address,
      addressNormalized: address.addressNormalized,
      roadName: address.roadName,
      phone: phone.phone,
      phoneDisplay: phone.phoneDisplay,
      phoneDialHref: phone.phoneDialHref,
      phoneType: phone.phoneType,
      hasPhone: Boolean(phone.phone),
      voiceReservationRaw: values['語音預約'],
      hasVoiceReservation: Boolean(values['語音預約']),
      bcgClinicRaw: values['卡介苗門診'],
      childRoutineRaw: values['幼兒常規'],
      childFluUnder3Raw: values['幼兒流感3歲以下'],
      childFluOver3Raw: values['幼兒流感3歲以上'],
      adultFluRaw: values['成人流感'],
      covid19Raw: values['COVID-19'],
      pneumococcalRaw: values['肺炎鏈球菌'],
      rotavirusRaw: values['輪狀病毒'],
      mpoxClinicRaw: values['M痘門診'],
      enterovirusClinicRaw: values['腸病毒門診'],
      ...flags,
      serviceItems,
      serviceItemCount: serviceItems.length,
      hasAnyChildVaccinationService: serviceItems.some((item) => ['child_routine', 'child_flu_under_3', 'child_flu_over_3', 'rotavirus', 'bcg_clinic'].includes(item)),
      hasAnyAdultVaccinationService: serviceItems.some((item) => ['adult_flu', 'covid_19', 'pneumococcal', 'mpox_clinic'].includes(item)),
      hasAnySpecialClinicService: serviceItems.some((item) => ['bcg_clinic', 'mpox_clinic', 'enterovirus_clinic'].includes(item)),
      hasAnyFluService: serviceItems.some((item) => ['child_flu_under_3', 'child_flu_over_3', 'adult_flu'].includes(item)),
      hasAnyCovidService: serviceItems.includes('covid_19'),
      hasAnyReservationField: Boolean(values['語音預約']),
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
  const summary = buildContractedVaccinationMedicalProviderSummary(records);
  const contractedVaccinationMedicalProviders = {
    source, sourceAgency, officialSourceAgencyShort: '衛生局',
    sourcePage: 'https://data.taipei/dataset/detail?id=ec201f0a-2efa-4426-9439-a8daea7b33c7',
    category: '醫療', serviceCategory: '就醫', datasetType: '原始資料', updateFrequency: '不定期更新',
    inputFile: basename(inputPath), convertedAt: new Date().toISOString(), fileSize: fileInfo.size, encoding,
    inputRows: rows.length, outputRecords: records.length, duplicateKeys: duplicates,
    districtWarningExamples: districtWarnings, addressWarningExamples: addressWarnings, phoneWarningExamples: phoneWarnings, flagWarningExamples: flagWarnings,
    notes: ['UTF-8-SIG decoded with Big5 fallback', 'Strings and column names trimmed', 'Service flags converted to filterable service items', 'Phone and voice reservation values preserved as source text', 'No geocoding used; records use district centroids only when district is parsed', 'This is not appointment, stock, eligibility, medical-advice, quality, ranking, or endorsement data'],
    topServiceItem: summary.byServiceItem[0],
  };
  await mkdir(outputDir, { recursive: true });
  await Promise.all([
    writeFile(join(outputDir, 'contracted-vaccination-medical-providers.json'), JSON.stringify(records)),
    writeFile(join(outputDir, 'contracted-vaccination-medical-provider-summary.json'), JSON.stringify(summary)),
    writeFile(reportPath, JSON.stringify({ ...report, contractedVaccinationMedicalProviders }, null, 2)),
  ]);
  console.log(`Converted ${records.length} contracted vaccination provider records from ${basename(inputPath)}.`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await convertContractedVaccinationMedicalProviders(process.argv.find((arg) => arg.startsWith('--file='))?.slice(7));
}
