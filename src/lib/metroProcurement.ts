import type {
  MetroProcurementFilters, MetroProcurementScheduleRecord, MetroProcurementScheduleSummary,
  ProcurementSubjectCategory, TenderMethod,
} from '../types';

export function classifyProcurementSubjectCategory(raw?: string): ProcurementSubjectCategory {
  const text = raw?.trim() ?? '';
  if (!text) return 'unknown';
  if (text.includes('財物')) return 'goods';
  if (text.includes('勞務')) return 'services';
  if (text.includes('工程')) return 'works';
  return 'other';
}

export function classifyTenderMethod(raw?: string): TenderMethod {
  const text = raw?.trim() ?? '';
  if (!text) return 'unknown';
  if (text.includes('公開取得報價單') || text.includes('企劃書')) return 'public_quotation_or_proposal';
  if (text.includes('公開評選') || text.includes('公開徵求') || text.includes('限制性招標')) return 'selective_limited_tender_after_public_review';
  if (text.includes('公開招標')) return 'open_tender';
  return 'other';
}

export function parseRocYearMonth(raw: unknown) {
  const periodRocYearMonth = String(raw ?? '').trim();
  const compact = periodRocYearMonth.replace(/[/-]/g, '');
  if (!/^\d{5,6}$/.test(compact)) return { periodRocYearMonth, warning: 'Unsupported year-month format' };
  const yearDigits = compact.length === 6 ? 4 : 3;
  const sourceYear = Number(compact.slice(0, yearDigits));
  const periodMonth = Number(compact.slice(yearDigits));
  const periodYear = yearDigits === 3 ? sourceYear + 1911 : sourceYear;
  if (periodMonth < 1 || periodMonth > 12 || periodYear < 2000) return { periodRocYearMonth, warning: 'Invalid year-month value' };
  return {
    periodRocYearMonth,
    periodRocYear: yearDigits === 3 ? sourceYear : undefined,
    periodYear,
    periodMonth,
    periodKey: `${periodYear}-${String(periodMonth).padStart(2, '0')}`,
  };
}

export function parseBudgetOrTenderMethod(raw: unknown) {
  const budgetAmountRaw = String(raw ?? '').trim() || undefined;
  if (!budgetAmountRaw) return { tenderMethod: 'unknown' as const };
  const numeric = budgetAmountRaw.replaceAll(',', '');
  if (/^-?\d+(?:\.\d+)?$/.test(numeric)) {
    return { budgetAmountRaw, budgetAmountNtd: Number(numeric), tenderMethod: 'unknown' as const };
  }
  const tenderMethod = classifyTenderMethod(budgetAmountRaw);
  if (tenderMethod !== 'other') return { budgetAmountRaw, tenderMethodRaw: budgetAmountRaw, tenderMethod };
  return { budgetAmountRaw, tenderMethod, warning: 'Unexpected budget column value' };
}

export function classifyProcurementCaseKeywords(caseName: string) {
  const rules: Array<[string, RegExp]> = [
    ['station_facility', /(站|車站|出入口|月臺|導盲磚|機廠)/],
    ['rolling_stock', /(電聯車|列車|車門|車側|煞車|轉轍器)/],
    ['elevator_escalator', /(電梯|扶梯|升降機|變頻器)/],
    ['signal_control', /(號誌|訊號|監控|控制|預警)/],
    ['power_electrical', /(電力|機電|低壓|配電|電容器|電源)/],
    ['fire_safety', /(消防|防火)/],
    ['air_conditioning', /(冷氣|空調|空氣)/],
    ['civil_works', /(土建|工程|隧道|排水|隔音牆|包板)/],
    ['security', /(保全|警衛)/],
    ['cable_car', /(貓空|纜車)/],
    ['children_amusement_park', /(兒童新樂園|遊具)/],
    ['it_system', /(系統|伺服器|應用|資訊|軟體|卡)/],
    ['maintenance', /(保養|維護|改善|更換|重置)/],
  ];
  const tags = rules.filter(([, pattern]) => pattern.test(caseName.trim())).map(([tag]) => tag);
  return [...new Set(tags.length ? tags : ['other'])];
}

function countBy<T extends string>(values: T[]) {
  const counts = new Map<T, number>();
  values.forEach((value) => counts.set(value, (counts.get(value) ?? 0) + 1));
  return [...counts].sort((a, b) => b[1] - a[1]);
}

export function buildMetroProcurementSummary(records: MetroProcurementScheduleRecord[]): MetroProcurementScheduleSummary {
  const periods = [...new Set(records.flatMap((record) => record.periodKey ?? []))].sort();
  return {
    totalRecords: records.length,
    periodCount: periods.length,
    minPeriodKey: periods[0],
    maxPeriodKey: periods.at(-1),
    recordsWithNumericBudgetAmount: records.filter((record) => record.budgetAmountNtd !== undefined).length,
    recordsWithTextualBudgetColumn: records.filter((record) => record.budgetAmountRaw && record.budgetAmountNtd === undefined).length,
    byPeriod: periods.map((periodKey) => {
      const rows = records.filter((record) => record.periodKey === periodKey);
      return {
        periodKey, periodYear: rows[0]?.periodYear, periodMonth: rows[0]?.periodMonth, recordCount: rows.length,
        goodsCount: rows.filter((row) => row.subjectCategory === 'goods').length,
        servicesCount: rows.filter((row) => row.subjectCategory === 'services').length,
        worksCount: rows.filter((row) => row.subjectCategory === 'works').length,
        otherSubjectCount: rows.filter((row) => !['goods', 'services', 'works'].includes(row.subjectCategory)).length,
      };
    }),
    bySubjectCategory: countBy(records.map((record) => record.subjectCategory)).map(([subjectCategory, count]) => ({
      subjectCategory, subjectCategoryRaw: records.find((record) => record.subjectCategory === subjectCategory)?.subjectCategoryRaw, count,
    })),
    byTenderMethod: countBy(records.map((record) => record.tenderMethod)).map(([tenderMethod, count]) => ({
      tenderMethod, tenderMethodRaw: records.find((record) => record.tenderMethod === tenderMethod)?.tenderMethodRaw, count,
    })),
    keywordFrequency: countBy(records.flatMap((record) => record.derivedKeywordGroups)).map(([keyword, count]) => ({ keyword, count })),
  };
}

export function filterMetroProcurement(records: MetroProcurementScheduleRecord[], filters: MetroProcurementFilters) {
  const query = filters.search.trim().toLocaleLowerCase();
  return records.filter((record) => {
    const text = [record.caseName, record.budgetAmountRaw, record.tenderMethodRaw, record.subjectCategoryRaw, record.periodKey].filter(Boolean).join(' ').toLocaleLowerCase();
    return (!query || text.includes(query))
      && (!filters.periodYear || record.periodYear === Number(filters.periodYear))
      && (!filters.periodMonth || record.periodMonth === Number(filters.periodMonth))
      && (!filters.periodKey || record.periodKey === filters.periodKey)
      && (!filters.subjectCategory || record.subjectCategory === filters.subjectCategory)
      && (!filters.tenderMethod || record.tenderMethod === filters.tenderMethod)
      && (!filters.keywordGroup || record.derivedKeywordGroups.includes(filters.keywordGroup))
      && (!filters.budgetStatus || (filters.budgetStatus === 'numeric' ? record.budgetAmountNtd !== undefined : record.budgetAmountNtd === undefined));
  });
}
