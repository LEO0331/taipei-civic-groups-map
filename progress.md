# Session Progress

## Current State

- Last updated: 2026-08-13
- Active feature: none
- Baseline: agent harness installed and validated.

## Latest Evidence

- 2026-08-13: added `fixed_site_temporary_childcare` from Taipei City Department of Social Welfare's annual fixed-site temporary-childcare directory. The 23-row local snapshot retains all five official fields, derives districts only from explicit address text, and uses external map lookup without coordinates. All results use a contact-to-confirm state rather than fabricating booking, vacancy, hours, age, fees, eligibility, safety, or quality data; no child or family information is collected or inferred. `npm run typecheck`, `npm test` (106 tests), `npm run build`, and `git diff --check` passed. Browser QA confirmed catalogue discovery, contact-to-confirm badges, local source cards/actions, and keyword filtering to one location.

- 2026-08-13: added `funeral_service_businesses` from the Taipei Mortuary Services Office's filed-and-approved funeral-service-business registry. The 30-row local snapshot preserves all five official fields, keeps responsible-person data in expandable source detail only, provides source-preserving filters/export and external address lookup, and makes no claims about current operation, services, pricing, quality, eligibility, or recommendations. `npm run typecheck`, `npm test` (105 tests), `npm run build`, and `git diff --check` passed. Browser QA confirmed catalogue search, module selection, all source-card actions, and keyword filtering to one company without exposing the responsible-person field by default.

- 2026-08-13: added `withdrawn_illegal_hotel_enforcement_records` from the Taipei Tourism Department's historical administrative dataset. The 37-row local snapshot preserves all eight current CSV fields, conservatively parses ROC dates and clear amounts, and frames every view as withdrawn/revoked enforcement history. It has no property map, current-illegality label, blacklist treatment, or current-liability claim. `npm run typecheck`, `npm test`, `npm run build`, and `git diff --check` passed.

- 2026-08-13: refreshed and strengthened the existing `internal_medicine_institutions` directory instead of adding a duplicate module. The local snapshot has 225 source rows and retains all five official fields. Conversion metadata now records the 2025-06-11 source update and 2026-07-14 metadata update, while quality checks distinguish missing/malformed contacts, invalid postcodes, unresolved districts, exact duplicates, and source conflicts. `npm run typecheck`, `npm test` (103 tests), `npm run build`, and `git diff --check` passed.

- 2026-08-13: added `hospital_discharge_long_term_care_partners` from the Taipei Department of Health directory. The 26-row official source contains address text in its location field, not coordinates, so the module has external map lookup only and no geocoding or map markers. It keeps professional contact names in expandable source detail, supports practical district/contact/location filters and source-preserving export, and explicitly avoids availability, capacity, eligibility, fee, quality, or recommendation claims. `npm run typecheck`, `npm test` (103 tests), `npm run build`, and `git diff --check` passed. Browser inspection confirmed directory filters and contact/location rendering.

- 2026-08-13: added `hakka_organizations` from the 109 ROC year (2020) Taipei Hakka Organizations Registry. The official Big5 CSV contains 45 source rows and seven actual fields, all preserved in local records. The module supports registry search, leader-field and exact-name-repeat filters, source-preserving export, and simple completeness/repeat analysis. It contains no address, map, contact, profile, current-status, or demographic inference. A visible historical note separates the registry’s 2020 meaning from its 2025 file update. `npm run typecheck`, `npm test` (102 tests), `npm run build`, and `git diff --check` passed. Browser QA confirmed catalogue discovery and source-field search.

- 2026-08-13: added `travel_medicine_clinics` from the Taipei Department of Health travel-medicine outpatient hospital directory. The generated local snapshot has 33 source records and preserves all eight official fields. The current mpox column contains only `O` and blank values: only `O` is shown as source-listed; blanks are explicitly not specified. The directory has shared practical filters, call/copy/map actions, source-field details, CSV export, a lightweight district view, and stated safeguards against real-time clinical, appointment, stock, eligibility, price, or quality claims. `npm run typecheck`, `npm test` (101 tests), `npm run build`, and `git diff --check` passed. Browser QA confirmed Health catalogue discovery, the eight-record mpox shortcut, and the dedicated mpox view.

- 2026-08-13: added the `private_cultural_heritage_subsidies` directory from the Taipei Cultural Affairs Department's official CSV. The generated local snapshot has 292 cases, 140 distinct source asset names, 288 conservatively parsed amounts, and a visible 2007–2026 parsed-year span. The new module provides shared filters, source-preserving details/export, eight focused views, conservative district and exact name-and-area registry comparison, and explicit limits on what administrative approvals prove. Focused fetch/conversion completed; `npm run typecheck`, `npm test` (99 tests), `npm run build`, and `git diff --check` passed. Browser QA confirmed catalogue discovery, tab navigation, and an asset-name filter narrowing the directory to four matching records.

- 2026-08-11: replaced the accumulated mixed-language README with a concise English canonical guide and added `README.zh-TW.md` as its Traditional Chinese counterpart. Both documents link to each other and cover onboarding, catalogue maintenance, data-refresh caution, verification, deployment, and public-data limits. Verified headings and language links; `npm run typecheck`, `npm test` (96 tests), `npm run build`, and `git diff --check` passed.

- 2026-08-11: replaced the overflowing dataset tab strip with a searchable public-data catalogue. It groups every directory under seven public-service themes, preserves the selected dataset and existing modules, and throws during development if a new dataset lacks a category. The mobile catalogue is full-screen and includes in-context search. Manual QA confirmed desktop overlay stacking, mobile search, and selection of the designated foreigner health-examination directory. `npm test` (96 tests), `npm run typecheck`, `npm run build`, and `git diff --check` passed.

- 2026-08-11: completed release quality guardrails. The Pages workflow now runs `npm run typecheck` after conversion and retains the trust manifest, release summary, and conversion report as deploy evidence. Corrected existing TypeScript diagnostics with narrow type-preserving changes. Added keyboard focus styling, accessibility source-contract tests, and lazy loading for the physical-therapy and children age 3+ influenza directories. `npm run typecheck`, `npm test` (93 tests), `npm run build`, and `git diff --check` passed.

- `node C:\\Users\\150592\\.agents\\skills\\harness-creator\\scripts\\validate-harness.mjs --target .` — passed, 100/100.
- Previous application verification (2026-08-11): `npm run build` and `npm test` passed (88 tests).
- Current baseline typecheck (2026-08-11): `npm run typecheck` fails in existing, unrelated modules and conversion scripts. Do not treat it as evidence for a scoped feature until those baseline errors are resolved.
- 2026-08-11: reviewed the project and updated `doc/臺北公共資料儀表板－設計決策與演進方向.md` with a prioritized customer-facing roadmap. `git diff --check` passed.
- 2026-08-11: completed freshness, privacy-default, and small-sample safeguards. The generated manifest reports dated and unknown datasets, the active child-influenza dataset shows its 91–180 day source age, and 1–4 voice-reservation records display as `<5`. `npm test` passed (90 tests); `npm run build` passed.

## Risks / Notes

- Catalogue search currently matches dataset labels and topic keywords. Review real search terms after release to tune synonyms; do not silently assign future datasets to a catch-all category.

- The initial two lazy-loaded modules reduce the entry bundle by roughly 36 kB before compression, but the remaining entry bundle is still about 1.9 MB minified. Expand module splitting only after measuring real navigation and caching behavior.

- `npm run data:fetch` is a bulk remote-data refresh and should not be used as a routine check.
- Record a focused fetch/conversion command here when a dataset is intentionally refreshed.
- Freshness metadata is available for 22 of 78 dataset directories. Unknown dates are intentionally visible; extend metadata coverage before treating the overall catalogue as date-complete.

- The source labels its updates as irregular. Its 2026-06-18 source update is exposed through module metadata, but the dashboard remains a generated local snapshot rather than a real-time service.

## Next Session

1. Read `AGENTS.md`, `feature_list.json`, and this file.
2. Inspect the working tree before editing.
3. Mark exactly one maintenance item `in-progress`, then record fresh verification evidence when finished.
