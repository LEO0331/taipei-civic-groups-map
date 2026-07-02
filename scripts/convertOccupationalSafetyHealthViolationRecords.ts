import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { parseCsv } from './convertCivicGroups';
import { buildOccupationalSafetyHealthViolationSummary, calculateDaysBetweenPenaltyAndAnnouncement, cleanOshText, normalizeOshText, parseBusinessOrOrganizationName, parseOshViolationContent, parsePenaltyDocumentNumber, parseResponsiblePersonName, parseTaipeiViolationDate, parseViolatedOshActArticle, parseViolationNote } from '../src/lib/occupationalSafetyHealthViolations';
import type { OccupationalSafetyHealthViolationRecord } from '../src/types';

const rawDir = join(process.cwd(), 'data/raw/occupational-safety-health-violation-records');
const outputDir = join(process.cwd(), 'public/data');
const reportPath = join(outputDir, 'conversion-report.json');
const source = '臺北市政府勞動局違反職業安全衛生法事業單位及事業主公布總表';
const sourceAgency = '臺北市政府勞動局';
const decode = (bytes: Uint8Array) => { try { return { text: new TextDecoder('utf-8', { fatal: true }).decode(bytes).replace(/^\uFEFF/, ''), encoding: 'UTF-8-SIG / UTF-8' }; } catch { return { text: new TextDecoder('big5', { fatal: true }).decode(bytes).replace(/^\uFEFF/, ''), encoding: 'CP950 / Big5-compatible' }; } };
const duplicates = (values: Array<string | undefined>) => [...values.reduce((map, value) => value ? map.set(value, (map.get(value) ?? 0) + 1) : map, new Map<string, number>())].filter(([, count]) => count > 1).slice(0, 30).map(([value, count]) => ({ value, count }));

export async function convertOccupationalSafetyHealthViolationRecords(filePath?: string) {
  const csvFile = filePath ? undefined : (await readdir(rawDir)).find((file) => file.toLowerCase().endsWith('.csv'));
  if (!filePath && !csvFile) throw new Error('No OSH violation CSV found. Run npm run data:fetch:osh-violations.');
  const inputPath = filePath ?? join(rawDir, csvFile!), { text, encoding } = decode(await readFile(inputPath)), [rawHeaders, ...rows] = parseCsv(text);
  if (!rawHeaders) throw new Error('Invalid OSH violation CSV: file is empty.');
  const headers = rawHeaders.map((header) => cleanOshText(header) ?? ''), required = ['公告日期', '處分日期', '處分字號', '事業單位或事業組織名稱', '負責人姓名', '違反職業安全衛生法條款', '違反法規內容', '備註'], missing = required.filter((header) => !headers.includes(header));
  if (missing.length) throw new Error(`Invalid OSH violation CSV: missing columns ${missing.join(', ')}.`);

  const dateWarnings: string[] = [], articleWarnings: string[] = [], contentWarnings: string[] = [], duplicateKeys: string[] = [];
  const seen = new Set<string>();
  const records = rows.flatMap((row, index): OccupationalSafetyHealthViolationRecord[] => {
    const values = Object.fromEntries(headers.map((header, column) => [header, cleanOshText(row[column])]));
    const business = parseBusinessOrOrganizationName(values.事業單位或事業組織名稱);
    if (!business.businessOrOrganizationName) return [];
    const announcement = parseTaipeiViolationDate(values.公告日期), penalty = parseTaipeiViolationDate(values.處分日期);
    const document = parsePenaltyDocumentNumber(values.處分字號), responsible = parseResponsiblePersonName(values.負責人姓名), article = parseViolatedOshActArticle(values.違反職業安全衛生法條款), content = parseOshViolationContent(values.違反法規內容), note = parseViolationNote(values.備註);
    if (announcement.warning && dateWarnings.length < 20) dateWarnings.push(`公告日期:${announcement.raw}`);
    if (penalty.warning && dateWarnings.length < 20) dateWarnings.push(`處分日期:${penalty.raw}`);
    if (article.violatedOshActArticleRaw && !article.violatedArticleTokens.length && articleWarnings.length < 20) articleWarnings.push(article.violatedOshActArticleRaw);
    if (!content.violationContent && contentWarnings.length < 20) contentWarnings.push(`${business.businessOrOrganizationName}:${index + 1}`);
    const primaryKey = [document.penaltyDocumentNumberNormalized, business.businessOrOrganizationNameNormalized, announcement.date].filter(Boolean).join('|');
    const fallbackKey = [announcement.date, penalty.date, business.businessOrOrganizationNameNormalized, article.violatedOshActArticleNormalized, content.violationContentNormalized].filter(Boolean).join('|');
    const key = primaryKey || fallbackKey || String(index);
    if (seen.has(key) && duplicateKeys.length < 30) duplicateKeys.push(key); seen.add(key);
    const sourceRecordHash = createHash('sha1').update(`${key}|${index}`).digest('hex');
    return [{ id: sourceRecordHash.slice(0, 12), module: 'occupational_safety_health_violation_records', announcementDateRaw: announcement.raw, announcementDate: announcement.date, announcementYear: announcement.year, announcementMonth: announcement.month, announcementYearMonth: announcement.yearMonth, penaltyDateRaw: penalty.raw, penaltyDate: penalty.date, penaltyYear: penalty.year, penaltyMonth: penalty.month, penaltyYearMonth: penalty.yearMonth, daysBetweenPenaltyAndAnnouncement: calculateDaysBetweenPenaltyAndAnnouncement({ penaltyDate: penalty.date, announcementDate: announcement.date }), ...document, businessOrOrganizationName: business.businessOrOrganizationName, businessOrOrganizationNameNormalized: business.businessOrOrganizationNameNormalized, ...responsible, ...article, ...content, ...note, sourceRecordHash, source, sourceAgency, legalBasis: '職業安全衛生法' }];
  });
  const fileInfo = await stat(inputPath), report = await readFile(reportPath, 'utf8').then(JSON.parse).catch(() => ({}));
  const occupationalSafetyHealthViolationRecords = {
    source, sourceAgency: '勞動局', sourcePage: 'https://data.taipei/dataset/detail?id=3e2ad23f-21fa-4084-a4de-4fd7f5293550',
    category: '勞動', serviceCategory: '求職及就業', datasetType: '原始資料', resourceName: source, officialResourceUpdateTime: '2026-05-14 13:49:48', officialMetadataUpdateTime: '2026-05-14 13:50:04', updateFrequency: '每1月',
    inputFile: basename(inputPath), convertedAt: new Date().toISOString(), fileSize: fileInfo.size, encoding, inputRows: rows.length, outputRecords: records.length,
    duplicatePenaltyDocumentNumbers: duplicates(records.map((r) => r.penaltyDocumentNumberNormalized)),
    duplicateBusinessNames: duplicates(records.map((r) => r.businessOrOrganizationNameNormalized)),
    duplicatePrimaryKeys: duplicateKeys, duplicateFallbackKeys: duplicateKeys,
    duplicateNameDatePairs: duplicates(records.map((r) => [r.businessOrOrganizationNameNormalized, r.announcementDate].filter(Boolean).join('|'))),
    dateWarnings, articleWarnings, contentWarnings,
    notes: ['UTF-8-SIG decoded with Big5 / CP950 fallback', 'Dates parsed from ROC compact values such as 1150605', 'Penalty document numbers are preserved as text', 'No address, district, or coordinates supplied; no map layer created', 'This is not real-time workplace safety status, complete compliance history, employer evaluation, credit rating, investment/procurement/employment/legal advice, criminal record, hazard map, or endorsement data'],
  };
  await mkdir(outputDir, { recursive: true });
  await Promise.all([
    writeFile(join(outputDir, 'occupational-safety-health-violation-records.json'), JSON.stringify(records)),
    writeFile(join(outputDir, 'occupational-safety-health-violation-summary.json'), JSON.stringify(buildOccupationalSafetyHealthViolationSummary(records))),
    writeFile(reportPath, JSON.stringify({ ...report, occupationalSafetyHealthViolationRecords }, null, 2)),
  ]);
  console.log(`Converted ${records.length} OSH violation records from ${basename(inputPath)}.`);
}

if (import.meta.url === `file://${process.argv[1]}`) await convertOccupationalSafetyHealthViolationRecords(process.argv.find((arg) => arg.startsWith('--file='))?.slice(7));
