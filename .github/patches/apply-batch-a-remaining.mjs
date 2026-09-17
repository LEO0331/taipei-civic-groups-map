import { readFile, writeFile } from 'node:fs/promises';

async function replaceOnce(path, before, after) {
  const source = await readFile(path, 'utf8');
  if (!source.includes(before)) throw new Error(`Expected source fragment not found in ${path}: ${before.slice(0, 140)}`);
  await writeFile(path, source.replace(before, after));
}

const appPath = 'src/App.tsx';
let app = await readFile(appPath, 'utf8');

const tabStateBefore = "  const [tab, setTab] = useState<string>('civic');";
const tabStateAfter = "  const [tab, setTab] = useState<string>(() => new URLSearchParams(window.location.search).get('dataset') || 'civic');";
if (!app.includes(tabStateBefore)) throw new Error('tab state initializer not found');
app = app.replace(tabStateBefore, tabStateAfter);

const catalogueStateBefore = "  const [catalogueQuery, setCatalogueQuery] = useState('');\n  const [civicView, setCivicView] = useState<'map' | 'directory' | 'overview'>('map');";
const catalogueStateAfter = "  const [catalogueQuery, setCatalogueQuery] = useState('');\n  useEffect(() => {\n    const handlePopState = () => setTab(new URLSearchParams(window.location.search).get('dataset') || 'civic');\n    window.addEventListener('popstate', handlePopState);\n    return () => window.removeEventListener('popstate', handlePopState);\n  }, []);\n  const [civicView, setCivicView] = useState<'map' | 'directory' | 'overview'>('map');";
if (!app.includes(catalogueStateBefore)) throw new Error('catalogue state insertion point not found');
app = app.replace(catalogueStateBefore, catalogueStateAfter);

const backgroundErrorPattern = '.catch(() => setLoadError(true));';
const backgroundErrorCount = app.split(backgroundErrorPattern).length - 1;
if (backgroundErrorCount < 2) throw new Error(`Expected multiple background load error handlers, found ${backgroundErrorCount}`);
app = app.split(backgroundErrorPattern).join('.catch(() => { /* Keep background failures isolated from the civic load state. */ });');

const displayedTabsBefore = "  const displayedTabs = language === 'zh' ? tabs.map(([id, label]) => [id, zhTabLabels[id] ?? label] as [string, string]) : tabs;\n  const catalogue = useMemo(() => buildDatasetCatalogue(displayedTabs, language, catalogueQuery), [displayedTabs, language, catalogueQuery]);";
const displayedTabsAfter = "  const displayedTabs = language === 'zh' ? tabs.map(([id, label]) => [id, zhTabLabels[id] ?? label] as [string, string]) : tabs;\n  useEffect(() => {\n    if (displayedTabs.some(([id]) => id === tab)) return;\n    setTab('civic');\n    const url = new URL(window.location.href);\n    url.searchParams.delete('dataset');\n    window.history.replaceState({ dataset: 'civic' }, '', url);\n  }, [tab, language]);\n  const catalogue = useMemo(() => buildDatasetCatalogue(displayedTabs, language, catalogueQuery), [displayedTabs, language, catalogueQuery]);";
if (!app.includes(displayedTabsBefore)) throw new Error('displayedTabs insertion point not found');
app = app.replace(displayedTabsBefore, displayedTabsAfter);

const selectBefore = "  const selectDataset = (id: string) => { setTab(id); setCatalogueOpen(false); setCatalogueQuery(''); window.scrollTo({ top: 0, behavior: 'smooth' }); };";
const selectAfter = "  const selectDataset = (id: string) => {\n    setTab(id);\n    setCatalogueOpen(false);\n    setCatalogueQuery('');\n    const url = new URL(window.location.href);\n    const currentDataset = url.searchParams.get('dataset') || 'civic';\n    if (currentDataset !== id) {\n      if (id === 'civic') url.searchParams.delete('dataset');\n      else url.searchParams.set('dataset', id);\n      window.history.pushState({ dataset: id }, '', url);\n    }\n    window.scrollTo({ top: 0, behavior: 'smooth' });\n  };";
if (!app.includes(selectBefore)) throw new Error('selectDataset implementation not found');
app = app.replace(selectBefore, selectAfter);

const errorRenderBefore = "      {loadError && <p className=\"status\" role=\"alert\">{t.loadError}</p>}";
const errorRenderAfter = "      {loadError && tab === 'civic' && <p className=\"status\" role=\"alert\">{t.loadError}</p>}";
if (!app.includes(errorRenderBefore)) throw new Error('global error render not found');
app = app.replace(errorRenderBefore, errorRenderAfter);

await writeFile(appPath, app);

const e2ePath = 'tests/e2e/dashboard.spec.ts';
let e2e = await readFile(e2ePath, 'utf8');
const extra = `\n\ntest('dataset selection is URL-addressable and browser history restores the previous dataset', async ({ page }) => {\n  await page.goto('/?dataset=physicalTherapyClinics');\n  await expect(main(page).getByRole('heading', { name: '臺北市物理治療所' })).toBeVisible();\n\n  await selectDataset(page, '孕婦 GBS 篩檢特約院所');\n  await expect(page).toHaveURL(/dataset=gbsScreeningClinics/);\n  await expect(main(page).getByRole('heading', { name: /孕婦 GBS 篩檢特約院所/ })).toBeVisible();\n\n  await page.goBack();\n  await expect(page).toHaveURL(/dataset=physicalTherapyClinics/);\n  await expect(main(page).getByRole('heading', { name: '臺北市物理治療所' })).toBeVisible();\n\n  await page.goto('/?dataset=does-not-exist');\n  await expect(main(page).getByRole('heading', { name: '人民團體' })).toBeVisible();\n  await expect(page).not.toHaveURL(/dataset=/);\n});\n\ntest('unrelated background dataset failures do not surface as a global error', async ({ page }) => {\n  await page.route('**/data/senior-group-meal-service-sites/records.json', (route) => route.fulfill({ status: 500, body: '' }));\n  await page.goto('/?dataset=gbsScreeningClinics');\n  await expect(main(page).getByRole('heading', { name: /孕婦 GBS 篩檢特約院所/ })).toBeVisible();\n  await page.waitForTimeout(150);\n  await expect(main(page).locator('.status[role=\"alert\"]')).toHaveCount(0);\n});\n\ntest('civic load failures still surface on the civic page', async ({ page }) => {\n  await page.route('**/data/civic-groups.json', (route) => route.fulfill({ status: 500, body: '' }));\n  await page.goto('/');\n  await expect(main(page).locator('.status[role=\"alert\"]')).toBeVisible();\n});\n`;
if (!e2e.includes('dataset selection is URL-addressable')) {
  e2e = `${e2e.trimEnd()}${extra}`;
  await writeFile(e2ePath, e2e);
}
