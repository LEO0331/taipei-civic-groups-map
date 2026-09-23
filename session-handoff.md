# Session Handoff

## Current Objective

- Goal: Complete Batch 38 CI / Pages runtime optimization on `postdemo/38-ci-runtime-optimization`.
- Status: Frontend CI Stage 1 is measured green in PR #52 run `35800538287` at 5m50s wall-clock, down from the measured ~9m26s median baseline. Pages Stage 2 is implemented with one authoritative post-conversion release snapshot and parallel release-build / desktop E2E / mobile E2E consumers.
- Scope: workflow orchestration and evidence only. Preserve Node 22, exact Playwright 1.62.1, the pinned Noble container, 12 visual baselines, `maxDiffPixelRatio: 0.0005`, 450/130 kB entry budget, full desktop/mobile E2E, Batch 29 schema guard, Batch 30 data-change evidence, and the fresh Pages data boundary. No product/UX, source-data, dependency, test-coverage, screenshot, or budget weakening.

## Verification Evidence

| Check | Result | Notes |
| --- | --- | --- |
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

1. Inspect the final PR #52 Frontend CI head and merge only the exact green head.
2. Inspect the first Pages run on merged Batch 38: verify release-prepare, release-build, desktop E2E, mobile E2E, release evidence, Pages artifact, and deployment all succeed from the shared converted-workspace snapshot.
3. Record actual Pages wall-clock and compare it with the measured ~12m26s median baseline before marking Batch 38 done.
4. Do not weaken or reorder the schema/release capture → fetch → schema/data-change checks → conversion boundary. Do not begin dependency or product work in Batch 38.
