import { expect, test, type Page } from '@playwright/test';
import { buildCivicCatalogueAdapter } from '../../src/lib/civicCatalogueAdapter';

async function openExplorer(page: Page) {
  await page.locator('.catalogue-trigger').click();
  await page.locator('.catalogue-explorer-trigger').click();
  await expect(page.locator('#civic-explorer-heading')).toBeFocused();
}

test('every hub opens its authoritative list without loading other dataset modules', async ({ page, isMobile }) => {
  const moduleRequests = new Set<string>();
  const explorerRequests: string[] = [];
  page.on('request', request => {
    if (/\/src\/.*Module\.tsx/.test(request.url())) moduleRequests.add(request.url());
    if (/\/src\/CivicExplorer\.tsx/.test(request.url())) explorerRequests.push(request.url());
  });
  await page.goto('/?dataset=notes&lang=en');
  await expect(page.locator('main')).toHaveAttribute('data-active-dataset', 'notes');
  expect(explorerRequests).toHaveLength(0);
  const before = [...moduleRequests];
  await openExplorer(page);
  expect(explorerRequests.length).toBeGreaterThan(0);
  for (const group of buildCivicCatalogueAdapter('en')) {
    const hub = page.locator(`[data-explorer-group="${group.id}"]`);
    if (isMobile) await hub.tap();
    else await hub.click();
    await expect(hub).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('.ce-results h3')).toHaveText(group.title);
    await expect(page.locator('.ce-results a')).toHaveCount(group.total);
    const ids = await page.locator('.ce-results a').evaluateAll(links => links.map(link => new URL((link as HTMLAnchorElement).href).searchParams.get('dataset') ?? 'civic'));
    expect(ids).toEqual(group.items.map(([id]) => id));
  }
  expect([...moduleRequests]).toEqual(before);
  expect(new URL(page.url()).searchParams.get('dataset')).toBe('notes');
});

test('a failed optional chunk leaves a working catalogue return, including reopening', async ({ page }) => {
  await page.route('**/src/CivicExplorer.tsx', route => route.abort());
  await page.goto('/?dataset=notes&lang=en');
  await page.locator('.catalogue-trigger').click();
  for (let attempt = 0; attempt < 2; attempt++) {
    await page.locator('.catalogue-explorer-trigger').click();
    const fallback = page.getByRole('alert').filter({ hasText: 'Explorer could not load' });
    await expect(fallback).toBeVisible();
    await expect(fallback.getByRole('button')).toBeFocused();
    await fallback.getByRole('button').click();
    await expect(page.locator('.catalogue-explorer-trigger')).toBeFocused();
    await expect(page.locator('main')).toHaveAttribute('data-active-dataset', 'notes');
  }
});

test('optional seven hubs derive all counts and support search in either language', async ({ page }, testInfo) => {
  await page.goto('/?dataset=physicalTherapyClinics&lang=en');
  await expect(page.locator('.civic-explorer')).toHaveCount(0);
  await openExplorer(page);
  const explorer = page.locator('.civic-explorer');
  const hubs = explorer.locator('[data-explorer-group]');
  await expect(hubs).toHaveCount(7);
  for (const group of buildCivicCatalogueAdapter('en')) {
    const hub = explorer.locator(`[data-explorer-group="${group.id}"]`);
    await expect(hub).toContainText(group.title);
    await expect(hub).toContainText(`${group.total} entries`);
  }
  await expect(explorer.locator('.ce-results a')).toHaveCount(buildCivicCatalogueAdapter('en').reduce((sum, g) => sum + g.total, 0));
  const search = explorer.getByRole('searchbox');
  await search.fill('物理治療');
  await expect(explorer.locator('.ce-results a')).toHaveCount(1);
  await expect(explorer.locator('.ce-results a')).toHaveText('Taipei Physical Therapy Clinics ↗');
  await search.fill('no-such-dataset-xyz');
  await expect(explorer.locator('.ce-results a')).toHaveCount(0);
  await expect(explorer.getByText('No matching entries.', { exact: false })).toBeVisible();
  await explorer.getByRole('button', { name: 'Reset explorer' }).click();
  await expect(search).toBeFocused();
  await explorer.locator('[data-explorer-group="animals"]').click();
  await expect(explorer.locator('.ce-results h3')).toBeFocused();
  await expect(explorer.locator('.ce-results a')).toHaveCount(buildCivicCatalogueAdapter('en').find(g => g.id === 'animals')!.total);
  await page.keyboard.press('Escape');
  await expect(explorer.locator('[data-explorer-group="animals"]')).toBeFocused();
  await explorer.locator('[data-explorer-group="animals"]').click();
  await explorer.scrollIntoViewIfNeeded();
  await explorer.screenshot({ path: `docs/evidence/civic-explorer/en-${testInfo.project.name}.png`, scale: 'css' });
  await explorer.locator('[data-explorer-group="health"]').click();
  await page.getByRole('button', { name: 'Switch language' }).click();
  await search.fill('Physical Therapy');
  await expect(explorer.locator('.ce-results a')).toHaveText('臺北市物理治療所 ↗');
  await expect(explorer.locator('[data-explorer-group="health"]')).toContainText('健康與醫療');
  await explorer.getByRole('button', { name: '重設探索' }).click();
  await explorer.getByRole('tab', { name: '主題圖', exact: true }).focus();
  await page.keyboard.press('End');
  await expect(explorer.getByRole('tab', { name: '清單', exact: true })).toBeFocused();
  await expect(hubs).toHaveCount(0);
  await expect(explorer.locator('.ce-results a')).toHaveCount(buildCivicCatalogueAdapter('zh').reduce((sum, g) => sum + g.total, 0));
  await page.keyboard.press('Home');
  await expect(hubs).toHaveCount(7);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(overflow).toBe(false);
  await explorer.locator('[data-explorer-group="animals"]').click();
  await explorer.screenshot({ path: `docs/evidence/civic-explorer/zh-${testInfo.project.name}.png`, scale: 'css' });
  await explorer.getByRole('button', { name: '返回資料目錄' }).click();
  await expect(page.locator('.catalogue-explorer-trigger')).toBeFocused();
});

test('dataset entry retains shareable URLs, trust details, reload and browser history', async ({ page }) => {
  await page.goto('/?dataset=physicalTherapyClinics&lang=en');
  const originalURL = page.url();
  await expect(page.locator('.data-trust-primary')).toContainText('Taipei Physical Therapy Clinics');
  const trustBefore = await page.locator('.data-trust').textContent();
  await openExplorer(page);
  expect(await page.locator('.data-trust').textContent()).toBe(trustBefore);
  await page.locator('[data-explorer-group="work"]').click();
  expect(page.url()).toBe(originalURL);
  const link = page.locator('.ce-results a').filter({ hasText: 'Labor Unions' }).first();
  await expect(link).toHaveAttribute('href', /dataset=laborUnions&lang=en/);
  await link.click();
  await expect(page.locator('.civic-explorer')).toHaveCount(0);
  await expect(page.locator('.dataset-content-anchor')).toBeFocused();
  await expect(page.locator('main')).toHaveAttribute('data-active-dataset', 'laborUnions');
  await expect(page.locator('.catalogue-trigger-current')).toContainText('Labor Unions');
  const trustAfter = await page.locator('.data-trust').textContent();
  await page.goBack();
  await expect(page.locator('main')).toHaveAttribute('data-active-dataset', 'physicalTherapyClinics');
  await page.goForward();
  await expect(page.locator('main')).toHaveAttribute('data-active-dataset', 'laborUnions');
  await page.reload();
  await expect(page.locator('main')).toHaveAttribute('data-active-dataset', 'laborUnions');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('.civic-explorer')).toHaveCount(0);
  await expect(page.locator('.data-trust')).toHaveText(trustAfter!);
});

test('reduced motion and Escape return keep native keyboard controls usable', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/?dataset=notes&lang=en');
  await openExplorer(page);
  const hub = page.locator('[data-explorer-group="insights"]');
  await hub.focus();
  await page.keyboard.press('Enter');
  expect(await hub.locator('.island-lift').evaluate(node => getComputedStyle(node).transform)).toBe('none');
  await page.keyboard.press('Escape');
  await expect(hub).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.locator('.catalogue-explorer-trigger')).toBeFocused();
});
