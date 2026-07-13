import type { SeniorGroupMealServiceSiteFilters, SeniorGroupMealServiceSiteRecord, SeniorGroupMealServiceSiteSummary } from '../types';

export const cleanText = (value?: string) => value?.replace(/\s+/g, ' ').trim() || undefined;
export const normalizeText = (value?: string) => cleanText(value)?.replace(/[臺台]/g, '台').toLocaleLowerCase();
export const normalizeDistrict = (value?: string) => {
  const district = cleanText(value)?.replace(/臺/g, '台');
  return district && /^(松山|信義|大安|中山|中正|大同|萬華|文山|南港|內湖|士林|北投)區$/.test(district) ? district : district;
};
export const roadNameFromAddress = (value?: string) => cleanText(value)?.match(/(?:[^區]+?[路街道巷弄])/u)?.[0];
export const normalizePhone = (value?: string) => cleanText(value)?.replace(/[\s（）()－–—]/g, '').replace(/^\+886/, '0');

export function buildSeniorGroupMealServiceSiteSummary(records: SeniorGroupMealServiceSiteRecord[]): SeniorGroupMealServiceSiteSummary {
  const counts = new Map<string, number>();
  records.forEach((record) => { if (record.districtNameNormalized) counts.set(record.districtNameNormalized, (counts.get(record.districtNameNormalized) ?? 0) + 1); });
  return {
    totalRecords: records.length,
    districtCount: counts.size,
    uniqueSiteNameCount: new Set(records.map((record) => record.siteNameNormalized).filter(Boolean)).size,
    recordsWithPhone: records.filter((record) => record.hasPhone).length,
    recordsWithoutPhone: records.filter((record) => !record.hasPhone).length,
    recordsWithAddress: records.filter((record) => record.address).length,
    byDistrict: [...counts].map(([district, count]) => ({ district, count })).sort((a, b) => b.count - a.count || a.district.localeCompare(b.district)),
  };
}

export function filterSeniorGroupMealServiceSites(records: SeniorGroupMealServiceSiteRecord[], filters: SeniorGroupMealServiceSiteFilters) {
  const query = normalizeText(filters.search);
  return records.filter((record) => {
    const searchable = normalizeText([record.siteName, record.districtName, record.address, record.phone].filter(Boolean).join(' '));
    return (!query || searchable?.includes(query))
      && (!filters.district || record.districtNameNormalized === filters.district)
      && (!filters.hasPhone || (filters.hasPhone === 'yes' ? record.hasPhone : !record.hasPhone));
  });
}
