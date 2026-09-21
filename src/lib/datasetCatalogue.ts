export type CatalogueLanguage = 'zh' | 'en';
export type CatalogueItem = readonly [id: string, label: string];

export const catalogueCategories = [
  { id: 'health', label: { zh: '健康與醫療', en: 'Health and medical care' }, keywords: ['醫療', '健康', '醫院', '診所', 'medical', 'health', 'hospital', 'clinic'] },
  { id: 'care', label: { zh: '社福、家庭與照顧', en: 'Social welfare, family and care' }, keywords: ['社福', '照顧', '家庭', 'welfare', 'care', 'family'] },
  { id: 'work', label: { zh: '就業、產業與商業', en: 'Work, industry and business' }, keywords: ['就業', '勞動', '產業', '商業', 'employment', 'labour', 'labor', 'industry', 'business'] },
  { id: 'learning', label: { zh: '教育、文化與旅遊', en: 'Education, culture and travel' }, keywords: ['教育', '文化', '旅遊', '學校', 'education', 'culture', 'travel'] },
  { id: 'city', label: { zh: '城市服務、環境與生活', en: 'City services, environment and daily life' }, keywords: ['環境', '生活', '住宅', '消費', 'city', 'environment', 'consumer'] },
  { id: 'animals', label: { zh: '動物與寵物', en: 'Animals and pets' }, keywords: ['動物', '寵物', '獸醫', 'animal', 'pet', 'veterinary'] },
  { id: 'insights', label: { zh: '探索、比較與說明', en: 'Explore, compare and notes' }, keywords: ['比較', '總覽', '說明', 'compare', 'overview', 'notes'] },
] as const;

export type CatalogueCategoryId = (typeof catalogueCategories)[number]['id'];

const categoryMembers: Record<CatalogueCategoryId, string[]> = {
  health: ['vaccinationProviders', 'medicalRadiologicalInstitutions', 'gbsScreeningClinics', 'highMyopiaPreventionClinics', 'kidneyHealthPromotionFacilities', 'nationwideAddictionTreatmentServices', 'addictionTreatmentFacilities', 'internetAddictionServices', 'influenzaVaccineProvidersUnder3', 'hearingCenters', 'entFacilities', 'orthopedicFacilities', 'rehabilitationMedicineInstitutions', 'xrayExaminationMedicalInstitutions', 'hpvProviders', 'childMedicalSubsidyProviders', 'dentureSubsidyProviders', 'telepsychology', 'publicPneumococcalVaccineProviders', 'ophthalmologyInstitutions', 'travelMedicineClinics', 'hospitalDischargeLongTermCarePartners', 'hospicePalliativeCareInstitutions', 'hemodialysisMedicalInstitutions', 'internalMedicineInstitutions', 'occupationalTherapyClinics', 'physicalTherapyClinics', 'designatedForeignerHealthExamHospitals', 'earlyInterventionMedicalProviders', 'generalDentalMedicalInstitutions', 'pediatricMedicalInstitutions', 'diabetesSharedCareMedicalInstitutions', 'fertilitySubsidyContractedHospitals', 'fiveCancerScreeningProviders', 'rotavirusVaccineSubsidyProviders', 'generalWesternMedicineInstitutions', 'schoolchildDentalPreventiveCareProviders', 'hospitalHemodialysisResources', 'adultInfluenzaVaccineProviders', 'homeNursingInstitutions', 'optometryInstitutions', 'generalChineseMedicineInstitutions', 'medicalLaboratories', 'tbContactScreeningPartnerProviders', 'publicInfluenzaAntiviralProviders', 'influenzaVaccineProvidersChildren3Plus', 'familyMedicineInstitutions', 'cosmeticMedicineSupervision2024', 'plasticSurgeryMedicalInstitutions', 'obstetricsGynecologyInstitutions', 'psychiatricClinics', 'licensedAssistedReproductionInstitutions', 'postpartumCareInstitutions', 'psychiatricRehabilitationAndNursingInstitutions'],
  care: ['civic', 'emergencyAssistanceProviders', 'childYouthWelfareInstitutions', 'disabilityDayServices', 'seniorServices', 'hakkaOrganizations', 'fixedSiteTemporaryChildcare', 'earlyInterventionCommunityServices', 'homeDisabledFamilyPhysicianCareProviders', 'disabilityEmploymentResources', 'shelteredWorkshops', 'elderlyWelfare', 'seniorGroupMealServiceSites', 'childYouthFriendlyWelfareServiceSites', 'disabilityInstitutionCapacityAndVacancies', 'privateSeniorResidentialLongTermCareInstitutions', 'seniorCareInstitutionEvaluations', 'seniorServiceSiteCourses', 'visuallyImpairedMassageEstablishments', 'socialWelfareFoundations', 'communityCareServiceSites', 'seniorCareCapacityAndOccupancy', 'communityPublicChildcareHomes', 'communityIntegratedCareLevelCUnits', 'registeredAfterSchoolCareCentres', 'subsidizedSeniorResidentialPlacementInstitutions', 'indigenousCommunityOrganizations', 'communityDevelopmentAssociations', 'childYouthResidentialPlacementInstitutions', 'infantCare', 'infantCareEvaluations'],
  work: ['laborPensionActViolations', 'employmentAgencies', 'licensedPawnshops', 'licensedArcades', 'licensedSpecialEntertainment', 'registeredFactories', 'enterpriseHeadquarters', 'publicLiabilityInsurance', 'businessChanges', 'companyChanges', 'laborUnions', 'biotechCompanies', 'grants', 'procurement', 'laborViolations', 'oshViolations', 'genderEqualityViolations', 'nangangCompanies', 'dawannanCompanies', 'majorElectricityUsers', 'waterPipeInstallationContractors', 'approvedGasWaterHeaterInstallers', 'domesticEmploymentServiceAgencies', 'pestControlBusinesses', 'alternativeServiceReserveStatistics', 'domesticEmploymentAgencyEvaluations', 'beautyHairdressingHygieneCertifications', 'licensedNaturalGasPipelineContractors'],
  learning: ['educationVolunteerRecognitionRecords', 'performingArts', 'travelAccommodations', 'cramSchools', 'taipeiCulturalHeritageAssets', 'privateCulturalHeritageSubsidies', 'culturalArtsFoundations', 'streetPerformerVenues', 'kindergartenEvaluationPass', 'artsCulturalVenues'],
  city: ['sportsPublicParticipation', 'mayorCeremonialGiftStatistics', 'healthcareWelfareBudget', 'entrustedPublicAssetOperations', 'environmentalPesticideVendors', 'recyclingOrganizations', 'governmentEthicsOffices', 'cemeteryPublicFacilities', 'funeralServiceBusinesses', 'consumerDisputeAbsence', 'hotels', 'withdrawnIllegalHotelEnforcementRecords', 'hotelHygieneDirectory', 'outCityFuneralBusinesses', 'bottledGasRetailers', 'licensedWasteCookingOilCollectors', 'lodgingBusinessPenaltyRecords', 'taipeiGovernmentApplicationServices'],
  animals: ['animalHospitals', 'animalMedicineSellers', 'petBusinessEvaluations', 'veterinarians', 'rabiesVaccinationVeterinaryClinics', 'petRegistrationStations'],
  insights: ['comparison', 'overview', 'notes'],
};

export const datasetCategoryById = Object.fromEntries(
  Object.entries(categoryMembers).flatMap(([category, ids]) => ids.map((id) => [id, category as CatalogueCategoryId])),
) as Record<string, CatalogueCategoryId>;

datasetCategoryById.clinicalPathologyFacilities = 'health';
datasetCategoryById.methadoneCrossRegionServices = 'health';
datasetCategoryById.oralMaxillofacialSurgeryFacilities = 'health';
datasetCategoryById.radiologyDiagnosticFacilities = 'health';
datasetCategoryById.anatomicalPathologyInstitutions = 'health';
datasetCategoryById.childPreventiveHealthcareFacilities = 'health';


export const datasetSearchKeywords: Record<string, string[]> = {
  vaccinationProviders: ['疫苗', '預防針', '接種', 'vaccination', 'vaccine', 'immunization', 'immunisation'],
  hpvProviders: ['疫苗', '預防針', '接種', '子宮頸癌', 'hpv', 'human papillomavirus', 'vaccination', 'vaccine'],
  publicPneumococcalVaccineProviders: ['疫苗', '預防針', '接種', '肺炎鏈球菌', 'pneumococcal', 'pneumonia vaccine', 'vaccination', 'vaccine'],
  influenzaVaccineProvidersUnder3: ['疫苗', '預防針', '接種', '流感', '幼兒疫苗', 'flu shot', 'influenza vaccine', 'vaccination', 'vaccine'],
  influenzaVaccineProvidersChildren3Plus: ['疫苗', '預防針', '接種', '流感', '幼童疫苗', 'flu shot', 'influenza vaccine', 'vaccination', 'vaccine'],
  adultInfluenzaVaccineProviders: ['疫苗', '預防針', '接種', '流感', '成人疫苗', 'flu shot', 'influenza vaccine', 'vaccination', 'vaccine'],
  rotavirusVaccineSubsidyProviders: ['疫苗', '預防針', '接種', '輪狀病毒', 'rotavirus', 'vaccination', 'vaccine'],
  rabiesVaccinationVeterinaryClinics: ['疫苗', '預防針', '接種', '狂犬病', 'rabies vaccine', 'vaccination'],

  fixedSiteTemporaryChildcare: ['托育', '托兒', '托嬰', '臨托', 'childcare', 'daycare', 'temporary care'],
  communityPublicChildcareHomes: ['托育', '托兒', '托嬰', '公共托育', 'childcare', 'daycare', 'nursery'],
  registeredAfterSchoolCareCentres: ['托育', '課後照顧', '安親', 'childcare', 'after school', 'after-school care'],
  infantCare: ['托育', '托兒', '托嬰', '嬰幼兒', 'childcare', 'infant care', 'nursery'],
  infantCareEvaluations: ['托育', '托兒', '托嬰', '托嬰評鑑', 'childcare', 'infant care', 'nursery evaluation'],

  laborUnions: ['工會', '職工會', '產業工會', 'union', 'labor union', 'labour union'],
  laborViolations: ['勞基法', '勞動基準法', '勞動違規', 'labor standards', 'labour standards', 'labor violation', 'labour violation'],
  laborPensionActViolations: ['勞退', '勞工退休金', '退休金違規', 'labor pension', 'labour pension'],
  oshViolations: ['職安', '職業安全', '職業安全衛生', 'occupational safety', 'workplace safety'],
  genderEqualityViolations: ['性平', '職場性平', '性別平等工作', 'gender equality', 'workplace equality'],

  emergencyAssistanceProviders: ['急難救助', '急難', '救助', 'emergency assistance', 'emergency aid'],
  childYouthWelfareInstitutions: ['兒少福利', '兒童福利', '少年福利', '青少年福利', 'child welfare', 'youth welfare'],
  elderlyWelfare: ['老人福利', '長者福利', '高齡福利', 'elderly welfare', 'senior welfare'],
  socialWelfareFoundations: ['社會福利', '社福基金會', '福利基金會', 'social welfare', 'welfare foundation'],
  disabilityDayServices: ['身障福利', '身心障礙', '日間服務', 'disability welfare', 'day service'],

  funeralServiceBusinesses: ['殯葬', '葬儀', '禮儀服務', 'funeral', 'mortuary', 'funeral service'],
  outCityFuneralBusinesses: ['殯葬', '葬儀', '禮儀服務', '外縣市殯葬', 'funeral', 'mortuary', 'funeral service'],
  cemeteryPublicFacilities: ['殯葬', '墓園', '公墓', '納骨', 'cemetery', 'burial', 'columbarium'],

  artsCulturalVenues: ['藝文場館', '文化場館', '展演場館', '藝文館所', 'arts venue', 'cultural venue', 'performance venue'],
  streetPerformerVenues: ['街頭藝人', '街頭表演', '展演地點', 'street performer', 'street performance', 'performance venue'],
  performingArts: ['表演藝術', '演藝', '演藝團體', 'performing arts', 'performance group'],
  taipeiCulturalHeritageAssets: ['文化資產', '古蹟', '歷史建築', '文化資產保存', 'cultural heritage', 'historic site'],
};

function normalizeSearch(value: string) {
  return value.trim().toLocaleLowerCase().replaceAll('臺', '台').replace(/\s+/g, ' ');
}

export function buildDatasetCatalogue(items: CatalogueItem[], language: CatalogueLanguage, query = '') {
  const normalizedQuery = normalizeSearch(query);
  const uncategorized = items.filter(([id]) => !datasetCategoryById[id]).map(([id]) => id);
  if (uncategorized.length) throw new Error(`Datasets missing a catalogue category: ${uncategorized.join(', ')}`);

  return catalogueCategories.map((category) => {
    const categorySearchText = normalizeSearch(`${category.label.zh} ${category.label.en} ${category.keywords.join(' ')}`);
    const matchingItems = items.filter(([id, label]) => {
      if (datasetCategoryById[id] !== category.id) return false;
      if (!normalizedQuery) return true;
      const itemSearchText = normalizeSearch(`${label} ${datasetSearchKeywords[id]?.join(' ') ?? ''}`);
      return itemSearchText.includes(normalizedQuery) || categorySearchText.includes(normalizedQuery);
    });
    return { ...category, title: category.label[language], items: matchingItems };
  }).filter((category) => category.items.length);
}
