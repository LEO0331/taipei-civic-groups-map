import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { parseCsv } from './convertCivicGroups';

const rawDir = join(process.cwd(), 'data/raw/senior-care-institution-evaluations');
const outputDir = join(process.cwd(), 'public/data/senior-care-institution-evaluations');
const districts = ['松山區', '信義區', '大安區', '中山區', '中正區', '大同區', '萬華區', '文山區', '南港區', '內湖區', '士林區', '北投區'];
const clean = (value?: string) => value?.replace(/\s+/g, ' ').trim() ?? '';
const normalizeResult = (value: string) => {
  const text = clean(value);
  if (!text) return 'not_evaluated';
  if (text.includes('優')) return 'excellent'; if (text.includes('甲')) return 'grade_a'; if (text.includes('乙')) return 'grade_b'; if (text.includes('丙')) return 'grade_c';
  if (text.includes('合格')) return 'qualified'; if (text.includes('不合格')) return 'unqualified'; if (text.includes('免評')) return 'exempt'; return 'unknown';
};
const decode = (bytes: Uint8Array) => { for (const [encoding, label] of [['utf-8', 'UTF-8-SIG / UTF-8'], ['big5', 'CP950 / Big5-compatible']] as const) try { return { text: new TextDecoder(encoding, { fatal: true }).decode(bytes).replace(/^\uFEFF/, ''), encoding: label }; } catch { /* next */ } throw new Error('Unsupported CSV encoding.'); };
const { text, encoding } = decode(await readFile(join(rawDir, 'source.csv')));
const [rawHeaders, ...rows] = parseCsv(text), headers = rawHeaders.map(clean), valueFor = (row: string[], header: string) => clean(row[headers.indexOf(header)]);
const duplicates: string[] = [], missingInstitutions: string[] = [], malformedPhones: string[] = [], unknownDistricts: string[] = [], unmappedEvaluationValues: Array<{ id: string; year: number; value: string }> = [], seen = new Set<string>(), records: Array<Record<string, unknown>> = [];
for (const row of rows) {
  const id = valueFor(row, '序號'), institutionName = valueFor(row, '機構名稱'), postalCode = valueFor(row, '郵遞區號'), address = valueFor(row, '地址'), phone = valueFor(row, '電話');
  if (!id && !institutionName) continue;
  const key = `${institutionName}|${address}|${phone}`; if (seen.has(key)) { duplicates.push(id || key); continue; } seen.add(key);
  if (!institutionName) missingInstitutions.push(id || key); const districtName = districts.find(district => address.includes(district)) ?? '';
  if (!districtName) unknownDistricts.push(id || key); if (phone && !/^[+()\-\s\d*#]+$/.test(phone)) malformedPhones.push(id || key);
  const evaluations = [104, 105, 106, 107, 108].map(rocYear => { const resultRaw = valueFor(row, `${rocYear}年評鑑成績`), resultNormalized = normalizeResult(resultRaw); if (resultRaw && resultNormalized === 'unknown') unmappedEvaluationValues.push({ id, year: rocYear, value: resultRaw }); return { rocYear, gregorianYear: rocYear + 1911, resultRaw, resultNormalized }; });
  const completed = evaluations.filter(evaluation => Boolean(evaluation.resultRaw)), latest = completed.at(-1);
  records.push({ id: id || `${institutionName}|${address}`, institutionName, postalCode, districtName, address, phone, evaluations, latestEvaluationYear: latest?.gregorianYear ?? null, latestEvaluationResult: latest?.resultRaw ?? '', latestEvaluationResultNormalized: latest?.resultNormalized ?? 'not_evaluated', evaluationCount: completed.length, hasPhone: Boolean(phone), googleMapsQuery: [institutionName, address].filter(Boolean).join(' ') });
}
await mkdir(outputDir, { recursive: true }); await writeFile(join(outputDir, 'records.json'), JSON.stringify(records)); await writeFile(join(outputDir, 'conversion-report.json'), JSON.stringify({ source: '臺北市老人安養暨長期照顧機構評鑑', encoding, sourceFields: headers, recordCount: records.length, duplicates, missingInstitutions, malformedPhones, unknownDistricts, unmappedEvaluationValues }, null, 2)); console.log(`Converted ${records.length} senior-care institution evaluation records (${encoding}).`);
