# Source-date metadata batch D — 2026-09-23

Batch 35 adds authoritative downloadable-resource timestamps for five previously unknown-date Taipei Department of Health directories. No source records, converters, filters, calculations, categories, or UI behavior change.

## Evidence rule

- Use the Taipei Data Platform downloadable file/resource **更新時間**, not a later metadata-page edit time.
- Do not infer freshness from collection periods, application build time, fetch execution time, or commit time.
- Batch 37 merged Pages run `35805442007` freshly fetched the release sources immediately before this work. Its release data-change evidence reports these five raw-data directories as unchanged from the checked-in snapshots, so the verified resource timestamps apply to the committed source files without a data refresh.
- Unknown dates remain unknown when an authoritative file timestamp cannot be established.

## Verified datasets

| Local dataset | Official dataset page | Resource ID | Resource update time used | Frequency |
| --- | --- | --- | --- | --- |
| `beauty-hairdressing-hygiene-certifications` | https://data.taipei/dataset/detail?id=374d85bb-fe2f-4768-abd9-7a32922ac756 | `5fc86f6b-07af-4339-a2d9-06b0764ae8cf` | 2026-03-06 10:03:31 +08:00 | irregular |
| `optometry-institutions` | https://data.taipei/dataset/detail?id=7f24c747-2aeb-4f8a-bb09-344ebc675a7f | `39e24675-292e-402b-849f-44070f24aff6` | 2025-06-11 08:13:52 +08:00 | annual |
| `public-influenza-antiviral-providers` | https://data.taipei/dataset/detail?id=c9ad5931-42e5-4698-96b8-1353cf4f5416 | `7002517c-e199-4ae4-a655-fc0b42e6eea3` | 2024-12-05 14:40:55 +08:00 | irregular |
| `gbs-screening-clinics` | https://data.taipei/dataset/detail?id=fc571e16-1109-41c8-a610-a95f8c658f03 | `eecc3064-e59e-433f-b8a6-82f51bab730f` | 2025-06-09 14:05:33 +08:00 | irregular |
| `tb-contact-screening-partner-providers` | https://data.taipei/dataset/detail?id=c4557036-8e61-448d-ad68-7f350b6dd30f | `65e1682c-1c04-43d8-873e-96208cdecbe3` | 2026-06-16 10:57:45 +08:00 | irregular |

Each checked-in `public/data/<dataset>/metadata.json` and matching `data/raw/<dataset>/fetch-metadata.json` carries the same explicit `sourceFileUpdatedAt`.

## Release evidence used

Batch 37 merged Pages run `35805442007` completed successfully on `main@552e3ad64202aced40d7bb6ec041312ff1a225a2`.

Its release data-change summary recorded:

- 145 raw-data directories;
- 12 content-changed directories;
- 133 unchanged directories;
- 0 source-timestamp changes.

All five Batch 35 candidates are in the unchanged set. The release evidence artifact is `10727078128`, SHA-256 `c16b21c5ae353f16f89a20da0a43a200266efc55eb88f7331519d87ae8f1bde2`.

This establishes byte identity between the freshly fetched resources and the committed snapshots at that release boundary. It does not claim that the public records are factually current beyond their official file timestamps.

## Data Trust delta

| Metric | Before | After |
| --- | ---: | ---: |
| Dataset directories | 117 | 117 |
| Dated directories | 63 | **68** |
| Unknown-date directories | 54 | **49** |
| Reused-snapshot fallbacks | 0 | 0 |

## Deterministic freshness-triage delta

Using the existing explicit `2026-09-22` audit date:

| Band | Before | After |
| --- | ---: | ---: |
| recent (≤180 days) | 23 | **24** |
| review (181–365 days) | 13 | **14** |
| priority_review (>365 days) | 27 | **30** |

The priority-review count increases because three newly dated datasets have old authoritative file timestamps. The age bands remain review priorities only and are not claims that a dataset is stale or current.

## Scope boundaries

Batch 35 changes no:

- raw `source.csv` records;
- fetch URLs;
- converters or domain calculations;
- source labels/categories;
- application UI;
- visual baselines;
- dependency/runtime versions;
- performance budgets;
- Batch 29/30/37 release-safety contracts.

## Verification status

Implementation is complete on `postdemo/35-source-date-metadata-d`.

Required before closeout:

- exact PR-head optimized Frontend CI must pass;
- merged Pages must re-run the fresh fetch/schema/data-change/anomaly/conversion boundary;
- final release evidence must confirm 117 directories / 68 dated / 49 unknown / 0 fallbacks.
