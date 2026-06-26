import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { parseCsv } from './convertCivicGroups';
import {
  classifyLaborPenaltyAmountBucket, classifyLaborViolationTopicTags, parsePenaltyAmount, parseRocDate,
  parseViolatedProvisions, parseViolationContents,
} from '../src/lib/laborStandardActViolations';
import { normalizeColumnName, normalizeText } from '../src/lib/civicGroups';
import type { LaborStandardActViolationManifest, LaborStandardActViolationRecord } from '../src/types';

const rawDir = join(process.cwd(), 'data/raw/labor-standard-act-violation-records');
const outputDir = join(process.cwd(), 'public/data/labor-standard-act-violation-records');
const reportPath = join(process.cwd(), 'public/data/conversion-report.json');
const source = '臺北市政府勞動局違反勞動基準法事業單位及事業主公布總表';
const sourceAgency = '臺北市政府勞動局';

function decodeCsv(bytes: Uint8Array) {
  try {
    return { text: new TextDecoder('utf-8', { fatal: true }).decode(bytes).replace(/^\uFEFF/, ''), encoding: 'UTF-8-SIG / UTF-8' };
  } catch {
    return { text: new TextDecoder('big5', { fatal: true }).decode(bytes).replace(/^\uFEFF/, ''), encoding: 'CP950 / Big5-compatible' };
  }
}

const keyPart = (value: string | undefined) => value?.trim().toLocaleLowerCase() ?? '';

export async function convertLaborStandardActViolationRecords(filePath?: string) {
  const csvFile = filePath ? undefined : (await readdir(rawDir)).find((file) => file.toLowerCase().endsWith('.csv'));
  if (!filePath && !csvFile) throw new Error('No labor violation CSV found. Run npm run data:fetch:labor-violations.');
  const inputPath = filePath ?? join(rawDir, csvFile!);
  const { text, encoding } = decodeCsv(await readFile(inputPath));
  const [rawHeaders, ...rows] = parseCsv(text);
  if (!rawHeaders) throw new Error('Invalid labor violation CSV: file is empty.');
  const headers = rawHeaders.map(normalizeColumnName);
  const required = ['公告日期', '處分日期', '處分字號', '事業單位或事業主之名稱', '負責人姓名', '違反勞動基準法條款', '違反法規內容', '罰鍰金額', '備註'];
  const missing = required.filter((header) => !headers.includes(header));
  if (missing.length) throw new Error(`Invalid labor violation CSV: missing columns ${missing.join(', ')}.`);
  const extraColumn = headers.findIndex((header, column) => column > headers.indexOf('備註') && (header === 'Unnamed: 9' || !header));
  const dateWarnings: string[] = [];
  const numericWarnings: string[] = [];
  const duplicateExamples: string[] = [];
  const seen = new Map<string, LaborStandardActViolationRecord>();
  const records: LaborStandardActViolationRecord[] = [];

  rows.forEach((row, index) => {
    const values = Object.fromEntries(headers.map((header, column) => [header, normalizeText(row[column])]));
    const businessOrEmployerName = values['事業單位或事業主之名稱'];
    if (!businessOrEmployerName) return;
    const announcement = parseRocDate(values['公告日期']);
    const disposition = parseRocDate(values['處分日期']);
    const penalty = parsePenaltyAmount(values['罰鍰金額']);
    const violatedProvisions = parseViolatedProvisions(values['違反勞動基準法條款']);
    const violationContents = parseViolationContents(values['違反法規內容']);
    if (announcement.warning && dateWarnings.length < 20) dateWarnings.push(`公告日期: ${announcement.raw}`);
    if (disposition.warning && dateWarnings.length < 20) dateWarnings.push(`處分日期: ${disposition.raw}`);
    if (penalty.warning && numericWarnings.length < 20) numericWarnings.push(values['罰鍰金額'] ?? '');
    const dispositionNumber = values['處分字號'];
    const primaryKey = `${keyPart(dispositionNumber)}|${keyPart(businessOrEmployerName)}|${keyPart(announcement.raw)}`;
    const fallbackKey = `${keyPart(businessOrEmployerName)}|${keyPart(disposition.raw)}|${keyPart(values['違反勞動基準法條款'])}|${keyPart(values['違反法規內容'])}`;
    const key = dispositionNumber ? primaryKey : fallbackKey;
    const record: LaborStandardActViolationRecord = {
      id: createHash('sha1').update(`${key}|${index}`).digest('hex').slice(0, 12),
      module: 'labor_standard_act_violation_records',
      announcementDateRaw: announcement.raw, announcementDate: announcement.isoDate, announcementYear: announcement.gregorianYear,
      announcementMonth: announcement.isoDate?.slice(0, 7),
      dispositionDateRaw: disposition.raw, dispositionDate: disposition.isoDate, dispositionYear: disposition.gregorianYear,
      dispositionMonth: disposition.isoDate?.slice(0, 7),
      dispositionNumber,
      businessOrEmployerName,
      responsiblePersonName: values['負責人姓名'],
      violatedProvisionsRaw: values['違反勞動基準法條款'],
      violatedProvisions,
      provisionCount: violatedProvisions.length,
      violationContentRaw: values['違反法規內容'],
      violationContents,
      violationContentCount: violationContents.length,
      violationTopicTags: classifyLaborViolationTopicTags(violatedProvisions, violationContents),
      penaltyAmountRaw: penalty.raw,
      penaltyAmountNtd: penalty.amountNtd,
      penaltyAmountBucket: classifyLaborPenaltyAmountBucket(penalty.amountNtd),
      note: values['備註'],
      sourceExtraNote: extraColumn >= 0 ? normalizeText(row[extraColumn]) : undefined,
      hasPenaltyAmount: penalty.amountNtd !== undefined,
      hasResponsiblePersonName: Boolean(values['負責人姓名']),
      hasNote: Boolean(values['備註']),
      hasSourceExtraNote: Boolean(extraColumn >= 0 && normalizeText(row[extraColumn])),
      source,
      sourceAgency,
    };
    const existing = seen.get(key);
    if (existing) {
      if (duplicateExamples.length < 20) duplicateExamples.push(key);
      const existingCompleteness = Object.values(existing).filter(Boolean).length;
      const recordCompleteness = Object.values(record).filter(Boolean).length;
      if (recordCompleteness > existingCompleteness) {
        records[records.findIndex((item) => item.id === existing.id)] = record;
        seen.set(key, record);
      }
      return;
    }
    seen.set(key, record);
    records.push(record);
  });

  const years = new Map<number, LaborStandardActViolationRecord[]>();
  records.forEach((record) => {
    if (!record.announcementYear) return;
    years.set(record.announcementYear, [...(years.get(record.announcementYear) ?? []), record]);
  });
  const fileInfo = await stat(inputPath);
  const chunks = [...years].map(([year, rowsForYear]) => ({ year, file: `chunks/by-announcement-year/${year}.json`, recordCount: rowsForYear.length })).sort((a, b) => a.year - b.year);
  const manifest: LaborStandardActViolationManifest = { years: chunks.map((chunk) => chunk.year), recordCount: records.length, chunks };
  let report = {};
  try { report = JSON.parse(await readFile(reportPath, 'utf8')); } catch { /* first conversion */ }
  const laborStandardActViolationRecords = {
    source, sourceAgency: '勞動局', sourcePage: 'https://data.taipei/dataset/detail?id=23630879-4926-4877-a48a-a0ae6cc2f7d5',
    category: '勞動', serviceCategory: '求職及就業', datasetType: '原始資料', updateFrequency: '每1月',
    inputFile: basename(inputPath), convertedAt: new Date().toISOString(), fileSize: fileInfo.size, encoding,
    inputRows: rows.length, outputRecords: records.length, chunkedByAnnouncementYear: true,
    invalidDateExamples: dateWarnings, invalidPenaltyAmountExamples: numericWarnings, duplicateExamples,
    warnings: extraColumn >= 0 ? ['Extra unnamed column detected and preserved as sourceExtraNote'] : [],
    notes: ['UTF-8-SIG decoded with Big5 fallback', 'Strings trimmed', 'Empty strings and NaN normalized', 'ROC dates parsed when valid', 'Missing penalty amounts are not treated as zero', 'No addresses or coordinates supplied; no map layer created'],
  };
  await mkdir(join(outputDir, 'chunks/by-announcement-year'), { recursive: true });
  await Promise.all([
    writeFile(join(outputDir, 'manifest.json'), JSON.stringify(manifest)),
    ...chunks.map((chunk) => writeFile(join(outputDir, chunk.file), JSON.stringify(years.get(chunk.year) ?? []))),
    writeFile(reportPath, JSON.stringify({ ...report, laborStandardActViolationRecords }, null, 2)),
  ]);
  console.log(`Converted ${records.length} labor violation records from ${basename(inputPath)} into ${chunks.length} year chunks.`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await convertLaborStandardActViolationRecords(process.argv.find((arg) => arg.startsWith('--file='))?.slice(7));
}
