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
  if (await mobileSearch.count()) await mobileSearch.fill(label);
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

test('a failed local dataset request shows a readable error state', async ({ page }) => {
  await page.route('**/data/gbs-screening-clinics/records.json', (route) => route.fulfill({ status: 500, body: '' }));
  await page.goto('/');
  await selectDataset(page, '孕婦 GBS 篩檢特約院所');
  await expect(main(page)).toContainText('無法載入本機資料快照。');
});
