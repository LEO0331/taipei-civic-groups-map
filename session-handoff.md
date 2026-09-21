# Session Handoff

## Current Objective

- Goal: Maintain the accepted visual regression baseline after Batch 16.
- Status: Batches 01–16 are complete. PR #28 is merged and GitHub Actions run `35549734795` passed build and deployment. Batch 16 adds twelve committed Linux Chromium screenshots spanning the six UI families in desktop and mobile.
- Scope: the baseline is test/documentation-only; no dataset parsing, calculations, filters, charts, tables, source data, conversion behavior, or production CSS changes.
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
- Screenshot baselines are intentionally representative rather than exhaustive. Review every intentionally changed image in `tests/e2e/visual-regression.spec.ts-snapshots/`; regenerate only in the Linux Playwright image recorded in the visual-baseline note.

## Next Session Startup

1. Read `AGENTS.md`, `feature_list.json`, `progress.md`, and `docs/post-demo-visual-regression-baseline-2026-09-21.md`.
2. Run the focused visual suite in the documented Linux Chromium environment before changing any snapshot.
3. Inspect all twelve images before accepting an update; do not mask headings, family chrome, tabs, filters, substantive cards/tables, warnings, or layout.
4. Move next to `post-demo-performance-ci-maintenance` without altering public-data semantics.
