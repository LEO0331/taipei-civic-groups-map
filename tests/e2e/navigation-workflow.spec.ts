import { expect, test, type Page } from '@playwright/test';

const main = (page: Page) => page.locator('main');

async function openCatalogue(page: Page) {
  const popover = page.locator('#dataset-catalogue');
  if (!await popover.isVisible()) await page.locator('.catalogue-trigger').click();
  await expect(popover).toBeVisible();
  return popover;
}

async function selectDataset(page: Page, label: string) {
  const popover = await openCatalogue(page);
  const headerSearch = page.locator('.catalogue-search input');
  const popoverSearch = popover.locator('.catalogue-popover-search input');
  if (await headerSearch.isVisible()) await headerSearch.fill(label);
  else await popoverSearch.fill(label);
  const button = popover.locator('.catalogue-category button').filter({ hasText: label }).first();
  await expect(button).toBeVisible();
  await button.click();
  await expect(popover).not.toBeVisible();
}

async function expectContentAligned(page: Page) {
  const anchor = page.locator('.dataset-content-anchor');
  await expect(anchor).toHaveCount(1);
  await expect.poll(async () => Math.round(await anchor.evaluate((node) => node.getBoundingClientRect().top))).toBeLessThan(48);
}

test('a shared dataset URL restores its dataset, language, and content position', async ({ page }) => {
  await page.goto('/?dataset=physicalTherapyClinics&lang=en');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(main(page).getByRole('heading', { name: 'Taipei Physical Therapy Clinics' })).toBeVisible();
  const url = new URL(page.url());
  expect(url.searchParams.get('dataset')).toBe('physicalTherapyClinics');
  expect(url.searchParams.get('lang')).toBe('en');
  await expectContentAligned(page);
});

test('dataset selection pushes history and Back/Forward restore the exact workflow state', async ({ page }) => {
  await page.goto('/?lang=en');
  await selectDataset(page, 'Taipei Physical Therapy Clinics');
  await expect(main(page).getByRole('heading', { name: 'Taipei Physical Therapy Clinics' })).toBeVisible();
  await expect(page).toHaveURL(/dataset=physicalTherapyClinics/);
  await expectContentAligned(page);

  await selectDataset(page, 'GBS Screening Clinics');
  await expect(main(page).getByRole('heading', { name: /GBS Screening Clinics/ })).toBeVisible();
  await expect(page).toHaveURL(/dataset=gbsScreeningClinics/);
  expect(new URL(page.url()).searchParams.get('lang')).toBe('en');

  await page.goBack();
  await expect(main(page).getByRole('heading', { name: 'Taipei Physical Therapy Clinics' })).toBeVisible();
  expect(new URL(page.url()).searchParams.get('dataset')).toBe('physicalTherapyClinics');
  expect(new URL(page.url()).searchParams.get('lang')).toBe('en');
  await expectContentAligned(page);

  await page.goForward();
  await expect(main(page).getByRole('heading', { name: /GBS Screening Clinics/ })).toBeVisible();
  expect(new URL(page.url()).searchParams.get('dataset')).toBe('gbsScreeningClinics');
  expect(new URL(page.url()).searchParams.get('lang')).toBe('en');
  await expectContentAligned(page);
});

test('language choice is encoded in the URL and survives reload', async ({ page }) => {
  await page.goto('/?lang=zh');
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-Hant');

  await page.getByRole('button', { name: 'Switch language' }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  expect(new URL(page.url()).searchParams.get('lang')).toBe('en');

  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  expect(new URL(page.url()).searchParams.get('lang')).toBe('en');

  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  expect(new URL(page.url()).searchParams.get('lang')).toBe('en');
});

test('dismissing onboarding persists across reloads', async ({ page }) => {
  await page.goto('/?lang=zh');
  const guide = page.locator('.onboarding-flow');
  await expect(guide).toBeVisible();

  await guide.getByRole('button', { name: '關閉使用方式' }).click();
  await expect(guide).toHaveCount(0);

  await page.reload();
  await expect(page.locator('.onboarding-flow')).toHaveCount(0);
  await expect(main(page).getByRole('heading', { name: '人民團體' })).toBeVisible();
});

test('invalid dataset URLs recover to civic without dropping language or unrelated URL state', async ({ page }) => {
  await page.goto('/?dataset=does-not-exist&lang=en&foo=bar#shared');
  await expect(main(page).getByRole('heading', { name: 'Civic Groups' })).toBeVisible();

  const url = new URL(page.url());
  expect(url.searchParams.has('dataset')).toBe(false);
  expect(url.searchParams.get('lang')).toBe('en');
  expect(url.searchParams.get('foo')).toBe('bar');
  expect(url.hash).toBe('#shared');
});
