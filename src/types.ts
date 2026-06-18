export type Language = 'zh' | 'en';

export type CivicGroupCategory =
  | 'association' | 'society' | 'hometown_association' | 'alumni_association'
  | 'clan_association' | 'promotion_association' | 'community_development'
  | 'culture_arts' | 'sports' | 'charity_public_welfare' | 'professional'
  | 'religious_related' | 'industry_commerce' | 'other';

export type CivicGroup = {
  id: string;
  agencyCode?: string;
  name: string;
  address?: string;
  phone?: string;
  district?: string;
  foundedDateRaw?: string;
  foundedDate?: string;
  foundedYear?: number;
  foundedDecade?: string;
  inferredCategory: CivicGroupCategory;
  inferredCategorySource: 'name_keyword' | 'unknown';
  source: string;
};

export type DistrictCivicGroupSummary = {
  district: string;
  latitude: number;
  longitude: number;
  count: number;
  topCategories: Array<{ category: CivicGroupCategory; count: number }>;
};

export type CivicGroupSummary = {
  total: number;
  recordsWithDistrict: number;
  recordsWithoutDistrict: number;
  recordsWithPhone: number;
  recordsWithFoundedYear: number;
  byDistrict: Array<{ district: string; count: number }>;
  byFoundedYear: Array<{ year: number; count: number }>;
  byFoundedDecade: Array<{ decade: string; count: number }>;
  byInferredCategory: Array<{ category: CivicGroupCategory; count: number }>;
  districtSummaries: DistrictCivicGroupSummary[];
};

export type CivicGroupFilters = {
  search: string;
  district: string;
  category: string;
  decade: string;
  yearFrom: string;
  yearTo: string;
  phone: string;
};
