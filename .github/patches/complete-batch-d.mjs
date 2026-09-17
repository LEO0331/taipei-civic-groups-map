import { readFile, writeFile } from 'node:fs/promises';

const appPath = 'src/App.tsx';
const stylesPath = 'src/styles.css';

function requiredReplace(source, before, after, label) {
  if (!source.includes(before)) throw new Error(`Missing ${label}`);
  return source.replace(before, after);
}

let app = await readFile(appPath, 'utf8');

// Lazy-load dataset modules. App-level shell/components remain statically imported,
// but dataset modules are split into their own Vite chunks and loaded only when used.
const moduleDeclarations = [];
app = app.replace(/^import (\w+Module) from '(\.\/[^']+Module)';\n/gm, (_match, name, modulePath) => {
  moduleDeclarations.push(`const ${name} = lazy(() => import('${modulePath}'));`);
  return '';
});

if (moduleDeclarations.length) {
  const lazyAnchor = "const InfluenzaVaccineProvidersChildren3PlusModule = lazy(() => import('./InfluenzaVaccineProvidersChildren3PlusModule'));";
  if (!app.includes(lazyAnchor)) throw new Error('Missing lazy-module insertion anchor');
  app = app.replace(lazyAnchor, `${moduleDeclarations.join('\n')}\n${lazyAnchor}`);
}

const loadingAnchor = `function DirectoryModuleLoading({ language }: { language: Language }) {\n  return <p className="module-loading" role="status">{language === 'zh' ? '正在載入資料目錄…' : 'Loading directory…'}</p>;\n}\n`;
const legacyTabs = [
  'performingArts', 'vaccinationProviders', 'hpvProviders', 'childMedicalSubsidyProviders',
  'dentureSubsidyProviders', 'disabilityEmploymentResources', 'shelteredWorkshops', 'employmentAgencies',
  'licensedPawnshops', 'licensedArcades', 'licensedSpecialEntertainment', 'recyclingOrganizations',
  'registeredFactories', 'enterpriseHeadquarters', 'cemeteryPublicFacilities', 'telepsychology',
  'publicLiabilityInsurance', 'businessChanges', 'companyChanges', 'laborUnions', 'infantCare',
  'infantCareEvaluations', 'elderlyWelfare', 'biotechCompanies', 'travelAccommodations', 'grants',
  'procurement', 'cramSchools', 'hotels', 'laborViolations', 'oshViolations', 'genderEqualityViolations',
  'consumerDisputeAbsence', 'nangangCompanies', 'dawannanCompanies', 'animalHospitals',
  'animalMedicineSellers', 'petBusinessEvaluations', 'veterinarians', 'comparison', 'overview', 'notes',
];
const generatedTabs = [
  'postpartumCareInstitutions', 'outCityFuneralBusinesses', 'hotelHygieneDirectory',
  'kindergartenEvaluationPass', 'domesticEmploymentServiceAgencies', 'hospitalHemodialysisResources',
  'streetPerformerVenues', 'schoolchildDentalPreventiveCareProviders', 'generalWesternMedicineInstitutions',
  'socialWelfareFoundations', 'rotavirusVaccineSubsidyProviders', 'petRegistrationStations', 'bottledGasRetailers',
];
const architectureConstants = `\nconst LEGACY_DATA_TABS = new Set(${JSON.stringify(legacyTabs, null, 2)});\nconst GENERATED_DIRECTORY_DATA_TABS = new Set(${JSON.stringify(generatedTabs, null, 2)});\n`;
if (!app.includes('const LEGACY_DATA_TABS = new Set(')) {
  app = requiredReplace(app, loadingAnchor, `${loadingAnchor}${architectureConstants}\n`, 'DirectoryModuleLoading block');
}

if (!app.includes("const loadedDataGroups = useRef(new Set<string>());")) {
  app = requiredReplace(
    app,
    "  const [loadError, setLoadError] = useState(false);\n",
    "  const [loadError, setLoadError] = useState(false);\n  const loadedDataGroups = useRef(new Set<string>());\n",
    'loadError state',
  );
}

function guardEffectByDataPath(dataPath, condition, key) {
  const markerIndex = app.indexOf(dataPath);
  if (markerIndex < 0) throw new Error(`Missing data loader for ${dataPath}`);
  const start = app.lastIndexOf('  useEffect(() => {', markerIndex);
  if (start < 0) throw new Error(`Missing useEffect start for ${dataPath}`);
  const endMarker = '}, []);';
  const end = app.indexOf(endMarker, markerIndex);
  if (end < 0) throw new Error(`Missing useEffect end for ${dataPath}`);
  let block = app.slice(start, end + endMarker.length);
  if (block.includes(`loadedDataGroups.current.has('${key}')`)) return;
  block = block.replace(
    '  useEffect(() => {',
    `  useEffect(() => {\n    if (${condition} || loadedDataGroups.current.has('${key}')) return;\n    loadedDataGroups.current.add('${key}');`,
  );
  block = block.replace(
    /\.catch\(\(\) => \{ \/\* Keep background failures isolated from the civic load state\. \*\/ \}\);/g,
    `.catch(() => { loadedDataGroups.current.delete('${key}'); });`,
  );
  block = block.replace(
    /\.catch\(\(\)=>setLoadError\(true\)\);/g,
    `.catch(() => { loadedDataGroups.current.delete('${key}'); });`,
  );
  block = block.replace(/\}, \[\]\);$/, '}, [tab]);');
  app = app.slice(0, start) + block + app.slice(end + endMarker.length);
}

// The largest legacy bundle previously fetched dozens of unrelated datasets on every
// visit. Load it once, only when a legacy/combined dashboard actually needs it.
guardEffectByDataPath("loadJson('data/performing-arts-groups.json')", '!LEGACY_DATA_TABS.has(tab)', 'legacy-directory-data');

// Smaller App-owned resources are also requested only by their corresponding route.
guardEffectByDataPath("loadJson('data/senior-group-meal-service-sites/records.json')", "tab !== 'seniorGroupMealServiceSites'", 'senior-meals');
guardEffectByDataPath("loadJson('data/public-pneumococcal-vaccine-providers/records.json')", "tab !== 'publicPneumococcalVaccineProviders'", 'pneumococcal');
guardEffectByDataPath("loadJson('data/major-electricity-users/records.json')", "tab !== 'majorElectricityUsers'", 'major-electricity');
guardEffectByDataPath("loadJson('data/early-intervention-medical-providers/records.json')", "tab !== 'earlyInterventionMedicalProviders'", 'early-intervention');
guardEffectByDataPath("loadJson('data/general-dental-medical-institutions/records.json')", "tab !== 'generalDentalMedicalInstitutions'", 'general-dental');
guardEffectByDataPath("loadJson('data/diabetes-shared-care-medical-institutions/records.json')", "tab !== 'diabetesSharedCareMedicalInstitutions'", 'diabetes-shared-care');
guardEffectByDataPath("j('data/registered-postpartum-care-institutions/records.json')", '!GENERATED_DIRECTORY_DATA_TABS.has(tab)', 'generated-directory-data');

// One shared Suspense boundary covers all route-level lazy modules. Existing nested
// boundaries are harmless and retained to minimize churn in established modules.
if (!app.includes('<Suspense fallback={<DirectoryModuleLoading language={language} />}>\n      {loadError')) {
  app = requiredReplace(
    app,
    "      {loadError && tab === 'civic' && <p className=\"status\" role=\"alert\">{t.loadError}</p>}\n",
    "      <Suspense fallback={<DirectoryModuleLoading language={language} />}>\n      {loadError && tab === 'civic' && <p className=\"status\" role=\"alert\">{t.loadError}</p>}\n",
    'main dataset-content start',
  );
  const mainClose = '    </main>';
  const closeIndex = app.lastIndexOf(mainClose);
  if (closeIndex < 0) throw new Error('Missing main closing tag');
  app = `${app.slice(0, closeIndex)}      </Suspense>\n${app.slice(closeIndex)}`;
}

await writeFile(appPath, app);

let styles = await readFile(stylesPath, 'utf8');
const cssReplacements = [
  ['.pt-source span,.eyebrow {', '.pt-source span,.physical-therapy-module .eyebrow {'],
  ['.pt-source a,.map-link,.tel-link {', '.pt-source a,.physical-therapy-module .map-link,.physical-therapy-module .tel-link {'],
  ['.pt-source a:hover,.map-link:hover,.tel-link:hover {', '.pt-source a:hover,.physical-therapy-module .map-link:hover,.physical-therapy-module .tel-link:hover {'],
  ['.ghost-button,.outline-button,.text-button,.copy-button,.icon-button,.row-detail {', '.physical-therapy-module .ghost-button,.physical-therapy-module .outline-button,.physical-therapy-module .text-button,.physical-therapy-module .copy-button,.physical-therapy-module .icon-button,.physical-therapy-module .row-detail {'],
  ['.outline-button {', '.physical-therapy-module .outline-button {'],
  ['.record-id {', '.physical-therapy-module .record-id {'],
  ['.status-pill {', '.physical-therapy-module .status-pill {'],
  ['.mono {', '.physical-therapy-module .mono {'],
  ['.row-detail {', '.physical-therapy-module .row-detail {'],
  ['.source-details {', '.physical-therapy-module .source-details {'],
  ['.source-details div {', '.physical-therapy-module .source-details div {'],
  ['.source-details span {', '.physical-therapy-module .source-details span {'],
  ['.source-details b {', '.physical-therapy-module .source-details b {'],
  ['.copy-button {', '.physical-therapy-module .copy-button {'],
  ['.muted,.empty {', '.physical-therapy-module .muted,.physical-therapy-module .empty {'],
];
for (const [before, after] of cssReplacements) {
  if (styles.includes(before)) styles = styles.replace(before, after);
  else if (!styles.includes(after)) throw new Error(`Missing CSS selector: ${before}`);
}
await writeFile(stylesPath, styles);

await writeFile('src/lib/frontendArchitecture.test.ts', `import assert from 'node:assert/strict';\nimport { readFile } from 'node:fs/promises';\nimport test from 'node:test';\n\ntest('dataset modules are route-level lazy imports', async () => {\n  const app = await readFile('src/App.tsx', 'utf8');\n  assert.doesNotMatch(app, /^import \\w+Module from ['\"]\\.\\/[^'\"]+Module['\"];$/m);\n  const lazyModules = app.match(/const \\w+Module = lazy\\(\\(\\) => import\\(/g) ?? [];\n  assert.ok(lazyModules.length > 100, \\`expected broad route-level code splitting, found \\${lazyModules.length} lazy modules\\`);\n  assert.match(app, /LEGACY_DATA_TABS/);\n  assert.match(app, /loadedDataGroups/);\n});\n\ntest('physical-therapy component styles do not override generic global utility classes', async () => {\n  const css = await readFile('src/styles.css', 'utf8');\n  const forbidden = [\n    /\\.pt-source span,\\.eyebrow\\s*\\{/,\n    /\\.ghost-button,\\.outline-button,\\.text-button,\\.copy-button,\\.icon-button,\\.row-detail\\s*\\{/,\n    /(^|\\n)\\.muted,\\.empty\\s*\\{/,\n    /\\.pt-source a,\\.map-link,\\.tel-link\\s*\\{/,\n  ];\n  for (const pattern of forbidden) assert.doesNotMatch(css, pattern);\n  assert.match(css, /\\.physical-therapy-module \\.eyebrow/);\n  assert.match(css, /\\.physical-therapy-module \\.text-button/);\n});\n`);

await writeFile('tests/e2e/frontend-architecture.spec.ts', `import { expect, test } from '@playwright/test';\n\ntest('civic landing does not eagerly fetch unrelated directory data', async ({ page }) => {\n  const requested: string[] = [];\n  page.on('request', (request) => requested.push(request.url()));\n  await page.goto('/?lang=zh');\n  await expect(page.locator('.civic-header')).toBeVisible();\n  await page.waitForTimeout(350);\n  expect(requested.some((url) => url.includes('registered-hotels.json'))).toBeFalsy();\n  expect(requested.some((url) => url.includes('public-pneumococcal-vaccine-providers/records.json'))).toBeFalsy();\n  expect(requested.some((url) => url.includes('registered-postpartum-care-institutions/records.json'))).toBeFalsy();\n});\n\ntest('physical-therapy styles stay isolated from the civic directory', async ({ page }) => {\n  await page.goto('/?lang=zh');\n  await expect(page.locator('.civic-header')).toBeVisible();\n  await page.locator('.subtabs button').nth(1).click();\n  const eyebrow = page.locator('.group-row .eyebrow').first();\n  await expect(eyebrow).toBeVisible();\n  const textTransform = await eyebrow.evaluate((element) => getComputedStyle(element).textTransform);\n  expect(textTransform).toBe('none');\n});\n\ntest('representative UI families do not overflow the mobile viewport', async ({ page }, testInfo) => {\n  test.skip(testInfo.project.name !== 'mobile', 'mobile layout regression check');\n  const cases = [\n    ['adultInfluenzaVaccineProviders', '.ivp-hero'],\n    ['physicalTherapyClinics', '.pt-hero'],\n    ['rehabilitationMedicineInstitutions', '.rehab-hero'],\n  ] as const;\n  for (const [dataset, selector] of cases) {\n    await page.goto(\\`/?dataset=\\${dataset}&lang=zh\\`);\n    await expect(page.locator(selector)).toBeVisible();\n    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);\n    expect(overflow, \\`\\${dataset} should not create page-level horizontal overflow\\`).toBeLessThanOrEqual(1);\n  }\n});\n`);

await writeFile('.github/workflows/frontend-ci.yml', `name: Frontend CI\n\non:\n  pull_request:\n  push:\n    branches-ignore: [main]\n\npermissions:\n  contents: read\n\nconcurrency:\n  group: frontend-ci-\\${{ github.ref }}\n  cancel-in-progress: true\n\njobs:\n  verify:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with:\n          node-version: 22\n          cache: npm\n      - run: npm ci\n      - run: npm run typecheck\n      - run: npm test\n      - run: npm run build\n      - run: npx playwright install --with-deps chromium\n      - run: npm run test:e2e\n`);
