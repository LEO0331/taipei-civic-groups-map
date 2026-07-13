import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { parseCsv } from './convertCivicGroups';

const rawDirectory = join(process.cwd(), 'data/raw/diabetes-shared-care-medical-institutions');
const outputDirectory = join(process.cwd(), 'public/data/diabetes-shared-care-medical-institutions');
const reportPath = join(process.cwd(), 'public/data/conversion-report.json');
const districtByCode: Record<string, string> = {
  '63000010': '松山區', '63000020': '信義區', '63000030': '大安區', '63000040': '中山區',
  '63000050': '中正區', '63000060': '大同區', '63000070': '萬華區', '63000080': '文山區',
  '63000090': '南港區', '63000100': '內湖區', '63000110': '士林區', '63000120': '北投區',
};

function decodeCsv(bytes: Uint8Array) {
  try { return { text: new TextDecoder('utf-8', { fatal: true }).decode(bytes).replace(/^\uFEFF/, ''), encoding: 'UTF-8-SIG / UTF-8' }; }
  catch { return { text: new TextDecoder('big5', { fatal: true }).decode(bytes).replace(/^\uFEFF/, ''), encoding: 'CP950 / Big5-compatible' }; }
}
function clean(value?: string) { return value?.replace(/\s+/g, ' ').trim() || undefined; }
function normalize(value?: string) { return clean(value)?.replace(/[臺台]/g, '台').toLocaleLowerCase(); }
function districtFromAddress(address?: string) { return normalize(address)?.match(/(松山|信義|大安|中山|中正|大同|萬華|文山|南港|內湖|士林|北投)區/)?.[0]; }
function roadName(address?: string) { return clean(address)?.match(/(?:[^\s區]+?[路街大道巷弄])/u)?.[0]; }
function normalizePhone(phone?: string) { return clean(phone)?.replace(/[\s（）()－–—-]/g, ''); }

const bytes = await readFile(join(rawDirectory, 'records.csv'));
const { text, encoding } = decodeCsv(bytes);
const [rawHeaders, ...rows] = parseCsv(text);
const headers = rawHeaders.map((header) => clean(header) ?? '');
const duplicates: string[] = [];
const missingFields: string[] = [];
const unknownDistrictCodes: string[] = [];
const unknownDistricts: string[] = [];
const seen = new Set<string>();
const records = rows.flatMap((row, index) => {
  const values = Object.fromEntries(headers.map((header, columnIndex) => [header, clean(row[columnIndex])])) as Record<string, string | undefined>;
  const sourceSequenceNumber = values['序號'];
  const districtCode = values['行政區域代碼'];
  const institutionName = values['醫事機構名稱'];
  const address = values['醫事機構地址'];
  const phone = values['醫事機構電話'];
  if (!sourceSequenceNumber || !institutionName || !address) {
    missingFields.push(`row ${index + 2}`);
    return [];
  }
  const duplicateKey = `${normalize(institutionName)}|${normalize(address)}|${normalizePhone(phone)}`;
  if (seen.has(duplicateKey)) { duplicates.push(duplicateKey); return []; }
  seen.add(duplicateKey);
  const districtName = (districtCode && districtByCode[districtCode]) || districtFromAddress(address);
  if (districtCode && !districtByCode[districtCode]) unknownDistrictCodes.push(districtCode);
  if (!districtName) unknownDistricts.push(`row ${index + 2}`);
  return [{
    id: sourceSequenceNumber, module: 'diabetes_shared_care_medical_institutions', sourceSequenceNumber,
    districtCode, districtCodeNormalized: clean(districtCode), districtName, institutionName,
    institutionNameNormalized: normalize(institutionName), address, addressNormalized: normalize(address), roadName: roadName(address),
    phone, phoneNormalized: normalizePhone(phone), hasPhone: Boolean(phone), googleMapsQuery: clean(`${address} ${institutionName}`),
    source: '臺北市糖尿病共照網醫事機構名單', sourceAgency: '臺北市政府衛生局',
  }];
});
const byDistrict = new Map<string, number>();
records.forEach((record) => { if (record.districtName) byDistrict.set(record.districtName, (byDistrict.get(record.districtName) ?? 0) + 1); });
const summary = {
  totalRecords: records.length, districtCount: byDistrict.size,
  uniqueInstitutionNameCount: new Set(records.map((record) => record.institutionNameNormalized)).size,
  recordsWithPhone: records.filter((record) => record.hasPhone).length,
  recordsWithoutPhone: records.filter((record) => !record.hasPhone).length,
  byDistrict: [...byDistrict].map(([district, count]) => ({ district, count })).sort((a, b) => b.count - a.count),
};
await mkdir(outputDirectory, { recursive: true });
await writeFile(join(outputDirectory, 'records.json'), JSON.stringify(records));
await writeFile(join(outputDirectory, 'summary.json'), JSON.stringify(summary));
const priorReport = await readFile(reportPath, 'utf8').then(JSON.parse).catch(() => ({}));
await writeFile(reportPath, JSON.stringify({ ...priorReport, diabetesSharedCareMedicalInstitutions: {
  convertedAt: new Date().toISOString(), encoding, headers, outputRecords: records.length, duplicates, missingFields,
  unknownDistrictCodes: [...new Set(unknownDistrictCodes)], unknownDistricts,
  notes: ['UTF-8-SIG decoded with Big5 / CP950 fallback.', 'District is resolved from the official code before address fallback.', 'No official coordinates supplied; no exact markers or geocoding created.'],
} }, null, 2));
console.log(`Converted ${records.length} diabetes shared-care institutions.`);
