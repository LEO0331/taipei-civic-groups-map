import { datasetCategoryById, type CatalogueCategoryId } from './datasetCatalogue';
import { UI_FAMILIES, type UiFamily } from './uiFamilies';

const explicitFamilyByDataset: Record<string, UiFamily> = {
  civic: UI_FAMILIES.locationDirectory,
  adultInfluenzaVaccineProviders: UI_FAMILIES.healthcareRichDirectory,
  influenzaVaccineProvidersChildren3Plus: UI_FAMILIES.healthcareRichDirectory,
  physicalTherapyClinics: UI_FAMILIES.locationDirectory,
  disabilityEmploymentResources: UI_FAMILIES.locationDirectory,
  cemeteryPublicFacilities: UI_FAMILIES.locationDirectory,
  travelAccommodations: UI_FAMILIES.locationDirectory,
  hotels: UI_FAMILIES.locationDirectory,
  streetPerformerVenues: UI_FAMILIES.locationDirectory,
  artsCulturalVenues: UI_FAMILIES.locationDirectory,
  fixedSiteTemporaryChildcare: UI_FAMILIES.locationDirectory,
  childYouthFriendlyWelfareServiceSites: UI_FAMILIES.locationDirectory,
  seniorGroupMealServiceSites: UI_FAMILIES.locationDirectory,
  communityCareServiceSites: UI_FAMILIES.locationDirectory,
  communityIntegratedCareLevelCUnits: UI_FAMILIES.locationDirectory,

  businessChanges: UI_FAMILIES.recordsAnalysis,
  companyChanges: UI_FAMILIES.recordsAnalysis,
  publicLiabilityInsurance: UI_FAMILIES.recordsAnalysis,
  laborViolations: UI_FAMILIES.recordsAnalysis,
  oshViolations: UI_FAMILIES.recordsAnalysis,
  genderEqualityViolations: UI_FAMILIES.recordsAnalysis,
  laborPensionActViolations: UI_FAMILIES.recordsAnalysis,
  consumerDisputeAbsence: UI_FAMILIES.recordsAnalysis,
  withdrawnIllegalHotelEnforcementRecords: UI_FAMILIES.recordsAnalysis,
  lodgingBusinessPenaltyRecords: UI_FAMILIES.recordsAnalysis,
  educationVolunteerRecognitionRecords: UI_FAMILIES.recordsAnalysis,
  procurement: UI_FAMILIES.recordsAnalysis,

  alternativeServiceReserveStatistics: UI_FAMILIES.statisticsAnalysis,
  mayorCeremonialGiftStatistics: UI_FAMILIES.statisticsAnalysis,
  healthcareWelfareBudget: UI_FAMILIES.statisticsAnalysis,
  sportsPublicParticipation: UI_FAMILIES.statisticsAnalysis,
  majorElectricityUsers: UI_FAMILIES.statisticsAnalysis,
  seniorCareCapacityAndOccupancy: UI_FAMILIES.statisticsAnalysis,
  cosmeticMedicineSupervision2024: UI_FAMILIES.statisticsAnalysis,
  infantCareEvaluations: UI_FAMILIES.statisticsAnalysis,
  domesticEmploymentAgencyEvaluations: UI_FAMILIES.statisticsAnalysis,
  seniorCareInstitutionEvaluations: UI_FAMILIES.statisticsAnalysis,
  petBusinessEvaluations: UI_FAMILIES.statisticsAnalysis,
  kindergartenEvaluationPass: UI_FAMILIES.statisticsAnalysis,
  grants: UI_FAMILIES.statisticsAnalysis,
  comparison: UI_FAMILIES.statisticsAnalysis,
  overview: UI_FAMILIES.statisticsAnalysis,
  notes: UI_FAMILIES.statisticsAnalysis,
};

const categoryDefaultFamily: Record<CatalogueCategoryId, UiFamily> = {
  health: UI_FAMILIES.healthcareStandard,
  care: UI_FAMILIES.registryDirectory,
  work: UI_FAMILIES.registryDirectory,
  learning: UI_FAMILIES.registryDirectory,
  city: UI_FAMILIES.registryDirectory,
  animals: UI_FAMILIES.registryDirectory,
  insights: UI_FAMILIES.statisticsAnalysis,
};

export function uiFamilyForDataset(datasetId: string): UiFamily {
  return explicitFamilyByDataset[datasetId]
    ?? categoryDefaultFamily[datasetCategoryById[datasetId]]
    ?? UI_FAMILIES.registryDirectory;
}

export function hasExplicitUiFamily(datasetId: string) {
  return Boolean(explicitFamilyByDataset[datasetId] || datasetCategoryById[datasetId]);
}
