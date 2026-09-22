# Data freshness audit B — 2026-09-22

Batch 32 checks a second bounded tranche of older, dated public-data snapshots against authoritative downloadable-resource timestamps. It is an evidence review, not a bulk data refresh. The checks below were made against the live Taipei Data Platform dataset pages on 2026-09-22.

## Scope and selection

The checked-in deterministic `2026-09-22` audit lists **27** `priority_review` directories. Exclude the ten datasets already checked in Batch 26 and the ten whose resource timestamps and byte-identical raw snapshots were verified in Batch 31. Among the remaining entries, the ten selected below form one coherent Taipei Department of Health medical-institution family, all tied at **468 age-days** with June 11, 2025 resource dates. The funeral-service entry shares that age but belongs to a different source family; it, two other unresolved entries (`hakka-organizations` and `fixed-site-temporary-childcare`), and the previously checked entries are outside this tranche.

Each listed official page has a single corresponding CSV under **檔案下載**. Its resource ID was matched to the checked-in fetcher or raw `fetch-metadata.json`; the table compares the CSV row's **更新時間** with the local `sourceFileUpdatedAt`. It does not use the page's later **詮釋資料更新時間**, collection-period end, fetch time, or commit date.

## Authoritative resource comparisons

All times below are Taipei local time (UTC+08:00). “No newer file” means the official downloadable resource's displayed update time matches the local source date; it does not claim that the institution listing is current or complete.

| Dataset | Local source date | Official downloadable resource date | Official source page / resource ID | Result |
| --- | --- | --- | --- | --- |
| `dermatology-medical-institutions` | 2025-06-11 15:08:38 | 2025-06-11 15:08:38 | [臺北市皮膚科醫療機構](https://data.taipei/dataset/detail?id=f5323b91-1447-4e0e-829d-565b75b87d06) · `95137332-08ee-4fcf-9708-bf185aae1bcc` | No newer file |
| `ent-facilities` | 2025-06-11 15:09:45 | 2025-06-11 15:09:45 | [臺北市耳鼻喉科醫療機構](https://data.taipei/dataset/detail?id=d3e25673-87c3-429b-bc95-6c93f2ba80b2) · `51b85ad4-5a04-47a0-932f-c2a913e82a8a` | No newer file |
| `family-medicine-institutions` | 2025-06-11 15:00:41 | 2025-06-11 15:00:41 | [臺北市家庭醫學科醫療機構](https://data.taipei/dataset/detail?id=34e855c7-7808-46d2-b9b1-f7244fe2b9b5) · `1a6a6056-4649-48be-b071-fba88d025d10` | No newer file |
| `general-chinese-medicine-institutions` | 2025-06-11 15:14:07 | 2025-06-11 15:14:07 | [臺北市中醫一般科醫療機構](https://data.taipei/dataset/detail?id=8f11e126-cd1a-4991-9532-3b45818298fb) · `68a4405e-b85c-4d56-b683-7e0dd1cfada2` | No newer file |
| `general-dental-medical-institutions` | 2025-06-11 15:15:51 | 2025-06-11 15:15:51 | [臺北市牙醫一般科醫療機構](https://data.taipei/dataset/detail?id=809d4bc4-bc36-4f58-af46-ba48d9b40904) · `c3caa3b5-e3e0-47ed-ba16-76baddd2a61a` | No newer file |
| `general-western-medicine-institutions` | 2025-06-11 15:17:04 | 2025-06-11 15:17:04 | [臺北市西醫一般科醫療機構](https://data.taipei/dataset/detail?id=dfd0f10f-0f4d-4c92-96bc-997e7596297d) · `50f3261b-da8e-4300-abcb-09a6b7aa2230` | No newer file |
| `internal-medicine-institutions` | 2025-06-11 16:40:31 | 2025-06-11 16:40:31 | [臺北市內科醫療機構](https://data.taipei/dataset/detail?id=dbb54bf8-74a8-475d-ae88-a0ec4262c39a) · `da296984-a858-45d2-ba8b-866cf133bd23` | No newer file |
| `obstetrics-gynecology-institutions` | 2025-06-11 15:10:52 | 2025-06-11 15:10:52 | [臺北市婦產科醫療機構](https://data.taipei/dataset/detail?id=83dc0502-245a-4d77-99f4-786127cedea2) · `ba860191-ad03-49a3-8df4-29e0a01f3026` | No newer file |
| `pediatric-medical-institutions` | 2025-06-11 14:58:56 | 2025-06-11 14:58:56 | [臺北市兒科醫療機構](https://data.taipei/dataset/detail?id=8aeb2d36-b806-4461-9763-5c35017049b0) · `879c295d-b57e-432c-b673-4fe905ba1282` | No newer file |
| `plastic-surgery-medical-institutions` | 2025-06-11 15:13:06 | 2025-06-11 15:13:06 | [臺北市整形外科醫療機構](https://data.taipei/dataset/detail?id=eab0da4e-0a6e-432e-80da-dcddeed0fef3) · `0a376425-b99f-45db-887d-a9877a0c8eb0` | No newer file |

## Decision and remaining queue

**Ten of ten have no newer authoritative downloadable resource timestamp.** No focused fetch, converter, schema-guard capture/check, or release-data-change capture/check was run: those commands are required before and after a justified fetch, and none is justified here. No dataset was left unresolved *within the selected tranche*. The remaining unselected priority-review entries are not cleared by this audit; the June 11 funeral-service entry and the June 12/13 Hakka and temporary-childcare entries remain candidates for a separate bounded review.

Data Trust is unchanged at **117 directories / 63 dated / 54 unknown-date / 0 reused-snapshot fallbacks**. The deterministic `2026-09-22` audit is unchanged at **23 recent / 13 review / 27 priority_review**. No source records, metadata, manifests, conversion reports, schema guard, release-change summary, or visual baselines were rewritten. The 27 priority-review entries remain in their age band even after source verification: **age bands are review priorities only, not claims that a dataset is stale or current**. An identical resource timestamp is not a byte-identity or semantic-correctness proof; a later change still requires its own authoritative evidence and guarded focused refresh.

## Local verification

- The ten live official dataset pages exposed the matching resource IDs and CSV file **更新時間** recorded above.
- `npm run typecheck` — passed in the pinned Linux environment.
- `npm test` — 165 passed, including deterministic freshness-audit and Batch 29/30 contract tests.
- `npm run build` and `npm run performance:budget` — passed; entry **399.63 kB raw / 115.86 kB gzip**, within **450 / 130 kB**.
- `feature_list.json` parsed, checked-in Data Trust/audit counts were checked, and `git diff --check` passed.
- No local E2E was rerun because this branch changes no UI/runtime behavior. The PR's normal Frontend CI must still run the full desktop/mobile Playwright and twelve visual comparisons before merge.
