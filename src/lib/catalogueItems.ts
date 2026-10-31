import type { CatalogueLanguage } from './datasetCatalogue';

export const copy = {
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
    fields: '欄位對照', noResults: '沒有符合條件的紀錄。',
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


export const zhUiCopy: Record<string, string> = {
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


export function getCatalogueItems(language: CatalogueLanguage): Array<[string, string]> {
  const t = language === 'zh' ? { ...copy.zh, ...zhUiCopy } : copy.en;
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
  tabs.splice(10, 0, ['withdrawnIllegalHotelEnforcementRecords', language === 'zh' ? '撤銷裁罰非法旅館業名單' : 'Withdrawn Illegal Hotel Enforcement Records']);
  tabs.splice(11, 0, ['funeralServiceBusinesses', language === 'zh' ? '殯葬禮儀服務業' : 'Funeral Service Businesses']);
  tabs.splice(12, 0, ['fixedSiteTemporaryChildcare', language === 'zh' ? '定點臨托' : 'Fixed-Site Temporary Childcare']);
  tabs.splice(13, 0, ['xrayExaminationMedicalInstitutions', language === 'zh' ? 'X光檢查醫療機構' : 'X-ray Examination Medical Institutions']);
  tabs.splice(14, 0, ['governmentEthicsOffices', language === 'zh' ? '政風機構聯絡資訊' : 'Government Ethics Office Contacts']);
  tabs.splice(15, 0, ['rehabilitationMedicineInstitutions', language === 'zh' ? '復健科醫療機構' : 'Rehabilitation Medicine Institutions']);
  tabs.splice(16, 0, ['homeDisabledFamilyPhysicianCareProviders', language === 'zh' ? '居家失能個案家庭醫師照護' : 'Home-Based Family Physician Care Providers']);
  tabs.splice(17, 0, ['educationVolunteerRecognitionRecords', language === 'zh' ? '教育局志工表揚名單' : 'Education Bureau Volunteer Recognition Records']);
  tabs.splice(18, 0, ['orthopedicFacilities', language === 'zh' ? '骨科醫療機構' : 'Orthopedic Medical Facilities']);
  tabs.splice(19, 0, ['entFacilities', language === 'zh' ? '耳鼻喉科醫療機構' : 'ENT Medical Facilities']);
  tabs.splice(20, 0, ['hearingCenters', language === 'zh' ? '聽力所' : 'Hearing Centers']);
  tabs.splice(21, 0, ['earlyInterventionCommunityServices', language === 'zh' ? '早療社區療育服務' : 'Early Intervention Services']);
  tabs.splice(22, 0, ['influenzaVaccineProvidersUnder3', language === 'zh' ? '3歲以下幼兒流感疫苗合約院所' : 'Flu Vaccination Clinics – Children Under 3']);
  tabs.splice(23, 0, ['seniorServices', language === 'zh' ? '銀髮服務機構' : 'Senior Services']);
  tabs.splice(24, 0, ['entrustedPublicAssetOperations', language === 'zh' ? '市有財產委託經營' : 'Entrusted Public Asset Operations']);
  tabs.splice(25, 0, ['disabilityDayServices', language === 'zh' ? '身心障礙日間服務' : 'Disability Day Services']);
  tabs.splice(26, 0, ['environmentalPesticideVendors', language === 'zh' ? '環境用藥販賣業者' : 'Environmental Pesticide Vendors']);
  tabs.splice(27, 0, ['laborPensionActViolations', language === 'zh' ? '勞工退休金條例違規' : 'Labor Pension Act Violations']);
  tabs.splice(28, 0, ['internetAddictionServices', language === 'zh' ? '網癮治療服務機構' : 'Internet Addiction Services']);
  tabs.splice(29, 0, ['childYouthWelfareInstitutions', language === 'zh' ? '兒少福利機構' : 'Child & Youth Welfare Services']);
  tabs.splice(30, 0, ['addictionTreatmentFacilities', language === 'zh' ? '藥癮戒治機構' : 'Addiction Treatment Facilities']);
  tabs.splice(31, 0, ['emergencyAssistanceProviders', language === 'zh' ? '急難救助提供單位' : 'Emergency Assistance Providers']);
  tabs.splice(32, 0, ['nationwideAddictionTreatmentServices', language === 'zh' ? '藥癮戒治與替代治療' : 'Addiction Treatment Services']);
  tabs.splice(33, 0, ['healthcareWelfareBudget', language === 'zh' ? '醫療保健福利業務預算' : 'Healthcare & Welfare Programs Budget']);
  tabs.splice(34, 0, ['kidneyHealthPromotionFacilities', language === 'zh' ? '腎臟病健康促進機構' : 'Kidney Health Promotion Facilities']);
  tabs.splice(35, 0, ['highMyopiaPreventionClinics', language === 'zh' ? '學童高度近視防治眼科合約院所' : 'Schoolchildren High-Myopia Prevention Contracted Clinics']);
  tabs.splice(36, 0, ['gbsScreeningClinics', language === 'zh' ? '孕婦 GBS 篩檢特約院所' : 'GBS Screening Clinics']);
  tabs.splice(37, 0, ['medicalRadiologicalInstitutions', language === 'zh' ? '醫事放射所' : 'Medical Radiological Institutions']);
  tabs.splice(38, 0, ['mayorCeremonialGiftStatistics', language === 'zh' ? '市長喜喪致贈統計' : 'Mayor Ceremonial Gift Statistics']);
  tabs.splice(39, 0, ['sportsPublicParticipation', language === 'zh' ? '體育政策公聽會與論壇參與' : 'Sports Public Hearings & Forums']);
  tabs.splice(40, 0, ['clinicalPathologyFacilities', language === 'zh' ? '臨床病理科醫療機構' : 'Clinical Pathology Facilities']);
  tabs.splice(41, 0, ['methadoneCrossRegionServices', language === 'zh' ? '美沙冬跨區給藥服務' : 'Methadone Cross-Region Service']);
  tabs.splice(42, 0, ['oralMaxillofacialSurgeryFacilities', language === 'zh' ? '口腔顎面外科醫療機構' : 'Oral & Maxillofacial Surgery Facilities']);
  tabs.splice(43, 0, ['radiologyDiagnosticFacilities', language === 'zh' ? '放射診斷科醫療機構' : 'Radiology Diagnostic Facilities']);
  tabs.splice(44, 0, ['anatomicalPathologyInstitutions', language === 'zh' ? '解剖病理科醫療機構' : 'Anatomical Pathology Institutions']);
  tabs.splice(45, 0, ['childPreventiveHealthcareFacilities', language === 'zh' ? '兒童預防保健醫療院所' : 'Child Preventive Healthcare Facilities']);
  tabs.splice(15, 0, ['hospicePalliativeCareInstitutions', language === 'zh' ? '安寧緩和醫療機構' : 'Hospice and Palliative Care Institutions']);
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
  tabs.push(['seniorCarePolicy', language === 'zh' ? '高齡社區照顧政策查核（Policy 10）' : 'Senior Community Care Policy 10']);
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
  return displayedTabs;
}
