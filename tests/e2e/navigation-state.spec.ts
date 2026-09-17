import { expect, test, type Page } from '@playwright/test';

const catalogue = (page: Page) => page.locator('#dataset-catalogue');

async function selectDataset(page: Page, label: string) {
  const trigger = page.locator('.catalogue-trigger');
  if (!await catalogue(page).isVisible()) await trigger.click();
  const search = catalogue(page).locator('.catalogue-popover-search input');
  if (await search.isVisible()) await search.fill(label);
  const button = catalogue(page).locator('.catalogue-category button').filter({ hasText: label }).first();
  await button.click();
  await expect(catalogue(page)).not.toBeVisible();
}

test('selected dataset and language survive a reload through URL state', async ({ page }) => {
  await page.goto('/');
  await selectDataset(page, '臺北市物理治療所');
  await expect.poll(() => new URL(page.url()).searchParams.get('dataset')).toBe('臺北市物理治療所');
  await page.getByRole('button', { name: 'Switch language' }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect.poll(() => new URL(page.url()).searchParams.get('lang')).toBe('en');
  const englishLabel = await page.locator('.catalogue-trigger-current').textContent();
  expect(englishLabel?.trim()).toBeTruthy();
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('.catalogue-trigger-current')).toHaveText(englishLabel!.trim());
});

test('browser back restores the previous dataset', async ({ page }) => {
  await page.goto('/');
  await selectDataset(page, '復健科醫療機構');
  await expect(page.locator('.catalogue-trigger-current')).toHaveText('復健科醫療機構');
  await selectDataset(page, '臺北市物理治療所');
  await expect(page.locator('.catalogue-trigger-current')).toHaveText('臺北市物理治療所');
  await page.goBack();
  await expect(page.locator('.catalogue-trigger-current')).toHaveText('復健科醫療機構');
});

test('dismissed onboarding stays dismissed after reload', async ({ page }) => {
  await page.goto('/');
  const dismiss = page.getByRole('button', { name: '關閉使用方式' });
  await expect(dismiss).toBeVisible();
  await dismiss.click();
  await page.reload();
  await expect(page.getByRole('button', { name: '關閉使用方式' })).not.toBeVisible();
});

test('dataset selection leaves the selected module near the viewport', async ({ page }) => {
  await page.goto('/');
  await selectDataset(page, '臺北市物理治療所');
  await expect(page.getByRole('heading', { name: '臺北市物理治療所' })).toBeVisible();
  await expect.poll(async () => page.evaluate(() => window.scrollY)).toBeGreaterThan(100);
});
