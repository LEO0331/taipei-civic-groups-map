# UI family classification and post-demo migration inventory

Updated: 2026-09-18

This inventory records the UI-family classification introduced in Batch H. It is the reference for incremental post-demo shell normalization.

- Total catalogue routes/views: **156**
- Families: **6**
- ★ = directly migrated in Batch H to `DatasetFamilyFrame` / `DatasetFamilyHeading` and shared accessible tabs.
- Unstarred does **not** imply that a page is broken or unstandardized; several were already using shared healthcare/location patterns from earlier batches.
- Migration rule: normalize the shell and interaction contract first; do not rewrite dataset parsing, calculations, filters, charts, or tables without a separate correctness requirement.

| UI family | Count |
| --- | ---: |
| `healthcare-rich-directory` | 2 |
| `healthcare-standard` | 56 |
| `location-directory` | 13 |
| `registry-directory` | 57 |
| `records-analysis` | 12 |
| `statistics-analysis` | 16 |

Post-demo migration status: Batches 01–13 cover `registry-directory`, `records-analysis`, `statistics-analysis`, and `location-directory`; Batch 14 closes the remaining healthcare-exception shells while retaining established compact and rich healthcare patterns.


## `healthcare-rich-directory` — 2

### 健康與醫療 — 2

- 流感疫苗合約醫療院所（成人） — `adultInfluenzaVaccineProviders`
- 3歲以上幼童流感疫苗特約院所 — `influenzaVaccineProvidersChildren3Plus`

## `healthcare-standard` — 56

### 健康與醫療 — 56

- 預防接種院所 — `vaccinationProviders`
- 醫事放射所 — `medicalRadiologicalInstitutions`
- 孕婦 GBS 篩檢特約院所 — `gbsScreeningClinics`
- 學童高度近視防治眼科合約院所 — `highMyopiaPreventionClinics`
- 腎臟病健康促進機構 — `kidneyHealthPromotionFacilities`
- 藥癮戒治與替代治療 — `nationwideAddictionTreatmentServices`
- 藥癮戒治機構 — `addictionTreatmentFacilities`
- 網癮治療服務機構 — `internetAddictionServices`
- 3歲以下幼兒流感疫苗合約院所 — `influenzaVaccineProvidersUnder3`
- 聽力所 — `hearingCenters`
- 耳鼻喉科醫療機構 — `entFacilities`
- 骨科醫療機構 — `orthopedicFacilities`
- 復健科醫療機構 — `rehabilitationMedicineInstitutions`
- X光檢查醫療機構 — `xrayExaminationMedicalInstitutions`
- HPV疫苗院所 — `hpvProviders`
- 兒童醫療補助院所 — `childMedicalSubsidyProviders`
- 假牙補助院所 — `dentureSubsidyProviders`
- 通訊心理諮商 — `telepsychology`
- 公費肺炎鏈球菌疫苗院所 — `publicPneumococcalVaccineProviders`
- 臺北市眼科醫療機構 — `ophthalmologyInstitutions`
- 旅遊醫學門診醫院名冊 — `travelMedicineClinics`
- 出院準備銜接長照服務合作醫院 — `hospitalDischargeLongTermCarePartners`
- 安寧緩和醫療機構 — `hospicePalliativeCareInstitutions`
- 臺北市血液透析醫療機構 — `hemodialysisMedicalInstitutions`
- 臺北市內科醫療機構 — `internalMedicineInstitutions`
- 臺北市職能治療所 — `occupationalTherapyClinics`
- 外國人健檢指定醫院 — `designatedForeignerHealthExamHospitals`
- 早期療育醫療院所 — `earlyInterventionMedicalProviders`
- 牙醫一般科醫療機構 — `generalDentalMedicalInstitutions`
- 臺北市兒科醫療機構 — `pediatricMedicalInstitutions`
- 糖尿病共照網醫事機構 — `diabetesSharedCareMedicalInstitutions`
- 生育補助合約醫院 — `fertilitySubsidyContractedHospitals`
- 五癌篩檢醫療院所 — `fiveCancerScreeningProviders`
- 輪狀病毒疫苗補助合約醫療院所 — `rotavirusVaccineSubsidyProviders`
- 西醫一般科醫療機構 — `generalWesternMedicineInstitutions`
- 學童牙齒預防保健醫療院所 — `schoolchildDentalPreventiveCareProviders`
- 公私立醫院血液透析資源 — `hospitalHemodialysisResources`
- 臺北市居家護理所 — `homeNursingInstitutions`
- 臺北市驗光所 — `optometryInstitutions`
- 中醫一般科醫療機構 — `generalChineseMedicineInstitutions`
- 臺北市醫事檢驗所 — `medicalLaboratories`
- 結核病接觸者篩檢合作醫療院所 — `tbContactScreeningPartnerProviders`
- 公費流感抗病毒藥劑合約院所 — `publicInfluenzaAntiviralProviders`
- 家庭醫學科醫療機構 — `familyMedicineInstitutions`
- 整形外科醫療機構 — `plasticSurgeryMedicalInstitutions`
- 婦產科醫療機構 — `obstetricsGynecologyInstitutions`
- 臺北市精神科診所 — `psychiatricClinics`
- 特約人工生殖機構名單 — `licensedAssistedReproductionInstitutions`
- 產後護理機構 — `postpartumCareInstitutions`
- 精神復健暨精神護理機構 — `psychiatricRehabilitationAndNursingInstitutions`
- 臨床病理科醫療機構 — `clinicalPathologyFacilities`
- 美沙冬跨區給藥服務 — `methadoneCrossRegionServices`
- 口腔顎面外科醫療機構 — `oralMaxillofacialSurgeryFacilities`
- 放射診斷科醫療機構 — `radiologyDiagnosticFacilities`
- 解剖病理科醫療機構 — `anatomicalPathologyInstitutions`
- 兒童預防保健醫療院所 — `childPreventiveHealthcareFacilities`

## `location-directory` — 13

### 健康與醫療 — 1

- 臺北市物理治療所 — `physicalTherapyClinics`

### 社福、家庭與照顧 — 7

- 人民團體 — `civic`
- 定點臨托 — `fixedSiteTemporaryChildcare`
- 身障就業資源 — `disabilityEmploymentResources`
- 老人共餐單位 — `seniorGroupMealServiceSites`
- 兒少友善福利服務據點 — `childYouthFriendlyWelfareServiceSites`
- 社區照顧關懷據點 — `communityCareServiceSites`
- 社區整體照顧服務體系 C 級單位 — `communityIntegratedCareLevelCUnits`

### 教育、文化與旅遊 — 3

- 旅遊住宿 — `travelAccommodations`
- 街頭藝人展演場地 — `streetPerformerVenues`
- 臺北市藝文館所 — `artsCulturalVenues`

### 城市服務、環境與生活 — 2

- 公墓資訊 — `cemeteryPublicFacilities`
- 一般旅館名冊 — `hotels`

## `registry-directory` — 57

### 社福、家庭與照顧 — 21

- 急難救助提供單位 — `emergencyAssistanceProviders`
- 兒少福利機構 — `childYouthWelfareInstitutions`
- 身心障礙日間服務 — `disabilityDayServices`
- 銀髮服務機構 — `seniorServices`
- 臺北市客家社團 — `hakkaOrganizations`
- 早療社區療育服務 — `earlyInterventionCommunityServices`
- 居家失能個案家庭醫師照護 — `homeDisabledFamilyPhysicianCareProviders`
- 庇護工場 — `shelteredWorkshops`
- 老人福利機構 — `elderlyWelfare`
- 身心障礙機構服務容量資料 — `disabilityInstitutionCapacityAndVacancies`
- 私立老人安養暨長期照顧機構 — `privateSeniorResidentialLongTermCareInstitutions`
- 銀髮族據點課程 — `seniorServiceSiteCourses`
- 視障按摩院所名冊 — `visuallyImpairedMassageEstablishments`
- 社會福利基金會 — `socialWelfareFoundations`
- 社區公共托育家園 — `communityPublicChildcareHomes`
- 立案課照中心 — `registeredAfterSchoolCareCentres`
- 老人收容安置補助機構 — `subsidizedSeniorResidentialPlacementInstitutions`
- 臺北市原住民團體名單 — `indigenousCommunityOrganizations`
- 社區發展協會 — `communityDevelopmentAssociations`
- 兒童及少年安置機構 — `childYouthResidentialPlacementInstitutions`
- 準公共化托嬰中心 — `infantCare`

### 就業、產業與商業 — 16

- 仲介公司 — `employmentAgencies`
- ★ 合法當舖 — `licensedPawnshops`
- 電子遊戲場業者 — `licensedArcades`
- 八大行業業者 — `licensedSpecialEntertainment`
- 登記工廠 — `registeredFactories`
- 企業營運總部 — `enterpriseHeadquarters`
- ★ 工會名單 — `laborUnions`
- 生技廠商 — `biotechCompanies`
- 南港軟體工業園區廠商 — `nangangCompanies`
- 大彎南段工業區廠商 — `dawannanCompanies`
- 自來水管承裝商業者 — `waterPipeInstallationContractors`
- 核准燃氣熱水器承裝業及技術士 — `approvedGasWaterHeaterInstallers`
- 仲介本國人國內工作私立就業服務機構 — `domesticEmploymentServiceAgencies`
- 病媒防治業者名錄 — `pestControlBusinesses`
- 美容美髮業衛生優良認證 — `beautyHairdressingHygieneCertifications`
- 天然氣導管承裝商 — `licensedNaturalGasPipelineContractors`

### 教育、文化與旅遊 — 5

- ★ 演藝團體 — `performingArts`
- 立案補習班 — `cramSchools`
- 臺北市文化資產 — `taipeiCulturalHeritageAssets`
- 私有文化資產補助案 — `privateCulturalHeritageSubsidies`
- 文化藝術財團法人 — `culturalArtsFoundations`

### 城市服務、環境與生活 — 10

- 市有財產委託經營 — `entrustedPublicAssetOperations`
- 環境用藥販賣業者 — `environmentalPesticideVendors`
- 回收業機構 — `recyclingOrganizations`
- 政風機構聯絡資訊 — `governmentEthicsOffices`
- 殯葬禮儀服務業 — `funeralServiceBusinesses`
- 旅館衛生認證 — `hotelHygieneDirectory`
- 外縣市殯葬業者 — `outCityFuneralBusinesses`
- 桶裝瓦斯零售商 — `bottledGasRetailers`
- 廢食用油回收清除機構 — `licensedWasteCookingOilCollectors`
- 台北服務通申辦服務 — `taipeiGovernmentApplicationServices`

### 動物與寵物 — 5

- 動物醫院一覽表 — `animalHospitals`
- 動物用藥業者 — `animalMedicineSellers`
- 獸醫師資訊 — `veterinarians`
- 狂犬病疫苗獸醫診療機構 — `rabiesVaccinationVeterinaryClinics`
- 寵物登記站名冊 — `petRegistrationStations`

## `records-analysis` — 12

### 就業、產業與商業 — 8

- 勞工退休金條例違規 — `laborPensionActViolations`
- 公共意外險 — `publicLiabilityInsurance`
- 商業異動 — `businessChanges`
- 公司異動 — `companyChanges`
- 捷運採購時程 — `procurement`
- ★ 勞基法違規公布紀錄 — `laborViolations`
- 職安法違規紀錄 — `oshViolations`
- 性平工作法違規紀錄 — `genderEqualityViolations`

### 教育、文化與旅遊 — 1

- 教育局志工表揚名單 — `educationVolunteerRecognitionRecords`

### 城市服務、環境與生活 — 3

- 消費爭議不到場公告 — `consumerDisputeAbsence`
- 撤銷裁罰非法旅館業名單 — `withdrawnIllegalHotelEnforcementRecords`
- 旅宿業裁罰紀錄表 — `lodgingBusinessPenaltyRecords`

## `statistics-analysis` — 16

### 健康與醫療 — 1

- 美容醫學業務醫療機構 113 年督考統計 — `cosmeticMedicineSupervision2024`

### 社福、家庭與照顧 — 3

- 老人安養暨長期照顧機構評鑑 — `seniorCareInstitutionEvaluations`
- 老人照顧容量與實際進住統計 — `seniorCareCapacityAndOccupancy`
- 托嬰評鑑 — `infantCareEvaluations`

### 就業、產業與商業 — 4

- 產業補助廠商 — `grants`
- 用電大戶資料 — `majorElectricityUsers`
- ★ 替代役備役列管人數分析統計 — `alternativeServiceReserveStatistics`
- 私立就業服務機構評鑑成績 — `domesticEmploymentAgencyEvaluations`

### 教育、文化與旅遊 — 1

- 幼兒園評鑑通過名單 — `kindergartenEvaluationPass`

### 城市服務、環境與生活 — 3

- 體育政策公聽會與論壇參與 — `sportsPublicParticipation`
- 市長喜喪致贈統計 — `mayorCeremonialGiftStatistics`
- 醫療保健福利業務預算 — `healthcareWelfareBudget`

### 動物與寵物 — 1

- 寵物業評鑑 — `petBusinessEvaluations`

### 探索、比較與說明 — 3

- 行政區比較 — `comparison`
- 資料概覽 — `overview`
- 資料說明 — `notes`

## Migration acceptance contract

When moving an unstarred legacy module onto its family primitives:

1. preserve source/data semantics and existing domain calculations;
2. move the outer workspace/heading into the family frame;
3. use the shared accessible tab primitive for tab-like views;
4. reuse shared loading, readable error, empty-state, filter-container, and result-container patterns where compatible;
5. preserve mobile behavior and keyboard operation;
6. run focused tests, then typecheck, unit tests, Playwright, production build, and diff check.

The pre-demo release intentionally stops after representative migrations so the demo baseline remains low-risk. Continue this inventory incrementally after the demo.

## Post-demo Batch 14 — healthcare exception closure

Batch 14 applies the acceptance contract to the remaining healthcare-standard exceptions without changing source/data semantics:

- **25 legacy multi-view healthcare modules** move their outer workspace into `DatasetFamilyFrame` with `UI_FAMILIES.healthcareStandard` and replace manual `.subtabs` button lists with shared `AccessibleTabs`. Existing view IDs and page-reset behavior are preserved.
- **12 bespoke single-view healthcare modules** keep their existing content and controls but move their outer workspace/module panel into the healthcare-standard family frame; no artificial tabs are added.
- **10 generated healthcare directories** opt into the existing `GeneratedDatasetDirectoryModule` family wrapper, including five dedicated wrapper modules and five App-level generated routes.
- The existing compact `HealthcareInstitutionDirectory` users, the rehabilitation-medicine reference implementation, and both `healthcare-rich-directory` influenza modules remain on their established healthcare-specific patterns.
- The App-level `LegacyTabAccessibility` runtime bridge is no longer mounted after the remaining manual healthcare tab lists are migrated.

Batch 14 adds source-contract coverage across every migrated healthcare exception pattern and a focused Playwright matrix across representative multi-view, generated-directory, and single-view routes. Full automated CI evidence is recorded only after the single audited branch push completes.
