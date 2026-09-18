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
