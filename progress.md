# Session Progress

## Current State

- Last updated: 2026-08-11
- Active feature: none
- Baseline: agent harness installed and validated.

## Latest Evidence

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

## Next Session

1. Read `AGENTS.md`, `feature_list.json`, and this file.
2. Inspect the working tree before editing.
3. Mark exactly one maintenance item `in-progress`, then record fresh verification evidence when finished.
