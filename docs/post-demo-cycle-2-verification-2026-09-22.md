# Post-demo Cycle 2 verification — 2026-09-22

This document consolidates post-demo Cycle 2 (Batches 23–27) and records the maintenance/freeze baseline before Batch 28 closes the cycle.

## Application baseline

- Verified branch: `main`
- Verified commit: `99f47579c5523d688900a7bb72b5c165238e168a`
- Dependency-maintenance merge: PR #42
- Final PR-head Frontend CI run: `35679197317` (#345)
- Exact GitHub Pages release: `35679835524` (#229)
- Pages release result: successful
- Production URL: https://leo0331.github.io/taipei-civic-groups-map/

Batch 28 is documentation/state-only. It does not change application code, dataset records, fetch/conversion logic, filters, calculations, categories, lazy-loading boundaries, visual thresholds, or public-data interpretation. Its merged freeze commit is `bcbf7e81629f5011026260f2ebc80e3201bf51d4`; GitHub Pages run `35681488171` completed successfully and deployed that exact final documentation state.

## Cycle 2 scope

Cycle 2 intentionally focused on operational quality rather than another UI redesign:

| Batch | Scope | Result |
| --- | --- | --- |
| 23 | Source-date metadata B | 10 authoritative Department of Health dates added; Data Trust improved to 53 dated / 64 unknown |
| 24 | CI trigger deduplication | One automatic Frontend CI run per PR head; manual `workflow_dispatch` retained |
| 25 | Production entry performance budget | 450 kB raw / 130 kB gzip regression guard enforced in PR CI and Pages |
| 26 | Data freshness audit | Deterministic age triage added; top-10 oldest authoritative source check approved 0 refreshes |
| 27 | Dependency maintenance | Low-risk type/runtime-contract maintenance; Playwright renderer pinned exactly |
| 28 | Cycle 2 verification/freeze | Consolidation record only |

## Consolidated verification

The final PR-head Frontend CI run `35679197317` completed successfully:

| Check | Result |
| --- | --- |
| `npm ci` | Passed |
| `npm run typecheck` | Passed |
| `npm test` | **154 passed / 0 failed** |
| `npm run build` | Passed |
| `npm run performance:budget` | **399.63 kB raw / 115.86 kB gzip**, within 450 / 130 kB |
| `npm run test:e2e` | **153 passed / 1 expected skip / 0 failed** |
| Twelve canonical visual-regression snapshots | Passed |
| Dependency runtime contract | Passed |
| Data freshness report reproducibility | Passed |

The single Playwright skip remains intentional in the established responsive test matrix.

The exact `main@99f47579` Pages release run `35679835524` independently repeated the release path:

1. `npm ci`
2. fresh `npm run data:fetch`
3. `npm run data:convert`
4. typecheck
5. **154 unit tests**
6. full desktop/mobile Playwright — **153 passed / 1 expected skip**
7. production build
8. performance budget
9. release-evidence upload
10. Pages artifact upload and deployment

All steps passed.

## Production bundle state

The final Pages production build reports:

| Asset | Vite minified | Vite gzip |
| --- | ---: | ---: |
| Main entry `index-DwHf4rVw.js` | **399.63 kB** | **116.04 kB** |
| Deferred map runtime `TileLayer-BAJ2OghG.js` | **154.20 kB** | **45.05 kB** |

The blocking entry budget uses the repository's independent level-9 gzip measurement:

- raw limit: **450.00 kB**
- gzip limit: **130.00 kB**
- final measured entry: **399.63 kB / 115.86 kB gzip**

The small gzip difference from Vite's 116.04 kB report is expected because the budget script performs its own compression measurement. The deferred map runtime remains observation-only; no user-performance evidence currently justifies a separate blocking ceiling.

## CI/runtime state

Frontend verification now runs automatically on `pull_request` only, with `workflow_dispatch` retained for intentional pre-PR/manual verification. Feature-branch pushes do not launch a duplicate full suite.

The visual/runtime contract is:

- Node runtime: **22**
- Node type definitions: **22.20.4**
- `@playwright/test`: exact **1.62.1**
- Playwright CI/Pages container: `mcr.microsoft.com/playwright:v1.62.1-noble`
- screenshot threshold: `maxDiffPixelRatio: 0.0005`
- canonical screenshots: **12** (six representative UI families × desktop/mobile)

Dependency-contract tests enforce Node runtime/type alignment and Playwright package/container alignment.

Reviewed type-only maintenance at this baseline:

- `@types/leaflet@1.9.22`
- `@types/react@19.3.0`
- `@types/react-dom@19.3.0`
- `@types/node@22.20.4`
- transitive `undici-types@6.21.0`

Major runtime/toolchain changes documented in `docs/dependency-maintenance-2026-09-22.md` remain separate migrations rather than routine maintenance. A Playwright upgrade remains a renderer migration requiring explicit review of all committed screenshots.

## Data Trust state

The exact Pages run `35679835524` uploaded release artifact `10674612688` (SHA-256 `8f9a945d65d6e2ccbc3269fca9616d7708d54098ca36c0979d263d228e54a803`).

That artifact independently confirms:

| Metric | Value |
| --- | ---: |
| Dataset directories | **117** |
| Readable source dates | **53** |
| Unknown source dates | **64** |
| Reused-snapshot fallbacks | **0** |

Batch 23 added ten authoritative Department of Health file timestamps. Unknown dates remain intentionally unknown until authoritative source evidence exists.

## Freshness audit state

The checked-in `public/data/data-freshness-audit.json` is explicitly dated `2026-09-22`.

Among the **53 dated** directories:

| Triage band | Count |
| --- | ---: |
| Recent (0–180 days) | **20** |
| Review (181–365 days) | **10** |
| Priority review (366+ days) | **23** |

These are review priorities only; they do not assert that a dataset is stale or current.

Batch 26 checked the ten oldest dated snapshots directly against their authoritative Taipei Data Platform downloadable-resource timestamps. **0 of 10 had a newer official file timestamp**, so Cycle 2 approved **no data refresh** from that queue. Newer metadata-page edit times or collection-period labels are not substituted for downloadable-resource freshness.

## UI and search state

Cycle 2 does not change the six established UI families or navigation/domain behavior. The Cycle 1 regression net remains intact:

- semantic/unit contracts
- accessibility and failure-state coverage
- desktop/mobile navigation
- cross-family structure checks
- 12 committed visual baselines
- catalogue task-synonym coverage

No screenshot baseline or visual threshold changed during Cycle 2.

## Remaining non-blockers

No application correctness, build, visual-regression, performance-budget, CI-runtime, or deployment blocker is known at this freeze point.

Continuing limits are:

1. **64 of 117** tracked directories still have no authoritative readable source date.
2. Freshness age bands are triage only; only the top 10 oldest dated entries were manually checked against current authoritative resource timestamps in Batch 26.
3. The dashboard uses generated local snapshots rather than live service availability.
4. The 12-image visual baseline is representative by UI family rather than exhaustive per route/tab.
5. The deferred map runtime is observed but has no independent blocking budget.
6. Major runtime/toolchain upgrades remain separate migration work, especially any Playwright renderer change.
7. The Pages release intentionally performs fresh upstream fetch/conversion; public-source snapshots may therefore change across releases even without application-code changes.

## Freeze posture

Post-demo Cycle 2 is complete after Batch 28:

- Batch 23 — source-date metadata B
- Batch 24 — CI trigger deduplication
- Batch 25 — production entry performance budget
- Batch 26 — data freshness audit
- Batch 27 — dependency maintenance
- Batch 28 — Cycle 2 verification/freeze

`main@bcbf7e8` is the stable demo freeze. New work should begin only for a concrete bug, a source refresh justified by authoritative evidence, an explicitly approved feature, or a separately scoped runtime/toolchain migration. Preserve Data Trust conservatism, the performance budget, and the pinned visual renderer by default.

For the short presentation-day checklist and the current public-data caveats, see [Demo briefing — 2026-09-22](demo-briefing-2026-09-22.md).
