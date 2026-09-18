import { expect, test } from '@playwright/test';

test('rich healthcare tabs use roving keyboard focus and an associated tab panel', async ({ page }) => {
  await page.goto('/?dataset=adultInfluenzaVaccineProviders&lang=zh');
  const tablist = page.getByRole('tablist', { name: '成人流感疫苗院所導覽' });
  const find = tablist.getByRole('tab', { name: /找成人流感疫苗院所/ });
  const districts = tablist.getByRole('tab', { name: /行政區分布/ });

  await expect(find).toHaveAttribute('aria-selected', 'true');
  await expect(find).toHaveAttribute('tabindex', '0');
  await expect(districts).toHaveAttribute('tabindex', '-1');

  await find.focus();
  await find.press('ArrowRight');

  await expect(districts).toBeFocused();
  await expect(districts).toHaveAttribute('aria-selected', 'true');
  const panelId = await districts.getAttribute('aria-controls');
  expect(panelId).toBeTruthy();
  await expect(page.locator(`#${panelId}`)).toHaveAttribute('role', 'tabpanel');
  await expect(page.locator(`#${panelId}`)).toHaveAttribute('aria-labelledby', await districts.getAttribute('id') ?? '');
});

test('generated directories expose the same keyboard tab contract', async ({ page }) => {
  await page.goto('/?dataset=hospicePalliativeCareInstitutions&lang=zh');
  const tablist = page.getByRole('tablist', { name: '名冊資料檢視' });
  const overview = tablist.getByRole('tab', { name: '總覽' });
  const distribution = tablist.getByRole('tab', { name: '縣市分布' });

  await overview.focus();
  await overview.press('ArrowRight');

  await expect(distribution).toBeFocused();
  await expect(distribution).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('tabpanel')).toContainText('臺北市');
});

test('legacy subtabs receive consistent roles, roving focus, and arrow-key activation', async ({ page }) => {
  await page.goto('/?dataset=vaccinationProviders&lang=zh');
  await expect(page.getByRole('heading', { name: '各項預防接種合約醫療院所' })).toBeVisible();

  const tablist = page.getByRole('tablist', { name: '資料檢視' });
  const overview = tablist.getByRole('tab', { name: '總覽' });
  const distribution = tablist.getByRole('tab', { name: '行政區分布' });

  await expect(overview).toHaveAttribute('aria-selected', 'true');
  await overview.focus();
  await overview.press('ArrowRight');

  await expect(distribution).toBeFocused();
  await expect(distribution).toHaveAttribute('aria-selected', 'true');
  await expect(overview).toHaveAttribute('tabindex', '-1');
});

test('Home and End navigation works in the physical-therapy tab set', async ({ page }) => {
  await page.goto('/?dataset=physicalTherapyClinics&lang=zh');
  const tablist = page.getByRole('tablist', { name: '物理治療所模組導覽' });
  const first = tablist.getByRole('tab', { name: /找物理治療/ });
  const last = tablist.getByRole('tab', { name: /資料說明/ });

  await first.focus();
  await first.press('End');
  await expect(last).toBeFocused();
  await expect(last).toHaveAttribute('aria-selected', 'true');

  await last.press('Home');
  await expect(first).toBeFocused();
  await expect(first).toHaveAttribute('aria-selected', 'true');
});
