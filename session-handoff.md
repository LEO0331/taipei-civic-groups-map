# Session Handoff

## Current Objective

- Goal: Complete Batch 32's bounded authoritative freshness audit on `postdemo/32-data-freshness-audit-b`.
- Status: PR #48 / Batch 31 is merged at `main@4f0a2c0`. Ten previously unchecked June 11 medical-institution CSV resource timestamps match their local source dates; no focused refresh is approved. Local typecheck, 165 unit tests, build, and entry budget pass. First PR CI exposed a stale unknown-date E2E fixture, now corrected and focused desktop/mobile verified 2/2. Corrected full PR CI, merge, and Pages release remain pending.
- Scope: audit document and state only. No raw source, converted record, metadata, Data Trust, freshness-audit JSON, UI, screenshot, runtime, or budget changes.
- Pre-demo verified baseline remains documented in `docs/pre-demo-verification-2026-09-18.md`.
## Verification Evidence

| Check | Result | Notes |
| --- | --- | --- |
| Focused source fetch | Not run | No newer authoritative resource found |
| Source schema/release comparison | Not run | No fetch occurred; existing contracts untouched |
| Typecheck / unit / build / entry budget | Passed locally | 165 unit tests; entry 399.63 / 115.86 kB |
| Playwright / visual regression | Pending | Existing PR CI runs the unchanged full suite |
| Data Trust evidence | Unchanged | 117 directories; 63 dated; 54 unknown-date; 0 fallbacks |
| Freshness triage | Unchanged | 23 recent; 13 review; 27 priority_review |
| GitHub Pages deployment | Pending | Verify after exact PR-head merge |
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

1. Read `AGENTS.md`, `feature_list.json`, `progress.md`, and `docs/data-freshness-audit-b-2026-09-22.md`.
2. Verify the exact Batch 32 PR-head Frontend CI result before merge; then inspect the merged Pages release and record the main SHA, run IDs, and release artifact.
3. Do not start Batch 33 or fetch any dataset without a newer authoritative downloadable-resource timestamp. Preserve the 450 / 130 kB entry budget, Node 22/runtime contracts, 12 visual baselines, and Data Trust conservatism.
