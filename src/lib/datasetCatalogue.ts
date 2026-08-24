export type CatalogueLanguage = 'zh' | 'en';
export type CatalogueItem = readonly [id: string, label: string];

export const catalogueCategories = [
  { id: 'health', label: { zh: '健康與醫療', en: 'Health and medical care' }, keywords: ['醫療', '健康', '疫苗', '醫院', 'medical', 'health', 'vaccine'] },
  { id: 'care', label: { zh: '社福、家庭與照顧', en: 'Social welfare, family and care' }, keywords: ['社福', '照顧', '兒少', '老人', '身障', 'welfare', 'care', 'family'] },
  { id: 'work', label: { zh: '就業、產業與商業', en: 'Work, industry and business' }, keywords: ['就業', '勞動', '產業', '商業', 'employment', 'labour', 'industry', 'business'] },
  { id: 'learning', label: { zh: '教育、文化與旅遊', en: 'Education, culture and travel' }, keywords: ['教育', '文化', '旅遊', '學校', 'education', 'culture', 'travel'] },
  { id: 'city', label: { zh: '城市服務、環境與生活', en: 'City services, environment and daily life' }, keywords: ['環境', '生活', '住宅', '消費', 'city', 'environment', 'consumer'] },
  { id: 'animals', label: { zh: '動物與寵物', en: 'Animals and pets' }, keywords: ['動物', '寵物', '獸醫', 'animal', 'pet', 'veterinary'] },
  { id: 'insights', label: { zh: '探索、比較與說明', en: 'Explore, compare and notes' }, keywords: ['比較', '總覽', '說明', 'compare', 'overview', 'notes'] },
] as const;

export type CatalogueCategoryId = (typeof catalogueCategories)[number]['id'];

const categoryMembers: Record<CatalogueCategoryId, string[]> = {
  health: ['vaccinationProviders', 'nationwideAddictionTreatmentServices', 'addictionTreatmentFacilities', 'internetAddictionServices', 'influenzaVaccineProvidersUnder3', 'hearingCenters', 'entFacilities', 'orthopedicFacilities', 'rehabilitationMedicineInstitutions', 'xrayExaminationMedicalInstitutions', 'hpvProviders', 'childMedicalSubsidyProviders', 'dentureSubsidyProviders', 'telepsychology', 'publicPneumococcalVaccineProviders', 'ophthalmologyInstitutions', 'travelMedicineClinics', 'hospitalDischargeLongTermCarePartners', 'hospicePalliativeCareInstitutions', 'hemodialysisMedicalInstitutions', 'internalMedicineInstitutions', 'occupationalTherapyClinics', 'physicalTherapyClinics', 'designatedForeignerHealthExamHospitals', 'earlyInterventionMedicalProviders', 'generalDentalMedicalInstitutions', 'pediatricMedicalInstitutions', 'diabetesSharedCareMedicalInstitutions', 'fertilitySubsidyContractedHospitals', 'fiveCancerScreeningProviders', 'rotavirusVaccineSubsidyProviders', 'generalWesternMedicineInstitutions', 'schoolchildDentalPreventiveCareProviders', 'hospitalHemodialysisResources', 'adultInfluenzaVaccineProviders', 'homeNursingInstitutions', 'optometryInstitutions', 'generalChineseMedicineInstitutions', 'medicalLaboratories', 'tbContactScreeningPartnerProviders', 'publicInfluenzaAntiviralProviders', 'influenzaVaccineProvidersChildren3Plus', 'familyMedicineInstitutions', 'cosmeticMedicineSupervision2024', 'plasticSurgeryMedicalInstitutions', 'obstetricsGynecologyInstitutions', 'psychiatricClinics', 'licensedAssistedReproductionInstitutions', 'postpartumCareInstitutions', 'psychiatricRehabilitationAndNursingInstitutions'],
  care: ['civic', 'emergencyAssistanceProviders', 'childYouthWelfareInstitutions', 'disabilityDayServices', 'seniorServices', 'hakkaOrganizations', 'fixedSiteTemporaryChildcare', 'earlyInterventionCommunityServices', 'homeDisabledFamilyPhysicianCareProviders', 'disabilityEmploymentResources', 'shelteredWorkshops', 'elderlyWelfare', 'seniorGroupMealServiceSites', 'childYouthFriendlyWelfareServiceSites', 'disabilityInstitutionCapacityAndVacancies', 'privateSeniorResidentialLongTermCareInstitutions', 'seniorCareInstitutionEvaluations', 'seniorServiceSiteCourses', 'visuallyImpairedMassageEstablishments', 'socialWelfareFoundations', 'communityCareServiceSites', 'seniorCareCapacityAndOccupancy', 'communityPublicChildcareHomes', 'communityIntegratedCareLevelCUnits', 'registeredAfterSchoolCareCentres', 'subsidizedSeniorResidentialPlacementInstitutions', 'indigenousCommunityOrganizations', 'communityDevelopmentAssociations', 'childYouthResidentialPlacementInstitutions', 'infantCare', 'infantCareEvaluations'],
  work: ['laborPensionActViolations', 'employmentAgencies', 'licensedPawnshops', 'licensedArcades', 'licensedSpecialEntertainment', 'registeredFactories', 'enterpriseHeadquarters', 'publicLiabilityInsurance', 'businessChanges', 'companyChanges', 'laborUnions', 'biotechCompanies', 'grants', 'procurement', 'laborViolations', 'oshViolations', 'genderEqualityViolations', 'nangangCompanies', 'dawannanCompanies', 'majorElectricityUsers', 'waterPipeInstallationContractors', 'approvedGasWaterHeaterInstallers', 'domesticEmploymentServiceAgencies', 'pestControlBusinesses', 'alternativeServiceReserveStatistics', 'domesticEmploymentAgencyEvaluations', 'beautyHairdressingHygieneCertifications', 'licensedNaturalGasPipelineContractors'],
  learning: ['educationVolunteerRecognitionRecords', 'performingArts', 'travelAccommodations', 'cramSchools', 'taipeiCulturalHeritageAssets', 'privateCulturalHeritageSubsidies', 'culturalArtsFoundations', 'streetPerformerVenues', 'kindergartenEvaluationPass', 'artsCulturalVenues'],
  city: ['entrustedPublicAssetOperations', 'environmentalPesticideVendors', 'recyclingOrganizations', 'governmentEthicsOffices', 'cemeteryPublicFacilities', 'funeralServiceBusinesses', 'consumerDisputeAbsence', 'hotels', 'withdrawnIllegalHotelEnforcementRecords', 'hotelHygieneDirectory', 'outCityFuneralBusinesses', 'bottledGasRetailers', 'licensedWasteCookingOilCollectors', 'lodgingBusinessPenaltyRecords', 'taipeiGovernmentApplicationServices'],
  animals: ['animalHospitals', 'animalMedicineSellers', 'petBusinessEvaluations', 'veterinarians', 'rabiesVaccinationVeterinaryClinics', 'petRegistrationStations'],
  insights: ['comparison', 'overview', 'notes'],
};

export const datasetCategoryById = Object.fromEntries(
  Object.entries(categoryMembers).flatMap(([category, ids]) => ids.map((id) => [id, category as CatalogueCategoryId])),
) as Record<string, CatalogueCategoryId>;

export function buildDatasetCatalogue(items: CatalogueItem[], language: CatalogueLanguage, query = '') {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const uncategorized = items.filter(([id]) => !datasetCategoryById[id]).map(([id]) => id);
  if (uncategorized.length) throw new Error(`Datasets missing a catalogue category: ${uncategorized.join(', ')}`);

  return catalogueCategories.map((category) => {
    const matchingItems = items.filter(([id, label]) => datasetCategoryById[id] === category.id && (!normalizedQuery || `${label} ${category.label.zh} ${category.label.en} ${category.keywords.join(' ')}`.toLocaleLowerCase().includes(normalizedQuery)));
    return { ...category, title: category.label[language], items: matchingItems };
  }).filter((category) => category.items.length);
}
