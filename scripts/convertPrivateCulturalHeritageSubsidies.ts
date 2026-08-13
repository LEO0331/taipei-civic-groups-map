import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { parseCsv } from './convertCivicGroups';
import { classifyApprovedProject, normalizeAssetName, parseApprovedSubsidy, parseSubsidyYear, parseTaipeiDistrict, type PrivateCulturalHeritageSubsidyRecord } from '../src/lib/privateCulturalHeritageSubsidies';

const root = process.cwd();
const input = join(root, 'data/raw/private-cultural-heritage-subsidies/source.csv');
const output = join(root, 'public/data/private-cultural-heritage-subsidies');
const heritageRecordsPath = join(root, 'public/data/taipei-cultural-heritage-assets/records.json');
const reportPath = join(root, 'public/data/conversion-report.json');
const clean = (value?: string) => (value ?? '').replace(/^\uFEFF/, '').trim();

const bytes = await readFile(input); let text: string;
try { text = new TextDecoder('utf-8', { fatal: true }).decode(bytes); } catch { text = new TextDecoder('big5').decode(bytes); }
const [rawHeaders, ...rows] = parseCsv(text);
const headers = rawHeaders.map(clean);
const heritageRecords = await readFile(heritageRecordsPath, 'utf8').then((value) => JSON.parse(value) as Array<{ caseName?: string; districtName?: string }>).catch(() => []);
const registryByName = new Map(heritageRecords.map((record) => [normalizeAssetName(record.caseName ?? ''), record]));
const issues = { missingYear: [] as string[], malformedYear: [] as string[], missingArea: [] as string[], missingAssetName: [] as string[], missingProject: [] as string[], missingAmount: [] as string[], malformedAmount: [] as string[], negativeAmount: [] as string[], ambiguousDistrict: [] as string[], unclassifiedProject: [] as string[] };
const duplicateRows: string[] = []; const seen = new Set<string>();

const records = rows.flatMap((row, index): PrivateCulturalHeritageSubsidyRecord[] => {
  const sourceValues = Object.fromEntries(headers.map((header, column) => [header, clean(row[column])])) as Record<string, string>;
  const yearRaw = sourceValues['年度'] ?? ''; const areaRaw = sourceValues['區域'] ?? ''; const heritageAssetName = sourceValues['私有資產名稱'] ?? ''; const approvedProjectRaw = sourceValues['同意補助項目'] ?? ''; const approvedSubsidyRaw = sourceValues['核定補助經費'] ?? '';
  const signature = JSON.stringify(sourceValues); if (seen.has(signature)) { duplicateRows.push(String(index + 2)); return []; } seen.add(signature);
  const year = parseSubsidyYear(yearRaw); const approvedSubsidyTwd = parseApprovedSubsidy(approvedSubsidyRaw); const districtName = parseTaipeiDistrict(areaRaw); const approvedProjectCategories = classifyApprovedProject(approvedProjectRaw);
  const note = (target: string[], condition: boolean) => { if (condition && target.length < 20) target.push(String(index + 2)); };
  note(issues.missingYear, !yearRaw); note(issues.malformedYear, Boolean(yearRaw) && year.gregorianYear === null); note(issues.missingArea, !areaRaw); note(issues.missingAssetName, !heritageAssetName); note(issues.missingProject, !approvedProjectRaw); note(issues.missingAmount, !approvedSubsidyRaw); note(issues.malformedAmount, Boolean(approvedSubsidyRaw) && approvedSubsidyTwd === null && !/^\s*-\d/.test(approvedSubsidyRaw)); note(issues.negativeAmount, /^\s*-\d/.test(approvedSubsidyRaw)); note(issues.ambiguousDistrict, Boolean(areaRaw) && districtName === null); note(issues.unclassifiedProject, approvedProjectCategories.includes('other'));
  const registryRecord = registryByName.get(normalizeAssetName(heritageAssetName));
  const possibleHeritageRegistryMatch = Boolean(registryRecord && (!districtName || !registryRecord?.districtName || registryRecord.districtName === districtName));
  return [{ id: createHash('sha256').update(`${signature}|${index}`).digest('hex').slice(0, 16), yearRaw, rocYear: year.rocYear, gregorianYear: year.gregorianYear, areaRaw, areaName: areaRaw, districtName, heritageAssetName, approvedProjectRaw, approvedProjectCategories, approvedSubsidyRaw, approvedSubsidyTwd, hasValidYear: year.gregorianYear !== null, hasValidAmount: approvedSubsidyTwd !== null, possibleHeritageRegistryMatch, sourceValues }];
});

const validAmounts = records.flatMap((record) => record.approvedSubsidyTwd ?? []); const by = <T>(values: T[], key: (value: T) => string) => Object.entries(values.reduce<Record<string, number>>((all, value) => { const label = key(value); if (label) all[label] = (all[label] ?? 0) + 1; return all; }, {})).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value || a.label.localeCompare(b.label));
const repeats = new Map<string, number>(); records.forEach((record) => repeats.set(normalizeAssetName(record.heritageAssetName), (repeats.get(normalizeAssetName(record.heritageAssetName)) ?? 0) + 1));
const parsedYears = records.flatMap((record) => record.gregorianYear === null ? [] : [record.gregorianYear]);
const summary = { totalRecords: records.length, uniqueAssetNames: new Set(records.map((record) => normalizeAssetName(record.heritageAssetName)).filter(Boolean)).size, totalValidApprovedSubsidyTwd: validAmounts.reduce((sum, value) => sum + value, 0), recordsWithValidAmount: validAmounts.length, earliestGregorianYear: parsedYears.length ? Math.min(...parsedYears) : null, latestGregorianYear: parsedYears.length ? Math.max(...parsedYears) : null, areasRepresented: new Set(records.map((record) => record.areaRaw).filter(Boolean)).size, repeatedSubsidyAssets: [...repeats.values()].filter((count) => count > 1).length, byYear: by(records.filter((record) => record.gregorianYear !== null), (record) => String(record.gregorianYear)), byArea: by(records, (record) => record.districtName ?? record.areaRaw), byProjectCategory: by(records.flatMap((record) => record.approvedProjectCategories), (category) => category) };
const issueCount = Object.values(issues).reduce((count, rowsForIssue) => count + rowsForIssue.length, 0) + duplicateRows.length;
const report = { privateCulturalHeritageSubsidies: { sourcePage: 'https://data.taipei/dataset/detail?id=24205a7e-278a-4e78-9033-47ec5cf74595', sourceAgency: '臺北市政府文化局', coverageStart: '2007-01-01', coverageEnd: '2026-06-30', updateFrequency: 'irregular', headers, inputRows: rows.length, outputRecords: records.length, exactDuplicateRowsRemoved: duplicateRows, possibleHeritageRegistryMatches: records.filter((record) => record.possibleHeritageRegistryMatch).length, issueCount, issues, notes: ['All original CSV fields are retained in sourceValues.', 'Approved subsidy amount is an administrative approval record, not actual disbursement, final expenditure, total project cost, or asset value.', 'District is derived only from an explicit Taipei district in the source area field.', 'Heritage-registry relationships are possible exact-name matches only; no fuzzy matching or field merging is performed.'] } };
const metadata = { key: 'private_cultural_heritage_subsidies', label: { zh: '私有文化資產補助案', en: 'Private Cultural Heritage Subsidies' }, sourcePage: report.privateCulturalHeritageSubsidies.sourcePage, sourceAgency: report.privateCulturalHeritageSubsidies.sourceAgency, sourceUpdatedAt: '2026-06-18T12:56:42+08:00', coverageStart: report.privateCulturalHeritageSubsidies.coverageStart, coverageEnd: report.privateCulturalHeritageSubsidies.coverageEnd, updateFrequency: 'irregular', recordCount: records.length };
await mkdir(output, { recursive: true }); const existingReport = await readFile(reportPath, 'utf8').then(JSON.parse).catch(() => ({}));
await Promise.all([writeFile(join(output, 'records.json'), JSON.stringify(records, null, 2)), writeFile(join(output, 'summary.json'), JSON.stringify(summary, null, 2)), writeFile(join(output, 'metadata.json'), JSON.stringify(metadata, null, 2)), writeFile(join(output, 'conversion-report.json'), JSON.stringify(report, null, 2)), writeFile(reportPath, JSON.stringify({ ...existingReport, ...report }, null, 2))]);
console.log(`Converted ${records.length} private cultural heritage subsidy records.`);
