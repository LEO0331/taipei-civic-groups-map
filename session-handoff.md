# Session Handoff

## Current Objective

- Goal: Complete Batch 18 main bundle reduction on `postdemo/18-main-bundle-reduction`.
- Status: Batch 18 is complete. The entry chunk fell from 556.42 kB / 163.76 kB gzip to 396.04 kB / 114.93 kB gzip by deferring the shared Leaflet runtime behind lazy civic-map and district-comparison boundaries. Typecheck, 139 unit tests, production build, focused map loading, and full Playwright (143 passed, 1 expected skip) pass.
- Scope: application import boundaries, regression coverage, and documentation only; no dataset parsing, calculations, filters, charts, tables, source data, conversion behavior, visual thresholds, or production CSS changes.
- Pre-demo verified baseline remains documented in `docs/pre-demo-verification-2026-09-18.md`.
## Verification Evidence

| Check | Result | Notes |
| --- | --- | --- |
| Data fetch | Passed | `npm run data:fetch` in Pages workflow |
| Data conversion | Passed | `npm run data:convert` in Pages workflow |
| Typecheck | Passed | exact verified main commit |
| Unit tests | Passed | exact verified main commit |
| Playwright | Passed | 91 passed, 1 expected desktop-only skip, 0 failed across desktop/mobile |
| Production build | Passed | Vite build succeeded |
| Data release evidence | Passed | 117 directories; 32 dated; 85 unknown-date; 0 reused-snapshot fallbacks |
| GitHub Pages deployment | Passed | workflow run `35298325891` |
| Production URL | Deployed | https://leo0331.github.io/taipei-civic-groups-map/ |

## Current Architecture / UX Baseline

- Dataset and language state are shareable through the URL; Back/Forward, reload, and onboarding persistence are covered by E2E tests.
- Tab-like navigation has a shared accessible contract with keyboard Arrow/Home/End behavior.
- Dataset modules are route-level lazy-loaded and unrelated directory data is deferred.
- Data Trust uses compact normal/caution treatment while stale data and reused snapshots remain prominent.
- Generated-directory geography is dimension-aware: district, city/county, or no distribution tab when no usable location field exists.
- All 156 catalogue routes/views resolve to one of six UI families:
  - `healthcare-standard`
  - `healthcare-rich-directory`
  - `location-directory`
  - `registry-directory`
  - `records-analysis`
  - `statistics-analysis`
- Post-demo Batches 01–14 cover the planned legacy-shell migration sequence across registry, records, statistics, location, and healthcare exceptions. Batch 14 converts the remaining manual healthcare tab lists to shared `AccessibleTabs`, moves bespoke healthcare shells into the healthcare-standard family frame, and opts generated healthcare directories into the shared generated-directory family wrapper.

## Known Non-blocking Items

- The main production JavaScript chunk is now 396.04 kB minified / 114.93 kB gzip; Vite's >500 kB advisory is resolved.
- Source-date metadata remains incomplete: 85 of 117 Data Trust directories have no readable source date.
- GitHub Actions emits deprecation/runtime notices for older action internals.
- Screenshot baselines are intentionally representative rather than exhaustive. Batch 18 does not update screenshots or visual thresholds.

## Next Session Startup

1. Read `AGENTS.md`, `feature_list.json`, `progress.md`, and `docs/post-demo-main-bundle-reduction-2026-09-21.md`.
2. Confirm Batch 18's full local and Frontend CI results before closing it.
3. Start Batch 19 `post-demo-ci-runtime-maintenance` separately; preserve the pinned Playwright Noble renderer and every verification gate.
4. Preserve all dataset/domain behavior.
