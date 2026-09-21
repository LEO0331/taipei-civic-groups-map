# Final cross-family regression — 2026-09-21

This record converts the **Final manual demo spot-check** from `docs/pre-demo-verification-2026-09-18.md` into a post-demo automated regression gate after Batches 01–14 completed the planned UI-family shell normalization.

Batch 14 is already merged, and Frontend CI run `35547913283` completed successfully with typecheck, unit tests, production build, and full Playwright passing.

## Purpose

The pre-demo baseline intentionally verified representative family behavior manually before presentation, then deferred broad legacy-shell migration until after the demo. With the registry, records, statistics, location, and healthcare-exception waves now merged, this final regression checks that the six UI-family contracts still work together as one application.

This is a **structural/workflow regression**, not the separate screenshot/pixel-diff visual-baseline task.

## Cross-family matrix

| Pre-demo spot-check intent | Automated representative | UI family | Regression evidence |
| --- | --- | --- | --- |
| Rich healthcare layout and Data Trust | `adultInfluenzaVaccineProviders` | `healthcare-rich-directory` | family marker, exact heading, warning block, readable Data Trust dataset label, one selected tab |
| Hospice geography correctness | `hospicePalliativeCareInstitutions` | `healthcare-standard` | family marker, exact heading, city/county tab, readable `臺北市`, no raw `63000000` label |
| Location workflow and keyboard tabs | `physicalTherapyClinics` | `location-directory` | family marker, exact heading, Home/End roving-tab behavior |
| Normalized registry shell | `laborUnions` | `registry-directory` | family marker, exact heading, shared accessible tabs, one selected tab |
| Normalized records shell | `laborViolations` | `records-analysis` | family marker, exact heading, shared accessible tabs, one selected tab |
| Normalized statistics shell | `alternativeServiceReserveStatistics` | `statistics-analysis` | family marker, exact heading, shared accessible tabs, one selected tab |
| Civic browse/search workflow | `civic` | `location-directory` | catalogue opens/closes, directory view activates, source-record search filters the rendered directory |
| Language / reload / Back-Forward | adult influenza → physical therapy → labor unions | cross-family | route history restores exact datasets; language survives family switch and reload |

## Additional accessibility cleanup

Batch 14 removed the App-level legacy tab bridge and migrated the remaining healthcare tab lists to shared `AccessibleTabs`. The existing vaccination-provider keyboard regression still used the old “legacy subtabs” wording. This final pass updates that regression to assert the healthcare-specific accessible tablist label and the `data-accessible-tabs="true"` marker directly.

## Scope guard

No application behavior, dataset parsing, source URLs, conversion scripts, calculations, filters, charts, tables, or public-data semantics are changed by this batch. The new gate is intentionally limited to test coverage and state documentation.

## Pre-push audit

Before the branch ref is moved:

- the diff is limited to two Playwright files and four documentation/state files;
- no `src/`, `data/`, `public/`, or conversion-script files change;
- `feature_list.json` parses successfully;
- the new regression covers all six family identifiers and all eight pre-demo spot-check intents;
- no merge-conflict markers or added trailing whitespace are present;
- the longer family traversals are split into separate tests with explicit 60-second budgets rather than one oversized repeated-navigation loop.

## Verification strategy

Following the Batch 12–14 workflow adjustment, implementation, test coverage, and documentation are assembled and audited before the branch is pushed. Frontend CI is then allowed to run once as the full automated verification instead of being used as an iterative development loop.

The dedicated screenshot/pixel-diff baseline for representative desktop/mobile states in all six families remains the next separate post-demo task.
