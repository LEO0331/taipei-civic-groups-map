export type Language = 'zh' | 'en';
export type PublicRecordModule = 'civic_groups' | 'industry_grant_recipients' | 'metro_procurement_schedule' | 'registered_cram_schools';
export type LocationPrecision = 'exact' | 'district_centroid' | 'address_only' | 'missing';

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

export type ProcurementSubjectCategory = 'goods' | 'services' | 'works' | 'other' | 'unknown';
export type TenderMethod =
  | 'open_tender'
  | 'public_quotation_or_proposal'
  | 'selective_limited_tender_after_public_review'
  | 'other'
  | 'unknown';

export type MetroProcurementScheduleRecord = {
  id: string;
  module: 'metro_procurement_schedule';
  sourceFileName?: string;
  sourceSequenceNumber?: number;
  caseName: string;
  budgetAmountRaw?: string;
  budgetAmountNtd?: number;
  tenderMethodRaw?: string;
  tenderMethod: TenderMethod;
  subjectCategoryRaw?: string;
  subjectCategory: ProcurementSubjectCategory;
  periodRocYearMonth: string;
  periodRocYear?: number;
  periodYear?: number;
  periodMonth?: number;
  periodKey?: string;
  derivedKeywordGroups: string[];
  source: string;
  sourceAgency: string;
};

export type MetroProcurementScheduleSummary = {
  totalRecords: number;
  periodCount: number;
  minPeriodKey?: string;
  maxPeriodKey?: string;
  recordsWithNumericBudgetAmount: number;
  recordsWithTextualBudgetColumn: number;
  byPeriod: Array<{
    periodKey: string;
    periodYear?: number;
    periodMonth?: number;
    recordCount: number;
    goodsCount: number;
    servicesCount: number;
    worksCount: number;
    otherSubjectCount: number;
  }>;
  bySubjectCategory: Array<{ subjectCategory: ProcurementSubjectCategory; subjectCategoryRaw?: string; count: number }>;
  byTenderMethod: Array<{ tenderMethod: TenderMethod; tenderMethodRaw?: string; count: number }>;
  keywordFrequency: Array<{ keyword: string; count: number }>;
};

export type MetroProcurementFilters = {
  search: string;
  periodYear: string;
  periodMonth: string;
  periodKey: string;
  subjectCategory: string;
  tenderMethod: string;
  keywordGroup: string;
  budgetStatus: string;
};

export type RegisteredCramSchool = {
  id: string;
  module: 'registered_cram_schools';
  sourceSequenceNumber?: number;
  authorityDocumentCode?: string;
  cramSchoolName: string;
  address?: string;
  addressWithoutPostalCode?: string;
  postalCode?: string;
  district?: string;
  phone?: string;
  registrationDateRaw?: string;
  registrationDate?: string;
  registrationYear?: number;
  registrationDecade?: string;
  registrationDocumentNumber?: string;
  classroomCount?: number;
  classroomAreaSqm?: number;
  premisesAreaSqm?: number;
  locationPrecision: LocationPrecision;
  longitude?: number;
  latitude?: number;
  source: string;
  sourceAgency: string;
};

export type RegisteredCramSchoolSummary = {
  totalRecords: number;
  uniqueCramSchoolNameCount: number;
  districtCount: number;
  earliestRegistrationDate?: string;
  latestRegistrationDate?: string;
  recordsWithPhone: number;
  recordsWithRegistrationDate: number;
  recordsWithClassroomCount: number;
  recordsWithClassroomArea: number;
  recordsWithPremisesArea: number;
  totalClassroomCount: number;
  totalClassroomAreaSqm: number;
  totalPremisesAreaSqm: number;
  averageClassroomCount?: number;
  averageClassroomAreaSqm?: number;
  averagePremisesAreaSqm?: number;
  byDistrict: Array<{
    district: string;
    recordCount: number;
    totalClassroomCount: number;
    totalClassroomAreaSqm: number;
    totalPremisesAreaSqm: number;
  }>;
  byRegistrationYear: Array<{ year: number; recordCount: number }>;
  byRegistrationDecade: Array<{ decade: string; recordCount: number }>;
  areaDistribution: {
    classroomAreaSqm: Array<{ bucket: string; count: number }>;
    premisesAreaSqm: Array<{ bucket: string; count: number }>;
  };
};

export type RegisteredCramSchoolFilters = {
  search: string;
  district: string;
  registrationYear: string;
  registrationDecade: string;
  hasPhone: string;
  hasClassroomCount: string;
  classroomCountMin: string;
  classroomCountMax: string;
  classroomAreaMin: string;
  classroomAreaMax: string;
  premisesAreaMin: string;
  premisesAreaMax: string;
};
