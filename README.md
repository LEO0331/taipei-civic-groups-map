# Taipei Public Data Explorer

[繁體中文](README.zh-TW.md) · [Open the dashboard](https://leo0331.github.io/taipei-civic-groups-map/)

[![Frontend CI](https://github.com/LEO0331/taipei-civic-groups-map/actions/workflows/frontend-ci.yml/badge.svg)](https://github.com/LEO0331/taipei-civic-groups-map/actions/workflows/frontend-ci.yml)
[![GitHub Pages](https://github.com/LEO0331/taipei-civic-groups-map/actions/workflows/deploy.yml/badge.svg?branch=main)](https://github.com/LEO0331/taipei-civic-groups-map/actions/workflows/deploy.yml)

A bilingual guide to selected Taipei public records. Browse source-recorded directories, administrative records, and descriptive summaries without treating them as rankings, recommendations, or real-time service information.

## Explore public records with context

- Search a catalogue of 156 routes/views across health, care, work, culture, city services, animals, and comparison topics.
- Filter each directory using its source-recorded fields, inspect source details, export filtered CSV data, and open an external address lookup where the source provides one.
- Share a dataset and language through the URL; language, Back/Forward navigation, and keyboard tabs work across desktop and mobile.
- See a consistent Data Trust panel that explains the local snapshot, its available source date, and any refresh fallback.

The interface uses six purposeful presentation families—healthcare standard, rich healthcare directory, location directory, registry directory, records analysis, and statistics analysis—so similar public-data tasks remain familiar without erasing dataset-specific context.

## What the data can and cannot say

This dashboard presents generated local snapshots of public records. A listed organization, institution, address, phone number, or historical administrative record does **not** establish current availability, eligibility, appointment capacity, prices, quality, safety, legal status, compliance, suitability, or a recommendation.

Data Trust currently tracks 117 static directories: 53 have a readable source date, 64 remain unknown, and no current release uses a reused-snapshot fallback. Unknown dates are shown as unknown rather than estimated. Opening an external map lookup shares the selected address with that map provider.

## Current demo baseline

The verified application-maintenance baseline is commit [`99f47579`](https://github.com/LEO0331/taipei-civic-groups-map/commit/99f47579c5523d688900a7bb72b5c165238e168a). It passed Frontend CI with 154 unit tests, 153 desktop/mobile Playwright passes and one expected skip, the 12 Linux Chromium visual baselines, and the 450 kB raw / 130 kB gzip entry budget.

The final documentation/freeze commit for the current demo is [`bcbf7e8`](https://github.com/LEO0331/taipei-civic-groups-map/commit/bcbf7e81629f5011026260f2ebc80e3201bf51d4), deployed successfully by GitHub Pages run [`35681488171`](https://github.com/LEO0331/taipei-civic-groups-map/actions/runs/35681488171). Start with the [demo briefing](docs/demo-briefing-2026-09-22.md) for a short smoke check and presentation caveats.

## For contributors

Requirements: Node.js 22 and npm.

```bash
npm ci
npm run dev
```

Before a pull request, run:

```bash
npm run typecheck
npm test
npm run build
npm run performance:budget
npm run test:e2e
git diff --check
```

Do not run `npm run data:fetch` as routine verification: it refreshes many public source snapshots. When a specific dataset needs work, use its focused `data:fetch:<dataset>` and `data:convert:<dataset>` commands, retain source values, and leave missing source dates unknown unless authoritative evidence exists.

New datasets need one catalogue category, conservative search terms, a deliberate UI-family assignment, and focused source/UI coverage. Reuse the existing source-preserving patterns before adding dependencies or abstractions.

## Further reading

- [Demo briefing — 2026-09-22](docs/demo-briefing-2026-09-22.md)
- [Post-demo Cycle 2 verification](docs/post-demo-cycle-2-verification-2026-09-22.md)
- [UI family classification](docs/ui-family-classification.md)
- [Data freshness audit](docs/data-freshness-audit-2026-09-22.md)
- [Product and design direction](doc/臺北公共資料儀表板－設計決策與演進方向.md)
