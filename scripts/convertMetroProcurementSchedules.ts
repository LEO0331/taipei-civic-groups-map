import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { parseCsv } from './convertCivicGroups';
import {
  buildMetroProcurementSummary, classifyProcurementCaseKeywords, classifyProcurementSubjectCategory,
  parseBudgetOrTenderMethod, parseRocYearMonth,
} from '../src/lib/metroProcurement';
import { normalizeColumnName, normalizeText } from '../src/lib/civicGroups';
import type { MetroProcurementScheduleRecord } from '../src/types';

const rawDir = join(process.cwd(), 'data/raw/metro-procurement-schedules');
const outputDir = join(process.cwd(), 'public/data');
const reportPath = join(outputDir, 'conversion-report.json');
const source = '臺北捷運公司採購案件預定招標時程資訊';
const sourceAgency = '臺北大眾捷運股份有限公司';

function decodeCsv(bytes: Uint8Array) {
  try {
    return { text: new TextDecoder('utf-8', { fatal: true }).decode(bytes).replace(/^\uFEFF/, ''), encoding: 'UTF-8 / UTF-8-SIG' };
  } catch {
    return { text: new TextDecoder('big5', { fatal: true }).decode(bytes), encoding: 'CP950 / Big5-compatible' };
  }
}

const files = (await readdir(rawDir)).filter((file) => file.toLowerCase().endsWith('.csv')).sort();
if (!files.length) throw new Error('No metro procurement CSV files found. Run npm run data:fetch:metro-procurement.');

const periodWarnings: string[] = [];
const budgetSchemaWarnings: string[] = [];
const duplicateExamples: string[] = [];
let periodWarningCount = 0;
let budgetSchemaWarningCount = 0;
let duplicateCount = 0;
const sourceFiles = [];
const recordsByKey = new Map<string, MetroProcurementScheduleRecord>();
let inputRows = 0;

for (const file of files) {
  const inputPath = join(rawDir, file);
  const { text, encoding } = decodeCsv(await readFile(inputPath));
  const [rawHeaders, ...rows] = parseCsv(text);
  if (!rawHeaders) continue;
  const headers = rawHeaders.map(normalizeColumnName);
  const required = ['序號/編號', '標案名稱', '預算金額', '標的分類', '統計期_民國年月'];
  const missing = required.filter((header) => !headers.includes(header));
  if (missing.length) throw new Error(`${file}: missing columns ${missing.join(', ')}`);
  inputRows += rows.length;
  sourceFiles.push({ fileName: file, encoding, fileSize: (await stat(inputPath)).size, inputRows: rows.length });

  rows.forEach((row) => {
    const values = Object.fromEntries(headers.map((header, column) => [header, normalizeText(row[column])]));
    const caseName = values['標案名稱'];
    if (!caseName) return;
    const sourceSequenceNumber = Number(values['序號/編號']);
    const period = parseRocYearMonth(values['統計期_民國年月']);
    const budget = parseBudgetOrTenderMethod(values['預算金額']);
    if (period.warning) {
      periodWarningCount += 1;
      if (periodWarnings.length < 20) periodWarnings.push(`${file}: ${period.periodRocYearMonth}`);
    }
    if (budget.warning) {
      budgetSchemaWarningCount += 1;
      if (budgetSchemaWarnings.length < 20) budgetSchemaWarnings.push(`${file}: ${budget.budgetAmountRaw}`);
    }
    const key = `${period.periodKey ?? period.periodRocYearMonth}|${Number.isFinite(sourceSequenceNumber) ? sourceSequenceNumber : ''}|${caseName.trim()}`;
    if (recordsByKey.has(key)) {
      duplicateCount += 1;
      if (duplicateExamples.length < 20) duplicateExamples.push(key);
      return;
    }
    recordsByKey.set(key, {
      id: createHash('sha1').update(key).digest('hex').slice(0, 12),
      module: 'metro_procurement_schedule',
      sourceFileName: file,
      sourceSequenceNumber: Number.isFinite(sourceSequenceNumber) ? sourceSequenceNumber : undefined,
      caseName,
      budgetAmountRaw: budget.budgetAmountRaw,
      budgetAmountNtd: budget.budgetAmountNtd,
      tenderMethodRaw: budget.tenderMethodRaw,
      tenderMethod: budget.tenderMethod,
      subjectCategoryRaw: values['標的分類'],
      subjectCategory: classifyProcurementSubjectCategory(values['標的分類']),
      periodRocYearMonth: period.periodRocYearMonth,
      periodRocYear: period.periodRocYear,
      periodYear: period.periodYear,
      periodMonth: period.periodMonth,
      periodKey: period.periodKey,
      derivedKeywordGroups: classifyProcurementCaseKeywords(caseName),
      source,
      sourceAgency,
    });
  });
}

const records = [...recordsByKey.values()].sort((a, b) =>
  (b.periodKey ?? '').localeCompare(a.periodKey ?? '') || (a.sourceSequenceNumber ?? Infinity) - (b.sourceSequenceNumber ?? Infinity));
let report = {};
try { report = JSON.parse(await readFile(reportPath, 'utf8')); } catch { /* first conversion */ }
let fetchMetadata = {};
try { fetchMetadata = JSON.parse(await readFile(join(rawDir, 'fetch-metadata.json'), 'utf8')); } catch { /* local-only conversion */ }
const metroProcurementSchedules = {
  source, sourceAgency, sourcePage: 'https://data.taipei/dataset/detail?id=f4fd7f03-9bf6-41de-a003-02c437596570',
  convertedAt: new Date().toISOString(), sourceFiles, inputRows, outputRecords: records.length,
  duplicateCount, duplicateExamples,
  failedPeriodCount: periodWarningCount, failedPeriodExamples: periodWarnings,
  budgetSchemaWarningCount, budgetSchemaWarningExamples: budgetSchemaWarnings,
  fetch: fetchMetadata,
  notes: ['Strings and column names trimmed', 'UTF-8-SIG and CP950/Big5-compatible decoding supported', 'Raw budget field preserved', 'Tender method derived only from recognizable text'],
};
await mkdir(outputDir, { recursive: true });
await Promise.all([
  writeFile(join(outputDir, 'metro-procurement-schedules.json'), JSON.stringify(records)),
  writeFile(join(outputDir, 'metro-procurement-summary.json'), JSON.stringify(buildMetroProcurementSummary(records))),
  writeFile(reportPath, JSON.stringify({ ...report, metroProcurementSchedules }, null, 2)),
]);
console.log(`Converted ${records.length} metro procurement records from ${files.length} monthly CSV files.`);
