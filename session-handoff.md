# Session Handoff

## Current Objective

- Goal: Complete post-demo Batch 14 / Healthcare Exceptions on `postdemo/14-healthcare-exceptions` without changing dataset/domain semantics.
- Status: Batches 01–13 are merged to `main`. Batch 14 implementation, regression coverage, and documentation are assembled and pre-push audited; Frontend CI is intentionally pending the single audited branch push.
- Pre-demo verified commit remains `9031db0c3b75eeae7d0bb756b0bd9aee78bf3cb5`.
- Release record: `docs/pre-demo-verification-2026-09-18.md`
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
- Batch 14 automated CI evidence is pending the single audited branch push; do not record a CI pass until the workflow actually completes.

## Next Session Startup

1. Read `AGENTS.md`, `feature_list.json`, `progress.md`, and `docs/pre-demo-verification-2026-09-18.md`.
2. Check `git status --short` for unrelated user changes.
3. Verify the Batch 14 PR/Frontend CI result before declaring the shell-normalization series fully automated-verified.
4. After Batch 14, prioritize post-demo visual-regression baselines, then bundle/CI maintenance.
5. Keep dataset parsing, calculations, filters, charts, and tables unchanged unless the task specifically requires domain-logic changes.
6. Run focused tests first, then typecheck, unit tests, Playwright for UI-facing changes, production build, and `git diff --check`.
