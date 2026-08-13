// @ts-nocheck
import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import DataTrustPanel from './DataTrustPanel';
import { buildDatasetCatalogue } from './lib/datasetCatalogue';
import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet';
import {
  buildCivicGroupSummary, CATEGORIES, DISTRICTS, filterCivicGroups, formatFoundedDate, getCategoryLabel,
} from './lib/civicGroups';
import RegisteredLaborUnionsModule from './RegisteredLaborUnionsModule';
import QuasiPublicInfantCareCentersModule from './QuasiPublicInfantCareCentersModule';
import InfantCareCenterEvaluationResultsModule from './InfantCareCenterEvaluationResultsModule';
import TaipeiTravelAccommodationsZhModule from './TaipeiTravelAccommodationsZhModule';
import PerformingArtsGroupsModule from './PerformingArtsGroupsModule';
import ContractedVaccinationMedicalProvidersModule from './ContractedVaccinationMedicalProvidersModule';
import ChildMedicalSubsidyContractedProvidersModule from './ChildMedicalSubsidyContractedProvidersModule';
import DentureSubsidyMedicalProvidersModule from './DentureSubsidyMedicalProvidersModule';
import DisabilityEmploymentResourceMapModule from './DisabilityEmploymentResourceMapModule';
import ShelteredWorkshopDirectoryModule from './ShelteredWorkshopDirectoryModule';
import EmploymentAgencyIntermediaryCompaniesModule from './EmploymentAgencyIntermediaryCompaniesModule';
import LicensedPawnshopDirectoryModule from './LicensedPawnshopDirectoryModule';
import LicensedElectronicGameArcadeOperatorsModule from './LicensedElectronicGameArcadeOperatorsModule';
import LicensedSpecialEntertainmentBusinessOperatorsModule from './LicensedSpecialEntertainmentBusinessOperatorsModule';
import RegisteredRecyclingBusinessOrganizationsModule from './RegisteredRecyclingBusinessOrganizationsModule';
import RegisteredFactoryDistributionModule from './RegisteredFactoryDistributionModule';
import CemeteryPublicFacilitiesModule from './CemeteryPublicFacilitiesModule';
import TelepsychologyCounselingInstitutionsModule from './TelepsychologyCounselingInstitutionsModule';
import BusinessPremisesPublicLiabilityInsuranceModule from './BusinessPremisesPublicLiabilityInsuranceModule';
import BusinessRegistrationChangesModule from './BusinessRegistrationChangesModule';
import CompanyRegistrationChangesModule from './CompanyRegistrationChangesModule';
import ElderlyWelfareInstitutionsModule from './ElderlyWelfareInstitutionsModule';
import SeniorGroupMealServiceSitesModule from './SeniorGroupMealServiceSitesModule';
import BiotechCompanyDirectoryModule from './BiotechCompanyDirectoryModule';
import IndustryModule from './IndustryModule';
import MetroProcurementModule from './MetroProcurementModule';
import RegisteredCramSchoolsModule from './RegisteredCramSchoolsModule';
import RegisteredHotelsModule from './RegisteredHotelsModule';
import LaborStandardActViolationsModule from './LaborStandardActViolationsModule';
import OccupationalSafetyHealthViolationsModule from './OccupationalSafetyHealthViolationsModule';
import GenderEqualityWorkActViolationsModule from './GenderEqualityWorkActViolationsModule';
import ConsumerDisputeAbsentBusinessOperatorsModule from './ConsumerDisputeAbsentBusinessOperatorsModule';
import NangangSoftwareParkCompaniesModule from './NangangSoftwareParkCompaniesModule';
import DawannanIndustrialAreaCompaniesModule from './DawannanIndustrialAreaCompaniesModule';
import EnterpriseHeadquartersDistributionModule from './EnterpriseHeadquartersDistributionModule';
import RegisteredAnimalHospitalsModule from './RegisteredAnimalHospitalsModule';
import LicensedAnimalMedicineSellersModule from './LicensedAnimalMedicineSellersModule';
import SpecificPetBusinessEvaluationResultsModule from './SpecificPetBusinessEvaluationResultsModule';
import VeterinarianProfessionalRegistryModule from './VeterinarianProfessionalRegistryModule';
import DistrictComparison from './DistrictComparison';
import PubliclyFundedHpvVaccinationProvidersModule from './PubliclyFundedHpvVaccinationProvidersModule';
import PublicPneumococcalVaccineProvidersModule from './PublicPneumococcalVaccineProvidersModule';
import MajorElectricityUsersModule from './MajorElectricityUsersModule';
import EarlyInterventionMedicalProvidersModule from './EarlyInterventionMedicalProvidersModule';
import GeneralDentalMedicalInstitutionsModule from './GeneralDentalMedicalInstitutionsModule';
import PediatricMedicalInstitutionsModule from './PediatricMedicalInstitutionsModule';
import DiabetesSharedCareMedicalInstitutionsModule from './DiabetesSharedCareMedicalInstitutionsModule';
import GeneratedDatasetDirectoryModule from './GeneratedDatasetDirectoryModule';
import ApprovedGasWaterHeaterInstallersModule from './ApprovedGasWaterHeaterInstallersModule';
import VisuallyImpairedMassageEstablishmentsModule from './VisuallyImpairedMassageEstablishmentsModule';
import CulturalArtsFoundationsModule from './CulturalArtsFoundationsModule';
import PsychiatricRehabilitationAndNursingInstitutionsModule from './PsychiatricRehabilitationAndNursingInstitutionsModule';
import TaipeiGovernmentApplicationServicesModule from './TaipeiGovernmentApplicationServicesModule';
import SeniorServiceSiteCoursesModule from './SeniorServiceSiteCoursesModule';
import RabiesVaccinationVeterinaryClinicsModule from './RabiesVaccinationVeterinaryClinicsModule';
import FiveCancerScreeningProvidersModule from './FiveCancerScreeningProvidersModule';
import FertilitySubsidyContractedHospitalsModule from './FertilitySubsidyContractedHospitalsModule';
import SeniorCareInstitutionEvaluationsModule from './SeniorCareInstitutionEvaluationsModule';
import WaterPipeInstallationContractorsModule from './WaterPipeInstallationContractorsModule';
import PestControlBusinessesModule from './PestControlBusinessesModule';
import AdultInfluenzaVaccineProvidersModule from './AdultInfluenzaVaccineProvidersModule';
import LicensedWasteCookingOilCollectorsModule from './LicensedWasteCookingOilCollectorsModule';
import HomeNursingInstitutionsModule from './HomeNursingInstitutionsModule';
import OptometryInstitutionsModule from './OptometryInstitutionsModule';
import GeneralChineseMedicineInstitutionsModule from './GeneralChineseMedicineInstitutionsModule';
import AlternativeServiceReserveStatisticsModule from './AlternativeServiceReserveStatisticsModule';
import MedicalLaboratoriesModule from './MedicalLaboratoriesModule';
import CommunityCareServiceSitesModule from './CommunityCareServiceSitesModule';
import SeniorCareCapacityAndOccupancyModule from './SeniorCareCapacityAndOccupancyModule';
import DomesticEmploymentAgencyEvaluationsModule from './DomesticEmploymentAgencyEvaluationsModule';
import LodgingBusinessPenaltyRecordsModule from './LodgingBusinessPenaltyRecordsModule';
import CommunityPublicChildcareHomesModule from './CommunityPublicChildcareHomesModule';
import TbContactScreeningPartnerProvidersModule from './TbContactScreeningPartnerProvidersModule';
import BeautyHairdressingHygieneCertificationsModule from './BeautyHairdressingHygieneCertificationsModule';
import PublicInfluenzaAntiviralProvidersModule from './PublicInfluenzaAntiviralProvidersModule';
import CommunityIntegratedCareLevelCUnitsModule from './CommunityIntegratedCareLevelCUnitsModule';
import RegisteredAfterSchoolCareCentresModule from './RegisteredAfterSchoolCareCentresModule';
import SubsidizedSeniorResidentialPlacementInstitutionsModule from './SubsidizedSeniorResidentialPlacementInstitutionsModule';
import FamilyMedicineInstitutionsModule from './FamilyMedicineInstitutionsModule';
import CosmeticMedicineSupervision2024Module from './CosmeticMedicineSupervision2024Module';
import PlasticSurgeryMedicalInstitutionsModule from './PlasticSurgeryMedicalInstitutionsModule';
import IndigenousCommunityOrganizationsModule from './IndigenousCommunityOrganizationsModule';
import LicensedNaturalGasPipelineContractorsModule from './LicensedNaturalGasPipelineContractorsModule';
import CommunityDevelopmentAssociationsModule from './CommunityDevelopmentAssociationsModule';
import ObstetricsGynecologyInstitutionsModule from './ObstetricsGynecologyInstitutionsModule';
import ArtsCulturalVenuesModule from './ArtsCulturalVenuesModule';
import PsychiatricClinicsModule from './PsychiatricClinicsModule';
import LicensedAssistedReproductionInstitutionsModule from './LicensedAssistedReproductionInstitutionsModule';
import ChildYouthResidentialPlacementInstitutionsModule from './ChildYouthResidentialPlacementInstitutionsModule';
import ChildYouthFriendlyWelfareServiceSitesModule from './ChildYouthFriendlyWelfareServiceSitesModule';
import DisabilityInstitutionCapacityAndVacanciesModule from './DisabilityInstitutionCapacityAndVacanciesModule';
import OphthalmologyInstitutionsModule from './OphthalmologyInstitutionsModule';
import TaipeiCulturalHeritageAssetsModule from './TaipeiCulturalHeritageAssetsModule';
import PrivateCulturalHeritageSubsidiesModule from './PrivateCulturalHeritageSubsidiesModule';
import TravelMedicineClinicsModule from './TravelMedicineClinicsModule';
import HakkaOrganizationsModule from './HakkaOrganizationsModule';
import HospitalDischargeLongTermCarePartnersModule from './HospitalDischargeLongTermCarePartnersModule';
import HospicePalliativeCareInstitutionsModule from './HospicePalliativeCareInstitutionsModule';
import PrivateSeniorResidentialLongTermCareInstitutionsModule from './PrivateSeniorResidentialLongTermCareInstitutionsModule';
import HemodialysisMedicalInstitutionsModule from './HemodialysisMedicalInstitutionsModule';
import InternalMedicineInstitutionsModule from './InternalMedicineInstitutionsModule';
import OccupationalTherapyClinicsModule from './OccupationalTherapyClinicsModule';
import DesignatedForeignerHealthExamHospitalsModule from './DesignatedForeignerHealthExamHospitalsModule';
import type {
  CivicGroup, CivicGroupFilters, CivicGroupSummary, IndustryGrantRecipient, IndustryGrantSummary, Language,
  MetroProcurementScheduleRecord, MetroProcurementScheduleSummary, RegisteredCramSchool, RegisteredCramSchoolSummary,
  RegisteredHotel, RegisteredHotelSummary, DawannanIndustrialAreaCompanyRecord, DawannanIndustrialAreaCompanySummary, GenderEqualityWorkActViolationRecord, GenderEqualityWorkActViolationSummary, LaborStandardActViolationManifest, LaborStandardActViolationSummary, NangangSoftwareParkCompany, NangangSoftwareParkCompanySummary, OccupationalSafetyHealthViolationRecord, OccupationalSafetyHealthViolationSummary,
  QuasiPublicInfantCareCenter, QuasiPublicInfantCareCenterSummary, RegisteredAnimalHospital, RegisteredAnimalHospitalSummary, RegisteredLaborUnion, RegisteredLaborUnionSummary, EnterpriseHeadquartersRecord, EnterpriseHeadquartersSummary, SpecificPetBusinessEvaluationRecord, SpecificPetBusinessEvaluationSummary, VeterinarianProfessionalRegistryRecord, VeterinarianProfessionalRegistrySummary,
  TaipeiTravelAccommodationZhRecord, TaipeiTravelAccommodationZhSummary, PerformingArtsGroupRecord, PerformingArtsGroupSummary,
  BiotechCompanyDirectoryRecord, BiotechCompanyDirectorySummary, BusinessPremisesPublicLiabilityInsuranceRecord, BusinessPremisesPublicLiabilityInsuranceSummary, BusinessRegistrationChangeRecord, BusinessRegistrationChangeSummary, CemeteryPublicFacilityRecord, CemeteryPublicFacilitySummary, ChildMedicalSubsidyContractedProviderRecord, ChildMedicalSubsidyContractedProviderSummary, CompanyRegistrationChangeRecord, CompanyRegistrationChangeSummary, ConsumerDisputeAbsentBusinessOperatorRecord, ConsumerDisputeAbsentBusinessOperatorSummary, ContractedVaccinationMedicalProviderRecord, ContractedVaccinationMedicalProviderSummary, DentureSubsidyMedicalProviderRecord, DentureSubsidyMedicalProviderSummary, DisabilityEmploymentResourceRecord, DisabilityEmploymentResourceSummary, ElderlyWelfareInstitutionRecord, ElderlyWelfareInstitutionSummary, EmploymentAgencyIntermediaryCompanyRecord, EmploymentAgencyIntermediaryCompanySummary, InfantCareCenterEvaluationInstitutionRecord, InfantCareCenterEvaluationSummary, InfantCareCenterEvaluationYearRecord, LicensedAnimalMedicineSellerRecord, LicensedAnimalMedicineSellerSummary, LicensedElectronicGameArcadeOperatorRecord, LicensedElectronicGameArcadeOperatorSummary, LicensedPawnshopDirectoryRecord, LicensedPawnshopDirectorySummary, LicensedSpecialEntertainmentBusinessOperatorRecord, LicensedSpecialEntertainmentBusinessOperatorSummary, PubliclyFundedHpvVaccinationProviderRecord, PubliclyFundedHpvVaccinationProviderSummary, RegisteredFactoryRecord, RegisteredFactorySummary, RegisteredRecyclingBusinessOrganizationRecord, RegisteredRecyclingBusinessOrganizationSummary, ShelteredWorkshopDirectoryRecord, ShelteredWorkshopDirectorySummary, TelepsychologyCounselingInstitutionRecord, TelepsychologyCounselingInstitutionSummary,
} from './types';

const InfluenzaVaccineProvidersChildren3PlusModule = lazy(() => import('./InfluenzaVaccineProvidersChildren3PlusModule'));
const PhysicalTherapyClinicsModule = lazy(() => import('./PhysicalTherapyClinicsModule'));

function DirectoryModuleLoading({ language }: { language: Language }) {
  return <p className="module-loading" role="status">{language === 'zh' ? '正在載入資料目錄…' : 'Loading directory…'}</p>;
}

const copy = {
  zh: {
    title: '台北公共登記與行政紀錄地圖', subtitle: '人民團體、演藝團體、工會、仲介公司、身障就業資源、庇護工場、合法當舖、醫療與心理健康院所、HPV疫苗院所、兒童醫療補助院所、假牙補助院所、公共意外險、商業異動、公司異動、立案機構、旅宿、旅遊住宿、採購、補助、生技廠商、法規、消費爭議公告、產業園區、動物照護、兒童照護、托嬰評鑑與老人福利機構公開紀錄探索',
    civicGroups: '人民團體', performingArtsGroups: '演藝團體', vaccinationProviders: '預防接種院所', hpvProviders: 'HPV疫苗院所', childMedicalSubsidyProviders: '兒童醫療補助院所', dentureSubsidyProviders: '假牙補助院所', disabilityEmploymentResources: '身障就業資源', shelteredWorkshops: '庇護工場', employmentAgencies: '仲介公司', licensedPawnshops: '合法當舖', licensedArcades: '電子遊戲場業者', licensedSpecialEntertainment: '八大行業業者', recyclingOrganizations: '回收業機構', registeredFactories: '登記工廠', enterpriseHeadquarters: '企業營運總部', cemeteryPublicFacilities: '公墓資訊', telepsychology: '通訊心理諮商', publicLiabilityInsurance: '公共意外險', businessChanges: '商業異動', companyChanges: '公司異動', laborUnions: '工會名單', infantCareCenters: '準公共化托嬰中心', infantCareEvaluations: '托嬰評鑑', elderlyWelfare: '老人福利機構', biotechCompanies: '生技廠商', travelAccommodations: '旅遊住宿', industryGrants: '產業補助廠商', metroProcurement: '捷運採購時程', registeredCramSchools: '立案補習班', registeredHotels: '一般旅館名冊', laborViolations: '勞基法違規公布紀錄', oshViolations: '職安法違規紀錄', genderEqualityViolations: '性平工作法違規紀錄', consumerDisputeAbsence: '消費爭議不到場公告', nangangCompanies: '南港軟體工業園區廠商', dawannanCompanies: '大彎南段工業區廠商', animalHospitals: '動物醫院一覽表', animalMedicineSellers: '動物用藥業者', petBusinessEvaluations: '寵物業評鑑', veterinarians: '獸醫師資訊', comparison: '行政區比較',
    map: '團體地圖', directory: '團體名冊', overview: '資料概覽', notes: '資料說明',
    search: '搜尋團體名稱、地址、電話或關鍵字', district: '行政區', category: '推測分類',
    decade: '成立年代', phone: '電話資料', all: '全部', yes: '有電話', no: '無電話',
    from: '起始年份', to: '結束年份', clear: '清除篩選', found: '筆符合紀錄',
    address: '地址', phoneLabel: '電話', founded: '成立日期', source: '資料來源',
    mapNotice: '此地圖以行政區彙總呈現，並非各團體精確位置。',
    categoryNotice: '分類係依團體名稱關鍵字推測，並非資料來源提供之正式分類。',
    count: '團體數', top: '主要推測分類', view: '查看名冊', more: '載入更多',
    total: '人民團體總數', withDistrict: '可辨識行政區紀錄', withPhone: '有電話紀錄',
    withYear: '可解析成立年份紀錄', topDistrict: '團體數最多行政區', topCategory: '最多推測分類',
    oldest: '最早成立年份', newest: '最新成立年份', byDistrict: '各行政區人民團體數',
    byDecade: '各成立年代人民團體數', byYear: '各成立年份人民團體數',
    byCategory: '各推測分類人民團體數', phoneAvailability: '電話資料有無', districtAvailability: '行政區辨識狀態',
    disclaimer: '本網站呈現臺北市公開資料中的人民團體名冊。地址、電話與團體狀態請以主管機關公告及團體實際資訊為準。本網站以行政區彙總呈現地圖，不代表各團體精確位置。推測分類係依團體名稱關鍵字產生，並非資料來源提供之正式分類。',
    method: '資料處理方式', methodText: '地址僅比對臺北市 12 個行政區名稱；成立日期支援民國及西元格式；分類僅依團體名稱關鍵字推測。無法解析的原始值仍保留於名冊。',
    fields: '欄位對照', updated: '資料轉換時間', noResults: '沒有符合條件的紀錄。',
    loading: '資料載入中…', loadError: '資料載入失敗，請重新整理頁面。',
    footer: '資料來源：臺北市人民團體名冊、臺北市演藝團體名冊、臺北市各工會名單及聯絡方式、臺北市身障就業資源地圖、臺北市庇護工場名冊、臺北市回收業機構名冊、臺北市登記工廠、臺北市各區公墓資訊、臺北市政府警察局當舖業資料清冊、臺北市合法電子遊戲場業者清冊、臺北市合法八大行業業者清冊、各項預防接種合約醫療院所、臺北市公費HPV疫苗特約醫療院所、臺北市兒童醫療補助特約院所名冊、臺北市假牙補助醫療院所名單、臺北市可執行通訊心理諮商之心理機構、臺北市營業場所投保公共意外險清冊、商業設立變更歇業登記異動資料、臺北市核准公司設立變更解散清冊、產業補助、臺北市生技廠商企業名錄、捷運採購、立案補習班、一般旅館、臺北旅遊網住宿資料、勞基法違規公布、職安法違規公布、性別平等工作法違規公布、臺北市消費爭議無故不到場協商之被申訴企業經營者列表、南港軟體工業園區廠商、臺北市大彎南段工業區廠商名錄、臺北市動物醫院一覽表、臺北市動物用藥品販賣業者名冊、臺北市準公共化托嬰中心、臺北市托嬰中心評鑑結果與臺北市老人福利機構名冊等公開資料。各資料集性質不同，最新與正式資訊請以主管機關正式公告及官方系統為準。',
  },
  en: {
    title: 'Taipei Public Records Explorer', subtitle: 'Civic groups, performing-arts groups, labor unions, intermediary companies, disability employment resources, sheltered workshops, licensed pawnshops, healthcare and mental-health providers, HPV vaccine providers, child medical subsidy providers, denture subsidy providers, public liability insurance, business changes, company changes, registered institutions, lodging records, travel accommodations, procurement, grants, biotech companies, compliance, consumer dispute notices, industry park, animal-care, childcare, infant care evaluations, and elderly-care public records explorer',
    civicGroups: 'Civic Groups', performingArtsGroups: 'Performing Arts', vaccinationProviders: 'Vaccination Providers', hpvProviders: 'HPV Vaccine Providers', childMedicalSubsidyProviders: 'Child Medical Subsidy Providers', dentureSubsidyProviders: 'Denture Subsidy Providers', disabilityEmploymentResources: 'Disability Employment Resources', shelteredWorkshops: 'Sheltered Workshops', employmentAgencies: 'Intermediary Companies', licensedPawnshops: 'Licensed Pawnshops', licensedArcades: 'Game Arcade Operators', licensedSpecialEntertainment: 'Special Entertainment Operators', recyclingOrganizations: 'Recycling Organizations', registeredFactories: 'Registered Factories', enterpriseHeadquarters: 'Enterprise Headquarters', cemeteryPublicFacilities: 'Cemeteries', telepsychology: 'Telepsychology', publicLiabilityInsurance: 'Public Liability Insurance', businessChanges: 'Business Changes', companyChanges: 'Company Changes', laborUnions: 'Labor Unions', infantCareCenters: 'Quasi-Public Infant Care Centers', infantCareEvaluations: 'Infant Care Evaluation', elderlyWelfare: 'Elderly Care', biotechCompanies: 'Biotech Companies', travelAccommodations: 'Travel Accommodations', industryGrants: 'Industry Grant Recipients', metroProcurement: 'Metro Procurement Schedule', registeredCramSchools: 'Registered Cram Schools', registeredHotels: 'Registered Hotels', laborViolations: 'Labor Standards Act Violation Records', oshViolations: 'OSH Violation Records', genderEqualityViolations: 'Gender Equality Work Violation Records', consumerDisputeAbsence: 'Consumer Dispute Absence Notices', nangangCompanies: 'Nangang Software Park Companies', dawannanCompanies: 'Dawannan Industrial Area Companies', animalHospitals: 'Registered Animal Hospitals', animalMedicineSellers: 'Animal Medicine Sellers', petBusinessEvaluations: 'Pet Business Evaluations', veterinarians: 'Veterinarians', comparison: 'District Comparison',
    map: 'Group Map', directory: 'Group Directory', overview: 'Data Overview', notes: 'Data Notes',
    search: 'Search group name, address, phone, or keyword', district: 'District', category: 'Inferred category',
    decade: 'Founded decade', phone: 'Phone data', all: 'All', yes: 'Has phone', no: 'No phone',
    from: 'Year from', to: 'Year to', clear: 'Clear filters', found: 'matching records',
    address: 'Address', phoneLabel: 'Phone', founded: 'Founded date', source: 'Source',
    mapNotice: 'This map shows district-level summaries, not exact group locations.',
    categoryNotice: 'Categories are inferred from organization-name keywords and are not official categories provided by the data source.',
    count: 'Group count', top: 'Top inferred categories', view: 'View directory', more: 'Load more',
    total: 'Total civic groups', withDistrict: 'Records with district', withPhone: 'Records with phone',
    withYear: 'Records with founding year', topDistrict: 'Top district by group count', topCategory: 'Top inferred category',
    oldest: 'Oldest founding year', newest: 'Newest founding year', byDistrict: 'Civic groups by district',
    byDecade: 'Civic groups by founding decade', byYear: 'Civic groups by founding year',
    byCategory: 'Civic groups by inferred category', phoneAvailability: 'Phone availability', districtAvailability: 'District extraction availability',
    disclaimer: 'This site presents Taipei civic group directory records from public data. Addresses, phone numbers, and organization status should be verified with official sources and the organizations themselves. The map shows district-level summaries, not exact group locations. Inferred categories are generated from organization-name keywords and are not official categories provided by the data source.',
    method: 'Processing method', methodText: 'Addresses are matched only against Taipei’s 12 district names. Founding dates support ROC and Gregorian formats. Categories are inferred only from name keywords. Unparsed raw values remain in the directory.',
    fields: 'Field mapping', updated: 'Converted at', noResults: 'No records match these filters.',
    loading: 'Loading data…', loadError: 'Data failed to load. Please refresh the page.',
    footer: 'Data sources: Taipei civic groups, Taipei performing-arts group registry dataset, registered labor unions, Taipei disability employment resource map, Taipei sheltered workshop directory, Taipei recycling business organization records, Taipei registered factory records, Taipei cemetery public facility records, Taipei City Police Department licensed pawnshop directory, Taipei licensed electronic game arcade operator records, Taipei licensed special entertainment business operator records, Taipei contracted vaccination medical provider records, Taipei publicly funded HPV vaccination provider records, Taipei child medical subsidy contracted provider records, Taipei denture subsidy medical provider records, Taipei telepsychology counseling institution records, Taipei business premises public liability insurance records, Taipei business registration change records, Taipei company registration change records, industry grants, Taipei biotech company directory records, Metro procurement, registered cram schools, registered hotels, Taipei Travel accommodation dataset, Labor Standards Act violation publication records, Occupational Safety and Health Act violation publication records, Gender Equality in Employment Act violation publication records, Taipei consumer dispute absent business operator notices, Nangang Software Park company directory, Dawannan Industrial Area company directory, Taipei animal hospital directory, Taipei animal medicine seller records, Taipei quasi-public infant care center records, Taipei infant care center evaluation results, Taipei elderly welfare institution directory records, and related public data. These datasets have different meanings. Latest official information should be verified with authorities and official systems.',
  },
} as const;

const emptyFilters: CivicGroupFilters = {
  search: '', district: '', category: '', decade: '', yearFrom: '', yearTo: '', phone: '',
};

const zhUiCopy: Record<string, string> = {
  title: '臺北公共資料探索儀表板', subtitle: '以臺北市公開資料建立的查詢、比較與資料品質檢視工具。',
  civicGroups: '人民團體', performingArtsGroups: '表演藝術團體', vaccinationProviders: '預防接種合約醫療院所', hpvProviders: 'HPV 疫苗合約醫療院所',
  childMedicalSubsidyProviders: '兒童醫療補助合約院所', dentureSubsidyProviders: '假牙補助合約院所', disabilityEmploymentResources: '身心障礙就業資源',
  shelteredWorkshops: '庇護工場', employmentAgencies: '私立就業服務機構', licensedPawnshops: '合法當舖', licensedArcades: '電子遊戲場業',
  licensedSpecialEntertainment: '特種娛樂業', recyclingOrganizations: '回收業者', registeredFactories: '登記工廠', enterpriseHeadquarters: '企業總部',
  cemeteryPublicFacilities: '公墓設施', telepsychology: '通訊心理諮商機構', publicLiabilityInsurance: '公共意外責任保險',
  businessChanges: '商業登記異動', companyChanges: '公司登記異動', laborUnions: '工會', infantCareCenters: '準公共托嬰中心',
  infantCareEvaluations: '托嬰中心評鑑', elderlyWelfare: '老人福利機構', biotechCompanies: '生技公司', travelAccommodations: '旅宿資料',
  industryGrants: '產業補助', metroProcurement: '捷運採購', registeredCramSchools: '立案補習班', registeredHotels: '立案旅館',
  laborViolations: '勞基法違規紀錄', oshViolations: '職業安全衛生違規紀錄', genderEqualityViolations: '性別平等工作法違規紀錄',
  consumerDisputeAbsence: '消費爭議未到場業者', nangangCompanies: '南港軟體園區公司', dawannanCompanies: '大南灣工業區公司',
  animalHospitals: '動物醫院', animalMedicineSellers: '動物用藥品販賣業者', petBusinessEvaluations: '特定寵物業評鑑', veterinarians: '獸醫師名冊',
  comparison: '行政區比較', overview: '總覽', notes: '資料說明', map: '地圖', directory: '名冊', search: '搜尋', district: '行政區', category: '類別',
  decade: '成立年代', phone: '電話', all: '全部', yes: '有', no: '無', from: '起始年份', to: '結束年份', clear: '清除篩選',
  found: '筆紀錄', address: '地址', phoneLabel: '電話', source: '資料來源', loading: '資料載入中…', loadError: '資料載入失敗，請重新整理頁面。',
  footer: '資料均來自臺北市及相關政府公開資料；實際服務、資格、地址與狀態請向主管機關或各機構確認。',
};

const zhTabLabels: Record<string, string> = {
  pediatricMedicalInstitutions: '臺北市兒科醫療機構',
  seniorGroupMealServiceSites: '老人共餐單位一覽表', publicPneumococcalVaccineProviders: '公費肺炎鏈球菌疫苗合約醫療院所',
  majorElectricityUsers: '臺北市用電大戶資料', earlyInterventionMedicalProviders: '早期療育合約醫療院所', generalDentalMedicalInstitutions: '牙醫一般科醫療機構',
  diabetesSharedCareMedicalInstitutions: '糖尿病共照網醫事機構', waterPipeInstallationContractors: '自來水管承裝商業者',
  seniorCareInstitutionEvaluations: '老人安養暨長期照顧機構評鑑', fertilitySubsidyContractedHospitals: '生育補助合約醫院', fiveCancerScreeningProviders: '五癌篩檢醫療院所',
  rabiesVaccinationVeterinaryClinics: '狂犬病疫苗獸醫診療機構', seniorServiceSiteCourses: '銀髮族據點課程', taipeiGovernmentApplicationServices: '台北服務通申辦服務',
  psychiatricRehabilitationAndNursingInstitutions: '精神復健暨精神護理機構', culturalArtsFoundations: '文化藝術財團法人', visuallyImpairedMassageEstablishments: '視障按摩院所名冊',
  approvedGasWaterHeaterInstallers: '核准燃氣熱水器承裝業及技術士', petRegistrationStations: '寵物登記站名冊', bottledGasRetailers: '桶裝瓦斯零售商',
  rotavirusVaccineSubsidyProviders: '輪狀病毒疫苗補助合約醫療院所', socialWelfareFoundations: '社會福利基金會', generalWesternMedicineInstitutions: '西醫一般科醫療機構',
  schoolchildDentalPreventiveCareProviders: '學童牙齒預防保健醫療院所', streetPerformerVenues: '街頭藝人展演場地', hospitalHemodialysisResources: '公私立醫院血液透析資源',
  domesticEmploymentServiceAgencies: '仲介本國人國內工作私立就業服務機構', postpartumCareInstitutions: '產後護理機構', outCityFuneralBusinesses: '外縣市殯葬業者',
  hotelHygieneDirectory: '旅館衛生認證', kindergartenEvaluationPass: '幼兒園評鑑通過名單', pestControlBusinesses: '病媒防治業者',
  adultInfluenzaVaccineProviders: '成人流感疫苗合約醫療院所', licensedWasteCookingOilCollectors: '廢食用油脂回收清除業者', homeNursingInstitutions: '居家護理機構',
  optometryInstitutions: '驗光所', generalChineseMedicineInstitutions: '中醫一般科醫療機構', alternativeServiceReserveStatistics: '替代役備役役男統計',
  medicalLaboratories: '醫事檢驗所', communityCareServiceSites: '社區照顧關懷據點', seniorCareCapacityAndOccupancy: '老人照顧機構床位與入住資訊',
  domesticEmploymentAgencyEvaluations: '私立就業服務機構評鑑結果', lodgingBusinessPenaltyRecords: '旅宿業裁罰紀錄表', communityPublicChildcareHomes: '社區公共托育家園',
  tbContactScreeningPartnerProviders: '結核病接觸者檢查合作醫療院所', beautyHairdressingHygieneCertifications: '美容美髮衛生認證',
  publicInfluenzaAntiviralProviders: '公費流感抗病毒藥劑合約醫療院所', communityIntegratedCareLevelCUnits: '社區整合型服務中心 C 級據點',
  registeredAfterSchoolCareCentres: '立案課後照顧中心', subsidizedSeniorResidentialPlacementInstitutions: '老人住宅安置補助機構',
  familyMedicineInstitutions: '家庭醫學科醫療機構', cosmeticMedicineSupervision2024: '醫美醫療機構督導統計', plasticSurgeryMedicalInstitutions: '整形外科醫療機構',
  indigenousCommunityOrganizations: '臺北市原住民社團', licensedNaturalGasPipelineContractors: '天然氣導管承裝業', communityDevelopmentAssociations: '社區發展協會',
  obstetricsGynecologyInstitutions: '婦產科醫療機構', artsCulturalVenues: '臺北市藝文場館', psychiatricClinics: '精神科診所',
  licensedAssistedReproductionInstitutions: '特約人工生殖機構', childYouthResidentialPlacementInstitutions: '兒少安置及教養機構', childYouthFriendlyWelfareServiceSites: '兒少友善福利服務據點',
};

function BarChart({ data, label }: { data: Array<{ label: string; count: number }>; label: string }) {
  const max = Math.max(...data.map((item) => item.count), 1);
  return <section className="chart">
    <h3>{label}</h3>
    <div className="bars">
      {data.map((item) => <div className="bar-row" key={item.label}>
        <span title={item.label}>{item.label}</span>
        <div><i style={{ width: `${Math.max(2, item.count / max * 100)}%` }} /></div>
        <b>{item.count.toLocaleString()}</b>
      </div>)}
    </div>
  </section>;
}

function FilterPanel({ filters, setFilters, language, decades }: {
  filters: CivicGroupFilters; setFilters: (filters: CivicGroupFilters) => void;
  language: Language; decades: string[];
}) {
  const t = language === 'zh' ? { ...copy.zh, ...zhUiCopy } : copy.en;
  const update = (key: keyof CivicGroupFilters, value: string) => setFilters({ ...filters, [key]: value });
  return <aside className="filters" aria-label={language === 'zh' ? '篩選條件' : 'Filters'}>
    <label className="search"><span aria-hidden="true">⌕</span><input aria-label={t.search} value={filters.search} onChange={(event) => update('search', event.target.value)} placeholder={t.search} /></label>
    <div className="filter-grid">
      <label>{t.district}<select value={filters.district} onChange={(event) => update('district', event.target.value)}>
        <option value="">{t.all}</option>{DISTRICTS.map((district) => <option key={district}>{district}</option>)}
      </select></label>
      <label>{t.category}<select value={filters.category} onChange={(event) => update('category', event.target.value)}>
        <option value="">{t.all}</option>{CATEGORIES.map((category) => <option value={category} key={category}>{getCategoryLabel(category, language)}</option>)}
      </select></label>
      <label>{t.decade}<select value={filters.decade} onChange={(event) => update('decade', event.target.value)}>
        <option value="">{t.all}</option>{decades.map((decade) => <option value={decade} key={decade}>{language === 'zh' ? decade.replace('s', '年代') : decade}</option>)}
      </select></label>
      <label>{t.phone}<select value={filters.phone} onChange={(event) => update('phone', event.target.value)}>
        <option value="">{t.all}</option><option value="yes">{t.yes}</option><option value="no">{t.no}</option>
      </select></label>
      <label>{t.from}<input type="number" inputMode="numeric" value={filters.yearFrom} onChange={(event) => update('yearFrom', event.target.value)} /></label>
      <label>{t.to}<input type="number" inputMode="numeric" value={filters.yearTo} onChange={(event) => update('yearTo', event.target.value)} /></label>
    </div>
    {Object.values(filters).some(Boolean) && <button className="text-button" onClick={() => setFilters(emptyFilters)}>{t.clear}</button>}
  </aside>;
}

function GroupDirectory({ groups, language }: { groups: CivicGroup[]; language: Language }) {
  const [limit, setLimit] = useState(60);
  const t = language === 'zh' ? { ...copy.zh, ...zhUiCopy } : copy.en;
  useEffect(() => setLimit(60), [groups]);
  return <div className="directory-list">
    {groups.slice(0, limit).map((group) => <article className="group-row" key={group.id}>
      <div><p className="eyebrow">{group.district ?? (language === 'zh' ? '行政區未辨識' : 'District unavailable')}</p>
        <h3>{group.name}</h3><span className="tag">{getCategoryLabel(group.inferredCategory, language)}</span></div>
      <dl>
        <div><dt>{t.address}</dt><dd>{group.address ?? '—'}</dd></div>
        <div><dt>{t.phoneLabel}</dt><dd>{group.phone ? <a href={`tel:${group.phone}`}>{group.phone}</a> : '—'}</dd></div>
        <div><dt>{t.founded}</dt><dd>{formatFoundedDate(group, language)}{group.foundedYear ? ` · ${group.foundedYear}` : ''}</dd></div>
        <div><dt>{t.source}</dt><dd>{group.source}</dd></div>
      </dl>
    </article>)}
    {!groups.length && <p className="empty">{t.noResults}</p>}
    {limit < groups.length && <button className="load-more" onClick={() => setLimit(limit + 60)}>{t.more} · {groups.length - limit}</button>}
  </div>;
}

function CivicMap({ summary, language, openDistrict }: {
  summary: CivicGroupSummary; language: Language; openDistrict: (district: string) => void;
}) {
  const t = language === 'zh' ? { ...copy.zh, ...zhUiCopy } : copy.en;
  return <div className="map-wrap">
    <div className="notice">{t.mapNotice}</div>
    <MapContainer center={[25.072, 121.54]} zoom={11} scrollWheelZoom={false}>
      <TileLayer attribution='&copy; OpenStreetMap contributors &copy; CARTO' url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
      {summary.districtSummaries.filter((district) => district.count).map((district) =>
        <CircleMarker key={district.district} center={[district.latitude, district.longitude]}
          radius={Math.max(10, Math.sqrt(district.count) * 1.15)}
          pathOptions={{ fillColor: '#d75b3f', fillOpacity: .72, color: '#fff7e8', weight: 2 }}>
          <Popup><div className="map-popup"><strong>{district.district}</strong>
            <p>{t.count}: {district.count.toLocaleString()}</p><p>{t.top}: {district.topCategories.map((item) => getCategoryLabel(item.category, language)).join('、')}</p>
            <button onClick={() => openDistrict(district.district)}>{t.view}</button></div></Popup>
        </CircleMarker>)}
    </MapContainer>
  </div>;
}

function Overview({ summary, groups, language }: { summary: CivicGroupSummary; groups: CivicGroup[]; language: Language }) {
  const t = language === 'zh' ? { ...copy.zh, ...zhUiCopy } : copy.en;
  const years = groups.flatMap((group) => group.foundedYear ?? []);
  const topDistrict = summary.byDistrict[0];
  const topCategory = summary.byInferredCategory[0];
  const stats = [
    [t.total, summary.total], [t.withDistrict, summary.recordsWithDistrict], [t.withPhone, summary.recordsWithPhone],
    [t.withYear, summary.recordsWithFoundedYear], [t.topDistrict, topDistrict?.district ?? '—'],
    [t.topCategory, topCategory ? getCategoryLabel(topCategory.category, language) : '—'],
    [t.oldest, years.length ? Math.min(...years) : '—'], [t.newest, years.length ? Math.max(...years) : '—'],
  ];
  const chartYears = summary.byFoundedYear.filter((item) => item.year >= 1900);
  const bucket = Math.max(1, Math.ceil(chartYears.length / 30));
  const compressedYears = Array.from({ length: Math.ceil(chartYears.length / bucket) }, (_, index) => {
    const slice = chartYears.slice(index * bucket, (index + 1) * bucket);
    return { label: slice.length > 1 ? `${slice[0].year}–${slice.at(-1)!.year}` : String(slice[0]?.year), count: slice.reduce((sum, item) => sum + item.count, 0) };
  });
  return <>
    <div className="summary-grid">{stats.map(([label, value]) => <article key={label}><span>{label}</span><strong>{typeof value === 'number' ? value.toLocaleString() : value}</strong></article>)}</div>
    <div className="chart-grid">
      <BarChart label={t.byDistrict} data={summary.byDistrict.map((item) => ({ label: item.district, count: item.count }))} />
      <BarChart label={t.byDecade} data={summary.byFoundedDecade.map((item) => ({ label: language === 'zh' ? item.decade.replace('s', '年代') : item.decade, count: item.count }))} />
      <BarChart label={t.byCategory} data={summary.byInferredCategory.map((item) => ({ label: getCategoryLabel(item.category, language), count: item.count }))} />
      <BarChart label={t.byYear} data={compressedYears} />
      <BarChart label={t.phoneAvailability} data={[
        { label: t.withPhone, count: summary.recordsWithPhone },
        { label: language === 'zh' ? '無電話紀錄' : 'Without phone', count: summary.total - summary.recordsWithPhone },
      ]} />
      <BarChart label={t.districtAvailability} data={[
        { label: t.withDistrict, count: summary.recordsWithDistrict },
        { label: language === 'zh' ? '無法辨識行政區' : 'Without district', count: summary.recordsWithoutDistrict },
      ]} />
    </div>
  </>;
}

function CombinedOverview({ civic, performingArts, vaccinationProviders, hpvProviders, childMedicalSubsidyProviders, dentureSubsidyProviders, disabilityEmploymentResources, shelteredWorkshops, licensedPawnshops, licensedArcades, licensedSpecialEntertainment, recyclingOrganizations, registeredFactories, enterpriseHeadquarters, cemeteryPublicFacilities, telepsychology, publicLiabilityInsurance, businessChanges, companyChanges, laborUnions, infantCare, infantCareEvaluations, elderlyWelfare, biotechCompanies, travelAccommodations, grants, procurement, cramSchools, hotels, laborViolations, oshViolations, genderEqualityViolations, consumerDisputeAbsence, nangangCompanies, dawannanCompanies, animalHospitals, animalMedicineSellers, petBusinessEvaluations, veterinarians, language }: {
  civic: CivicGroupSummary; performingArts: PerformingArtsGroupSummary; vaccinationProviders: ContractedVaccinationMedicalProviderSummary; hpvProviders: PubliclyFundedHpvVaccinationProviderSummary; childMedicalSubsidyProviders: ChildMedicalSubsidyContractedProviderSummary; dentureSubsidyProviders: DentureSubsidyMedicalProviderSummary; disabilityEmploymentResources: DisabilityEmploymentResourceSummary; shelteredWorkshops: ShelteredWorkshopDirectorySummary; licensedPawnshops: LicensedPawnshopDirectorySummary; licensedArcades: LicensedElectronicGameArcadeOperatorSummary; licensedSpecialEntertainment: LicensedSpecialEntertainmentBusinessOperatorSummary; recyclingOrganizations: RegisteredRecyclingBusinessOrganizationSummary; registeredFactories: RegisteredFactorySummary; enterpriseHeadquarters: EnterpriseHeadquartersSummary; cemeteryPublicFacilities: CemeteryPublicFacilitySummary; telepsychology: TelepsychologyCounselingInstitutionSummary; publicLiabilityInsurance: BusinessPremisesPublicLiabilityInsuranceSummary; businessChanges: BusinessRegistrationChangeSummary; companyChanges: CompanyRegistrationChangeSummary; laborUnions: RegisteredLaborUnionSummary; infantCare: QuasiPublicInfantCareCenterSummary; infantCareEvaluations: InfantCareCenterEvaluationSummary; elderlyWelfare: ElderlyWelfareInstitutionSummary; biotechCompanies: BiotechCompanyDirectorySummary; travelAccommodations: TaipeiTravelAccommodationZhSummary; grants: IndustryGrantSummary; procurement: MetroProcurementScheduleSummary; cramSchools: RegisteredCramSchoolSummary; hotels: RegisteredHotelSummary; laborViolations: LaborStandardActViolationSummary; oshViolations: OccupationalSafetyHealthViolationSummary; genderEqualityViolations: GenderEqualityWorkActViolationSummary; consumerDisputeAbsence: ConsumerDisputeAbsentBusinessOperatorSummary; nangangCompanies: NangangSoftwareParkCompanySummary; dawannanCompanies: DawannanIndustrialAreaCompanySummary; animalHospitals: RegisteredAnimalHospitalSummary; animalMedicineSellers: LicensedAnimalMedicineSellerSummary; petBusinessEvaluations: SpecificPetBusinessEvaluationSummary; veterinarians: VeterinarianProfessionalRegistrySummary; language: Language;
}) {
  const zh = language === 'zh';
  return <section className="workspace"><div className="section-heading"><p>08 / PUBLIC RECORDS OVERVIEW</p><h2>{zh ? '資料概覽' : 'Data Overview'}</h2></div>
    <div className="notice subtle">{zh ? '此圖僅比較公開資料中的紀錄數與來源欄位，不代表資料重要性、政策成效、法律狀態、會員資格、醫療品質、即時營業狀態、推薦程度或官方背書。' : 'This chart only compares public-data record counts and source fields. It does not represent data importance, policy effectiveness, legal status, membership eligibility, medical quality, real-time operating status, recommendation, or official endorsement.'}</div>
    <div className="summary-grid"><article><span>{zh ? '人民團體紀錄' : 'Civic group records'}</span><strong>{civic.total.toLocaleString()}</strong></article>
      <article><span>{zh ? '演藝團體數' : 'Performing arts group count'}</span><strong>{performingArts.totalRecords.toLocaleString()}</strong></article>
      <article><span>{zh ? '演藝團體有網址紀錄' : 'Performing arts records with website'}</span><strong>{performingArts.recordsWithWebsite.toLocaleString()}</strong></article>
      <article><span>{zh ? '預防接種合約院所數' : 'Vaccination provider records'}</span><strong>{vaccinationProviders.totalRecords.toLocaleString()}</strong></article>
      <article><span>{zh ? 'COVID-19院所數' : 'COVID-19 provider count'}</span><strong>{vaccinationProviders.providerCategorySummary.covidProviderCount.toLocaleString()}</strong></article>
      <article><span>{zh ? 'HPV疫苗特約院所數' : 'HPV vaccination provider count'}</span><strong>{hpvProviders.totalRecords.toLocaleString()}</strong></article>
      <article><span>{zh ? 'HPV院所涵蓋行政區數' : 'HPV districts covered'}</span><strong>{hpvProviders.districtCount.toLocaleString()}</strong></article>
      <article><span>{zh ? '兒童醫療補助特約院所數' : 'Child medical subsidy provider count'}</span><strong>{childMedicalSubsidyProviders.totalRecords.toLocaleString()}</strong></article>
      <article><span>{zh ? '兒童醫療補助院所涵蓋地區' : 'Child subsidy areas covered'}</span><strong>{childMedicalSubsidyProviders.administrativeAreaCount.toLocaleString()}</strong></article>
      <article><span>{zh ? '假牙補助醫療院所數' : 'Denture subsidy provider count'}</span><strong>{dentureSubsidyProviders.totalRecords.toLocaleString()}</strong></article>
      <article><span>{zh ? '假牙補助院所涵蓋區域' : 'Denture subsidy areas covered'}</span><strong>{dentureSubsidyProviders.administrativeAreaCount.toLocaleString()}</strong></article>
      <article><span>{zh ? '身障就業資源數' : 'Disability employment resource count'}</span><strong>{disabilityEmploymentResources.totalRecords.toLocaleString()}</strong></article>
      <article><span>{zh ? '身障就業資源涵蓋行政區' : 'Disability resource districts covered'}</span><strong>{disabilityEmploymentResources.taipeiDistrictCount.toLocaleString()}</strong></article>
      <article><span>{zh ? '庇護工場數' : 'Sheltered workshop count'}</span><strong>{shelteredWorkshops.totalRecords.toLocaleString()}</strong></article>
      <article><span>{zh ? '庇護工場涵蓋行政區' : 'Sheltered workshop districts covered'}</span><strong>{shelteredWorkshops.taipeiDistrictCount.toLocaleString()}</strong></article>
      <article><span>{zh ? '合法當舖數' : 'Licensed pawnshop count'}</span><strong>{licensedPawnshops.totalRecords.toLocaleString()}</strong></article>
      <article><span>{zh ? '不重複許可證號數' : 'Unique license number count'}</span><strong>{licensedPawnshops.uniqueLicenseNumberCount.toLocaleString()}</strong></article>
      <article><span>{zh ? '電子遊戲場業者紀錄數' : 'Game arcade operator records'}</span><strong>{licensedArcades.totalRecords.toLocaleString()}</strong></article>
      <article><span>{zh ? '電子遊戲場涵蓋行政區' : 'Game arcade districts covered'}</span><strong>{licensedArcades.districtCount.toLocaleString()}</strong></article>
      <article><span>{zh ? '八大行業業者紀錄數' : 'Special entertainment operator records'}</span><strong>{licensedSpecialEntertainment.totalRecords.toLocaleString()}</strong></article>
      <article><span>{zh ? '八大行業業者有效座標' : 'Special entertainment valid coordinates'}</span><strong>{licensedSpecialEntertainment.recordsWithValidCoordinates.toLocaleString()}</strong></article>
      <article><span>{zh ? '回收業機構紀錄數' : 'Recycling organization records'}</span><strong>{recyclingOrganizations.totalRecords.toLocaleString()}</strong></article>
      <article><span>{zh ? '回收業機構涵蓋行政區' : 'Recycling organization districts covered'}</span><strong>{recyclingOrganizations.districtCount.toLocaleString()}</strong></article>
      <article><span>{zh ? '登記工廠紀錄數' : 'Registered factory records'}</span><strong>{registeredFactories.totalRecords.toLocaleString()}</strong></article>
      <article><span>{zh ? '登記工廠有效轉換座標' : 'Registered factory valid converted coordinates'}</span><strong>{registeredFactories.recordsWithValidCoordinates.toLocaleString()}</strong></article>
      <article><span>{zh ? '企業營運總部紀錄數' : 'Enterprise headquarters records'}</span><strong>{enterpriseHeadquarters.totalRecords.toLocaleString()}</strong></article>
      <article><span>{zh ? '企業總部有效轉換座標' : 'Enterprise headquarters valid coordinates'}</span><strong>{enterpriseHeadquarters.recordsWithValidConvertedCoordinates.toLocaleString()}</strong></article>
      <article><span>{zh ? '公墓紀錄數' : 'Cemetery record count'}</span><strong>{cemeteryPublicFacilities.totalRecords.toLocaleString()}</strong></article>
      <article><span>{zh ? '公墓有效座標紀錄數' : 'Cemetery records with valid coordinates'}</span><strong>{cemeteryPublicFacilities.recordsWithValidCoordinates.toLocaleString()}</strong></article>
      <article><span>{zh ? '通訊心理諮商機構數' : 'Telepsychology institution count'}</span><strong>{telepsychology.totalRecords.toLocaleString()}</strong></article>
      <article><span>{zh ? '有手機心理機構紀錄' : 'Mental-health records with mobile'}</span><strong>{telepsychology.recordsWithMobile.toLocaleString()}</strong></article>
      <article><span>{zh ? '公共意外險清冊紀錄' : 'Public liability insurance records'}</span><strong>{publicLiabilityInsurance.totalRecords.toLocaleString()}</strong></article>
      <article><span>{zh ? '公共意外險有效座標' : 'Insurance records with coordinates'}</span><strong>{publicLiabilityInsurance.recordsWithValidCoordinates.toLocaleString()}</strong></article>
      <article><span>{zh ? '商業異動紀錄' : 'Business change records'}</span><strong>{businessChanges.totalRecords.toLocaleString()}</strong></article>
      <article><span>{zh ? '商業異動有效座標' : 'Business changes with coordinates'}</span><strong>{businessChanges.recordsWithValidCoordinates.toLocaleString()}</strong></article>
      <article><span>{zh ? '公司異動紀錄數' : 'Company change record count'}</span><strong>{companyChanges.totalRecords.toLocaleString()}</strong></article>
      <article><span>{zh ? '公司異動有效座標' : 'Company changes with coordinates'}</span><strong>{companyChanges.recordsWithValidCoordinates.toLocaleString()}</strong></article>
      <article><span>{zh ? '工會名單紀錄' : 'Labor union records'}</span><strong>{laborUnions.totalRecords.toLocaleString()}</strong></article>
      <article><span>{zh ? '托嬰中心數' : 'Infant care centers'}</span><strong>{infantCare.totalRecords.toLocaleString()}</strong></article>
      <article><span>{zh ? '托嬰評鑑機構數' : 'Infant care evaluation institutions'}</span><strong>{infantCareEvaluations.totalInstitutions.toLocaleString()}</strong></article>
      <article><span>{zh ? '核定收托人數總計' : 'Total approved capacity'}</span><strong>{infantCare.totalApprovedCapacity?.toLocaleString() ?? '—'}</strong></article>
      <article><span>{zh ? '老人福利機構數' : 'Elderly care institutions'}</span><strong>{elderlyWelfare.totalRecords.toLocaleString()}</strong></article>
      <article><span>{zh ? '老人福利機構核定床位' : 'Elderly care approved beds'}</span><strong>{elderlyWelfare.totalApprovedBeds.toLocaleString()}</strong></article>
      <article><span>{zh ? '生技廠商數' : 'Biotech company count'}</span><strong>{biotechCompanies.totalRecords.toLocaleString()}</strong></article>
      <article><span>{zh ? '生技廠商有效座標' : 'Biotech valid coordinates'}</span><strong>{biotechCompanies.recordsWithValidCoordinates.toLocaleString()}</strong></article>
      <article><span>{zh ? '臺北旅遊網住宿紀錄' : 'Taipei Travel accommodation records'}</span><strong>{travelAccommodations.totalRecords.toLocaleString()}</strong></article>
      <article><span>{zh ? '表列房間數總計' : 'Listed total room count'}</span><strong>{travelAccommodations.totalRoomCount?.toLocaleString() ?? '—'}</strong></article>
      <article><span>{zh ? '補助紀錄' : 'Subsidy records'}</span><strong>{grants.totalRecords.toLocaleString()}</strong></article>
      <article><span>{zh ? '獲補助廠商' : 'Grant recipient companies'}</span><strong>{grants.uniqueCompanyCount.toLocaleString()}</strong></article>
      <article><span>{zh ? '捷運採購時程紀錄' : 'Metro procurement schedule records'}</span><strong>{procurement.totalRecords.toLocaleString()}</strong></article>
      <article><span>{zh ? '立案補習班紀錄' : 'Registered cram-school records'}</span><strong>{cramSchools.totalRecords.toLocaleString()}</strong></article>
      <article><span>{zh ? '一般旅館登記紀錄' : 'Registered hotel records'}</span><strong>{hotels.totalRecords.toLocaleString()}</strong></article>
      <article><span>{zh ? '勞基法違規公布紀錄' : 'Labor violation publication records'}</span><strong>{laborViolations.totalRecords.toLocaleString()}</strong></article>
      <article><span>{zh ? '職安法違規公布紀錄' : 'OSH violation publication records'}</span><strong>{oshViolations.totalRecords.toLocaleString()}</strong></article>
      <article><span>{zh ? '性平工作法違規公布紀錄' : 'Gender equality work violation records'}</span><strong>{genderEqualityViolations.totalRecords.toLocaleString()}</strong></article>
      <article><span>{zh ? '消費爭議不到場公告' : 'Consumer dispute absence notices'}</span><strong>{consumerDisputeAbsence.totalRecords.toLocaleString()}</strong></article></div>
    <div className="summary-grid"><article><span>{zh ? '南港園區廠商紀錄' : 'Nangang park company records'}</span><strong>{nangangCompanies.totalRecords.toLocaleString()}</strong></article><article><span>{zh ? '大彎南段廠商紀錄' : 'Dawannan company records'}</span><strong>{dawannanCompanies.totalRecords.toLocaleString()}</strong></article><article><span>{zh ? '大彎南段已轉換座標' : 'Dawannan converted coordinates'}</span><strong>{dawannanCompanies.recordsWithConvertedWgs84Coordinates.toLocaleString()}</strong></article><article><span>{zh ? '動物醫院數' : 'Animal hospital count'}</span><strong>{animalHospitals.totalRecords.toLocaleString()}</strong></article><article><span>{zh ? '動物用藥業者紀錄數' : 'Animal medicine seller record count'}</span><strong>{animalMedicineSellers.totalRecords.toLocaleString()}</strong></article><article><span>{zh ? '動物用藥業者可解析行政區' : 'Animal medicine seller parsed districts'}</span><strong>{animalMedicineSellers.districtCount.toLocaleString()}</strong></article><article><span>{zh ? '寵物業評鑑紀錄數' : 'Pet business evaluation records'}</span><strong>{petBusinessEvaluations.totalRecords.toLocaleString()}</strong></article><article><span>{zh ? '最新寵物業評鑑年度' : 'Latest pet business evaluation year'}</span><strong>{petBusinessEvaluations.latestEvaluationYearRoc ?? '—'}</strong></article><article><span>{zh ? '獸醫師資訊紀錄' : 'Veterinarian records'}</span><strong>{veterinarians.totalRecords.toLocaleString()}</strong></article><article><span>{zh ? '服務獸醫診療機構數' : 'Service veterinary institutions'}</span><strong>{veterinarians.uniqueServiceVeterinaryInstitutionNameCount.toLocaleString()}</strong></article></div>
    <div className="chart-grid"><BarChart label={zh ? '各行政區人民團體數' : 'Civic groups by district'} data={civic.byDistrict.map((item) => ({ label: item.district, count: item.count }))} />
      <BarChart label={zh ? '各行政區演藝團體數' : 'Performing arts groups by district'} data={performingArts.byDistrict.map((item) => ({ label: item.district, count: item.groupCount }))} />
      <BarChart label={zh ? '各行政區預防接種合約院所數' : 'Vaccination providers by district'} data={vaccinationProviders.byDistrict.map((item) => ({ label: item.district, count: item.providerCount }))} />
      <BarChart label={zh ? '各行政區HPV疫苗特約院所數' : 'HPV providers by district'} data={hpvProviders.byDistrict.map((item) => ({ label: item.district, count: item.providerCount }))} />
      <BarChart label={zh ? '兒童醫療補助各地區院所數' : 'Child subsidy providers by area'} data={childMedicalSubsidyProviders.byAdministrativeArea.map((item) => ({ label: item.administrativeArea, count: item.providerCount }))} />
      <BarChart label={zh ? '假牙補助各區域院所數' : 'Denture subsidy providers by area'} data={dentureSubsidyProviders.byAdministrativeArea.map((item) => ({ label: item.administrativeArea, count: item.providerCount }))} />
      <BarChart label={zh ? '各行政區身障就業資源數' : 'Disability employment resources by district'} data={disabilityEmploymentResources.byDistrict.map((item) => ({ label: item.district, count: item.resourceCount }))} />
      <BarChart label={zh ? '各行政區庇護工場數' : 'Sheltered workshops by district'} data={shelteredWorkshops.byDistrict.map((item) => ({ label: item.district, count: item.workshopCount }))} />
      <BarChart label={zh ? '各行政區當舖數' : 'Pawnshops by district'} data={licensedPawnshops.byDistrict.map((item) => ({ label: item.district, count: item.pawnshopCount }))} />
      <BarChart label={zh ? '各行政區電子遊戲場業者數' : 'Game arcade operators by district'} data={licensedArcades.byDistrict.map((item) => ({ label: item.districtName, count: item.count }))} />
      <BarChart label={zh ? '各行政區八大行業業者數' : 'Special entertainment operators by district'} data={licensedSpecialEntertainment.byDistrict.map((item) => ({ label: item.districtName, count: item.count }))} />
      <BarChart label={zh ? '各行政區回收業機構數' : 'Recycling organizations by district'} data={recyclingOrganizations.byDistrict.map((item) => ({ label: item.districtName, count: item.count }))} />
      <BarChart label={zh ? '各行政區登記工廠數' : 'Registered factories by district'} data={registeredFactories.byDistrict.map((item) => ({ label: item.districtName, count: item.count }))} />
      <BarChart label={zh ? '各行政區企業營運總部數' : 'Enterprise headquarters by district'} data={enterpriseHeadquarters.byDistrict.map((item) => ({ label: item.districtName, count: item.count }))} />
      <BarChart label={zh ? '各產業類別群組企業營運總部數' : 'Enterprise headquarters by industry category group'} data={enterpriseHeadquarters.byIndustryCategoryGroup.map((item) => ({ label: item.industryCategoryLabelZh, count: item.count }))} />
      <BarChart label={zh ? '各行政區公墓數' : 'Cemeteries by district'} data={cemeteryPublicFacilities.byDistrict.map((item) => ({ label: item.districtName, count: item.count }))} />
      <BarChart label={zh ? '各行政區通訊心理諮商機構數' : 'Telepsychology institutions by district'} data={telepsychology.byDistrict.map((item) => ({ label: item.district, count: item.institutionCount }))} />
      <BarChart label={zh ? '各行政區公共意外險清冊紀錄數' : 'Public liability insurance records by district'} data={publicLiabilityInsurance.byDistrict.map((item) => ({ label: item.district, count: item.recordCount }))} />
      <BarChart label={zh ? '各行政區商業異動紀錄數' : 'Business changes by district'} data={businessChanges.byDistrict.map((item) => ({ label: item.district, count: item.totalCount }))} />
      <BarChart label={zh ? '各行政區公司異動紀錄數' : 'Company changes by district'} data={companyChanges.byDistrict.map((item) => ({ label: item.district, count: item.totalCount }))} />
      <BarChart label={zh ? '各申請類別演藝團體數' : 'Performing arts groups by application category'} data={performingArts.byApplicationCategory.map((item) => ({ label: item.applicationCategoryRaw ?? item.applicationCategory, count: item.count }))} />
      <BarChart label={zh ? '各行政區工會數' : 'Labor unions by district'} data={laborUnions.byDistrict.map((item) => ({ label: item.district, count: item.count }))} />
      <BarChart label={zh ? '各行政區托嬰中心數' : 'Infant care centers by district'} data={infantCare.byDistrict.map((item) => ({ label: item.district, count: item.centerCount }))} />
      <BarChart label={zh ? '各行政區托嬰評鑑機構數' : 'Infant care evaluation institutions by district'} data={infantCareEvaluations.byDistrictLatestYear.map((item) => ({ label: item.district, count: item.institutionCount }))} />
      <BarChart label={zh ? '各行政區老人福利機構數' : 'Elderly care institutions by district'} data={elderlyWelfare.byDistrict.map((item) => ({ label: item.district, count: item.institutionCount }))} />
      <BarChart label={zh ? '各行政區生技廠商數' : 'Biotech companies by district'} data={biotechCompanies.byDistrict.map((item) => ({ label: item.district, count: item.companyCount }))} />
      <BarChart label={zh ? '各行政區旅遊住宿數' : 'Travel accommodations by district'} data={travelAccommodations.byDistrict.map((item) => ({ label: item.district, count: item.accommodationCount }))} />
      <BarChart label={zh ? '各行政區補助紀錄數' : 'Grant records by district'} data={grants.byDistrict.map((item) => ({ label: item.district, count: item.recordCount }))} />
      <BarChart label={zh ? '各行政區立案補習班數' : 'Registered cram schools by district'} data={cramSchools.byDistrict.map((item) => ({ label: item.district, count: item.recordCount }))} />
      <BarChart label={zh ? '各行政區一般旅館數' : 'Registered hotels by district'} data={hotels.byDistrict.map((item) => ({ label: item.district, count: item.recordCount }))} />
      <BarChart label={zh ? '各行政區動物醫院數' : 'Animal hospitals by district'} data={animalHospitals.byDistrict.map((item) => ({ label: item.district, count: item.count }))} />
      <BarChart label={zh ? '各行政區動物用藥業者數' : 'Animal medicine sellers by district'} data={animalMedicineSellers.byDistrict.map((item) => ({ label: item.districtName, count: item.count }))} />
      <BarChart label={zh ? '各行政區寵物業評鑑紀錄數' : 'Pet business evaluations by district'} data={petBusinessEvaluations.byDistrict.map((item) => ({ label: item.districtName, count: item.count }))} />
      <BarChart label={zh ? '服務獸醫診療機構前 30 名' : 'Top 30 service veterinary institutions'} data={veterinarians.topServiceVeterinaryInstitutions.map((item) => ({ label: item.serviceVeterinaryInstitutionName, count: item.veterinarianCount }))} />
      <BarChart label={zh ? '不同公開資料模組紀錄數' : 'Record count by public-data module'} data={[
        { label: zh ? '人民團體' : 'Civic groups', count: civic.total },
        { label: zh ? '演藝團體' : 'Performing arts groups', count: performingArts.totalRecords },
        { label: zh ? '預防接種院所' : 'Vaccination providers', count: vaccinationProviders.totalRecords },
        { label: zh ? 'HPV疫苗院所' : 'HPV providers', count: hpvProviders.totalRecords },
        { label: zh ? '兒童醫療補助院所' : 'Child subsidy providers', count: childMedicalSubsidyProviders.totalRecords },
        { label: zh ? '假牙補助院所' : 'Denture subsidy providers', count: dentureSubsidyProviders.totalRecords },
        { label: zh ? '身障就業資源' : 'Disability employment resources', count: disabilityEmploymentResources.totalRecords },
        { label: zh ? '庇護工場' : 'Sheltered workshops', count: shelteredWorkshops.totalRecords },
        { label: zh ? '合法當舖' : 'Licensed pawnshops', count: licensedPawnshops.totalRecords },
        { label: zh ? '電子遊戲場業者' : 'Game arcade operators', count: licensedArcades.totalRecords },
        { label: zh ? '八大行業業者' : 'Special entertainment operators', count: licensedSpecialEntertainment.totalRecords },
        { label: zh ? '回收業機構' : 'Recycling organizations', count: recyclingOrganizations.totalRecords },
        { label: zh ? '登記工廠' : 'Registered factories', count: registeredFactories.totalRecords },
        { label: zh ? '企業營運總部' : 'Enterprise headquarters', count: enterpriseHeadquarters.totalRecords },
        { label: zh ? '公墓資訊' : 'Cemeteries', count: cemeteryPublicFacilities.totalRecords },
        { label: zh ? '通訊心理諮商' : 'Telepsychology', count: telepsychology.totalRecords },
        { label: zh ? '公共意外險' : 'Public liability insurance', count: publicLiabilityInsurance.totalRecords },
        { label: zh ? '商業異動' : 'Business changes', count: businessChanges.totalRecords },
        { label: zh ? '公司異動' : 'Company changes', count: companyChanges.totalRecords },
        { label: zh ? '工會名單' : 'Labor unions', count: laborUnions.totalRecords },
        { label: zh ? '托嬰中心' : 'Infant care centers', count: infantCare.totalRecords },
        { label: zh ? '托嬰評鑑' : 'Infant care evaluations', count: infantCareEvaluations.totalInstitutions },
        { label: zh ? '老人福利機構' : 'Elderly care institutions', count: elderlyWelfare.totalRecords },
        { label: zh ? '生技廠商' : 'Biotech companies', count: biotechCompanies.totalRecords },
        { label: zh ? '旅遊住宿' : 'Travel accommodations', count: travelAccommodations.totalRecords },
        { label: zh ? '產業補助' : 'Industry grants', count: grants.totalRecords },
        { label: zh ? '捷運採購時程' : 'Metro procurement', count: procurement.totalRecords },
        { label: zh ? '立案補習班' : 'Registered cram schools', count: cramSchools.totalRecords },
        { label: zh ? '一般旅館名冊' : 'Registered hotels', count: hotels.totalRecords },
        { label: zh ? '勞基法違規公布' : 'Labor violations', count: laborViolations.totalRecords },
        { label: zh ? '職安法違規公布' : 'OSH violations', count: oshViolations.totalRecords },
        { label: zh ? '性平工作法違規公布' : 'Gender equality work violations', count: genderEqualityViolations.totalRecords },
        { label: zh ? '消費爭議不到場公告' : 'Consumer dispute notices', count: consumerDisputeAbsence.totalRecords },
        { label: zh ? '南港軟體園區廠商' : 'Nangang park companies', count: nangangCompanies.totalRecords },
        { label: zh ? '大彎南段工業區廠商' : 'Dawannan industrial area companies', count: dawannanCompanies.totalRecords },
        { label: zh ? '動物醫院' : 'Animal hospitals', count: animalHospitals.totalRecords },
        { label: zh ? '動物用藥業者' : 'Animal medicine sellers', count: animalMedicineSellers.totalRecords },
        { label: zh ? '寵物業評鑑' : 'Pet business evaluations', count: petBusinessEvaluations.totalRecords },
        { label: zh ? '獸醫師資訊' : 'Veterinarians', count: veterinarians.totalRecords },
      ]} /></div>
  </section>;
}

export default function App() {
  const [language, setLanguage] = useState<Language>('zh');
  const [tab, setTab] = useState<string>('civic');
  const [catalogueOpen, setCatalogueOpen] = useState(false);
  const [catalogueQuery, setCatalogueQuery] = useState('');
  const [civicView, setCivicView] = useState<'map' | 'directory' | 'overview'>('map');
  const [groups, setGroups] = useState<CivicGroup[]>([]);
  const [summary, setSummary] = useState<CivicGroupSummary | null>(null);
  const [performingArtsRecords, setPerformingArtsRecords] = useState<PerformingArtsGroupRecord[]>([]);
  const [performingArtsSummary, setPerformingArtsSummary] = useState<PerformingArtsGroupSummary | null>(null);
  const [vaccinationProviderRecords, setVaccinationProviderRecords] = useState<ContractedVaccinationMedicalProviderRecord[]>([]);
  const [vaccinationProviderSummary, setVaccinationProviderSummary] = useState<ContractedVaccinationMedicalProviderSummary | null>(null);
  const [hpvProviderRecords, setHpvProviderRecords] = useState<PubliclyFundedHpvVaccinationProviderRecord[]>([]);
  const [hpvProviderSummary, setHpvProviderSummary] = useState<PubliclyFundedHpvVaccinationProviderSummary | null>(null);
  const [childMedicalSubsidyProviderRecords, setChildMedicalSubsidyProviderRecords] = useState<ChildMedicalSubsidyContractedProviderRecord[]>([]);
  const [childMedicalSubsidyProviderSummary, setChildMedicalSubsidyProviderSummary] = useState<ChildMedicalSubsidyContractedProviderSummary | null>(null);
  const [dentureSubsidyProviderRecords, setDentureSubsidyProviderRecords] = useState<DentureSubsidyMedicalProviderRecord[]>([]);
  const [dentureSubsidyProviderSummary, setDentureSubsidyProviderSummary] = useState<DentureSubsidyMedicalProviderSummary | null>(null);
  const [disabilityEmploymentResourceRecords, setDisabilityEmploymentResourceRecords] = useState<DisabilityEmploymentResourceRecord[]>([]);
  const [disabilityEmploymentResourceSummary, setDisabilityEmploymentResourceSummary] = useState<DisabilityEmploymentResourceSummary | null>(null);
  const [shelteredWorkshopRecords, setShelteredWorkshopRecords] = useState<ShelteredWorkshopDirectoryRecord[]>([]);
  const [shelteredWorkshopSummary, setShelteredWorkshopSummary] = useState<ShelteredWorkshopDirectorySummary | null>(null);
  const [employmentAgencyRecords, setEmploymentAgencyRecords] = useState<EmploymentAgencyIntermediaryCompanyRecord[]>([]);
  const [employmentAgencySummary, setEmploymentAgencySummary] = useState<EmploymentAgencyIntermediaryCompanySummary | null>(null);
  const [licensedPawnshopRecords, setLicensedPawnshopRecords] = useState<LicensedPawnshopDirectoryRecord[]>([]);
  const [licensedPawnshopSummary, setLicensedPawnshopSummary] = useState<LicensedPawnshopDirectorySummary | null>(null);
  const [licensedArcadeRecords, setLicensedArcadeRecords] = useState<LicensedElectronicGameArcadeOperatorRecord[]>([]);
  const [licensedArcadeSummary, setLicensedArcadeSummary] = useState<LicensedElectronicGameArcadeOperatorSummary | null>(null);
  const [licensedSpecialEntertainmentRecords, setLicensedSpecialEntertainmentRecords] = useState<LicensedSpecialEntertainmentBusinessOperatorRecord[]>([]);
  const [licensedSpecialEntertainmentSummary, setLicensedSpecialEntertainmentSummary] = useState<LicensedSpecialEntertainmentBusinessOperatorSummary | null>(null);
  const [recyclingOrganizationRecords, setRecyclingOrganizationRecords] = useState<RegisteredRecyclingBusinessOrganizationRecord[]>([]);
  const [recyclingOrganizationSummary, setRecyclingOrganizationSummary] = useState<RegisteredRecyclingBusinessOrganizationSummary | null>(null);
  const [registeredFactoryRecords, setRegisteredFactoryRecords] = useState<RegisteredFactoryRecord[]>([]);
  const [registeredFactorySummary, setRegisteredFactorySummary] = useState<RegisteredFactorySummary | null>(null);
  const [enterpriseHeadquartersRecords, setEnterpriseHeadquartersRecords] = useState<EnterpriseHeadquartersRecord[]>([]);
  const [enterpriseHeadquartersSummary, setEnterpriseHeadquartersSummary] = useState<EnterpriseHeadquartersSummary | null>(null);
  const [cemeteryRecords, setCemeteryRecords] = useState<CemeteryPublicFacilityRecord[]>([]);
  const [cemeterySummary, setCemeterySummary] = useState<CemeteryPublicFacilitySummary | null>(null);
  const [telepsychologyRecords, setTelepsychologyRecords] = useState<TelepsychologyCounselingInstitutionRecord[]>([]);
  const [telepsychologySummary, setTelepsychologySummary] = useState<TelepsychologyCounselingInstitutionSummary | null>(null);
  const [publicLiabilityRecords, setPublicLiabilityRecords] = useState<BusinessPremisesPublicLiabilityInsuranceRecord[]>([]);
  const [publicLiabilitySummary, setPublicLiabilitySummary] = useState<BusinessPremisesPublicLiabilityInsuranceSummary | null>(null);
  const [businessChangeRecords, setBusinessChangeRecords] = useState<BusinessRegistrationChangeRecord[]>([]);
  const [businessChangeSummary, setBusinessChangeSummary] = useState<BusinessRegistrationChangeSummary | null>(null);
  const [companyChangeRecords, setCompanyChangeRecords] = useState<CompanyRegistrationChangeRecord[]>([]);
  const [companyChangeSummary, setCompanyChangeSummary] = useState<CompanyRegistrationChangeSummary | null>(null);
  const [laborUnionRecords, setLaborUnionRecords] = useState<RegisteredLaborUnion[]>([]);
  const [laborUnionSummary, setLaborUnionSummary] = useState<RegisteredLaborUnionSummary | null>(null);
  const [infantCareRecords, setInfantCareRecords] = useState<QuasiPublicInfantCareCenter[]>([]);
  const [infantCareSummary, setInfantCareSummary] = useState<QuasiPublicInfantCareCenterSummary | null>(null);
  const [infantCareEvaluationInstitutions, setInfantCareEvaluationInstitutions] = useState<InfantCareCenterEvaluationInstitutionRecord[]>([]);
  const [infantCareEvaluationYearRecords, setInfantCareEvaluationYearRecords] = useState<InfantCareCenterEvaluationYearRecord[]>([]);
  const [infantCareEvaluationSummary, setInfantCareEvaluationSummary] = useState<InfantCareCenterEvaluationSummary | null>(null);
  const [elderlyWelfareRecords, setElderlyWelfareRecords] = useState<ElderlyWelfareInstitutionRecord[]>([]);
  const [elderlyWelfareSummary, setElderlyWelfareSummary] = useState<ElderlyWelfareInstitutionSummary | null>(null);
  const [seniorGroupMealServiceSiteRecords, setSeniorGroupMealServiceSiteRecords] = useState<SeniorGroupMealServiceSiteRecord[]>([]);
  const [seniorGroupMealServiceSiteSummary, setSeniorGroupMealServiceSiteSummary] = useState<SeniorGroupMealServiceSiteSummary | null>(null);
  const [publicPneumococcalVaccineProviderRecords, setPublicPneumococcalVaccineProviderRecords] = useState<PublicPneumococcalVaccineMedicalProviderRecord[]>([]);
  const [publicPneumococcalVaccineProviderSummary, setPublicPneumococcalVaccineProviderSummary] = useState<PublicPneumococcalVaccineMedicalProviderSummary | null>(null);
  const [majorElectricityUserRecords, setMajorElectricityUserRecords] = useState<MajorElectricityUserRecord[]>([]);
  const [majorElectricityUserSummary, setMajorElectricityUserSummary] = useState<MajorElectricityUserSummary | null>(null);
  const [earlyInterventionMedicalProviderRecords, setEarlyInterventionMedicalProviderRecords] = useState<EarlyInterventionMedicalProviderRecord[]>([]);
  const [earlyInterventionMedicalProviderSummary, setEarlyInterventionMedicalProviderSummary] = useState<EarlyInterventionMedicalProviderSummary | null>(null);
  const [generalDentalMedicalInstitutionRecords, setGeneralDentalMedicalInstitutionRecords] = useState<GeneralDentalMedicalInstitutionRecord[]>([]);
  const [generalDentalMedicalInstitutionSummary, setGeneralDentalMedicalInstitutionSummary] = useState<GeneralDentalMedicalInstitutionSummary | null>(null);
  const [diabetesSharedCareMedicalInstitutionRecords, setDiabetesSharedCareMedicalInstitutionRecords] = useState<any[]>([]);
  const [diabetesSharedCareMedicalInstitutionSummary, setDiabetesSharedCareMedicalInstitutionSummary] = useState<any>(null);
  const [postpartumRecords, setPostpartumRecords] = useState<any[]>([]); const [outCityFuneralRecords, setOutCityFuneralRecords] = useState<any[]>([]); const [hotelHygieneRecords, setHotelHygieneRecords] = useState<any[]>([]); const [kindergartenRecords, setKindergartenRecords] = useState<any[]>([]); const [domesticEmploymentServiceAgencyRecords, setDomesticEmploymentServiceAgencyRecords] = useState<any[]>([]); const [hospitalHemodialysisResourceRecords, setHospitalHemodialysisResourceRecords] = useState<any[]>([]); const [streetPerformerVenueRecords, setStreetPerformerVenueRecords] = useState<any[]>([]); const [schoolchildDentalPreventiveCareProviderRecords, setSchoolchildDentalPreventiveCareProviderRecords] = useState<any[]>([]); const [generalWesternMedicineInstitutionRecords,setGeneralWesternMedicineInstitutionRecords]=useState<any[]>([]); const [socialWelfareFoundationRecords,setSocialWelfareFoundationRecords]=useState<any[]>([]); const [rotavirusVaccineSubsidyProviderRecords,setRotavirusVaccineSubsidyProviderRecords]=useState<any[]>([]); const [petRegistrationStationRecords,setPetRegistrationStationRecords]=useState<any[]>([]); const [bottledGasRetailerRecords,setBottledGasRetailerRecords]=useState<any[]>([]);
  const [biotechCompanyRecords, setBiotechCompanyRecords] = useState<BiotechCompanyDirectoryRecord[]>([]);
  const [biotechCompanySummary, setBiotechCompanySummary] = useState<BiotechCompanyDirectorySummary | null>(null);
  const [travelAccommodationRecords, setTravelAccommodationRecords] = useState<TaipeiTravelAccommodationZhRecord[]>([]);
  const [travelAccommodationSummary, setTravelAccommodationSummary] = useState<TaipeiTravelAccommodationZhSummary | null>(null);
  const [grantRecords, setGrantRecords] = useState<IndustryGrantRecipient[]>([]);
  const [grantSummary, setGrantSummary] = useState<IndustryGrantSummary | null>(null);
  const [procurementRecords, setProcurementRecords] = useState<MetroProcurementScheduleRecord[]>([]);
  const [procurementSummary, setProcurementSummary] = useState<MetroProcurementScheduleSummary | null>(null);
  const [cramSchoolRecords, setCramSchoolRecords] = useState<RegisteredCramSchool[]>([]);
  const [cramSchoolSummary, setCramSchoolSummary] = useState<RegisteredCramSchoolSummary | null>(null);
  const [hotelRecords, setHotelRecords] = useState<RegisteredHotel[]>([]);
  const [hotelSummary, setHotelSummary] = useState<RegisteredHotelSummary | null>(null);
  const [laborViolationSummary, setLaborViolationSummary] = useState<LaborStandardActViolationSummary | null>(null);
  const [laborViolationManifest, setLaborViolationManifest] = useState<LaborStandardActViolationManifest | null>(null);
  const [oshViolationRecords, setOshViolationRecords] = useState<OccupationalSafetyHealthViolationRecord[]>([]);
  const [oshViolationSummary, setOshViolationSummary] = useState<OccupationalSafetyHealthViolationSummary | null>(null);
  const [genderEqualityViolationRecords, setGenderEqualityViolationRecords] = useState<GenderEqualityWorkActViolationRecord[]>([]);
  const [genderEqualityViolationSummary, setGenderEqualityViolationSummary] = useState<GenderEqualityWorkActViolationSummary | null>(null);
  const [consumerDisputeRecords, setConsumerDisputeRecords] = useState<ConsumerDisputeAbsentBusinessOperatorRecord[]>([]);
  const [consumerDisputeSummary, setConsumerDisputeSummary] = useState<ConsumerDisputeAbsentBusinessOperatorSummary | null>(null);
  const [nangangCompanyRecords, setNangangCompanyRecords] = useState<NangangSoftwareParkCompany[]>([]);
  const [nangangCompanySummary, setNangangCompanySummary] = useState<NangangSoftwareParkCompanySummary | null>(null);
  const [dawannanCompanyRecords, setDawannanCompanyRecords] = useState<DawannanIndustrialAreaCompanyRecord[]>([]);
  const [dawannanCompanySummary, setDawannanCompanySummary] = useState<DawannanIndustrialAreaCompanySummary | null>(null);
  const [animalHospitalRecords, setAnimalHospitalRecords] = useState<RegisteredAnimalHospital[]>([]);
  const [animalHospitalSummary, setAnimalHospitalSummary] = useState<RegisteredAnimalHospitalSummary | null>(null);
  const [animalMedicineSellerRecords, setAnimalMedicineSellerRecords] = useState<LicensedAnimalMedicineSellerRecord[]>([]);
  const [animalMedicineSellerSummary, setAnimalMedicineSellerSummary] = useState<LicensedAnimalMedicineSellerSummary | null>(null);
  const [petBusinessEvaluationRecords, setPetBusinessEvaluationRecords] = useState<SpecificPetBusinessEvaluationRecord[]>([]);
  const [petBusinessEvaluationSummary, setPetBusinessEvaluationSummary] = useState<SpecificPetBusinessEvaluationSummary | null>(null);
  const [veterinarianRecords, setVeterinarianRecords] = useState<VeterinarianProfessionalRegistryRecord[]>([]);
  const [veterinarianSummary, setVeterinarianSummary] = useState<VeterinarianProfessionalRegistrySummary | null>(null);
  const [report, setReport] = useState<{
    convertedAt?: string; performingArtsGroups?: { convertedAt?: string }; contractedVaccinationMedicalProviders?: { convertedAt?: string }; publiclyFundedHpvVaccinationProviders?: { convertedAt?: string }; childMedicalSubsidyContractedProviders?: { convertedAt?: string }; dentureSubsidyMedicalProviders?: { convertedAt?: string }; disabilityEmploymentResourceMap?: { convertedAt?: string }; shelteredWorkshopDirectory?: { convertedAt?: string }; employmentAgencyIntermediaryCompanies?: { convertedAt?: string }; licensedPawnshopDirectory?: { convertedAt?: string }; licensedElectronicGameArcadeOperators?: { convertedAt?: string }; licensedSpecialEntertainmentBusinessOperators?: { convertedAt?: string }; registeredRecyclingBusinessOrganizations?: { convertedAt?: string }; registeredFactoryDistribution?: { convertedAt?: string }; enterpriseHeadquartersDistribution?: { convertedAt?: string }; cemeteryPublicFacilities?: { convertedAt?: string }; telepsychologyCounselingInstitutions?: { convertedAt?: string }; businessPremisesPublicLiabilityInsuranceRecords?: { convertedAt?: string }; businessRegistrationChangeRecords?: { convertedAt?: string }; companyRegistrationChangeRecords?: { convertedAt?: string }; registeredLaborUnions?: { convertedAt?: string }; quasiPublicInfantCareCenters?: { convertedAt?: string }; infantCareCenterEvaluationResults?: { convertedAt?: string }; elderlyWelfareInstitutions?: { convertedAt?: string }; biotechCompanyDirectory?: { convertedAt?: string }; taipeiTravelAccommodationsZh?: { convertedAt?: string }; industryGrantRecipients?: { convertedAt?: string }; metroProcurementSchedules?: { convertedAt?: string }; registeredCramSchools?: { convertedAt?: string }; registeredHotels?: { convertedAt?: string }; laborStandardActViolationRecords?: { convertedAt?: string }; occupationalSafetyHealthViolationRecords?: { convertedAt?: string }; genderEqualityWorkActViolationRecords?: { convertedAt?: string }; consumerDisputeAbsentBusinessOperators?: { convertedAt?: string }; nangangSoftwareParkCompanies?: { convertedAt?: string }; dawannanIndustrialAreaCompanyDirectory?: { convertedAt?: string }; registeredAnimalHospitals?: { convertedAt?: string }; licensedAnimalMedicineSellers?: { convertedAt?: string }; specificPetBusinessEvaluationResults?: { convertedAt?: string }; veterinarianProfessionalRegistry?: { convertedAt?: string };
  }>({});
  const [filters, setFilters] = useState(emptyFilters);
  const [loadError, setLoadError] = useState(false);
  const t = language === 'zh' ? { ...copy.zh, ...zhUiCopy } : copy.en;

  useEffect(() => {
    const loadJson = async (path: string) => {
      const response = await fetch(`${import.meta.env.BASE_URL}${path}`);
      if (!response.ok) throw new Error(`${path}: ${response.status}`);
      return response.json();
    };
    Promise.all([
      loadJson('data/civic-groups.json'),
      loadJson('data/civic-group-summary.json'),
      loadJson('data/performing-arts-groups.json'),
      loadJson('data/performing-arts-group-summary.json'),
      loadJson('data/contracted-vaccination-medical-providers.json'),
      loadJson('data/contracted-vaccination-medical-provider-summary.json'),
      loadJson('data/publicly-funded-hpv-vaccination-providers.json'),
      loadJson('data/publicly-funded-hpv-vaccination-provider-summary.json'),
      loadJson('data/child-medical-subsidy-contracted-providers.json'),
      loadJson('data/child-medical-subsidy-contracted-provider-summary.json'),
      loadJson('data/denture-subsidy-medical-providers.json'),
      loadJson('data/denture-subsidy-medical-provider-summary.json'),
      loadJson('data/disability-employment-resource-map.json'),
      loadJson('data/disability-employment-resource-map-summary.json'),
      loadJson('data/sheltered-workshop-directory.json'),
      loadJson('data/sheltered-workshop-directory-summary.json'),
      loadJson('data/employment-agency-intermediary-companies/records.json'),
      loadJson('data/employment-agency-intermediary-companies/summary.json'),
      loadJson('data/licensed-pawnshop-directory.json'),
      loadJson('data/licensed-pawnshop-directory-summary.json'),
      loadJson('data/licensed-electronic-game-arcade-operators.json'),
      loadJson('data/licensed-electronic-game-arcade-operator-summary.json'),
      loadJson('data/licensed-special-entertainment-business-operators.json'),
      loadJson('data/licensed-special-entertainment-business-operator-summary.json'),
      loadJson('data/registered-recycling-business-organizations.json'),
      loadJson('data/registered-recycling-business-organization-summary.json'),
      loadJson('data/registered-factory-distribution.json'),
      loadJson('data/registered-factory-summary.json'),
      loadJson('data/enterprise-headquarters-distribution/records.json'),
      loadJson('data/enterprise-headquarters-distribution/summary.json'),
      loadJson('data/cemetery-public-facilities.json'),
      loadJson('data/cemetery-public-facility-summary.json'),
      loadJson('data/telepsychology-counseling-institutions.json'),
      loadJson('data/telepsychology-counseling-institution-summary.json'),
      loadJson('data/business-premises-public-liability-insurance-records.json'),
      loadJson('data/business-premises-public-liability-insurance-summary.json'),
      loadJson('data/business-registration-change-records.json'),
      loadJson('data/business-registration-change-summary.json'),
      loadJson('data/company-registration-change-records.json'),
      loadJson('data/company-registration-change-summary.json'),
      loadJson('data/registered-labor-unions.json'),
      loadJson('data/registered-labor-union-summary.json'),
      loadJson('data/quasi-public-infant-care-centers.json'),
      loadJson('data/quasi-public-infant-care-center-summary.json'),
      loadJson('data/infant-care-center-evaluation-institutions.json'),
      loadJson('data/infant-care-center-evaluation-year-records.json'),
      loadJson('data/infant-care-center-evaluation-summary.json'),
      loadJson('data/elderly-welfare-institutions.json'),
      loadJson('data/elderly-welfare-institution-summary.json'),
      loadJson('data/biotech-company-directory.json'),
      loadJson('data/biotech-company-directory-summary.json'),
      loadJson('data/taipei-travel-accommodations-zh.json'),
      loadJson('data/taipei-travel-accommodation-zh-summary.json'),
      loadJson('data/industry-grant-recipients.json'),
      loadJson('data/industry-grant-summary.json'),
      loadJson('data/metro-procurement-schedules.json'),
      loadJson('data/metro-procurement-summary.json'),
      loadJson('data/registered-cram-schools.json'),
      loadJson('data/registered-cram-school-summary.json'),
      loadJson('data/registered-hotels.json'),
      loadJson('data/registered-hotel-summary.json'),
      loadJson('data/labor-standard-act-violation-summary.json'),
      loadJson('data/labor-standard-act-violation-records/manifest.json'),
      loadJson('data/occupational-safety-health-violation-records.json'),
      loadJson('data/occupational-safety-health-violation-summary.json'),
      loadJson('data/gender-equality-work-act-violation-records.json'),
      loadJson('data/gender-equality-work-act-violation-summary.json'),
      loadJson('data/consumer-dispute-absent-business-operators.json'),
      loadJson('data/consumer-dispute-absent-business-operator-summary.json'),
      loadJson('data/nangang-software-park-companies.json'),
      loadJson('data/nangang-software-park-company-summary.json'),
      loadJson('data/dawannan-industrial-area-company-directory.json'),
      loadJson('data/dawannan-industrial-area-company-summary.json'),
      loadJson('data/registered-animal-hospitals.json'),
      loadJson('data/registered-animal-hospital-summary.json'),
      loadJson('data/licensed-animal-medicine-sellers.json'),
      loadJson('data/licensed-animal-medicine-seller-summary.json'),
      loadJson('data/specific-pet-business-evaluation-results/records.json'),
      loadJson('data/specific-pet-business-evaluation-results/summary.json'),
      loadJson('data/veterinarian-professional-registry.json'),
      loadJson('data/veterinarian-professional-registry-summary.json'),
      loadJson('data/conversion-report.json'),
    ]).then(([groupData, summaryData, performingArtsData, performingArtsSummaryData, vaccinationProviderData, vaccinationProviderSummaryData, hpvProviderData, hpvProviderSummaryData, childMedicalSubsidyProviderData, childMedicalSubsidyProviderSummaryData, dentureSubsidyProviderData, dentureSubsidyProviderSummaryData, disabilityEmploymentResourceData, disabilityEmploymentResourceSummaryData, shelteredWorkshopData, shelteredWorkshopSummaryData, employmentAgencyData, employmentAgencySummaryData, licensedPawnshopData, licensedPawnshopSummaryData, licensedArcadeData, licensedArcadeSummaryData, licensedSpecialEntertainmentData, licensedSpecialEntertainmentSummaryData, recyclingOrganizationData, recyclingOrganizationSummaryData, registeredFactoryData, registeredFactorySummaryData, enterpriseHeadquartersData, enterpriseHeadquartersSummaryData, cemeteryData, cemeterySummaryData, telepsychologyData, telepsychologySummaryData, publicLiabilityData, publicLiabilitySummaryData, businessChangeData, businessChangeSummaryData, companyChangeData, companyChangeSummaryData, laborUnionData, laborUnionSummaryData, infantCareData, infantCareSummaryData, infantCareEvaluationData, infantCareEvaluationYearData, infantCareEvaluationSummaryData, elderlyWelfareData, elderlyWelfareSummaryData, biotechData, biotechSummaryData, travelData, travelSummaryData, grantData, grantSummaryData, procurementData, procurementSummaryData, cramSchoolData, cramSchoolSummaryData, hotelData, hotelSummaryData, laborSummaryData, laborManifestData, oshData, oshSummaryData, genderEqualityData, genderEqualitySummaryData, consumerDisputeData, consumerDisputeSummaryData, nangangData, nangangSummaryData, dawannanData, dawannanSummaryData, animalData, animalSummaryData, animalMedicineData, animalMedicineSummaryData, petBusinessEvaluationData, petBusinessEvaluationSummaryData, veterinarianData, veterinarianSummaryData, reportData]) => {
      setGroups(groupData); setSummary(summaryData); setGrantRecords(grantData); setGrantSummary(grantSummaryData);
      setPerformingArtsRecords(performingArtsData); setPerformingArtsSummary(performingArtsSummaryData);
      setVaccinationProviderRecords(vaccinationProviderData); setVaccinationProviderSummary(vaccinationProviderSummaryData);
      setHpvProviderRecords(hpvProviderData); setHpvProviderSummary(hpvProviderSummaryData);
      setChildMedicalSubsidyProviderRecords(childMedicalSubsidyProviderData); setChildMedicalSubsidyProviderSummary(childMedicalSubsidyProviderSummaryData);
      setDentureSubsidyProviderRecords(dentureSubsidyProviderData); setDentureSubsidyProviderSummary(dentureSubsidyProviderSummaryData);
      setDisabilityEmploymentResourceRecords(disabilityEmploymentResourceData); setDisabilityEmploymentResourceSummary(disabilityEmploymentResourceSummaryData);
      setShelteredWorkshopRecords(shelteredWorkshopData); setShelteredWorkshopSummary(shelteredWorkshopSummaryData);
      setEmploymentAgencyRecords(employmentAgencyData); setEmploymentAgencySummary(employmentAgencySummaryData);
      setLicensedPawnshopRecords(licensedPawnshopData); setLicensedPawnshopSummary(licensedPawnshopSummaryData);
      setLicensedArcadeRecords(licensedArcadeData); setLicensedArcadeSummary(licensedArcadeSummaryData);
      setLicensedSpecialEntertainmentRecords(licensedSpecialEntertainmentData); setLicensedSpecialEntertainmentSummary(licensedSpecialEntertainmentSummaryData);
      setRecyclingOrganizationRecords(recyclingOrganizationData); setRecyclingOrganizationSummary(recyclingOrganizationSummaryData);
      setRegisteredFactoryRecords(registeredFactoryData); setRegisteredFactorySummary(registeredFactorySummaryData);
      setEnterpriseHeadquartersRecords(enterpriseHeadquartersData); setEnterpriseHeadquartersSummary(enterpriseHeadquartersSummaryData);
      setCemeteryRecords(cemeteryData); setCemeterySummary(cemeterySummaryData);
      setTelepsychologyRecords(telepsychologyData); setTelepsychologySummary(telepsychologySummaryData);
      setPublicLiabilityRecords(publicLiabilityData); setPublicLiabilitySummary(publicLiabilitySummaryData);
      setBusinessChangeRecords(businessChangeData); setBusinessChangeSummary(businessChangeSummaryData);
      setCompanyChangeRecords(companyChangeData); setCompanyChangeSummary(companyChangeSummaryData);
      setLaborUnionRecords(laborUnionData); setLaborUnionSummary(laborUnionSummaryData);
      setInfantCareRecords(infantCareData); setInfantCareSummary(infantCareSummaryData);
      setInfantCareEvaluationInstitutions(infantCareEvaluationData); setInfantCareEvaluationYearRecords(infantCareEvaluationYearData); setInfantCareEvaluationSummary(infantCareEvaluationSummaryData);
      setElderlyWelfareRecords(elderlyWelfareData); setElderlyWelfareSummary(elderlyWelfareSummaryData);
      setBiotechCompanyRecords(biotechData); setBiotechCompanySummary(biotechSummaryData);
      setTravelAccommodationRecords(travelData); setTravelAccommodationSummary(travelSummaryData);
      setProcurementRecords(procurementData); setProcurementSummary(procurementSummaryData);
      setCramSchoolRecords(cramSchoolData); setCramSchoolSummary(cramSchoolSummaryData);
      setHotelRecords(hotelData); setHotelSummary(hotelSummaryData);
      setLaborViolationSummary(laborSummaryData); setLaborViolationManifest(laborManifestData); setReport(reportData);
      setOshViolationRecords(oshData); setOshViolationSummary(oshSummaryData);
      setGenderEqualityViolationRecords(genderEqualityData); setGenderEqualityViolationSummary(genderEqualitySummaryData);
      setConsumerDisputeRecords(consumerDisputeData); setConsumerDisputeSummary(consumerDisputeSummaryData);
      setNangangCompanyRecords(nangangData); setNangangCompanySummary(nangangSummaryData);
      setDawannanCompanyRecords(dawannanData); setDawannanCompanySummary(dawannanSummaryData);
      setAnimalHospitalRecords(animalData); setAnimalHospitalSummary(animalSummaryData);
      setAnimalMedicineSellerRecords(animalMedicineData); setAnimalMedicineSellerSummary(animalMedicineSummaryData);
      setPetBusinessEvaluationRecords(petBusinessEvaluationData); setPetBusinessEvaluationSummary(petBusinessEvaluationSummaryData);
      setVeterinarianRecords(veterinarianData); setVeterinarianSummary(veterinarianSummaryData);
    }).catch(() => setLoadError(true));
  }, []);

  useEffect(() => {
    const loadJson = async (path: string) => {
      const response = await fetch(`${import.meta.env.BASE_URL}${path}`);
      if (!response.ok) throw new Error(`${path}: ${response.status}`);
      return response.json();
    };
    Promise.all([loadJson('data/senior-group-meal-service-sites/records.json'), loadJson('data/senior-group-meal-service-sites/summary.json')])
      .then(([records, siteSummary]) => { setSeniorGroupMealServiceSiteRecords(records); setSeniorGroupMealServiceSiteSummary(siteSummary); })
      .catch(() => setLoadError(true));
  }, []);

  useEffect(() => { const loadJson = async (path: string) => { const response = await fetch(`${import.meta.env.BASE_URL}${path}`); if (!response.ok) throw new Error(`${path}: ${response.status}`); return response.json(); }; Promise.all([loadJson('data/public-pneumococcal-vaccine-providers/records.json'), loadJson('data/public-pneumococcal-vaccine-providers/summary.json')]).then(([records, providerSummary]) => { setPublicPneumococcalVaccineProviderRecords(records); setPublicPneumococcalVaccineProviderSummary(providerSummary); }).catch(() => setLoadError(true)); }, []);
  useEffect(() => { const loadJson = async (path: string) => { const response = await fetch(`${import.meta.env.BASE_URL}${path}`); if (!response.ok) throw new Error(`${path}: ${response.status}`); return response.json(); }; Promise.all([loadJson('data/major-electricity-users/records.json'), loadJson('data/major-electricity-users/summary.json')]).then(([records, electricitySummary]) => { setMajorElectricityUserRecords(records); setMajorElectricityUserSummary(electricitySummary); }).catch(() => setLoadError(true)); }, []);
  useEffect(() => { const loadJson = async (path: string) => { const response = await fetch(`${import.meta.env.BASE_URL}${path}`); if (!response.ok) throw new Error(`${path}: ${response.status}`); return response.json(); }; Promise.all([loadJson('data/early-intervention-medical-providers/records.json'), loadJson('data/early-intervention-medical-providers/summary.json')]).then(([records, providerSummary]) => { setEarlyInterventionMedicalProviderRecords(records); setEarlyInterventionMedicalProviderSummary(providerSummary); }).catch(() => setLoadError(true)); }, []);
  useEffect(() => { const loadJson = async (path: string) => { const response = await fetch(`${import.meta.env.BASE_URL}${path}`); if (!response.ok) throw new Error(`${path}: ${response.status}`); return response.json(); }; Promise.all([loadJson('data/general-dental-medical-institutions/records.json'), loadJson('data/general-dental-medical-institutions/summary.json')]).then(([records, providerSummary]) => { setGeneralDentalMedicalInstitutionRecords(records); setGeneralDentalMedicalInstitutionSummary(providerSummary); }).catch(() => setLoadError(true)); }, []);
  useEffect(() => { const loadJson = async (path: string) => { const response = await fetch(`${import.meta.env.BASE_URL}${path}`); if (!response.ok) throw new Error(`${path}: ${response.status}`); return response.json(); }; Promise.all([loadJson('data/diabetes-shared-care-medical-institutions/records.json'), loadJson('data/diabetes-shared-care-medical-institutions/summary.json')]).then(([records, providerSummary]) => { setDiabetesSharedCareMedicalInstitutionRecords(records); setDiabetesSharedCareMedicalInstitutionSummary(providerSummary); }).catch(() => setLoadError(true)); }, []);
  useEffect(() => { const j=(p:string)=>fetch(`${import.meta.env.BASE_URL}${p}`).then(r=>{if(!r.ok)throw Error(p);return r.json()}); Promise.all([j('data/registered-postpartum-care-institutions/records.json'),j('data/out-of-city-funeral-service-businesses/records.json'),j('data/hotel-hygiene-certification-directory/records.json'),j('data/kindergarten-basic-evaluation-pass-records/records.json'),j('data/domestic-employment-service-agencies/records.json'),j('data/hospital-hemodialysis-resources/records.json'),j('data/street-performer-venues/records.json'),j('data/schoolchild-dental-preventive-care-providers/records.json'),j('data/general-western-medicine-institutions/records.json'),j('data/social-welfare-foundations/records.json'),j('data/rotavirus-vaccine-subsidy-providers/records.json'),j('data/pet-registration-stations/records.json'),j('data/bottled-gas-retailers/records.json')]).then(([a,b,c,d,e,f,g,h,i,k,l,m,n])=>{setPostpartumRecords(a);setOutCityFuneralRecords(b);setHotelHygieneRecords(c);setKindergartenRecords(d);setDomesticEmploymentServiceAgencyRecords(e);setHospitalHemodialysisResourceRecords(f);setStreetPerformerVenueRecords(g);setSchoolchildDentalPreventiveCareProviderRecords(h);setGeneralWesternMedicineInstitutionRecords(i);setSocialWelfareFoundationRecords(k);setRotavirusVaccineSubsidyProviderRecords(l);setPetRegistrationStationRecords(m);setBottledGasRetailerRecords(n)}).catch(()=>setLoadError(true)); }, []);

  useEffect(() => {
    document.documentElement.lang = language === 'zh' ? 'zh-Hant' : 'en';
    document.title = t.title;
  }, [language, t.title]);

  const filtered = useMemo(() => filterCivicGroups(groups, filters, language), [groups, filters, language]);
  const hasFilters = Object.values(filters).some(Boolean);
  const activeSummary = useMemo(
    () => summary && hasFilters ? buildCivicGroupSummary(filtered) : summary,
    [filtered, hasFilters, summary],
  );
  const decades = useMemo(() => [...new Set(groups.flatMap((group) => group.foundedDecade ?? []))].sort(), [groups]);
  const openDistrict = (district: string) => { setFilters({ ...emptyFilters, district }); setCivicView('directory'); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const tabs: Array<[string, string]> = [
    ['civic', t.civicGroups], ['performingArts', t.performingArtsGroups], ['vaccinationProviders', t.vaccinationProviders], ['hpvProviders', t.hpvProviders], ['childMedicalSubsidyProviders', t.childMedicalSubsidyProviders], ['dentureSubsidyProviders', t.dentureSubsidyProviders], ['disabilityEmploymentResources', t.disabilityEmploymentResources], ['shelteredWorkshops', t.shelteredWorkshops], ['employmentAgencies', t.employmentAgencies], ['licensedPawnshops', t.licensedPawnshops], ['licensedArcades', t.licensedArcades], ['licensedSpecialEntertainment', t.licensedSpecialEntertainment], ['recyclingOrganizations', t.recyclingOrganizations], ['registeredFactories', t.registeredFactories], ['enterpriseHeadquarters', t.enterpriseHeadquarters], ['cemeteryPublicFacilities', t.cemeteryPublicFacilities], ['telepsychology', t.telepsychology], ['publicLiabilityInsurance', t.publicLiabilityInsurance], ['businessChanges', t.businessChanges], ['companyChanges', t.companyChanges], ['laborUnions', t.laborUnions], ['infantCare', t.infantCareCenters], ['infantCareEvaluations', t.infantCareEvaluations], ['elderlyWelfare', t.elderlyWelfare], ['biotechCompanies', t.biotechCompanies], ['travelAccommodations', t.travelAccommodations], ['grants', t.industryGrants], ['procurement', t.metroProcurement],
    ['cramSchools', t.registeredCramSchools], ['hotels', t.registeredHotels], ['laborViolations', t.laborViolations], ['oshViolations', t.oshViolations], ['genderEqualityViolations', t.genderEqualityViolations], ['consumerDisputeAbsence', t.consumerDisputeAbsence], ['nangangCompanies', t.nangangCompanies], ['dawannanCompanies', t.dawannanCompanies],
    ['animalHospitals', t.animalHospitals], ['animalMedicineSellers', t.animalMedicineSellers], ['petBusinessEvaluations', t.petBusinessEvaluations], ['veterinarians', t.veterinarians],
    ['comparison', t.comparison], ['overview', t.overview], ['notes', t.notes],
  ];
  tabs.splice(1, 0, ['seniorGroupMealServiceSites', language === 'zh' ? '老人共餐單位' : 'Senior Group Meal Service Sites']);
  tabs.splice(2, 0, ['childYouthFriendlyWelfareServiceSites', language === 'zh' ? '兒少友善福利服務據點' : 'Child and Youth Friendly Welfare Service Sites']);
  tabs.splice(2, 0, ['publicPneumococcalVaccineProviders', language === 'zh' ? '公費肺炎鏈球菌疫苗院所' : 'Pneumococcal Vaccine Providers']);
  tabs.splice(3, 0, ['disabilityInstitutionCapacityAndVacancies', language === 'zh' ? '身心障礙機構服務容量資料' : 'Disability Institution Service Capacity Records']);
  tabs.splice(4, 0, ['ophthalmologyInstitutions', language === 'zh' ? '臺北市眼科醫療機構' : 'Taipei Ophthalmology Institutions']);
  tabs.splice(5, 0, ['taipeiCulturalHeritageAssets', language === 'zh' ? '臺北市文化資產' : 'Taipei Cultural Heritage Assets']);
  tabs.splice(6, 0, ['privateCulturalHeritageSubsidies', language === 'zh' ? '私有文化資產補助案' : 'Private Cultural Heritage Subsidies']);
  tabs.splice(7, 0, ['travelMedicineClinics', language === 'zh' ? '旅遊醫學門診醫院名冊' : 'Travel Medicine Clinics']);
  tabs.splice(8, 0, ['hakkaOrganizations', language === 'zh' ? '臺北市客家社團' : 'Taipei Hakka Organizations']);
  tabs.splice(9, 0, ['hospitalDischargeLongTermCarePartners', language === 'zh' ? '出院準備銜接長照服務合作醫院' : 'Hospital Discharge-to-Long-Term Care Partners']);
  tabs.splice(10, 0, ['hospicePalliativeCareInstitutions', language === 'zh' ? '安寧緩和醫療機構' : 'Hospice and Palliative Care Institutions']);
  tabs.splice(7, 0, ['privateSeniorResidentialLongTermCareInstitutions', language === 'zh' ? '私立老人安養暨長期照顧機構' : 'Private Senior Care Institutions']);
  tabs.splice(8, 0, ['hemodialysisMedicalInstitutions', language === 'zh' ? '臺北市血液透析醫療機構' : 'Taipei Hemodialysis Medical Institutions']);
  tabs.splice(9, 0, ['internalMedicineInstitutions', language === 'zh' ? '臺北市內科醫療機構' : 'Taipei Internal Medicine Institutions']);
  tabs.splice(10, 0, ['occupationalTherapyClinics', language === 'zh' ? '臺北市職能治療所' : 'Taipei Occupational Therapy Clinics']);
  tabs.splice(11, 0, ['physicalTherapyClinics', language === 'zh' ? '臺北市物理治療所' : 'Taipei Physical Therapy Clinics']);
  tabs.splice(12, 0, ['designatedForeignerHealthExamHospitals', language === 'zh' ? '外國人健檢指定醫院' : 'Designated Foreigner Health Examination Hospitals']);
  tabs.splice(4, 0, ['majorElectricityUsers', language === 'zh' ? '用電大戶資料' : 'Major Electricity Users']);
  tabs.splice(4, 0, ['earlyInterventionMedicalProviders', language === 'zh' ? '早期療育醫療院所' : 'Early Intervention Providers']);
  tabs.splice(5, 0, ['generalDentalMedicalInstitutions', language === 'zh' ? '牙醫一般科醫療機構' : 'General Dental Institutions']);
  tabs.splice(6, 0, ['pediatricMedicalInstitutions', language === 'zh' ? '臺北市兒科醫療機構' : 'Taipei Pediatric Medical Institutions']);
  tabs.splice(6, 0, ['diabetesSharedCareMedicalInstitutions', language === 'zh' ? '糖尿病共照網醫事機構' : 'Diabetes Shared Care Institutions']);
  tabs.splice(7,0,['waterPipeInstallationContractors',language==='zh'?'自來水管承裝商業者':'Water Pipe Installation Contractors'],['seniorCareInstitutionEvaluations',language==='zh'?'老人安養暨長期照顧機構評鑑':'Senior Care Institution Evaluations'],['fertilitySubsidyContractedHospitals',language==='zh'?'生育補助合約醫院':'Fertility Subsidy Contracted Hospitals'],['fiveCancerScreeningProviders',language==='zh'?'五癌篩檢醫療院所':'Five-Cancer Screening Providers'],['rabiesVaccinationVeterinaryClinics',language==='zh'?'狂犬病疫苗獸醫診療機構':'Rabies Vaccination Veterinary Clinics'],['seniorServiceSiteCourses',language==='zh'?'銀髮族據點課程':'Senior Service Site Courses'],['taipeiGovernmentApplicationServices',language==='zh'?'台北服務通申辦服務':'Taipei Government Application Services'],['psychiatricRehabilitationAndNursingInstitutions',language==='zh'?'精神復健暨精神護理機構':'Psychiatric Rehabilitation and Nursing Institutions'],['culturalArtsFoundations',language==='zh'?'文化藝術財團法人':'Culture and Arts Foundations'],['visuallyImpairedMassageEstablishments',language==='zh'?'視障按摩院所名冊':'Visually Impaired Massage Establishments'],['approvedGasWaterHeaterInstallers',language==='zh'?'核准燃氣熱水器承裝業及技術士':'Approved Gas Water Heater Installers'],['petRegistrationStations',language==='zh'?'寵物登記站名冊':'Pet Registration Stations'],['bottledGasRetailers',language==='zh'?'桶裝瓦斯零售商':'Bottled Gas Retailers'],['rotavirusVaccineSubsidyProviders',language==='zh'?'輪狀病毒疫苗補助合約醫療院所':'Rotavirus Vaccine Subsidy Providers'],['socialWelfareFoundations',language==='zh'?'社會福利基金會':'Social Welfare Foundations'],['generalWesternMedicineInstitutions',language==='zh'?'西醫一般科醫療機構':'General Western Medicine Institutions'],['schoolchildDentalPreventiveCareProviders',language==='zh'?'學童牙齒預防保健醫療院所':'Schoolchild Dental Preventive Care Providers'],['streetPerformerVenues',language==='zh'?'街頭藝人展演場地':'Street Performer Venues'],['hospitalHemodialysisResources',language==='zh'?'公私立醫院血液透析資源':'Hospital Hemodialysis Resources'],['domesticEmploymentServiceAgencies',language==='zh'?'仲介本國人國內工作私立就業服務機構':'Domestic Employment Service Agencies'],['postpartumCareInstitutions',language==='zh'?'產後護理機構':'Postpartum Care Institutions'],['outCityFuneralBusinesses',language==='zh'?'外縣市殯葬業者':'Out-of-City Funeral Businesses'],['hotelHygieneDirectory',language==='zh'?'旅館衛生認證':'Hotel Hygiene Certification'],['kindergartenEvaluationPass',language==='zh'?'幼兒園評鑑通過名單':'Kindergarten Evaluation Pass Records']);
  tabs.splice(8, 0, ['pestControlBusinesses', language === 'zh' ? '病媒防治業者名錄' : 'Pest Control Business Directory']);
  tabs.splice(9, 0, ['adultInfluenzaVaccineProviders', language === 'zh' ? '流感疫苗合約醫療院所（成人）' : 'Adult Influenza Vaccine Providers']);
  tabs.splice(10, 0, ['licensedWasteCookingOilCollectors', language === 'zh' ? '廢食用油回收清除機構' : 'Licensed Waste Cooking Oil Collectors']);
  tabs.splice(11, 0, ['homeNursingInstitutions', language === 'zh' ? '臺北市居家護理所' : 'Taipei Home Nursing Institutions']);
  tabs.splice(12, 0, ['optometryInstitutions', language === 'zh' ? '臺北市驗光所' : 'Taipei Optometry Institutions']);
  tabs.splice(13, 0, ['generalChineseMedicineInstitutions', language === 'zh' ? '中醫一般科醫療機構' : 'General Chinese Medicine Institutions']);
  tabs.splice(14, 0, ['alternativeServiceReserveStatistics', language === 'zh' ? '替代役備役列管人數分析統計' : 'Alternative Service Reserve Statistics']);
  tabs.splice(15, 0, ['medicalLaboratories', language === 'zh' ? '臺北市醫事檢驗所' : 'Taipei Medical Laboratories']);
  tabs.splice(16, 0, ['communityCareServiceSites', language === 'zh' ? '社區照顧關懷據點' : 'Community Care Service Sites']);
  tabs.splice(17, 0, ['seniorCareCapacityAndOccupancy', language === 'zh' ? '老人照顧容量與實際進住統計' : 'Senior Care Capacity and Occupancy']);
  tabs.splice(18, 0, ['domesticEmploymentAgencyEvaluations', language === 'zh' ? '私立就業服務機構評鑑成績' : 'Domestic Employment Agency Evaluation Results']);
  tabs.splice(19, 0, ['lodgingBusinessPenaltyRecords', language === 'zh' ? '旅宿業裁罰紀錄表' : 'Lodging Business Penalty Records']);
  tabs.splice(20, 0, ['communityPublicChildcareHomes', language === 'zh' ? '社區公共托育家園' : 'Community Public Childcare Homes']);
  tabs.splice(21, 0, ['tbContactScreeningPartnerProviders', language === 'zh' ? '結核病接觸者篩檢合作醫療院所' : 'TB Contact Screening Partner Providers']);
  tabs.splice(22, 0, ['beautyHairdressingHygieneCertifications', language === 'zh' ? '美容美髮業衛生優良認證' : 'Beauty and Hairdressing Hygiene Certifications']);
  tabs.splice(23, 0, ['publicInfluenzaAntiviralProviders', language === 'zh' ? '公費流感抗病毒藥劑合約院所' : 'Public Influenza Antiviral Medicine Providers']);
  tabs.splice(24, 0, ['influenzaVaccineProvidersChildren3Plus', language === 'zh' ? '3歲以上幼童流感疫苗特約院所' : 'Influenza Vaccine Providers for Children Age 3+']);
  tabs.splice(24, 0, ['communityIntegratedCareLevelCUnits', language === 'zh' ? '社區整體照顧服務體系 C 級單位' : 'Community Integrated Care Level C Units']);
  tabs.splice(25, 0, ['registeredAfterSchoolCareCentres', language === 'zh' ? '立案課照中心' : 'Registered After-School Care Centres']);
  tabs.splice(26, 0, ['subsidizedSeniorResidentialPlacementInstitutions', language === 'zh' ? '老人收容安置補助機構' : 'Subsidized Senior Residential Placement Institutions']);
  tabs.splice(27, 0, ['familyMedicineInstitutions', language === 'zh' ? '家庭醫學科醫療機構' : 'Family Medicine Institutions']);
  tabs.splice(28, 0, ['cosmeticMedicineSupervision2024', language === 'zh' ? '美容醫學業務醫療機構 113 年督考統計' : 'Cosmetic Medicine Institution Supervision Statistics']);
  tabs.splice(29, 0, ['plasticSurgeryMedicalInstitutions', language === 'zh' ? '整形外科醫療機構' : 'Plastic Surgery Medical Institutions']);
  tabs.splice(30, 0, ['indigenousCommunityOrganizations', language === 'zh' ? '臺北市原住民團體名單' : 'Taipei Indigenous Community Organizations']);
  tabs.splice(31, 0, ['licensedNaturalGasPipelineContractors', language === 'zh' ? '天然氣導管承裝商' : 'Licensed Natural Gas Pipeline Contractors']);
  tabs.splice(32, 0, ['communityDevelopmentAssociations', language === 'zh' ? '社區發展協會' : 'Community Development Associations']);
  tabs.splice(33, 0, ['obstetricsGynecologyInstitutions', language === 'zh' ? '婦產科醫療機構' : 'Obstetrics and Gynecology Institutions']);
  tabs.splice(34, 0, ['artsCulturalVenues', language === 'zh' ? '臺北市藝文館所' : 'Taipei Arts and Cultural Venues']);
  tabs.splice(35, 0, ['psychiatricClinics', language === 'zh' ? '臺北市精神科診所' : 'Taipei Psychiatric Clinics']);
  tabs.splice(36, 0, ['licensedAssistedReproductionInstitutions', language === 'zh' ? '特約人工生殖機構名單' : 'Licensed Assisted Reproduction Institutions']);
  tabs.splice(37, 0, ['childYouthResidentialPlacementInstitutions', language === 'zh' ? '兒童及少年安置機構' : 'Child and Youth Residential Placement Institutions']);
  const displayedTabs = language === 'zh' ? tabs.map(([id, label]) => [id, zhTabLabels[id] ?? label] as [string, string]) : tabs;
  const catalogue = useMemo(() => buildDatasetCatalogue(displayedTabs, language, catalogueQuery), [displayedTabs, language, catalogueQuery]);
  const activeDatasetLabel = displayedTabs.find(([id]) => id === tab)?.[1];
  const selectDataset = (id: string) => { setTab(id); setCatalogueOpen(false); setCatalogueQuery(''); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const civicViews = [['map', t.map], ['directory', t.directory], ['overview', t.overview]] as const;

  return <div className="app">
    <header>
      <div className="masthead"><div className="brand-mark">北</div><div><p>TAIPEI · OPEN DIRECTORY</p><h1>{t.title}</h1><span>{t.subtitle}</span></div>
        <button className="language" onClick={() => setLanguage(language === 'zh' ? 'en' : 'zh')} aria-label="Switch language">{language === 'zh' ? 'EN' : '中文'}</button></div>
      <nav className="catalogue-nav" aria-label={language === 'zh' ? '資料目錄' : 'Data catalogue'}>
        <div className="catalogue-nav-inner">
          <button className="catalogue-trigger" type="button" aria-expanded={catalogueOpen} aria-controls="dataset-catalogue" onClick={() => setCatalogueOpen((open) => !open)}>
            <span>{language === 'zh' ? '資料目錄' : 'Data catalogue'}</span><span className="catalogue-trigger-current">{activeDatasetLabel}</span><span aria-hidden="true">⌄</span>
          </button>
          <label className="catalogue-search"><span className="sr-only">{language === 'zh' ? '搜尋資料集' : 'Search datasets'}</span><input value={catalogueQuery} onFocus={() => setCatalogueOpen(true)} onChange={(event) => { setCatalogueQuery(event.target.value); setCatalogueOpen(true); }} placeholder={language === 'zh' ? '搜尋資料集或服務' : 'Search datasets or services'} /></label>
        </div>
        {catalogueOpen && <div className="catalogue-popover" id="dataset-catalogue">
          <div className="catalogue-popover-heading"><div><p>{language === 'zh' ? '公共資料目錄' : 'PUBLIC DATA CATALOGUE'}</p><strong>{language === 'zh' ? '依主題探索資料集' : 'Browse datasets by topic'}</strong></div><button type="button" className="catalogue-close" onClick={() => { setCatalogueOpen(false); setCatalogueQuery(''); }} aria-label={language === 'zh' ? '關閉資料目錄' : 'Close data catalogue'}>×</button></div>
          <label className="catalogue-popover-search"><span className="sr-only">{language === 'zh' ? '搜尋資料集' : 'Search datasets'}</span><input value={catalogueQuery} onChange={(event) => setCatalogueQuery(event.target.value)} placeholder={language === 'zh' ? '搜尋資料集或服務' : 'Search datasets or services'} /></label>
          {catalogue.length ? <div className="catalogue-grid">{catalogue.map((category) => <section className="catalogue-category" key={category.id}><h2>{category.title}<span>{category.items.length}</span></h2><div>{category.items.map(([id, label]) => <button type="button" key={id} className={tab === id ? 'active' : ''} aria-current={tab === id ? 'page' : undefined} onClick={() => selectDataset(id)}>{label}</button>)}</div></section>)}</div> : <p className="catalogue-empty" role="status">{language === 'zh' ? '找不到符合的資料集，請嘗試其他關鍵字。' : 'No matching datasets. Try another keyword.'}</p>}
        </div>}
      </nav>
    </header>
    <main>
      <DataTrustPanel language={language} activeDataset={{ physicalTherapyClinics: 'physical-therapy-clinics', influenzaVaccineProvidersChildren3Plus: 'influenza-vaccine-providers-children-3plus' }[tab]} appliesSmallSampleGuard={tab === 'influenzaVaccineProvidersChildren3Plus'} />
      {loadError && <p className="status" role="alert">{t.loadError}</p>}
      {!loadError && (!summary || !performingArtsSummary || !vaccinationProviderSummary || !hpvProviderSummary || !childMedicalSubsidyProviderSummary || !dentureSubsidyProviderSummary || !disabilityEmploymentResourceSummary || !shelteredWorkshopSummary || !employmentAgencySummary || !licensedPawnshopSummary || !licensedArcadeSummary || !licensedSpecialEntertainmentSummary || !recyclingOrganizationSummary || !registeredFactorySummary || !enterpriseHeadquartersSummary || !cemeterySummary || !telepsychologySummary || !publicLiabilitySummary || !businessChangeSummary || !companyChangeSummary || !laborUnionSummary || !infantCareSummary || !infantCareEvaluationSummary || !elderlyWelfareSummary || !biotechCompanySummary || !travelAccommodationSummary || !grantSummary || !procurementSummary || !cramSchoolSummary || !hotelSummary || !laborViolationSummary || !laborViolationManifest || !oshViolationSummary || !genderEqualityViolationSummary || !consumerDisputeSummary || !nangangCompanySummary || !dawannanCompanySummary || !animalHospitalSummary || !animalMedicineSellerSummary || !petBusinessEvaluationSummary || !veterinarianSummary) && <p className="status" role="status">{t.loading}</p>}
      {tab === 'civic' && summary && <><FilterPanel filters={filters} setFilters={setFilters} language={language} decades={decades} /><section className="workspace civic-header"><div className="section-heading"><p>01 / CIVIC GROUPS</p><h2>{t.civicGroups}</h2></div>
        <div className="subtabs">{civicViews.map(([id, label]) => <button className={civicView === id ? 'active' : ''} onClick={() => setCivicView(id)} key={id}>{label}</button>)}</div>
        {civicView === 'map' && activeSummary && <CivicMap summary={activeSummary} language={language} openDistrict={openDistrict} />}
        {civicView === 'directory' && <><div className="section-heading inline"><div /><strong>{filtered.length.toLocaleString()} <span>{t.found}</span></strong></div><div className="notice subtle">{t.categoryNotice}</div><GroupDirectory groups={filtered} language={language} /></>}
        {civicView === 'overview' && activeSummary && <Overview summary={activeSummary} groups={hasFilters ? filtered : groups} language={language} />}</section></>}
      {tab === 'performingArts' && performingArtsSummary && <PerformingArtsGroupsModule records={performingArtsRecords} summary={performingArtsSummary} civicSummary={summary ?? undefined} language={language} />}
      {tab === 'vaccinationProviders' && vaccinationProviderSummary && <ContractedVaccinationMedicalProvidersModule records={vaccinationProviderRecords} summary={vaccinationProviderSummary} language={language} />}
      {tab === 'hpvProviders' && hpvProviderSummary && <PubliclyFundedHpvVaccinationProvidersModule records={hpvProviderRecords} summary={hpvProviderSummary} related={{ vaccinationProviders: vaccinationProviderSummary?.totalRecords, telepsychology: telepsychologySummary?.totalRecords, elderlyWelfare: elderlyWelfareSummary?.totalRecords }} language={language} />}
      {tab === 'childMedicalSubsidyProviders' && childMedicalSubsidyProviderSummary && <ChildMedicalSubsidyContractedProvidersModule records={childMedicalSubsidyProviderRecords} summary={childMedicalSubsidyProviderSummary} related={{ vaccination: vaccinationProviderSummary ?? undefined, hpv: hpvProviderSummary ?? undefined, telepsychology: telepsychologySummary ?? undefined }} language={language} />}
      {tab === 'dentureSubsidyProviders' && dentureSubsidyProviderSummary && <DentureSubsidyMedicalProvidersModule records={dentureSubsidyProviderRecords} summary={dentureSubsidyProviderSummary} related={{ elderlyWelfare: elderlyWelfareSummary ?? undefined, childMedical: childMedicalSubsidyProviderSummary ?? undefined, vaccination: vaccinationProviderSummary ?? undefined, telepsychology: telepsychologySummary ?? undefined }} language={language} />}
      {tab === 'disabilityEmploymentResources' && disabilityEmploymentResourceSummary && <DisabilityEmploymentResourceMapModule records={disabilityEmploymentResourceRecords} summary={disabilityEmploymentResourceSummary} related={{ laborUnions: laborUnionSummary ?? undefined, laborViolations: laborViolationSummary ?? undefined, elderlyWelfare: elderlyWelfareSummary ?? undefined, telepsychology: telepsychologySummary ?? undefined }} language={language} />}
      {tab === 'shelteredWorkshops' && shelteredWorkshopSummary && <ShelteredWorkshopDirectoryModule records={shelteredWorkshopRecords} summary={shelteredWorkshopSummary} related={{ disabilityEmployment: disabilityEmploymentResourceSummary ?? undefined, laborUnions: laborUnionSummary ?? undefined, laborViolations: laborViolationSummary ?? undefined, businessChanges: businessChangeSummary ?? undefined, companyChanges: companyChangeSummary ?? undefined, elderlyWelfare: elderlyWelfareSummary ?? undefined }} language={language} />}
      {tab === 'employmentAgencies' && employmentAgencySummary && <EmploymentAgencyIntermediaryCompaniesModule records={employmentAgencyRecords} summary={employmentAgencySummary} related={{ laborViolations: laborViolationSummary?.totalRecords, oshViolations: oshViolationSummary?.totalRecords, genderEqualityViolations: genderEqualityViolationSummary?.totalRecords, businessChanges: businessChangeSummary?.totalRecords, companyChanges: companyChangeSummary?.totalRecords, laborUnions: laborUnionSummary?.totalRecords, disabilityEmployment: disabilityEmploymentResourceSummary?.totalRecords, shelteredWorkshops: shelteredWorkshopSummary?.totalRecords }} language={language} />}
      {tab === 'licensedPawnshops' && licensedPawnshopSummary && <LicensedPawnshopDirectoryModule records={licensedPawnshopRecords} summary={licensedPawnshopSummary} related={{ businessChanges: businessChangeSummary ?? undefined, companyChanges: companyChangeSummary ?? undefined, consumerDispute: consumerDisputeSummary ?? undefined, publicLiability: publicLiabilitySummary ?? undefined, laborViolations: laborViolationSummary ?? undefined }} language={language} />}
      {tab === 'licensedArcades' && licensedArcadeSummary && <LicensedElectronicGameArcadeOperatorsModule records={licensedArcadeRecords} summary={licensedArcadeSummary} related={{ pawnshops: licensedPawnshopSummary ?? undefined, hotels: hotelSummary ?? undefined, cramSchools: cramSchoolSummary ?? undefined, business: businessChangeSummary ?? undefined, company: companyChangeSummary ?? undefined, consumer: consumerDisputeSummary ?? undefined }} language={language} />}
      {tab === 'licensedSpecialEntertainment' && licensedSpecialEntertainmentSummary && <LicensedSpecialEntertainmentBusinessOperatorsModule records={licensedSpecialEntertainmentRecords} summary={licensedSpecialEntertainmentSummary} related={{ arcades: licensedArcadeSummary ?? undefined, pawnshops: licensedPawnshopSummary ?? undefined, hotels: hotelSummary ?? undefined, cramSchools: cramSchoolSummary ?? undefined, business: businessChangeSummary ?? undefined, company: companyChangeSummary ?? undefined, consumer: consumerDisputeSummary ?? undefined }} language={language} />}
      {tab === 'recyclingOrganizations' && recyclingOrganizationSummary && <RegisteredRecyclingBusinessOrganizationsModule records={recyclingOrganizationRecords} summary={recyclingOrganizationSummary} related={{ business: businessChangeSummary ?? undefined, company: companyChangeSummary ?? undefined }} language={language} />}
      {tab === 'registeredFactories' && registeredFactorySummary && <RegisteredFactoryDistributionModule records={registeredFactoryRecords} summary={registeredFactorySummary} related={{ dawannan: dawannanCompanySummary?.totalRecords, recycling: recyclingOrganizationSummary?.totalRecords, businessChanges: businessChangeSummary?.totalRecords, companyChanges: companyChangeSummary?.totalRecords, laborViolations: laborViolationSummary?.totalRecords, oshViolations: oshViolationSummary?.totalRecords }} language={language} />}
      {tab === 'enterpriseHeadquarters' && enterpriseHeadquartersSummary && <EnterpriseHeadquartersDistributionModule records={enterpriseHeadquartersRecords} summary={enterpriseHeadquartersSummary} related={{ factories: registeredFactorySummary?.totalRecords, dawannan: dawannanCompanySummary?.totalRecords, businessChanges: businessChangeSummary?.totalRecords, companyChanges: companyChangeSummary?.totalRecords }} language={language} />}
      {tab === 'cemeteryPublicFacilities' && cemeterySummary && <CemeteryPublicFacilitiesModule records={cemeteryRecords} summary={cemeterySummary} language={language} />}
      {tab === 'telepsychology' && telepsychologySummary && <TelepsychologyCounselingInstitutionsModule records={telepsychologyRecords} summary={telepsychologySummary} language={language} />}
      {tab === 'publicLiabilityInsurance' && publicLiabilitySummary && <BusinessPremisesPublicLiabilityInsuranceModule records={publicLiabilityRecords} summary={publicLiabilitySummary} language={language} />}
      {tab === 'businessChanges' && businessChangeSummary && <BusinessRegistrationChangesModule records={businessChangeRecords} summary={businessChangeSummary} language={language} />}
      {tab === 'companyChanges' && companyChangeSummary && <CompanyRegistrationChangesModule records={companyChangeRecords} summary={companyChangeSummary} businessSummary={businessChangeSummary ?? undefined} language={language} />}
      {tab === 'laborUnions' && laborUnionSummary && <RegisteredLaborUnionsModule records={laborUnionRecords} summary={laborUnionSummary} language={language} />}
      {tab === 'infantCare' && infantCareSummary && <QuasiPublicInfantCareCentersModule records={infantCareRecords} summary={infantCareSummary} language={language} />}
      {tab === 'infantCareEvaluations' && infantCareEvaluationSummary && <InfantCareCenterEvaluationResultsModule institutions={infantCareEvaluationInstitutions} yearRecords={infantCareEvaluationYearRecords} summary={infantCareEvaluationSummary} quasiPublicRecords={infantCareRecords} language={language} />}
      {tab === 'elderlyWelfare' && elderlyWelfareSummary && <ElderlyWelfareInstitutionsModule records={elderlyWelfareRecords} summary={elderlyWelfareSummary} language={language} />}
      {tab === 'seniorGroupMealServiceSites' && seniorGroupMealServiceSiteSummary && <SeniorGroupMealServiceSitesModule records={seniorGroupMealServiceSiteRecords} summary={seniorGroupMealServiceSiteSummary} language={language} />}
      {tab === 'publicPneumococcalVaccineProviders' && publicPneumococcalVaccineProviderSummary && <PublicPneumococcalVaccineProvidersModule records={publicPneumococcalVaccineProviderRecords} summary={publicPneumococcalVaccineProviderSummary} language={language} />}
      {tab === 'majorElectricityUsers' && majorElectricityUserSummary && <MajorElectricityUsersModule records={majorElectricityUserRecords} summary={majorElectricityUserSummary} language={language} />}
      {tab === 'earlyInterventionMedicalProviders' && earlyInterventionMedicalProviderSummary && <EarlyInterventionMedicalProvidersModule records={earlyInterventionMedicalProviderRecords} summary={earlyInterventionMedicalProviderSummary} language={language} />}
      {tab === 'generalDentalMedicalInstitutions' && generalDentalMedicalInstitutionSummary && <GeneralDentalMedicalInstitutionsModule records={generalDentalMedicalInstitutionRecords} summary={generalDentalMedicalInstitutionSummary} language={language} />}
      {tab === 'pediatricMedicalInstitutions' && <PediatricMedicalInstitutionsModule language={language} />}
      {tab === 'diabetesSharedCareMedicalInstitutions' && diabetesSharedCareMedicalInstitutionSummary && <DiabetesSharedCareMedicalInstitutionsModule records={diabetesSharedCareMedicalInstitutionRecords} summary={diabetesSharedCareMedicalInstitutionSummary} language={language} />}
      {tab === 'generalWesternMedicineInstitutions' && <GeneratedDatasetDirectoryModule
        language={language} title={language === 'zh' ? '西醫一般科醫療機構' : 'General Western Medicine Institutions'}
        subtitle={language === 'zh' ? '行政區彙整、可搜尋名冊及外部地圖查詢；不建立精確地圖標記。' : 'District summaries, searchable directory, and external map lookup only; no exact map markers.'}
        records={generalWesternMedicineInstitutionRecords}
        columns={[["sourceSequenceNumber", language === 'zh' ? '序號' : 'ID'], ["institutionName", language === 'zh' ? '機構名稱' : 'Institution name'], ["districtNameFromAddress", language === 'zh' ? '行政區' : 'District'], ["postalCode", language === 'zh' ? '郵遞區號' : 'Postal code'], ["address", language === 'zh' ? '地址' : 'Address'], ["phone", language === 'zh' ? '電話' : 'Phone'], ["googleMapsQuery", language === 'zh' ? '地圖查詢' : 'Map lookup']]}
        notice={language === 'zh' ? '本資料不代表即時營業、門診、預約、診療項目、費用、醫療品質、急診能力、診斷、治療或醫療建議；請向醫療機構或臺北市政府衛生局確認。' : 'This dataset does not represent real-time operation, clinic hours, appointments, treatments, fees, quality, emergency capability, diagnosis, treatment, or medical advice. Confirm with the institution or Taipei City Department of Health.'}
      />}
      {tab === 'rotavirusVaccineSubsidyProviders' && <GeneratedDatasetDirectoryModule language={language} title={language==='zh'?'輪狀病毒疫苗補助合約醫療院所':'Rotavirus Vaccine Subsidy Providers'} subtitle={language==='zh'?'院所類別與語音預約資訊均為來源欄位，不代表即時可預約或疫苗供應。':'Institution category and voice-appointment information are source fields, not real-time booking or vaccine supply.'} records={rotavirusVaccineSubsidyProviderRecords} columns={[["institutionName",language==='zh'?'院所名稱':'Institution name'],["institutionCategory",language==='zh'?'機構類別':'Institution category'],["districtName",language==='zh'?'行政區':'District'],["address",language==='zh'?'地址':'Address'],["phone",language==='zh'?'電話':'Phone'],["voiceAppointmentRaw",language==='zh'?'語音預約資訊':'Voice appointment information'],["googleMapsQuery",language==='zh'?'地圖查詢':'Map lookup']]} notice={language==='zh'?'本資料不代表即時疫苗庫存、補助或接種資格、預約、語音預約、服務時間、費用、醫療品質、診斷或醫療建議；請向院所或臺北市政府衛生局確認。':'This dataset does not represent real-time stock, subsidy or vaccination eligibility, appointments, voice booking, hours, fees, quality, diagnosis, or medical advice. Confirm with the provider or Taipei City Department of Health.'}/>}
      {tab === 'homeNursingInstitutions' && <HomeNursingInstitutionsModule language={language} />}
      {tab === 'optometryInstitutions' && <OptometryInstitutionsModule language={language} />}
      {tab === 'generalChineseMedicineInstitutions' && <GeneralChineseMedicineInstitutionsModule language={language} />}
      {tab === 'alternativeServiceReserveStatistics' && <AlternativeServiceReserveStatisticsModule language={language} />}
      {tab === 'medicalLaboratories' && <MedicalLaboratoriesModule language={language} />}
      {tab === 'communityCareServiceSites' && <CommunityCareServiceSitesModule language={language} />}
      {tab === 'seniorCareCapacityAndOccupancy' && <SeniorCareCapacityAndOccupancyModule language={language} />}
      {tab === 'domesticEmploymentAgencyEvaluations' && <DomesticEmploymentAgencyEvaluationsModule language={language} />}
      {tab === 'lodgingBusinessPenaltyRecords' && <LodgingBusinessPenaltyRecordsModule language={language} />}
      {tab === 'communityPublicChildcareHomes' && <CommunityPublicChildcareHomesModule language={language} />}
      {tab === 'tbContactScreeningPartnerProviders' && <TbContactScreeningPartnerProvidersModule language={language} />}
      {tab === 'beautyHairdressingHygieneCertifications' && <BeautyHairdressingHygieneCertificationsModule language={language} />}
      {tab === 'publicInfluenzaAntiviralProviders' && <PublicInfluenzaAntiviralProvidersModule language={language} />}
      {tab === 'influenzaVaccineProvidersChildren3Plus' && <Suspense fallback={<DirectoryModuleLoading language={language} />}><InfluenzaVaccineProvidersChildren3PlusModule language={language} /></Suspense>}
      {tab === 'communityIntegratedCareLevelCUnits' && <CommunityIntegratedCareLevelCUnitsModule language={language} />}
      {tab === 'registeredAfterSchoolCareCentres' && <RegisteredAfterSchoolCareCentresModule language={language} />}
      {tab === 'subsidizedSeniorResidentialPlacementInstitutions' && <SubsidizedSeniorResidentialPlacementInstitutionsModule language={language} />}
      {tab === 'familyMedicineInstitutions' && <FamilyMedicineInstitutionsModule language={language} />}
      {tab === 'cosmeticMedicineSupervision2024' && <CosmeticMedicineSupervision2024Module language={language} />}
      {tab === 'plasticSurgeryMedicalInstitutions' && <PlasticSurgeryMedicalInstitutionsModule language={language} />}
      {tab === 'indigenousCommunityOrganizations' && <IndigenousCommunityOrganizationsModule language={language} />}
      {tab === 'licensedNaturalGasPipelineContractors' && <LicensedNaturalGasPipelineContractorsModule language={language} />}
      {tab === 'communityDevelopmentAssociations' && <CommunityDevelopmentAssociationsModule language={language} />}
      {tab === 'obstetricsGynecologyInstitutions' && <ObstetricsGynecologyInstitutionsModule language={language} />}
      {tab === 'artsCulturalVenues' && <ArtsCulturalVenuesModule language={language} />}
      {tab === 'psychiatricClinics' && <PsychiatricClinicsModule language={language} />}
      {tab === 'licensedAssistedReproductionInstitutions' && <LicensedAssistedReproductionInstitutionsModule language={language} />}
      {tab === 'childYouthResidentialPlacementInstitutions' && <ChildYouthResidentialPlacementInstitutionsModule language={language} />}
      {tab === 'childYouthFriendlyWelfareServiceSites' && <ChildYouthFriendlyWelfareServiceSitesModule language={language} />}
      {tab === 'disabilityInstitutionCapacityAndVacancies' && <DisabilityInstitutionCapacityAndVacanciesModule language={language} />}
      {tab === 'ophthalmologyInstitutions' && <OphthalmologyInstitutionsModule language={language} />}
      {tab === 'taipeiCulturalHeritageAssets' && <TaipeiCulturalHeritageAssetsModule language={language} />}
      {tab === 'privateCulturalHeritageSubsidies' && <PrivateCulturalHeritageSubsidiesModule language={language} />}
      {tab === 'travelMedicineClinics' && <TravelMedicineClinicsModule language={language} />}
      {tab === 'hakkaOrganizations' && <HakkaOrganizationsModule language={language} />}
      {tab === 'hospitalDischargeLongTermCarePartners' && <HospitalDischargeLongTermCarePartnersModule language={language} />}
      {tab === 'hospicePalliativeCareInstitutions' && <HospicePalliativeCareInstitutionsModule language={language} />}
      {tab === 'privateSeniorResidentialLongTermCareInstitutions' && <PrivateSeniorResidentialLongTermCareInstitutionsModule language={language} />}
      {tab === 'hemodialysisMedicalInstitutions' && <HemodialysisMedicalInstitutionsModule language={language} />}
      {tab === 'internalMedicineInstitutions' && <InternalMedicineInstitutionsModule language={language} />}
      {tab === 'occupationalTherapyClinics' && <OccupationalTherapyClinicsModule language={language} />}
      {tab === 'physicalTherapyClinics' && <Suspense fallback={<DirectoryModuleLoading language={language} />}><PhysicalTherapyClinicsModule language={language} /></Suspense>}
      {tab === 'designatedForeignerHealthExamHospitals' && <DesignatedForeignerHealthExamHospitalsModule language={language} />}
      {tab === 'licensedWasteCookingOilCollectors' && <LicensedWasteCookingOilCollectorsModule language={language} />}
      {tab === 'adultInfluenzaVaccineProviders' && <AdultInfluenzaVaccineProvidersModule language={language} />}
      {tab === 'pestControlBusinesses' && <PestControlBusinessesModule language={language} />}
      {tab === 'waterPipeInstallationContractors' && <WaterPipeInstallationContractorsModule language={language} />}
      {tab === 'seniorCareInstitutionEvaluations' && <SeniorCareInstitutionEvaluationsModule language={language} />}
      {tab === 'fertilitySubsidyContractedHospitals' && <FertilitySubsidyContractedHospitalsModule language={language} />}
      {tab === 'fiveCancerScreeningProviders' && <FiveCancerScreeningProvidersModule language={language} />}
      {tab === 'rabiesVaccinationVeterinaryClinics' && <RabiesVaccinationVeterinaryClinicsModule language={language} />}
      {tab === 'seniorServiceSiteCourses' && <SeniorServiceSiteCoursesModule language={language} />}
      {tab === 'taipeiGovernmentApplicationServices' && <TaipeiGovernmentApplicationServicesModule language={language} />}
      {tab === 'psychiatricRehabilitationAndNursingInstitutions' && <PsychiatricRehabilitationAndNursingInstitutionsModule language={language} />}
      {tab === 'culturalArtsFoundations' && <CulturalArtsFoundationsModule language={language} />}
      {tab === 'visuallyImpairedMassageEstablishments' && <VisuallyImpairedMassageEstablishmentsModule language={language} />}
      {tab === 'approvedGasWaterHeaterInstallers' && <ApprovedGasWaterHeaterInstallersModule language={language} />}
      {tab === 'petRegistrationStations' && <GeneratedDatasetDirectoryModule
        language={language}
        title={language === 'zh' ? '寵物登記站名冊' : 'Pet Registration Station Directory'}
        subtitle={language === 'zh' ? '可依行政區、電話與關鍵字搜尋的公開名冊；地圖查詢連至外部服務。' : 'A public directory searchable by district, phone, and keyword; map lookup opens an external service.'}
        records={petRegistrationStationRecords}
        columns={[
          ['sourceId', language === 'zh' ? '編號' : 'ID'],
          ['stationName', language === 'zh' ? '寵物登記機構名稱' : 'Station name'],
          ['districtNameFromAddress', language === 'zh' ? '行政區' : 'District'],
          ['address', language === 'zh' ? '地址' : 'Address'],
          ['phone', language === 'zh' ? '電話' : 'Phone'],
          ['googleMapsQuery', language === 'zh' ? '地圖查詢' : 'Map lookup'],
        ]}
        notice={language === 'zh' ? '本資料為臺北市寵物登記站公開名冊，僅供查詢參考，不代表即時營業狀態、可辦理項目、預約、費用、服務品質、獸醫服務或官方推薦。實際服務請向各機構或臺北市動物保護處確認。' : 'This public directory is for lookup only. It does not represent real-time operating status, available registration services, appointments, fees, service quality, veterinary services, or official recommendation. Confirm current services with the station or Taipei Animal Protection Office.'}
      />}
      {tab === 'bottledGasRetailers' && <GeneratedDatasetDirectoryModule
        language={language}
        title={language === 'zh' ? '桶裝瓦斯零售商名冊' : 'Bottled Gas Retailer Directory'}
        subtitle={language === 'zh' ? '來源列示價格與位置資料僅供公開資料查詢，並非即時或最終交易資訊。' : 'Source-listed prices and location data are for public-data lookup only, not real-time or final transaction information.'}
        records={bottledGasRetailerRecords}
        columns={[
          ['retailerName', language === 'zh' ? '零售商名稱' : 'Retailer name'],
          ['districtName', language === 'zh' ? '行政區' : 'District'],
          ['address', language === 'zh' ? '地址' : 'Address'],
          ['phone', language === 'zh' ? '電話' : 'Phone'],
          ['price16KgRaw', language === 'zh' ? '16 公斤來源列示價格' : '16 kg source-listed price'],
          ['price20KgRaw', language === 'zh' ? '20 公斤來源列示價格' : '20 kg source-listed price'],
          ['coordinateSystem', language === 'zh' ? '座標系統' : 'Coordinate system'],
        ]}
        notice={language === 'zh' ? '本資料為臺北市桶裝瓦斯零售商公開資料，僅供查詢參考。來源列示價格不代表即時價格、最終交易價格、供應狀態、配送範圍、服務時間、費用或官方推薦；實際交易資訊請向零售商確認。' : 'This public directory is for lookup only. Source-listed prices do not represent real-time or final transaction prices, supply status, delivery coverage, service hours, fees, or official recommendation. Confirm current transaction information with the retailer.'}
      />}
      {tab === 'socialWelfareFoundations' && <GeneratedDatasetDirectoryModule
        language={language} title={language === 'zh' ? '社會福利基金會名冊' : 'Social Welfare Foundation Directory'}
        subtitle={language === 'zh' ? '行政區與類別為公開來源欄位；不建立精確地圖標記。' : 'Districts and categories are source fields; no exact map markers.'}
        records={socialWelfareFoundationRecords}
        columns={[["sourceSequenceNumber", language === 'zh' ? '序號' : 'ID'], ["foundationName", language === 'zh' ? '名稱' : 'Foundation name'], ["foundationCategory", language === 'zh' ? '類別' : 'Category'], ["districtName", language === 'zh' ? '行政區' : 'District'], ["address", language === 'zh' ? '地址' : 'Address'], ["phone", language === 'zh' ? '電話' : 'Phone'], ["organizationCode", language === 'zh' ? '代碼編號' : 'Organization code'], ["registrationNumber", language === 'zh' ? '立案字號' : 'Registration number'], ["establishedDateRaw", language === 'zh' ? '成立日期' : 'Established date'], ["googleMapsQuery", language === 'zh' ? '地圖查詢' : 'Map lookup']]}
        notice={language === 'zh' ? '本資料不代表目前立案、營運、服務、募款資格、財務狀況、社會影響、服務品質或官方推薦；請向基金會、臺北市政府社會局或主管機關確認。' : 'This dataset does not confirm current registration, operation, services, fundraising eligibility, financial condition, social impact, quality, or recommendation. Confirm with the foundation, Taipei City Department of Social Welfare, or the relevant authority.'}
      />}
      {tab === 'schoolchildDentalPreventiveCareProviders' && <GeneratedDatasetDirectoryModule
        language={language} title={language === 'zh' ? '學童牙齒預防保健合約醫療院所' : 'Schoolchild Dental Preventive Care Providers'}
        subtitle={language === 'zh' ? '兩份官方服務名冊分別保留為窩溝封填及含氟服務紀錄。' : 'Two official source lists remain distinct as pit-and-fissure sealant and school fluoride service records.'}
        records={schoolchildDentalPreventiveCareProviderRecords}
        columns={[["institutionName", language === 'zh' ? '醫療院所' : 'Institution'], ["serviceType", language === 'zh' ? '服務類型' : 'Service type'], ["districtName", language === 'zh' ? '行政區' : 'District'], ["address", language === 'zh' ? '地址' : 'Address'], ["phone", language === 'zh' ? '電話' : 'Phone'], ["googleMapsQuery", language === 'zh' ? '地圖查詢' : 'Map lookup']]}
        notice={language === 'zh' ? '本資料不代表即時服務、預約、資格、補助資格、服務時間、費用、醫療品質、診斷、治療或醫療建議；請向醫療院所、學校或臺北市政府衛生局確認。' : 'This dataset does not represent real-time services, appointments, eligibility, subsidy eligibility, hours, fees, quality, diagnosis, treatment, or medical advice. Confirm with the institution, school, or Taipei City Department of Health.'}
      />}
      {tab === 'hospitalHemodialysisResources' && <GeneratedDatasetDirectoryModule
        language={language} title={language === 'zh' ? '公私立醫院血液透析資源' : 'Hospital Hemodialysis Resources'}
        subtitle={language === 'zh' ? '以行政區彙整、可搜尋名冊及外部地圖查詢呈現；不建立精確地圖標記。' : 'District summaries, a searchable directory, and external map lookup only; no exact map markers.'}
        records={hospitalHemodialysisResourceRecords}
        columns={[["sourceSequenceNumber", language === 'zh' ? '項次' : 'ID'], ["institutionName", language === 'zh' ? '機構名稱' : 'Institution name'], ["districtName", language === 'zh' ? '行政區' : 'District'], ["address", language === 'zh' ? '地址' : 'Address'], ["phone", language === 'zh' ? '電話' : 'Phone'], ["googleMapsQuery", language === 'zh' ? '地圖查詢' : 'Map lookup']]}
        notice={language === 'zh' ? '本資料不代表即時透析名額、床位、預約、收治資格、服務時間、費用、醫療品質、緊急收治能力、診斷、治療或醫療建議；請向醫療機構或臺北市政府衛生局確認。' : 'This dataset does not represent real-time capacity, beds, appointments, eligibility, service hours, fees, quality, emergency capability, diagnosis, treatment, or medical advice. Confirm with the institution or Taipei City Department of Health.'}
      />}
      {tab === 'streetPerformerVenues' && <GeneratedDatasetDirectoryModule
        language={language} title={language === 'zh' ? '街頭藝人展演場地資訊' : 'Street Performer Venues'}
        subtitle={language === 'zh' ? '主管機關、表演類型及申請方式均為來源文字；場地名稱不會自動轉為地圖標記。' : 'Authority, performance types, and application methods are source text; venue names are not converted into map markers.'}
        records={streetPerformerVenueRecords}
        columns={[["sourceSequenceNumber", language === 'zh' ? '項次' : 'ID'], ["venueName", language === 'zh' ? '展演地' : 'Venue'], ["managingAuthority", language === 'zh' ? '主管機關' : 'Managing authority'], ["openingHoursRaw", language === 'zh' ? '開放時段' : 'Opening hours'], ["allowedPerformanceTypes", language === 'zh' ? '開放表演類型' : 'Performance types'], ["applicationMethod", language === 'zh' ? '申請方式' : 'Application method'], ["fullPhone", language === 'zh' ? '聯絡電話' : 'Phone'], ["externalMapQuery", language === 'zh' ? '地圖查詢' : 'Map lookup']]}
        notice={language === 'zh' ? '開放時段、表演類型及申請方式不代表即時開放、申請、核准、許可、預約、費用、安全保證或官方推薦；請向主管機關或場地營運者確認。' : 'Opening hours, performance types, and application methods do not confirm real-time availability, approval, permission, reservations, fees, safety, or recommendation. Confirm with the managing authority or venue operator.'}
      />}
      {tab === 'domesticEmploymentServiceAgencies' && <GeneratedDatasetDirectoryModule
        language={language} title={language === 'zh' ? '仲介本國人國內工作私立就業服務機構名冊' : 'Domestic Employment Service Agency Directory'}
        subtitle={language === 'zh' ? '本資料僅限臺北市許可仲介本國人在國內工作之私立就業服務機構及分支機構。' : 'A distinct directory of Taipei-licensed agencies that place Taiwanese nationals in domestic employment.'}
        records={domesticEmploymentServiceAgencyRecords}
        columns={[["sourceSequenceNumber", language === 'zh' ? '編號' : 'ID'], ["licenseNumber", language === 'zh' ? '許可證字號' : 'Licence number'], ["agencyName", language === 'zh' ? '機構名稱' : 'Agency name'], ["districtNameFromAddress", language === 'zh' ? '行政區' : 'District'], ["address", language === 'zh' ? '機構地址' : 'Address'], ["phone", language === 'zh' ? '機構電話' : 'Phone'], ["responsiblePerson", language === 'zh' ? '負責人姓名' : 'Responsible person'], ["licenseExpiryRaw", language === 'zh' ? '許可證有效期限' : 'Licence expiry'], ["capitalAmountRaw", language === 'zh' ? '資本額' : 'Capital'], ["professionalPersonnelRaw", language === 'zh' ? '專業人員' : 'Licensed professionals'], ["googleMapsQuery", language === 'zh' ? '地圖查詢' : 'Map lookup']]}
        notice={language === 'zh' ? '許可證期限、資本額及專業人員為來源欄位，僅相對資料建置日計算狀態；不代表即時許可、營運、職缺、服務品質或官方推薦。請向臺北市政府勞動局確認。' : 'Licence expiry, capital, and personnel are source-record fields only. Any status is relative to the data build date and does not confirm real-time validity, operation, jobs, quality, or recommendation. Confirm with Taipei City Department of Labor.'}
      />}
      {tab === 'postpartumCareInstitutions' && <GeneratedDatasetDirectoryModule language={language} title={language==='zh'?'立案產後護理機構':'Registered Postpartum Care Institutions'} subtitle={language==='zh'?'來源床位與評鑑欄位不代表即時名額或品質建議。':'Source bed and evaluation fields are not real-time availability or quality advice.'} records={postpartumRecords} columns={[["institutionName",language==='zh'?'機構名稱':'Institution'],["districtNameFromAddress",language==='zh'?'行政區':'District'],["address",language==='zh'?'地址':'Address'],["phone",language==='zh'?'電話':'Phone'],["totalBedCount",language==='zh'?'床位':'Beds']]} notice={language==='zh'?'不提供即時空床、費用或照護建議。':'No real-time vacancies, fees, or care advice.'}/>} 
      {tab === 'outCityFuneralBusinesses' && <GeneratedDatasetDirectoryModule language={language} title={language==='zh'?'外縣市殯葬服務業者':'Out-of-City Funeral Service Businesses'} subtitle={language==='zh'?'地址為來源登記地，不代表臺北服務據點。':'Addresses are source registered locations, not Taipei service locations.'} records={outCityFuneralRecords} columns={[["companyName",language==='zh'?'公司名稱':'Company'],["responsiblePerson",language==='zh'?'負責人':'Responsible person'],["sourceCityOrCounty",language==='zh'?'縣市':'City/county'],["companyAddress",language==='zh'?'登記地址':'Registered address'],["phone",language==='zh'?'電話':'Phone']]} notice={language==='zh'?'不代表即時營運或登記有效狀態。':'Does not represent current operation or registration validity.'}/>} 
      {tab === 'hotelHygieneDirectory' && <GeneratedDatasetDirectoryModule language={language} title={language==='zh'?'旅館衛生認證紀錄':'Hotel Hygiene Certification Records'} subtitle={language==='zh'?'保留來源欄位，認證資料不代表即時狀態。':'Source records retained; certification data is not real-time status.'} records={hotelHygieneRecords} columns={[["id",'ID'],["sourceValues",language==='zh'?'來源欄位':'Source fields']]} notice={language==='zh'?'不代表目前認證、營運或品質推薦。':'Does not represent current certification, operation, or quality recommendation.'}/>} 
      {tab === 'kindergartenEvaluationPass' && <GeneratedDatasetDirectoryModule language={language} title={language==='zh'?'公私立幼兒園基礎評鑑通過名單':'Kindergarten Basic Evaluation Pass Records'} subtitle={language==='zh'?'通過紀錄屬特定學年度，不代表目前狀態。':'Pass records apply to specified academic years, not current status.'} records={kindergartenRecords} columns={[["kindergartenName",language==='zh'?'幼兒園':'Kindergarten'],["districtName",language==='zh'?'行政區':'District'],["establishmentType",language==='zh'?'設立別':'Establishment type'],["evaluationAcademicYearRaw",language==='zh'?'評鑑學年度':'Academic year'],["cityCode",language==='zh'?'縣市代碼':'City code']]} notice={language==='zh'?'不代表目前立案、招生、費用或品質推薦。':'Does not represent current registration, enrollment, fees, or quality recommendation.'}/>} 
      {tab === 'biotechCompanies' && biotechCompanySummary && <BiotechCompanyDirectoryModule records={biotechCompanyRecords} summary={biotechCompanySummary} related={{ grants: grantSummary?.totalRecords, nangang: nangangCompanySummary?.totalRecords, companyChanges: companyChangeSummary?.totalRecords, businessChanges: businessChangeSummary?.totalRecords }} language={language} />}
      {tab === 'travelAccommodations' && travelAccommodationSummary && <TaipeiTravelAccommodationsZhModule records={travelAccommodationRecords} summary={travelAccommodationSummary} registeredHotelSummary={hotelSummary ?? undefined} language={language} />}
      {tab === 'grants' && grantSummary && <IndustryModule records={grantRecords} summary={grantSummary} language={language} />}
      {tab === 'procurement' && procurementSummary && <MetroProcurementModule records={procurementRecords} summary={procurementSummary} language={language} />}
      {tab === 'cramSchools' && cramSchoolSummary && <RegisteredCramSchoolsModule records={cramSchoolRecords} summary={cramSchoolSummary} language={language} />}
      {tab === 'hotels' && hotelSummary && <RegisteredHotelsModule records={hotelRecords} summary={hotelSummary} language={language} />}
      {tab === 'laborViolations' && laborViolationSummary && laborViolationManifest && <LaborStandardActViolationsModule summary={laborViolationSummary} manifest={laborViolationManifest} language={language} />}
      {tab === 'oshViolations' && oshViolationSummary && <OccupationalSafetyHealthViolationsModule records={oshViolationRecords} summary={oshViolationSummary} related={{ labor: laborViolationSummary ?? undefined, business: businessChangeSummary ?? undefined, company: companyChangeSummary ?? undefined, consumer: consumerDisputeSummary ?? undefined }} language={language} />}
      {tab === 'genderEqualityViolations' && genderEqualityViolationSummary && <GenderEqualityWorkActViolationsModule records={genderEqualityViolationRecords} summary={genderEqualityViolationSummary} related={{ labor: laborViolationSummary ?? undefined, osh: oshViolationSummary ?? undefined, business: businessChangeSummary ?? undefined, company: companyChangeSummary ?? undefined, consumer: consumerDisputeSummary ?? undefined }} language={language} />}
      {tab === 'consumerDisputeAbsence' && consumerDisputeSummary && <ConsumerDisputeAbsentBusinessOperatorsModule records={consumerDisputeRecords} summary={consumerDisputeSummary} related={{ laborViolations: laborViolationSummary?.totalRecords, businessChanges: businessChangeSummary?.totalRecords, companyChanges: companyChangeSummary?.totalRecords, publicLiability: publicLiabilitySummary?.totalRecords }} language={language} />}
      {tab === 'nangangCompanies' && nangangCompanySummary && <NangangSoftwareParkCompaniesModule records={nangangCompanyRecords} summary={nangangCompanySummary} language={language} />}
      {tab === 'dawannanCompanies' && dawannanCompanySummary && <DawannanIndustrialAreaCompaniesModule records={dawannanCompanyRecords} summary={dawannanCompanySummary} related={{ nangang: nangangCompanySummary?.totalRecords, grants: grantSummary?.totalRecords, businessChanges: businessChangeSummary?.totalRecords, companyChanges: companyChangeSummary?.totalRecords, publicLiability: publicLiabilitySummary?.totalRecords, laborViolations: laborViolationSummary?.totalRecords, oshViolations: oshViolationSummary?.totalRecords }} language={language} />}
      {tab === 'animalHospitals' && animalHospitalSummary && <RegisteredAnimalHospitalsModule records={animalHospitalRecords} summary={animalHospitalSummary} language={language} />}
      {tab === 'animalMedicineSellers' && animalMedicineSellerSummary && <LicensedAnimalMedicineSellersModule records={animalMedicineSellerRecords} summary={animalMedicineSellerSummary} related={{ animalHospitals: animalHospitalSummary?.totalRecords, veterinarians: veterinarianSummary?.totalRecords, businessChanges: businessChangeSummary?.totalRecords, companyChanges: companyChangeSummary?.totalRecords }} language={language} />}
      {tab === 'petBusinessEvaluations' && petBusinessEvaluationSummary && <SpecificPetBusinessEvaluationResultsModule records={petBusinessEvaluationRecords} summary={petBusinessEvaluationSummary} related={{ animalHospitals: animalHospitalSummary?.totalRecords, animalMedicineSellers: animalMedicineSellerSummary?.totalRecords, veterinarians: veterinarianSummary?.totalRecords, businessChanges: businessChangeSummary?.totalRecords, companyChanges: companyChangeSummary?.totalRecords }} language={language} />}
      {tab === 'veterinarians' && veterinarianSummary && <VeterinarianProfessionalRegistryModule records={veterinarianRecords} summary={veterinarianSummary} related={{ animalHospitals: animalHospitalSummary ?? undefined, businessChanges: businessChangeSummary ?? undefined, companyChanges: companyChangeSummary ?? undefined, consumerDispute: consumerDisputeSummary ?? undefined, laborViolations: laborViolationSummary ?? undefined }} language={language} />}
      {tab === 'comparison' && summary && grantSummary && <DistrictComparison groups={groups} civicSummary={summary} grants={grantRecords} grantSummary={grantSummary} language={language} />}
      {tab === 'overview' && summary && performingArtsSummary && vaccinationProviderSummary && hpvProviderSummary && childMedicalSubsidyProviderSummary && dentureSubsidyProviderSummary && disabilityEmploymentResourceSummary && shelteredWorkshopSummary && licensedPawnshopSummary && licensedArcadeSummary && licensedSpecialEntertainmentSummary && recyclingOrganizationSummary && registeredFactorySummary && enterpriseHeadquartersSummary && cemeterySummary && telepsychologySummary && publicLiabilitySummary && businessChangeSummary && companyChangeSummary && laborUnionSummary && infantCareSummary && infantCareEvaluationSummary && elderlyWelfareSummary && biotechCompanySummary && travelAccommodationSummary && grantSummary && procurementSummary && cramSchoolSummary && hotelSummary && laborViolationSummary && oshViolationSummary && genderEqualityViolationSummary && consumerDisputeSummary && nangangCompanySummary && dawannanCompanySummary && animalHospitalSummary && animalMedicineSellerSummary && petBusinessEvaluationSummary && veterinarianSummary && <CombinedOverview civic={summary} performingArts={performingArtsSummary} vaccinationProviders={vaccinationProviderSummary} hpvProviders={hpvProviderSummary} childMedicalSubsidyProviders={childMedicalSubsidyProviderSummary} dentureSubsidyProviders={dentureSubsidyProviderSummary} disabilityEmploymentResources={disabilityEmploymentResourceSummary} shelteredWorkshops={shelteredWorkshopSummary} licensedPawnshops={licensedPawnshopSummary} licensedArcades={licensedArcadeSummary} licensedSpecialEntertainment={licensedSpecialEntertainmentSummary} recyclingOrganizations={recyclingOrganizationSummary} registeredFactories={registeredFactorySummary} enterpriseHeadquarters={enterpriseHeadquartersSummary} cemeteryPublicFacilities={cemeterySummary} telepsychology={telepsychologySummary} publicLiabilityInsurance={publicLiabilitySummary} businessChanges={businessChangeSummary} companyChanges={companyChangeSummary} laborUnions={laborUnionSummary} infantCare={infantCareSummary} infantCareEvaluations={infantCareEvaluationSummary} elderlyWelfare={elderlyWelfareSummary} biotechCompanies={biotechCompanySummary} travelAccommodations={travelAccommodationSummary} grants={grantSummary} procurement={procurementSummary} cramSchools={cramSchoolSummary} hotels={hotelSummary} laborViolations={laborViolationSummary} oshViolations={oshViolationSummary} genderEqualityViolations={genderEqualityViolationSummary} consumerDisputeAbsence={consumerDisputeSummary} nangangCompanies={nangangCompanySummary} dawannanCompanies={dawannanCompanySummary} animalHospitals={animalHospitalSummary} animalMedicineSellers={animalMedicineSellerSummary} petBusinessEvaluations={petBusinessEvaluationSummary} veterinarians={veterinarianSummary} language={language} />}
      {tab === 'notes' && <section className="workspace notes"><div className="section-heading"><p>09 / METHODOLOGY</p><h2>{t.notes}</h2></div>
        <blockquote>{language === 'zh' ? '本網站整理臺北市公開資料中的人民團體名冊、演藝團體名冊、工會名單、身障就業資源、庇護工場名冊、環保回收機構、當舖業資料清冊、合法電子遊戲場業者清冊、合法八大行業業者清冊、產業補助廠商資料、生技廠商企業名錄、捷運採購案件預定招標時程、立案補習班資訊、一般旅館名冊、臺北旅遊網住宿資料、勞基法違規公布紀錄、職安法違規公布紀錄、性別平等工作法違規公布紀錄、消費爭議不到場公告、南港軟體工業園區廠商資料、大彎南段工業區廠商名錄、動物醫院一覽表、動物用藥品販賣業者名冊、獸醫師資訊、準公共化托嬰中心、托嬰中心評鑑結果、老人福利機構名冊、各項預防接種合約醫療院所、公費HPV疫苗特約醫療院所、兒童醫療補助特約院所、假牙補助醫療院所、可執行通訊心理諮商之心理機構、營業場所投保公共意外險清冊、商業設立變更及歇業登記異動資料、公司設立變更及解散登記異動資料等公開資料，僅供資料探索與整理使用。各資料集性質不同，不應直接解讀為相同類型組織、活動、服務可用性、即時營業狀態、醫療建議、兒童照顧或老人照顧建議、就業媒合保證、補助資格判定、消費糾紛狀態、可公開投放、污染風險、貸款建議、官方排名、法規遵循狀態、法律責任、信用狀態、投資訊號、黑名單、土地使用法律意見、法律意見、財務建議或官方背書。最新與正式資訊請以主管機關正式公告及官方系統為準。' : 'This site organizes Taipei public-data records such as civic group directory records, performing-arts group registry records, labor union directory records, disability employment resource records, sheltered workshop directory records, environmental recycling organization records, licensed pawnshop directory records, licensed electronic game arcade operator records, licensed special entertainment business operator records, industry grant recipient records, biotech company directory records, Taipei Metro planned procurement tender schedules, registered cram-school records, registered hotel records, Taipei Travel accommodation records, Labor Standards Act violation publication records, Occupational Safety and Health Act violation publication records, Gender Equality in Employment Act violation publication records, consumer dispute absence notices, Nangang Software Park company records, Dawannan Industrial Area company directory records, animal hospital directory records, animal medicine seller records, veterinarian professional registry records, quasi-public infant care center records, infant care center evaluation result records, elderly welfare institution directory records, contracted vaccination medical provider records, publicly funded HPV vaccination provider records, child medical subsidy contracted provider records, denture subsidy medical provider records, telepsychology counseling institution records, business premises public liability insurance records, business establishment / modification / closure registration change records, company establishment / modification / dissolution registration change records, and related public records for data exploration and organization only. These datasets have different meanings and should not be interpreted as the same type of organization, activity, service availability, real-time operating status, medical advice, childcare or elderly care advice, employment placement guarantee, subsidy eligibility determination, consumer dispute status, public drop-off permission, pollution risk, loan advice, official ranking, legal compliance status, legal liability, credit status, investment signal, blacklist, land-use legal opinion, legal advice, financial advice, or official endorsement. Latest and official information should be verified with official authority notices and official systems.'}</blockquote>
        <div className="notes-grid"><article><h3>{t.method}</h3><p>{t.methodText}</p></article>
          <article><h3>{t.fields}</h3><p>機關代碼 → agencyCode<br />名稱 → name<br />地址 → address<br />電話 → phone<br />成立日期 → foundedDateRaw</p></article>
          <article><h3>{language === 'zh' ? '演藝團體名冊' : 'Performing-arts group registry'}</h3><p>{language === 'zh' ? '演藝團體名冊提供臺北市演藝團體登記名冊，欄位包含演藝團體名稱、申請類別、立案字號、主管機關、主管機關代碼、團址與網址。本網站將團址解析為行政區與道路名稱，並依申請類別、行政區、主管機關與網址有無整理統計。資料未提供官方經緯度，因此預設不顯示精確點位。' : 'The performing-arts group directory provides Taipei performing-arts group registry records. Fields include performing-arts group name, application category, registration number, competent authority, competent authority code, registered address, and website. This site parses registered addresses into district and road name and organizes statistics by application category, district, competent authority, and website availability. The data does not provide official coordinates, so exact points are not shown by default.'}</p></article>
          <article><h3>{language === 'zh' ? '預防接種合約醫療院所' : 'Contracted vaccination providers'}</h3><p>{language === 'zh' ? '資料提供臺北市合約院所名冊，欄位包含序號、行政區、院所名稱、各項預防接種服務欄位、地址、電話與語音預約。本網站將地址解析為行政區與道路名稱，並將各接種服務欄位轉換為篩選用服務項目。資料未提供官方經緯度，因此預設不顯示精確點位。' : 'The data provides Taipei contracted provider directory records with sequence number, district, provider name, vaccination service fields, address, phone, and voice reservation. This site parses addresses into district and road name and converts vaccination service fields into filterable service items. The data does not provide official coordinates, so exact points are not shown by default.'}</p></article>
          <article><h3>{language === 'zh' ? '公費HPV疫苗特約醫療院所' : 'Publicly funded HPV vaccination providers'}</h3><p>{language === 'zh' ? '資料提供臺北市公費HPV疫苗接種服務特約醫療院所名冊，欄位包含項次、行政區代碼、醫療院所名稱、地址與聯絡電話。本網站將行政區代碼對應為臺北市行政區名稱，並從地址解析行政區與道路名稱。資料未提供官方經緯度，因此僅以行政區彙總呈現，不代表即時門診時間、預約名額、疫苗庫存、接種資格或醫療建議。' : 'The data provides Taipei publicly funded HPV vaccination provider records with sequence number, district code, provider name, address, and phone. This site maps district codes to Taipei district names and parses address district and road name. The data provides no official coordinates, so it is shown as district summaries only and does not represent real-time clinic hours, appointment availability, vaccine stock, eligibility, or medical advice.'}</p></article>
          <article><h3>{language === 'zh' ? '兒童醫療補助特約院所名冊' : 'Child medical subsidy contracted providers'}</h3><p>{language === 'zh' ? '資料提供臺北市兒童醫療補助特約醫療院所公開資料，欄位包含編號、院所代碼、診所名稱、行政區、地址與電話。本網站保留來源行政區欄位，並從地址解析臺北市行政區與道路名稱，整理為行政區分布與院所清單。資料未提供官方經緯度，因此預設不顯示精確點位，也不代表即時門診時間、即時預約名額、補助資格判定、補助金額、費用標準、醫療建議、兒科就醫建議、服務品質排名、急診或緊急醫療服務、即時營運狀態或官方背書。' : 'Child medical subsidy contracted provider data provides Taipei public records for medical institutions contracted for child medical subsidy services. Fields include sequence number, provider code, clinic name, administrative area, address, and phone. This site preserves the source administrative area field, parses Taipei districts and road names from addresses, and organizes the data into district distribution and a provider directory. The data does not provide official coordinates, so exact points are not shown by default. It does not represent real-time clinic hours, appointment availability, subsidy eligibility, subsidy amount, fees, medical advice, pediatric care advice, service quality ranking, emergency medical service, real-time operating status, or official endorsement.'}</p></article>
          <article><h3>{language === 'zh' ? '假牙補助醫療院所名單' : 'Denture subsidy medical providers'}</h3><p>{language === 'zh' ? '資料提供臺北市假牙補助相關醫療院所公開資料，欄位包含補助類型、區域、院所名稱、地址與連絡電話。本網站保留來源區域欄位，並從地址解析臺北市行政區與道路名稱，整理為行政區分布與院所清單。資料未提供官方經緯度，因此預設不顯示精確點位，也不代表即時門診時間、即時預約名額、補助資格判定、補助金額、費用標準、牙科治療建議、醫療建議、服務品質排名、急診或緊急醫療服務、即時營運狀態或官方背書。' : 'Denture subsidy medical provider data provides Taipei public records for medical institutions related to denture subsidy services. Fields include subsidy type, area, medical institution name, address, and contact phone. This site preserves the source area field, parses Taipei districts and road names from addresses, and organizes the data into district distribution and a provider directory. The data does not provide official coordinates, so exact points are not shown by default. It does not represent real-time clinic hours, appointment availability, subsidy eligibility, subsidy amount, fees, dental treatment advice, medical advice, service quality ranking, emergency dental or medical service, real-time operating status, or official endorsement.'}</p></article>
          <article><h3>{language === 'zh' ? '身障就業資源地圖' : 'Disability employment resource map'}</h3><p>{language === 'zh' ? '資料提供臺北市身心障礙者就業與職業重建相關資源公開資料，欄位包含SEQNO、Year、name、type、business item、contact、address與telephone。本網站保留來源欄位，並從地址解析臺北市行政區與道路名稱，整理為行政區分布、業務項目、服務類別與資源清單。資料未提供官方經緯度，因此預設不顯示精確點位，也不代表即時服務名額、職缺資訊、就業媒合保證、補助或福利資格判定、職業重建評估、身心障礙鑑定、醫療建議、法律意見、服務品質排名、無障礙認證、法規遵循狀態或官方背書。' : 'Disability employment resource map data provides Taipei public records of disability employment and vocational rehabilitation resources. Fields include SEQNO, Year, name, type, business item, contact, address, and telephone. This site preserves the source fields, parses Taipei districts and road names from addresses, and organizes the data into district distribution, business items, service categories, and a resource directory. The data does not provide official coordinates, so exact points are not shown by default. It does not represent real-time service capacity, job vacancies, employment placement guarantees, subsidy or welfare eligibility determination, vocational rehabilitation assessment, disability assessment, medical advice, legal advice, service quality ranking, accessibility certification, legal compliance status, or official endorsement.'}</p></article>
          <article><h3>{language === 'zh' ? '庇護工場名冊' : 'Sheltered workshop directory'}</h3><p>{language === 'zh' ? '資料提供臺北市庇護工場公開名冊，欄位包含編號、年度、工場名稱、營業項目、聯絡人、地址、電話與統一編號。本網站保留來源欄位，解析民國年度、臺北市行政區與道路名稱，並依營業項目產生輔助分類。資料未提供官方經緯度，因此不做地理編碼、不顯示精確點位或附近功能；僅以行政區彙總呈現並提供外部地圖查詢。此資料不代表職缺、即時服務量能、安置保證、補助或福利資格、職業重建或身障鑑定、品質排名、無障礙認證、法規遵循、採購或消費建議、醫療或法律意見、官方背書。' : 'Sheltered workshop directory data provides Taipei public records with sequence number, year, workshop name, business item, contact, address, phone, and unified business number. This site preserves source fields, parses ROC years, Taipei districts and road names, and derives helper categories from business items. The data provides no official coordinates, so this module performs no geocoding, shows no exact points or near-me feature, and only presents district summaries plus external map lookup. It does not represent vacancies, real-time capacity, placement guarantees, subsidy or welfare eligibility, vocational rehabilitation or disability assessment, quality ranking, accessibility certification, legal compliance, procurement or consumption recommendation, medical/legal advice, or endorsement.'}</p></article>
          <article><h3>{language === 'zh' ? '回收業機構名冊' : 'Registered recycling business organizations'}</h3><p>{language === 'zh' ? '資料提供臺北市回收業之相關公開資料，欄位包含序號、機構名稱、統一編號、負責人、電話、手機、聯絡人、回收貯存場所地址、應回收廢棄物回收項目與一般廢棄物回收項目。本網站保留來源欄位，並整理為行政區分布、回收項目、機構清單與環保回收機構目錄資料探索。資料未提供官方經緯度，因此不顯示官方精確點位，也不代表即時營業狀態、即時服務可用性、可收受項目保證、可公開投放、清運預約、污染風險、違規紀錄、法規遵循保證、消費建議或官方推薦。' : 'Recycling business organization records provide public information about recycling businesses in Taipei. Fields include sequence number, organization name, business registration number, responsible person, phone, mobile phone, contact person, recycling storage site address, regulated recyclable items, and general waste recycling items. This site preserves source fields and organizes the data into district distribution, recycling items, organization directory, and environmental / recycling organization directory data exploration. The data has no official coordinates, so exact points are not shown and it does not represent real-time operating status, service availability, accepted-item guarantee, public drop-off permission, waste pickup booking, pollution risk, violation record, compliance guarantee, consumer advice, or official recommendation.'}</p></article>
          <article><h3>{language === 'zh' ? '當舖業資料清冊' : 'Licensed pawnshop directory'}</h3><p>{language === 'zh' ? '資料提供臺北市政府警察局合法當舖業資料，欄位包含序號、許可證號、當舖名稱、營業地址與縣市。本網站保留來源欄位，並從營業地址解析臺北市行政區與道路名稱，整理為行政區分布、許可證號與當舖清單。資料未提供官方經緯度，因此預設不顯示精確點位，也不代表即時營業狀態、消費糾紛紀錄、違法紀錄、執法案件、信用評等、貸款建議、投資建議、金融建議、法律意見、服務品質排名、官方推薦或官方背書。' : 'Licensed pawnshop directory data provides Taipei City Police Department legal pawnshop records. Fields include sequence number, license number, pawnshop name, business address, and city/county. This site preserves the source fields, parses Taipei districts and road names from business addresses, and organizes the data into district distribution, license numbers, and a pawnshop directory. The data does not provide official coordinates, so exact points are not shown by default. It does not represent real-time operating status, consumer dispute records, violation records, law enforcement cases, credit ratings, loan advice, investment advice, financial advice, legal advice, service quality ranking, official recommendation, or endorsement.'}</p></article>
          <article><h3>{language === 'zh' ? '合法電子遊戲場業者清冊' : 'Licensed electronic game arcade operators'}</h3><p>{language === 'zh' ? '資料提供臺北市合法登記電子遊戲場業者公開資料，欄位包含序號、公司或商業名稱、統一編號、行政區、營業場所地址與備註。本網站保留來源欄位，以行政區彙總、地址清單與外部地圖查詢呈現；資料未提供官方經緯度，因此不顯示官方精確點位，也不代表即時營業狀態、營業時間、入場資格、年齡限制判定、消費建議、遊戲內容評價、治安風險、違規紀錄、法律意見或官方推薦。' : 'The data provides Taipei public records of legally registered electronic game arcade operators. Fields include sequence number, company or business name, business registration number, district, business premises address, and notes. This site preserves source fields and shows district summaries, address lists, and external map lookup links. The data has no official coordinates, so it does not show official exact points and does not represent real-time operating status, opening hours, admission eligibility, age-restriction determination, consumer advice, game content evaluation, public-safety risk, violation record, legal advice, or official recommendation.'}</p></article>
          <article><h3>{language === 'zh' ? '合法八大行業業者清冊' : 'Licensed special entertainment business operators'}</h3><p>{language === 'zh' ? '資料提供臺北市合法八大行業業者公開資料，欄位包含序號、公司商業名稱、統一編號、負責人、經營行業、行政區、營業場所地址、Longitude 與 Latitude。本網站保留來源欄位，並使用有效官方座標呈現地圖；同一座標的多筆紀錄會合併顯示。本資料不代表即時營業狀態、營業時間、入場資格、年齡限制判定、消費建議、違規紀錄、法律意見或官方推薦。' : 'The data provides Taipei public records of licensed special entertainment business operators. Fields include sequence number, company or business name, business registration number, responsible person, operating industry, district, business premises address, Longitude, and Latitude. This site preserves source fields and uses valid official coordinates for the map; records sharing a coordinate are grouped. This data does not represent real-time operating status, opening hours, admission eligibility, age-restriction determination, consumer advice, violation record, legal advice, or official recommendation.'}</p></article>
          <article><h3>{language === 'zh' ? '可執行通訊心理諮商之心理機構' : 'Telepsychology counseling institutions'}</h3><p>{language === 'zh' ? '資料提供臺北市可執行通訊心理諮商業務之心理治療所、諮商所、基金會與學校名冊，欄位包含序號、機構類型、行政區、機構名稱、地址、電話、分機與手機。本網站解析行政區與道路名稱，並整理機構類型與聯絡欄位。資料未提供官方經緯度，因此預設不顯示精確點位，也不作醫療建議、心理治療建議、危機服務、預約、收費、保險、推薦或品質判斷。' : 'The data provides Taipei records for psychological treatment clinics, counseling clinics, foundations, and schools permitted to perform communication-based psychological counseling. Fields include sequence number, institution type, district, institution name, address, phone, extension, and mobile. This site parses district and road name and organizes institution type and contact fields. It has no official coordinates, so exact points are not shown, and the site does not provide medical advice, psychotherapy advice, crisis service, appointment, fee, insurance, recommendation, or quality judgments.'}</p></article>
          <article><h3>{language === 'zh' ? '營業場所投保公共意外險清冊' : 'Business premises public liability insurance records'}</h3><p>{language === 'zh' ? '資料提供臺北市公司／商業登記投保公共意外責任險公開資料，欄位包含序號、統一立案編號、類別、名稱、營業地址、保單到期日、經度與緯度。本網站依來源座標顯示點位，並依營業地址解析行政區與道路名稱。到期狀態僅依來源保單到期日與資料建置日期計算，不代表即時投保狀態、法規遵循判定、場所安全保證、法律意見或保險建議。' : 'Business premises public liability insurance records provide Taipei public-data records for company / business registration public accident liability insurance information. Fields include sequence number, registration number, category, name, business address, policy expiry date, longitude, and latitude. This site displays source-coordinate points and parses business addresses into district and road name. Expiry status is calculated only from the source policy expiry date and data build date; it is not real-time insurance status, legal compliance determination, venue safety guarantee, legal advice, or insurance advice.'}</p></article>
          <article><h3>{language === 'zh' ? '商業設立、變更及歇業登記異動資料' : 'Business registration change records'}</h3><p>{language === 'zh' ? '資料提供臺北市商業設立、變更與歇業登記異動清冊，欄位包含統一編號、商業名稱、商業地址、異動日期、經度與緯度。本網站依來源座標顯示點位，並依地址解析行政區與道路名稱。異動事件不代表目前營業狀態、商業信用、法規遵循、投資價值、法律意見或財務意見。' : 'Business registration change records provide Taipei establishment, modification, and closure registration change events. Fields include business number, business name, address, event date, longitude, and latitude. This site displays source-coordinate points and parses addresses into district and road name. Change events do not represent current operating status, creditworthiness, legal compliance, investment value, legal advice, or financial advice.'}</p></article>
          <article><h3>{language === 'zh' ? '公司設立、變更及解散登記異動資料' : 'Company registration change records'}</h3><p>{language === 'zh' ? '資料提供臺北市核准公司登記異動資料，來源分為設立、變更與解散等CSV資源，欄位包含統一編號、公司名稱、公司地址、核准日期、核准變更日期、核准解散日期、經度與緯度。本網站依來源檔案判斷異動類型，並依來源座標顯示點位、依地址解析行政區與道路名稱。' : 'Company establishment, modification, and dissolution registration change records provide Taipei approved company registration change data. Source resources are separated into establishment, modification, and dissolution CSV files. Fields include unified business number, company name, company address, approval date, modification approval date, dissolution approval date, longitude, and latitude. This site determines the change type from the source resource, displays source-coordinate points, and parses addresses into district and road name.'}</p></article>
          <article><h3>{language === 'zh' ? '工會名單資料' : 'Registered labor union data'}</h3><p>{language === 'zh' ? '來源為 CP950/Big5 CSV，欄位包含工會屬性、工會名稱、理事長、郵遞區號、通訊地址與聯絡電話。資料未提供經緯度，因此僅以臺北市行政區中心點呈現彙總；理事長姓名只在來源明細中呈現。' : 'The source is a CP950/Big5 CSV with union type, union name, chairperson, postal code, contact address, and phone fields. It provides no coordinates, so Taipei records are shown only as district-centroid summaries; chairperson names appear only in source details.'}</p></article>
          <article><h3>{language === 'zh' ? '產業補助資料' : 'Industry grant data'}</h3><p>{language === 'zh' ? '來源包含負責人姓名欄位；本網站預設不在卡片中顯示。日期由民國年轉換，金額以新臺幣解析。' : 'The source includes responsible-person names; this site does not display them in default cards. ROC dates are converted and amounts are parsed as NTD.'}</p></article>
          <article><h3>{language === 'zh' ? '生技廠商企業名錄' : 'Biotech company directory'}</h3><p>{language === 'zh' ? '資料提供臺北市生技相關廠商公開資料，欄位包含單位名稱、統一編號、負責人、登記地址、公司電話、產業範疇與來源座標。本網站將來源座標偵測為 TWD97 / EPSG:3826 格式並轉換為 WGS84 後顯示於地圖。此資料不代表完整產業登記、即時營業狀態、產品許可、公司品質、投資價值、信用評等、法規遵循或官方背書。' : 'The data provides Taipei public records for biotech-related companies, including company name, unified business number, responsible person, registered address, company phone, industry category, and source coordinates. This site detects TWD97 / EPSG:3826-style coordinates and converts them to WGS84 for map display. This data does not represent a complete industry registry, real-time operating status, product approval, company quality, investment value, credit rating, legal compliance, or official endorsement.'}</p></article>
          <article><h3>{language === 'zh' ? '捷運採購時程' : 'Metro procurement schedule'}</h3><p>{language === 'zh' ? '資料為每月公布的預定招標排程。「預算金額」原始欄位會完整保留；僅在內容可辨識時衍生招標方式，且不建立地圖點位。' : 'The data is a monthly planned tender schedule. The raw “budget amount” field is preserved, tender method is derived only when recognizable, and no map points are created.'}</p></article>
          <article><h3>{language === 'zh' ? '立案補習班資料' : 'Registered cram-school data'}</h3><p>{language === 'zh' ? '資料未提供經緯度，因此以行政區彙總與清單呈現，並透過地址提供地圖查詢連結。' : 'The data does not provide coordinates, so this site presents district-level summaries and directory records, with map lookup links based on addresses.'}</p></article>
          <article><h3>{language === 'zh' ? '一般旅館名冊' : 'Registered hotel data'}</h3><p>{language === 'zh' ? '資料未提供經緯度，因此以行政區彙總與地址型名冊呈現。客房定價欄位為公開登記欄位，不是即時房價或訂房價格。' : 'The data does not provide coordinates, so this site presents district-level summaries and an address-based directory. Room-rate fields are public registry fields, not real-time room prices or booking prices.'}</p></article>
          <article><h3>{language === 'zh' ? '臺北旅遊網住宿資料' : 'Taipei Travel accommodation data'}</h3><p>{language === 'zh' ? '資料提供中文旅遊住宿名錄，欄位包含旅館類別、旅宿名稱、地址、電話或手機號碼、傳真與房間數。資料未提供官方經緯度，因此以行政區彙總與地址型清單呈現，不作訂房、房價、空房、推薦或品質保證。' : 'The data provides Chinese tourism accommodation directory records with category, name, address, phone/mobile, fax, and room count. It has no official coordinates, so this site shows district summaries and an address-based directory, not booking, pricing, vacancy, recommendation, or quality guarantees.'}</p></article>
          <article><h3>{language === 'zh' ? '勞基法違規公布紀錄' : 'Labor violation publication records'}</h3><p>{language === 'zh' ? '資料未提供地址或經緯度，因此不建立地圖點位。民國日期會轉為西元日期；負責人姓名僅在來源明細中呈現，不作個人排名或評價。' : 'The data provides no addresses or coordinates, so it has no map layer. ROC dates are converted to Gregorian dates; responsible-person names appear only in source details and are not ranked or evaluated.'}</p></article>
          <article><h3>{language === 'zh' ? '性別平等工作法違規公布紀錄' : 'Gender Equality in Employment Act violation records'}</h3><p>{language === 'zh' ? '資料未提供地址、行政區或經緯度，因此不建立地圖點位。民國日期會轉為西元日期；事業單位、自然人與代表人姓名僅作來源欄位查詢與統計整理，不作個人排名、評價、歧視風險評分或商工登記自動比對。' : 'The data provides no address, district, or coordinates, so it has no map layer. ROC dates are converted to Gregorian dates; business, natural-person, and representative names are retained for source lookup and summaries only, not personal ranking, evaluation, discrimination-risk scoring, or automatic business/company matching.'}</p></article>
          <article><h3>{language === 'zh' ? '消費爭議不到場公告' : 'Consumer dispute absence notices'}</h3><p>{language === 'zh' ? '資料提供臺北市依消費者保護自治條例公告之消費爭議協商無故不到場被申訴企業經營者公開紀錄，欄位包含年度、被申訴人、申訴人、協商日與爭議內容。本網站不建立地圖點位，也不自動連結公司或商業登記資料。' : 'The data provides Taipei public notice records for respondent business operators absent from consumer-dispute negotiation without cause. Fields include year, respondent, complainant, negotiation date, and dispute content. This site creates no map points and does not automatically link company or business registration records.'}</p></article>
          <article><h3>{language === 'zh' ? '南港軟體工業園區廠商' : 'Nangang Software Park companies'}</h3><p>{language === 'zh' ? '來源欄位名稱為經度與緯度，但資料型態接近 TWD97；系統會判斷座標型態並轉換為 WGS84。園區廠商名錄不代表即時營運或進駐狀態。' : 'Source coordinate values resemble TWD97, so the app detects the type and converts them to WGS84. The directory does not represent real-time operating or tenancy status.'}</p></article>
          <article><h3>{language === 'zh' ? '大彎南段工業區廠商名錄' : 'Dawannan Industrial Area company directory'}</h3><p>{language === 'zh' ? '資料提供統編、公司名稱、公司地址、ADDR_X與ADDR_Y。本網站保留來源欄位，解析郵遞區號、行政區與道路名稱，並將ADDR_X與ADDR_Y視為投影座標，使用TWD97 TM2 121假設轉換為WGS84後才顯示地圖點位。本資料不代表即時營業狀態、完整公司登記資訊、信用評等、投資、採購、就業、法規遵循、土地使用法律意見或官方背書。' : 'The data provides unified business number, company name, company address, ADDR_X, and ADDR_Y. This site preserves source fields, parses postal code, district, and road name, and treats ADDR_X/ADDR_Y as projected coordinates, converting them under a TWD97 TM2 121 assumption before showing map points. This data does not represent real-time operating status, complete company registration information, credit rating, investment, procurement, employment, compliance, land-use legal opinion, or endorsement.'}</p></article>
          <article><h3>{language === 'zh' ? '動物醫院一覽表' : 'Animal hospital directory'}</h3><p>{language === 'zh' ? '資料未提供經緯度，因此以行政區彙總與清單呈現。負責人姓名為來源資料欄位，僅於明細中呈現，不作個人排名或評價。' : 'The data provides no coordinates, so this site presents district summaries and a directory. Responsible person name is a source field shown only in details, not ranked or evaluated.'}</p></article>
          <article><h3>{language === 'zh' ? '準公共化托嬰中心' : 'Quasi-public infant care centers'}</h3><p>{language === 'zh' ? '資料未提供經緯度，因此以行政區彙總與清單呈現。表列收托差額由核定收托人數與實際收托人數衍生，不是即時可收托名額。' : 'The data provides no coordinates, so this site presents district summaries and a directory. Listed capacity gap is derived from approved capacity and actual enrollment; it is not real-time vacancy.'}</p></article>
          <article><h3>{language === 'zh' ? '托嬰中心評鑑結果' : 'Infant care center evaluation results'}</h3><p>{language === 'zh' ? '資料為各托嬰中心年度評鑑結果。本網站將寬表年度欄位轉為逐年紀錄，保留未評鑑年份與特殊備註，並以行政區彙總呈現。資料未提供地址或官方經緯度，因此不建立精確點位，也不自動與準公共化托嬰中心名冊合併；可能相同名稱僅作比對提示。評鑑資料不代表即時營運狀態、收托名額、費用、違規裁罰、官方排名、照顧建議或背書。' : 'The data provides yearly evaluation results for infant care centers. This site converts wide year columns into yearly records, preserves non-evaluated years and special notes, and presents district-level summaries. The data has no address or official coordinates, so no exact points are created and it is not automatically merged with the quasi-public infant care center directory; possible same-name records are only comparison hints. Evaluation data does not represent real-time operating status, vacancies, fees, violations, penalties, official ranking, care advice, or endorsement.'}</p></article>
          <article><h3>{language === 'zh' ? '老人福利機構名冊' : 'Elderly welfare institutions'}</h3><p>{language === 'zh' ? '資料未提供經緯度，因此以行政區彙總與清單呈現，並透過地址提供外部地圖查詢連結。床位欄位為來源名冊中的核定床位分類，不是即時空床、收住資格、收費標準、補助資格、照護品質、推薦排名、醫療建議或長照建議。' : 'The data provides no coordinates, so this site presents district summaries and a directory, with external map lookup links based on addresses. Bed-count fields are approved bed categories from the source directory; they are not real-time vacancies, admission eligibility, fees, subsidy eligibility, care quality, recommendation ranking, medical advice, or long-term care advice.'}</p></article>
          <article><h3>{t.source}</h3><p><a href="https://data.taipei/dataset/detail?id=72417af0-7dec-4fad-b762-5f2baafcf084" target="_blank" rel="noreferrer">臺北市人民團體名冊 ↗</a><br /><a href="https://data.taipei/dataset/detail?id=f56e77c6-cc69-480c-8ba4-057fc7e1d8d6" target="_blank" rel="noreferrer">臺北市演藝團體名冊 ↗</a><br /><a href="https://data.taipei/dataset/detail?id=ec201f0a-2efa-4426-9439-a8daea7b33c7" target="_blank" rel="noreferrer">臺北市各項預防接種合約醫療院所 ↗</a><br /><a href="https://data.taipei/dataset/detail?id=96f143fe-4c95-4d88-9985-77f28e2d2c3d" target="_blank" rel="noreferrer">臺北市公費HPV疫苗特約醫療院所 ↗</a><br /><a href="https://data.taipei/dataset/detail?id=3cc250f5-9f5a-4670-ac7b-f13ecd316032" target="_blank" rel="noreferrer">臺北市兒童醫療補助特約院所名冊 ↗</a><br /><a href="https://data.taipei/dataset/detail?id=76b8b514-e793-4cca-8dcf-065d5af4b760" target="_blank" rel="noreferrer">臺北市假牙補助醫療院所名單 ↗</a><br /><a href="https://data.taipei/dataset/detail?id=c5aafda8-ef14-4f66-a6b7-d5da995a14b5" target="_blank" rel="noreferrer">臺北市身障就業資源地圖 ↗</a><br /><a href="https://data.taipei/dataset/detail?id=fb88e4fd-c287-4fbb-91ab-0ed1fbeaf28c" target="_blank" rel="noreferrer">臺北市庇護工場名冊 ↗</a><br /><a href="https://data.taipei/dataset/detail?id=49a8e600-313d-48ba-b35f-5ff093d4cff1" target="_blank" rel="noreferrer">臺北市回收業機構名冊 ↗</a><br /><a href="https://data.taipei/dataset/detail?id=024da777-25b0-4bee-b1b9-2f8ceb8bd68a" target="_blank" rel="noreferrer">臺北市政府警察局當舖業資料清冊 ↗</a><br /><a href="https://data.taipei/dataset/detail?id=20774fbb-5671-4850-b307-af6b5976077d" target="_blank" rel="noreferrer">臺北市合法電子遊戲場業者清冊 ↗</a><br /><a href="https://data.taipei/dataset/detail?id=dd0548f2-0372-4e4f-8c74-9a4121f27d35" target="_blank" rel="noreferrer">臺北市合法八大行業業者清冊 ↗</a><br /><a href="https://data.taipei/dataset/detail?id=428a78d5-867a-4e55-9630-040a89c8cd94" target="_blank" rel="noreferrer">臺北市可執行通訊心理諮商之心理機構 ↗</a><br /><a href="https://data.taipei/dataset/detail?id=5880bb98-ab6a-476c-ae55-37564b0d0fc9" target="_blank" rel="noreferrer">臺北市營業場所投保公共意外險清冊 ↗</a><br /><a href="https://data.taipei/dataset/detail?id=5fdefcca-e0a6-41bc-a520-7c8f067caad3" target="_blank" rel="noreferrer">臺北市核准商業設立、變更及歇業登記等異動資料清冊 ↗</a><br /><a href="https://data.taipei/dataset/detail?id=0a1f284d-e985-4c39-b0b5-53389fbfa6e9" target="_blank" rel="noreferrer">臺北市核准公司設立變更解散清冊 ↗</a><br /><a href="https://data.taipei/dataset/detail?id=bea69229-8349-4208-8a68-988718f4ea48" target="_blank" rel="noreferrer">臺北市各工會名單及聯絡方式 ↗</a><br /><a href="https://data.taipei/dataset/detail?id=3e78bffa-3fa3-46d5-a632-df99447de695" target="_blank" rel="noreferrer">臺北市產業補助廠商資料 ↗</a><br /><a href="https://data.taipei/dataset/detail?id=a05ee8ee-d7f1-4024-86c1-e2f97f2120bf" target="_blank" rel="noreferrer">臺北市生技廠商企業名錄 ↗</a><br /><a href="https://data.taipei/dataset/detail?id=f4fd7f03-9bf6-41de-a003-02c437596570" target="_blank" rel="noreferrer">臺北捷運公司採購案件預定招標時程資訊 ↗</a><br /><a href="https://data.taipei/dataset/detail?id=b124a967-fc88-4c45-bea8-41b4ef158a15" target="_blank" rel="noreferrer">臺北市立案補習班資訊 ↗</a><br /><a href="https://data.taipei/dataset/detail?id=4d7d0b46-2e90-4ee7-b000-c0f2f3a37651" target="_blank" rel="noreferrer">臺北市一般旅館名冊 ↗</a><br /><a href="https://data.taipei/dataset/detail?id=58093ba6-4c98-4148-b27a-50ad97d7afca" target="_blank" rel="noreferrer">臺北市臺北旅遊網住宿資料(中文) ↗</a><br /><a href="https://data.taipei/dataset/detail?id=23630879-4926-4877-a48a-a0ae6cc2f7d5" target="_blank" rel="noreferrer">臺北市勞基法違規公布紀錄 ↗</a><br /><a href="https://data.taipei/dataset/detail?id=3e2ad23f-21fa-4084-a4de-4fd7f5293550" target="_blank" rel="noreferrer">臺北市職安法違規公布紀錄 ↗</a><br /><a href="https://data.taipei/dataset/detail?id=12f3421a-94f4-4a5e-8642-143dee2fa551" target="_blank" rel="noreferrer">臺北市性別平等工作法違規公布紀錄 ↗</a><br /><a href="https://data.taipei/dataset/detail?id=c15e49fd-f511-46c8-8613-0ad91f370bfd" target="_blank" rel="noreferrer">臺北市消費爭議無故不到場協商之被申訴企業經營者列表 ↗</a><br /><a href="https://data.taipei/dataset/detail?id=01bcb5ee-7c18-41fa-86d4-4e75daee1f94" target="_blank" rel="noreferrer">臺北市動物醫院一覽表 ↗</a><br /><a href="https://data.taipei/dataset/detail?id=aeaaa517-089c-42a7-ad5b-60fef89c3545" target="_blank" rel="noreferrer">臺北市準公共化托嬰中心 ↗</a><br /><a href="https://data.taipei/dataset/detail?id=e7b45593-9d44-469c-97fa-f1a52c69ebaa" target="_blank" rel="noreferrer">臺北市托嬰中心評鑑結果 ↗</a><br /><a href="https://data.taipei/dataset/detail?id=d455b149-1a2f-4d5a-a9a8-315eb71f51f6" target="_blank" rel="noreferrer">臺北市老人福利機構名冊 ↗</a></p>
            <p>{t.updated}: {report.convertedAt ? new Date(report.convertedAt).toLocaleString(language === 'zh' ? 'zh-TW' : 'en') : '—'}<br />{report.performingArtsGroups?.convertedAt ? new Date(report.performingArtsGroups.convertedAt).toLocaleString(language === 'zh' ? 'zh-TW' : 'en') : '—'}<br />{report.contractedVaccinationMedicalProviders?.convertedAt ? new Date(report.contractedVaccinationMedicalProviders.convertedAt).toLocaleString(language === 'zh' ? 'zh-TW' : 'en') : '—'}<br />{report.publiclyFundedHpvVaccinationProviders?.convertedAt ? new Date(report.publiclyFundedHpvVaccinationProviders.convertedAt).toLocaleString(language === 'zh' ? 'zh-TW' : 'en') : '—'}<br />{report.childMedicalSubsidyContractedProviders?.convertedAt ? new Date(report.childMedicalSubsidyContractedProviders.convertedAt).toLocaleString(language === 'zh' ? 'zh-TW' : 'en') : '—'}<br />{report.dentureSubsidyMedicalProviders?.convertedAt ? new Date(report.dentureSubsidyMedicalProviders.convertedAt).toLocaleString(language === 'zh' ? 'zh-TW' : 'en') : '—'}<br />{report.telepsychologyCounselingInstitutions?.convertedAt ? new Date(report.telepsychologyCounselingInstitutions.convertedAt).toLocaleString(language === 'zh' ? 'zh-TW' : 'en') : '—'}<br />{report.businessPremisesPublicLiabilityInsuranceRecords?.convertedAt ? new Date(report.businessPremisesPublicLiabilityInsuranceRecords.convertedAt).toLocaleString(language === 'zh' ? 'zh-TW' : 'en') : '—'}<br />{report.businessRegistrationChangeRecords?.convertedAt ? new Date(report.businessRegistrationChangeRecords.convertedAt).toLocaleString(language === 'zh' ? 'zh-TW' : 'en') : '—'}<br />{report.companyRegistrationChangeRecords?.convertedAt ? new Date(report.companyRegistrationChangeRecords.convertedAt).toLocaleString(language === 'zh' ? 'zh-TW' : 'en') : '—'}<br />{report.registeredLaborUnions?.convertedAt ? new Date(report.registeredLaborUnions.convertedAt).toLocaleString(language === 'zh' ? 'zh-TW' : 'en') : '—'}<br />{report.quasiPublicInfantCareCenters?.convertedAt ? new Date(report.quasiPublicInfantCareCenters.convertedAt).toLocaleString(language === 'zh' ? 'zh-TW' : 'en') : '—'}<br />{report.infantCareCenterEvaluationResults?.convertedAt ? new Date(report.infantCareCenterEvaluationResults.convertedAt).toLocaleString(language === 'zh' ? 'zh-TW' : 'en') : '—'}<br />{report.elderlyWelfareInstitutions?.convertedAt ? new Date(report.elderlyWelfareInstitutions.convertedAt).toLocaleString(language === 'zh' ? 'zh-TW' : 'en') : '—'}<br />{report.biotechCompanyDirectory?.convertedAt ? new Date(report.biotechCompanyDirectory.convertedAt).toLocaleString(language === 'zh' ? 'zh-TW' : 'en') : '—'}<br />{report.taipeiTravelAccommodationsZh?.convertedAt ? new Date(report.taipeiTravelAccommodationsZh.convertedAt).toLocaleString(language === 'zh' ? 'zh-TW' : 'en') : '—'}<br />{report.industryGrantRecipients?.convertedAt ? new Date(report.industryGrantRecipients.convertedAt).toLocaleString(language === 'zh' ? 'zh-TW' : 'en') : '—'}<br />{report.metroProcurementSchedules?.convertedAt ? new Date(report.metroProcurementSchedules.convertedAt).toLocaleString(language === 'zh' ? 'zh-TW' : 'en') : '—'}<br />{report.registeredCramSchools?.convertedAt ? new Date(report.registeredCramSchools.convertedAt).toLocaleString(language === 'zh' ? 'zh-TW' : 'en') : '—'}<br />{report.registeredHotels?.convertedAt ? new Date(report.registeredHotels.convertedAt).toLocaleString(language === 'zh' ? 'zh-TW' : 'en') : '—'}<br />{report.laborStandardActViolationRecords?.convertedAt ? new Date(report.laborStandardActViolationRecords.convertedAt).toLocaleString(language === 'zh' ? 'zh-TW' : 'en') : '—'}<br />{report.consumerDisputeAbsentBusinessOperators?.convertedAt ? new Date(report.consumerDisputeAbsentBusinessOperators.convertedAt).toLocaleString(language === 'zh' ? 'zh-TW' : 'en') : '—'}<br />{report.registeredAnimalHospitals?.convertedAt ? new Date(report.registeredAnimalHospitals.convertedAt).toLocaleString(language === 'zh' ? 'zh-TW' : 'en') : '—'}</p></article></div>
      </section>}
    </main>
    <footer>{t.footer}</footer>
  </div>;
}
