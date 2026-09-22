# Source-date metadata batch C — 2026-09-22

Batch 31 adds authoritative downloadable-resource timestamps for ten previously unknown-date directories. No source records, converters, filters, calculations, categories, or UI behavior are changed.

## Evidence rule

- Use the Taipei Data Platform file/resource **更新時間**, not the later metadata-page edit time.
- Do not infer a date from collection periods or fetch execution time.
- Batch 30 Pages run `35694991663` fetched the upstream sources immediately before this work. Its release comparison showed all ten candidate raw datasets were byte-for-byte unchanged from the checked-in snapshots, so the verified resource timestamps apply to the committed source files without requiring a data refresh.
- Unknown dates remain unknown when the authoritative file timestamp cannot be established.

## Verified datasets

| Local dataset | Official dataset page | Resource update time used | Frequency |
| --- | --- | --- | --- |
| `adult-influenza-vaccine-providers` | https://data.taipei/dataset/detail?id=0db13d34-51e3-497a-a023-286d5ef692ea | 2026-03-17 08:53:58 +08:00 | irregular |
| `fertility-subsidy-contracted-hospitals` | https://data.taipei/dataset/detail?id=9ee72240-f9b3-42a7-bcbe-e1bb1a28a2dc | 2026-01-13 12:20:51 +08:00 | irregular |
| `five-cancer-screening-providers` | https://data.taipei/dataset/detail?id=ae20d75c-dffb-4d4f-85e1-9c512189005c | 2026-06-24 14:24:52 +08:00 | irregular |
| `home-disabled-family-physician-care-providers` | https://data.taipei/dataset/detail?id=988f76c5-2fdc-490a-9104-70071049bb31 | 2025-06-12 16:41:59 +08:00 | irregular |
| `home-nursing-institutions` | https://data.taipei/dataset/detail?id=a846fd02-a054-4206-b584-70dea8ad3a25 | 2026-03-17 09:47:31 +08:00 | irregular |
| `internet-addiction-services` | https://data.taipei/dataset/detail?id=76015003-6bad-4170-ab9d-548eaad90bba | 2026-06-12 12:52:25 +08:00 | irregular |
| `medical-laboratories` | https://data.taipei/dataset/detail?id=aefb0455-c010-48dc-8162-5b319bcf0a1a | 2025-06-06 16:30:18 +08:00 | annual |
| `methadone-cross-region-services` | https://data.taipei/dataset/detail?id=2e4dcb8a-af96-4170-a5dc-32b5dc7e9247 | 2024-12-17 15:35:13 +08:00 | irregular |
| `nationwide-addiction-treatment-services` | https://data.taipei/dataset/detail?id=0e28b90e-3372-4d18-b95e-7dfb4c870a69 | 2025-06-20 11:19:54 +08:00 | irregular |
| `psychiatric-rehabilitation-and-nursing-institutions` | https://data.taipei/dataset/detail?id=eb02e174-63c7-46fb-b8e7-4f7e73e0a95e | 2026-09-14 09:23:58 +08:00 | irregular |

## Data Trust delta

| Metric | Before | After |
| --- | ---: | ---: |
| Dataset directories | 117 | 117 |
| Dated directories | 53 | **63** |
| Unknown-date directories | 64 | **54** |
| Reused-snapshot fallbacks | 0 | 0 |

The deterministic 2026-09-22 freshness triage changes from **20 recent / 10 review / 23 priority_review** to **23 recent / 13 review / 27 priority_review**. These bands remain review priority only and are not claims that a dataset is current or stale.

## Release-provenance integration

Each dataset now has `public/data/<dataset>/metadata.json` for Data Trust and matching `data/raw/<dataset>/fetch-metadata.json` carrying the same authoritative `sourceFileUpdatedAt`. The raw metadata does not alter source content hashing and does not fabricate download timestamps.
