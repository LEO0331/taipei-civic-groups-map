# Taipei Public Data Explorer

[English](README.md) · [繁體中文](README.zh-TW.md)

A bilingual Vite + React dashboard for browsing selected Taipei public-record datasets. It helps people find source-recorded directories, inspect their scope and freshness, and compare descriptive summaries without implying that public records are rankings, recommendations, or real-time service information.

## What it provides

- A searchable, topic-based data catalogue for more than 100 directories.
- Bilingual Traditional Chinese and English interface text.
- Dataset-specific filtering, source-field detail, CSV export, and external address lookup where the source supports them.
- Build-time data-trust evidence: readable source dates, clearly marked unknown dates, and a local-data/privacy reminder.
- Static deployment to GitHub Pages.

## Data catalogue

Directories are grouped by public-service topic: health and medical care; social welfare, family and care; work, industry and business; education, culture and travel; city services and environment; animals and pets; and exploration and comparison.

Catalogue metadata lives in [`src/lib/datasetCatalogue.ts`](src/lib/datasetCatalogue.ts). When adding a dataset, give it one deliberate category and useful search terms; an uncategorized dataset is rejected rather than silently hidden from the catalogue.

## Quick start

Requirements: Node.js 22 and npm.

```bash
npm ci
npm run dev
```

Open the local URL printed by Vite.

## Common commands

```bash
# Check types, tests, and a production bundle
npm run typecheck
npm test
npm run build

# Run only the interface accessibility contracts
npm run test:accessibility

# Refresh all remote sources, then convert them
npm run data:fetch
npm run data:convert
```

`npm run data:fetch` is a bulk remote refresh. Do not run it as routine local verification: it can change many public-data files at once. Prefer a focused `data:fetch:<dataset>` and matching `data:convert:<dataset>` command when working on one directory.

The build runs `scripts/buildDataTrustManifest.ts`, which writes `public/data/data-trust-manifest.json` and `public/data/data-release-summary.json`.

## Adding a dataset

1. Add a focused fetch/conversion script and source metadata.
2. Create the directory module using the existing source-preserving patterns.
3. Register its visible label and module in the application.
4. Assign it exactly one category in `datasetCatalogue.ts` and add user-facing search keywords if the official name is hard to discover.
5. Add or update conversion and UI tests.
6. Run the verification suite below.

Avoid inferring current availability, eligibility, quality, safety, compliance, prices, or recommendations unless the public source directly establishes that claim.

## Verification

Before opening a pull request or deploying, run:

```bash
npm run typecheck
npm test
npm run build
git diff --check
```

The GitHub Pages workflow repeats conversion, type checking, tests, and build. It retains the trust manifest, release summary, and conversion report as deployment evidence.

## Project layout

```text
src/                 React modules, catalogue metadata, and shared utilities
scripts/             source fetchers, converters, and build-time reports
public/data/         generated local static datasets
.github/workflows/   GitHub Pages deployment workflow
doc/                 product and design-decision documentation
```

## Deployment

Push to `main` to deploy through [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml). The production site is served from GitHub Pages at <https://leo0331.github.io/taipei-civic-groups-map/>.

## Important limits

This is an exploration tool for public records, not an authoritative real-time service directory. Source dates may be absent or old; unknown dates are intentionally disclosed. Addresses are used only for optional external-map lookup where available. Searches and filters remain in the browser, but opening an external map shares the selected address with that map provider.

Read the product recommendations and ongoing risks in [臺北公共資料儀表板－設計決策與演進方向](doc/臺北公共資料儀表板－設計決策與演進方向.md).
