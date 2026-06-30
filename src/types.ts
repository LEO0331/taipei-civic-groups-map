export type Language = 'zh' | 'en';
export type PublicRecordModule = 'civic_groups' | 'registered_labor_unions' | 'performing_arts_groups' | 'contracted_vaccination_medical_providers' | 'telepsychology_counseling_institutions' | 'industry_grant_recipients' | 'metro_procurement_schedule' | 'registered_cram_schools' | 'registered_hotels' | 'taipei_travel_accommodations_zh' | 'labor_standard_act_violation_records' | 'nangang_software_park_companies' | 'registered_animal_hospitals' | 'quasi_public_infant_care_centers';
export type LocationPrecision = 'exact' | 'district_centroid' | 'address_only' | 'outside_taipei_or_unparsed' | 'missing';
export type CoordinateStatus = 'valid' | 'missing' | 'outlier' | 'unparsed';
export type CoordinateSourceType = 'wgs84' | 'twd97_epsg_3826' | 'unknown';
export type CompanyNameKeywordTag = 'technology' | 'software' | 'biotech' | 'medical' | 'energy' | 'semiconductor' | 'data_or_digital' | 'media_or_creative' | 'investment_or_asset' | 'other' | 'unknown';
export type AnimalHospitalPhoneType = 'landline' | 'mobile' | 'extension' | 'unknown';
export type RegisteredLaborUnionType = 'occupational_union' | 'enterprise_union' | 'industrial_union' | 'union_federation' | 'other' | 'unknown';
export type LaborUnionPhoneType = 'taipei_landline' | 'other_landline' | 'mobile' | 'extension' | 'missing' | 'unknown';
export type LaborUnionAddressLocationCategory = 'taipei_address' | 'new_taipei_address' | 'other_taiwan_address' | 'postal_box_or_unparsed' | 'missing';
export type InfantCareCenterPhoneType = 'taipei_landline' | 'mobile' | 'extension' | 'missing' | 'unknown';
export type InfantCareCapacityStatus = 'apparent_full' | 'apparent_remaining_capacity' | 'unknown';
export type InfantCareEvaluationGrade = 'excellent' | 'grade_a' | 'grade_b' | 'grade_c' | 'other' | 'missing' | 'unknown';
export type InfantCareCenterOperationType = 'private_infant_care_center' | 'public_childcare_home' | 'public_or_commissioned_center' | 'other' | 'unknown';
export type TaipeiTravelAccommodationCategory = 'hotel' | 'hostel' | 'guesthouse' | 'tourist_hotel' | 'other' | 'unknown';
export type AccommodationPhoneType = 'taipei_landline' | 'other_landline' | 'mobile' | 'extension' | 'missing' | 'unknown';
export type AccommodationRoomCountBucket = 'small_1_20' | 'medium_21_50' | 'large_51_100' | 'very_large_101_plus' | 'missing' | 'unknown';
export type PerformingArtsGroupApplicationCategory = 'traditional_opera' | 'theater' | 'dance' | 'music' | 'folk_art' | 'cross_disciplinary' | 'other' | 'unknown';
export type VaccinationServiceItem = 'bcg_clinic' | 'child_routine' | 'child_flu_under_3' | 'child_flu_over_3' | 'adult_flu' | 'covid_19' | 'pneumococcal' | 'rotavirus' | 'mpox_clinic' | 'enterovirus_clinic';
export type HealthcareProviderPhoneType = 'taipei_landline' | 'other_landline' | 'mobile' | 'extension' | 'multiple' | 'missing' | 'unknown';
export type TelepsychologyInstitutionType = 'counseling_clinic' | 'psychological_treatment_clinic' | 'foundation' | 'school' | 'other' | 'unknown';
export type TelepsychologyContactMethod = 'phone' | 'extension' | 'mobile';
export type TelepsychologyPhoneType = 'taipei_landline' | 'other_landline' | 'mobile' | 'extension' | 'multiple' | 'missing' | 'unknown';

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

export type RegisteredLaborUnion = {
  id: string;
  module: 'registered_labor_unions';
  sourceSequenceNumber?: number;
  unionAttributeRaw?: string;
  unionType: RegisteredLaborUnionType;
  unionName: string;
  chairpersonName?: string;
  hasChairpersonName: boolean;
  postalCode?: string;
  contactAddress?: string;
  addressNormalized?: string;
  city?: string;
  district?: string;
  roadName?: string;
  isTaipeiAddress: boolean;
  addressLocationCategory: LaborUnionAddressLocationCategory;
  phone?: string;
  phoneDisplay?: string;
  phoneDialHref?: string;
  phoneType: LaborUnionPhoneType;
  hasPhone: boolean;
  locationPrecision: LocationPrecision;
  longitude?: number;
  latitude?: number;
  source: string;
  sourceAgency: string;
};

export type RegisteredLaborUnionSummary = {
  totalRecords: number;
  uniqueUnionNameCount: number;
  uniqueAddressCount: number;
  uniqueChairpersonNameCount: number;
  recordsWithPhone: number;
  recordsMissingPhone: number;
  recordsWithChairpersonName: number;
  recordsMissingChairpersonName: number;
  taipeiAddressCount: number;
  nonTaipeiAddressCount: number;
  postalBoxOrUnparsedAddressCount: number;
  districtCount: number;
  byUnionType: Array<{ unionType: RegisteredLaborUnionType; unionAttributeRaw?: string; count: number }>;
  byDistrict: Array<{ district: string; count: number; unionTypes: Array<{ unionType: RegisteredLaborUnionType; count: number }> }>;
  byAddressLocationCategory: Array<{ addressLocationCategory: LaborUnionAddressLocationCategory; count: number }>;
  byRoadName: Array<{ roadName: string; count: number }>;
  byPhoneType: Array<{ phoneType: LaborUnionPhoneType; count: number }>;
  duplicateAddressGroups: Array<{ address: string; count: number; sampleUnionNames: string[] }>;
  byPostalCode: Array<{ postalCode: string; count: number }>;
};

export type RegisteredLaborUnionFilters = {
  search: string;
  unionType: string;
  district: string;
  addressLocationCategory: string;
  city: string;
  postalCode: string;
  roadName: string;
  phoneType: string;
  hasPhone: string;
  hasChairpersonName: string;
};

export type QuasiPublicInfantCareCenter = {
  id: string;
  module: 'quasi_public_infant_care_centers';
  sourceSequenceNumber?: number;
  centerName: string;
  centerOperationType: InfantCareCenterOperationType;
  district?: string;
  address?: string;
  addressNormalized?: string;
  roadName?: string;
  phone?: string;
  phoneDisplay?: string;
  phoneDialHref?: string;
  phoneType: InfantCareCenterPhoneType;
  hasPhone: boolean;
  approvedCapacity?: number;
  actualEnrollment?: number;
  apparentRemainingCapacity?: number;
  occupancyRatePercent?: number;
  capacityStatus: InfantCareCapacityStatus;
  evaluationResultRaw?: string;
  evaluationRocYear?: number;
  evaluationGregorianYear?: number;
  evaluationGrade: InfantCareEvaluationGrade;
  hasEvaluationResult: boolean;
  locationPrecision: LocationPrecision;
  longitude?: number;
  latitude?: number;
  source: string;
  sourceAgency: string;
};

export type QuasiPublicInfantCareCenterSummary = {
  totalRecords: number;
  uniqueCenterNameCount: number;
  uniqueAddressCount: number;
  districtCount: number;
  recordsWithPhone: number;
  recordsWithEvaluationResult: number;
  recordsMissingEvaluationResult: number;
  totalApprovedCapacity?: number;
  totalActualEnrollment?: number;
  totalApparentRemainingCapacity?: number;
  averageOccupancyRatePercent?: number;
  medianOccupancyRatePercent?: number;
  apparentFullRecordCount: number;
  apparentRemainingCapacityRecordCount: number;
  byDistrict: Array<{ district: string; centerCount: number; totalApprovedCapacity?: number; totalActualEnrollment?: number; totalApparentRemainingCapacity?: number; averageOccupancyRatePercent?: number }>;
  byEvaluationGrade: Array<{ evaluationGrade: InfantCareEvaluationGrade; count: number }>;
  byEvaluationYear: Array<{ evaluationRocYear: number; evaluationGregorianYear: number; count: number }>;
  byCapacityStatus: Array<{ capacityStatus: InfantCareCapacityStatus; count: number }>;
  byCenterOperationType: Array<{ centerOperationType: InfantCareCenterOperationType; count: number }>;
  byRoadName: Array<{ roadName: string; count: number }>;
};

export type QuasiPublicInfantCareCenterFilters = {
  search: string;
  district: string;
  roadName: string;
  centerOperationType: string;
  capacityStatus: string;
  evaluationGrade: string;
  evaluationYear: string;
  hasEvaluationResult: string;
  approvedMin: string;
  approvedMax: string;
  actualMin: string;
  actualMax: string;
  gapMin: string;
  gapMax: string;
  occupancyMin: string;
  occupancyMax: string;
  phoneType: string;
};

export type TaipeiTravelAccommodationZhRecord = {
  id: string;
  module: 'taipei_travel_accommodations_zh';
  accommodationCategoryRaw?: string;
  accommodationCategory: TaipeiTravelAccommodationCategory;
  accommodationName: string;
  address?: string;
  addressNormalized?: string;
  district?: string;
  roadName?: string;
  phone?: string;
  phoneDisplay?: string;
  phoneDialHref?: string;
  phoneType: AccommodationPhoneType;
  hasPhone: boolean;
  fax?: string;
  faxDisplay?: string;
  hasFax: boolean;
  roomCount?: number;
  hasRoomCount: boolean;
  roomCountBucket: AccommodationRoomCountBucket;
  possibleRegisteredHotelMatchKey?: string;
  locationPrecision: LocationPrecision;
  longitude?: number;
  latitude?: number;
  source: string;
  sourceAgency: string;
};

export type TaipeiTravelAccommodationZhSummary = {
  totalRecords: number;
  uniqueAccommodationNameCount: number;
  uniqueAddressCount: number;
  districtCount: number;
  recordsWithPhone: number;
  recordsWithFax: number;
  recordsWithRoomCount: number;
  totalRoomCount?: number;
  averageRoomCount?: number;
  medianRoomCount?: number;
  byAccommodationCategory: Array<{ accommodationCategory: TaipeiTravelAccommodationCategory; accommodationCategoryRaw?: string; count: number; totalRoomCount?: number }>;
  byDistrict: Array<{ district: string; accommodationCount: number; totalRoomCount?: number; categoryBreakdown: Array<{ accommodationCategory: TaipeiTravelAccommodationCategory; count: number }> }>;
  byRoomCountBucket: Array<{ roomCountBucket: AccommodationRoomCountBucket; count: number }>;
  byRoadName: Array<{ roadName: string; count: number; totalRoomCount?: number }>;
  possibleOverlapWithRegisteredHotels?: { matchedCount: number; unmatchedCount: number };
};

export type TaipeiTravelAccommodationZhFilters = {
  search: string;
  accommodationCategory: string;
  district: string;
  roadName: string;
  roomCountBucket: string;
  roomCountMin: string;
  roomCountMax: string;
  hasPhone: string;
  hasFax: string;
};

export type PerformingArtsGroupRecord = {
  id: string;
  module: 'performing_arts_groups';
  groupName: string;
  groupNameNormalized?: string;
  applicationCategoryRaw?: string;
  applicationCategory: PerformingArtsGroupApplicationCategory;
  registrationNumber?: string;
  hasRegistrationNumber: boolean;
  competentAuthority?: string;
  competentAuthorityCode?: string;
  registeredAddress?: string;
  addressNormalized?: string;
  district?: string;
  roadName?: string;
  websiteUrl?: string;
  websiteUrlNormalized?: string;
  websiteDisplay?: string;
  websiteHostname?: string;
  hasWebsite: boolean;
  possibleCivicGroupMatchKey?: string;
  locationPrecision: LocationPrecision;
  longitude?: number;
  latitude?: number;
  source: string;
  sourceAgency: string;
};

export type PerformingArtsGroupSummary = {
  totalRecords: number;
  uniqueGroupNameCount: number;
  uniqueRegisteredAddressCount: number;
  districtCount: number;
  recordsWithRegistrationNumber: number;
  recordsWithWebsite: number;
  recordsWithParsedDistrict: number;
  recordsWithParsedRoadName: number;
  byApplicationCategory: Array<{ applicationCategory: PerformingArtsGroupApplicationCategory; applicationCategoryRaw?: string; count: number }>;
  byDistrict: Array<{ district: string; groupCount: number; categoryBreakdown: Array<{ applicationCategory: PerformingArtsGroupApplicationCategory; count: number }> }>;
  byCompetentAuthority: Array<{ competentAuthority: string; competentAuthorityCode?: string; count: number }>;
  byRoadName: Array<{ roadName: string; count: number }>;
  byWebsiteHostname: Array<{ websiteHostname: string; count: number }>;
  possibleOverlapWithCivicGroups?: { matchedCount: number; unmatchedCount: number };
};

export type PerformingArtsGroupFilters = {
  search: string;
  applicationCategory: string;
  district: string;
  roadName: string;
  competentAuthority: string;
  hasRegistrationNumber: string;
  hasWebsite: string;
  websiteHostname: string;
};

export type ContractedVaccinationMedicalProviderRecord = {
  id: string;
  module: 'contracted_vaccination_medical_providers';
  sourceSequenceNumber?: number;
  providerName: string;
  providerNameNormalized?: string;
  district?: string;
  districtNormalized?: string;
  address?: string;
  addressNormalized?: string;
  roadName?: string;
  phone?: string;
  phoneDisplay?: string;
  phoneDialHref?: string;
  phoneType: HealthcareProviderPhoneType;
  hasPhone: boolean;
  voiceReservationRaw?: string;
  hasVoiceReservation: boolean;
  bcgClinicRaw?: string;
  hasBcgClinic: boolean;
  childRoutineRaw?: string;
  hasChildRoutineVaccination: boolean;
  childFluUnder3Raw?: string;
  hasChildFluUnder3: boolean;
  childFluOver3Raw?: string;
  hasChildFluOver3: boolean;
  adultFluRaw?: string;
  hasAdultFlu: boolean;
  covid19Raw?: string;
  hasCovid19: boolean;
  pneumococcalRaw?: string;
  hasPneumococcal: boolean;
  rotavirusRaw?: string;
  hasRotavirus: boolean;
  mpoxClinicRaw?: string;
  hasMpoxClinic: boolean;
  enterovirusClinicRaw?: string;
  hasEnterovirusClinic: boolean;
  serviceItems: VaccinationServiceItem[];
  serviceItemCount: number;
  hasAnyChildVaccinationService: boolean;
  hasAnyAdultVaccinationService: boolean;
  hasAnySpecialClinicService: boolean;
  hasAnyFluService: boolean;
  hasAnyCovidService: boolean;
  hasAnyReservationField: boolean;
  locationPrecision: LocationPrecision;
  longitude?: number;
  latitude?: number;
  source: string;
  sourceAgency: string;
};

export type ContractedVaccinationMedicalProviderSummary = {
  totalRecords: number;
  uniqueProviderNameCount: number;
  uniqueAddressCount: number;
  districtCount: number;
  recordsWithPhone: number;
  recordsWithVoiceReservation: number;
  recordsWithParsedRoadName: number;
  byDistrict: Array<{ district: string; providerCount: number; serviceBreakdown: Array<{ serviceItem: VaccinationServiceItem; count: number }> }>;
  byServiceItem: Array<{ serviceItem: VaccinationServiceItem; count: number }>;
  byServiceItemCount: Array<{ serviceItemCount: number; providerCount: number }>;
  byRoadName: Array<{ roadName: string; count: number }>;
  topProvidersByServiceItemCount: Array<{ providerName: string; district?: string; serviceItemCount: number; serviceItems: VaccinationServiceItem[] }>;
  providerCategorySummary: {
    childVaccinationProviderCount: number;
    adultVaccinationProviderCount: number;
    fluProviderCount: number;
    covidProviderCount: number;
    specialClinicProviderCount: number;
  };
};

export type ContractedVaccinationMedicalProviderFilters = {
  search: string;
  district: string;
  serviceItem: string;
  serviceGroup: string;
  serviceItemCount: string;
  hasPhone: string;
  hasVoiceReservation: string;
  roadName: string;
};

export type TelepsychologyCounselingInstitutionRecord = {
  id: string;
  module: 'telepsychology_counseling_institutions';
  sourceSequenceNumber?: number;
  institutionTypeRaw?: string;
  institutionType: TelepsychologyInstitutionType;
  districtCodeRaw?: string;
  districtCode?: string;
  institutionName: string;
  institutionNameNormalized?: string;
  district?: string;
  districtNormalized?: string;
  address?: string;
  addressNormalized?: string;
  roadName?: string;
  phone?: string;
  phoneDisplay?: string;
  phoneDialHref?: string;
  phoneType: TelepsychologyPhoneType;
  hasPhone: boolean;
  extension?: string;
  extensionDisplay?: string;
  hasExtension: boolean;
  mobile?: string;
  mobileDisplay?: string;
  mobileDialHref?: string;
  hasMobile: boolean;
  contactMethods: TelepsychologyContactMethod[];
  contactMethodCount: number;
  hasAnyContact: boolean;
  locationPrecision: LocationPrecision;
  longitude?: number;
  latitude?: number;
  source: string;
  sourceAgency: string;
};

export type TelepsychologyCounselingInstitutionSummary = {
  totalRecords: number;
  uniqueInstitutionNameCount: number;
  uniqueAddressCount: number;
  districtCount: number;
  recordsWithPhone: number;
  recordsWithExtension: number;
  recordsWithMobile: number;
  recordsWithAnyContact: number;
  recordsWithParsedRoadName: number;
  byInstitutionType: Array<{ institutionType: TelepsychologyInstitutionType; institutionTypeRaw?: string; count: number }>;
  byDistrict: Array<{ district: string; institutionCount: number; typeBreakdown: Array<{ institutionType: TelepsychologyInstitutionType; count: number }> }>;
  byRoadName: Array<{ roadName: string; count: number }>;
  contactAvailability: {
    phoneOnlyCount: number;
    mobileOnlyCount: number;
    phoneAndMobileCount: number;
    noContactCount: number;
  };
};

export type TelepsychologyCounselingInstitutionFilters = {
  search: string;
  institutionType: string;
  district: string;
  roadName: string;
  hasPhone: string;
  hasExtension: string;
  hasMobile: string;
  hasAnyContact: string;
  contactMethodCount: string;
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

export type RegisteredHotel = {
  id: string;
  module: 'registered_hotels';
  cityCode?: string;
  registrationId: string;
  hotelName: string;
  phone?: string;
  address?: string;
  addressWithoutPostalCode?: string;
  postalCode?: string;
  district?: string;
  listedMinRoomRateNtd?: number;
  listedMaxRoomRateNtd?: number;
  listedRoomRateSpreadNtd?: number;
  roomCount?: number;
  roomCountBucket?: string;
  hasPhone: boolean;
  hasListedRoomRate: boolean;
  hasRoomCount: boolean;
  locationPrecision: LocationPrecision;
  source: string;
  sourceAgency: string;
};

export type RegisteredHotelSummary = {
  totalRecords: number;
  uniqueHotelNameCount: number;
  districtCount: number;
  recordsWithPhone: number;
  recordsWithListedRoomRate: number;
  recordsWithRoomCount: number;
  totalRoomCount: number;
  averageRoomCount?: number;
  lowestListedRoomRateNtd?: number;
  highestListedRoomRateNtd?: number;
  byDistrict: Array<{
    district: string;
    recordCount: number;
    totalRoomCount: number;
    averageRoomCount?: number;
  }>;
  roomCountBuckets: Array<{ bucket: string; recordCount: number }>;
  listedRoomRateBuckets: Array<{ bucket: string; recordCount: number }>;
};

export type RegisteredHotelFilters = {
  search: string;
  district: string;
  hasPhone: string;
  hasListedRoomRate: string;
  hasRoomCount: string;
  roomCountMin: string;
  roomCountMax: string;
  listedRoomRateMin: string;
  listedRoomRateMax: string;
  roomCountBucket: string;
};

export type RegisteredAnimalHospital = {
  id: string;
  module: 'registered_animal_hospitals';
  city?: string;
  animalHospitalName: string;
  address?: string;
  addressNormalized?: string;
  postalCode?: string;
  district?: string;
  roadName?: string;
  phone?: string;
  phoneDisplay?: string;
  phoneDialHref?: string;
  phoneType: AnimalHospitalPhoneType;
  hasPhone: boolean;
  responsiblePersonName?: string;
  hasResponsiblePersonName: boolean;
  locationPrecision: LocationPrecision;
  longitude?: number;
  latitude?: number;
  source: string;
  sourceAgency: string;
};

export type RegisteredAnimalHospitalSummary = {
  totalRecords: number;
  uniqueAnimalHospitalNameCount: number;
  uniqueAddressCount: number;
  districtCount: number;
  recordsWithPhone: number;
  recordsWithResponsiblePersonName: number;
  recordsWithAddress: number;
  byDistrict: Array<{ district: string; count: number }>;
  byRoadName: Array<{ roadName: string; count: number }>;
  byPhoneType: Array<{ phoneType: AnimalHospitalPhoneType; count: number }>;
  duplicateAddressGroups: Array<{ address: string; count: number; sampleAnimalHospitalNames: string[] }>;
};

export type RegisteredAnimalHospitalFilters = {
  search: string;
  district: string;
  roadName: string;
  phoneType: string;
  hasPhone: string;
  hasResponsiblePersonName: string;
};

export type NangangSoftwareParkCompany = {
  id: string;
  module: 'nangang_software_park_companies';
  businessId: string;
  companyName: string;
  address?: string;
  postalCode?: string;
  district?: string;
  addressWithoutPostalCode?: string;
  roadName?: string;
  buildingAddressKey?: string;
  coordinateSourceType: CoordinateSourceType;
  xTwd97Raw?: string;
  yTwd97Raw?: string;
  xTwd97?: number;
  yTwd97?: number;
  longitude?: number;
  latitude?: number;
  coordinateStatus: CoordinateStatus;
  companyNameKeywordTags?: CompanyNameKeywordTag[];
  source: string;
  sourceAgency: string;
};

export type NangangSoftwareParkCompanySummary = {
  totalRecords: number;
  uniqueBusinessIdCount: number;
  uniqueCompanyNameCount: number;
  uniqueAddressCount: number;
  uniqueBuildingAddressKeyCount: number;
  recordsWithValidCoordinates: number;
  recordsWithMissingCoordinates: number;
  recordsWithOutlierCoordinates: number;
  recordsWithUnparsedCoordinates: number;
  districtCount: number;
  byDistrict: Array<{ district: string; count: number }>;
  byRoadName: Array<{ roadName: string; count: number }>;
  byBuildingAddressKey: Array<{ buildingAddressKey: string; count: number; sampleCompanies: string[] }>;
  byCoordinatePair: Array<{ longitude: number; latitude: number; count: number; sampleCompanies: string[]; sampleAddress?: string }>;
  byCompanyNameKeywordTag: Array<{ tag: CompanyNameKeywordTag; count: number }>;
};

export type NangangSoftwareParkCompanyFilters = {
  search: string;
  roadName: string;
  buildingAddressKey: string;
  keywordTag: string;
  coordinateStatus: string;
  hasValidCoordinate: string;
};

export type LaborViolationTopicTag =
  | 'wage_payment' | 'overtime_pay' | 'working_hours' | 'rest_day'
  | 'attendance_record' | 'wage_record' | 'leave_or_holiday' | 'labor_inspection'
  | 'retirement_or_severance' | 'employment_contract' | 'other' | 'unknown';

export type LaborPenaltyAmountBucket =
  | 'none_or_missing' | '1_to_20000' | '20001_to_50000' | '50001_to_100000'
  | '100001_to_300000' | '300001_to_1000000' | '1000001_plus' | 'unknown';

export type LaborStandardActViolationRecord = {
  id: string;
  module: 'labor_standard_act_violation_records';
  announcementDateRaw?: string;
  announcementDate?: string;
  announcementYear?: number;
  announcementMonth?: string;
  dispositionDateRaw?: string;
  dispositionDate?: string;
  dispositionYear?: number;
  dispositionMonth?: string;
  dispositionNumber?: string;
  businessOrEmployerName: string;
  responsiblePersonName?: string;
  violatedProvisionsRaw?: string;
  violatedProvisions: string[];
  provisionCount: number;
  violationContentRaw?: string;
  violationContents: string[];
  violationContentCount: number;
  violationTopicTags: LaborViolationTopicTag[];
  penaltyAmountRaw?: string;
  penaltyAmountNtd?: number;
  penaltyAmountBucket: LaborPenaltyAmountBucket;
  note?: string;
  sourceExtraNote?: string;
  hasPenaltyAmount: boolean;
  hasResponsiblePersonName: boolean;
  hasNote: boolean;
  hasSourceExtraNote: boolean;
  source: string;
  sourceAgency: string;
};

export type LaborStandardActViolationSummary = {
  totalRecords: number;
  uniqueBusinessOrEmployerNameCount: number;
  uniqueDispositionNumberCount: number;
  minAnnouncementDate?: string;
  maxAnnouncementDate?: string;
  minDispositionDate?: string;
  maxDispositionDate?: string;
  recordsWithPenaltyAmount: number;
  recordsMissingPenaltyAmount: number;
  recordsWithResponsiblePersonName: number;
  recordsWithNote: number;
  recordsWithSourceExtraNote: number;
  totalPenaltyAmountNtd: number;
  medianPenaltyAmountNtd?: number;
  averagePenaltyAmountNtd?: number;
  maxPenaltyAmountNtd?: number;
  byAnnouncementYear: Array<{ year: number; recordCount: number; recordsWithPenaltyAmount: number; totalPenaltyAmountNtd: number }>;
  byAnnouncementMonth: Array<{ month: string; recordCount: number; recordsWithPenaltyAmount: number; totalPenaltyAmountNtd: number }>;
  byDispositionYear: Array<{ year: number; recordCount: number }>;
  byDispositionMonth: Array<{ month: string; recordCount: number }>;
  byViolatedProvision: Array<{ provision: string; count: number; totalPenaltyAmountNtd: number }>;
  byViolationTopicTag: Array<{ topicTag: LaborViolationTopicTag; count: number; totalPenaltyAmountNtd: number }>;
  byViolationContent: Array<{ violationContent: string; count: number; totalPenaltyAmountNtd: number }>;
  byPenaltyAmountBucket: Array<{ penaltyAmountBucket: LaborPenaltyAmountBucket; count: number }>;
  topBusinessOrEmployerNames: Array<{ businessOrEmployerName: string; recordCount: number; totalPenaltyAmountNtd: number; latestAnnouncementDate?: string }>;
};

export type LaborStandardActViolationManifest = {
  years: number[];
  recordCount: number;
  chunks: Array<{ year: number; file: string; recordCount: number }>;
};

export type LaborStandardActViolationFilters = {
  search: string;
  announcementYear: string;
  announcementMonth: string;
  dispositionYear: string;
  dispositionMonth: string;
  violatedProvision: string;
  violationTopicTag: string;
  penaltyAmountBucket: string;
  hasPenaltyAmount: string;
  hasResponsiblePersonName: string;
  hasNote: string;
};
