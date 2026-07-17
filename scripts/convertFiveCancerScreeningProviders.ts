import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { parseCsv } from './convertCivicGroups';

type Availability = boolean | null;
const rawDir = join(process.cwd(), 'data/raw/five-cancer-screening-providers');
const outputDir = join(process.cwd(), 'public/data/five-cancer-screening-providers');
const reportPath = join(process.cwd(), 'public/data/conversion-report.json');
const districtByCode: Record<string, string> = {
  '63000010': '松山區', '63000020': '信義區', '63000030': '大安區', '63000040': '中山區',
  '63000050': '中正區', '63000060': '大同區', '63000070': '萬華區', '63000080': '文山區',
  '63000090': '南港區', '63000100': '內湖區', '63000110': '士林區', '63000120': '北投區',
};
const services = [
  ['cervicalCancerScreeningRaw', '子宮頸癌篩檢', 'hasCervicalCancerScreening', '子宮頸癌篩檢'],
  ['oralCancerScreeningRaw', '口腔癌篩檢', 'hasOralCancerScreening', '口腔癌篩檢'],
  ['colorectalCancerScreeningRaw', '大腸癌篩檢', 'hasColorectalCancerScreening', '大腸癌篩檢'],
  ['breastCancerScreeningRaw', '乳癌篩檢', 'hasBreastCancerScreening', '乳癌篩檢'],
  ['lungCancerScreeningRaw', '肺癌篩檢', 'hasLungCancerScreening', '肺癌篩檢'],
] as const;
const clean = (value?: string) => value?.replace(/\s+/g, ' ').trim() ?? '';
const availability = (value: string): Availability => {
  const normalized = clean(value).toUpperCase();
  if (['Y', 'YES', '是', '有', 'V', '1', '○', '√'].includes(normalized)) return true;
  if (['N', 'NO', '否', '無', '0', 'X', '×'].includes(normalized)) return false;
  return null;
};
const decode = (bytes: Uint8Array) => {
  for (const [encoding, label] of [['utf-8', 'UTF-8-SIG / UTF-8'], ['big5', 'CP950 / Big5-compatible']] as const) {
    try { return { text: new TextDecoder(encoding, { fatal: true }).decode(bytes).replace(/^\uFEFF/, ''), encoding: label }; } catch { /* try next encoding */ }
  }
  throw new Error('Unable to decode CSV as UTF-8-SIG, Big5, or CP950-compatible text.');
};

const { text, encoding } = decode(await readFile(join(rawDir, 'source.csv')));
const [rawHeaders, ...rows] = parseCsv(text);
const headers = rawHeaders.map(header => clean(header));
const valueFor = (row: string[], header: string) => clean(row[headers.indexOf(header)]);
const duplicates: string[] = [], missingInstitutions: string[] = [], malformedPhones: string[] = [], unknownDistricts: string[] = [], unmappedScreeningValues: Array<{ id: string; field: string; value: string }> = [];
const seen = new Set<string>();
const records: Array<Record<string, unknown>> = [];

for (const row of rows) {
  const districtCode = valueFor(row, '行政區');
  const institutionCode = valueFor(row, '醫事機構代碼');
  const institutionName = valueFor(row, '院所名稱');
  const address = valueFor(row, '地址');
  const phone = valueFor(row, '聯絡電話');
  const id = institutionCode || `${institutionName}|${address}`;
  const duplicateKey = `${institutionCode}|${institutionName}|${address}`;
  if (seen.has(duplicateKey)) { duplicates.push(id); continue; }
  seen.add(duplicateKey);
  if (!institutionName) missingInstitutions.push(id);
  if (!districtByCode[districtCode]) unknownDistricts.push(districtCode || id);
  if (phone && !/^[+()\-\s\d#]+$/.test(phone)) malformedPhones.push(id);
  const record: Record<string, unknown> = {
    id, districtName: districtByCode[districtCode] ?? districtCode, institutionCode, institutionName, address, phone,
    reminder: valueFor(row, '貼心小提醒'), googleMapsQuery: [institutionName, address].filter(Boolean).join(' '),
  };
  for (const [rawKey, sourceField, flagKey] of services) {
    const raw = valueFor(row, sourceField), flag = availability(raw);
    record[rawKey] = raw; record[flagKey] = flag;
    if (raw && flag === null) unmappedScreeningValues.push({ id, field: sourceField, value: raw });
  }
  record.screeningTypes = services.filter(([, , flagKey]) => record[flagKey] === true).map(([, , , label]) => label);
  record.screeningTypeCount = (record.screeningTypes as string[]).length;
  records.push(record);
}

await mkdir(outputDir, { recursive: true });
await writeFile(join(outputDir, 'records.json'), JSON.stringify(records));
await writeFile(join(outputDir, 'conversion-report.json'), JSON.stringify({ source: '臺北市五癌篩檢醫療院所', encoding, sourceFields: headers, recordCount: records.length, duplicates, missingInstitutions, malformedPhones, unknownDistricts, unmappedScreeningValues }, null, 2));
console.log(`Converted ${records.length} five-cancer screening provider records (${encoding}).`);
