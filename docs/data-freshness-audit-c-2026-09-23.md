# Data freshness audit C — 2026-09-23

Batch 36 reviews the three remaining priority-review sources explicitly deferred by Batch 32. This is an authoritative source check, not a bulk refresh.

## Scope and selection

The checked-in deterministic `2026-09-22` audit now contains 30 `priority_review` directories after Batch 35 adds five previously unknown source dates.

Exclude:

- sources already checked in Batch 26;
- the ten Metadata C sources whose authoritative resource timestamps and snapshot applicability were established in Batch 31;
- the ten medical-institution sources checked in Batch 32;
- the five Metadata D sources just verified in Batch 35.

Batch 32 explicitly left three dated priority-review sources for a later bounded tranche:

- `funeral-service-businesses`;
- `hakka-organizations`;
- `fixed-site-temporary-childcare`.

Batch 36 closes exactly that deferred tranche.

## Authoritative resource comparisons

All timestamps below are Taipei local time (UTC+08:00). The comparison uses the downloadable resource **更新時間**, not metadata-page edit time, collection periods, fetch timestamps, or commit dates.

| Dataset | Local source date | Official downloadable resource date | Official page / resource ID | Decision |
| --- | --- | --- | --- | --- |
| `funeral-service-businesses` | 2025-06-11 10:33:01 | 2025-06-11 10:33:01 | https://data.taipei/dataset/detail?id=20143c69-a790-4dec-bb5e-1f0ed7e76c1e · `702cd8d7-3fa7-43df-a6fa-7d084221dc2e` | No newer file |
| `hakka-organizations` | 2025-06-12 16:16:44 | 2025-06-12 16:16:44 | https://data.taipei/dataset/detail?id=0be09825-0507-4624-8c4b-3872b5117fae · `077f1389-9c6d-4af8-8909-527c73bb2176` | No newer file |
| `fixed-site-temporary-childcare` | 2025-06-13 18:36:01 | 2025-06-13 18:36:01 | https://data.taipei/dataset/detail?id=a7462972-0380-4987-99fb-2071e798ce66 · `57685fb2-cc92-4874-8588-e5a1b1b15b50` | No newer file |

The Hakka page has a later metadata-page edit timestamp (2025-12-18), but its downloadable CSV remains dated 2025-06-12. Batch 36 does not substitute the metadata timestamp for file freshness.

## Refresh decision

**Zero of three sources has a newer authoritative downloadable resource timestamp.**

Therefore Batch 36 approves **no data refresh**.

No focused fetch, converter run, schema capture/check, release-data capture/check, anomaly check, manifest rewrite, or visual-baseline update is justified by this audit.

## Data Trust / freshness state

Batch 36 does not change checked-in freshness data:

- dataset directories: 117;
- dated: 68;
- unknown-date: 49;
- reused-snapshot fallback: 0;
- deterministic 2026-09-22 triage: 24 recent / 14 review / 30 priority_review.

These age bands are review priority only. An old file timestamp does not by itself prove stale or incorrect data.

## Queue effect

This closes the three priority-review entries explicitly deferred by Batch 32.

Future freshness work should not re-audit these three unless:

1. the official downloadable resource timestamp changes;
2. the source moves to a different API/feed freshness contract;
3. a concrete source-format or correctness issue justifies a focused refresh.

## Baseline and verification

Batch 36 branches from `main@6a48dedf9f4ad256d6cb374703641f5af2c1bcc5`.

That baseline already includes:

- Batch 35 Metadata D;
- optimized Frontend CI;
- one-snapshot Pages fan-out;
- source schema guard;
- release data-change evidence;
- semantic data-quality anomaly guard.

Required before merge:

- exact PR-head optimized Frontend CI must pass;
- merged Pages must pass its normal release path.

No application, source-data, dependency, runtime, visual, performance-budget, or release-boundary change is included.
