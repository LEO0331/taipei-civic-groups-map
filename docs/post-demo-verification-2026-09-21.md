# Post-demo verification — 2026-09-21

This document consolidates the post-demo Batches 01–21 and records the feature-freeze baseline after the demo.

## Application baseline

- Verified application branch: `main`
- Verified application commit: `05c87568af360e3fdcd30a07f4c1bbdb4e7bf934`
- Application merge: PR #36, `postdemo/21-catalogue-search-tuning`
- Final application Frontend CI run: `35578367111`
- Frontend CI result: successful
- Production URL: https://leo0331.github.io/taipei-civic-groups-map/

Batch 22 itself is documentation/state-only. It does not change application code, dataset records, conversion logic, filters, calculations, categories, visual thresholds, or public-data interpretation.

## Consolidated verification

| Check | Result |
| --- | --- |
| `npm ci` | Passed |
| `npm run typecheck` | Passed |
| `npm test` | **141 passed / 0 failed** |
| `npm run build` | Passed |
| `npm run test:e2e` | **153 passed / 1 expected skip / 0 failed** |
| Desktop/mobile catalogue and navigation workflows | Passed |
| Six UI-family structural regression | Passed |
| Twelve canonical visual-regression snapshots | Passed |
| Data Trust failure/unknown-date hierarchy | Passed |
| Catalogue task-synonym workflow | Passed |
| Main entry >500 kB Vite advisory | Not emitted |

The single Playwright skip is intentional and retained from the established responsive test matrix.

## UI-family and visual baseline

All catalogue routes/views remain classified into the six established families:

- `healthcare-standard`
- `healthcare-rich-directory`
- `location-directory`
- `registry-directory`
- `records-analysis`
- `statistics-analysis`

Post-demo Batches 01–14 completed the remaining family normalization, Batch 15 added the final cross-family regression gate, and Batch 16 added deterministic desktop/mobile visual baselines.

The visual matrix contains **12 committed screenshots**: six representative datasets × desktop/mobile. CI and baseline generation use `mcr.microsoft.com/playwright:v1.62.1-noble`, and the screenshot threshold remains `maxDiffPixelRatio: 0.0005`. No masks are used.

The screenshot baseline is a representative-family guard, not exhaustive per-route/per-tab screenshot coverage. Semantic, accessibility, navigation, failure-state, and UI-family tests provide the wider regression net.

## Bundle state

Batch 18 moved the shared Leaflet/React Leaflet runtime behind lazy map boundaries.

| Asset | Minified | Gzip |
| --- | ---: | ---: |
| Main production entry | **399.63 kB** | **116.04 kB** |
| Deferred shared map runtime | **154.20 kB** | **45.05 kB** |

The main entry fell from 556.42 kB / 163.76 kB gzip and no longer triggers Vite's >500 kB chunk advisory.

## CI/runtime state

Frontend CI and GitHub Pages retain the exact Playwright renderer used by the committed visual baselines:

- container: `mcr.microsoft.com/playwright:v1.62.1-noble`
- project Node: **22**
- `actions/checkout@v7.0.1`
- `actions/setup-node@v7.0.0`
- `actions/upload-artifact@v7.0.1`
- `actions/upload-pages-artifact@v5.0.0`
- `actions/deploy-pages@v5.0.1`

The Pages workflow explicitly has `actions: read`, `pages: write`, and `id-token: write`. It still performs bulk source fetch/conversion, typecheck, unit tests, desktop/mobile Playwright, production build, release-evidence upload, and deployment.

## Data Trust state

Checked-in release evidence at the application baseline reports:

| Metric | Value |
| --- | ---: |
| Static dataset directories | **117** |
| Directories with readable source dates | **43** |
| Directories with unknown source dates | **74** |
| Reused-snapshot refresh fallbacks | **0** |

Batch 20 added 11 authoritative Taipei Department of Health file-update timestamps. Remaining unknown dates remain unknown unless authoritative source evidence is available.

The exact application baseline `main@05c87568` was deployed successfully by GitHub Pages run `35579373983`. That run completed fresh source fetch/conversion, typecheck, **141 unit tests**, **153 passed / 1 expected skip / 0 failed** Playwright tests, production build, release-evidence upload, and Pages deployment. Its `data-release-evidence` artifact is ID `10630175736` (SHA-256 `b293e03c45939cab5f3cf2998fd22ec39b6328c2a0c5557c722b75f382a346f5`) and independently confirms **117 directories / 43 dated / 74 unknown-date / 0 reused-snapshot fallbacks**.

## Catalogue search state

Batch 21 keeps broad topic browsing separate from dataset-specific task synonyms. The browser regression covers:

- `預防針`
- `daycare`
- `union`
- `labor standards`
- `mortuary`
- `cultural venue`

It also verifies that a specific vaccination query does not surface unrelated family-medicine results. Dataset labels, primary categories, and navigation structure are unchanged.

## Remaining non-blockers

No application correctness, navigation, accessibility, build, visual-baseline, or CI-runtime blocker is known at this freeze point.

Known continuing limits:

1. **74 of 117** tracked directories still have no authoritative readable source date.
2. The dashboard presents generated local snapshots rather than live service availability.
3. The 12-image visual baseline is representative by UI family rather than exhaustive for every route and tab.
4. External-map actions disclose the selected address to the external map provider.
5. The release workflow intentionally performs a bulk upstream refresh; a later release can therefore contain newer public-source snapshots even when application code is unchanged.
6. Search aliases are intentionally conservative and should be expanded only from observed user terminology rather than by assigning broad catch-all terms.

## Freeze posture

Post-demo Batches 17–21 are complete:

- Batch 17 — closeout state
- Batch 18 — main bundle reduction
- Batch 19 — CI runtime maintenance
- Batch 20 — source-date metadata A
- Batch 21 — catalogue search tuning

After Batch 22 merges, `main` is feature-frozen. New branches should be limited to a concrete bug, an intentionally scoped source refresh, explicitly requested maintenance, or a separately approved feature. Public-data semantics and unknown-source-date handling remain conservative by default.
