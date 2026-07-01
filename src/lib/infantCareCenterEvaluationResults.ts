import type {
  InfantCareCenterEvaluationFilters, InfantCareCenterEvaluationGrade, InfantCareCenterEvaluationInstitutionRecord,
  InfantCareCenterEvaluationStatus, InfantCareCenterEvaluationSummary, InfantCareCenterEvaluationYearRecord,
} from '../types';

export const TAIPEI_DISTRICT_CODE_TO_NAME: Record<string, string> = {
  '63000010': '松山區', '63000020': '信義區', '63000030': '大安區', '63000040': '中山區',
  '63000050': '中正區', '63000060': '大同區', '63000070': '萬華區', '63000080': '文山區',
  '63000090': '南港區', '63000100': '內湖區', '63000110': '士林區', '63000120': '北投區',
};
const missing = new Set(['', '-', '--', 'NaN', 'nan', 'NULL', 'null']);

export function cleanText(raw: unknown) {
  const value = String(raw ?? '').replace(/\u3000/g, ' ').trim().replace(/\s+/g, ' ');
  return missing.has(value) ? undefined : value;
}
export function parseIntegerText(raw: unknown) {
  const value = cleanText(raw)?.replaceAll(',', '');
  return value && /^-?\d+$/.test(value) ? Number(value) : undefined;
}
export function parseTaipeiDistrictCode(raw: unknown) {
  const districtCode = cleanText(raw);
  if (!districtCode) return {};
  const districtFromCode = TAIPEI_DISTRICT_CODE_TO_NAME[districtCode];
  return { districtCode, districtFromCode, warning: districtFromCode ? undefined : 'Unknown district code' };
}
export function reconcileDistrict({ district, districtFromCode }: { district?: string; districtFromCode?: string }) {
  const display = cleanText(district) ?? districtFromCode;
  const districtMismatch = Boolean(display && districtFromCode && display !== districtFromCode);
  return { district: display, districtFromCode, districtMismatch, warning: districtMismatch ? `District mismatch: ${display} / ${districtFromCode}` : undefined };
}
export function normalizeInfantCareInstitutionName(raw: unknown) {
  return cleanText(raw)?.replace(/[，,、（）()]/g, '').toLocaleLowerCase();
}
export function parseEvaluationYearColumn(columnName: string) {
  const rocYear = Number(columnName.match(/^(\d{2,3})年$/)?.[1]);
  return rocYear ? { rocYear, year: rocYear + 1911 } : { warning: 'Unexpected evaluation year column' };
}
export function normalizeInfantCareEvaluationResult(raw: string | undefined): {
  evaluationResultRaw?: string; evaluationResultNormalized?: string; evaluationGrade: InfantCareCenterEvaluationGrade; evaluationStatus: InfantCareCenterEvaluationStatus; evaluationNote?: string;
} {
  const text = cleanText(raw);
  if (!text) return { evaluationGrade: 'not_evaluated', evaluationStatus: 'not_evaluated' };
  if (text === '優' || text === '優等') return { evaluationResultRaw: text, evaluationResultNormalized: '優等', evaluationGrade: 'excellent', evaluationStatus: 'evaluated' };
  if (text === '甲' || text === '甲等') return { evaluationResultRaw: text, evaluationResultNormalized: '甲等', evaluationGrade: 'a', evaluationStatus: 'evaluated' };
  if (text === '乙' || text === '乙等') return { evaluationResultRaw: text, evaluationResultNormalized: '乙等', evaluationGrade: 'b', evaluationStatus: 'evaluated' };
  if (text === '丙' || text === '丙等') return { evaluationResultRaw: text, evaluationResultNormalized: '丙等', evaluationGrade: 'c', evaluationStatus: 'evaluated' };
  if (text === '丁' || text === '丁等') return { evaluationResultRaw: text, evaluationResultNormalized: '丁等', evaluationGrade: 'd', evaluationStatus: 'evaluated' };
  if (text.includes('丙') && text.includes('輔導通過')) return { evaluationResultRaw: text, evaluationResultNormalized: '丙等', evaluationGrade: 'c', evaluationStatus: 'guidance_passed', evaluationNote: text };
  if (text.includes('丙') && text.includes('列入輔導')) return { evaluationResultRaw: text, evaluationResultNormalized: '丙等', evaluationGrade: 'c', evaluationStatus: 'guidance_required', evaluationNote: text };
  if (text.includes('已停業') || text.includes('已歇業')) return { evaluationResultRaw: text, evaluationResultNormalized: text, evaluationGrade: 'closed_or_suspended', evaluationStatus: 'closed', evaluationNote: text };
  if (text.includes('停業中')) return { evaluationResultRaw: text, evaluationResultNormalized: text, evaluationGrade: 'closed_or_suspended', evaluationStatus: 'suspended', evaluationNote: text };
  if (text.includes('降為乙')) return { evaluationResultRaw: text, evaluationResultNormalized: '乙等', evaluationGrade: 'b', evaluationStatus: 'special_note', evaluationNote: text };
  return { evaluationResultRaw: text, evaluationResultNormalized: text, evaluationGrade: 'other', evaluationStatus: 'special_note', evaluationNote: text };
}

const count = <T extends string>(values: T[]) => {
  const map = new Map<T, number>();
  values.forEach((value) => map.set(value, (map.get(value) ?? 0) + 1));
  return [...map].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
};
const rowsForLatest = (yearRecords: InfantCareCenterEvaluationYearRecord[], latest?: number) => yearRecords.filter((record) => record.evaluationYear === latest);
const gradeCount = (records: InfantCareCenterEvaluationYearRecord[], grade: InfantCareCenterEvaluationGrade) => records.filter((record) => record.evaluationGrade === grade).length;

export function buildInfantCareCenterEvaluationSummary(institutions: InfantCareCenterEvaluationInstitutionRecord[], yearRecords: InfantCareCenterEvaluationYearRecord[]): InfantCareCenterEvaluationSummary {
  const years = [...new Set(yearRecords.map((record) => record.evaluationYear))].sort((a, b) => a - b);
  const latestEvaluationYear = years.at(-1), latest = rowsForLatest(yearRecords, latestEvaluationYear);
  const byYear = years.map((evaluationYear) => {
    const rows = yearRecords.filter((record) => record.evaluationYear === evaluationYear);
    return {
      evaluationYear, evaluationRocYear: evaluationYear - 1911, institutionCount: rows.length, evaluatedCount: rows.filter((record) => record.isEvaluated).length,
      missingCount: rows.filter((record) => !record.isEvaluated).length, excellentCount: gradeCount(rows, 'excellent'), aCount: gradeCount(rows, 'a'),
      bCount: gradeCount(rows, 'b'), cCount: gradeCount(rows, 'c'), dCount: gradeCount(rows, 'd'),
      closedOrSuspendedCount: gradeCount(rows, 'closed_or_suspended'), specialNoteCount: rows.filter((record) => record.hasSpecialNote).length,
    };
  });
  const districtRows = [...new Set(institutions.flatMap((record) => record.district ?? []))];
  const byDistrictLatestYear = districtRows.map((district) => {
    const rows = latest.filter((record) => record.district === district);
    return { district, institutionCount: rows.length, evaluatedCount: rows.filter((record) => record.isEvaluated).length, missingCount: rows.filter((record) => !record.isEvaluated).length, excellentCount: gradeCount(rows, 'excellent'), aCount: gradeCount(rows, 'a'), bCount: gradeCount(rows, 'b'), cCount: gradeCount(rows, 'c'), dCount: gradeCount(rows, 'd'), closedOrSuspendedCount: gradeCount(rows, 'closed_or_suspended'), specialNoteCount: rows.filter((record) => record.hasSpecialNote).length };
  }).sort((a, b) => b.institutionCount - a.institutionCount);
  return {
    totalInstitutions: institutions.length, totalInstitutionYearRecords: yearRecords.length,
    evaluatedRecordCount: yearRecords.filter((record) => record.isEvaluated).length,
    missingEvaluationRecordCount: yearRecords.filter((record) => !record.isEvaluated).length,
    districtCount: districtRows.length, evaluationYearCount: years.length, minEvaluationYear: years[0], maxEvaluationYear: latestEvaluationYear, latestEvaluationYear,
    latestYearEvaluatedInstitutionCount: latest.filter((record) => record.isEvaluated).length,
    latestYearMissingInstitutionCount: latest.filter((record) => !record.isEvaluated).length,
    latestYearByGrade: count(latest.map((record) => record.evaluationGrade)).map(([evaluationGrade, count]) => ({ evaluationGrade, count })),
    latestYearByStatus: count(latest.map((record) => record.evaluationStatus)).map(([evaluationStatus, count]) => ({ evaluationStatus, count })),
    byYear, byDistrictLatestYear,
    byDistrictAllYears: districtRows.map((district) => {
      const rows = yearRecords.filter((record) => record.district === district);
      return { district, institutionCount: new Set(rows.map((record) => record.institutionNameNormalized ?? record.institutionName)).size, evaluatedRecordCount: rows.filter((record) => record.isEvaluated).length, excellentCount: gradeCount(rows, 'excellent'), aCount: gradeCount(rows, 'a'), bCount: gradeCount(rows, 'b'), cCount: gradeCount(rows, 'c'), dCount: gradeCount(rows, 'd'), closedOrSuspendedCount: gradeCount(rows, 'closed_or_suspended') };
    }).sort((a, b) => b.institutionCount - a.institutionCount),
    institutionsWithSpecialNotes: yearRecords.filter((record) => record.hasSpecialNote).map((record) => ({ institutionName: record.institutionName, district: record.district, evaluationYear: record.evaluationYear, evaluationResultRaw: record.evaluationResultRaw })),
    dataQuality: {
      districtCodeMappedCount: institutions.filter((record) => record.districtFromCode).length,
      districtMismatchCount: institutions.filter((record) => record.districtMismatch).length,
      missingInstitutionNameCount: 0,
      unknownEvaluationResultCount: yearRecords.filter((record) => record.evaluationGrade === 'other').length,
      duplicateInstitutionNameCount: institutions.length - new Set(institutions.map((record) => record.institutionNameNormalized ?? record.institutionName)).size,
    },
  };
}

export function filterInfantCareCenterEvaluationInstitutions(records: InfantCareCenterEvaluationInstitutionRecord[], filters: InfantCareCenterEvaluationFilters) {
  const query = filters.search.trim().toLocaleLowerCase();
  return records.filter((record) => {
    const yearly = Object.values(record.yearlyResults);
    const text = [record.institutionName, record.district, record.districtCode, ...yearly.flatMap((item) => [item.evaluationResultRaw, item.evaluationResultNormalized])].filter(Boolean).join(' ').toLocaleLowerCase();
    return (!query || text.includes(query))
      && (!filters.district || record.district === filters.district)
      && (!filters.districtCode || record.districtCode === filters.districtCode)
      && (!filters.evaluationYear || Boolean(record.yearlyResults[filters.evaluationYear]))
      && (!filters.latestEvaluationGrade || record.latestEvaluationGrade === filters.latestEvaluationGrade)
      && (!filters.latestEvaluationStatus || record.latestEvaluationStatus === filters.latestEvaluationStatus)
      && (!filters.anyYearGrade || yearly.some((item) => item.evaluationGrade === filters.anyYearGrade))
      && (!filters.hasLatestResult || (filters.hasLatestResult === 'yes' ? Boolean(record.latestEvaluationResultRaw) : !record.latestEvaluationResultRaw))
      && (!filters.closedOrSuspended || (filters.closedOrSuspended === 'yes' ? yearly.some((item) => item.evaluationGrade === 'closed_or_suspended') : !yearly.some((item) => item.evaluationGrade === 'closed_or_suspended')))
      && (!filters.specialNote || (filters.specialNote === 'yes' ? record.specialNoteCount > 0 : record.specialNoteCount === 0));
  });
}
