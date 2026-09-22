# Session Handoff

## Current Objective

- Goal: Preserve the Cycle 2 demo freeze.
- Status: Application baseline `main@99f47579` passed Frontend CI run `35679197317` (154 unit tests; 153 Playwright passes and 1 expected skip) and Pages run `35679835524`. Final freeze commit `main@bcbf7e8` passed and deployed in Pages run `35681488171`.
- Scope: no new feature work before the demo. Limit changes to demonstrated blockers only.
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

- The production entry is 399.63 kB raw / 115.86 kB independently measured gzip, protected by the 450 / 130 kB budget; the deferred map runtime is observation-only at 154.20 / 45.05 kB.
- Source-date metadata remains incomplete: 64 of 117 directories have no readable source date.
- Screenshot baselines are intentionally representative rather than exhaustive: 12 Linux Chromium images protect the six UI families across desktop and mobile.

## Next Session Startup

1. Read `AGENTS.md`, `feature_list.json`, `progress.md`, and `docs/demo-briefing-2026-09-22.md`.
2. Treat `main@bcbf7e8` as the demo freeze; do not start maintenance work unless it addresses a concrete blocker.
3. Preserve the 450 / 130 kB entry budget, Node 22/runtime contracts, 12 visual baselines, Data Trust conservatism, and all verification gates.
