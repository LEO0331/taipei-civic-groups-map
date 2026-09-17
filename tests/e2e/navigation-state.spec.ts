import { expect, test, type Page } from '@playwright/test';

const catalogue = (page: Page) => page.locator('#dataset-catalogue');

async function selectDataset(page: Page, label: string) {
  if (!await catalogue(page).isVisible()) await page.locator('.catalogue-trigger').click();
  const search = catalogue(page).locator('.catalogue-popover-search input');
  if (await search.isVisible()) await search.fill(label);
  const button = catalogue(page).locator('.catalogue-category button').filter({ hasText: label }).first();
  await expect(button).toBeVisible();
  await button.click();
  await expect(catalogue(page)).not.toBeVisible();
}

test('language is URL-shareable and survives reload without relying on storage', async ({ page }) => {
  await page.goto('/?dataset=physicalTherapyClinics');
  await page.getByRole('button', { name: 'Switch language' }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect.poll(() => new URL(page.url()).searchParams.get('lang')).toBe('en');
  await expect.poll(() => new URL(page.url()).searchParams.get('dataset')).toBe('physicalTherapyClinics');
  const englishLabel = (await page.locator('.catalogue-trigger-current').textContent())?.trim();
  expect(englishLabel).toBeTruthy();

  const sharedUrl = page.url();
  await page.evaluate(() => localStorage.clear());
  await page.goto(sharedUrl);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('.catalogue-trigger-current')).toHaveText(englishLabel!);

  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('.catalogue-trigger-current')).toHaveText(englishLabel!);
});

test('language preference persists even when navigating to a URL without lang', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Switch language' }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect.poll(() => new URL(page.url()).searchParams.get('lang')).toBe('en');
});

test('dismissed onboarding remains dismissed after reload', async ({ page }) => {
  await page.goto('/');
  const dismiss = page.getByRole('button', { name: '關閉使用方式' });
  await expect(dismiss).toBeVisible();
  await dismiss.click();
  await expect(dismiss).not.toBeVisible();
  await page.reload();
  await expect(page.getByRole('button', { name: '關閉使用方式' })).not.toBeVisible();
});

test('catalogue selection scrolls to dataset content instead of the site masthead', async ({ page }) => {
  await page.goto('/');
  await selectDataset(page, '臺北市物理治療所');
  await expect(page.getByRole('heading', { name: '臺北市物理治療所' })).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(100);
  await expect.poll(() => page.locator('.dataset-content-anchor').evaluate((node) => Math.abs(node.getBoundingClientRect().top))).toBeLessThan(260);
});

test('a direct dataset URL opens at the dataset content and back-forward remains usable', async ({ page }) => {
  await page.goto('/?dataset=rehabilitationMedicineInstitutions&lang=zh');
  await expect(page.locator('.catalogue-trigger-current')).toHaveText('復健科醫療機構');
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(100);

  await selectDataset(page, '臺北市物理治療所');
  await expect.poll(() => new URL(page.url()).searchParams.get('dataset')).toBe('physicalTherapyClinics');
  await page.goBack();
  await expect(page.locator('.catalogue-trigger-current')).toHaveText('復健科醫療機構');
  await page.goForward();
  await expect(page.locator('.catalogue-trigger-current')).toHaveText('臺北市物理治療所');
});
