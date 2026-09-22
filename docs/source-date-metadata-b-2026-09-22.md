# Source-date metadata batch B — 2026-09-22

Batch 23 adds authoritative source-file dates for ten Taipei Department of Health directories without changing dataset records or application behavior.

## Rule

- Use the Taipei Data Platform resource/file **更新時間**, not the later metadata-page edit time.
- Keep dates unknown when no authoritative resource timestamp is available.
- For a local snapshot assembled from multiple official resources, use the **oldest included resource timestamp** as the top-level `sourceFileUpdatedAt` so Data Trust does not overstate freshness. Preserve each resource timestamp separately in metadata.

## Verified datasets

| Local dataset | Official dataset page | Resource update time used | Frequency |
| --- | --- | --- | --- |
| `diabetes-shared-care-medical-institutions` | https://data.taipei/dataset/detail?id=e6f6ced6-4d66-4be4-93af-57b71b17b2b0 | 2026-09-03 17:56:42 +08:00 | annual |
| `hospital-hemodialysis-resources` | https://data.taipei/dataset/detail?id=051c349f-ed40-436f-8f9a-37b7f90af71b | 2026-03-16 16:03:23 +08:00 | irregular |
| `public-pneumococcal-vaccine-providers` | https://data.taipei/dataset/detail?id=f999b187-bf9c-4df1-8877-4038762d29c5 | 2026-01-07 11:46:42 +08:00 | irregular |
| `registered-postpartum-care-institutions` | https://data.taipei/dataset/detail?id=b940e63f-cde7-498a-9e59-a5de859c5ca3 | 2025-03-19 16:17:56 +08:00 | irregular |
| `schoolchild-dental-preventive-care-providers` | https://data.taipei/dataset/detail?id=fb607e44-ddbb-4f75-a8c3-c0baa6201eb6 | **2026-03-24 15:09:14 +08:00** | annual |
| `contracted-senior-health-examination-providers` | https://data.taipei/dataset/detail?id=9a1aefde-2e4a-467c-9ec4-256e33ad6df0 | 2026-06-12 11:59:26 +08:00 | annual |
| `child-preventive-healthcare-facilities` | https://data.taipei/dataset/detail?id=ae64d555-ec67-4dae-b33d-f6f00578ff3e | 2026-03-24 16:54:12 +08:00 | annual |
| `early-intervention-medical-providers` | https://data.taipei/dataset/detail?id=d12064cb-9fc5-493f-997e-6a30fcb7e65d | **2024-07-05 17:21:17 +08:00** | irregular |
| `rotavirus-vaccine-subsidy-providers` | https://data.taipei/dataset/detail?id=8e89cf57-9a99-4b45-9b59-063f79c06784 | 2026-01-07 11:53:36 +08:00 | irregular |
| `hotel-hygiene-certification-directory` | https://data.taipei/dataset/detail?id=38d691f2-3755-44e3-8aec-558703af5403 | 2026-03-19 12:03:40 +08:00 | irregular |

### Multi-resource details

`schoolchild-dental-preventive-care-providers` combines two official CSVs:

- school pit-and-fissure sealant providers: 2026-03-24 15:18:04 +08:00
- school fluoride-application providers: 2026-03-24 15:09:14 +08:00

The top-level source date therefore uses **15:09:14**, the older included resource.

`early-intervention-medical-providers` combines:

- public-health medical group: 2025-05-21 15:42:34 +08:00
- early-intervention contracted hospitals/clinics: 2024-07-05 17:21:17 +08:00

The top-level source date therefore uses **2024-07-05 17:21:17 +08:00**.

## Data Trust delta

| Metric | Before | After |
| --- | ---: | ---: |
| Dataset directories | 117 | 117 |
| Dated directories | 43 | **53** |
| Unknown-date directories | 74 | **64** |
| Reused-snapshot fallbacks | 0 | 0 |

No source records, filters, calculations, labels, categories, or UI behavior are changed by this batch.
