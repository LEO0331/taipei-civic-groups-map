import { execFileSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';

const repoCommit = 'd60b77b1d13008a413b58fad225320702ac26bbf';

function fromCommit(path) {
  return execFileSync('git', ['show', `${repoCommit}:${path}`], { encoding: 'utf8' });
}

async function replaceRequired(path, before, after, label) {
  const source = await readFile(path, 'utf8');
  if (!source.includes(before)) throw new Error(`Missing ${label} in ${path}`);
  await writeFile(path, source.replace(before, after));
}

// Preserve the approved Batch C adult-influenza redesign after synchronising with main.
let adult = fromCommit('src/AdultInfluenzaVaccineProvidersModule.tsx');
adult = adult.replace(
  "import { useEffect, useMemo, useState } from 'react';",
  "import { useEffect, useMemo, useState } from 'react';\nimport { UI_FAMILIES } from './lib/uiFamilies';",
);
adult = adult.replaceAll(
  'className="workspace influenza-provider-module"',
  'className="workspace influenza-provider-module" data-ui-family={UI_FAMILIES.healthcareRichDirectory}',
);
adult = adult.replace(
  'className="workspace influenza-provider-module adult-influenza-module"',
  'className="workspace influenza-provider-module adult-influenza-module" data-ui-family={UI_FAMILIES.healthcareRichDirectory}',
);
await writeFile('src/AdultInfluenzaVaccineProvidersModule.tsx', adult);

// Make the healthcare style families explicit rather than relying on one-off class names.
await writeFile('src/lib/uiFamilies.ts', `/**
 * Stable visual-family identifiers for dataset modules.
 *
 * A family is an interaction/layout contract, not a requirement that every dataset
 * look identical. Simple healthcare lists use the compact directory contract;
 * richer provider explorers use the tabbed provider contract; location-heavy
 * therapy directories may keep their purpose-built presentation.
 */
export const UI_FAMILIES = {
  healthcareStandard: 'healthcare-standard',
  healthcareRichDirectory: 'healthcare-rich-directory',
  locationDirectory: 'location-directory',
  registryDirectory: 'registry-directory',
  recordsAnalysis: 'records-analysis',
  statisticsAnalysis: 'statistics-analysis',
} as const;

export type UiFamily = typeof UI_FAMILIES[keyof typeof UI_FAMILIES];
`);

await replaceRequired(
  'src/InfluenzaVaccineProvidersChildren3PlusModule.tsx',
  "import { safeSmallCount } from './lib/dataTrust';",
  "import { safeSmallCount } from './lib/dataTrust';\nimport { UI_FAMILIES } from './lib/uiFamilies';",
  'children influenza UI family import',
);
await replaceRequired(
  'src/InfluenzaVaccineProvidersChildren3PlusModule.tsx',
  'return <section className="workspace influenza-provider-module"><div className="ivp-hero">',
  'return <section className="workspace influenza-provider-module" data-ui-family={UI_FAMILIES.healthcareRichDirectory}><div className="ivp-hero">',
  'children influenza main UI family marker',
);

await replaceRequired(
  'src/PhysicalTherapyClinicsModule.tsx',
  "import { useEffect, useMemo, useState } from 'react';",
  "import { useEffect, useMemo, useState } from 'react';\nimport { UI_FAMILIES } from './lib/uiFamilies';",
  'physical therapy UI family import',
);
await replaceRequired(
  'src/PhysicalTherapyClinicsModule.tsx',
  'return <section className="workspace physical-therapy-module">',
  'return <section className="workspace physical-therapy-module" data-ui-family={UI_FAMILIES.locationDirectory}>',
  'physical therapy main UI family marker',
);

await replaceRequired(
  'src/HealthcareInstitutionDirectory.tsx',
  "import { loadLocalJson } from './lib/loadLocalJson';",
  "import { loadLocalJson } from './lib/loadLocalJson';\nimport { UI_FAMILIES } from './lib/uiFamilies';",
  'shared healthcare UI family import',
);
await replaceRequired(
  'src/HealthcareInstitutionDirectory.tsx',
  'return <section className="workspace rehab-directory health-directory">',
  'return <section className="workspace rehab-directory health-directory" data-ui-family={UI_FAMILIES.healthcareStandard}>',
  'shared healthcare UI family marker',
);

// Do not expose implementation slugs in the public data-trust banner.
let trust = await readFile('src/DataTrustPanel.tsx', 'utf8');
if (!trust.includes('function readableDatasetName')) {
  const anchor = `const statusCopy: Record<FreshnessStatus, [string, string]> = {\n  current: ['資料日期在 90 天內', 'Source date within 90 days'],\n  aging: ['資料日期為 91–180 天前', 'Source date is 91–180 days old'],\n  stale: ['資料日期超過 180 天', 'Source date is over 180 days old'],\n  unknown: ['無法從現有詮釋資料確認日期', 'No source date in the available metadata'],\n};`;
  if (!trust.includes(anchor)) throw new Error('Missing DataTrust statusCopy anchor');
  const helpers = `${anchor}\n\nconst fallbackDatasetNames: Record<string, [string, string]> = {\n  'adult-influenza-vaccine-providers': ['成人流感疫苗合約醫療院所', 'Adult influenza vaccine providers'],\n};\n\nfunction humanizeDatasetId(id: string) {\n  return id.split('-').filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');\n}\n\nfunction readableDatasetName(entry: DatasetEntry, zh: boolean) {\n  if (entry.sourceName) return entry.sourceName;\n  const fallback = fallbackDatasetNames[entry.id];\n  if (fallback) return fallback[zh ? 0 : 1];\n  return humanizeDatasetId(entry.id);\n}`;
  trust = trust.replace(anchor, helpers);
}
trust = trust.replaceAll('${active.sourceName ?? active.id}', '${readableDatasetName(active, zh)}');
await writeFile('src/DataTrustPanel.tsx', trust);

await writeFile('tests/e2e/ui-consistency.spec.ts', `import { expect, test, type Page } from '@playwright/test';

async function selectDataset(page: Page, label: string) {
  const catalogue = page.locator('#dataset-catalogue');
  if (!await catalogue.isVisible()) await page.locator('.catalogue-trigger').click();
  const search = catalogue.locator('.catalogue-popover-search input');
  if (await search.isVisible()) await search.fill(label);
  const button = catalogue.locator('.catalogue-category button').filter({ hasText: label }).first();
  await expect(button).toBeVisible();
  await button.click();
  await expect(catalogue).not.toBeVisible();
}

test('adult and children influenza use the same rich healthcare provider family', async ({ page }) => {
  await page.goto('/?dataset=adultInfluenzaVaccineProviders&lang=zh');
  const adult = page.locator('[data-ui-family="healthcare-rich-directory"]');
  await expect(adult).toBeVisible();
  await expect(adult.locator('.ivp-hero')).toBeVisible();
  await expect(adult.locator('.ivp-warning')).toBeVisible();
  await expect(adult.locator('.ivp-search')).toBeVisible();
  await expect(adult.locator(':scope > .section-heading')).toHaveCount(0);

  await selectDataset(page, '3歲以上幼童流感疫苗特約院所');
  const child = page.locator('[data-ui-family="healthcare-rich-directory"]');
  await expect(child).toBeVisible();
  await expect(child.locator('.ivp-hero')).toBeVisible();
  await expect(child.locator('.ivp-warning')).toBeVisible();
  await expect(child.locator('.ivp-search')).toBeVisible();
});

test('shared simple healthcare directories declare the compact healthcare family', async ({ page }) => {
  await page.goto('/?dataset=rehabilitationMedicineInstitutions&lang=zh');
  const directory = page.locator('[data-ui-family="healthcare-standard"]');
  await expect(directory).toBeVisible();
  await expect(directory.locator('.rehab-hero')).toBeVisible();
  await expect(directory.locator('.rehab-filters')).toBeVisible();
});

test('physical therapy remains an intentional location-directory family', async ({ page }) => {
  await page.goto('/?dataset=physicalTherapyClinics&lang=zh');
  const therapy = page.locator('[data-ui-family="location-directory"]');
  await expect(therapy).toBeVisible();
  await expect(therapy).toHaveClass(/physical-therapy-module/);
  await expect(therapy.locator('.pt-hero')).toBeVisible();
  await expect(therapy.locator('.ivp-hero')).toHaveCount(0);
});

test('data trust uses a readable dataset name instead of an implementation slug', async ({ page }) => {
  await page.goto('/?dataset=adultInfluenzaVaccineProviders&lang=zh');
  const status = page.locator('.data-trust-status').first();
  await expect(status).toContainText('成人流感疫苗合約醫療院所');
  await expect(status).not.toContainText('adult-influenza-vaccine-providers');
});
`);
