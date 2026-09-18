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
  await expect(trust.locator('.data-trust-primary')).toContainText('流感疫苗合約醫療院所（成人）');
  await expect(trust.locator('.data-trust-status.unknown')).toContainText('日期未知');
  await expect(trust.locator('.data-trust-primary')).not.toContainText('adult-influenza-vaccine-providers');
});

test('data trust dataset names follow the selected interface language', async ({ page }) => {
  await page.goto('/?dataset=physicalTherapyClinics&lang=en');
  const primary = page.locator('.data-trust-primary');

  await expect(primary).toContainText('Taipei Physical Therapy Clinics');
  await expect(primary).not.toContainText('臺北市物理治療所');
});
