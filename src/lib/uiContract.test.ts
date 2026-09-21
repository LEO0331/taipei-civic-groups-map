import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const readSource = (path: string) => readFile(new URL(path, import.meta.url), 'utf8');

test('the application keeps the primary directory controls labelled, searchable, and stateful', async () => {
  const source = await readSource('../App.tsx');
  assert.match(source, /<nav className="catalogue-nav" aria-label=/);
  assert.match(source, /aria-expanded=\{catalogueOpen\}/);
  assert.match(source, /catalogue-search/);
  assert.match(source, /aria-current=\{tab === id \? 'page' : undefined\}/);
  assert.match(source, /DirectoryModuleLoading/);
});

test('the data-trust disclosure stays semantic while keeping detail secondary', async () => {
  const source = await readSource('../DataTrustPanel.tsx');
  const app = await readSource('../App.tsx');
  assert.match(source, /<aside className="data-trust" data-attention=\{attention\} aria-label=/);
  assert.match(source, /className="data-trust-primary" role="status" aria-live="polite"/);
  assert.match(source, /<details className="data-trust-details">/);
  assert.match(source, /<summary>\{zh \? '詳細資訊' : 'Details'\}<\/summary>/);
  assert.match(source, /attentionLevel/);
  assert.match(app, /activeDatasetLabel=\{activeDatasetLabel\}/);
});

test('the shared stylesheet retains a visible keyboard focus treatment', async () => {
  const source = await readSource('../styles.css');
  assert.match(source, /:focus-visible/);
  assert.match(source, /--focus-ring/);
});


test('tab navigation uses the shared accessible contract without the runtime legacy bridge', async () => {
  const tabs = await readSource('../AccessibleTabs.tsx');
  const app = await readSource('../App.tsx');
  assert.match(tabs, /role="tablist"/);
  assert.match(tabs, /role="tab"/);
  assert.match(tabs, /aria-selected=\{selected\}/);
  assert.match(tabs, /aria-controls=/);
  assert.match(tabs, /ArrowRight/);
  assert.match(tabs, /ArrowLeft/);
  assert.match(tabs, /Home/);
  assert.match(tabs, /End/);
  assert.doesNotMatch(app, /LegacyTabAccessibility/);
});


test('dataset pages expose a stable active UI family and shared family frame contract', async () => {
  const app = await readSource('../App.tsx');
  const frame = await readSource('../DatasetFamilyFrame.tsx');
  const families = await readSource('./datasetUiFamily.ts');
  assert.match(app, /data-active-ui-family=\{uiFamilyForDataset\(tab\)\}/);
  assert.match(frame, /data-ui-family=\{family\}/);
  assert.match(frame, /dataset-family-heading/);
  assert.match(families, /healthcareRichDirectory/);
  assert.match(families, /recordsAnalysis/);
  assert.match(families, /statisticsAnalysis/);
});


test('Registry Business A modules use the shared registry shell and accessible tabs', async () => {
  const modules = [
    '../EmploymentAgencyIntermediaryCompaniesModule.tsx',
    '../LicensedElectronicGameArcadeOperatorsModule.tsx',
    '../LicensedSpecialEntertainmentBusinessOperatorsModule.tsx',
    '../RegisteredFactoryDistributionModule.tsx',
    '../EnterpriseHeadquartersDistributionModule.tsx',
    '../BiotechCompanyDirectoryModule.tsx',
    '../NangangSoftwareParkCompaniesModule.tsx',
    '../DawannanIndustrialAreaCompaniesModule.tsx',
  ];

  for (const modulePath of modules) {
    const source = await readSource(modulePath);
    assert.match(source, /<DatasetFamilyFrame family=\{UI_FAMILIES\.registryDirectory\}>/, modulePath);
    assert.match(source, /<AccessibleTabs /, modulePath);
    assert.doesNotMatch(source, /<div className="subtabs">\{(?:views|tabs)\.map/, modulePath);
  }
});


test('Registry Business B modules use the shared registry shell and accessible tabs', async () => {
  const modules = [
    '../WaterPipeInstallationContractorsModule.tsx',
    '../ApprovedGasWaterHeaterInstallersModule.tsx',
    '../PestControlBusinessesModule.tsx',
    '../BeautyHairdressingHygieneCertificationsModule.tsx',
    '../LicensedNaturalGasPipelineContractorsModule.tsx',
  ];

  for (const modulePath of modules) {
    const source = await readSource(modulePath);
    assert.match(source, /<DatasetFamilyFrame family=\{UI_FAMILIES\.registryDirectory\}>/, modulePath);
    assert.match(source, /<AccessibleTabs /, modulePath);
    assert.doesNotMatch(source, /<div className="subtabs">/, modulePath);
  }

  const generated = await readSource('../GeneratedDatasetDirectoryModule.tsx');
  const app = await readSource('../App.tsx');
  assert.match(generated, /GeneratedDirectoryFrame uiFamily=\{uiFamily\}/);
  assert.match(generated, /<DatasetFamilyHeading /);
  assert.match(app, /tab === 'domesticEmploymentServiceAgencies'[\s\S]*uiFamily=\{uiFamilyForDataset\(tab\)\}/);
});


test('Registry Social A modules use the shared registry shell without inventing single-view tabs', async () => {
  const singleViewModules = [
    '../EmergencyAssistanceProvidersModule.tsx',
    '../ChildYouthWelfareInstitutionsModule.tsx',
    '../DisabilityDayServicesModule.tsx',
    '../SeniorServicesModule.tsx',
    '../EarlyInterventionCommunityServicesModule.tsx',
    '../HomeDisabledFamilyPhysicianCareProvidersModule.tsx',
  ];
  for (const modulePath of singleViewModules) {
    const source = await readSource(modulePath);
    assert.match(source, /<DatasetFamilyFrame family=\{UI_FAMILIES\.registryDirectory\}>/, modulePath);
    assert.match(source, /<DatasetFamilyHeading/, modulePath);
    assert.doesNotMatch(source, /<AccessibleTabs /, modulePath);
  }

  for (const modulePath of [
    '../HakkaOrganizationsModule.tsx',
    '../ShelteredWorkshopDirectoryModule.tsx',
  ]) {
    const source = await readSource(modulePath);
    assert.match(source, /<DatasetFamilyFrame family=\{UI_FAMILIES\.registryDirectory\}>/, modulePath);
    assert.match(source, /<DatasetFamilyHeading/, modulePath);
    assert.match(source, /<AccessibleTabs /, modulePath);
    assert.doesNotMatch(source, /<div className="subtabs"/, modulePath);
  }
});


test('Registry Social B modules use the shared registry shell and remove legacy or faux tabs', async () => {
  for (const modulePath of [
    '../ElderlyWelfareInstitutionsModule.tsx',
    '../DisabilityInstitutionCapacityAndVacanciesModule.tsx',
    '../SeniorServiceSiteCoursesModule.tsx',
    '../VisuallyImpairedMassageEstablishmentsModule.tsx',
  ]) {
    const source = await readSource(modulePath);
    assert.match(source, /<DatasetFamilyFrame family=\{UI_FAMILIES\.registryDirectory\}>/, modulePath);
    assert.match(source, /<DatasetFamilyHeading/, modulePath);
    assert.match(source, /<AccessibleTabs /, modulePath);
    assert.doesNotMatch(source, /<div className="subtabs"/, modulePath);
  }

  const privateSenior = await readSource('../PrivateSeniorResidentialLongTermCareInstitutionsModule.tsx');
  assert.match(privateSenior, /uiFamily=\{UI_FAMILIES\.registryDirectory\}/);

  const childcare = await readSource('../CommunityPublicChildcareHomesModule.tsx');
  assert.match(childcare, /<DatasetFamilyFrame family=\{UI_FAMILIES\.registryDirectory\}>/);
  assert.match(childcare, /<DatasetFamilyHeading/);
  assert.doesNotMatch(childcare, /<div className="subtabs"/);
  assert.doesNotMatch(childcare, /<AccessibleTabs /);

  const app = await readSource('../App.tsx');
  assert.match(app, /tab === 'socialWelfareFoundations'[\s\S]*uiFamily=\{uiFamilyForDataset\(tab\)\}/);
});


test('Registry Social C modules use the shared registry shell and keep only real tabs', async () => {
  for (const modulePath of [
    '../RegisteredAfterSchoolCareCentresModule.tsx',
    '../SubsidizedSeniorResidentialPlacementInstitutionsModule.tsx',
    '../IndigenousCommunityOrganizationsModule.tsx',
    '../CommunityDevelopmentAssociationsModule.tsx',
    '../QuasiPublicInfantCareCentersModule.tsx',
  ]) {
    const source = await readSource(modulePath);
    assert.match(source, /<DatasetFamilyFrame family=\{UI_FAMILIES\.registryDirectory\}>/, modulePath);
    assert.match(source, /<DatasetFamilyHeading/, modulePath);
    assert.match(source, /<AccessibleTabs /, modulePath);
    assert.doesNotMatch(source, /<div className="subtabs"/, modulePath);
  }

  const childYouth = await readSource('../ChildYouthResidentialPlacementInstitutionsModule.tsx');
  assert.match(childYouth, /<DatasetFamilyFrame family=\{UI_FAMILIES\.registryDirectory\}>/);
  assert.match(childYouth, /<DatasetFamilyHeading/);
  assert.doesNotMatch(childYouth, /<div className="subtabs"/);
  assert.doesNotMatch(childYouth, /<AccessibleTabs /);
});


test('Registry Culture and Pets modules use the shared registry shell and accessible tabs', async () => {
  for (const modulePath of [
    '../RegisteredCramSchoolsModule.tsx',
    '../PrivateCulturalHeritageSubsidiesModule.tsx',
    '../CulturalArtsFoundationsModule.tsx',
    '../RegisteredAnimalHospitalsModule.tsx',
    '../LicensedAnimalMedicineSellersModule.tsx',
    '../VeterinarianProfessionalRegistryModule.tsx',
    '../RabiesVaccinationVeterinaryClinicsModule.tsx',
  ]) {
    const source = await readSource(modulePath);
    assert.match(source, /<DatasetFamilyFrame family=\{UI_FAMILIES\.registryDirectory\}>/, modulePath);
    assert.match(source, /<DatasetFamilyHeading/, modulePath);
    assert.match(source, /<AccessibleTabs /, modulePath);
    assert.doesNotMatch(source, /<div className="subtabs"/, modulePath);
  }

  const heritage = await readSource('../TaipeiCulturalHeritageAssetsModule.tsx');
  assert.match(heritage, /uiFamily=\{UI_FAMILIES\.registryDirectory\}/);

  const app = await readSource('../App.tsx');
  assert.match(app, /tab === 'petRegistrationStations'[\s\S]*uiFamily=\{uiFamilyForDataset\(tab\)\}/);
});


test('Registry City Services modules use the shared registry shell and only real tabs', async () => {
  for (const modulePath of [
    '../RegisteredRecyclingBusinessOrganizationsModule.tsx',
    '../FuneralServiceBusinessesModule.tsx',
    '../LicensedWasteCookingOilCollectorsModule.tsx',
    '../TaipeiGovernmentApplicationServicesModule.tsx',
  ]) {
    const source = await readSource(modulePath);
    assert.match(source, /<DatasetFamilyFrame family=\{UI_FAMILIES\.registryDirectory\}>/, modulePath);
    assert.match(source, /<DatasetFamilyHeading/, modulePath);
    assert.match(source, /<AccessibleTabs /, modulePath);
    assert.doesNotMatch(source, /<div className="subtabs"/, modulePath);
  }

  for (const modulePath of [
    '../EntrustedPublicAssetOperationsModule.tsx',
    '../EnvironmentalPesticideVendorsModule.tsx',
    '../GovernmentEthicsOfficesModule.tsx',
  ]) {
    const source = await readSource(modulePath);
    assert.match(source, /<DatasetFamilyFrame family=\{UI_FAMILIES\.registryDirectory\}>/, modulePath);
    assert.match(source, /<DatasetFamilyHeading/, modulePath);
    assert.doesNotMatch(source, /<AccessibleTabs /, modulePath);
  }

  const wasteOil = await readSource('../LicensedWasteCookingOilCollectorsModule.tsx');
  assert.doesNotMatch(wasteOil, /\['permits'/);
  assert.doesNotMatch(wasteOil, /\['quality'/);

  const app = await readSource('../App.tsx');
  for (const dataset of ['bottledGasRetailers', 'outCityFuneralBusinesses', 'hotelHygieneDirectory']) {
    assert.match(app, new RegExp(`tab === '${dataset}'[\\s\\S]*?uiFamily=\\{uiFamilyForDataset\\(tab\\)\\}`));
  }
});


test('Records Compliance modules use the shared records-analysis shell and only real tabs', async () => {
  for (const modulePath of [
    '../OccupationalSafetyHealthViolationsModule.tsx',
    '../GenderEqualityWorkActViolationsModule.tsx',
  ]) {
    const source = await readSource(modulePath);
    assert.match(source, /<DatasetFamilyFrame family=\{UI_FAMILIES\.recordsAnalysis\}>/, modulePath);
    assert.match(source, /<DatasetFamilyHeading/, modulePath);
    assert.match(source, /<AccessibleTabs /, modulePath);
    assert.doesNotMatch(source, /<div className="subtabs"/, modulePath);
  }

  const pension = await readSource('../LaborPensionActViolationsModule.tsx');
  assert.match(pension, /<DatasetFamilyFrame family=\{UI_FAMILIES\.recordsAnalysis\}>/);
  assert.match(pension, /<DatasetFamilyHeading/);
  assert.doesNotMatch(pension, /<AccessibleTabs /);
  assert.doesNotMatch(pension, /<div className="subtabs"/);
});


test('Records General modules use the shared records-analysis shell and keep single-view pages tab-free', async () => {
  for (const modulePath of [
    '../BusinessPremisesPublicLiabilityInsuranceModule.tsx',
    '../BusinessRegistrationChangesModule.tsx',
    '../CompanyRegistrationChangesModule.tsx',
    '../MetroProcurementModule.tsx',
    '../ConsumerDisputeAbsentBusinessOperatorsModule.tsx',
    '../WithdrawnIllegalHotelEnforcementRecordsModule.tsx',
  ]) {
    const source = await readSource(modulePath);
    assert.match(source, /<DatasetFamilyFrame family=\{UI_FAMILIES\.recordsAnalysis\}>/, modulePath);
    assert.match(source, /<DatasetFamilyHeading/, modulePath);
    assert.match(source, /<AccessibleTabs /, modulePath);
    assert.doesNotMatch(source, /<div className="subtabs"/, modulePath);
  }

  for (const modulePath of [
    '../EducationVolunteerRecognitionRecordsModule.tsx',
    '../LodgingBusinessPenaltyRecordsModule.tsx',
  ]) {
    const source = await readSource(modulePath);
    assert.match(source, /<DatasetFamilyFrame family=\{UI_FAMILIES\.recordsAnalysis\}>/, modulePath);
    assert.match(source, /<DatasetFamilyHeading/, modulePath);
    assert.doesNotMatch(source, /<AccessibleTabs /, modulePath);
    assert.doesNotMatch(source, /<div className="subtabs"/, modulePath);
  }
});


test('Statistics Evaluations modules use the shared statistics-analysis shell and keep the single-view page tab-free', async () => {
  for (const modulePath of [
    '../CosmeticMedicineSupervision2024Module.tsx',
    '../SeniorCareInstitutionEvaluationsModule.tsx',
    '../InfantCareCenterEvaluationResultsModule.tsx',
    '../SpecificPetBusinessEvaluationResultsModule.tsx',
  ]) {
    const source = await readSource(modulePath);
    assert.match(source, /<DatasetFamilyFrame family=\{UI_FAMILIES\.statisticsAnalysis\}>/, modulePath);
    assert.match(source, /<DatasetFamilyHeading/, modulePath);
    assert.match(source, /<AccessibleTabs /, modulePath);
    assert.doesNotMatch(source, /<div className="subtabs"/, modulePath);
  }

  const domestic = await readSource('../DomesticEmploymentAgencyEvaluationsModule.tsx');
  assert.match(domestic, /<DatasetFamilyFrame family=\{UI_FAMILIES\.statisticsAnalysis\}>/);
  assert.match(domestic, /<DatasetFamilyHeading/);
  assert.doesNotMatch(domestic, /<AccessibleTabs /);
  assert.doesNotMatch(domestic, /<div className="subtabs"/);

  const app = await readSource('../App.tsx');
  assert.match(app, /tab === 'kindergartenEvaluationPass'[\s\S]*uiFamily=\{uiFamilyForDataset\(tab\)\}/);
});


test('Statistics Analysis modules use the shared statistics-analysis shell and keep true single-view pages tab-free', async () => {
  for (const modulePath of [
    '../IndustryModule.tsx',
    '../MajorElectricityUsersModule.tsx',
  ]) {
    const source = await readSource(modulePath);
    assert.match(source, /<DatasetFamilyFrame family=\{UI_FAMILIES\.statisticsAnalysis\}>/, modulePath);
    assert.match(source, /<DatasetFamilyHeading/, modulePath);
    assert.match(source, /<AccessibleTabs /, modulePath);
    assert.doesNotMatch(source, /<div className="subtabs"/, modulePath);
  }

  for (const modulePath of [
    '../SeniorCareCapacityAndOccupancyModule.tsx',
    '../SportsPublicParticipationModule.tsx',
    '../MayorCeremonialGiftStatisticsModule.tsx',
    '../HealthcareWelfareBudgetModule.tsx',
  ]) {
    const source = await readSource(modulePath);
    assert.match(source, /<DatasetFamilyFrame family=\{UI_FAMILIES\.statisticsAnalysis\}>/, modulePath);
    assert.match(source, /<DatasetFamilyHeading/, modulePath);
    assert.doesNotMatch(source, /<AccessibleTabs /, modulePath);
    assert.doesNotMatch(source, /<div className="subtabs"/, modulePath);
  }

  const reference = await readSource('../AlternativeServiceReserveStatisticsModule.tsx');
  assert.match(reference, /<DatasetFamilyFrame family=\{UI_FAMILIES\.statisticsAnalysis\}>/);
  assert.match(reference, /<AccessibleTabs /);
});


test('Location Social modules use the shared location-directory shell and remove legacy or faux tabs', async () => {
  for (const modulePath of ['../FixedSiteTemporaryChildcareModule.tsx','../DisabilityEmploymentResourceMapModule.tsx','../SeniorGroupMealServiceSitesModule.tsx','../ChildYouthFriendlyWelfareServiceSitesModule.tsx','../CommunityIntegratedCareLevelCUnitsModule.tsx']) {
    const source = await readSource(modulePath);
    assert.match(source, /<DatasetFamilyFrame[^>]*family=\{UI_FAMILIES\.locationDirectory\}/, modulePath);
    assert.match(source, /<DatasetFamilyHeading/, modulePath);
    assert.match(source, /<AccessibleTabs /, modulePath);
    assert.doesNotMatch(source, /<div className="subtabs"/, modulePath);
  }
  const communityCare = await readSource('../CommunityCareServiceSitesModule.tsx');
  assert.match(communityCare, /<DatasetFamilyFrame[^>]*family=\{UI_FAMILIES\.locationDirectory\}/);
  assert.match(communityCare, /<DatasetFamilyHeading/);
  assert.doesNotMatch(communityCare, /<AccessibleTabs /);
  assert.doesNotMatch(communityCare, /<div className="subtabs"/);
});


test('Location Cultural City modules use the shared location-directory shell', async () => {
  for (const modulePath of [
    '../TaipeiTravelAccommodationsZhModule.tsx',
    '../CemeteryPublicFacilitiesModule.tsx',
    '../RegisteredHotelsModule.tsx',
    '../ArtsCulturalVenuesModule.tsx',
  ]) {
    const source = await readSource(modulePath);
    assert.match(source, /<DatasetFamilyFrame[^>]*family=\{UI_FAMILIES\.locationDirectory\}/, modulePath);
    assert.match(source, /<DatasetFamilyHeading/, modulePath);
    assert.match(source, /<AccessibleTabs /, modulePath);
    assert.doesNotMatch(source, /<div className="subtabs"/, modulePath);
  }
  const app = await readSource('../App.tsx');
  assert.match(app, /tab === 'streetPerformerVenues'[\s\S]*?uiFamily=\{uiFamilyForDataset\(tab\)\}[\s\S]*?eyebrow="CULTURE \/ STREET PERFORMANCE \/ VENUES"/);
});

test('Healthcare exception modules use the shared healthcare-standard shell contract', async () => {
  const tabbedModules = [
    '../ContractedVaccinationMedicalProvidersModule.tsx',
    '../PubliclyFundedHpvVaccinationProvidersModule.tsx',
    '../ChildMedicalSubsidyContractedProvidersModule.tsx',
    '../DentureSubsidyMedicalProvidersModule.tsx',
    '../TelepsychologyCounselingInstitutionsModule.tsx',
    '../PublicPneumococcalVaccineProvidersModule.tsx',
    '../OphthalmologyInstitutionsModule.tsx',
    '../TravelMedicineClinicsModule.tsx',
    '../HospitalDischargeLongTermCarePartnersModule.tsx',
    '../EarlyInterventionMedicalProvidersModule.tsx',
    '../GeneralDentalMedicalInstitutionsModule.tsx',
    '../PediatricMedicalInstitutionsModule.tsx',
    '../DiabetesSharedCareMedicalInstitutionsModule.tsx',
    '../FertilitySubsidyContractedHospitalsModule.tsx',
    '../FiveCancerScreeningProvidersModule.tsx',
    '../HomeNursingInstitutionsModule.tsx',
    '../OptometryInstitutionsModule.tsx',
    '../GeneralChineseMedicineInstitutionsModule.tsx',
    '../MedicalLaboratoriesModule.tsx',
    '../PublicInfluenzaAntiviralProvidersModule.tsx',
    '../FamilyMedicineInstitutionsModule.tsx',
    '../PlasticSurgeryMedicalInstitutionsModule.tsx',
    '../ObstetricsGynecologyInstitutionsModule.tsx',
    '../PsychiatricClinicsModule.tsx',
    '../PsychiatricRehabilitationAndNursingInstitutionsModule.tsx',
  ];

  for (const modulePath of tabbedModules) {
    const source = await readSource(modulePath);
    assert.match(source, /<DatasetFamilyFrame[^>]*family=\{UI_FAMILIES\.healthcareStandard\}/, modulePath);
    assert.match(source, /<AccessibleTabs /, modulePath);
    assert.doesNotMatch(source, /<div className="subtabs"/, modulePath);
  }

  const singleViewModules = [
    '../MedicalRadiologicalInstitutionsModule.tsx',
    '../HighMyopiaPreventionClinicsModule.tsx',
    '../NationwideAddictionTreatmentServicesModule.tsx',
    '../InternetAddictionServicesModule.tsx',
    '../HearingCentersModule.tsx',
    '../OrthopedicFacilitiesModule.tsx',
    '../XrayExaminationMedicalInstitutionsModule.tsx',
    '../TbContactScreeningPartnerProvidersModule.tsx',
    '../LicensedAssistedReproductionInstitutionsModule.tsx',
    '../MethadoneCrossRegionServicesModule.tsx',
    '../RadiologyDiagnosticFacilitiesModule.tsx',
    '../ChildPreventiveHealthcareFacilitiesModule.tsx',
  ];

  for (const modulePath of singleViewModules) {
    const source = await readSource(modulePath);
    assert.match(source, /<DatasetFamilyFrame[^>]*family=\{UI_FAMILIES\.healthcareStandard\}/, modulePath);
    assert.doesNotMatch(source, /<div className="subtabs"/, modulePath);
  }

  for (const modulePath of [
    '../HospicePalliativeCareInstitutionsModule.tsx',
    '../HemodialysisMedicalInstitutionsModule.tsx',
    '../InternalMedicineInstitutionsModule.tsx',
    '../OccupationalTherapyClinicsModule.tsx',
    '../DesignatedForeignerHealthExamHospitalsModule.tsx',
  ]) {
    const source = await readSource(modulePath);
    assert.match(source, /<GeneratedDatasetDirectoryModule[\s\S]*?uiFamily=\{UI_FAMILIES\.healthcareStandard\}/, modulePath);
  }

  const app = await readSource('../App.tsx');
  for (const dataset of [
    'generalWesternMedicineInstitutions',
    'rotavirusVaccineSubsidyProviders',
    'schoolchildDentalPreventiveCareProviders',
    'hospitalHemodialysisResources',
    'postpartumCareInstitutions',
  ]) {
    assert.match(app, new RegExp(`tab === '${dataset}'[\\s\\S]*?uiFamily=\\{uiFamilyForDataset\\(tab\\)\\}`), dataset);
  }
  assert.doesNotMatch(app, /LegacyTabAccessibility/);
});

