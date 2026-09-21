# Session Handoff

## Current Objective

- Goal: Complete the narrow Final cross-family CI correction on `postdemo/15-final-cross-family-regression-fix`.
- Status: Batches 01–14 and PR #27 are merged to `main`. Final cross-family CI run `35548774168` had 127 passed, 1 expected skip, and 2 identical failures caused by an obsolete catalogue test label (`工會名單` vs actual rendered `工會`). The correction is test/documentation-only and is pending a fresh single CI run.
- Scope: tests/documentation only; no dataset parsing, calculations, filters, charts, tables, source data, or conversion behavior changes.
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

- Main production JavaScript chunk is approximately 549.5 kB minified / 161.4 kB gzip; Vite still emits the >500 kB advisory.
- Source-date metadata remains incomplete: 85 of 117 Data Trust directories have no readable source date.
- GitHub Actions emits deprecation/runtime notices for older action internals.
- Batch 14 Frontend CI passed. Final cross-family run `35548774168` failed only on the duplicated desktop/mobile catalogue-label fixture mismatch; the narrow selector correction is pending verification. Do not mark the UI-family normalization series complete until the corrected workflow passes.

## Next Session Startup

1. Read `AGENTS.md`, `feature_list.json`, `progress.md`, and `docs/post-demo-final-cross-family-regression-2026-09-21.md`.
2. Verify the CI-correction PR/Frontend CI result.
3. If it passes, mark `post-demo-ui-family-normalization` complete and record the exact pass count/run.
4. If it fails, inspect only the reported regression first; do not alter application/domain logic without evidence.
5. Keep deterministic screenshot/pixel-diff visual regression as the next separate task.
