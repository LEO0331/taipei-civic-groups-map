# Post-demo main bundle reduction — 2026-09-21

## Goal and scope

Batch 18 removes the remaining Vite `>500 kB` main-chunk advisory through measured code splitting. It does not change dataset parsing, public data, calculations, filters, charts, tables, source URLs, UI-family assignments, or public-data interpretation.

## Measurement

A Linux production build with source maps showed that the entry chunk still contained the complete Leaflet and React Leaflet runtime. The retaining imports were both in `App.tsx`:

- the civic directory's `CivicMap` implementation was defined directly in the entry module;
- `DistrictComparison` was a separate file but still statically imported by the entry.

The remaining route-specific dataset modules were already broadly lazy-loaded. React DOM and the application/navigation shell appropriately remain entry dependencies.

| Production asset | Before | After | Change |
| --- | ---: | ---: | ---: |
| Main chunk, minified | 556.42 kB | 396.04 kB | −160.38 kB (−28.8%) |
| Main chunk, gzip | 163.76 kB | 114.93 kB | −48.83 kB (−29.8%) |
| Shared on-demand map runtime | Included in main | 154.20 kB / 45.05 kB gzip | Deferred until a map surface opens |

The production build no longer emits Vite's `>500 kB` chunk advisory.

## Implementation

`CivicMap` now lives in its own lazy module, and `DistrictComparison` uses the same lazy boundary. When a civic map, comparison, or another existing lazy map module opens, Rollup loads one shared Leaflet chunk. The civic landing page, directory, overview, catalogue, Data Trust, and non-map dataset routes no longer download the mapping runtime in the entry bundle.

A source-contract unit test prevents `react-leaflet` from returning to `App.tsx`. A desktop/mobile browser regression opens the civic map and verifies the deferred Leaflet container renders.

## Verification

- `npm run typecheck` — passed.
- `npm test` — passed, 139 tests.
- `npm run build` — passed with no chunk-size advisory.
- Focused deferred-map Playwright — 7 passed, 1 expected desktop skip.
- Full `npm run test:e2e` — passed, 143 passed and 1 expected desktop-only skip.
- `git diff --check` — passed.

## Remaining boundary

Batch 18 intentionally does not modernize GitHub Actions or change the pinned Playwright renderer. That work remains Batch 19.
