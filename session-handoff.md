# Session Handoff

## Current Objective

- Goal: Complete Batch 35 / Source-date Metadata D on `postdemo/35-source-date-metadata-d`.
- Baseline: `main@552e3ad64202aced40d7bb6ec041312ff1a225a2`.
- Scope: source-date provenance/evidence only. No raw source records, converters, domain calculations, product/UX, dependency/runtime, visual-baseline, or performance-budget changes.

## Implemented Metadata D Tranche

Five previously unknown-date Department of Health datasets now carry explicit authoritative Taipei downloadable-resource timestamps in both public metadata and raw fetch provenance:

| Dataset | `sourceFileUpdatedAt` |
| --- | --- |
| `beauty-hairdressing-hygiene-certifications` | `2026-03-06T10:03:31+08:00` |
| `optometry-institutions` | `2025-06-11T08:13:52+08:00` |
| `public-influenza-antiviral-providers` | `2024-12-05T14:40:55+08:00` |
| `gbs-screening-clinics` | `2025-06-09T14:05:33+08:00` |
| `tb-contact-screening-partner-providers` | `2026-06-16T10:57:45+08:00` |

Evidence rule: use the downloadable file/resource **更新時間** only; do not substitute metadata-page edit time, collection periods, fetch time, or commit time.

## Snapshot Applicability Evidence

Batch 37 merged Pages run `35805442007` freshly fetched the release sources. Its data-change evidence reports all five Batch 35 candidate directories as unchanged from the checked-in snapshots.

Release evidence artifact:

- ID: `10727078128`
- SHA-256: `c16b21c5ae353f16f89a20da0a43a200266efc55eb88f7331519d87ae8f1bde2`

Therefore the verified resource timestamps apply to the committed source bytes without a data refresh.

## Data Trust / Freshness Delta

- dataset directories: 117 → 117
- dated: 63 → **68**
- unknown-date: 54 → **49**
- reused-snapshot fallback: 0 → 0

Deterministic `2026-09-22` audit:

- recent: 23 → **24**
- review: 13 → **14**
- priority_review: 27 → **30**

The increase in priority-review is expected: newly known old source dates become reviewable instead of remaining unknown. Age bands remain triage only.

## Files

- Five `public/data/<dataset>/metadata.json` files
- Five `data/raw/<dataset>/fetch-metadata.json` files
- `public/data/data-trust-manifest.json`
- `public/data/data-release-summary.json`
- `public/data/data-freshness-audit.json`
- `docs/source-date-metadata-d-2026-09-23.md`
- state files

No `source.csv` file changes are intended.

## Verification Gates

| Check | Status |
| --- | --- |
| Batch 37 final Frontend CI | Passed — run `35804989294` |
| Batch 37 merged Pages | Passed — run `35805442007` |
| Batch 35 checked-in deterministic evidence | Implemented — 117 / 68 / 49 / 0 and 24 / 14 / 30 |
| Batch 35 PR-head optimized Frontend CI | Pending |
| Batch 35 merged Pages fresh release | Pending |

## Next Actions

1. Open the Batch 35 PR.
2. Require the exact PR head to pass quality + desktop + mobile Frontend CI.
3. Merge only that green head.
4. Verify the merged Pages run passes schema → data-change → anomaly guard → conversion and downstream Batch 38 fan-out.
5. Confirm final release evidence is 117 directories / 68 dated / 49 unknown / 0 fallback.
6. Then proceed to Batch 36 freshness audit C.

## Preserved Contracts

- Batch 29 schema guard.
- Batch 30 release data-change evidence.
- Batch 37 semantic anomaly guard.
- Batch 38 one-snapshot Pages fan-out.
- Node 22 / exact Playwright 1.62.1 Noble.
- 12 visual baselines / maxDiffPixelRatio 0.0005.
- 450 / 130 kB production-entry budget.
