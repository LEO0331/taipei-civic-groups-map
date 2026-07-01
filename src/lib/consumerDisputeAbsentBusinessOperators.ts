import type { ConsumerDisputeAbsentBusinessOperatorFilters, ConsumerDisputeAbsentBusinessOperatorRecord, ConsumerDisputeAbsentBusinessOperatorSummary, ConsumerDisputeKeywordCategory } from '../types';

const missing = new Set(['', '-', '--', 'nan', 'null', 'NULL']);
const categoryRules: Array<[ConsumerDisputeKeywordCategory, string[]]> = [
  ['travel_or_accommodation', ['旅遊', '住宿', '飯店', '旅館', '機票']],
  ['education_or_courses', ['補習', '課程', '教育', '學費']],
  ['online_shopping', ['網購', '線上', '網路', '電商']],
  ['retail_goods', ['商品', '買賣', '零售', '退貨']],
  ['housing_or_real_estate', ['房屋', '租屋', '不動產', '裝修', '室內設計']],
  ['telecom_or_digital_service', ['電信', '手機', '網路服務', '通訊']],
  ['fitness_or_beauty', ['健身', '美容', '美體', '瘦身', '美甲']],
  ['food_or_restaurant', ['餐飲', '食品', '餐廳']],
  ['vehicle_or_transport', ['汽車', '機車', '車輛', '運輸']],
  ['financial_or_payment', ['刷卡', '付款', '貸款', '金融']],
  ['medical_or_health_product', ['醫療', '健康', '藥', '保健']],
  ['contract_or_refund', ['契約', '合約', '退款', '退費', '解除']],
];

export function cleanText(raw: unknown) {
  const value = String(raw ?? '').replace(/\u3000/g, ' ').trim().replace(/\s+/g, ' ');
  return missing.has(value) ? undefined : value;
}
export const normalizePartyName = cleanText;
export const normalizeRecordText = (raw: unknown) => cleanText(raw)?.toLocaleLowerCase();

export function parseRocYear(raw: unknown) {
  const yearRaw = cleanText(raw);
  if (!yearRaw) return {};
  const match = yearRaw.match(/\d{2,4}/);
  if (!match) return { yearRaw, warning: 'Invalid year' };
  const numeric = Number(match[0]);
  const year = numeric < 1911 ? numeric + 1911 : numeric;
  if (year < 2008 || year > new Date().getFullYear() + 1) return { yearRaw, warning: 'Year out of range' };
  return { yearRaw, rocYear: numeric < 1911 ? numeric : undefined, year };
}

export function parseTaiwanDate(raw: unknown) {
  const value = cleanText(raw);
  if (!value) return {};
  const parts = value.match(/^\d{7,8}$/)
    ? [value.slice(0, -4), value.slice(-4, -2), value.slice(-2)]
    : value.match(/(\d{2,4})\D+(\d{1,2})\D+(\d{1,2})/)?.slice(1, 4);
  if (!parts) return { raw: value, warning: 'Invalid date format' };
  const parsedYear = Number(parts[0]), year = parsedYear < 1911 ? parsedYear + 1911 : parsedYear;
  const month = Number(parts[1]), day = Number(parts[2]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return { raw: value, warning: 'Invalid date value' };
  const iso = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  return { raw: value, date: iso, year, month, monthKey: iso.slice(0, 7), quarter: `${year}-Q${Math.ceil(month / 3)}` };
}

export function parseResourceYearFromName(resourceName: string) {
  const match = resourceName.match(/(\d{2,3})年度/);
  if (!match) return {};
  const resourceRocYear = Number(match[1]);
  return { resourceYearRaw: match[0], resourceRocYear, resourceYear: resourceRocYear + 1911 };
}

export function classifyConsumerDisputeKeywords(raw: string | undefined): ConsumerDisputeKeywordCategory[] {
  const text = cleanText(raw);
  if (!text) return ['unknown'];
  const categories = categoryRules.flatMap(([category, terms]) => terms.some((term) => text.includes(term)) ? [category] : []);
  return categories.length ? [...new Set(categories)] : ['other'];
}

export function parseConsumerDisputeContent(raw: unknown) {
  const disputeContent = cleanText(raw);
  const disputeContentNormalized = normalizeRecordText(disputeContent);
  const disputeKeywordCategories = classifyConsumerDisputeKeywords(disputeContent);
  const disputeKeywordTags = disputeContent?.match(/[\p{Script=Han}A-Za-z0-9]{2,}/gu)?.slice(0, 8);
  return { disputeContent, disputeContentNormalized, disputeKeywordCategories, disputeKeywordTags };
}

const countMap = <T extends string | number>(values: T[]) => {
  const map = new Map<T, number>();
  values.forEach((value) => map.set(value, (map.get(value) ?? 0) + 1));
  return map;
};
const sortedCount = <T extends string | number>(values: T[]) => [...countMap(values)].sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0])));

export function buildConsumerDisputeAbsentBusinessOperatorSummary(records: ConsumerDisputeAbsentBusinessOperatorRecord[]): ConsumerDisputeAbsentBusinessOperatorSummary {
  const years = records.flatMap((record) => record.year ?? []);
  const dates = records.flatMap((record) => record.negotiationDate ?? []).sort();
  const byYear = [...countMap(years)].map(([year, recordCount]) => ({
    year, recordCount, uniqueRespondentNameCount: new Set(records.filter((record) => record.year === year).map((record) => record.respondentNameNormalized ?? record.respondentName)).size,
  })).sort((a, b) => a.year - b.year);
  const byNegotiationMonth = [...countMap(records.flatMap((record) => record.negotiationMonthKey ?? []))].map(([negotiationMonthKey, recordCount]) => ({
    negotiationMonthKey, recordCount, uniqueRespondentNameCount: new Set(records.filter((record) => record.negotiationMonthKey === negotiationMonthKey).map((record) => record.respondentNameNormalized ?? record.respondentName)).size,
  })).sort((a, b) => a.negotiationMonthKey.localeCompare(b.negotiationMonthKey));
  const byRespondent = [...new Set(records.map((record) => record.respondentName))].map((respondentName) => {
    const rows = records.filter((record) => record.respondentName === respondentName), rowYears = rows.flatMap((record) => record.year ?? []), rowDates = rows.flatMap((record) => record.negotiationDate ?? []).sort();
    return { respondentName, recordCount: rows.length, firstYear: Math.min(...rowYears), latestYear: Math.max(...rowYears), firstNegotiationDate: rowDates[0], latestNegotiationDate: rowDates.at(-1) };
  }).sort((a, b) => b.recordCount - a.recordCount || a.respondentName.localeCompare(b.respondentName));
  return {
    totalRecords: records.length,
    minYear: years.length ? Math.min(...years) : undefined, maxYear: years.length ? Math.max(...years) : undefined,
    minNegotiationDate: dates[0], maxNegotiationDate: dates.at(-1),
    uniqueRespondentNameCount: new Set(records.map((record) => record.respondentNameNormalized ?? record.respondentName)).size,
    uniqueComplainantNameCount: new Set(records.flatMap((record) => record.complainantNameNormalized ?? [])).size,
    recordsWithComplainantName: records.filter((record) => record.hasComplainantName).length,
    recordsWithDisputeContent: records.filter((record) => record.hasDisputeContent).length,
    recordsWithNegotiationDate: records.filter((record) => record.negotiationDate).length,
    recordsWithYearMismatch: records.filter((record) => record.yearMismatch).length,
    byYear, byNegotiationMonth, byRespondent,
    byKeywordCategory: sortedCount(records.flatMap((record) => record.disputeKeywordCategories)).map(([disputeKeywordCategory, count]) => ({ disputeKeywordCategory, count })),
    topDisputeKeywords: sortedCount(records.flatMap((record) => record.disputeKeywordTags ?? [])).map(([keyword, count]) => ({ keyword, count })).slice(0, 30),
    resourceBreakdown: sortedCount(records.flatMap((record) => record.resourceName ?? [])).map(([resourceName, recordCount]) => ({ resourceName, recordCount })),
  };
}

export function filterConsumerDisputeAbsentBusinessOperators(records: ConsumerDisputeAbsentBusinessOperatorRecord[], filters: ConsumerDisputeAbsentBusinessOperatorFilters) {
  const query = filters.search.trim().toLocaleLowerCase();
  return records.filter((record) => {
    const text = [record.respondentName, record.complainantName, record.disputeContent, record.year, record.negotiationDate, record.resourceName].filter(Boolean).join(' ').toLocaleLowerCase();
    return (!query || text.includes(query))
      && (!filters.year || record.year === Number(filters.year))
      && (!filters.yearFrom || (record.year ?? 0) >= Number(filters.yearFrom))
      && (!filters.yearTo || (record.year ?? Infinity) <= Number(filters.yearTo))
      && (!filters.negotiationDateFrom || (record.negotiationDate ?? '') >= filters.negotiationDateFrom)
      && (!filters.negotiationDateTo || (record.negotiationDate ?? '9999-99-99') <= filters.negotiationDateTo)
      && (!filters.respondentName || record.respondentName === filters.respondentName)
      && (!filters.disputeKeywordCategory || record.disputeKeywordCategories.includes(filters.disputeKeywordCategory as ConsumerDisputeKeywordCategory))
      && (!filters.hasNegotiationDate || (filters.hasNegotiationDate === 'yes' ? Boolean(record.negotiationDate) : !record.negotiationDate))
      && (!filters.hasDisputeContent || (filters.hasDisputeContent === 'yes' ? record.hasDisputeContent : !record.hasDisputeContent))
      && (!filters.yearMismatch || (filters.yearMismatch === 'yes' ? record.yearMismatch : !record.yearMismatch))
      && (!filters.resourceName || record.resourceName === filters.resourceName);
  });
}
