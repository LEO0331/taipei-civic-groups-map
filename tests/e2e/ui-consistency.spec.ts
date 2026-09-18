import { expect, test, type Page } from '@playwright/test';

async function selectDataset(page: Page, label: string) {
  const catalogue = page.locator('#dataset-catalogue');
  if (!await catalogue.isVisible()) await page.locator('.catalogue-trigger').click();
  const search = catalogue.locator('.catalogue-popover-search input');
  if (await search.isVisible()) await search.fill(label);
  const button = catalogue.locator('.catalogue-category button').filter({ hasText: label }).first();
  await expect(button).toBeVisible();
  await button.click();
  await expect(catalogue).not.toBeVisible();
}

test('adult and children influenza use the same rich healthcare provider family', async ({ page }) => {
  await page.goto('/?dataset=adultInfluenzaVaccineProviders&lang=zh');
  const adult = page.locator('[data-ui-family="healthcare-rich-directory"]');
  await expect(adult).toBeVisible();
  await expect(adult.locator('.ivp-hero')).toBeVisible();
  await expect(adult.locator('.ivp-warning')).toBeVisible();
  await expect(adult.locator('.ivp-search')).toBeVisible();
  await expect(adult.locator(':scope > .section-heading')).toHaveCount(0);

  await selectDataset(page, '3歲以上幼童流感疫苗特約院所');
  const child = page.locator('[data-ui-family="healthcare-rich-directory"]');
  await expect(child).toBeVisible();
  await expect(child.locator('.ivp-hero')).toBeVisible();
  await expect(child.locator('.ivp-warning')).toBeVisible();
  await expect(child.locator('.ivp-search')).toBeVisible();
});

test('simple healthcare directories declare the compact healthcare family', async ({ page }) => {
  await page.goto('/?dataset=rehabilitationMedicineInstitutions&lang=zh');
  const directory = page.locator('[data-ui-family="healthcare-standard"]');
  await expect(directory).toBeVisible();
  await expect(directory.locator('.rehab-hero')).toBeVisible();
  await expect(directory.locator('.rehab-filters')).toBeVisible();
});

test('physical therapy remains an intentional location-directory family', async ({ page }) => {
  await page.goto('/?dataset=physicalTherapyClinics&lang=zh');
  const therapy = page.locator('[data-ui-family="location-directory"]');
  await expect(therapy).toBeVisible();
  await expect(therapy).toHaveClass(/physical-therapy-module/);
  await expect(therapy.locator('.pt-hero')).toBeVisible();
  await expect(therapy.locator('.ivp-hero')).toHaveCount(0);
});

test('data trust uses a readable dataset name instead of an implementation slug', async ({ page }) => {
  await page.goto('/?dataset=adultInfluenzaVaccineProviders&lang=zh');
  const summary = page.locator('.data-trust-primary');
  await expect(summary).toContainText('成人流感疫苗合約醫療院所');
  await expect(summary).not.toContainText('adult-influenza-vaccine-providers');
});


test('legacy registry dashboards use the shared registry frame and native tabs', async ({ page }) => {
  for (const [dataset, heading] of [
    ['performingArts', '演藝團體名冊'],
    ['laborUnions', '各工會名單及聯絡方式'],
    ['licensedPawnshops', '當舖業資料清冊'],
  ] as const) {
    await page.goto(`/?dataset=${dataset}&lang=zh`);
    const family = page.locator('.dataset-family-frame[data-ui-family="registry-directory"]');
    await expect(family.getByRole('heading', { name: heading })).toBeVisible();
    await expect(family.locator('[data-accessible-tabs="true"]')).toBeVisible();
    await expect(page.locator('main')).toHaveAttribute('data-active-ui-family', 'registry-directory');
  }
});


test('Registry Business A dashboards use the shared registry frame and native tabs', async ({ page }) => {
  for (const [dataset, heading] of [
    ['employmentAgencies', '仲介公司資料'],
    ['licensedArcades', '合法電子遊戲場業者清冊'],
    ['licensedSpecialEntertainment', '合法八大行業業者清冊'],
    ['registeredFactories', '登記工廠分布圖及基本資料'],
    ['enterpriseHeadquarters', '企業營運總部分布圖'],
    ['biotechCompanies', '生技廠商企業名錄'],
    ['nangangCompanies', '南港軟體工業園區廠商'],
    ['dawannanCompanies', '大彎南段工業區廠商名錄'],
  ] as const) {
    await page.goto(`/?dataset=${dataset}&lang=zh`);
    const family = page.locator('.dataset-family-frame[data-ui-family="registry-directory"]');
    await expect(family.getByRole('heading', { name: heading })).toBeVisible();
    await expect(family.locator('[data-accessible-tabs="true"]')).toBeVisible();
    await expect(family.getByRole('tab', { selected: true })).toHaveCount(1);
    await expect(page.locator('main')).toHaveAttribute('data-active-ui-family', 'registry-directory');
  }
});


test('Registry Business B dashboards use the shared registry frame and native tabs', async ({ page }) => {
  for (const [dataset, heading] of [
    ['waterPipeInstallationContractors', '自來水管承裝商業者'],
    ['approvedGasWaterHeaterInstallers', '核准燃氣熱水器承裝業及技術士'],
    ['domesticEmploymentServiceAgencies', '仲介本國人國內工作私立就業服務機構名冊'],
    ['pestControlBusinesses', '病媒防治業者名錄'],
    ['beautyHairdressingHygieneCertifications', '美容美髮業衛生優良自主管理分級認證'],
    ['licensedNaturalGasPipelineContractors', '臺北市天然氣導管承裝商'],
  ] as const) {
    await page.goto(`/?dataset=${dataset}&lang=zh`);
    const family = page.locator('.dataset-family-frame[data-ui-family="registry-directory"]');
    await expect(family.getByRole('heading', { name: heading })).toBeVisible();
    await expect(family.locator('[data-accessible-tabs="true"]')).toBeVisible();
    await expect(family.getByRole('tab', { selected: true })).toHaveCount(1);
    await expect(page.locator('main')).toHaveAttribute('data-active-ui-family', 'registry-directory');
  }
});


test('Registry Social A dashboards use the shared registry frame', async ({ page }) => {
  for (const [dataset, heading] of [
    ['emergencyAssistanceProviders', '急難救助提供單位'],
    ['childYouthWelfareInstitutions', '兒少福利機構'],
    ['disabilityDayServices', '身心障礙日間服務機構'],
    ['seniorServices', '銀髮服務機構'],
    ['hakkaOrganizations', '109年臺北市客家社團名冊'],
    ['earlyInterventionCommunityServices', '早療社區療育服務'],
    ['homeDisabledFamilyPhysicianCareProviders', '居家失能個案家庭醫師照護服務特約單位'],
    ['shelteredWorkshops', '庇護工場名冊'],
  ] as const) {
    await page.goto(`/?dataset=${dataset}&lang=zh`);
    const family = page.locator('.dataset-family-frame[data-ui-family="registry-directory"]');
    await expect(family.getByRole('heading', { name: heading })).toBeVisible();
    await expect(page.locator('main')).toHaveAttribute('data-active-ui-family', 'registry-directory');
  }

  for (const dataset of ['hakkaOrganizations', 'shelteredWorkshops'] as const) {
    await page.goto(`/?dataset=${dataset}&lang=zh`);
    const family = page.locator('.dataset-family-frame[data-ui-family="registry-directory"]');
    await expect(family.locator('[data-accessible-tabs="true"]')).toBeVisible();
    await expect(family.getByRole('tab', { selected: true })).toHaveCount(1);
  }
});


test('Registry Social B dashboards use the shared registry frame', async ({ page }) => {
  for (const [dataset, heading] of [
    ['elderlyWelfare', '老人福利機構名冊'],
    ['disabilityInstitutionCapacityAndVacancies', '身心障礙福利機構床位與服務容量'],
    ['privateSeniorResidentialLongTermCareInstitutions', '私立老人安養暨長期照顧機構'],
    ['seniorServiceSiteCourses', '銀髮族據點課程資訊'],
    ['visuallyImpairedMassageEstablishments', '視障按摩院所名冊'],
    ['socialWelfareFoundations', '社會福利基金會名冊'],
    ['communityPublicChildcareHomes', '社區公共托育家園'],
  ] as const) {
    await page.goto(`/?dataset=${dataset}&lang=zh`);
    const family = page.locator('.dataset-family-frame[data-ui-family="registry-directory"]');
    await expect(family.getByRole('heading', { name: heading })).toBeVisible();
    await expect(page.locator('main')).toHaveAttribute('data-active-ui-family', 'registry-directory');
  }

  for (const dataset of [
    'elderlyWelfare',
    'disabilityInstitutionCapacityAndVacancies',
    'privateSeniorResidentialLongTermCareInstitutions',
    'seniorServiceSiteCourses',
    'visuallyImpairedMassageEstablishments',
    'socialWelfareFoundations',
  ] as const) {
    await page.goto(`/?dataset=${dataset}&lang=zh`);
    const family = page.locator('.dataset-family-frame[data-ui-family="registry-directory"]');
    await expect(family.locator('[data-accessible-tabs="true"]')).toBeVisible();
    await expect(family.getByRole('tab', { selected: true })).toHaveCount(1);
  }

  await page.goto('/?dataset=communityPublicChildcareHomes&lang=zh');
  const childcare = page.locator('.dataset-family-frame[data-ui-family="registry-directory"]');
  await expect(childcare.locator('[data-accessible-tabs="true"]')).toHaveCount(0);
  await expect(childcare.getByRole('table')).toBeVisible();
});


test('Registry Social C dashboards use the shared registry frame', async ({ page }) => {
  for (const [dataset, heading] of [
    ['registeredAfterSchoolCareCentres', '立案課照中心'],
    ['subsidizedSeniorResidentialPlacementInstitutions', '老人收容安置補助機構'],
    ['indigenousCommunityOrganizations', '臺北市原住民團體名單'],
    ['communityDevelopmentAssociations', '社區發展協會'],
    ['childYouthResidentialPlacementInstitutions', '兒童及少年安置機構'],
    ['infantCare', '準公共化托嬰中心'],
  ] as const) {
    await page.goto(`/?dataset=${dataset}&lang=zh`);
    const family = page.locator('.dataset-family-frame[data-ui-family="registry-directory"]');
    await expect(family.getByRole('heading', { name: heading })).toBeVisible();
    await expect(page.locator('main')).toHaveAttribute('data-active-ui-family', 'registry-directory');
  }

  for (const dataset of [
    'registeredAfterSchoolCareCentres',
    'subsidizedSeniorResidentialPlacementInstitutions',
    'indigenousCommunityOrganizations',
    'communityDevelopmentAssociations',
    'infantCare',
  ] as const) {
    await page.goto(`/?dataset=${dataset}&lang=zh`);
    const family = page.locator('.dataset-family-frame[data-ui-family="registry-directory"]');
    await expect(family.locator('[data-accessible-tabs="true"]')).toBeVisible();
    await expect(family.getByRole('tab', { selected: true })).toHaveCount(1);
  }

  await page.goto('/?dataset=childYouthResidentialPlacementInstitutions&lang=zh');
  const placement = page.locator('.dataset-family-frame[data-ui-family="registry-directory"]');
  await expect(placement.locator('[data-accessible-tabs="true"]')).toHaveCount(0);
  await expect(placement.getByRole('table')).toBeVisible();
});


test('Registry Culture and Pets dashboards use the shared registry frame and native tabs', async ({ page }) => {
  for (const [dataset, heading] of [
    ['cramSchools', '立案補習班'],
    ['taipeiCulturalHeritageAssets', '臺北市文化資產'],
    ['privateCulturalHeritageSubsidies', '私有文化資產補助案'],
    ['culturalArtsFoundations', '文化藝術財團法人一覽表'],
    ['animalHospitals', '動物醫院一覽表'],
    ['animalMedicineSellers', '動物用藥品販賣業者名冊'],
    ['veterinarians', '獸醫師資訊'],
    ['rabiesVaccinationVeterinaryClinics', '狂犬病疫苗預防注射獸醫診療機構'],
    ['petRegistrationStations', '寵物登記站名冊'],
  ] as const) {
    await page.goto(`/?dataset=${dataset}&lang=zh`);
    const family = page.locator('.dataset-family-frame[data-ui-family="registry-directory"]');
    await expect(family.getByRole('heading', { name: heading, exact: true })).toBeVisible();
    await expect(family.locator('[data-accessible-tabs="true"]')).toBeVisible();
    await expect(family.getByRole('tab', { selected: true })).toHaveCount(1);
    await expect(page.locator('main')).toHaveAttribute('data-active-ui-family', 'registry-directory');
  }
});


test('Registry City Services dashboards use the shared registry frame', async ({ page }) => {
  for (const [dataset, heading] of [
    ['entrustedPublicAssetOperations', '市有財產委託經營'],
    ['environmentalPesticideVendors', '環境用藥販賣業者'],
    ['recyclingOrganizations', '回收業機構名冊'],
    ['governmentEthicsOffices', '臺北市政府所屬政風機構聯絡資訊'],
    ['funeralServiceBusinesses', '臺北市殯葬禮儀服務業'],
    ['hotelHygieneDirectory', '旅館衛生認證紀錄'],
    ['outCityFuneralBusinesses', '外縣市殯葬服務業者'],
    ['bottledGasRetailers', '桶裝瓦斯零售商名冊'],
    ['licensedWasteCookingOilCollectors', '廢食用油回收清除機構'],
    ['taipeiGovernmentApplicationServices', '台北服務通申辦服務'],
  ] as const) {
    await page.goto(`/?dataset=${dataset}&lang=zh`);
    const family = page.locator('.dataset-family-frame[data-ui-family="registry-directory"]');
    await expect(family.getByRole('heading', { name: heading, exact: true })).toBeVisible();
    await expect(page.locator('main')).toHaveAttribute('data-active-ui-family', 'registry-directory');
  }

  for (const dataset of [
    'recyclingOrganizations',
    'funeralServiceBusinesses',
    'hotelHygieneDirectory',
    'outCityFuneralBusinesses',
    'bottledGasRetailers',
    'licensedWasteCookingOilCollectors',
    'taipeiGovernmentApplicationServices',
  ] as const) {
    await page.goto(`/?dataset=${dataset}&lang=zh`);
    const family = page.locator('.dataset-family-frame[data-ui-family="registry-directory"]');
    await expect(family.locator('[data-accessible-tabs="true"]')).toBeVisible();
    await expect(family.getByRole('tab', { selected: true })).toHaveCount(1);
  }

  for (const dataset of [
    'entrustedPublicAssetOperations',
    'environmentalPesticideVendors',
    'governmentEthicsOffices',
  ] as const) {
    await page.goto(`/?dataset=${dataset}&lang=zh`);
    const family = page.locator('.dataset-family-frame[data-ui-family="registry-directory"]');
    await expect(family.locator('[data-accessible-tabs="true"]')).toHaveCount(0);
  }
});

test('labor violations use the records-analysis family', async ({ page }) => {
  await page.goto('/?dataset=laborViolations&lang=zh');
  const family = page.locator('.dataset-family-frame[data-ui-family="records-analysis"]');
  await expect(family.getByRole('heading', { name: '勞基法違規公布紀錄' })).toBeVisible();
  await expect(family.locator('[data-accessible-tabs="true"]')).toBeVisible();
  await expect(page.locator('main')).toHaveAttribute('data-active-ui-family', 'records-analysis');
});

test('alternative-service analysis uses the statistics-analysis family', async ({ page }) => {
  await page.goto('/?dataset=alternativeServiceReserveStatistics&lang=zh');
  const family = page.locator('.dataset-family-frame[data-ui-family="statistics-analysis"]');
  await expect(family.getByRole('heading', { name: '替代役備役列管人數分析統計' })).toBeVisible();
  await expect(family.locator('[data-accessible-tabs="true"]')).toBeVisible();
  await expect(page.locator('main')).toHaveAttribute('data-active-ui-family', 'statistics-analysis');
});
