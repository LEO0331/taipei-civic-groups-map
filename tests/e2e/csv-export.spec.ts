import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('directory CSV exports source text as a safe spreadsheet cell', async ({ page }) => {
  const name = '=Provider';
  await page.route('**/data/adult-influenza-vaccine-providers/records.json', (route) =>
    route.fulfill({ json: [{
      id: 'provider-1',
      sourceSequenceNumber: '1',
      districtCode: '01',
      districtName: 'Test district',
      institutionName: name,
      address: 'Test address',
      phone: '02-1234-5678',
      hasPhone: true,
      googleMapsQuery: 'Test address',
    }] }),
  );
  await page.goto('?dataset=adultInfluenzaVaccineProviders&lang=en');
  await expect(page.getByText(name, { exact: true })).toBeVisible();
  const pending = page.waitForEvent('download');
  await page.getByRole('button', { name: /Export filtered CSV/ }).click();
  const download = await pending;
  expect(download.suggestedFilename()).toBe('adult-influenza-vaccine-providers-filtered.csv');
  const csv = await readFile(await download.path(), 'utf8');
  expect(csv).toContain('\uFEFF"ID","Institution","District","Address","Phone"');
  expect(csv).toContain(`"1","'${name}","Test district","Test address","02-1234-5678"`);
});
