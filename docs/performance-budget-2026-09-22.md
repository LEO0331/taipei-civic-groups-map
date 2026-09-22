# Performance budget — 2026-09-22

Batch 25 converts the post-demo bundle-size improvement into a CI/release regression guard. It does not perform further code splitting or application optimization.

## Baseline

The latest completed Pages release before this batch is run `35673257839` for `main@2f0e8962`.

Its Vite production build reports:

| Asset | Minified | Gzip |
| --- | ---: | ---: |
| Main entry `index-DwHf4rVw.js` | **399.63 kB** | **116.04 kB** |
| Deferred shared map runtime `TileLayer-BAJ2OghG.js` | **154.20 kB** | **45.05 kB** |

The entry remains materially below the old pre-Batch-18 state of roughly 556 kB and below Vite's 500 kB advisory threshold.

## Blocking entry budget

`npm run performance:budget` runs after `npm run build` and discovers the actual hashed module entry from `dist/index.html`.

It fails when either condition is exceeded:

- raw/minified entry: **450,000 bytes (450.00 kB)**
- gzip entry: **130,000 bytes (130.00 kB)**

The budget deliberately allows modest feature-growth headroom above the 399.63 / 116.04 kB baseline while preventing an unnoticed return toward the previous >500 kB entry.

The measurement uses decimal kilobytes, matching Vite's build report.

## Why only the entry is blocking

The shared Leaflet/React Leaflet runtime is already behind an on-demand map boundary. Its current 154.20 / 45.05 kB size is recorded as an observation, but Batch 25 does not make it a blocking budget because:

1. it is not part of initial entry execution;
2. its size is dominated by third-party mapping runtime;
3. an independent map-chunk ceiling would be arbitrary without a demonstrated user-performance problem.

A later performance investigation can add route/chunk-specific budgets if measurements show a concrete need.

## CI and release integration

The check runs after production build in both:

- Frontend CI pull-request verification;
- GitHub Pages build/release verification.

All existing gates remain in place:

- typecheck
- unit tests
- production build
- performance budget
- full desktop/mobile Playwright including the 12 visual baselines
- release evidence and Pages deployment on `main`

The budget script does not modify generated files or application behavior.

## Unit coverage

The unit suite verifies that the budget helper:

- resolves the hashed Vite entry behind the configured `/taipei-civic-groups-map/` base path;
- accepts the current representative 399.63 / 116.04 kB measurement;
- rejects raw-size regression above 450 kB;
- rejects gzip-size regression above 130 kB;
- reports decimal kB consistently with Vite output.

## Maintenance rule

Do not raise the budget merely to make CI green.

When a legitimate feature needs more entry weight:

1. inspect the production bundle and confirm why the bytes moved into the entry;
2. prefer a safe lazy boundary or dependency reduction when it improves actual load behavior;
3. if the increase is justified, record the new measured baseline and rationale before changing the budget.

The budget protects regressions; it is not a target that application code should grow to fill.
