import { expect, test } from '@playwright/test';

test('civic landing does not eagerly fetch unrelated directory data', async ({ page }) => {
  const requested: string[] = [];
  page.on('request', (request) => requested.push(request.url()));
  await page.goto('/?lang=zh');
  await expect(page.locator('.civic-header')).toBeVisible();
  await page.waitForTimeout(350);
  expect(requested.some((url) => url.includes('registered-hotels.json'))).toBeFalsy();
  expect(requested.some((url) => url.includes('public-pneumococcal-vaccine-providers/records.json'))).toBeFalsy();
  expect(requested.some((url) => url.includes('registered-postpartum-care-institutions/records.json'))).toBeFalsy();
});

test('physical-therapy styles stay isolated from the civic directory', async ({ page }) => {
  await page.goto('/?lang=zh');
  await expect(page.locator('.civic-header')).toBeVisible();
  await page.locator('.subtabs button').nth(1).click();
  const eyebrow = page.locator('.group-row .eyebrow').first();
  await expect(eyebrow).toBeVisible();
  const textTransform = await eyebrow.evaluate((element) => getComputedStyle(element).textTransform);
  expect(textTransform).toBe('none');
});

test('representative UI families do not overflow the mobile viewport', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'mobile layout regression check');
  const cases = [
    ['adultInfluenzaVaccineProviders', '.ivp-hero'],
    ['physicalTherapyClinics', '.pt-hero'],
    ['rehabilitationMedicineInstitutions', '.rehab-hero'],
  ] as const;
  for (const [dataset, selector] of cases) {
    await page.goto('/?dataset=' + dataset + '&lang=zh');
    await expect(page.locator(selector)).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, dataset + ' should not create page-level horizontal overflow').toBeLessThanOrEqual(1);
  }
});
