import ExplorerBoundary from './explorer/ExplorerBoundary';
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { copy, zhUiCopy, getCatalogueItems } from './lib/catalogueItems';
import DataTrustPanel from './DataTrustPanel';
import AccessibleTabs, { AccessibleTabPanel } from './AccessibleTabs';
import { buildDatasetCatalogue } from './lib/datasetCatalogue';
import { uiFamilyForDataset } from './lib/datasetUiFamily';
import { loadLocalJson } from './lib/loadLocalJson';
import { buildHistoryState, buildNavigationUrl, readNavigationState } from './lib/navigationState';
import {
  buildCivicGroupSummary, CATEGORIES, DISTRICTS, filterCivicGroups, formatFoundedDate, getCategoryLabel,
} from './lib/civicGroups';
import type {
  CivicGroup, CivicGroupFilters, CivicGroupSummary, IndustryGrantRecipient, IndustryGrantSummary, Language,
  MetroProcurementScheduleRecord, MetroProcurementScheduleSummary, RegisteredCramSchool, RegisteredCramSchoolSummary,
  RegisteredHotel, RegisteredHotelSummary, DawannanIndustrialAreaCompanyRecord, DawannanIndustrialAreaCompanySummary, GenderEqualityWorkActViolationRecord, GenderEqualityWorkActViolationSummary, LaborStandardActViolationManifest, LaborStandardActViolationSummary, NangangSoftwareParkCompany, NangangSoftwareParkCompanySummary, OccupationalSafetyHealthViolationRecord, OccupationalSafetyHealthViolationSummary,
  QuasiPublicInfantCareCenter, QuasiPublicInfantCareCenterSummary, RegisteredAnimalHospital, RegisteredAnimalHospitalSummary, RegisteredLaborUnion, RegisteredLaborUnionSummary, EnterpriseHeadquartersRecord, EnterpriseHeadquartersSummary, SpecificPetBusinessEvaluationRecord, SpecificPetBusinessEvaluationSummary, VeterinarianProfessionalRegistryRecord, VeterinarianProfessionalRegistrySummary,
  TaipeiTravelAccommodationZhRecord, TaipeiTravelAccommodationZhSummary, PerformingArtsGroupRecord, PerformingArtsGroupSummary,
  BiotechCompanyDirectoryRecord, BiotechCompanyDirectorySummary, BusinessPremisesPublicLiabilityInsuranceRecord, BusinessPremisesPublicLiabilityInsuranceSummary, BusinessRegistrationChangeRecord, BusinessRegistrationChangeSummary, CemeteryPublicFacilityRecord, CemeteryPublicFacilitySummary, ChildMedicalSubsidyContractedProviderRecord, ChildMedicalSubsidyContractedProviderSummary, CompanyRegistrationChangeRecord, CompanyRegistrationChangeSummary, ConsumerDisputeAbsentBusinessOperatorRecord, ConsumerDisputeAbsentBusinessOperatorSummary, ContractedVaccinationMedicalProviderRecord, ContractedVaccinationMedicalProviderSummary, DentureSubsidyMedicalProviderRecord, DentureSubsidyMedicalProviderSummary, DisabilityEmploymentResourceRecord, DisabilityEmploymentResourceSummary, ElderlyWelfareInstitutionRecord, ElderlyWelfareInstitutionSummary, EmploymentAgencyIntermediaryCompanyRecord, EmploymentAgencyIntermediaryCompanySummary, InfantCareCenterEvaluationInstitutionRecord, InfantCareCenterEvaluationSummary, InfantCareCenterEvaluationYearRecord, LicensedAnimalMedicineSellerRecord, LicensedAnimalMedicineSellerSummary, LicensedElectronicGameArcadeOperatorRecord, LicensedElectronicGameArcadeOperatorSummary, LicensedPawnshopDirectoryRecord, LicensedPawnshopDirectorySummary, LicensedSpecialEntertainmentBusinessOperatorRecord, LicensedSpecialEntertainmentBusinessOperatorSummary, PubliclyFundedHpvVaccinationProviderRecord, PubliclyFundedHpvVaccinationProviderSummary, RegisteredFactoryRecord, RegisteredFactorySummary, RegisteredRecyclingBusinessOrganizationRecord, RegisteredRecyclingBusinessOrganizationSummary, ShelteredWorkshopDirectoryRecord, ShelteredWorkshopDirectorySummary, TelepsychologyCounselingInstitutionRecord, TelepsychologyCounselingInstitutionSummary,
  EarlyInterventionMedicalProviderRecord, EarlyInterventionMedicalProviderSummary, GeneralDentalMedicalInstitutionRecord, GeneralDentalMedicalInstitutionSummary, MajorElectricityUserRecord, MajorElectricityUserSummary, PublicPneumococcalVaccineMedicalProviderRecord, PublicPneumococcalVaccineMedicalProviderSummary, SeniorGroupMealServiceSiteRecord, SeniorGroupMealServiceSiteSummary,
} from './types';

const CivicExplorer = lazy(() => import('./CivicExplorer'));
const CivicMap = lazy(() => import('./CivicMap'));
const DistrictComparison = lazy(() => import('./DistrictComparison'));
const RegisteredLaborUnionsModule = lazy(() => import('./RegisteredLaborUnionsModule'));
const QuasiPublicInfantCareCentersModule = lazy(() => import('./QuasiPublicInfantCareCentersModule'));
const InfantCareCenterEvaluationResultsModule = lazy(() => import('./InfantCareCenterEvaluationResultsModule'));
const TaipeiTravelAccommodationsZhModule = lazy(() => import('./TaipeiTravelAccommodationsZhModule'));
const PerformingArtsGroupsModule = lazy(() => import('./PerformingArtsGroupsModule'));
const ContractedVaccinationMedicalProvidersModule = lazy(() => import('./ContractedVaccinationMedicalProvidersModule'));
const ChildMedicalSubsidyContractedProvidersModule = lazy(() => import('./ChildMedicalSubsidyContractedProvidersModule'));
const DentureSubsidyMedicalProvidersModule = lazy(() => import('./DentureSubsidyMedicalProvidersModule'));
const DisabilityEmploymentResourceMapModule = lazy(() => import('./DisabilityEmploymentResourceMapModule'));
const ShelteredWorkshopDirectoryModule = lazy(() => import('./ShelteredWorkshopDirectoryModule'));
const EmploymentAgencyIntermediaryCompaniesModule = lazy(() => import('./EmploymentAgencyIntermediaryCompaniesModule'));
const LicensedPawnshopDirectoryModule = lazy(() => import('./LicensedPawnshopDirectoryModule'));
const LicensedElectronicGameArcadeOperatorsModule = lazy(() => import('./LicensedElectronicGameArcadeOperatorsModule'));
const LicensedSpecialEntertainmentBusinessOperatorsModule = lazy(() => import('./LicensedSpecialEntertainmentBusinessOperatorsModule'));
const RegisteredRecyclingBusinessOrganizationsModule = lazy(() => import('./RegisteredRecyclingBusinessOrganizationsModule'));
const RegisteredFactoryDistributionModule = lazy(() => import('./RegisteredFactoryDistributionModule'));
const CemeteryPublicFacilitiesModule = lazy(() => import('./CemeteryPublicFacilitiesModule'));
const TelepsychologyCounselingInstitutionsModule = lazy(() => import('./TelepsychologyCounselingInstitutionsModule'));
const BusinessPremisesPublicLiabilityInsuranceModule = lazy(() => import('./BusinessPremisesPublicLiabilityInsuranceModule'));
const BusinessRegistrationChangesModule = lazy(() => import('./BusinessRegistrationChangesModule'));
const CompanyRegistrationChangesModule = lazy(() => import('./CompanyRegistrationChangesModule'));
const ElderlyWelfareInstitutionsModule = lazy(() => import('./ElderlyWelfareInstitutionsModule'));
const SeniorGroupMealServiceSitesModule = lazy(() => import('./SeniorGroupMealServiceSitesModule'));
const BiotechCompanyDirectoryModule = lazy(() => import('./BiotechCompanyDirectoryModule'));
const IndustryModule = lazy(() => import('./IndustryModule'));
const MetroProcurementModule = lazy(() => import('./MetroProcurementModule'));
const RegisteredCramSchoolsModule = lazy(() => import('./RegisteredCramSchoolsModule'));
const RegisteredHotelsModule = lazy(() => import('./RegisteredHotelsModule'));
const LaborStandardActViolationsModule = lazy(() => import('./LaborStandardActViolationsModule'));
const OccupationalSafetyHealthViolationsModule = lazy(() => import('./OccupationalSafetyHealthViolationsModule'));
const GenderEqualityWorkActViolationsModule = lazy(() => import('./GenderEqualityWorkActViolationsModule'));
const ConsumerDisputeAbsentBusinessOperatorsModule = lazy(() => import('./ConsumerDisputeAbsentBusinessOperatorsModule'));
const NangangSoftwareParkCompaniesModule = lazy(() => import('./NangangSoftwareParkCompaniesModule'));
const DawannanIndustrialAreaCompaniesModule = lazy(() => import('./DawannanIndustrialAreaCompaniesModule'));
const EnterpriseHeadquartersDistributionModule = lazy(() => import('./EnterpriseHeadquartersDistributionModule'));
const RegisteredAnimalHospitalsModule = lazy(() => import('./RegisteredAnimalHospitalsModule'));
const LicensedAnimalMedicineSellersModule = lazy(() => import('./LicensedAnimalMedicineSellersModule'));
const SpecificPetBusinessEvaluationResultsModule = lazy(() => import('./SpecificPetBusinessEvaluationResultsModule'));
const VeterinarianProfessionalRegistryModule = lazy(() => import('./VeterinarianProfessionalRegistryModule'));
const PubliclyFundedHpvVaccinationProvidersModule = lazy(() => import('./PubliclyFundedHpvVaccinationProvidersModule'));
const PublicPneumococcalVaccineProvidersModule = lazy(() => import('./PublicPneumococcalVaccineProvidersModule'));
const MajorElectricityUsersModule = lazy(() => import('./MajorElectricityUsersModule'));
const EarlyInterventionMedicalProvidersModule = lazy(() => import('./EarlyInterventionMedicalProvidersModule'));
const GeneralDentalMedicalInstitutionsModule = lazy(() => import('./GeneralDentalMedicalInstitutionsModule'));
const PediatricMedicalInstitutionsModule = lazy(() => import('./PediatricMedicalInstitutionsModule'));
const DiabetesSharedCareMedicalInstitutionsModule = lazy(() => import('./DiabetesSharedCareMedicalInstitutionsModule'));
const GeneratedDatasetDirectoryModule = lazy(() => import('./GeneratedDatasetDirectoryModule'));
const ApprovedGasWaterHeaterInstallersModule = lazy(() => import('./ApprovedGasWaterHeaterInstallersModule'));
const VisuallyImpairedMassageEstablishmentsModule = lazy(() => import('./VisuallyImpairedMassageEstablishmentsModule'));
const CulturalArtsFoundationsModule = lazy(() => import('./CulturalArtsFoundationsModule'));
const PsychiatricRehabilitationAndNursingInstitutionsModule = lazy(() => import('./PsychiatricRehabilitationAndNursingInstitutionsModule'));
const TaipeiGovernmentApplicationServicesModule = lazy(() => import('./TaipeiGovernmentApplicationServicesModule'));
const SeniorServiceSiteCoursesModule = lazy(() => import('./SeniorServiceSiteCoursesModule'));
const RabiesVaccinationVeterinaryClinicsModule = lazy(() => import('./RabiesVaccinationVeterinaryClinicsModule'));
const FiveCancerScreeningProvidersModule = lazy(() => import('./FiveCancerScreeningProvidersModule'));
const FertilitySubsidyContractedHospitalsModule = lazy(() => import('./FertilitySubsidyContractedHospitalsModule'));
const SeniorCareInstitutionEvaluationsModule = lazy(() => import('./SeniorCareInstitutionEvaluationsModule'));
const WaterPipeInstallationContractorsModule = lazy(() => import('./WaterPipeInstallationContractorsModule'));
const PestControlBusinessesModule = lazy(() => import('./PestControlBusinessesModule'));
const AdultInfluenzaVaccineProvidersModule = lazy(() => import('./AdultInfluenzaVaccineProvidersModule'));
const LicensedWasteCookingOilCollectorsModule = lazy(() => import('./LicensedWasteCookingOilCollectorsModule'));
const HomeNursingInstitutionsModule = lazy(() => import('./HomeNursingInstitutionsModule'));
const OptometryInstitutionsModule = lazy(() => import('./OptometryInstitutionsModule'));
const GeneralChineseMedicineInstitutionsModule = lazy(() => import('./GeneralChineseMedicineInstitutionsModule'));
const AlternativeServiceReserveStatisticsModule = lazy(() => import('./AlternativeServiceReserveStatisticsModule'));
const MedicalLaboratoriesModule = lazy(() => import('./MedicalLaboratoriesModule'));
const SeniorCarePolicyDashboard = lazy(() => import('./SeniorCarePolicyDashboard'));
const CommunityCareServiceSitesModule = lazy(() => import('./CommunityCareServiceSitesModule'));
const SeniorCareCapacityAndOccupancyModule = lazy(() => import('./SeniorCareCapacityAndOccupancyModule'));
const DomesticEmploymentAgencyEvaluationsModule = lazy(() => import('./DomesticEmploymentAgencyEvaluationsModule'));
const LodgingBusinessPenaltyRecordsModule = lazy(() => import('./LodgingBusinessPenaltyRecordsModule'));
const CommunityPublicChildcareHomesModule = lazy(() => import('./CommunityPublicChildcareHomesModule'));
const TbContactScreeningPartnerProvidersModule = lazy(() => import('./TbContactScreeningPartnerProvidersModule'));
const BeautyHairdressingHygieneCertificationsModule = lazy(() => import('./BeautyHairdressingHygieneCertificationsModule'));
const PublicInfluenzaAntiviralProvidersModule = lazy(() => import('./PublicInfluenzaAntiviralProvidersModule'));
const CommunityIntegratedCareLevelCUnitsModule = lazy(() => import('./CommunityIntegratedCareLevelCUnitsModule'));
const RegisteredAfterSchoolCareCentresModule = lazy(() => import('./RegisteredAfterSchoolCareCentresModule'));
const SubsidizedSeniorResidentialPlacementInstitutionsModule = lazy(() => import('./SubsidizedSeniorResidentialPlacementInstitutionsModule'));
const FamilyMedicineInstitutionsModule = lazy(() => import('./FamilyMedicineInstitutionsModule'));
const CosmeticMedicineSupervision2024Module = lazy(() => import('./CosmeticMedicineSupervision2024Module'));
const PlasticSurgeryMedicalInstitutionsModule = lazy(() => import('./PlasticSurgeryMedicalInstitutionsModule'));
const IndigenousCommunityOrganizationsModule = lazy(() => import('./IndigenousCommunityOrganizationsModule'));
const LicensedNaturalGasPipelineContractorsModule = lazy(() => import('./LicensedNaturalGasPipelineContractorsModule'));
const CommunityDevelopmentAssociationsModule = lazy(() => import('./CommunityDevelopmentAssociationsModule'));
const ObstetricsGynecologyInstitutionsModule = lazy(() => import('./ObstetricsGynecologyInstitutionsModule'));
const ArtsCulturalVenuesModule = lazy(() => import('./ArtsCulturalVenuesModule'));
const PsychiatricClinicsModule = lazy(() => import('./PsychiatricClinicsModule'));
const LicensedAssistedReproductionInstitutionsModule = lazy(() => import('./LicensedAssistedReproductionInstitutionsModule'));
const ChildYouthResidentialPlacementInstitutionsModule = lazy(() => import('./ChildYouthResidentialPlacementInstitutionsModule'));
const ChildYouthFriendlyWelfareServiceSitesModule = lazy(() => import('./ChildYouthFriendlyWelfareServiceSitesModule'));
const DisabilityInstitutionCapacityAndVacanciesModule = lazy(() => import('./DisabilityInstitutionCapacityAndVacanciesModule'));
const OphthalmologyInstitutionsModule = lazy(() => import('./OphthalmologyInstitutionsModule'));
const TaipeiCulturalHeritageAssetsModule = lazy(() => import('./TaipeiCulturalHeritageAssetsModule'));
const PrivateCulturalHeritageSubsidiesModule = lazy(() => import('./PrivateCulturalHeritageSubsidiesModule'));
const TravelMedicineClinicsModule = lazy(() => import('./TravelMedicineClinicsModule'));
const HakkaOrganizationsModule = lazy(() => import('./HakkaOrganizationsModule'));
const HospitalDischargeLongTermCarePartnersModule = lazy(() => import('./HospitalDischargeLongTermCarePartnersModule'));
const WithdrawnIllegalHotelEnforcementRecordsModule = lazy(() => import('./WithdrawnIllegalHotelEnforcementRecordsModule'));
const FuneralServiceBusinessesModule = lazy(() => import('./FuneralServiceBusinessesModule'));
const FixedSiteTemporaryChildcareModule = lazy(() => import('./FixedSiteTemporaryChildcareModule'));
const XrayExaminationMedicalInstitutionsModule = lazy(() => import('./XrayExaminationMedicalInstitutionsModule'));
const GovernmentEthicsOfficesModule = lazy(() => import('./GovernmentEthicsOfficesModule'));
const RehabilitationMedicineInstitutionsModule = lazy(() => import('./RehabilitationMedicineInstitutionsModule'));
const HomeDisabledFamilyPhysicianCareProvidersModule = lazy(() => import('./HomeDisabledFamilyPhysicianCareProvidersModule'));
const EducationVolunteerRecognitionRecordsModule = lazy(() => import('./EducationVolunteerRecognitionRecordsModule'));
const OrthopedicFacilitiesModule = lazy(() => import('./OrthopedicFacilitiesModule'));
const EntFacilitiesModule = lazy(() => import('./EntFacilitiesModule'));
const HearingCentersModule = lazy(() => import('./HearingCentersModule'));
const EarlyInterventionCommunityServicesModule = lazy(() => import('./EarlyInterventionCommunityServicesModule'));
const InfluenzaVaccineProvidersUnder3Module = lazy(() => import('./InfluenzaVaccineProvidersUnder3Module'));
const SeniorServicesModule = lazy(() => import('./SeniorServicesModule'));
const EntrustedPublicAssetOperationsModule = lazy(() => import('./EntrustedPublicAssetOperationsModule'));
const DisabilityDayServicesModule = lazy(() => import('./DisabilityDayServicesModule'));
const EnvironmentalPesticideVendorsModule = lazy(() => import('./EnvironmentalPesticideVendorsModule'));
const LaborPensionActViolationsModule = lazy(() => import('./LaborPensionActViolationsModule'));
const InternetAddictionServicesModule = lazy(() => import('./InternetAddictionServicesModule'));
const ChildYouthWelfareInstitutionsModule = lazy(() => import('./ChildYouthWelfareInstitutionsModule'));
const AddictionTreatmentFacilitiesModule = lazy(() => import('./AddictionTreatmentFacilitiesModule'));
const EmergencyAssistanceProvidersModule = lazy(() => import('./EmergencyAssistanceProvidersModule'));
const NationwideAddictionTreatmentServicesModule = lazy(() => import('./NationwideAddictionTreatmentServicesModule'));
const HealthcareWelfareBudgetModule = lazy(() => import('./HealthcareWelfareBudgetModule'));
const KidneyHealthPromotionFacilitiesModule = lazy(() => import('./KidneyHealthPromotionFacilitiesModule'));
const HighMyopiaPreventionClinicsModule = lazy(() => import('./HighMyopiaPreventionClinicsModule'));
const GbsScreeningClinicsModule = lazy(() => import('./GbsScreeningClinicsModule'));
const MedicalRadiologicalInstitutionsModule = lazy(() => import('./MedicalRadiologicalInstitutionsModule'));
const MayorCeremonialGiftStatisticsModule = lazy(() => import('./MayorCeremonialGiftStatisticsModule'));
const SportsPublicParticipationModule = lazy(() => import('./SportsPublicParticipationModule'));
const ClinicalPathologyFacilitiesModule = lazy(() => import('./ClinicalPathologyFacilitiesModule'));
const MethadoneCrossRegionServicesModule = lazy(() => import('./MethadoneCrossRegionServicesModule'));
const OralMaxillofacialSurgeryFacilitiesModule = lazy(() => import('./OralMaxillofacialSurgeryFacilitiesModule'));
const RadiologyDiagnosticFacilitiesModule = lazy(() => import('./RadiologyDiagnosticFacilitiesModule'));
const AnatomicalPathologyInstitutionsModule = lazy(() => import('./AnatomicalPathologyInstitutionsModule'));
const ChildPreventiveHealthcareFacilitiesModule = lazy(() => import('./ChildPreventiveHealthcareFacilitiesModule'));
const HospicePalliativeCareInstitutionsModule = lazy(() => import('./HospicePalliativeCareInstitutionsModule'));
const PrivateSeniorResidentialLongTermCareInstitutionsModule = lazy(() => import('./PrivateSeniorResidentialLongTermCareInstitutionsModule'));
const HemodialysisMedicalInstitutionsModule = lazy(() => import('./HemodialysisMedicalInstitutionsModule'));
const InternalMedicineInstitutionsModule = lazy(() => import('./InternalMedicineInstitutionsModule'));
const OccupationalTherapyClinicsModule = lazy(() => import('./OccupationalTherapyClinicsModule'));
const DesignatedForeignerHealthExamHospitalsModule = lazy(() => import('./DesignatedForeignerHealthExamHospitalsModule'));
const InfluenzaVaccineProvidersChildren3PlusModule = lazy(() => import('./InfluenzaVaccineProvidersChildren3PlusModule'));
const PhysicalTherapyClinicsModule = lazy(() => import('./PhysicalTherapyClinicsModule'));

const emptyFilters: CivicGroupFilters = {
  search: '', district: '', category: '', decade: '', yearFrom: '', yearTo: '', phone: '',
};


function DirectoryModuleLoading({ language }: { language: Language }) {
  return <p className="module-loading" role="status">{language === 'zh' ? '正在載入資料目錄…' : 'Loading directory…'}</p>;
}
const LEGACY_DATA_TABS = new Set([
  "performingArts",
  "vaccinationProviders",
  "hpvProviders",
  "childMedicalSubsidyProviders",
  "dentureSubsidyProviders",
  "disabilityEmploymentResources",
  "shelteredWorkshops",
  "employmentAgencies",
  "licensedPawnshops",
  "licensedArcades",
  "licensedSpecialEntertainment",
  "recyclingOrganizations",
  "registeredFactories",
  "enterpriseHeadquarters",
  "cemeteryPublicFacilities",
  "telepsychology",
  "publicLiabilityInsurance",
  "businessChanges",
  "companyChanges",
  "laborUnions",
  "infantCare",
  "infantCareEvaluations",
  "elderlyWelfare",
  "biotechCompanies",
  "travelAccommodations",
  "grants",
  "procurement",
  "cramSchools",
  "hotels",
  "laborViolations",
  "oshViolations",
  "genderEqualityViolations",
  "consumerDisputeAbsence",
  "nangangCompanies",
  "dawannanCompanies",
  "animalHospitals",
  "animalMedicineSellers",
  "petBusinessEvaluations",
  "veterinarians",
  "comparison",
  "overview",
  "notes"
]);
const GENERATED_DIRECTORY_DATA_TABS = new Set([
  "postpartumCareInstitutions",
  "outCityFuneralBusinesses",
  "hotelHygieneDirectory",
  "kindergartenEvaluationPass",
  "domesticEmploymentServiceAgencies",
  "hospitalHemodialysisResources",
  "streetPerformerVenues",
  "schoolchildDentalPreventiveCareProviders",
  "generalWesternMedicineInstitutions",
  "socialWelfareFoundations",
  "rotavirusVaccineSubsidyProviders",
  "petRegistrationStations",
  "bottledGasRetailers"
]);


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

function DashboardOnboarding({ language, onBrowse, onDismiss }: { language: Language; onBrowse: () => void; onDismiss: () => void }) {
  const zh = language === 'zh';
  const steps = zh
    ? [['01', '選擇資料集', '依主題瀏覽，或直接搜尋服務與資料名稱。'], ['02', '縮小範圍', '使用行政區、年份與資料集專屬篩選條件。'], ['03', '核對來源', '閱讀資料說明與來源連結，再據此採取下一步。']]
    : [['01', 'Choose a dataset', 'Browse by topic or search for a service and dataset name.'], ['02', 'Narrow the records', 'Use district, year, and dataset-specific filters.'], ['03', 'Check the source', 'Read the data notes and source links before taking a next step.']];
  return <aside className="onboarding-flow" aria-label={zh ? '儀表板使用方式' : 'How to use the dashboard'}>
    <div className="onboarding-flow-heading"><div><p>{zh ? '開始探索' : 'START EXPLORING'}</p><h2>{zh ? '三步找到可核對的公共資料' : 'Find verifiable public data in three steps'}</h2></div><button type="button" onClick={onDismiss} aria-label={zh ? '關閉使用方式' : 'Dismiss guide'}>×</button></div>
    <ol>{steps.map(([number, title, description], index) => <li key={number}><span>{number}</span><div><h3>{title}</h3><p>{description}</p></div>{index < steps.length - 1 && <i aria-hidden="true">→</i>}</li>)}</ol>
    <div className="onboarding-flow-footer"><p>{zh ? '資料集是公開資料快照；服務狀態、資格與可用性請向主管機關或服務單位確認。' : 'Datasets are public-data snapshots. Confirm service status, eligibility, and availability with the relevant authority or provider.'}</p><button type="button" onClick={onBrowse}>{zh ? '開啟資料目錄' : 'Browse datasets'}</button></div>
  </aside>;
}

const ONBOARDING_DISMISSED_KEY = 'taipei-public-data:onboarding-dismissed';
const LANGUAGE_PREFERENCE_KEY = 'taipei-public-data:language';

function readStoredLanguage(): Language {
  try { return localStorage.getItem(LANGUAGE_PREFERENCE_KEY) === 'en' ? 'en' : 'zh'; } catch { return 'zh'; }
}

function getInitialNavigation() {
  return readNavigationState(window.location.href, readStoredLanguage());
}

function hasDismissedOnboarding() {
  try { return localStorage.getItem(ONBOARDING_DISMISSED_KEY) === '1'; } catch { return false; }
}

export default function App() {
  const [language, setLanguage] = useState<Language>(() => getInitialNavigation().language);
  const [tab, setTab] = useState<string>(() => getInitialNavigation().dataset);
  const [catalogueOpen, setCatalogueOpen] = useState(false);
  const [explorerOpen, setExplorerOpen] = useState(false);
  const explorerTrigger = useRef<HTMLButtonElement>(null);
  const [showOnboarding, setShowOnboarding] = useState(() => !hasDismissedOnboarding());
  const [catalogueQuery, setCatalogueQuery] = useState('');
  const datasetContentRef = useRef<HTMLDivElement>(null);
  const scrollToDatasetContent = (behavior: ScrollBehavior = 'smooth') => {
    const align = (nextBehavior: ScrollBehavior) => {
      const node = datasetContentRef.current;
      if (!node) return;
      const top = Math.max(0, node.getBoundingClientRect().top + window.scrollY - 16);
      window.scrollTo({ top, behavior: nextBehavior });
    };
    requestAnimationFrame(() => requestAnimationFrame(() => align(behavior)));
    window.setTimeout(() => align('auto'), 250);
    window.setTimeout(() => align('auto'), 750);
  };
  useEffect(() => {
    const handlePopState = () => {
      const next = readNavigationState(window.location.href, readStoredLanguage());
      setExplorerOpen(false);
      setTab(next.dataset);
      setLanguage(next.language);
      scrollToDatasetContent('auto');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);
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
  const [filters, setFilters] = useState(emptyFilters);
  const [loadError, setLoadError] = useState(false);
  const loadedDataGroups = useRef(new Set<string>());
  const t = language === 'zh' ? { ...copy.zh, ...zhUiCopy } : copy.en;

  useEffect(() => {
    let active = true;
    Promise.all([
      loadLocalJson<CivicGroup[]>('data/civic-groups.json'),
      loadLocalJson<CivicGroupSummary>('data/civic-group-summary.json'),
    ]).then(([groupData, summaryData]) => {
      if (!active) return;
      setGroups(groupData);
      setSummary(summaryData);
    }).catch(() => { if (active) setLoadError(true); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!LEGACY_DATA_TABS.has(tab) || loadedDataGroups.current.has('legacy-directory-data')) return;
    loadedDataGroups.current.add('legacy-directory-data');
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
    ]).then(([groupData, summaryData, performingArtsData, performingArtsSummaryData, vaccinationProviderData, vaccinationProviderSummaryData, hpvProviderData, hpvProviderSummaryData, childMedicalSubsidyProviderData, childMedicalSubsidyProviderSummaryData, dentureSubsidyProviderData, dentureSubsidyProviderSummaryData, disabilityEmploymentResourceData, disabilityEmploymentResourceSummaryData, shelteredWorkshopData, shelteredWorkshopSummaryData, employmentAgencyData, employmentAgencySummaryData, licensedPawnshopData, licensedPawnshopSummaryData, licensedArcadeData, licensedArcadeSummaryData, licensedSpecialEntertainmentData, licensedSpecialEntertainmentSummaryData, recyclingOrganizationData, recyclingOrganizationSummaryData, registeredFactoryData, registeredFactorySummaryData, enterpriseHeadquartersData, enterpriseHeadquartersSummaryData, cemeteryData, cemeterySummaryData, telepsychologyData, telepsychologySummaryData, publicLiabilityData, publicLiabilitySummaryData, businessChangeData, businessChangeSummaryData, companyChangeData, companyChangeSummaryData, laborUnionData, laborUnionSummaryData, infantCareData, infantCareSummaryData, infantCareEvaluationData, infantCareEvaluationYearData, infantCareEvaluationSummaryData, elderlyWelfareData, elderlyWelfareSummaryData, biotechData, biotechSummaryData, travelData, travelSummaryData, grantData, grantSummaryData, procurementData, procurementSummaryData, cramSchoolData, cramSchoolSummaryData, hotelData, hotelSummaryData, laborSummaryData, laborManifestData, oshData, oshSummaryData, genderEqualityData, genderEqualitySummaryData, consumerDisputeData, consumerDisputeSummaryData, nangangData, nangangSummaryData, dawannanData, dawannanSummaryData, animalData, animalSummaryData, animalMedicineData, animalMedicineSummaryData, petBusinessEvaluationData, petBusinessEvaluationSummaryData, veterinarianData, veterinarianSummaryData]) => {
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
      setLaborViolationSummary(laborSummaryData); setLaborViolationManifest(laborManifestData);
      setOshViolationRecords(oshData); setOshViolationSummary(oshSummaryData);
      setGenderEqualityViolationRecords(genderEqualityData); setGenderEqualityViolationSummary(genderEqualitySummaryData);
      setConsumerDisputeRecords(consumerDisputeData); setConsumerDisputeSummary(consumerDisputeSummaryData);
      setNangangCompanyRecords(nangangData); setNangangCompanySummary(nangangSummaryData);
      setDawannanCompanyRecords(dawannanData); setDawannanCompanySummary(dawannanSummaryData);
      setAnimalHospitalRecords(animalData); setAnimalHospitalSummary(animalSummaryData);
      setAnimalMedicineSellerRecords(animalMedicineData); setAnimalMedicineSellerSummary(animalMedicineSummaryData);
      setPetBusinessEvaluationRecords(petBusinessEvaluationData); setPetBusinessEvaluationSummary(petBusinessEvaluationSummaryData);
      setVeterinarianRecords(veterinarianData); setVeterinarianSummary(veterinarianSummaryData);
    }).catch(() => { loadedDataGroups.current.delete('legacy-directory-data'); });
  }, [tab]);

  useEffect(() => {
    if (tab !== 'seniorGroupMealServiceSites' || loadedDataGroups.current.has('senior-meals')) return;
    loadedDataGroups.current.add('senior-meals');
    const loadJson = async (path: string) => {
      const response = await fetch(`${import.meta.env.BASE_URL}${path}`);
      if (!response.ok) throw new Error(`${path}: ${response.status}`);
      return response.json();
    };
    Promise.all([loadJson('data/senior-group-meal-service-sites/records.json'), loadJson('data/senior-group-meal-service-sites/summary.json')])
      .then(([records, siteSummary]) => { setSeniorGroupMealServiceSiteRecords(records); setSeniorGroupMealServiceSiteSummary(siteSummary); })
      .catch(() => { loadedDataGroups.current.delete('senior-meals'); });
  }, [tab]);

  useEffect(() => {
    if (tab !== 'publicPneumococcalVaccineProviders' || loadedDataGroups.current.has('pneumococcal')) return;
    loadedDataGroups.current.add('pneumococcal'); const loadJson = async (path: string) => { const response = await fetch(`${import.meta.env.BASE_URL}${path}`); if (!response.ok) throw new Error(`${path}: ${response.status}`); return response.json(); }; Promise.all([loadJson('data/public-pneumococcal-vaccine-providers/records.json'), loadJson('data/public-pneumococcal-vaccine-providers/summary.json')]).then(([records, providerSummary]) => { setPublicPneumococcalVaccineProviderRecords(records); setPublicPneumococcalVaccineProviderSummary(providerSummary); }).catch(() => { loadedDataGroups.current.delete('pneumococcal'); }); }, [tab]);
  useEffect(() => {
    if (tab !== 'majorElectricityUsers' || loadedDataGroups.current.has('major-electricity')) return;
    loadedDataGroups.current.add('major-electricity'); const loadJson = async (path: string) => { const response = await fetch(`${import.meta.env.BASE_URL}${path}`); if (!response.ok) throw new Error(`${path}: ${response.status}`); return response.json(); }; Promise.all([loadJson('data/major-electricity-users/records.json'), loadJson('data/major-electricity-users/summary.json')]).then(([records, electricitySummary]) => { setMajorElectricityUserRecords(records); setMajorElectricityUserSummary(electricitySummary); }).catch(() => { loadedDataGroups.current.delete('major-electricity'); }); }, [tab]);
  useEffect(() => {
    if (tab !== 'earlyInterventionMedicalProviders' || loadedDataGroups.current.has('early-intervention')) return;
    loadedDataGroups.current.add('early-intervention'); const loadJson = async (path: string) => { const response = await fetch(`${import.meta.env.BASE_URL}${path}`); if (!response.ok) throw new Error(`${path}: ${response.status}`); return response.json(); }; Promise.all([loadJson('data/early-intervention-medical-providers/records.json'), loadJson('data/early-intervention-medical-providers/summary.json')]).then(([records, providerSummary]) => { setEarlyInterventionMedicalProviderRecords(records); setEarlyInterventionMedicalProviderSummary(providerSummary); }).catch(() => { loadedDataGroups.current.delete('early-intervention'); }); }, [tab]);
  useEffect(() => {
    if (tab !== 'generalDentalMedicalInstitutions' || loadedDataGroups.current.has('general-dental')) return;
    loadedDataGroups.current.add('general-dental'); const loadJson = async (path: string) => { const response = await fetch(`${import.meta.env.BASE_URL}${path}`); if (!response.ok) throw new Error(`${path}: ${response.status}`); return response.json(); }; Promise.all([loadJson('data/general-dental-medical-institutions/records.json'), loadJson('data/general-dental-medical-institutions/summary.json')]).then(([records, providerSummary]) => { setGeneralDentalMedicalInstitutionRecords(records); setGeneralDentalMedicalInstitutionSummary(providerSummary); }).catch(() => { loadedDataGroups.current.delete('general-dental'); }); }, [tab]);
  useEffect(() => {
    if (tab !== 'diabetesSharedCareMedicalInstitutions' || loadedDataGroups.current.has('diabetes-shared-care')) return;
    loadedDataGroups.current.add('diabetes-shared-care'); const loadJson = async (path: string) => { const response = await fetch(`${import.meta.env.BASE_URL}${path}`); if (!response.ok) throw new Error(`${path}: ${response.status}`); return response.json(); }; Promise.all([loadJson('data/diabetes-shared-care-medical-institutions/records.json'), loadJson('data/diabetes-shared-care-medical-institutions/summary.json')]).then(([records, providerSummary]) => { setDiabetesSharedCareMedicalInstitutionRecords(records); setDiabetesSharedCareMedicalInstitutionSummary(providerSummary); }).catch(() => { loadedDataGroups.current.delete('diabetes-shared-care'); }); }, [tab]);
  useEffect(() => {
    if (!GENERATED_DIRECTORY_DATA_TABS.has(tab) || loadedDataGroups.current.has('generated-directory-data')) return;
    loadedDataGroups.current.add('generated-directory-data'); const j=(p:string)=>fetch(`${import.meta.env.BASE_URL}${p}`).then(r=>{if(!r.ok)throw Error(p);return r.json()}); Promise.all([j('data/registered-postpartum-care-institutions/records.json'),j('data/out-of-city-funeral-service-businesses/records.json'),j('data/hotel-hygiene-certification-directory/records.json'),j('data/kindergarten-basic-evaluation-pass-records/records.json'),j('data/domestic-employment-service-agencies/records.json'),j('data/hospital-hemodialysis-resources/records.json'),j('data/street-performer-venues/records.json'),j('data/schoolchild-dental-preventive-care-providers/records.json'),j('data/general-western-medicine-institutions/records.json'),j('data/social-welfare-foundations/records.json'),j('data/rotavirus-vaccine-subsidy-providers/records.json'),j('data/pet-registration-stations/records.json'),j('data/bottled-gas-retailers/records.json')]).then(([a,b,c,d,e,f,g,h,i,k,l,m,n])=>{setPostpartumRecords(a);setOutCityFuneralRecords(b);setHotelHygieneRecords(c);setKindergartenRecords(d);setDomesticEmploymentServiceAgencyRecords(e);setHospitalHemodialysisResourceRecords(f);setStreetPerformerVenueRecords(g);setSchoolchildDentalPreventiveCareProviderRecords(h);setGeneralWesternMedicineInstitutionRecords(i);setSocialWelfareFoundationRecords(k);setRotavirusVaccineSubsidyProviderRecords(l);setPetRegistrationStationRecords(m);setBottledGasRetailerRecords(n)}).catch(() => { loadedDataGroups.current.delete('generated-directory-data'); }); }, [tab]);

  useEffect(() => {
    document.documentElement.lang = language === 'zh' ? 'zh-Hant' : 'en';
    document.title = t.title;
    try { localStorage.setItem(LANGUAGE_PREFERENCE_KEY, language); } catch { /* Preference persistence is optional. */ }
    const state = { dataset: tab, language };
    const url = buildNavigationUrl(window.location.href, state);
    window.history.replaceState(buildHistoryState(window.history.state, state), '', url);
  }, [language, t.title, tab]);

  const filtered = useMemo(() => filterCivicGroups(groups, filters, language), [groups, filters, language]);
  const hasFilters = Object.values(filters).some(Boolean);
  const activeSummary = useMemo(
    () => summary && hasFilters ? buildCivicGroupSummary(filtered) : summary,
    [filtered, hasFilters, summary],
  );
  const decades = useMemo(() => [...new Set(groups.flatMap((group) => group.foundedDecade ?? []))].sort(), [groups]);
  const openDistrict = (district: string) => { setFilters({ ...emptyFilters, district }); setCivicView('directory'); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const displayedTabs = getCatalogueItems(language);
  useEffect(() => {
    if (displayedTabs.some(([id]) => id === tab)) return;
    const state = { dataset: 'civic', language };
    setTab(state.dataset);
    const url = buildNavigationUrl(window.location.href, state);
    window.history.replaceState(buildHistoryState(window.history.state, state), '', url);
  }, [tab, language]);
  const catalogue = useMemo(() => buildDatasetCatalogue(displayedTabs, language, catalogueQuery), [displayedTabs, language, catalogueQuery]);
  const activeDatasetLabel = displayedTabs.find(([id]) => id === tab)?.[1];
  const activeDatasetDirectory = ({
    civic: 'civic-groups', performingArts: 'performing-arts-groups', vaccinationProviders: 'contracted-vaccination-medical-providers', hpvProviders: 'publicly-funded-hpv-vaccination-providers', childMedicalSubsidyProviders: 'child-medical-subsidy-contracted-providers', dentureSubsidyProviders: 'denture-subsidy-medical-providers', disabilityEmploymentResources: 'disability-employment-resource-map', shelteredWorkshops: 'sheltered-workshop-directory', employmentAgencies: 'employment-agency-intermediary-companies', licensedPawnshops: 'licensed-pawnshop-directory', licensedArcades: 'licensed-electronic-game-arcade-operators', licensedSpecialEntertainment: 'licensed-special-entertainment-business-operators', recyclingOrganizations: 'registered-recycling-business-organizations', registeredFactories: 'registered-factory-distribution', enterpriseHeadquarters: 'enterprise-headquarters-distribution', laborUnions: 'registered-labor-unions', infantCare: 'quasi-public-infant-care-centers', infantCareEvaluations: 'infant-care-center-evaluation-results', elderlyWelfare: 'elderly-welfare-institutions', biotechCompanies: 'biotech-company-directory', travelAccommodations: 'taipei-travel-accommodations-zh', publicLiabilityInsurance: 'business-premises-public-liability-insurance', businessChanges: 'business-registration-change-records', companyChanges: 'company-registration-change-records', laborViolations: 'labor-standard-act-violation-records', oshViolations: 'occupational-safety-health-violation-records', genderEqualityViolations: 'gender-equality-work-act-violation-records', consumerDisputeAbsence: 'consumer-dispute-absent-business-operators', nangangCompanies: 'nangang-software-park-companies', dawannanCompanies: 'dawannan-industrial-area-company-directory', animalHospitals: 'registered-animal-hospitals', animalMedicineSellers: 'licensed-animal-medicine-sellers', petBusinessEvaluations: 'specific-pet-business-evaluation-results', veterinarians: 'veterinarian-professional-registry', telepsychology: 'telepsychology-counseling-institutions', publicPneumococcalVaccineProviders: 'public-pneumococcal-vaccine-providers', majorElectricityUsers: 'major-electricity-users', earlyInterventionMedicalProviders: 'early-intervention-medical-providers', generalDentalMedicalInstitutions: 'general-dental-medical-institutions', diabetesSharedCareMedicalInstitutions: 'diabetes-shared-care-medical-institutions', educationVolunteerRecognitionRecords: 'education-volunteer-recognition-records',
  } as Record<string, string>)[tab] ?? tab.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
  const selectDataset = (id: string) => {
    const current = readNavigationState(window.location.href, language);
    const state = { dataset: id, language };
    setTab(id);
    setCatalogueOpen(false);
    setCatalogueQuery('');
    setExplorerOpen(false);
    if (explorerOpen) requestAnimationFrame(() => datasetContentRef.current?.focus({ preventScroll: true }));
    if (current.dataset !== id) {
      const url = buildNavigationUrl(window.location.href, state);
      window.history.pushState(buildHistoryState(window.history.state, state), '', url);
    }
    scrollToDatasetContent(window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth');
  };
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('dataset')) scrollToDatasetContent('auto');
  }, []);
  const returnToCatalogue = () => {
    setExplorerOpen(false);
    setCatalogueOpen(true);
    requestAnimationFrame(() => explorerTrigger.current?.focus());
  };
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
          <button ref={explorerTrigger} className="catalogue-explorer-trigger" type="button" aria-expanded={explorerOpen} aria-controls="civic-explorer-area" onClick={() => { setCatalogueOpen(false); setExplorerOpen(true); }}>{language === 'zh' ? 'Civic Explorer · 七個主題圖' : 'Civic Explorer · Seven topic hubs'}</button>
          <label className="catalogue-popover-search"><span className="sr-only">{language === 'zh' ? '搜尋資料集' : 'Search datasets'}</span><input value={catalogueQuery} onChange={(event) => setCatalogueQuery(event.target.value)} placeholder={language === 'zh' ? '搜尋資料集或服務' : 'Search datasets or services'} /></label>
          {catalogue.length ? <div className="catalogue-grid">{catalogue.map((category) => <section className="catalogue-category" key={category.id}><h2>{category.title}<span>{category.items.length}</span></h2><div>{category.items.map(([id, label]) => <button type="button" key={id} className={tab === id ? 'active' : ''} aria-current={tab === id ? 'page' : undefined} onClick={() => selectDataset(id)}>{label}</button>)}</div></section>)}</div> : <p className="catalogue-empty" role="status">{language === 'zh' ? '找不到符合的資料集，請嘗試其他關鍵字。' : 'No matching datasets. Try another keyword.'}</p>}
        </div>}
      </nav>
    </header>
    <main data-active-ui-family={uiFamilyForDataset(tab)} data-active-dataset={tab}>
      {tab !== 'seniorCarePolicy' && <DataTrustPanel language={language} activeDataset={activeDatasetDirectory} activeDatasetLabel={activeDatasetLabel} appliesSmallSampleGuard={tab === 'influenzaVaccineProvidersChildren3Plus'} />}
      {explorerOpen && <div id="civic-explorer-area"><ExplorerBoundary language={language} onBack={returnToCatalogue}><Suspense fallback={<DirectoryModuleLoading language={language} />}><CivicExplorer language={language} dataset={tab} onNavigate={selectDataset} onBack={returnToCatalogue} /></Suspense></ExplorerBoundary></div>}
      {showOnboarding && <DashboardOnboarding language={language} onBrowse={() => setCatalogueOpen(true)} onDismiss={() => { try { localStorage.setItem(ONBOARDING_DISMISSED_KEY, '1'); } catch { /* Dismissal persistence is optional. */ } setShowOnboarding(false); }} />}
      <div ref={datasetContentRef} className="dataset-content-anchor" tabIndex={-1} role="region" aria-label={language === 'zh' ? '目前資料集內容' : 'Current dataset content'} />
      <Suspense fallback={<DirectoryModuleLoading language={language} />}>
      {loadError && tab === 'civic' && <p className="status" role="alert">{t.loadError}</p>}
      {!loadError && tab === 'civic' && !summary && <p className="status" role="status">{t.loading}</p>}
      {tab === 'civic' && summary && <><FilterPanel filters={filters} setFilters={setFilters} language={language} decades={decades} /><section className="workspace civic-header"><div className="section-heading"><p>01 / CIVIC GROUPS</p><h2>{t.civicGroups}</h2></div>
        <AccessibleTabs tabs={civicViews} value={civicView} onChange={setCivicView} ariaLabel={language === 'zh' ? '人民團體資料檢視' : 'Civic group data views'} idPrefix="civic-views" controlsPanel />
        <AccessibleTabPanel idPrefix="civic-views" value={civicView}>
        {civicView === 'map' && activeSummary && <CivicMap summary={activeSummary} language={language} openDistrict={openDistrict} />}
        {civicView === 'directory' && <><div className="section-heading inline"><div /><strong>{filtered.length.toLocaleString()} <span>{t.found}</span></strong></div><div className="notice subtle">{t.categoryNotice}</div><GroupDirectory groups={filtered} language={language} /></>}
        {civicView === 'overview' && activeSummary && <Overview summary={activeSummary} groups={hasFilters ? filtered : groups} language={language} />}</AccessibleTabPanel></section></>}
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
        language={language} uiFamily={uiFamilyForDataset(tab)} eyebrow="HEALTHCARE / GENERAL MEDICINE" title={language === 'zh' ? '西醫一般科醫療機構' : 'General Western Medicine Institutions'}
        subtitle={language === 'zh' ? '行政區彙整、可搜尋名冊及外部地圖查詢；不建立精確地圖標記。' : 'District summaries, searchable directory, and external map lookup only; no exact map markers.'}
        records={generalWesternMedicineInstitutionRecords}
        columns={[["sourceSequenceNumber", language === 'zh' ? '序號' : 'ID'], ["institutionName", language === 'zh' ? '機構名稱' : 'Institution name'], ["districtNameFromAddress", language === 'zh' ? '行政區' : 'District'], ["postalCode", language === 'zh' ? '郵遞區號' : 'Postal code'], ["address", language === 'zh' ? '地址' : 'Address'], ["phone", language === 'zh' ? '電話' : 'Phone'], ["googleMapsQuery", language === 'zh' ? '地圖查詢' : 'Map lookup']]}
        notice={language === 'zh' ? '本資料不代表即時營業、門診、預約、診療項目、費用、醫療品質、急診能力、診斷、治療或醫療建議；請向醫療機構或臺北市政府衛生局確認。' : 'This dataset does not represent real-time operation, clinic hours, appointments, treatments, fees, quality, emergency capability, diagnosis, treatment, or medical advice. Confirm with the institution or Taipei City Department of Health.'}
      />}
      {tab === 'rotavirusVaccineSubsidyProviders' && <GeneratedDatasetDirectoryModule language={language} uiFamily={uiFamilyForDataset(tab)} eyebrow="HEALTHCARE / VACCINATION" title={language==='zh'?'輪狀病毒疫苗補助合約醫療院所':'Rotavirus Vaccine Subsidy Providers'} subtitle={language==='zh'?'院所類別與語音預約資訊均為來源欄位，不代表即時可預約或疫苗供應。':'Institution category and voice-appointment information are source fields, not real-time booking or vaccine supply.'} records={rotavirusVaccineSubsidyProviderRecords} columns={[["institutionName",language==='zh'?'院所名稱':'Institution name'],["institutionCategory",language==='zh'?'機構類別':'Institution category'],["districtName",language==='zh'?'行政區':'District'],["address",language==='zh'?'地址':'Address'],["phone",language==='zh'?'電話':'Phone'],["voiceAppointmentRaw",language==='zh'?'語音預約資訊':'Voice appointment information'],["googleMapsQuery",language==='zh'?'地圖查詢':'Map lookup']]} notice={language==='zh'?'本資料不代表即時疫苗庫存、補助或接種資格、預約、語音預約、服務時間、費用、醫療品質、診斷或醫療建議；請向院所或臺北市政府衛生局確認。':'This dataset does not represent real-time stock, subsidy or vaccination eligibility, appointments, voice booking, hours, fees, quality, diagnosis, or medical advice. Confirm with the provider or Taipei City Department of Health.'}/>}
      {tab === 'homeNursingInstitutions' && <HomeNursingInstitutionsModule language={language} />}
      {tab === 'optometryInstitutions' && <OptometryInstitutionsModule language={language} />}
      {tab === 'generalChineseMedicineInstitutions' && <GeneralChineseMedicineInstitutionsModule language={language} />}
      {tab === 'alternativeServiceReserveStatistics' && <AlternativeServiceReserveStatisticsModule language={language} />}
      {tab === 'medicalLaboratories' && <MedicalLaboratoriesModule language={language} />}
      {tab === 'seniorCarePolicy' && <SeniorCarePolicyDashboard language={language} />}
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
      {tab === 'withdrawnIllegalHotelEnforcementRecords' && <WithdrawnIllegalHotelEnforcementRecordsModule language={language} />}
      {tab === 'funeralServiceBusinesses' && <FuneralServiceBusinessesModule language={language} />}
      {tab === 'fixedSiteTemporaryChildcare' && <FixedSiteTemporaryChildcareModule language={language} />}
      {tab === 'xrayExaminationMedicalInstitutions' && <XrayExaminationMedicalInstitutionsModule language={language} />}
      {tab === 'governmentEthicsOffices' && <GovernmentEthicsOfficesModule language={language} />}
      {tab === 'rehabilitationMedicineInstitutions' && <RehabilitationMedicineInstitutionsModule language={language} />}
      {tab === 'homeDisabledFamilyPhysicianCareProviders' && <HomeDisabledFamilyPhysicianCareProvidersModule language={language} />}
      {tab === 'educationVolunteerRecognitionRecords' && <EducationVolunteerRecognitionRecordsModule language={language} />}
      {tab === 'orthopedicFacilities' && <OrthopedicFacilitiesModule language={language} />}
      {tab === 'entFacilities' && <EntFacilitiesModule language={language} />}
      {tab === 'hearingCenters' && <HearingCentersModule language={language} />}
      {tab === 'earlyInterventionCommunityServices' && <EarlyInterventionCommunityServicesModule language={language} />}
      {tab === 'influenzaVaccineProvidersUnder3' && <InfluenzaVaccineProvidersUnder3Module language={language} />}
      {tab === 'seniorServices' && <SeniorServicesModule language={language} />}
      {tab === 'entrustedPublicAssetOperations' && <EntrustedPublicAssetOperationsModule language={language} />}
      {tab === 'disabilityDayServices' && <DisabilityDayServicesModule language={language} />}
      {tab === 'environmentalPesticideVendors' && <EnvironmentalPesticideVendorsModule language={language} />}
      {tab === 'laborPensionActViolations' && <LaborPensionActViolationsModule language={language} />}
      {tab === 'internetAddictionServices' && <InternetAddictionServicesModule language={language} />}
      {tab === 'childYouthWelfareInstitutions' && <ChildYouthWelfareInstitutionsModule language={language} />}
      {tab === 'addictionTreatmentFacilities' && <AddictionTreatmentFacilitiesModule language={language} />}
      {tab === 'emergencyAssistanceProviders' && <EmergencyAssistanceProvidersModule language={language} />}
      {tab === 'nationwideAddictionTreatmentServices' && <NationwideAddictionTreatmentServicesModule language={language} />}
      {tab === 'healthcareWelfareBudget' && <HealthcareWelfareBudgetModule language={language} />}
      {tab === 'kidneyHealthPromotionFacilities' && <KidneyHealthPromotionFacilitiesModule language={language} />}
      {tab === 'highMyopiaPreventionClinics' && <HighMyopiaPreventionClinicsModule language={language} />}
      {tab === 'gbsScreeningClinics' && <GbsScreeningClinicsModule language={language} />}
      {tab === 'medicalRadiologicalInstitutions' && <MedicalRadiologicalInstitutionsModule language={language} />}
      {tab === 'mayorCeremonialGiftStatistics' && <MayorCeremonialGiftStatisticsModule language={language} />}
      {tab === 'sportsPublicParticipation' && <SportsPublicParticipationModule language={language} />}
      {tab === 'clinicalPathologyFacilities' && <ClinicalPathologyFacilitiesModule language={language} />}
      {tab === 'methadoneCrossRegionServices' && <MethadoneCrossRegionServicesModule language={language} />}
      {tab === 'oralMaxillofacialSurgeryFacilities' && <OralMaxillofacialSurgeryFacilitiesModule language={language} />}
      {tab === 'radiologyDiagnosticFacilities' && <RadiologyDiagnosticFacilitiesModule language={language} />}
      {tab === 'anatomicalPathologyInstitutions' && <AnatomicalPathologyInstitutionsModule language={language} />}
      {tab === 'childPreventiveHealthcareFacilities' && <ChildPreventiveHealthcareFacilitiesModule language={language} />}
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
        language={language} uiFamily={uiFamilyForDataset(tab)} eyebrow="ANIMAL CARE / PET REGISTRATION"
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
        language={language} uiFamily={uiFamilyForDataset(tab)} eyebrow="PUBLIC SAFETY / BOTTLED GAS RETAILERS"
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
        language={language} uiFamily={uiFamilyForDataset(tab)} eyebrow="SOCIAL WELFARE / FOUNDATION DIRECTORY" title={language === 'zh' ? '社會福利基金會名冊' : 'Social Welfare Foundation Directory'}
        subtitle={language === 'zh' ? '行政區與類別為公開來源欄位；不建立精確地圖標記。' : 'Districts and categories are source fields; no exact map markers.'}
        records={socialWelfareFoundationRecords}
        columns={[["sourceSequenceNumber", language === 'zh' ? '序號' : 'ID'], ["foundationName", language === 'zh' ? '名稱' : 'Foundation name'], ["foundationCategory", language === 'zh' ? '類別' : 'Category'], ["districtName", language === 'zh' ? '行政區' : 'District'], ["address", language === 'zh' ? '地址' : 'Address'], ["phone", language === 'zh' ? '電話' : 'Phone'], ["organizationCode", language === 'zh' ? '代碼編號' : 'Organization code'], ["registrationNumber", language === 'zh' ? '立案字號' : 'Registration number'], ["establishedDateRaw", language === 'zh' ? '成立日期' : 'Established date'], ["googleMapsQuery", language === 'zh' ? '地圖查詢' : 'Map lookup']]}
        notice={language === 'zh' ? '本資料不代表目前立案、營運、服務、募款資格、財務狀況、社會影響、服務品質或官方推薦；請向基金會、臺北市政府社會局或主管機關確認。' : 'This dataset does not confirm current registration, operation, services, fundraising eligibility, financial condition, social impact, quality, or recommendation. Confirm with the foundation, Taipei City Department of Social Welfare, or the relevant authority.'}
      />}
      {tab === 'schoolchildDentalPreventiveCareProviders' && <GeneratedDatasetDirectoryModule
        language={language} uiFamily={uiFamilyForDataset(tab)} eyebrow="HEALTHCARE / PREVENTIVE DENTISTRY" title={language === 'zh' ? '學童牙齒預防保健合約醫療院所' : 'Schoolchild Dental Preventive Care Providers'}
        subtitle={language === 'zh' ? '兩份官方服務名冊分別保留為窩溝封填及含氟服務紀錄。' : 'Two official source lists remain distinct as pit-and-fissure sealant and school fluoride service records.'}
        records={schoolchildDentalPreventiveCareProviderRecords}
        columns={[["institutionName", language === 'zh' ? '醫療院所' : 'Institution'], ["serviceType", language === 'zh' ? '服務類型' : 'Service type'], ["districtName", language === 'zh' ? '行政區' : 'District'], ["address", language === 'zh' ? '地址' : 'Address'], ["phone", language === 'zh' ? '電話' : 'Phone'], ["googleMapsQuery", language === 'zh' ? '地圖查詢' : 'Map lookup']]}
        notice={language === 'zh' ? '本資料不代表即時服務、預約、資格、補助資格、服務時間、費用、醫療品質、診斷、治療或醫療建議；請向醫療院所、學校或臺北市政府衛生局確認。' : 'This dataset does not represent real-time services, appointments, eligibility, subsidy eligibility, hours, fees, quality, diagnosis, treatment, or medical advice. Confirm with the institution, school, or Taipei City Department of Health.'}
      />}
      {tab === 'hospitalHemodialysisResources' && <GeneratedDatasetDirectoryModule
        language={language} uiFamily={uiFamilyForDataset(tab)} eyebrow="HEALTHCARE / HEMODIALYSIS" title={language === 'zh' ? '公私立醫院血液透析資源' : 'Hospital Hemodialysis Resources'}
        subtitle={language === 'zh' ? '以行政區彙整、可搜尋名冊及外部地圖查詢呈現；不建立精確地圖標記。' : 'District summaries, a searchable directory, and external map lookup only; no exact map markers.'}
        records={hospitalHemodialysisResourceRecords}
        columns={[["sourceSequenceNumber", language === 'zh' ? '項次' : 'ID'], ["institutionName", language === 'zh' ? '機構名稱' : 'Institution name'], ["districtName", language === 'zh' ? '行政區' : 'District'], ["address", language === 'zh' ? '地址' : 'Address'], ["phone", language === 'zh' ? '電話' : 'Phone'], ["googleMapsQuery", language === 'zh' ? '地圖查詢' : 'Map lookup']]}
        notice={language === 'zh' ? '本資料不代表即時透析名額、床位、預約、收治資格、服務時間、費用、醫療品質、緊急收治能力、診斷、治療或醫療建議；請向醫療機構或臺北市政府衛生局確認。' : 'This dataset does not represent real-time capacity, beds, appointments, eligibility, service hours, fees, quality, emergency capability, diagnosis, treatment, or medical advice. Confirm with the institution or Taipei City Department of Health.'}
      />}
      {tab === 'streetPerformerVenues' && <GeneratedDatasetDirectoryModule
        language={language} uiFamily={uiFamilyForDataset(tab)} eyebrow="CULTURE / STREET PERFORMANCE / VENUES" title={language === 'zh' ? '街頭藝人展演場地資訊' : 'Street Performer Venues'}
        subtitle={language === 'zh' ? '主管機關、表演類型及申請方式均為來源文字；場地名稱不會自動轉為地圖標記。' : 'Authority, performance types, and application methods are source text; venue names are not converted into map markers.'}
        records={streetPerformerVenueRecords}
        columns={[["sourceSequenceNumber", language === 'zh' ? '項次' : 'ID'], ["venueName", language === 'zh' ? '展演地' : 'Venue'], ["managingAuthority", language === 'zh' ? '主管機關' : 'Managing authority'], ["openingHoursRaw", language === 'zh' ? '開放時段' : 'Opening hours'], ["allowedPerformanceTypes", language === 'zh' ? '開放表演類型' : 'Performance types'], ["applicationMethod", language === 'zh' ? '申請方式' : 'Application method'], ["fullPhone", language === 'zh' ? '聯絡電話' : 'Phone'], ["externalMapQuery", language === 'zh' ? '地圖查詢' : 'Map lookup']]}
        notice={language === 'zh' ? '開放時段、表演類型及申請方式不代表即時開放、申請、核准、許可、預約、費用、安全保證或官方推薦；請向主管機關或場地營運者確認。' : 'Opening hours, performance types, and application methods do not confirm real-time availability, approval, permission, reservations, fees, safety, or recommendation. Confirm with the managing authority or venue operator.'}
      />}
      {tab === 'domesticEmploymentServiceAgencies' && <GeneratedDatasetDirectoryModule
        language={language} uiFamily={uiFamilyForDataset(tab)} eyebrow="LABOR / DOMESTIC EMPLOYMENT SERVICES"
        title={language === 'zh' ? '仲介本國人國內工作私立就業服務機構名冊' : 'Domestic Employment Service Agency Directory'}
        subtitle={language === 'zh' ? '本資料僅限臺北市許可仲介本國人在國內工作之私立就業服務機構及分支機構。' : 'A distinct directory of Taipei-licensed agencies that place Taiwanese nationals in domestic employment.'}
        records={domesticEmploymentServiceAgencyRecords}
        columns={[["sourceSequenceNumber", language === 'zh' ? '編號' : 'ID'], ["licenseNumber", language === 'zh' ? '許可證字號' : 'Licence number'], ["agencyName", language === 'zh' ? '機構名稱' : 'Agency name'], ["districtNameFromAddress", language === 'zh' ? '行政區' : 'District'], ["address", language === 'zh' ? '機構地址' : 'Address'], ["phone", language === 'zh' ? '機構電話' : 'Phone'], ["responsiblePerson", language === 'zh' ? '負責人姓名' : 'Responsible person'], ["licenseExpiryRaw", language === 'zh' ? '許可證有效期限' : 'Licence expiry'], ["capitalAmountRaw", language === 'zh' ? '資本額' : 'Capital'], ["professionalPersonnelRaw", language === 'zh' ? '專業人員' : 'Licensed professionals'], ["googleMapsQuery", language === 'zh' ? '地圖查詢' : 'Map lookup']]}
        notice={language === 'zh' ? '許可證期限、資本額及專業人員為來源欄位，僅相對資料建置日計算狀態；不代表即時許可、營運、職缺、服務品質或官方推薦。請向臺北市政府勞動局確認。' : 'Licence expiry, capital, and personnel are source-record fields only. Any status is relative to the data build date and does not confirm real-time validity, operation, jobs, quality, or recommendation. Confirm with Taipei City Department of Labor.'}
      />}
      {tab === 'postpartumCareInstitutions' && <GeneratedDatasetDirectoryModule language={language} uiFamily={uiFamilyForDataset(tab)} eyebrow="HEALTHCARE / POSTPARTUM CARE" title={language==='zh'?'立案產後護理機構':'Registered Postpartum Care Institutions'} subtitle={language==='zh'?'來源床位與評鑑欄位不代表即時名額或品質建議。':'Source bed and evaluation fields are not real-time availability or quality advice.'} records={postpartumRecords} columns={[["institutionName",language==='zh'?'機構名稱':'Institution'],["districtNameFromAddress",language==='zh'?'行政區':'District'],["address",language==='zh'?'地址':'Address'],["phone",language==='zh'?'電話':'Phone'],["totalBedCount",language==='zh'?'床位':'Beds']]} notice={language==='zh'?'不提供即時空床、費用或照護建議。':'No real-time vacancies, fees, or care advice.'}/>}
      {tab === 'outCityFuneralBusinesses' && <GeneratedDatasetDirectoryModule language={language} uiFamily={uiFamilyForDataset(tab)} eyebrow="FUNERAL SERVICES / OUT-OF-CITY REGISTRY" title={language==='zh'?'外縣市殯葬服務業者':'Out-of-City Funeral Service Businesses'} subtitle={language==='zh'?'地址為來源登記地，不代表臺北服務據點。':'Addresses are source registered locations, not Taipei service locations.'} records={outCityFuneralRecords} columns={[["companyName",language==='zh'?'公司名稱':'Company'],["responsiblePerson",language==='zh'?'負責人':'Responsible person'],["sourceCityOrCounty",language==='zh'?'縣市':'City/county'],["companyAddress",language==='zh'?'登記地址':'Registered address'],["phone",language==='zh'?'電話':'Phone']]} notice={language==='zh'?'不代表即時營運或登記有效狀態。':'Does not represent current operation or registration validity.'}/>} 
      {tab === 'hotelHygieneDirectory' && <GeneratedDatasetDirectoryModule language={language} uiFamily={uiFamilyForDataset(tab)} eyebrow="PUBLIC HEALTH / HOTEL HYGIENE REGISTRY" title={language==='zh'?'旅館衛生認證紀錄':'Hotel Hygiene Certification Records'} subtitle={language==='zh'?'保留來源欄位，認證資料不代表即時狀態。':'Source records retained; certification data is not real-time status.'} records={hotelHygieneRecords} columns={[["id",'ID'],["sourceValues",language==='zh'?'來源欄位':'Source fields']]} notice={language==='zh'?'不代表目前認證、營運或品質推薦。':'Does not represent current certification, operation, or quality recommendation.'}/>} 
      {tab === 'kindergartenEvaluationPass' && <GeneratedDatasetDirectoryModule language={language} uiFamily={uiFamilyForDataset(tab)} eyebrow="EARLY CHILDHOOD EDUCATION / EVALUATION RECORDS" title={language==='zh'?'公私立幼兒園基礎評鑑通過名單':'Kindergarten Basic Evaluation Pass Records'} subtitle={language==='zh'?'通過紀錄屬特定學年度，不代表目前狀態。':'Pass records apply to specified academic years, not current status.'} records={kindergartenRecords} columns={[["kindergartenName",language==='zh'?'幼兒園':'Kindergarten'],["districtName",language==='zh'?'行政區':'District'],["establishmentType",language==='zh'?'設立別':'Establishment type'],["evaluationAcademicYearRaw",language==='zh'?'評鑑學年度':'Academic year'],["cityCode",language==='zh'?'縣市代碼':'City code']]} notice={language==='zh'?'不代表目前立案、招生、費用或品質推薦。':'Does not represent current registration, enrollment, fees, or quality recommendation.'}/>} 
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
          <article><h3>{t.source}</h3><p><a href="https://data.taipei/dataset/detail?id=72417af0-7dec-4fad-b762-5f2baafcf084" target="_blank" rel="noreferrer">臺北市人民團體名冊 ↗</a><br /><a href="https://data.taipei/dataset/detail?id=f56e77c6-cc69-480c-8ba4-057fc7e1d8d6" target="_blank" rel="noreferrer">臺北市演藝團體名冊 ↗</a><br /><a href="https://data.taipei/dataset/detail?id=ec201f0a-2efa-4426-9439-a8daea7b33c7" target="_blank" rel="noreferrer">臺北市各項預防接種合約醫療院所 ↗</a><br /><a href="https://data.taipei/dataset/detail?id=96f143fe-4c95-4d88-9985-77f28e2d2c3d" target="_blank" rel="noreferrer">臺北市公費HPV疫苗特約醫療院所 ↗</a><br /><a href="https://data.taipei/dataset/detail?id=3cc250f5-9f5a-4670-ac7b-f13ecd316032" target="_blank" rel="noreferrer">臺北市兒童醫療補助特約院所名冊 ↗</a><br /><a href="https://data.taipei/dataset/detail?id=76b8b514-e793-4cca-8dcf-065d5af4b760" target="_blank" rel="noreferrer">臺北市假牙補助醫療院所名單 ↗</a><br /><a href="https://data.taipei/dataset/detail?id=c5aafda8-ef14-4f66-a6b7-d5da995a14b5" target="_blank" rel="noreferrer">臺北市身障就業資源地圖 ↗</a><br /><a href="https://data.taipei/dataset/detail?id=fb88e4fd-c287-4fbb-91ab-0ed1fbeaf28c" target="_blank" rel="noreferrer">臺北市庇護工場名冊 ↗</a><br /><a href="https://data.taipei/dataset/detail?id=49a8e600-313d-48ba-b35f-5ff093d4cff1" target="_blank" rel="noreferrer">臺北市回收業機構名冊 ↗</a><br /><a href="https://data.taipei/dataset/detail?id=024da777-25b0-4bee-b1b9-2f8ceb8bd68a" target="_blank" rel="noreferrer">臺北市政府警察局當舖業資料清冊 ↗</a><br /><a href="https://data.taipei/dataset/detail?id=20774fbb-5671-4850-b307-af6b5976077d" target="_blank" rel="noreferrer">臺北市合法電子遊戲場業者清冊 ↗</a><br /><a href="https://data.taipei/dataset/detail?id=dd0548f2-0372-4e4f-8c74-9a4121f27d35" target="_blank" rel="noreferrer">臺北市合法八大行業業者清冊 ↗</a><br /><a href="https://data.taipei/dataset/detail?id=428a78d5-867a-4e55-9630-040a89c8cd94" target="_blank" rel="noreferrer">臺北市可執行通訊心理諮商之心理機構 ↗</a><br /><a href="https://data.taipei/dataset/detail?id=5880bb98-ab6a-476c-ae55-37564b0d0fc9" target="_blank" rel="noreferrer">臺北市營業場所投保公共意外險清冊 ↗</a><br /><a href="https://data.taipei/dataset/detail?id=5fdefcca-e0a6-41bc-a520-7c8f067caad3" target="_blank" rel="noreferrer">臺北市核准商業設立、變更及歇業登記等異動資料清冊 ↗</a><br /><a href="https://data.taipei/dataset/detail?id=0a1f284d-e985-4c39-b0b5-53389fbfa6e9" target="_blank" rel="noreferrer">臺北市核准公司設立變更解散清冊 ↗</a><br /><a href="https://data.taipei/dataset/detail?id=bea69229-8349-4208-8a68-988718f4ea48" target="_blank" rel="noreferrer">臺北市各工會名單及聯絡方式 ↗</a><br /><a href="https://data.taipei/dataset/detail?id=3e78bffa-3fa3-46d5-a632-df99447de695" target="_blank" rel="noreferrer">臺北市產業補助廠商資料 ↗</a><br /><a href="https://data.taipei/dataset/detail?id=a05ee8ee-d7f1-4024-86c1-e2f97f2120bf" target="_blank" rel="noreferrer">臺北市生技廠商企業名錄 ↗</a><br /><a href="https://data.taipei/dataset/detail?id=f4fd7f03-9bf6-41de-a003-02c437596570" target="_blank" rel="noreferrer">臺北捷運公司採購案件預定招標時程資訊 ↗</a><br /><a href="https://data.taipei/dataset/detail?id=b124a967-fc88-4c45-bea8-41b4ef158a15" target="_blank" rel="noreferrer">臺北市立案補習班資訊 ↗</a><br /><a href="https://data.taipei/dataset/detail?id=4d7d0b46-2e90-4ee7-b000-c0f2f3a37651" target="_blank" rel="noreferrer">臺北市一般旅館名冊 ↗</a><br /><a href="https://data.taipei/dataset/detail?id=58093ba6-4c98-4148-b27a-50ad97d7afca" target="_blank" rel="noreferrer">臺北市臺北旅遊網住宿資料(中文) ↗</a><br /><a href="https://data.taipei/dataset/detail?id=23630879-4926-4877-a48a-a0ae6cc2f7d5" target="_blank" rel="noreferrer">臺北市勞基法違規公布紀錄 ↗</a><br /><a href="https://data.taipei/dataset/detail?id=3e2ad23f-21fa-4084-a4de-4fd7f5293550" target="_blank" rel="noreferrer">臺北市職安法違規公布紀錄 ↗</a><br /><a href="https://data.taipei/dataset/detail?id=12f3421a-94f4-4a5e-8642-143dee2fa551" target="_blank" rel="noreferrer">臺北市性別平等工作法違規公布紀錄 ↗</a><br /><a href="https://data.taipei/dataset/detail?id=c15e49fd-f511-46c8-8613-0ad91f370bfd" target="_blank" rel="noreferrer">臺北市消費爭議無故不到場協商之被申訴企業經營者列表 ↗</a><br /><a href="https://data.taipei/dataset/detail?id=01bcb5ee-7c18-41fa-86d4-4e75daee1f94" target="_blank" rel="noreferrer">臺北市動物醫院一覽表 ↗</a><br /><a href="https://data.taipei/dataset/detail?id=aeaaa517-089c-42a7-ad5b-60fef89c3545" target="_blank" rel="noreferrer">臺北市準公共化托嬰中心 ↗</a><br /><a href="https://data.taipei/dataset/detail?id=e7b45593-9d44-469c-97fa-f1a52c69ebaa" target="_blank" rel="noreferrer">臺北市托嬰中心評鑑結果 ↗</a><br /><a href="https://data.taipei/dataset/detail?id=d455b149-1a2f-4d5a-a9a8-315eb71f51f6" target="_blank" rel="noreferrer">臺北市老人福利機構名冊 ↗</a></p></article></div>
      </section>}
      </Suspense>
    </main>
    <footer>{t.footer}</footer>
  </div>;
}
