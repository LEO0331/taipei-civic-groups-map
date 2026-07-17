import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { parseCsv } from './convertCivicGroups';

const rawDir = join(process.cwd(), 'data/raw/fertility-subsidy-contracted-hospitals');
const outputDir = join(process.cwd(), 'public/data/fertility-subsidy-contracted-hospitals');
const districtByCode: Record<string, string> = {
  '6300100': '松山區', '6300200': '信義區', '6300300': '大安區', '6300400': '中山區', '6300500': '中正區', '6300600': '大同區',
  '6300700': '萬華區', '6300800': '文山區', '6300900': '南港區', '6301000': '內湖區', '6301100': '士林區', '6301200': '北投區',
};
const services = [
  ['malePreconceptionCheckRaw', '孕前健康檢查生理男性門診', 'hasMalePreconceptionCheck', '孕前健康檢查生理男性門診'],
  ['femalePreconceptionCheckRaw', '孕前健康檢查生理女性門診', 'hasFemalePreconceptionCheck', '孕前健康檢查生理女性門診'],
  ['amhTestRaw', '孕前健康檢查生理女性加選抗穆勒氏管荷爾蒙檢查AMH', 'hasAmhTest', 'AMH檢查'],
  ['firstTrimesterDownSyndromeScreeningRaw', '初期孕婦唐氏症篩檢', 'hasFirstTrimesterDownSyndromeScreening', '初期孕婦唐氏症篩檢'],
  ['secondTrimesterDownSyndromeScreeningRaw', '中期孕婦唐氏症篩檢', 'hasSecondTrimesterDownSyndromeScreening', '中期孕婦唐氏症篩檢'],
  ['niptRaw', '非侵入性胎兒染色體檢測NIPT', 'hasNipt', 'NIPT'],
  ['preeclampsiaScreeningRaw', '子癲前症篩檢', 'hasPreeclampsiaScreening', '子癲前症篩檢'],
] as const;
const clean = (value?: string) => value?.replace(/\s+/g, ' ').trim() ?? '';
const availability = (value: string): boolean | null => {
  const normalized = clean(value).toUpperCase();
  if (['Y', 'YES', '是', '有', 'V', '1', '○', '√'].includes(normalized)) return true;
  if (['N', 'NO', '否', '無', '0', 'X', '×'].includes(normalized)) return false;
  return null;
};
const decode = (bytes: Uint8Array) => { for (const [encoding, label] of [['utf-8', 'UTF-8-SIG / UTF-8'], ['big5', 'CP950 / Big5-compatible']] as const) try { return { text: new TextDecoder(encoding, { fatal: true }).decode(bytes).replace(/^\uFEFF/, ''), encoding: label }; } catch { /* try next encoding */ } throw new Error('Unsupported CSV encoding.'); };
const { text, encoding } = decode(await readFile(join(rawDir, 'source.csv')));
const [rawHeaders, ...rows] = parseCsv(text), headers = rawHeaders.map(clean), valueFor = (row: string[], header: string) => clean(row[headers.indexOf(header)]);
const duplicates: string[] = [], missingInstitutions: string[] = [], unknownDistricts: string[] = [], unmappedServiceValues: Array<{ id: string; field: string; value: string }> = [], skippedRows: number[] = [], seen = new Set<string>(), records: Array<Record<string, unknown>> = [];
for (const row of rows) {
  const id = valueFor(row, '編號'), districtCode = valueFor(row, '行政區'), institutionName = valueFor(row, '醫療機構'), districtName = districtByCode[districtCode] ?? districtCode;
  if (!id && !institutionName) { skippedRows.push(records.length + duplicates.length + skippedRows.length + 2); continue; }
  const serviceValues = services.map(([, source]) => valueFor(row, source)), key = `${institutionName}|${districtName}|${serviceValues.join('|')}`;
  if (seen.has(key)) { duplicates.push(id || key); continue; } seen.add(key);
  if (!institutionName) missingInstitutions.push(id || key); if (!districtByCode[districtCode]) unknownDistricts.push(districtCode || id);
  const record: Record<string, unknown> = { id: id || `${institutionName}|${districtName}`, districtName, institutionName };
  for (const [rawKey, source, flagKey] of services) { const raw = valueFor(row, source), flag = availability(raw); record[rawKey] = raw; record[flagKey] = flag; if (raw && flag === null) unmappedServiceValues.push({ id: String(record.id), field: source, value: raw }); }
  record.serviceTypes = services.filter(([, , flagKey]) => record[flagKey] === true).map(([, , , label]) => label); record.serviceTypeCount = (record.serviceTypes as string[]).length; records.push(record);
}
await mkdir(outputDir, { recursive: true });
await writeFile(join(outputDir, 'records.json'), JSON.stringify(records));
await writeFile(join(outputDir, 'conversion-report.json'), JSON.stringify({ source: '臺北市生育補助合約醫院', encoding, sourceFields: headers, recordCount: records.length, duplicates, missingInstitutions, unknownDistricts, unmappedServiceValues, skippedRows }, null, 2));
console.log(`Converted ${records.length} fertility-subsidy contracted hospital records (${encoding}).`);
