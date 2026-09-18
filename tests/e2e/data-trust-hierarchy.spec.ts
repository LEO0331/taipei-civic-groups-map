import { expect, test } from '@playwright/test';

test('current datasets keep the data trust notice compact and neutral by default', async ({ page }) => {
  await page.goto('/?dataset=hospicePalliativeCareInstitutions&lang=zh');

  const trust = page.locator('.data-trust');
  const primary = trust.locator('.data-trust-primary');
  const details = trust.locator('.data-trust-details');

  await expect(trust).toHaveAttribute('data-attention', 'normal');
  await expect(primary).toContainText('資料使用提醒');
  await expect(primary).toContainText('安寧緩和醫療機構');
  await expect(primary).toContainText('日期在 90 天內');
  await expect(primary).not.toContainText('個資料目錄有可判讀的來源日期');
  await expect(details).not.toHaveAttribute('open', '');

  await details.locator('summary').click();
  await expect(details).toHaveAttribute('open', '');
  await expect(details).toContainText('個資料目錄有可判讀的來源日期');
  await expect(details).toContainText('搜尋與篩選只在此瀏覽器中處理');
});

test('stale datasets remain visibly elevated instead of being visually muted', async ({ page }) => {
  await page.goto('/?dataset=physicalTherapyClinics&lang=zh');

  const trust = page.locator('.data-trust');
  await expect(trust).toHaveAttribute('data-attention', 'warning');
  await expect(trust.locator('.data-trust-primary')).toContainText('臺北市物理治療所');
  await expect(trust.locator('.data-trust-status.stale')).toContainText('日期超過 180 天');
});

test('unknown-date datasets use caution hierarchy and keep the readable localized name', async ({ page }) => {
  await page.goto('/?dataset=adultInfluenzaVaccineProviders&lang=zh');

  const trust = page.locator('.data-trust');
  await expect(trust).toHaveAttribute('data-attention', 'caution');
  await expect(trust.locator('.data-trust-primary')).toContainText('成人流感疫苗合約醫療院所');
  await expect(trust.locator('.data-trust-status.unknown')).toContainText('日期未知');
  await expect(trust.locator('.data-trust-primary')).not.toContainText('adult-influenza-vaccine-providers');
});

test('data trust dataset names follow the selected interface language', async ({ page }) => {
  await page.goto('/?dataset=physicalTherapyClinics&lang=en');
  const primary = page.locator('.data-trust-primary');

  await expect(primary).toContainText('Taipei Physical Therapy Clinics');
  await expect(primary).not.toContainText('臺北市物理治療所');
});


test('failed official refreshes remain prominent even when the reusable snapshot has no source date', async ({ page }) => {
  await page.route('**/data/data-trust-manifest.json', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      datasetDirectoryCount: 1,
      datedDatasetCount: 0,
      fetchFallbackDatasetCount: 1,
      entries: [{
        id: 'adult-influenza-vaccine-providers',
        fetchStatus: 'reused_snapshot',
        fetchFailedAt: '2026-09-18T00:00:00Z',
      }],
    }),
  }));

  await page.goto('/?dataset=adultInfluenzaVaccineProviders&lang=zh');

  const trust = page.locator('.data-trust');
  await expect(trust).toHaveAttribute('data-attention', 'warning');
  await expect(trust.locator('.data-trust-status.refresh-failed')).toContainText('官方刷新失敗');
  await trust.locator('.data-trust-details summary').click();
  await expect(trust.locator('.data-trust-refresh-warning')).toContainText('顯示最近成功快照');
});
