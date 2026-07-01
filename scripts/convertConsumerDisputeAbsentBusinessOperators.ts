import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { parseCsv } from './convertCivicGroups';
import { normalizeColumnName } from '../src/lib/civicGroups';
import {
  buildConsumerDisputeAbsentBusinessOperatorSummary, cleanText, normalizePartyName, normalizeRecordText,
  parseConsumerDisputeContent, parseResourceYearFromName, parseRocYear, parseTaiwanDate,
} from '../src/lib/consumerDisputeAbsentBusinessOperators';
import type { ConsumerDisputeAbsentBusinessOperatorRecord } from '../src/types';

const rawDir = join(process.cwd(), 'data/raw/consumer-dispute-absent-business-operators');
const outputDir = join(process.cwd(), 'public/data');
const reportPath = join(outputDir, 'conversion-report.json');
const source = '臺北市消費爭議無故不到場協商之被申訴企業經營者列表';
const sourceAgency = '臺北市政府法務局';
const keyPart = (value: unknown) => normalizeRecordText(value) ?? '';

function decodeCsv(bytes: Uint8Array) {
  try { return { text: new TextDecoder('utf-8', { fatal: true }).decode(bytes).replace(/^\uFEFF/, ''), encoding: 'UTF-8-SIG / UTF-8' }; }
  catch { return { text: new TextDecoder('big5', { fatal: true }).decode(bytes).replace(/^\uFEFF/, ''), encoding: 'CP950 / Big5-compatible' }; }
}
async function filesFromMetadata() {
  const metadata = await readFile(join(rawDir, 'fetch-metadata.json'), 'utf8').then(JSON.parse).catch(() => undefined);
  if (metadata?.resources?.length) return metadata.resources.map((item: { fileName: string; resourceName: string }) => item);
  return (await readdir(rawDir)).filter((file) => file.toLowerCase().endsWith('.csv')).map((file) => ({ fileName: file, resourceName: basename(file, '.csv') }));
}

export async function convertConsumerDisputeAbsentBusinessOperators() {
  const resources = await filesFromMetadata();
  if (!resources.length) throw new Error('No consumer dispute absence CSV found. Run npm run data:fetch:consumer-dispute-absence.');
  const invalidYears: string[] = [], invalidDates: string[] = [], duplicateKeys: string[] = [];
  const seen = new Set<string>(), records: ConsumerDisputeAbsentBusinessOperatorRecord[] = [], resourceReports = [];

  for (const resource of resources) {
    const inputPath = join(rawDir, resource.fileName), file = await stat(inputPath);
    const { text, encoding } = decodeCsv(await readFile(inputPath));
    const [rawHeaders, ...rows] = parseCsv(text);
    if (!rawHeaders) continue;
    const headers = rawHeaders.map(normalizeColumnName);
    const missing = ['年度', '被申訴人', '申訴人', '協商日', '爭議內容'].filter((header) => !headers.includes(header));
    if (missing.length) throw new Error(`${resource.fileName} missing columns ${missing.join(', ')}`);
    const resourceYear = parseResourceYearFromName(resource.resourceName);
    let outputRows = 0;
    rows.forEach((row) => {
      const values = Object.fromEntries(headers.map((header, column) => [header, cleanText(row[column])]));
      const respondentName = cleanText(values['被申訴人']);
      if (!respondentName) return;
      const year = parseRocYear(values['年度']), date = parseTaiwanDate(values['協商日']);
      if (year.warning && invalidYears.length < 20) invalidYears.push(`${resource.resourceName}: ${year.yearRaw}`);
      if (date.warning && invalidDates.length < 20) invalidDates.push(`${resource.resourceName}: ${date.raw}`);
      const complainantName = cleanText(values['申訴人']);
      const dispute = parseConsumerDisputeContent(values['爭議內容']);
      const yearFromSource = year.year, yearFromNegotiationDate = date.year;
      const yearMismatch = Boolean(yearFromSource && yearFromNegotiationDate && yearFromSource !== yearFromNegotiationDate);
      const primaryKey = [resource.resourceName, year.year, respondentName, complainantName, date.raw, dispute.disputeContent].map(keyPart).join('|');
      const fallbackKey = [year.yearRaw, respondentName, date.raw, dispute.disputeContent].map(keyPart).join('|');
      const dedupeKey = primaryKey || fallbackKey;
      if (seen.has(dedupeKey)) {
        if (duplicateKeys.length < 20) duplicateKeys.push(dedupeKey);
        return;
      }
      seen.add(dedupeKey);
      const sourceRecordHash = createHash('sha1').update(dedupeKey).digest('hex');
      records.push({
        id: sourceRecordHash.slice(0, 12), module: 'consumer_dispute_absent_business_operators',
        resourceName: resource.resourceName, ...resourceYear, yearRaw: year.yearRaw, rocYear: year.rocYear, year: year.year,
        respondentName, respondentNameNormalized: normalizePartyName(respondentName),
        complainantName, complainantNameNormalized: normalizePartyName(complainantName), hasComplainantName: Boolean(complainantName),
        negotiationDateRaw: date.raw, negotiationDate: date.date, negotiationYear: date.year, negotiationMonth: date.month, negotiationMonthKey: date.monthKey, negotiationQuarter: date.quarter,
        yearFromSource, yearFromNegotiationDate, yearMismatch, ...dispute, hasDisputeContent: Boolean(dispute.disputeContent),
        possibleBusinessRegistrationHint: /公司|有限公司|商行|企業|工作室|股份/.test(respondentName) ? respondentName : undefined,
        sourceRecordHash, source, sourceAgency,
      });
      outputRows += 1;
    });
    resourceReports.push({ resourceName: resource.resourceName, inputFile: resource.fileName, fileSize: file.size, encoding, inputRows: rows.length, outputRecords: outputRows });
  }

  const summary = buildConsumerDisputeAbsentBusinessOperatorSummary(records);
  const latest = records.filter((record) => record.year === summary.maxYear).sort((a, b) => (b.negotiationDate ?? '').localeCompare(a.negotiationDate ?? ''));
  let report = {};
  try { report = JSON.parse(await readFile(reportPath, 'utf8')); } catch { /* first conversion */ }
  const consumerDisputeAbsentBusinessOperators = {
    source, sourceAgency: '法務局', sourcePage: 'https://data.taipei/dataset/detail?id=c15e49fd-f511-46c8-8613-0ad91f370bfd',
    category: '法律', serviceCategory: '公共資訊', datasetType: '原始資料', updateFrequency: '每1年',
    convertedAt: new Date().toISOString(), resources: resourceReports, outputRecords: records.length,
    invalidYearExamples: invalidYears, invalidDateExamples: invalidDates, duplicateKeys,
    notes: ['UTF-8-SIG decoded with Big5 fallback', 'All values read as strings and trimmed', 'Resource names preserved', 'ROC years and negotiation dates parsed', 'Duplicate rows deduped by year/respondent/complainant/date/content', 'No coordinates, geocoding, map markers, or company registration matching created'],
  };
  await mkdir(outputDir, { recursive: true });
  await Promise.all([
    writeFile(join(outputDir, 'consumer-dispute-absent-business-operators.json'), JSON.stringify(records)),
    writeFile(join(outputDir, 'consumer-dispute-absent-business-operator-summary.json'), JSON.stringify(summary)),
    writeFile(join(outputDir, 'consumer-dispute-absent-business-operator-latest.json'), JSON.stringify(latest)),
    writeFile(reportPath, JSON.stringify({ ...report, consumerDisputeAbsentBusinessOperators }, null, 2)),
  ]);
  console.log(`Converted ${records.length} consumer dispute absence records from ${resources.length} resource(s).`);
}

if (import.meta.url === `file://${process.argv[1]}`) await convertConsumerDisputeAbsentBusinessOperators();
