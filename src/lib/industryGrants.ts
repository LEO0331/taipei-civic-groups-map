import { DISTRICTS } from './civicGroups';
import type { IndustryGrantFilters, IndustryGrantRecipient, IndustryGrantSummary } from '../types';

export function parseRocDate(raw?: string): { date?: string; year?: number; month?: number; day?: number; warning?: string } {
  if (!raw) return {};
  const compact = raw.trim().replace(/[年月日./-]/g, '');
  if (!/^\d{6,8}$/.test(compact)) return { warning: 'Unsupported date format' };
  const yearDigits = compact.length === 8 ? 4 : compact.length - 4;
  const rawYear = Number(compact.slice(0, yearDigits));
  const year = yearDigits <= 3 ? rawYear + 1911 : rawYear;
  const month = Number(compact.slice(yearDigits, yearDigits + 2));
  const day = Number(compact.slice(yearDigits + 2));
  const date = new Date(Date.UTC(year, month - 1, day));
  if (year < 1800 || date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    return { warning: 'Invalid calendar date' };
  }
  return { date: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`, year, month, day };
}

export function parseNtdAmount(raw: unknown): number | undefined {
  const value = String(raw ?? '').replaceAll(',', '').trim();
  if (!value) return undefined;
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : undefined;
}

export function normalizeGrantDistrict(raw?: string) {
  const value = raw?.trim();
  if (!value) return undefined;
  return DISTRICTS.find((district) => value === district || value === district.slice(0, -1)) ?? value;
}

export function buildIndustryGrantSummary(records: IndustryGrantRecipient[]): IndustryGrantSummary {
  const amounts = records.flatMap((record) => record.approvedSubsidyNtd ?? []).sort((a, b) => a - b);
  const sum = (values: Array<number | undefined>) => values.reduce<number>((total, value) => total + (value ?? 0), 0);
  const group = <T extends string | number>(values: T[]) => {
    const grouped = new Map<T, IndustryGrantRecipient[]>();
    values.forEach((value, index) => grouped.set(value, [...(grouped.get(value) ?? []), records[index]]));
    return grouped;
  };
  const byYear = group(records.map((record) => record.subsidyYear ?? 0));
  const byDistrict = group(records.map((record) => record.registeredDistrict ?? ''));
  const byField = group(records.map((record) => record.grantField ?? ''));
  const byCategory = group(records.map((record) => record.industryCategory ?? ''));
  return {
    totalRecords: records.length,
    uniqueCompanyCount: new Set(records.map((record) => record.companyName)).size,
    totalApprovedSubsidyNtd: sum(records.map((record) => record.approvedSubsidyNtd)),
    totalSelfFundedAmountNtd: sum(records.map((record) => record.selfFundedAmountNtd)),
    totalProjectBudgetNtd: sum(records.map((record) => record.totalProjectBudgetNtd)),
    medianApprovedSubsidyNtd: amounts.length ? amounts.length % 2 ? amounts[(amounts.length - 1) / 2] : (amounts[amounts.length / 2 - 1] + amounts[amounts.length / 2]) / 2 : undefined,
    averageApprovedSubsidyNtd: amounts.length ? sum(amounts) / amounts.length : undefined,
    minSubsidyYear: Math.min(...records.flatMap((record) => record.subsidyYear ?? [])),
    maxSubsidyYear: Math.max(...records.flatMap((record) => record.subsidyYear ?? [])),
    byYear: [...byYear].filter(([year]) => year).map(([year, rows]) => ({ year, recordCount: rows.length, approvedSubsidyNtd: sum(rows.map((row) => row.approvedSubsidyNtd)), totalProjectBudgetNtd: sum(rows.map((row) => row.totalProjectBudgetNtd)) })).sort((a, b) => a.year - b.year),
    byDistrict: [...byDistrict].filter(([district]) => district).map(([district, rows]) => ({ district, recordCount: rows.length, uniqueCompanyCount: new Set(rows.map((row) => row.companyName)).size, approvedSubsidyNtd: sum(rows.map((row) => row.approvedSubsidyNtd)), totalProjectBudgetNtd: sum(rows.map((row) => row.totalProjectBudgetNtd)) })).sort((a, b) => b.approvedSubsidyNtd - a.approvedSubsidyNtd),
    byGrantField: [...byField].filter(([grantField]) => grantField).map(([grantField, rows]) => ({ grantField, recordCount: rows.length, approvedSubsidyNtd: sum(rows.map((row) => row.approvedSubsidyNtd)) })).sort((a, b) => b.approvedSubsidyNtd - a.approvedSubsidyNtd),
    byIndustryCategory: [...byCategory].filter(([industryCategory]) => industryCategory).map(([industryCategory, rows]) => ({ industryCategory, recordCount: rows.length, approvedSubsidyNtd: sum(rows.map((row) => row.approvedSubsidyNtd)) })).sort((a, b) => b.approvedSubsidyNtd - a.approvedSubsidyNtd),
  };
}

export function filterIndustryGrants(records: IndustryGrantRecipient[], filters: IndustryGrantFilters) {
  const query = filters.search.trim().toLocaleLowerCase();
  const within = (value: number | undefined, min: string, max: string) =>
    (!min || (value ?? -Infinity) >= Number(min)) && (!max || (value ?? Infinity) <= Number(max));
  return records.filter((record) => {
    const text = [record.companyName, record.projectName, record.grantField, record.registeredDistrict, record.industryCategory].filter(Boolean).join(' ').toLocaleLowerCase();
    return (!query || text.includes(query))
      && (!filters.subsidyYear || record.subsidyYear === Number(filters.subsidyYear))
      && (!filters.grantField || record.grantField === filters.grantField)
      && (!filters.district || record.registeredDistrict === filters.district)
      && (!filters.industryCategory || record.industryCategory === filters.industryCategory)
      && within(record.approvedSubsidyNtd, filters.subsidyMin, filters.subsidyMax)
      && within(record.totalProjectBudgetNtd, filters.budgetMin, filters.budgetMax)
      && within(record.subsidyShare, filters.shareMin, filters.shareMax)
      && (!filters.projectFrom || (record.projectEndDate ?? '') >= filters.projectFrom)
      && (!filters.projectTo || (record.projectStartDate ?? '9999-12-31') <= filters.projectTo);
  });
}
