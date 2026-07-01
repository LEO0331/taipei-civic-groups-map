import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { parseCsv } from './convertCivicGroups';
import { normalizeColumnName } from '../src/lib/civicGroups';
import {
  buildInfantCareCenterEvaluationSummary, cleanText, normalizeInfantCareEvaluationResult, normalizeInfantCareInstitutionName,
  parseEvaluationYearColumn, parseIntegerText, parseTaipeiDistrictCode, reconcileDistrict,
} from '../src/lib/infantCareCenterEvaluationResults';
import type { InfantCareCenterEvaluationInstitutionRecord, InfantCareCenterEvaluationYearRecord } from '../src/types';

const rawDir = join(process.cwd(), 'data/raw/infant-care-center-evaluation-results');
const outputDir = join(process.cwd(), 'public/data');
const reportPath = join(outputDir, 'conversion-report.json');
const source = '臺北市托嬰中心評鑑結果', sourceAgency = '臺北市政府社會局';
const keyPart = (value: unknown) => cleanText(value)?.toLocaleLowerCase() ?? '';
const decodeCsv = (bytes: Uint8Array) => {
  try { return { text: new TextDecoder('utf-8', { fatal: true }).decode(bytes).replace(/^\uFEFF/, ''), encoding: 'UTF-8-SIG / UTF-8' }; }
  catch { return { text: new TextDecoder('big5', { fatal: true }).decode(bytes).replace(/^\uFEFF/, ''), encoding: 'CP950 / Big5-compatible' }; }
};

export async function convertInfantCareCenterEvaluationResults(filePath?: string) {
  const csvFile = filePath ? undefined : (await readdir(rawDir)).find((file) => file.toLowerCase().endsWith('.csv'));
  if (!filePath && !csvFile) throw new Error('No infant care center evaluation CSV found. Run npm run data:fetch:infant-care-evaluations.');
  const inputPath = filePath ?? join(rawDir, csvFile!);
  const { text, encoding } = decodeCsv(await readFile(inputPath));
  const [rawHeaders, ...rows] = parseCsv(text);
  if (!rawHeaders) throw new Error('Invalid infant care evaluation CSV: file is empty.');
  const headers = rawHeaders.map(normalizeColumnName);
  const yearColumns = headers.filter((header) => /^\d{2,3}年$/.test(header));
  const missing = ['編號', '機構名稱', '行政區', '行政區碼'].filter((header) => !headers.includes(header));
  if (missing.length) throw new Error(`Invalid infant care evaluation CSV: missing columns ${missing.join(', ')}`);
  const warnings: string[] = [], duplicateKeys: string[] = [], duplicateLongKeys: string[] = [], unknownResults: string[] = [];
  const sequenceCounts = new Map<string, number>(), nameCounts = new Map<string, number>(), seen = new Set<string>(), seenLong = new Set<string>();
  const institutions: InfantCareCenterEvaluationInstitutionRecord[] = [], yearRecords: InfantCareCenterEvaluationYearRecord[] = [];

  rows.forEach((row) => {
    const values = Object.fromEntries(headers.map((header, index) => [header, cleanText(row[index])]));
    const institutionName = cleanText(values['機構名稱']);
    if (!institutionName) return;
    const sourceSequenceNumber = parseIntegerText(values['編號']);
    const districtCode = parseTaipeiDistrictCode(values['行政區碼']);
    if (districtCode.warning && warnings.length < 20) warnings.push(`${institutionName}: ${districtCode.warning} ${districtCode.districtCode}`);
    const district = reconcileDistrict({ district: cleanText(values['行政區']), districtFromCode: districtCode.districtFromCode });
    if (district.warning && warnings.length < 20) warnings.push(`${institutionName}: ${district.warning}`);
    const institutionNameNormalized = normalizeInfantCareInstitutionName(institutionName);
    const sourceRecordHash = createHash('sha1').update([sourceSequenceNumber, institutionName, districtCode.districtCode].map(keyPart).join('|')).digest('hex');
    const dedupeKey = [sourceSequenceNumber, institutionName, districtCode.districtCode].map(keyPart).join('|') || [institutionName, district.district, districtCode.districtCode].map(keyPart).join('|');
    if (seen.has(dedupeKey)) { if (duplicateKeys.length < 20) duplicateKeys.push(dedupeKey); return; }
    seen.add(dedupeKey);
    if (sourceSequenceNumber !== undefined) sequenceCounts.set(String(sourceSequenceNumber), (sequenceCounts.get(String(sourceSequenceNumber)) ?? 0) + 1);
    nameCounts.set(institutionNameNormalized ?? institutionName, (nameCounts.get(institutionNameNormalized ?? institutionName) ?? 0) + 1);
    const yearlyResults: InfantCareCenterEvaluationInstitutionRecord['yearlyResults'] = {};
    for (const column of yearColumns) {
      const parsedYear = parseEvaluationYearColumn(column);
      if (!parsedYear.rocYear || !parsedYear.year) continue;
      const normalized = normalizeInfantCareEvaluationResult(values[column]);
      if (normalized.evaluationGrade === 'other' && unknownResults.length < 20) unknownResults.push(`${institutionName} ${column}: ${values[column]}`);
      const isEvaluated = normalized.evaluationStatus !== 'not_evaluated';
      const longKey = [institutionName, districtCode.districtCode, parsedYear.year].map(keyPart).join('|');
      if (seenLong.has(longKey)) { if (duplicateLongKeys.length < 20) duplicateLongKeys.push(longKey); continue; }
      seenLong.add(longKey);
      yearlyResults[String(parsedYear.year)] = { rocYear: parsedYear.rocYear, year: parsedYear.year, ...normalized, isEvaluated };
      yearRecords.push({
        id: createHash('sha1').update(longKey).digest('hex').slice(0, 12), module: 'infant_care_center_evaluation_results',
        sourceSequenceNumber, institutionName, institutionNameNormalized, ...districtCode, ...district,
        evaluationRocYear: parsedYear.rocYear, evaluationYear: parsedYear.year, ...normalized, isEvaluated,
        isExcellentOrEquivalent: normalized.evaluationGrade === 'excellent', isAOrEquivalent: normalized.evaluationGrade === 'a',
        isBOrEquivalent: normalized.evaluationGrade === 'b', isCOrEquivalent: normalized.evaluationGrade === 'c',
        isDOrEquivalent: normalized.evaluationGrade === 'd', isClosedOrSuspended: normalized.evaluationGrade === 'closed_or_suspended',
        hasSpecialNote: Boolean(normalized.evaluationNote), sourceRecordHash, source, sourceAgency,
      });
    }
    const evaluated = Object.values(yearlyResults).filter((result) => result.isEvaluated).sort((a, b) => a.year - b.year);
    const latest = evaluated.at(-1);
    institutions.push({
      id: sourceRecordHash.slice(0, 12), module: 'infant_care_center_evaluation_results', sourceSequenceNumber, institutionName, institutionNameNormalized,
      ...districtCode, ...district, yearlyResults, latestEvaluationYear: latest?.year, latestEvaluationRocYear: latest?.rocYear,
      latestEvaluationResultRaw: latest?.evaluationResultRaw, latestEvaluationGrade: latest?.evaluationGrade, latestEvaluationStatus: latest?.evaluationStatus,
      evaluatedYearCount: evaluated.length, missingYearCount: Object.values(yearlyResults).filter((result) => !result.isEvaluated).length,
      specialNoteCount: Object.values(yearlyResults).filter((result) => result.evaluationNote).length, sourceRecordHash, source, sourceAgency,
    });
  });

  const summary = buildInfantCareCenterEvaluationSummary(institutions, yearRecords);
  const latest = yearRecords.filter((record) => record.evaluationYear === summary.latestEvaluationYear);
  const file = await stat(inputPath);
  let report = {};
  try { report = JSON.parse(await readFile(reportPath, 'utf8')); } catch { /* first conversion */ }
  const infantCareCenterEvaluationResults = {
    source, sourceAgency: '社會局', sourcePage: 'https://data.taipei/dataset/detail?id=e7b45593-9d44-469c-97fa-f1a52c69ebaa',
    category: '社福', serviceCategory: '生育保健', datasetType: '網路服務', updateFrequency: '每1年',
    inputFile: basename(inputPath), convertedAt: new Date().toISOString(), fileSize: file.size, encoding,
    inputRows: rows.length, outputInstitutions: institutions.length, outputYearRecords: yearRecords.length, yearColumns,
    duplicateInstitutionNameExamples: [...nameCounts].filter(([, count]) => count > 1).slice(0, 20).map(([name]) => name),
    duplicateSourceSequenceNumberExamples: [...sequenceCounts].filter(([, count]) => count > 1).slice(0, 20).map(([sequence]) => sequence),
    duplicateKeys, duplicateLongKeys, unknownEvaluationResultExamples: unknownResults, warnings,
    notes: ['UTF-8-SIG decoded with Big5 fallback', 'Wide year columns converted to institution-level and institution-year records', 'Raw evaluation result text preserved', 'No addresses, geocoding, exact markers, or quasi-public auto-join created'],
  };
  await mkdir(outputDir, { recursive: true });
  await Promise.all([
    writeFile(join(outputDir, 'infant-care-center-evaluation-institutions.json'), JSON.stringify(institutions)),
    writeFile(join(outputDir, 'infant-care-center-evaluation-year-records.json'), JSON.stringify(yearRecords)),
    writeFile(join(outputDir, 'infant-care-center-evaluation-summary.json'), JSON.stringify(summary)),
    writeFile(join(outputDir, 'infant-care-center-evaluation-latest.json'), JSON.stringify(latest)),
    writeFile(reportPath, JSON.stringify({ ...report, infantCareCenterEvaluationResults }, null, 2)),
  ]);
  console.log(`Converted ${institutions.length} infant care evaluation institutions and ${yearRecords.length} year records from ${basename(inputPath)}.`);
}

if (import.meta.url === `file://${process.argv[1]}`) await convertInfantCareCenterEvaluationResults(process.argv.find((arg) => arg.startsWith('--file='))?.slice(7));
