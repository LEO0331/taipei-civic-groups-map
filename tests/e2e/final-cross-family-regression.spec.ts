import { expect, test, type Locator, type Page } from '@playwright/test';

const main = (page: Page) => page.locator('main');

async function expectFamily(
  page: Page,
  dataset: string,
  family: string,
  heading: string,
): Promise<Locator> {
  await page.goto(`/?dataset=${dataset}&lang=zh`);
  await expect(main(page)).toHaveAttribute('data-active-dataset', dataset);
  await expect(main(page)).toHaveAttribute('data-active-ui-family', family);
  const root = main(page).locator(`[data-ui-family="${family}"]`).first();
  await expect(root).toBeVisible();
  await expect(root.getByRole('heading', { name: heading, exact: true })).toBeVisible();
  return root;
}

async function openCatalogue(page: Page) {
  const catalogue = page.locator('#dataset-catalogue');
  if (!await catalogue.isVisible()) await page.locator('.catalogue-trigger').click();
  await expect(catalogue).toBeVisible();
  return catalogue;
}

async function selectDataset(page: Page, label: string) {
  const catalogue = await openCatalogue(page);
  const headerSearch = page.locator('.catalogue-search input');
  const popoverSearch = catalogue.locator('.catalogue-popover-search input');
  if (await headerSearch.isVisible()) await headerSearch.fill(label);
  else await popoverSearch.fill(label);
  const button = catalogue.locator('.catalogue-category button').filter({ hasText: label }).first();
  await expect(button).toBeVisible();
  await button.click();
  await expect(catalogue).not.toBeVisible();
}

test('final cross-family regression preserves healthcare and location family contracts', async ({ page }) => {
  test.setTimeout(60_000);

  const rich = await expectFamily(
    page,
    'adultInfluenzaVaccineProviders',
    'healthcare-rich-directory',
    '流感疫苗合約醫療院所（成人）',
  );
  await expect(rich.locator('.ivp-warning')).toBeVisible();
  await expect(page.locator('.data-trust-primary')).toContainText('成人流感疫苗合約醫療院所');
  await expect(rich.getByRole('tab', { selected: true })).toHaveCount(1);

  const healthcare = await expectFamily(
    page,
    'hospicePalliativeCareInstitutions',
    'healthcare-standard',
    '安寧緩和醫療機構',
  );
  const cityDistribution = healthcare.getByRole('tab', { name: '縣市分布' });
  await expect(cityDistribution).toBeVisible();
  await cityDistribution.click();
  const cityChart = healthcare.locator('.chart').first();
  await expect(cityChart.locator('.bar-row').first()).toBeVisible();
  await expect(cityChart).toContainText('臺北市');
  await expect(cityChart).not.toContainText('63000000');

  const location = await expectFamily(
    page,
    'physicalTherapyClinics',
    'location-directory',
    '臺北市物理治療所',
  );
  const therapyTabs = location.getByRole('tablist', { name: '物理治療所模組導覽' });
  const first = therapyTabs.getByRole('tab', { name: /找物理治療/ });
  const last = therapyTabs.getByRole('tab', { name: /資料說明/ });
  await first.focus();
  await first.press('End');
  await expect(last).toBeFocused();
  await expect(last).toHaveAttribute('aria-selected', 'true');
  await last.press('Home');
  await expect(first).toBeFocused();
  await expect(first).toHaveAttribute('aria-selected', 'true');
});

test('final cross-family regression preserves registry, records, and statistics family contracts', async ({ page }) => {
  test.setTimeout(60_000);

  for (const [dataset, family, heading] of [
    ['laborUnions', 'registry-directory', '各工會名單及聯絡方式'],
    ['laborViolations', 'records-analysis', '勞基法違規公布紀錄'],
    ['alternativeServiceReserveStatistics', 'statistics-analysis', '替代役備役列管人數分析統計'],
  ] as const) {
    const root = await expectFamily(page, dataset, family, heading);
    await expect(root.locator('[data-accessible-tabs="true"]')).toBeVisible();
    await expect(root.getByRole('tab', { selected: true })).toHaveCount(1);
  }
});

test('final pre-demo civic browse, view, and search spot-check remains intact', async ({ page }) => {
  await page.goto('/?lang=zh');
  await expect(main(page)).toHaveAttribute('data-active-dataset', 'civic');
  await expect(main(page)).toHaveAttribute('data-active-ui-family', 'location-directory');
  await expect(main(page).getByRole('heading', { name: '人民團體', exact: true })).toBeVisible();

  const catalogue = await openCatalogue(page);
  await expect(catalogue.locator('.catalogue-category').first()).toBeVisible();
  await catalogue.getByRole('button', { name: '關閉資料目錄' }).click();
  await expect(catalogue).not.toBeVisible();

  const directoryTab = main(page).getByRole('tab', { name: '名冊', exact: true });
  await directoryTab.click();
  await expect(directoryTab).toHaveAttribute('aria-selected', 'true');

  const rows = main(page).locator('.group-row');
  await expect(rows.first()).toBeVisible();
  const before = await rows.count();
  const firstName = (await rows.first().locator('h3').textContent())?.trim();
  expect(firstName).toBeTruthy();

  const search = main(page).getByRole('textbox').first();
  await search.fill(firstName!);
  await expect(search).toHaveValue(firstName!);
  await expect.poll(async () => rows.count()).toBeGreaterThan(0);
  await expect.poll(async () => rows.count()).toBeLessThanOrEqual(before);
  await expect(rows.first().locator('h3')).toHaveText(firstName!);
});

test('final cross-family navigation keeps history and language state stable', async ({ page }) => {
  test.setTimeout(60_000);

  await page.goto('/?dataset=adultInfluenzaVaccineProviders&lang=zh');
  await expect(main(page)).toHaveAttribute('data-active-dataset', 'adultInfluenzaVaccineProviders');

  await selectDataset(page, '臺北市物理治療所');
  await expect(main(page)).toHaveAttribute('data-active-dataset', 'physicalTherapyClinics');
  await expect(main(page)).toHaveAttribute('data-active-ui-family', 'location-directory');

  await selectDataset(page, '工會');
  await expect(main(page)).toHaveAttribute('data-active-dataset', 'laborUnions');
  await expect(main(page)).toHaveAttribute('data-active-ui-family', 'registry-directory');

  await page.goBack();
  await expect(main(page)).toHaveAttribute('data-active-dataset', 'physicalTherapyClinics');
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-Hant');

  await page.goForward();
  await expect(main(page)).toHaveAttribute('data-active-dataset', 'laborUnions');
  await page.getByRole('button', { name: 'Switch language' }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(main(page)).toHaveAttribute('data-active-dataset', 'laborUnions');

  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(main(page)).toHaveAttribute('data-active-dataset', 'laborUnions');
  expect(new URL(page.url()).searchParams.get('lang')).toBe('en');
});
