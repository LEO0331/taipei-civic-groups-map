export type Language = 'zh' | 'en';
export type PublicRecordModule = 'civic_groups' | 'industry_grant_recipients';

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

export type IndustryGrantRecipient = {
  id: string;
  module: 'industry_grant_recipients';
  subsidyYearRoc?: number;
  subsidyYear?: number;
  grantField?: string;
  companyName: string;
  projectName?: string;
  responsiblePersonName?: string;
  registeredDistrict?: string;
  approvalDateRaw?: string;
  approvalDate?: string;
  projectStartDateRaw?: string;
  projectStartDate?: string;
  projectEndDateRaw?: string;
  projectEndDate?: string;
  approvedSubsidyNtd?: number;
  selfFundedAmountNtd?: number;
  totalProjectBudgetNtd?: number;
  capitalAmountAtApplicationNtd?: number;
  subsidyShare?: number;
  selfFundingShare?: number;
  industryCategory?: string;
  source: string;
};

export type IndustryGrantSummary = {
  totalRecords: number;
  uniqueCompanyCount: number;
  totalApprovedSubsidyNtd: number;
  totalSelfFundedAmountNtd: number;
  totalProjectBudgetNtd: number;
  medianApprovedSubsidyNtd?: number;
  averageApprovedSubsidyNtd?: number;
  minSubsidyYear?: number;
  maxSubsidyYear?: number;
  byYear: Array<{ year: number; recordCount: number; approvedSubsidyNtd: number; totalProjectBudgetNtd: number }>;
  byDistrict: Array<{ district: string; recordCount: number; uniqueCompanyCount: number; approvedSubsidyNtd: number; totalProjectBudgetNtd: number }>;
  byGrantField: Array<{ grantField: string; recordCount: number; approvedSubsidyNtd: number }>;
  byIndustryCategory: Array<{ industryCategory: string; recordCount: number; approvedSubsidyNtd: number }>;
};

export type IndustryGrantFilters = {
  search: string;
  subsidyYear: string;
  grantField: string;
  district: string;
  industryCategory: string;
  subsidyMin: string;
  subsidyMax: string;
  budgetMin: string;
  budgetMax: string;
  shareMin: string;
  shareMax: string;
  projectFrom: string;
  projectTo: string;
};
