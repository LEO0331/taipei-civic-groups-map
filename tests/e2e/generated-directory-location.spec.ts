import { expect, test } from '@playwright/test';

test('hospice directory uses city/county distribution and readable administrative names', async ({ page }) => {
  await page.goto('/?dataset=hospicePalliativeCareInstitutions&lang=zh');
  await expect(page.getByRole('heading', { name: '安寧緩和醫療機構' })).toBeVisible();
  const distribution = page.getByRole('tab', { name: '縣市分布' });
  await expect(distribution).toBeVisible();
  await distribution.click();
  const chart = page.locator('.chart').first();
  await expect(chart.locator('.bar-row').first()).toBeVisible();
  await expect(chart).toContainText('臺北市');
  await expect(chart).not.toContainText('63000000');
});

test('out-of-city funeral directory aggregates its city/county source field', async ({ page }) => {
  await page.goto('/?dataset=outCityFuneralBusinesses&lang=zh');
  await expect(page.getByRole('heading', { name: '外縣市殯葬服務業者' })).toBeVisible();
  const distribution = page.getByRole('tab', { name: '縣市分布' });
  await expect(distribution).toBeVisible();
  await distribution.click();
  const chart = page.locator('.chart').first();
  await expect(chart.locator('.bar-row').first()).toBeVisible();
  await expect(chart).toContainText('基隆市');
});

test('generated directories without a direct location field omit the misleading distribution tab', async ({ page }) => {
  for (const dataset of ['streetPerformerVenues', 'hotelHygieneDirectory']) {
    await page.goto('/?dataset=' + dataset + '&lang=zh');
    await expect(page.locator('.workspace .section-heading h2').first()).toBeVisible();
    await expect(page.getByRole('tab', { name: '行政區分布' })).toHaveCount(0);
    await expect(page.getByRole('tab', { name: '縣市分布' })).toHaveCount(0);
  }
});

test('district-based generated directories keep the district distribution contract', async ({ page }) => {
  await page.goto('/?dataset=postpartumCareInstitutions&lang=zh');
  await expect(page.getByRole('heading', { name: '立案產後護理機構' })).toBeVisible();
  const distribution = page.getByRole('tab', { name: '行政區分布' });
  await expect(distribution).toBeVisible();
  await distribution.click();
  await expect(page.locator('.chart .bar-row').first()).toBeVisible();
});
