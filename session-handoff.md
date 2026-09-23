# Session Handoff

## Current Objective

- Goal: Complete Batch 39 dependency / toolchain audit on `postdemo/39-dependency-toolchain-audit`.
- Status: exact dependency inventory is documented; the only applied dependency change is dev-only `tsx` 4.22.4 → 4.23.15. Major/runtime/compiler/renderer migrations are explicitly deferred into separate bounded changes.
- Scope: dependency/toolchain maintenance and evidence only. No product/UX, source-data, visual-baseline, performance-budget, or release-data-boundary changes.

## Verification Evidence

| Check | Result | Notes |
| --- | --- | --- |
| Batch 39 audit | Passed | PR #53 run 35802278329 green: npm ci/quality passed; desktop 76/76; mobile 77/77; only tsx 4.22.4 → 4.23.15 applied |
| Deferred migrations | Bounded | React 19.3; TypeScript 5.9 then 7; Playwright 1.63 renderer; Vite/plugin-react major; Node 24 |
| Batch 38 Stage 1 | Passed | PR #52 run 35800538287: 5m50s total; quality green; desktop 76 passed in 3.7m; mobile 77 passed in 5.1m |
| Batch 38 Pages fan-out | Pending merged release | One release-prepare snapshot feeds release-build plus desktop/mobile E2E; deploy waits for all gates |
| Batch 29 schema guard | Present | Pages captures before fetch, checks before conversion; failure artifact retained |
| Batch 30 data-change report | Present | Pages compares after schema check; report included in release upload |
| Batch 31/32 Data Trust evidence | Checked in | 117 directories; 63 dated; 54 unknown-date; 0 fallbacks |
| Batch 32 source audit | Documented | 10/10 no newer resource; 0 refreshes; 0 unresolved within selected tranche |
| Freshness triage | Checked in | 23 recent; 13 review; 27 priority_review |
| Batch 33 local verification | Passed | Pinned Noble image: typecheck, 165 unit tests, build, 399.63 / 115.86 kB entry budget, deterministic audit and diff audit |
| Batch 33 PR CI / visual regression | Pending | Existing unchanged full suite is the gate |
| Batch 33 Pages deployment | Pending | Verify exact merged head and release artifact after PR CI |
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

- The production entry is 399.63 kB raw / 115.86 kB independently measured gzip, protected by the 450 / 130 kB budget; the deferred map runtime is observation-only at 154.20 / 45.05 kB.
- Source-date metadata remains incomplete: 54 of 117 directories have no readable source date.
- Screenshot baselines are intentionally representative rather than exhaustive: 12 Linux Chromium images protect the six UI families across desktop and mobile.

## Next Session Startup

1. Merge PR #53 only after the final documentation head repeats the optimized Frontend CI successfully.
2. Batch 39 is otherwise complete; do not add more dependency changes to this branch.
3. Select future dependency work as one bounded migration from `docs/batch-39-dependency-toolchain-audit-2026-09-23.md`.
4. Keep Playwright package/container alignment and Node runtime/type alignment intact.
