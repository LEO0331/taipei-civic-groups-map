# Data freshness audit — 2026-09-22

Batch 26 adds a deterministic review audit for dated public-data snapshots and performs an authoritative source check before approving any refresh.

## Audit policy

The audit is intentionally conservative. It does **not** call a dataset stale or current based on age alone.

Run:

```bash
npm run data:audit:freshness -- --as-of=YYYY-MM-DD
```

The command reads `public/data/data-trust-manifest.json` and writes `public/data/data-freshness-audit.json`.

Age bands are triage only:

| Band | Age on audit date | Meaning |
| --- | ---: | --- |
| `recent` | 0–180 days | Low-priority review |
| `review` | 181–365 days | Review when practical |
| `priority_review` | 366+ days | Check authoritative upstream first |

A dataset is refreshed only when the authoritative upstream downloadable resource is demonstrably newer than the local snapshot.

## 2026-09-22 audit result

Data Trust currently tracks **117** dataset directories:

- **53** have readable source dates
- **64** have unknown source dates

Among the 53 dated datasets:

- **20** are `recent`
- **10** are `review`
- **23** are `priority_review`

The checked-in JSON report is deterministic for the explicit audit date and is unit-tested against the current Data Trust manifest.

## Top-10 priority source check

The ten oldest dated snapshots were checked directly against their official Taipei Data Platform dataset pages on 2026-09-22.

| Dataset | Local source date | Official downloadable resource date | Result |
| --- | --- | --- | --- |
| `early-intervention-medical-providers` | 2024-07-05 17:21:17 +08:00 | 2024-07-05 17:21:17; second included resource 2025-05-21 15:42:34 | No newer included resource |
| `registered-postpartum-care-institutions` | 2025-03-19 16:17:56 +08:00 | 2025-03-19 16:17:56 | No newer file |
| `indigenous-community-organizations` | 2025-05-23 17:27:54 | 2025-05-23 17:27:54 | No newer file |
| `kidney-health-promotion-facilities` | 2025-06-04 10:35:15 +08:00 | 2025-06-04 10:35:15 | No newer file |
| `medical-radiological-institutions` | 2025-06-04 16:34:52 +08:00 | 2025-06-04 16:34:52 | No newer file |
| `anatomical-pathology-institutions` | 2025-06-05 14:19:39 +08:00 | 2025-06-05 14:19:39 | No newer file |
| `orthopedic-facilities` | 2025-06-06 16:57:49 +08:00 | 2025-06-06 16:57:49 | No newer file |
| `physical-therapy-clinics` | 2025-06-06 | 2025-06-06 12:43:01 | Same-day source; local metadata is less precise |
| `rehabilitation-medicine-institutions` | 2025-06-09 16:39:07 +08:00 | 2025-06-09 16:39:07 | No newer file |
| `xray-examination-medical-institutions` | 2025-06-09 14:14:23 +08:00 | 2025-06-09 14:14:23 | No newer file |

### Important finding

**0 of the top 10 priority-review datasets has a newer downloadable resource timestamp.**

Several official pages have newer metadata-edit timestamps or later collection-period end dates, but those are not substitutes for the downloadable resource's update time. Refreshing these datasets solely because their resource dates are old would therefore create false-positive maintenance work.

## Refresh decision

Batch 26 approves **no dataset refresh**.

The audit leaves the 10 entries in the review queue, but a future refresh must first prove one of the following:

1. the official downloadable resource timestamp is newer than the local `sourceUpdatedAt`;
2. the source switches to a system/API feed whose freshness contract is different and explicitly documented;
3. a source-format or correctness issue requires a focused fetch even without a newer timestamp.

Do not use `npm run data:fetch` as a freshness probe. Use the dataset's official page or focused fetcher only after the source check justifies it.

## Follow-up

The next maintenance cycle can audit the remaining `priority_review` entries in small source families. The physical-therapy entry is also a metadata-precision cleanup candidate because the local date is day-only while the authoritative source includes a time; this is not a data-refresh requirement.
