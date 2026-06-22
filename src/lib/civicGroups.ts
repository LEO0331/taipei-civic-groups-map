import type {
  CivicGroup, CivicGroupCategory, CivicGroupFilters, CivicGroupSummary,
  DistrictCivicGroupSummary, Language,
} from '../types';

export const DISTRICTS = ['中正區', '大同區', '中山區', '松山區', '大安區', '萬華區', '信義區', '士林區', '北投區', '內湖區', '南港區', '文山區'];

export const TAIPEI_DISTRICT_CENTROIDS: Record<string, { latitude: number; longitude: number }> = {
  中正區: { latitude: 25.0324, longitude: 121.5199 }, 大同區: { latitude: 25.0634, longitude: 121.5130 },
  中山區: { latitude: 25.0642, longitude: 121.5335 }, 松山區: { latitude: 25.0497, longitude: 121.5778 },
  大安區: { latitude: 25.0268, longitude: 121.5430 }, 萬華區: { latitude: 25.0330, longitude: 121.4970 },
  信義區: { latitude: 25.0330, longitude: 121.5668 }, 士林區: { latitude: 25.0950, longitude: 121.5246 },
  北投區: { latitude: 25.1310, longitude: 121.5010 }, 內湖區: { latitude: 25.0837, longitude: 121.5924 },
  南港區: { latitude: 25.0327, longitude: 121.6112 }, 文山區: { latitude: 24.9886, longitude: 121.5736 },
};

export const CATEGORIES: CivicGroupCategory[] = [
  'association', 'society', 'hometown_association', 'alumni_association', 'clan_association',
  'promotion_association', 'community_development', 'culture_arts', 'sports',
  'charity_public_welfare', 'professional', 'religious_related', 'industry_commerce', 'other',
];

const categoryLabels: Record<CivicGroupCategory, [string, string]> = {
  association: ['協會', 'Association'], society: ['學會', 'Society'],
  hometown_association: ['同鄉會', 'Hometown Association'], alumni_association: ['校友會', 'Alumni Association'],
  clan_association: ['宗親會', 'Clan Association'], promotion_association: ['促進會', 'Promotion Association'],
  community_development: ['社區發展', 'Community Development'], culture_arts: ['文化藝術', 'Culture & Arts'],
  sports: ['體育運動', 'Sports'], charity_public_welfare: ['慈善公益', 'Charity & Public Welfare'],
  professional: ['專業團體', 'Professional'], religious_related: ['宗教相關', 'Religious-related'],
  industry_commerce: ['工商產業', 'Industry & Commerce'], other: ['其他', 'Other'],
};

export const getCategoryLabel = (category: CivicGroupCategory, language: Language) =>
  categoryLabels[category][language === 'zh' ? 0 : 1];

export const normalizeColumnName = (raw: string) => raw.replace(/^\uFEFF/, '').trim();
export const normalizeText = (raw: unknown) => {
  const value = String(raw ?? '').trim();
  return value || undefined;
};

export function extractDistrictFromAddress(address?: string) {
  if (!address) return undefined;
  const normalized = address.trim().replace(/^台北市/, '臺北市');
  const exact = DISTRICTS.find((district) => normalized.includes(district));
  if (exact) return exact;
  return DISTRICTS.find((district) =>
    new RegExp(`^(?:\\d{3,6})?(?:臺北市)?${district.slice(0, -1)}(?=[路街巷弄段號])`).test(normalized)
  );
}

export function parseFoundedDate(raw?: string): { foundedDate?: string; foundedYear?: number; foundedDecade?: string } {
  if (!raw) return {};
  const parts = raw.trim().replace(/[年月日.\-/]/g, ' ').split(/\s+/).filter(Boolean);
  let [yearText, monthText, dayText] = parts;
  if (parts.length === 1 && /^\d{5,8}$/.test(parts[0])) {
    const compact = parts[0];
    const yearDigits = compact.length === 8 ? 4 : compact.length - 4;
    yearText = compact.slice(0, yearDigits);
    monthText = compact.slice(yearDigits, yearDigits + 2);
    dayText = compact.slice(yearDigits + 2);
  }
  if (!/^\d{1,4}$/.test(yearText ?? '')) return {};
  const numericYear = Number(yearText);
  if (yearText.length <= 3 && numericYear < 1) return {};
  const year = yearText.length <= 3 ? numericYear + 1911 : numericYear;
  if (year < 1800 || year > new Date().getFullYear() + 1) return {};
  const month = monthText ? Number(monthText) : undefined;
  const day = dayText ? Number(dayText) : undefined;
  if ((month && (month < 1 || month > 12)) || (day && (day < 1 || day > 31))) return {};
  if (month && day) {
    const date = new Date(Date.UTC(year, month - 1, day));
    if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return {};
  }
  const foundedDate = month
    ? `${year}-${String(month).padStart(2, '0')}${day ? `-${String(day).padStart(2, '0')}` : ''}`
    : String(year);
  return { foundedDate, foundedYear: year, foundedDecade: `${Math.floor(year / 10) * 10}s` };
}

const CATEGORY_RULES: Array<[CivicGroupCategory, RegExp]> = [
  ['community_development', /發展協會|社區發展/], ['hometown_association', /同鄉會/],
  ['alumni_association', /校友會/], ['clan_association', /宗親會/], ['promotion_association', /促進會/],
  ['culture_arts', /文化|藝術|音樂|舞蹈|劇|書畫|攝影/], ['sports', /體育|運動|球|武術|太極|瑜伽/],
  ['charity_public_welfare', /慈善|公益|關懷|救助|福利|志工|愛心/],
  ['professional', /醫師|律師|會計師|建築師|工程師|教師|護理|專業/],
  ['religious_related', /佛|道|基督|天主|宗教|寺|宮|教會/],
  ['industry_commerce', /商業|產業|企業|工商|經貿|商圈/], ['society', /學會/], ['association', /協會/],
];

export function inferCivicGroupCategory(name: string): CivicGroupCategory {
  return CATEGORY_RULES.find(([, pattern]) => pattern.test(name))?.[0] ?? 'other';
}

export function filterCivicGroups(groups: CivicGroup[], filters: CivicGroupFilters, language: Language) {
  const query = filters.search.trim().toLocaleLowerCase();
  return groups.filter((group) => {
    const text = [group.name, group.address, group.phone, group.foundedDateRaw, group.district,
      getCategoryLabel(group.inferredCategory, language)].filter(Boolean).join(' ').toLocaleLowerCase();
    return (!query || text.includes(query))
      && (!filters.district || group.district === filters.district)
      && (!filters.category || group.inferredCategory === filters.category)
      && (!filters.decade || group.foundedDecade === filters.decade)
      && (!filters.yearFrom || (group.foundedYear ?? 0) >= Number(filters.yearFrom))
      && (!filters.yearTo || (group.foundedYear ?? Infinity) <= Number(filters.yearTo))
      && (!filters.phone || (filters.phone === 'yes' ? Boolean(group.phone) : !group.phone));
  });
}

export function buildDistrictSummaries(groups: CivicGroup[]): DistrictCivicGroupSummary[] {
  return DISTRICTS.map((district) => {
    const districtGroups = groups.filter((group) => group.district === district);
    const counts = new Map<CivicGroupCategory, number>();
    districtGroups.forEach((group) => counts.set(group.inferredCategory, (counts.get(group.inferredCategory) ?? 0) + 1));
    return {
      district, ...TAIPEI_DISTRICT_CENTROIDS[district], count: districtGroups.length,
      topCategories: [...counts].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([category, count]) => ({ category, count })),
    };
  });
}

export function buildCivicGroupSummary(groups: CivicGroup[]): CivicGroupSummary {
  const countBy = <T extends string | number>(values: T[]) => {
    const counts = new Map<T, number>();
    values.forEach((value) => counts.set(value, (counts.get(value) ?? 0) + 1));
    return [...counts].map(([key, count]) => ({ key, count })).sort((a, b) => b.count - a.count);
  };
  return {
    total: groups.length,
    recordsWithDistrict: groups.filter((group) => group.district).length,
    recordsWithoutDistrict: groups.filter((group) => !group.district).length,
    recordsWithPhone: groups.filter((group) => group.phone).length,
    recordsWithFoundedYear: groups.filter((group) => group.foundedYear).length,
    byDistrict: countBy(groups.flatMap((group) => group.district ?? [])).map(({ key: district, count }) => ({ district, count })),
    byFoundedYear: countBy(groups.flatMap((group) => group.foundedYear ?? [])).map(({ key: year, count }) => ({ year, count })).sort((a, b) => a.year - b.year),
    byFoundedDecade: countBy(groups.flatMap((group) => group.foundedDecade ?? [])).map(({ key: decade, count }) => ({ decade, count })).sort((a, b) => a.decade.localeCompare(b.decade)),
    byInferredCategory: countBy(groups.map((group) => group.inferredCategory)).map(({ key: category, count }) => ({ category, count })),
    districtSummaries: buildDistrictSummaries(groups),
  };
}

export const formatFoundedDate = (group: CivicGroup, language: Language) =>
  group.foundedDate || group.foundedDateRaw || (language === 'zh' ? '未提供' : 'Not provided');
