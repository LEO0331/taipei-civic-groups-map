import { expect, test, type Page } from '@playwright/test';

const catalogueInput = (page: Page) => page.getByPlaceholder('搜尋資料集或服務').first();
const main = (page: Page) => page.locator('main');

async function openCatalogue(page: Page) {
  const catalogue = page.locator('#dataset-catalogue');
  if (!await catalogue.isVisible()) await catalogueInput(page).click();
  await expect(catalogue).toBeVisible();
}

async function selectDataset(page: Page, label: string) {
  await openCatalogue(page);
  const catalogue = page.locator('#dataset-catalogue');
  const mobileSearch = catalogue.locator('.catalogue-popover-search input');
  if (await mobileSearch.isVisible()) await mobileSearch.fill(label);
  const buttons = catalogue.locator('.catalogue-category button');
  const index = await buttons.evaluateAll((items, exactLabel) => items.findIndex((item) => item.textContent?.trim() === exactLabel), label);
  expect(index, `catalogue entry: ${label}`).toBeGreaterThanOrEqual(0);
  await buttons.nth(index).click();
  await expect(catalogue).not.toBeVisible();
  await expect(main(page)).toBeVisible();
  await expect(main(page)).not.toContainText('Unable to load the dashboard');
}

test('every catalogue module opens in Chinese mode without runtime errors', async ({ page }) => {
  const start = Number(process.env.E2E_MATRIX_START ?? '0');
  const size = Number(process.env.E2E_MATRIX_SIZE ?? '9999');
  test.setTimeout(size < 9999 ? 2 * 60 * 1000 : 10 * 60 * 1000);
  const pageErrors: string[] = [];
  let activeLabel = 'initial page load';
  page.on('pageerror', (error) => pageErrors.push(`${activeLabel}: ${error.message}`));
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-Hant');
  await openCatalogue(page);
  const labels = await page.locator('#dataset-catalogue .catalogue-category button').allTextContents();
  expect(labels.length).toBeGreaterThan(100);
  const matrixLabels = labels.slice(start, start + size).map((label) => label.trim());
  expect(matrixLabels.length).toBeGreaterThan(0);

  for (const label of matrixLabels) {
    await test.step(label, async () => {
      activeLabel = label;
      await selectDataset(page, label.trim());
      await page.waitForTimeout(75);
      const search = main(page).locator('input:not([type]):not([type="date"]):not([type="number"])').first();
      if (await search.count()) await search.fill('測試篩選');
      const select = main(page).locator('select').first();
      if (await select.count()) {
        const option = await select.locator('option').evaluateAll((options) => options.find((item) => item.value)?.value);
        if (option) await select.selectOption(option);
      }
      await expect(main(page)).not.toContainText('Unable to load the dashboard');
    });
  }
  expect(pageErrors).toEqual([]);
});

test('representative interaction profiles work', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', { name: 'Switch language' }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await page.getByRole('button', { name: 'Switch language' }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-Hant');

  await selectDataset(page, '人民團體');
  await page.getByRole('button', { name: '名冊', exact: true }).click();
  await main(page).getByRole('textbox').first().fill('協會');

  await selectDataset(page, '孕婦 GBS 篩檢特約院所');
  await main(page).getByRole('textbox').first().fill('臺北');

  await selectDataset(page, '市長喜喪致贈統計');
  await expect(main(page).locator('table')).toBeVisible();

  await selectDataset(page, '定點臨托');
  await main(page).getByRole('tab', { name: '服務地點' }).click();
  await expect(main(page).locator('table')).toBeVisible();
});

test('the homepage does not wait for an unrelated dataset request', async ({ page }) => {
  await page.route('**/data/performing-arts-group-summary.json', () => new Promise(() => {}));
  await page.goto('/');
  await expect(main(page).getByRole('heading', { name: '人民團體' })).toBeVisible();
  await expect(main(page).getByText('資料載入中…', { exact: true })).not.toBeVisible();
});

test('rehabilitation directory renders decoded records and usable controls', async ({ page }) => {
  await page.goto('/');
  await selectDataset(page, '復健科醫療機構');
  await expect(main(page).getByRole('heading', { name: '臺北市復健科醫療機構' })).toBeVisible();
  await expect(main(page).getByRole('heading', { name: '懷寧復健科診所' }).first()).toBeVisible();
  await expect(main(page).getByText('臺北市中正區懷寧街110號1樓、7樓', { exact: true }).first()).toBeVisible();
  await main(page).getByPlaceholder('搜尋機構、行政區、代碼或地址').fill('懷寧');
  await expect(main(page).getByRole('heading', { name: '懷寧復健科診所' }).first()).toBeVisible();
  await expect(main(page).getByText('133', { exact: true })).not.toBeVisible();
  await main(page).getByText('來源細節', { exact: true }).first().click();
  await expect(main(page).getByText('機構名稱', { exact: true }).first()).toBeVisible();
});

test('simple healthcare directories share a readable paginated template', async ({ page }) => {
  const directories = ['耳鼻喉科醫療機構', '3歲以下幼兒流感疫苗合約院所', '藥癮戒治機構', '腎臟病健康促進機構', '孕婦 GBS 篩檢特約院所', '臨床病理科醫療機構', '口腔顎面外科醫療機構', '解剖病理科醫療機構'];
  await page.goto('/');
  for (const label of directories) {
    await test.step(label, async () => {
      await selectDataset(page, label);
      const directory = main(page).locator('.health-directory');
      await expect(directory).toBeVisible();
      const heroStyles = await directory.locator('.rehab-hero').evaluate((element) => { const styles = getComputedStyle(element); return { backgroundColor: styles.backgroundColor, position: styles.position }; });
      expect(heroStyles).toEqual({ backgroundColor: 'rgba(0, 0, 0, 0)', position: 'static' });
      await expect(directory.locator('.rehab-filters')).toBeVisible();
      await expect(directory.locator('.rehab-summary')).toBeVisible();
      await expect(directory.locator('.rehab-card').first()).toBeVisible();
      expect(await directory.locator('.rehab-card').count()).toBeLessThanOrEqual(18);
      await expect(directory).not.toContainText('�');
    });
  }
  await selectDataset(page, '3歲以下幼兒流感疫苗合約院所');
  await expect(main(page).locator('.rehab-card .rehab-location span').filter({ hasText: '松山區' }).first()).toBeVisible();
});

test('a failed local dataset request shows a readable error state', async ({ page }) => {
  await page.route('**/data/gbs-screening-clinics/records.json', (route) => route.fulfill({ status: 500, body: '' }));
  await page.goto('/');
  await selectDataset(page, '孕婦 GBS 篩檢特約院所');
  await expect(main(page)).toContainText('無法載入本機資料快照。');
});

test('a malformed education-volunteer response shows the shared readable error state', async ({ page }) => {
  await page.route('**/data/education-volunteer-recognition-records/records.json', (route) => route.fulfill({ status: 200, body: '<!doctype html>' }));
  await page.goto('/');
  await selectDataset(page, '教育局志工表揚名單');
  await expect(main(page)).toContainText('無法載入本機資料快照。');
});
