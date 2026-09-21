# Session Handoff

## Current Objective

- Goal: Complete the final cross-family regression on `postdemo/15-final-cross-family-regression`, using the pre-demo manual spot-check as the acceptance matrix.
- Status: Batches 01–14 are merged to `main`. Batch 14 Frontend CI run `35547913283` completed successfully. The final regression implementation and documentation are assembled pre-push; its own Frontend CI is intentionally pending the single audited push.
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
- Batch 14 Frontend CI passed. Final cross-family regression CI evidence is pending the single audited branch push; do not record the UI-family normalization series as complete until that workflow passes.

## Next Session Startup

1. Read `AGENTS.md`, `feature_list.json`, `progress.md`, and `docs/pre-demo-verification-2026-09-18.md`.
2. Verify the final cross-family regression PR/Frontend CI result.
3. If it passes, mark `post-demo-ui-family-normalization` complete and keep `post-demo-visual-regression` as the next planned item.
4. If it fails, inspect the exact family/workflow assertion first; do not broaden into domain/data changes without evidence.
5. Keep dataset parsing, calculations, filters, charts, tables, and source semantics unchanged.
