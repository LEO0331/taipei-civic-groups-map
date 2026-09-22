# Session Handoff

## Current Objective

- Goal: Complete Batch 33 Cycle 3 verification/freeze on `postdemo/33-cycle-3-verification`.
- Status: Batches 29–32 and the Batch 32 fixture correction are merged through `main@b70c2b2`. Checked-in Data Trust is 117 / 63 dated / 54 unknown / 0 fallback; deterministic audit is 23 recent / 13 review / 27 priority_review. The corrected Pages run `35700502040` and Batch 33 PR/release verification must be reviewed after this documentation implementation.
- Scope: documentation/state/evidence only. No raw source, converted record, metadata, Data Trust, freshness-audit JSON, UI, screenshot, runtime, dependency, or budget changes.
- Pre-demo verified baseline remains documented in `docs/pre-demo-verification-2026-09-18.md`.
## Verification Evidence

| Check | Result | Notes |
| --- | --- | --- |
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

1. Read `AGENTS.md`, `feature_list.json`, `progress.md`, and `docs/post-demo-cycle-3-verification-2026-09-22.md`.
2. Check the exact Batch 33 PR-head CI and merged Pages run; record their run IDs, pass/skip/fail counts, release evidence artifact ID/digest, and merged main SHA. Do not mark Cycle 3 done until those gates pass.
3. Do not start Cycle 4 or fetch any dataset without a newer authoritative downloadable-resource timestamp. Preserve the 450 / 130 kB entry budget, Node 22/runtime contracts, 12 visual baselines, and Data Trust conservatism.
