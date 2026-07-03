import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { parseCsv } from './convertCivicGroups';
import { buildGenderEqualityWorkActViolationSummary, calculateDaysBetweenPenaltyAndAnnouncement, cleanGenderEqualityText, detectNoViolationPeriodRecord, parseBusinessOrganizationOrNaturalPersonName, parseFineAmount, parseGenderEqualityWorkViolationContent, parseIntegerText, parsePenaltyDocumentNumber, parseRepresentativeName, parseTaipeiLaborPublicationDate, parseViolatedGenderEqualityWorkActArticle, parseViolationNote } from '../src/lib/genderEqualityWorkActViolations';
import type { GenderEqualityWorkActViolationRecord } from '../src/types';

const rawDir = join(process.cwd(), 'data/raw/gender-equality-work-act-violation-records'), outputDir = join(process.cwd(), 'public/data'), reportPath = join(outputDir, 'conversion-report.json');
const source = '臺北市政府勞動局違反性別平等工作法事業單位及事業主公布總表', sourceAgency = '臺北市政府勞動局';
const decode = (bytes: Uint8Array) => { try { return { text: new TextDecoder('big5', { fatal: true }).decode(bytes).replace(/^\uFEFF/, ''), encoding: 'CP950 / Big5-compatible' }; } catch { return { text: new TextDecoder('utf-8', { fatal: true }).decode(bytes).replace(/^\uFEFF/, ''), encoding: 'UTF-8-SIG / UTF-8' }; } };
const duplicates = (values: Array<string | undefined>) => [...values.reduce((map, value) => value ? map.set(value, (map.get(value) ?? 0) + 1) : map, new Map<string, number>())].filter(([, count]) => count > 1).slice(0, 30).map(([value, count]) => ({ value, count }));

export async function convertGenderEqualityWorkActViolationRecords(filePath?: string) {
  const csvFile = filePath ? undefined : (await readdir(rawDir)).find((file) => file.toLowerCase().endsWith('.csv'));
  if (!filePath && !csvFile) throw new Error('No Gender Equality Work Act violation CSV found. Run npm run data:fetch:gender-equality-work-violations.');
  const inputPath = filePath ?? join(rawDir, csvFile!), { text, encoding } = decode(await readFile(inputPath)), [rawHeaders, ...rows] = parseCsv(text);
  if (!rawHeaders) throw new Error('Invalid Gender Equality Work Act violation CSV: file is empty.');
  const headers = rawHeaders.map((header) => cleanGenderEqualityText(header) ?? '');
  const articleHeader = headers.find((header) => header.includes('違反性別平等工作法') && header.includes('條款'));
  const required = ['公告日期', '處分日期', '處分字號', '事業單位名稱/自然人姓名', '事業單位代表人', '違反法規內容', '備註'], missing = required.filter((header) => !headers.includes(header));
  if (!articleHeader) missing.push('違反性別平等工作法條款');
  if (missing.length) throw new Error(`Invalid Gender Equality Work Act violation CSV: missing columns ${missing.join(', ')}.`);
  const fineHeader = headers.includes('罰鍰金額') ? '罰鍰金額' : undefined, dateWarnings: string[] = [], articleWarnings: string[] = [], fineWarnings: string[] = [], duplicateKeys: string[] = [], seen = new Set<string>();
  const records = rows.flatMap((row, index): GenderEqualityWorkActViolationRecord[] => {
    const values = Object.fromEntries(headers.map((header, column) => [header, cleanGenderEqualityText(row[column])]));
    const note = parseViolationNote(values.備註), rawNoViolation = detectNoViolationPeriodRecord({ businessOrganizationOrNaturalPersonName: values['事業單位名稱/自然人姓名'], representativeName: values.事業單位代表人, violatedArticle: values[articleHeader!], violationContent: values.違反法規內容, note: note.note });
    const announcement = parseTaipeiLaborPublicationDate(values.公告日期), penalty = parseTaipeiLaborPublicationDate(values.處分日期);
    const document = parsePenaltyDocumentNumber(values.處分字號, rawNoViolation), name = parseBusinessOrganizationOrNaturalPersonName(values['事業單位名稱/自然人姓名'], rawNoViolation), representative = parseRepresentativeName(values.事業單位代表人, rawNoViolation), article = parseViolatedGenderEqualityWorkActArticle(values[articleHeader!], rawNoViolation), content = parseGenderEqualityWorkViolationContent(values.違反法規內容, rawNoViolation), fine = parseFineAmount(fineHeader ? values[fineHeader] : undefined);
    if (!name.businessOrganizationOrNaturalPersonName) return [];
    if (announcement.warning && dateWarnings.length < 20) dateWarnings.push(`公告日期:${announcement.raw}`);
    if (penalty.warning && dateWarnings.length < 20) dateWarnings.push(`處分日期:${penalty.raw}`);
    if (article.violatedGenderEqualityWorkActArticleRaw && !article.violatedArticleTokens.length && articleWarnings.length < 20) articleWarnings.push(article.violatedGenderEqualityWorkActArticleRaw);
    if (fine.fineAmountRaw && fine.fineAmountRaw !== '無' && fine.fineAmount === undefined && fineWarnings.length < 20) fineWarnings.push(fine.fineAmountRaw);
    const noViolationKey = rawNoViolation ? [announcement.date, 'NO_VIOLATION_PERIOD'].filter(Boolean).join('|') : '';
    const primaryKey = [document.penaltyDocumentNumberNormalized, name.businessOrganizationOrNaturalPersonNameNormalized, announcement.date].filter(Boolean).join('|');
    const fallbackKey = [announcement.date, penalty.date, name.businessOrganizationOrNaturalPersonNameNormalized, article.violatedGenderEqualityWorkActArticleNormalized, content.violationContentNormalized].filter(Boolean).join('|');
    const key = noViolationKey || primaryKey || fallbackKey || String(index);
    if (seen.has(key) && duplicateKeys.length < 30) duplicateKeys.push(key); seen.add(key);
    const sourceRecordHash = createHash('sha1').update(`${key}|${index}`).digest('hex');
    return [{ id: sourceRecordHash.slice(0, 12), module: 'gender_equality_work_act_violation_records', sourceSequenceNumber: parseIntegerText(values.編號), announcementDateRaw: announcement.raw, announcementDate: announcement.date, announcementYear: announcement.year, announcementMonth: announcement.month, announcementYearMonth: announcement.yearMonth, penaltyDateRaw: penalty.raw, penaltyDate: penalty.date, penaltyYear: penalty.year, penaltyMonth: penalty.month, penaltyYearMonth: penalty.yearMonth, daysBetweenPenaltyAndAnnouncement: calculateDaysBetweenPenaltyAndAnnouncement({ penaltyDate: penalty.date, announcementDate: announcement.date }), ...document, businessOrganizationOrNaturalPersonName: name.businessOrganizationOrNaturalPersonName, businessOrganizationOrNaturalPersonNameNormalized: name.businessOrganizationOrNaturalPersonNameNormalized, ...representative, ...article, ...content, ...fine, ...note, isNoViolationPeriodRecord: rawNoViolation, sourceRecordHash, source, sourceAgency, legalBasis: '性別平等工作法' }];
  });
  const fileInfo = await stat(inputPath), summary = buildGenderEqualityWorkActViolationSummary(records), report = await readFile(reportPath, 'utf8').then(JSON.parse).catch(() => ({}));
  const genderEqualityWorkActViolationRecords = { source, sourceAgency: '勞動局', sourcePage: 'https://data.taipei/dataset/detail?id=12f3421a-94f4-4a5e-8642-143dee2fa551', category: '勞動', serviceCategory: '求職及就業', datasetType: '原始資料', resourceName: '臺北市政府勞動局違反性別平等工作法事業單位及事業主公布總表〖公告月份：11506〗', officialResourceUpdateTime: '2026-06-08 10:08:19', officialMetadataUpdateTime: '2026-06-08 10:08:44', updateFrequency: '每1月', collectionPeriodStart: '2015-06-01', collectionPeriodEnd: '2024-09-30', inputFile: basename(inputPath), convertedAt: new Date().toISOString(), fileSize: fileInfo.size, encoding, inputRows: rows.length, outputRecords: records.length, noViolationPeriodRecordCount: summary.noViolationPeriodRecordCount, duplicatePenaltyDocumentNumbers: duplicates(records.map((r) => r.penaltyDocumentNumberNormalized)), duplicateNames: duplicates(records.map((r) => r.businessOrganizationOrNaturalPersonNameNormalized)), duplicatePrimaryKeys: duplicateKeys, duplicateFallbackKeys: duplicateKeys, duplicateNameDatePairs: duplicates(records.map((r) => [r.businessOrganizationOrNaturalPersonNameNormalized, r.announcementDate].filter(Boolean).join('|'))), dateWarnings, articleWarnings, fineWarnings, dataQuality: summary.dataQuality, notes: ['Big5 / CP950 decoded with UTF-8-SIG fallback', 'Dates parsed from ROC compact values such as 1150605', 'Penalty document numbers are preserved as text', 'Fine amount column is optional and preserved when present', 'No address, district, or coordinates supplied; no map layer created', 'No business/company matching generated in v1', 'This is not real-time workplace gender equality status, complete compliance history, employer evaluation, workplace culture evaluation, credit/investment/procurement/employment/legal advice, criminal record, discrimination risk scoring, or endorsement data'] };
  await mkdir(outputDir, { recursive: true });
  await Promise.all([writeFile(join(outputDir, 'gender-equality-work-act-violation-records.json'), JSON.stringify(records)), writeFile(join(outputDir, 'gender-equality-work-act-violation-summary.json'), JSON.stringify(summary)), writeFile(reportPath, JSON.stringify({ ...report, genderEqualityWorkActViolationRecords }, null, 2))]);
  console.log(`Converted ${records.length} Gender Equality Work Act violation records from ${basename(inputPath)}.`);
}
if (import.meta.url === `file://${process.argv[1]}`) await convertGenderEqualityWorkActViolationRecords(process.argv.find((arg) => arg.startsWith('--file='))?.slice(7));
