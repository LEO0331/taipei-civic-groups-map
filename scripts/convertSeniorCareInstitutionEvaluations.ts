import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { parseCsv } from './convertCivicGroups';

const rawPath = join(process.cwd(), 'data/raw/senior-care-institution-evaluations/source.csv');
const outputDirectory = join(process.cwd(), 'public/data/senior-care-institution-evaluations');
const clean = (value?: string) => value?.replace(/[ \t]+/g, ' ').trim() ?? '';
const districts = ['松山區', '信義區', '大安區', '中山區', '中正區', '大同區', '萬華區', '文山區', '南港區', '內湖區', '士林區', '北投區'];

function decodeCsv(bytes: Uint8Array) {
  try { return { text: new TextDecoder('utf-8', { fatal: true }).decode(bytes).replace(/^\uFEFF/, ''), encoding: 'UTF-8-SIG / UTF-8' }; }
  catch { return { text: new TextDecoder('big5', { fatal: true }).decode(bytes).replace(/^\uFEFF/, ''), encoding: 'CP950 / Big5-compatible' }; }
}

const { text, encoding } = decodeCsv(await readFile(rawPath));
const [rawHeaders, ...rows] = parseCsv(text);
const headers = rawHeaders.map(clean);
const requiredHeaders = ['序號', '機構名稱', '郵遞區號', '地址', '電話'];
const missingHeaders = requiredHeaders.filter((header) => !headers.includes(header));
if (missingHeaders.length) throw new Error(`Missing official source columns: ${missingHeaders.join(', ')}`);
const yearColumns = headers.flatMap((header) => {
  const match = header.match(/^(\d{3})年評鑑成績$/);
  return match ? [{ header, rocYear: Number(match[1]) }] : [];
}).sort((a, b) => a.rocYear - b.rocYear);
if (!yearColumns.length) throw new Error('No annual evaluation columns were found.');

const duplicateRows: string[] = [];
const missingInstitutionNames: string[] = [];
const missingAddresses: string[] = [];
const invalidPostalCodes: string[] = [];
const malformedPhones: string[] = [];
const unresolvedDistricts: string[] = [];
const unknownEvaluationResultCategories: Array<{ id: string; rocYear: number; resultRaw: string }> = [];
const noEvaluationResults: string[] = [];
const conflictingResults: Array<{ id: string; rocYear: number; values: string[] }> = [];
const seenRows = new Set<string>();
const resultLabels = new Set<string>();

const records = rows.flatMap((row, rowIndex) => {
  const sourceValues = Object.fromEntries(headers.map((header, index) => [header, clean(row[index])])) as Record<string, string>;
  const sourceSequenceNumber = sourceValues['序號'];
  const institutionName = sourceValues['機構名稱'];
  const postalCode = sourceValues['郵遞區號'];
  const address = sourceValues['地址'];
  const phone = sourceValues['電話'];
  const rowKey = headers.map((header) => sourceValues[header]).join('\u001F');
  const label = sourceSequenceNumber || `row ${rowIndex + 2}`;
  if (seenRows.has(rowKey)) { duplicateRows.push(label); return []; }
  seenRows.add(rowKey);
  if (!institutionName) missingInstitutionNames.push(label);
  if (!address) missingAddresses.push(label);
  if (postalCode && !/^\d{3,5}$/.test(postalCode)) invalidPostalCodes.push(label);
  if (phone && !/^[+()（）\-\s\d*#xXext.]+$/.test(phone)) malformedPhones.push(label);
  const districtName = districts.find((district) => address.includes(district)) ?? '';
  if (!districtName && address) unresolvedDistricts.push(label);
  const evaluations = yearColumns.map(({ header, rocYear }) => {
    const resultRaw = sourceValues[header];
    const sourceStatus = resultRaw ? 'recorded' : 'blank';
    if (resultRaw) resultLabels.add(resultRaw);
    return { rocYear, gregorianYear: rocYear + 1911, resultRaw, resultCategory: resultRaw || 'blank', sourceStatus };
  });
  const nonblank = evaluations.filter((evaluation) => evaluation.resultRaw);
  if (!nonblank.length) noEvaluationResults.push(label);
  const latest = nonblank.at(-1);
  const fallbackKey = `${institutionName}|${address}|${phone}|${rowKey}`;
  const id = createHash('sha256').update(fallbackKey).digest('hex').slice(0, 16);
  return [{
    id,
    sourceSequenceNumber,
    institutionName,
    postalCode,
    districtName,
    address,
    phone,
    hasAddress: Boolean(address),
    hasPhone: Boolean(phone),
    evaluations,
    latestEvaluationYear: latest?.gregorianYear ?? null,
    latestEvaluationResultRaw: latest?.resultRaw ?? '',
    latestEvaluationCategory: latest?.resultCategory ?? 'blank',
    googleMapsQuery: [institutionName, address].filter(Boolean).join(' '),
    sourceValues,
  }];
});

for (const record of records) {
  const years = new Map<number, Set<string>>();
  for (const evaluation of record.evaluations) {
    if (!evaluation.resultRaw) continue;
    const values = years.get(evaluation.rocYear) ?? new Set<string>();
    values.add(evaluation.resultRaw);
    years.set(evaluation.rocYear, values);
  }
  for (const [rocYear, values] of years) if (values.size > 1) conflictingResults.push({ id: record.id, rocYear, values: [...values] });
}

const by = (items: typeof records, key: (record: typeof records[number]) => string) => Object.entries(items.reduce((counts, record) => {
  const label = key(record); if (label) counts[label] = (counts[label] ?? 0) + 1; return counts;
}, {} as Record<string, number>)).map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
const summary = {
  totalInstitutions: records.length,
  districtsCovered: new Set(records.map((record) => record.districtName).filter(Boolean)).size,
  evaluationYears: yearColumns.map(({ rocYear }) => ({ rocYear, gregorianYear: rocYear + 1911 })),
  institutionsWithEvaluation: records.filter((record) => record.evaluations.some((evaluation) => evaluation.resultRaw)).length,
  institutionsEvaluatedInLatestYear: records.filter((record) => record.evaluations.some((evaluation) => evaluation.rocYear === yearColumns.at(-1)?.rocYear && evaluation.resultRaw)).length,
  recordsWithPhone: records.filter((record) => record.hasPhone).length,
  recordsWithAddress: records.filter((record) => record.hasAddress).length,
  byDistrict: by(records, (record) => record.districtName),
  latestResultCategories: Object.entries(records.reduce((counts, record) => {
    if (record.latestEvaluationResultRaw) counts[record.latestEvaluationCategory] = (counts[record.latestEvaluationCategory] ?? 0) + 1;
    return counts;
  }, {} as Record<string, number>)).map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count),
};

await mkdir(outputDirectory, { recursive: true });
await Promise.all([
  writeFile(join(outputDirectory, 'records.json'), JSON.stringify(records)),
  writeFile(join(outputDirectory, 'summary.json'), JSON.stringify(summary)),
  writeFile(join(outputDirectory, 'conversion-report.json'), JSON.stringify({
    source: '臺北市老人安養暨長期照顧機構評鑑成績',
    sourcePage: 'https://data.taipei/dataset/detail?id=2334ffb4-e17c-47d8-8091-4b974d576a06',
    encoding,
    sourceFields: headers,
    evaluationYearColumns: yearColumns,
    inputRows: rows.length,
    outputRecords: records.length,
    duplicateRows,
    missingInstitutionNames,
    missingAddresses,
    invalidPostalCodes,
    malformedPhones,
    unresolvedDistricts,
    unknownEvaluationResultCategories,
    knownSourceEvaluationResultLabels: [...resultLabels].sort(),
    duplicatedYearColumns: [...new Set(yearColumns.map((column) => column.rocYear).filter((year, index, all) => all.indexOf(year) !== index))],
    noEvaluationResults,
    conflictingResults,
    notes: ['UTF-8-SIG, Big5, and CP950 supported.', 'Source values are preserved as strings.', 'Evaluation categories preserve official result labels rather than imposing an ordinal scale.', 'Blank results are source states, not failures.', 'No official coordinates are supplied; no geocoding or exact map markers are created.'],
  }, null, 2)),
]);
console.log(`Converted ${records.length} senior welfare institution evaluation records (${encoding}).`);
