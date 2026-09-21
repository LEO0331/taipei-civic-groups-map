import { expect, test, type Locator, type Page } from '@playwright/test';

type Representative = {
  dataset: string;
  family: string;
  heading: string;
  snapshot: string;
  ready?: (root: Locator) => Promise<void>;
  prepare?: (root: Locator) => Promise<void>;
};

const representatives: Representative[] = [
  {
    dataset: 'hospicePalliativeCareInstitutions',
    family: 'healthcare-standard',
    heading: '安寧緩和醫療機構',
    snapshot: 'healthcare-standard.png',
    ready: async (root) => {
      await expect(root.locator('.notice.subtle')).toBeVisible();
      await expect(root.locator('.summary-grid article')).toHaveCount(5);
      await expect(root.locator('.chart .bar-row').first()).toBeVisible();
    },
  },
  {
    dataset: 'adultInfluenzaVaccineProviders',
    family: 'healthcare-rich-directory',
    heading: '流感疫苗合約醫療院所（成人）',
    snapshot: 'healthcare-rich-directory.png',
  },
  {
    dataset: 'physicalTherapyClinics',
    family: 'location-directory',
    heading: '臺北市物理治療所',
    snapshot: 'location-directory.png',
    ready: async (root) => {
      await expect(root.locator('.pt-card-grid article').first()).toBeVisible();
    },
    // The default find state uses local source-record cards rather than third-party
    // map tiles, and keeps the mobile baseline free of an intentionally wide table.
  },
  {
    dataset: 'laborUnions',
    family: 'registry-directory',
    heading: '各工會名單及聯絡方式',
    snapshot: 'registry-directory.png',
  },
  {
    dataset: 'laborViolations',
    family: 'records-analysis',
    heading: '勞基法違規公布紀錄',
    snapshot: 'records-analysis.png',
  },
  {
    dataset: 'alternativeServiceReserveStatistics',
    family: 'statistics-analysis',
    heading: '替代役備役列管人數分析統計',
    snapshot: 'statistics-analysis.png',
  },
];

async function waitForStableFamily(page: Page, representative: Representative): Promise<Locator> {
  await page.goto(`/?dataset=${representative.dataset}&lang=zh`);
  await page.addStyleTag({ content: `
    *, *::before, *::after {
      animation: none !important;
      caret-color: transparent !important;
      scroll-behavior: auto !important;
      transition: none !important;
    }
  ` });
  const viewport = page.viewportSize();
  if (viewport) await page.setViewportSize({ width: viewport.width, height: Math.max(viewport.height, 6_000) });
  const main = page.locator('main');
  await expect(main).toHaveAttribute('data-active-dataset', representative.dataset);
  await expect(main).toHaveAttribute('data-active-ui-family', representative.family);

  const root = main.locator(`[data-ui-family="${representative.family}"]`).first();
  await expect(root).toBeVisible();
  await expect(root.getByRole('heading', { name: representative.heading, exact: true })).toBeVisible();
  await expect(root.locator('.module-loading')).toHaveCount(0);
  await representative.ready?.(root);
  await page.evaluate(async () => { await document.fonts.ready; });
  await page.evaluate(() => window.scrollTo(0, 0));
  return root;
}

test.describe('canonical UI-family visual baselines', () => {
  for (const representative of representatives) {
    test(`${representative.family} ${representative.dataset}`, async ({ page }) => {
      test.setTimeout(60_000);
      const root = await waitForStableFamily(page, representative);
      await representative.prepare?.(root);

      await expect(root).toHaveScreenshot(representative.snapshot, {
        animations: 'disabled',
        caret: 'hide',
        maxDiffPixelRatio: 0.0005,
      });
    });
  }
});
