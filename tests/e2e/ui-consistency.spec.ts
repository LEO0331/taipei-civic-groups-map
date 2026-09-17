import { expect, test, type Page } from '@playwright/test';

async function selectDataset(page: Page, label: string) {
  const trigger = page.locator('.catalogue-trigger');
  if (!await page.locator('#dataset-catalogue').isVisible()) await trigger.click();
  const catalogue = page.locator('#dataset-catalogue');
  const search = catalogue.locator('.catalogue-popover-search input');
  if (await search.isVisible()) await search.fill(label);
  await catalogue.locator('.catalogue-category button').filter({ hasText: label }).first().click();
  await expect(catalogue).not.toBeVisible();
}

test('adult and child influenza directories use the same modern healthcare family', async ({ page }) => {
  await page.goto('/');
  for (const label of ['流感疫苗合約醫療院所（成人）', '3歲以上幼童流感疫苗特約院所']) {
    await test.step(label, async () => {
      await selectDataset(page, label);
      const module = page.locator('main .influenza-provider-module');
      await expect(module).toBeVisible();
      await expect(module.locator('.ivp-hero')).toBeVisible();
      await expect(module.locator('.ivp-warning')).toBeVisible();
      await expect(module.locator('.ivp-tabs')).toBeVisible();
      await expect(module.locator('.ivp-filters')).toBeVisible();
      await expect(module.locator('.ivp-stat-grid')).toBeVisible();
    });
  }
});

test('data trust banner never exposes the adult influenza internal slug', async ({ page }) => {
  await page.goto('/');
  await selectDataset(page, '流感疫苗合約醫療院所（成人）');
  const trust = page.locator('.data-trust');
  await expect(trust).toContainText('成人流感疫苗合約醫療院所');
  await expect(trust).not.toContainText('adult-influenza-vaccine-providers');
});
