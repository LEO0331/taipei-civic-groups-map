import type { FineAmountCategory, GenderEqualityWorkActNameVersion, GenderEqualityWorkActViolationFilters, GenderEqualityWorkActViolationRecord, GenderEqualityWorkActViolationSummary, GenderEqualityWorkViolationContentCategory } from '../types';

const missingValues = new Set(['', '-', '--', 'nan', 'null', '尚無資料']);
export function cleanGenderEqualityText(raw: unknown) {
  const text = String(raw ?? '').replace(/\u3000/g, ' ').trim();
  return missingValues.has(text.toLowerCase()) ? undefined : text.replace(/[ \t]+/g, ' ');
}
const normalize = (raw: unknown) => cleanGenderEqualityText(raw)?.replaceAll('台', '臺').toLocaleLowerCase();
export const parseIntegerText = (raw: unknown) => {
  const text = cleanGenderEqualityText(raw)?.replaceAll(',', '');
  const value = text === undefined ? undefined : Number(text);
  return Number.isInteger(value) ? value : undefined;
};

export function parseTaipeiLaborPublicationDate(raw: unknown) {
  const value = cleanGenderEqualityText(raw);
  if (!value || value === '無') return { raw: value, date: undefined, year: undefined, month: undefined, yearMonth: undefined, warning: undefined };
  const compact = value.match(/^(\d{3})(\d{2})(\d{2})$/);
  const parts = compact ? [compact[1], compact[2], compact[3]] : value.replace(/^民國/, '').replace(/[年月]/g, '/').replace(/日$/, '').split(/[/-]/);
  if (parts.length !== 3) return { raw: value, date: undefined, year: undefined, month: undefined, yearMonth: undefined, warning: 'Invalid date format' };
  const rawYear = Number(parts[0]), year = rawYear < 1911 ? rawYear + 1911 : rawYear, month = Number(parts[1]), day = Number(parts[2]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (!year || !month || !day || date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return { raw: value, date: undefined, year: undefined, month: undefined, yearMonth: undefined, warning: 'Invalid date value' };
  const iso = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  return { raw: value, date: iso, year, month, yearMonth: iso.slice(0, 7), warning: undefined };
}

export const parsePenaltyDocumentNumber = (raw: unknown, noViolation = false) => {
  const penaltyDocumentNumber = cleanGenderEqualityText(raw);
  const value = noViolation && penaltyDocumentNumber === '無' ? undefined : penaltyDocumentNumber;
  return { penaltyDocumentNumber: value, penaltyDocumentNumberNormalized: value?.replace(/\s+/g, '') };
};
export const parseBusinessOrganizationOrNaturalPersonName = (raw: unknown, noViolation = false) => {
  const businessOrganizationOrNaturalPersonName = cleanGenderEqualityText(raw);
  const value = noViolation && businessOrganizationOrNaturalPersonName === '無' ? '本期無違規' : businessOrganizationOrNaturalPersonName;
  return { businessOrganizationOrNaturalPersonName: value, businessOrganizationOrNaturalPersonNameNormalized: normalize(value) };
};
export const parseRepresentativeName = (raw: unknown, noViolation = false) => {
  const representativeName = cleanGenderEqualityText(raw);
  const value = noViolation && representativeName === '無' ? undefined : representativeName;
  return { representativeName: value, representativeNameNormalized: normalize(value) };
};
export function classifyGenderEqualityActNameVersion(raw: string | undefined): GenderEqualityWorkActNameVersion {
  const text = raw?.trim() ?? '';
  if (!text || text === '無') return 'none';
  const current = text.includes('性別平等工作法'), old = text.includes('性別工作平等法');
  return current && old ? 'mixed_or_unclear' : current ? 'gender_equality_in_employment_act' : old ? 'act_of_gender_equality_in_employment_old_name' : 'unknown';
}
export function parseViolatedGenderEqualityWorkActArticle(raw: unknown, noViolation = false) {
  const violatedGenderEqualityWorkActArticleRaw = cleanGenderEqualityText(raw);
  const value = noViolation && violatedGenderEqualityWorkActArticleRaw === '無' ? undefined : violatedGenderEqualityWorkActArticleRaw;
  return {
    violatedGenderEqualityWorkActArticleRaw: value,
    violatedGenderEqualityWorkActArticle: value,
    violatedGenderEqualityWorkActArticleNormalized: normalize(value),
    violatedArticleTokens: [...new Set(value?.match(/第[\d一二三四五六七八九十百]+條(?:第[\d一二三四五六七八九十百]+項)?/g) ?? [])],
    actNameVersion: classifyGenderEqualityActNameVersion(value),
  };
}
export function classifyGenderEqualityWorkViolationContent(raw: string | undefined): GenderEqualityWorkViolationContentCategory[] {
  const text = raw?.trim() ?? '', out = new Set<GenderEqualityWorkViolationContentCategory>();
  if (!text) return ['unknown'];
  if (text === '無' || text.includes('本期無違反')) return ['no_violation_period'];
  if (/性騷擾|防治義務|申訴|懲戒辦法/.test(text)) out.add('workplace_sexual_harassment_prevention');
  if (/懷孕|分娩|流產|產假/.test(text)) out.add('pregnancy_discrimination');
  if (/性別|性傾向|差別待遇/.test(text)) out.add('gender_or_sexual_orientation_discrimination');
  if (/育嬰|留職停薪|哺乳|家庭照顧|陪產/.test(text)) out.add('parental_leave_or_childcare_rights');
  if (/不利處分|報復|解僱|資遣|離職/.test(text)) out.add('retaliation_or_adverse_treatment');
  if (/招募|甄試|進用|僱用/.test(text)) out.add('recruitment_or_employment_discrimination');
  if (/退休|資遣|離職|解僱/.test(text)) out.add('retirement_severance_resignation_dismissal_discrimination');
  if (/未訂定|公開揭示|申訴及懲戒/.test(text)) out.add('complaint_or_prevention_procedure');
  return out.size ? [...out] : ['other'];
}
export function parseGenderEqualityWorkViolationContent(raw: unknown, noViolation = false) {
  const violationContent = cleanGenderEqualityText(raw);
  const value = noViolation && violationContent === '無' ? undefined : violationContent;
  return { violationContent: value, violationContentNormalized: normalize(value), violationContentCategories: noViolation ? ['no_violation_period' as const] : classifyGenderEqualityWorkViolationContent(value) };
}
export function classifyFineAmount(amount: number | undefined, raw: string | undefined): FineAmountCategory {
  const text = raw?.trim() ?? '';
  if (!text) return 'missing';
  if (text === '無') return 'none_or_not_applicable';
  if (amount === undefined || !Number.isFinite(amount)) return 'unknown';
  return amount < 50000 ? 'under_50000' : amount < 100000 ? '50000_to_99999' : amount < 300000 ? '100000_to_299999' : amount < 500000 ? '300000_to_499999' : '500000_or_more';
}
export function parseFineAmount(raw: unknown) {
  const fineAmountRaw = cleanGenderEqualityText(raw);
  const text = fineAmountRaw?.replace(/[,$NTD新臺幣元\s]/g, '');
  const fineAmount = text && text !== '無' ? Number(text) : undefined;
  const amount = Number.isInteger(fineAmount) ? fineAmount : undefined;
  return { fineAmountRaw, fineAmount: amount, fineAmountCategory: classifyFineAmount(amount, fineAmountRaw), hasFineAmount: amount !== undefined };
}
export const parseViolationNote = (raw: unknown) => { const note = cleanGenderEqualityText(raw); return { note, hasNote: Boolean(note) }; };
export function detectNoViolationPeriodRecord(args: { businessOrganizationOrNaturalPersonName?: string; representativeName?: string; violatedArticle?: string; violationContent?: string; note?: string }) {
  return Boolean(args.note?.includes('本期無違反性別平等工作法之事業單位') || args.note?.includes('本期無違反性別工作平等法之事業單位') || ([args.businessOrganizationOrNaturalPersonName, args.representativeName, args.violatedArticle, args.violationContent].every((v) => !v || v === '無') && args.note?.includes('本期無違反')));
}
export function calculateDaysBetweenPenaltyAndAnnouncement({ penaltyDate, announcementDate }: { penaltyDate?: string; announcementDate?: string }) {
  return penaltyDate && announcementDate ? Math.round((Date.parse(announcementDate) - Date.parse(penaltyDate)) / 86400000) : undefined;
}

const countBy = <T extends string>(values: T[]) => [...values.reduce((m, v) => m.set(v, (m.get(v) ?? 0) + 1), new Map<T, number>())].map(([key, count]) => ({ key, count })).sort((a, b) => b.count - a.count || a.key.localeCompare(b.key, 'zh-Hant'));
const dupCount = (values: Array<string | undefined>) => countBy(values.filter(Boolean) as string[]).filter((v) => v.count > 1).reduce((sum, v) => sum + v.count - 1, 0);
const uniqNames = (rows: GenderEqualityWorkActViolationRecord[]) => new Set(rows.flatMap((r) => r.businessOrganizationOrNaturalPersonNameNormalized ?? [])).size;
const sumFine = (rows: GenderEqualityWorkActViolationRecord[]) => { const sum = rows.reduce((n, r) => n + (r.fineAmount ?? 0), 0); return sum || undefined; };
const latest = (values: Array<string | undefined>) => values.filter(Boolean).sort().at(-1);
const lagBucket = (days?: number) => days === undefined ? 'unknown' : days < 0 ? 'negative' : days <= 30 ? '0-30' : days <= 90 ? '31-90' : days <= 180 ? '91-180' : '181+';

export function buildGenderEqualityWorkActViolationSummary(records: GenderEqualityWorkActViolationRecord[]): GenderEqualityWorkActViolationSummary {
  const violations = records.filter((r) => !r.isNoViolationPeriodRecord), fines = violations.flatMap((r) => r.fineAmount ?? []).sort((a, b) => a - b);
  const announcementDates = records.flatMap((r) => r.announcementDate ?? []).sort(), penaltyDates = records.flatMap((r) => r.penaltyDate ?? []).sort();
  const byName = countBy(violations.map((r) => r.businessOrganizationOrNaturalPersonNameNormalized ?? r.businessOrganizationOrNaturalPersonName)).map(({ key, count }) => {
    const rows = violations.filter((r) => (r.businessOrganizationOrNaturalPersonNameNormalized ?? r.businessOrganizationOrNaturalPersonName) === key);
    return { name: rows[0]?.businessOrganizationOrNaturalPersonName ?? key, count, latestAnnouncementDate: latest(rows.map((r) => r.announcementDate)), latestPenaltyDate: latest(rows.map((r) => r.penaltyDate)), totalFineAmount: sumFine(rows) };
  });
  const byYear = countBy(records.flatMap((r) => r.announcementYear === undefined ? [] : [String(r.announcementYear)]));
  return {
    totalRecords: records.length, violationRecordCount: violations.length, noViolationPeriodRecordCount: records.length - violations.length,
    minAnnouncementDate: announcementDates[0], maxAnnouncementDate: announcementDates.at(-1), minPenaltyDate: penaltyDates[0], maxPenaltyDate: penaltyDates.at(-1),
    announcementYearCount: new Set(records.flatMap((r) => r.announcementYear ?? [])).size, penaltyYearCount: new Set(records.flatMap((r) => r.penaltyYear ?? [])).size,
    uniqueBusinessOrganizationOrNaturalPersonNameCount: uniqNames(violations), uniqueRepresentativeNameCount: new Set(violations.flatMap((r) => r.representativeNameNormalized ?? [])).size, uniquePenaltyDocumentNumberCount: new Set(violations.flatMap((r) => r.penaltyDocumentNumberNormalized ?? [])).size, uniqueViolatedArticleCount: new Set(violations.flatMap((r) => r.violatedArticleTokens)).size,
    recordsWithRepresentativeName: violations.filter((r) => r.representativeName).length, recordsWithViolationContent: violations.filter((r) => r.violationContent).length, recordsWithFineAmount: violations.filter((r) => r.hasFineAmount).length, recordsWithNote: records.filter((r) => r.hasNote).length,
    totalFineAmount: sumFine(violations), minFineAmount: fines[0], maxFineAmount: fines.at(-1), averageFineAmount: fines.length ? Math.round(fines.reduce((a, b) => a + b, 0) / fines.length) : undefined, medianFineAmount: fines.length ? fines[Math.floor(fines.length / 2)] : undefined,
    byAnnouncementYear: byYear.map(({ key, count }) => { const rows = records.filter((r) => r.announcementYear === Number(key)); return { year: Number(key), count, violationRecordCount: rows.filter((r) => !r.isNoViolationPeriodRecord).length, noViolationPeriodRecordCount: rows.filter((r) => r.isNoViolationPeriodRecord).length, uniqueNameCount: uniqNames(rows), totalFineAmount: sumFine(rows) }; }).sort((a, b) => a.year - b.year),
    byAnnouncementYearMonth: countBy(records.flatMap((r) => r.announcementYearMonth ?? [])).map(({ key, count }) => { const rows = records.filter((r) => r.announcementYearMonth === key); return { yearMonth: key, count, violationRecordCount: rows.filter((r) => !r.isNoViolationPeriodRecord).length, noViolationPeriodRecordCount: rows.filter((r) => r.isNoViolationPeriodRecord).length, uniqueNameCount: uniqNames(rows), totalFineAmount: sumFine(rows) }; }).sort((a, b) => a.yearMonth.localeCompare(b.yearMonth)),
    byPenaltyYear: countBy(violations.flatMap((r) => r.penaltyYear === undefined ? [] : [String(r.penaltyYear)])).map(({ key, count }) => ({ year: Number(key), count, uniqueNameCount: uniqNames(violations.filter((r) => r.penaltyYear === Number(key))), totalFineAmount: sumFine(violations.filter((r) => r.penaltyYear === Number(key))) })).sort((a, b) => a.year - b.year),
    byViolatedArticle: countBy(violations.flatMap((r) => r.violatedArticleTokens)).map(({ key, count }) => ({ violatedArticle: key, count, uniqueNameCount: uniqNames(violations.filter((r) => r.violatedArticleTokens.includes(key))), totalFineAmount: sumFine(violations.filter((r) => r.violatedArticleTokens.includes(key))) })),
    byViolationContentCategory: countBy(records.flatMap((r) => r.violationContentCategories)).map(({ key, count }) => ({ category: key, count, uniqueNameCount: uniqNames(records.filter((r) => r.violationContentCategories.includes(key))), totalFineAmount: sumFine(records.filter((r) => r.violationContentCategories.includes(key))) })),
    byFineAmountCategory: countBy(records.map((r) => r.fineAmountCategory)).map(({ key, count }) => ({ fineAmountCategory: key, count })),
    byActNameVersion: countBy(records.map((r) => r.actNameVersion)).map(({ key, count }) => ({ actNameVersion: key, count })),
    byAnnouncementPenaltyLagBucket: countBy(records.map((r) => lagBucket(r.daysBetweenPenaltyAndAnnouncement))).map(({ key: bucket, count }) => ({ bucket, count })),
    topBusinessOrganizationOrNaturalPersonNames: byName.slice(0, 30), topViolationContents: countBy(violations.flatMap((r) => r.violationContent ?? [])).slice(0, 30).map(({ key, count }) => ({ violationContent: key, count })),
    dataQuality: {
      missingAnnouncementDateCount: records.filter((r) => !r.announcementDateRaw).length, invalidAnnouncementDateCount: records.filter((r) => r.announcementDateRaw && !r.announcementDate).length,
      missingPenaltyDateCount: violations.filter((r) => !r.penaltyDateRaw).length, invalidPenaltyDateCount: violations.filter((r) => r.penaltyDateRaw && !r.penaltyDate).length,
      missingPenaltyDocumentNumberCount: violations.filter((r) => !r.penaltyDocumentNumber).length, missingBusinessOrganizationOrNaturalPersonNameCount: violations.filter((r) => !r.businessOrganizationOrNaturalPersonName).length,
      missingRepresentativeNameCount: violations.filter((r) => !r.representativeName).length, missingViolatedArticleCount: violations.filter((r) => !r.violatedGenderEqualityWorkActArticle).length, missingViolationContentCount: violations.filter((r) => !r.violationContent).length,
      missingFineAmountCount: records.filter((r) => !r.fineAmountRaw).length, invalidFineAmountCount: records.filter((r) => r.fineAmountRaw && r.fineAmountRaw !== '無' && r.fineAmount === undefined).length,
      duplicatePenaltyDocumentNumberCount: dupCount(violations.map((r) => r.penaltyDocumentNumberNormalized)), duplicateFallbackKeyCount: dupCount(records.map((r) => [r.announcementDate, r.penaltyDate, r.businessOrganizationOrNaturalPersonNameNormalized, r.violatedGenderEqualityWorkActArticleNormalized, r.violationContentNormalized].filter(Boolean).join('|'))),
      noViolationRowsWithPenaltyDataCount: records.filter((r) => r.isNoViolationPeriodRecord && (r.penaltyDate || r.penaltyDocumentNumber)).length,
    },
  };
}

export function filterGenderEqualityWorkActViolationRecords(records: GenderEqualityWorkActViolationRecord[], filters: GenderEqualityWorkActViolationFilters) {
  const query = filters.search.trim().toLocaleLowerCase();
  return records.filter((r) => (filters.includeNoViolationPeriodRecords === 'yes' || !r.isNoViolationPeriodRecord)
    && (!query || [r.businessOrganizationOrNaturalPersonName, r.representativeName, r.penaltyDocumentNumber, r.violatedGenderEqualityWorkActArticle, r.violationContent, r.fineAmountRaw, r.note, r.announcementDate, r.penaltyDate].filter(Boolean).join(' ').toLocaleLowerCase().includes(query))
    && (!filters.announcementYear || r.announcementYear === Number(filters.announcementYear))
    && (!filters.announcementYearMonth || r.announcementYearMonth === filters.announcementYearMonth)
    && (!filters.announcementDateFrom || (r.announcementDate ?? '') >= filters.announcementDateFrom)
    && (!filters.announcementDateTo || (r.announcementDate ?? '') <= filters.announcementDateTo)
    && (!filters.penaltyYear || r.penaltyYear === Number(filters.penaltyYear))
    && (!filters.penaltyYearMonth || r.penaltyYearMonth === filters.penaltyYearMonth)
    && (!filters.penaltyDateFrom || (r.penaltyDate ?? '') >= filters.penaltyDateFrom)
    && (!filters.penaltyDateTo || (r.penaltyDate ?? '') <= filters.penaltyDateTo)
    && (!filters.violatedArticle || r.violatedArticleTokens.includes(filters.violatedArticle))
    && (!filters.actNameVersion || r.actNameVersion === filters.actNameVersion)
    && (!filters.violationContentCategory || r.violationContentCategories.includes(filters.violationContentCategory as GenderEqualityWorkViolationContentCategory))
    && (!filters.fineAmountCategory || r.fineAmountCategory === filters.fineAmountCategory)
    && (!filters.fineAmountMin || (r.fineAmount ?? -Infinity) >= Number(filters.fineAmountMin))
    && (!filters.fineAmountMax || (r.fineAmount ?? Infinity) <= Number(filters.fineAmountMax))
    && (!filters.hasFineAmount || (filters.hasFineAmount === 'yes' ? r.hasFineAmount : !r.hasFineAmount))
    && (!filters.hasNote || (filters.hasNote === 'yes' ? r.hasNote : !r.hasNote))
    && (!filters.name || r.businessOrganizationOrNaturalPersonNameNormalized === filters.name)
    && (!filters.penaltyDocumentNumber || r.penaltyDocumentNumberNormalized === filters.penaltyDocumentNumber));
}
