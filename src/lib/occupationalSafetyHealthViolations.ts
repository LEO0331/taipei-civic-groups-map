import type { OccupationalSafetyHealthViolationContentCategory, OccupationalSafetyHealthViolationFilters, OccupationalSafetyHealthViolationRecord, OccupationalSafetyHealthViolationSummary } from '../types';

export function cleanOshText(raw: unknown) {
  const value = String(raw ?? '').replace(/\u3000/g, ' ').trim();
  return value && !['-', '--', 'nan', 'null', 'NULL', 'NaN', '尚無資料'].includes(value) ? value.replace(/[ \t]+/g, ' ') : undefined;
}
export const normalizeOshText = (raw: unknown) => cleanOshText(raw)?.replaceAll('台', '臺').toLocaleLowerCase();

export function parseTaipeiViolationDate(raw: unknown) {
  const value = cleanOshText(raw);
  if (!value) return { raw: undefined, date: undefined, year: undefined, month: undefined, yearMonth: undefined, warning: undefined };
  const compact = value.match(/^(\d{3})(\d{2})(\d{2})$/);
  const parts = compact ? [compact[1], compact[2], compact[3]] : value.replace(/^民國/, '').replace(/[年月]/g, '/').replace(/日$/, '').split(/[/-]/);
  if (parts.length !== 3) return { raw: value, date: undefined, year: undefined, month: undefined, yearMonth: undefined, warning: 'Invalid date format' };
  const rawYear = Number(parts[0]), year = rawYear < 1911 ? rawYear + 1911 : rawYear, month = Number(parts[1]), day = Number(parts[2]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (!year || !month || !day || date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    return { raw: value, date: undefined, year: undefined, month: undefined, yearMonth: undefined, warning: 'Invalid date value' };
  }
  const iso = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  return { raw: value, date: iso, year, month, yearMonth: iso.slice(0, 7), warning: undefined };
}

export const parsePenaltyDocumentNumber = (raw: unknown) => {
  const penaltyDocumentNumber = cleanOshText(raw);
  return { penaltyDocumentNumber, penaltyDocumentNumberNormalized: penaltyDocumentNumber?.replace(/\s+/g, '') };
};
export const parseBusinessOrOrganizationName = (raw: unknown) => {
  const businessOrOrganizationName = cleanOshText(raw);
  return { businessOrOrganizationName, businessOrOrganizationNameNormalized: normalizeOshText(businessOrOrganizationName) };
};
export const parseResponsiblePersonName = (raw: unknown) => {
  const responsiblePersonName = cleanOshText(raw);
  return { responsiblePersonName, responsiblePersonNameNormalized: normalizeOshText(responsiblePersonName) };
};

export function parseViolatedOshActArticle(raw: unknown) {
  const violatedOshActArticleRaw = cleanOshText(raw);
  const violatedOshActArticle = violatedOshActArticleRaw;
  const violatedOshActArticleNormalized = normalizeOshText(raw);
  const violatedArticleTokens = [...new Set(violatedOshActArticleRaw?.match(/第[\d一二三四五六七八九十百-]+條/g) ?? [])];
  return { violatedOshActArticleRaw, violatedOshActArticle, violatedOshActArticleNormalized, violatedArticleTokens };
}

export function classifyOccupationalSafetyHealthViolationContent(raw: string | undefined): OccupationalSafetyHealthViolationContentCategory[] {
  const text = raw?.trim() ?? '', categories = new Set<OccupationalSafetyHealthViolationContentCategory>();
  if (!text) return ['unknown'];
  if (/墜落|高處|開口|護欄|施工架/.test(text)) categories.add('fall_prevention');
  if (/營造|工地|模板|施工|承攬/.test(text)) categories.add('construction_safety');
  if (/機械|設備|機具|防護|捲夾/.test(text)) categories.add('machinery_equipment_safety');
  if (/電|感電|漏電|接地/.test(text)) categories.add('electrical_safety');
  if (/化學|有害|危害物|毒性|粉塵|溶劑/.test(text)) categories.add('chemical_or_hazardous_substance');
  if (/健康檢查|健康管理|職業病|醫護/.test(text)) categories.add('health_management');
  if (/教育訓練|訓練|安全衛生教育/.test(text)) categories.add('education_training');
  if (/承攬|再承攬|共同作業|協議組織/.test(text)) categories.add('contractor_management');
  if (/申報|紀錄|計畫|文件|備查/.test(text)) categories.add('reporting_or_documentation');
  if (/通風|照明|噪音|溫度|作業環境/.test(text)) categories.add('work_environment');
  return categories.size ? [...categories] : ['other'];
}

export function parseOshViolationContent(raw: unknown) {
  const violationContent = cleanOshText(raw), violationContentNormalized = normalizeOshText(violationContent);
  return { violationContent, violationContentNormalized, violationContentCategories: classifyOccupationalSafetyHealthViolationContent(violationContent) };
}
export const parseViolationNote = (raw: unknown) => {
  const note = cleanOshText(raw);
  return { note, hasNote: Boolean(note) };
};
export function calculateDaysBetweenPenaltyAndAnnouncement({ penaltyDate, announcementDate }: { penaltyDate?: string; announcementDate?: string }) {
  if (!penaltyDate || !announcementDate) return undefined;
  return Math.round((Date.parse(announcementDate) - Date.parse(penaltyDate)) / 86400000);
}

const countBy = <T extends string>(values: T[]) => [...values.reduce((m, v) => m.set(v, (m.get(v) ?? 0) + 1), new Map<T, number>())]
  .map(([key, count]) => ({ key, count })).sort((a, b) => b.count - a.count || a.key.localeCompare(b.key, 'zh-Hant'));
const duplicateRowCount = (values: Array<string | undefined>) => countBy(values.filter(Boolean) as string[]).filter((item) => item.count > 1).reduce((sum, item) => sum + item.count - 1, 0);
const uniqueBusinesses = (records: OccupationalSafetyHealthViolationRecord[]) => new Set(records.map((r) => r.businessOrOrganizationNameNormalized).filter(Boolean)).size;
const latest = (values: Array<string | undefined>) => values.filter(Boolean).sort().at(-1);
const lagBucket = (days?: number) => days === undefined ? 'unknown' : days < 0 ? 'negative' : days <= 30 ? '0-30' : days <= 90 ? '31-90' : days <= 180 ? '91-180' : '181+';

export function buildOccupationalSafetyHealthViolationSummary(records: OccupationalSafetyHealthViolationRecord[]): OccupationalSafetyHealthViolationSummary {
  const announcementDates = records.flatMap((r) => r.announcementDate ?? []).sort(), penaltyDates = records.flatMap((r) => r.penaltyDate ?? []).sort();
  const byBusiness = countBy(records.map((r) => r.businessOrOrganizationNameNormalized ?? r.businessOrOrganizationName)).map(({ key, count }) => {
    const rows = records.filter((r) => (r.businessOrOrganizationNameNormalized ?? r.businessOrOrganizationName) === key);
    return { businessOrOrganizationName: rows[0]?.businessOrOrganizationName ?? key, count, latestAnnouncementDate: latest(rows.map((r) => r.announcementDate)), latestPenaltyDate: latest(rows.map((r) => r.penaltyDate)) };
  });
  return {
    totalRecords: records.length,
    minAnnouncementDate: announcementDates[0], maxAnnouncementDate: announcementDates.at(-1), minPenaltyDate: penaltyDates[0], maxPenaltyDate: penaltyDates.at(-1),
    announcementYearCount: new Set(records.flatMap((r) => r.announcementYear ?? [])).size,
    penaltyYearCount: new Set(records.flatMap((r) => r.penaltyYear ?? [])).size,
    uniqueBusinessOrOrganizationNameCount: uniqueBusinesses(records),
    uniqueResponsiblePersonNameCount: new Set(records.flatMap((r) => r.responsiblePersonNameNormalized ?? [])).size,
    uniquePenaltyDocumentNumberCount: new Set(records.flatMap((r) => r.penaltyDocumentNumberNormalized ?? [])).size,
    uniqueViolatedArticleCount: new Set(records.flatMap((r) => r.violatedArticleTokens)).size,
    recordsWithResponsiblePersonName: records.filter((r) => r.responsiblePersonName).length,
    recordsWithViolationContent: records.filter((r) => r.violationContent).length,
    recordsWithNote: records.filter((r) => r.hasNote).length,
    byAnnouncementYear: countBy(records.flatMap((r) => r.announcementYear === undefined ? [] : [String(r.announcementYear)])).map(({ key, count }) => ({ year: Number(key), count, uniqueBusinessOrOrganizationNameCount: uniqueBusinesses(records.filter((r) => r.announcementYear === Number(key))) })).sort((a, b) => a.year - b.year),
    byAnnouncementYearMonth: countBy(records.flatMap((r) => r.announcementYearMonth ?? [])).map(({ key, count }) => ({ yearMonth: key, count, uniqueBusinessOrOrganizationNameCount: uniqueBusinesses(records.filter((r) => r.announcementYearMonth === key)) })).sort((a, b) => a.yearMonth.localeCompare(b.yearMonth)),
    byPenaltyYear: countBy(records.flatMap((r) => r.penaltyYear === undefined ? [] : [String(r.penaltyYear)])).map(({ key, count }) => ({ year: Number(key), count, uniqueBusinessOrOrganizationNameCount: uniqueBusinesses(records.filter((r) => r.penaltyYear === Number(key))) })).sort((a, b) => a.year - b.year),
    byViolatedArticle: countBy(records.flatMap((r) => r.violatedArticleTokens)).map(({ key, count }) => ({ violatedArticle: key, count, uniqueBusinessOrOrganizationNameCount: uniqueBusinesses(records.filter((r) => r.violatedArticleTokens.includes(key))) })),
    byViolationContentCategory: countBy(records.flatMap((r) => r.violationContentCategories)).map(({ key, count }) => ({ category: key, count, uniqueBusinessOrOrganizationNameCount: uniqueBusinesses(records.filter((r) => r.violationContentCategories.includes(key))) })),
    byAnnouncementPenaltyLagBucket: countBy(records.map((r) => lagBucket(r.daysBetweenPenaltyAndAnnouncement))).map(({ key: bucket, count }) => ({ bucket, count })),
    topBusinessOrOrganizationNames: byBusiness.slice(0, 30),
    topResponsiblePersonNames: countBy(records.flatMap((r) => r.responsiblePersonNameNormalized ?? [])).slice(0, 30).map(({ key, count }) => ({ responsiblePersonName: records.find((r) => r.responsiblePersonNameNormalized === key)?.responsiblePersonName ?? key, count })),
    dataQuality: {
      missingAnnouncementDateCount: records.filter((r) => !r.announcementDateRaw).length,
      invalidAnnouncementDateCount: records.filter((r) => r.announcementDateRaw && !r.announcementDate).length,
      missingPenaltyDateCount: records.filter((r) => !r.penaltyDateRaw).length,
      invalidPenaltyDateCount: records.filter((r) => r.penaltyDateRaw && !r.penaltyDate).length,
      missingPenaltyDocumentNumberCount: records.filter((r) => !r.penaltyDocumentNumber).length,
      missingBusinessOrOrganizationNameCount: records.filter((r) => !r.businessOrOrganizationName).length,
      missingResponsiblePersonNameCount: records.filter((r) => !r.responsiblePersonName).length,
      missingViolatedArticleCount: records.filter((r) => !r.violatedOshActArticle).length,
      missingViolationContentCount: records.filter((r) => !r.violationContent).length,
      duplicatePenaltyDocumentNumberCount: duplicateRowCount(records.map((r) => r.penaltyDocumentNumberNormalized)),
      duplicateFallbackKeyCount: duplicateRowCount(records.map((r) => [r.announcementDate, r.penaltyDate, r.businessOrOrganizationNameNormalized, r.violatedOshActArticleNormalized, r.violationContentNormalized].filter(Boolean).join('|'))),
    },
  };
}

export function filterOccupationalSafetyHealthViolationRecords(records: OccupationalSafetyHealthViolationRecord[], filters: OccupationalSafetyHealthViolationFilters) {
  const query = filters.search.trim().toLocaleLowerCase();
  return records.filter((r) => (!query || [r.businessOrOrganizationName, r.responsiblePersonName, r.penaltyDocumentNumber, r.violatedOshActArticle, r.violationContent, r.note, r.announcementDate, r.penaltyDate].filter(Boolean).join(' ').toLocaleLowerCase().includes(query))
    && (!filters.announcementYear || r.announcementYear === Number(filters.announcementYear))
    && (!filters.announcementYearMonth || r.announcementYearMonth === filters.announcementYearMonth)
    && (!filters.announcementDateFrom || (r.announcementDate ?? '') >= filters.announcementDateFrom)
    && (!filters.announcementDateTo || (r.announcementDate ?? '') <= filters.announcementDateTo)
    && (!filters.penaltyYear || r.penaltyYear === Number(filters.penaltyYear))
    && (!filters.penaltyYearMonth || r.penaltyYearMonth === filters.penaltyYearMonth)
    && (!filters.penaltyDateFrom || (r.penaltyDate ?? '') >= filters.penaltyDateFrom)
    && (!filters.penaltyDateTo || (r.penaltyDate ?? '') <= filters.penaltyDateTo)
    && (!filters.violatedArticle || r.violatedArticleTokens.includes(filters.violatedArticle))
    && (!filters.violationContentCategory || r.violationContentCategories.includes(filters.violationContentCategory as OccupationalSafetyHealthViolationContentCategory))
    && (!filters.hasNote || (filters.hasNote === 'yes' ? r.hasNote : !r.hasNote))
    && (!filters.businessOrOrganizationName || r.businessOrOrganizationNameNormalized === filters.businessOrOrganizationName)
    && (!filters.penaltyDocumentNumber || r.penaltyDocumentNumberNormalized === filters.penaltyDocumentNumber));
}
