import { readFile, writeFile } from 'node:fs/promises';

async function replaceOnce(path, before, after, label) {
  const source = await readFile(path, 'utf8');
  if (!source.includes(before)) throw new Error(`Missing ${label} in ${path}`);
  await writeFile(path, source.replace(before, after));
}

const appPath = 'src/App.tsx';
let app = await readFile(appPath, 'utf8');

const replacements = [
  [
    "import { lazy, Suspense, useEffect, useMemo, useState } from 'react';",
    "import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';",
    'React useRef import',
  ],
  [
    "}\n\nexport default function App() {\n  const [language, setLanguage] = useState<Language>('zh');",
    `}\n\nconst ONBOARDING_DISMISSED_KEY = 'taipei-public-data:onboarding-dismissed';\nconst LANGUAGE_PREFERENCE_KEY = 'taipei-public-data:language';\n\nfunction readUrlLanguage(): Language | null {\n  const value = new URLSearchParams(window.location.search).get('lang');\n  return value === 'zh' || value === 'en' ? value : null;\n}\n\nfunction readStoredLanguage(): Language {\n  try { return localStorage.getItem(LANGUAGE_PREFERENCE_KEY) === 'en' ? 'en' : 'zh'; } catch { return 'zh'; }\n}\n\nfunction getInitialLanguage(): Language { return readUrlLanguage() ?? readStoredLanguage(); }\n\nfunction hasDismissedOnboarding() {\n  try { return localStorage.getItem(ONBOARDING_DISMISSED_KEY) === '1'; } catch { return false; }\n}\n\nexport default function App() {\n  const [language, setLanguage] = useState<Language>(getInitialLanguage);`,
    'persistent language helpers',
  ],
  [
    "  const [showOnboarding, setShowOnboarding] = useState(true);\n  const [catalogueQuery, setCatalogueQuery] = useState('');\n  useEffect(() => {\n    const handlePopState = () => setTab(new URLSearchParams(window.location.search).get('dataset') || 'civic');\n    window.addEventListener('popstate', handlePopState);\n    return () => window.removeEventListener('popstate', handlePopState);\n  }, []);",
    `  const [showOnboarding, setShowOnboarding] = useState(() => !hasDismissedOnboarding());\n  const [catalogueQuery, setCatalogueQuery] = useState('');\n  const datasetContentRef = useRef<HTMLDivElement>(null);\n  const scrollToDatasetContent = (behavior: ScrollBehavior = 'smooth') => {\n    requestAnimationFrame(() => requestAnimationFrame(() => datasetContentRef.current?.scrollIntoView({ behavior, block: 'start' })));\n  };\n  useEffect(() => {\n    const handlePopState = () => {\n      const params = new URLSearchParams(window.location.search);\n      setTab(params.get('dataset') || 'civic');\n      const urlLanguage = readUrlLanguage();\n      if (urlLanguage) setLanguage(urlLanguage);\n      scrollToDatasetContent('auto');\n    };\n    window.addEventListener('popstate', handlePopState);\n    return () => window.removeEventListener('popstate', handlePopState);\n  }, []);`,
    'navigation state hooks',
  ],
  [
    `  useEffect(() => {\n    document.documentElement.lang = language === 'zh' ? 'zh-Hant' : 'en';\n    document.title = t.title;\n  }, [language, t.title]);`,
    `  useEffect(() => {\n    document.documentElement.lang = language === 'zh' ? 'zh-Hant' : 'en';\n    document.title = t.title;\n    try { localStorage.setItem(LANGUAGE_PREFERENCE_KEY, language); } catch { /* Preference persistence is optional. */ }\n    const url = new URL(window.location.href);\n    url.searchParams.set('lang', language);\n    const historyState = window.history.state && typeof window.history.state === 'object' ? window.history.state : {};\n    window.history.replaceState({ ...historyState, dataset: tab, language }, '', url);\n  }, [language, t.title, tab]);`,
    'language persistence effect',
  ],
  [
    `  const selectDataset = (id: string) => {\n    setTab(id);\n    setCatalogueOpen(false);\n    setCatalogueQuery('');\n    const url = new URL(window.location.href);\n    const currentDataset = url.searchParams.get('dataset') || 'civic';\n    if (currentDataset !== id) {\n      if (id === 'civic') url.searchParams.delete('dataset');\n      else url.searchParams.set('dataset', id);\n      window.history.pushState({ dataset: id }, '', url);\n    }\n    window.scrollTo({ top: 0, behavior: 'smooth' });\n  };\n  const civicViews =`,
    `  const selectDataset = (id: string) => {\n    setTab(id);\n    setCatalogueOpen(false);\n    setCatalogueQuery('');\n    const url = new URL(window.location.href);\n    const currentDataset = url.searchParams.get('dataset') || 'civic';\n    if (currentDataset !== id) {\n      if (id === 'civic') url.searchParams.delete('dataset');\n      else url.searchParams.set('dataset', id);\n      window.history.pushState({ dataset: id, language }, '', url);\n    }\n    scrollToDatasetContent();\n  };\n  useEffect(() => {\n    if (new URLSearchParams(window.location.search).get('dataset')) scrollToDatasetContent('auto');\n  }, []);\n  const civicViews =`,
    'dataset scroll behavior',
  ],
  [
    `      {showOnboarding && <DashboardOnboarding language={language} onBrowse={() => setCatalogueOpen(true)} onDismiss={() => setShowOnboarding(false)} />}\n      {loadError && tab === 'civic'`,
    `      {showOnboarding && <DashboardOnboarding language={language} onBrowse={() => setCatalogueOpen(true)} onDismiss={() => { try { localStorage.setItem(ONBOARDING_DISMISSED_KEY, '1'); } catch { /* Dismissal persistence is optional. */ } setShowOnboarding(false); }} />}\n      <div ref={datasetContentRef} className=\"dataset-content-anchor\" aria-hidden=\"true\" />\n      {loadError && tab === 'civic'`,
    'onboarding persistence and dataset anchor',
  ],
];

for (const [before, after, label] of replacements) {
  if (!app.includes(before)) throw new Error(`Missing ${label} in ${appPath}`);
  app = app.replace(before, after);
}
await writeFile(appPath, app);

const spec = `import { expect, test, type Page } from '@playwright/test';

const catalogue = (page: Page) => page.locator('#dataset-catalogue');

async function selectDataset(page: Page, label: string) {
  if (!await catalogue(page).isVisible()) await page.locator('.catalogue-trigger').click();
  const search = catalogue(page).locator('.catalogue-popover-search input');
  if (await search.isVisible()) await search.fill(label);
  const button = catalogue(page).locator('.catalogue-category button').filter({ hasText: label }).first();
  await expect(button).toBeVisible();
  await button.click();
  await expect(catalogue(page)).not.toBeVisible();
}

test('language is URL-shareable and survives reload without relying on storage', async ({ page }) => {
  await page.goto('/?dataset=physicalTherapyClinics');
  await page.getByRole('button', { name: 'Switch language' }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect.poll(() => new URL(page.url()).searchParams.get('lang')).toBe('en');
  await expect.poll(() => new URL(page.url()).searchParams.get('dataset')).toBe('physicalTherapyClinics');
  const englishLabel = (await page.locator('.catalogue-trigger-current').textContent())?.trim();
  expect(englishLabel).toBeTruthy();

  const sharedUrl = page.url();
  await page.evaluate(() => localStorage.clear());
  await page.goto(sharedUrl);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('.catalogue-trigger-current')).toHaveText(englishLabel!);

  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('.catalogue-trigger-current')).toHaveText(englishLabel!);
});

test('language preference persists even when navigating to a URL without lang', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Switch language' }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect.poll(() => new URL(page.url()).searchParams.get('lang')).toBe('en');
});

test('dismissed onboarding remains dismissed after reload', async ({ page }) => {
  await page.goto('/');
  const dismiss = page.getByRole('button', { name: '關閉使用方式' });
  await expect(dismiss).toBeVisible();
  await dismiss.click();
  await expect(dismiss).not.toBeVisible();
  await page.reload();
  await expect(page.getByRole('button', { name: '關閉使用方式' })).not.toBeVisible();
});

test('catalogue selection scrolls to dataset content instead of the site masthead', async ({ page }) => {
  await page.goto('/');
  await selectDataset(page, '臺北市物理治療所');
  await expect(page.getByRole('heading', { name: '臺北市物理治療所' })).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(100);
  await expect.poll(() => page.locator('.dataset-content-anchor').evaluate((node) => Math.abs(node.getBoundingClientRect().top))).toBeLessThan(260);
});

test('a direct dataset URL opens at the dataset content and back-forward remains usable', async ({ page }) => {
  await page.goto('/?dataset=rehabilitationMedicineInstitutions&lang=zh');
  await expect(page.locator('.catalogue-trigger-current')).toHaveText('復健科醫療機構');
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(100);

  await selectDataset(page, '臺北市物理治療所');
  await expect.poll(() => new URL(page.url()).searchParams.get('dataset')).toBe('physicalTherapyClinics');
  await page.goBack();
  await expect(page.locator('.catalogue-trigger-current')).toHaveText('復健科醫療機構');
  await page.goForward();
  await expect(page.locator('.catalogue-trigger-current')).toHaveText('臺北市物理治療所');
});
`;
await writeFile('tests/e2e/navigation-state.spec.ts', spec);
