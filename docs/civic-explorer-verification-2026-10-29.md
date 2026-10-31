# Civic Explorer verification — 2026-10-29

Updated 2026-10-31 after rebasing onto current main `aff5a81` (merged Policy 10 and Vite 6.4.5). The existing Policy 10 destination is preserved; this PR adds no dataset.

Result: **PASS_WITH_LIMITATIONS** for manual Draft PR review. No automatic merge or deployment. The final Linux CI status belongs to the PR checks/description; local Windows results do not substitute for the canonical Linux screenshot gate.

## Catalogue and implementation

The actual catalogue exposes **157 navigation entries**, including comparison, overview and notes. The seven existing categories contain health **60**, care **32**, work **28**, learning **10**, city **18**, animals **6**, insights **3**. Counts are computed from `getCatalogueItems` and `buildDatasetCatalogue`, never used as a hardcoded UI total. [Generated mapping evidence](evidence/civic-explorer/mapping-integrity.json) accounts for every ID exactly once, matching `datasetCategoryById` with no unused mappings.

Existing label expressions/order were moved verbatim from App into `src/lib/catalogueItems.ts`; SHA-256 regression tests capture the pre-extraction Chinese and English results. `buildCivicCatalogueAdapter` calls the existing catalogue matcher for both languages and projects matching IDs back to localized entries. Category keywords and dataset search aliases are neither copied nor extended. There is no second dataset registry or new data model.

The original catalogue remains the default. Its popover offers an optional Explorer, loaded through React.lazy with deferred CSS. Seven native buttons reuse Portfolio's layered SVG primitive; data entries stay in an HTML list. Native scene/list tabs reuse AccessibleTabs. Responsive layout, visible focus, Enter/Space, Home/End, touch taps, Escape, reset and return focus are covered. A local boundary catches failed Explorer imports and preserves catalogue return, including repeated reopening. The underlying dashboard stays mounted.

Descriptions are omitted rather than inventing service semantics. Visible copy distinguishes navigation entries from facility counts, conceptual layout from geography/ranking, and historical/administrative records from current availability. See [attribution](civic-explorer-attribution.md) for references and full MIT notice.

## Navigation and governance

Category/search/view are optional in-memory presentation state. Dataset links use `buildNavigationUrl`, retain real IDs and language, preserve modified-click/native link behavior, and ordinary activation calls the existing `selectDataset` path. Tests cover category selection without URL changes, activation, URL/language, Back/Forward, direct reload, selected-page focus and unchanged Data Trust on entry/return and direct loading.

Data Trust retains the exact current-main behavior, including Policy 10's own trust presentation and its exclusion from the generic Data Trust panel. [Protected-scope evidence](evidence/civic-explorer/protected-scope.json) confirms no changes to existing public data, fetch/conversion scripts, dataset modules, interpretation utilities, export logic, metadata, privacy presentation or navigationState. No source refresh/conversion was run. Build-generated trust/release manifests were restored to the baseline before delivery. Existing unknown-date labels, source timestamps, snapshot information, administrative/historical limits and CSV behavior are unchanged.

## Actual validation

- `npm run typecheck`: passed (strict project configuration).
- `npm test`: **211 passed**, including original-label hashes, every mapping, both language searches, cross-language labels, aliases and unmatched queries.
- `npm run build`: passed.
- `npm run performance:budget`: passed **401.79 kB raw / 116.63 kB gzip**, below unchanged **450 / 130 kB** limits.
- `npm run test:e2e`: full desktop/mobile suite executed on Windows: **145 passed / 1 expected skip / 14 failed**. Twelve failures were absent Windows snapshots (repository baselines are Linux-only); two were an existing wall-clock-sensitive hospice fixture, now fixed by freezing only that test at its reviewed 2026-09-22 date. No baseline PNG or tolerance was changed.
- Before rebase, focused repository Playwright run: **20 passed / 0 failed**, covering all seven actual lists, touch, lazy loading, chunk failure/reopening, bilingual/cross-language search, list mode, focus, keyboard, reduced motion, URL/history/reload and current/stale/unknown/fallback Data Trust. [Log](evidence/civic-explorer/focused-e2e.txt).
- Final rebased behavioral suite: **175 passed / 1 expected skip / 0 failed**, using the existing repository runner with `--grep-invert 'canonical UI-family visual baselines'`. Covers the complete current catalogue and existing Policy 10 tests; only the 12 Linux-only pixel checks were excluded locally. [Full behavioral log](evidence/civic-explorer/behavioral-e2e.txt).
- Current-main offline Policy 10 source admission and snapshot verification commands both passed; no fetch, conversion or source edit.
- `node scripts/checkCivicExplorerLoading.mjs`: passed against the production preview. Default notes entry fetched no Explorer asset. Opening Explorer and selecting all seven categories added exactly its JS/CSS, **zero dataset JSON, heavy module or map-runtime requests**, and zero unexpected page errors. [Exact requests/assets](evidence/civic-explorer/production-loading.json).
- `npm audit --json`: **0 vulnerabilities / exit 0** on current-main Vite 6.4.5. [Actual audit](evidence/civic-explorer/dependency-audit.json). Manifest and lockfile are unchanged relative to main; its separately merged fix resolves the initial pre-rebase finding.
- `git diff --check`: passed.
- No lint script exists. TypeScript and repository source-contract tests provide the supported static checks.
- Independent read-only code review: no implementation blocker; requested all-hub, failed-chunk and network checks were added and passed.

Local runtime is Node 24.14.1; repository CI retains Node 22 and pinned Playwright 1.62.1 Noble. The PR runs that authoritative Linux runtime and all twelve unchanged visual baselines.

## Bundle comparison

Same repository budget method (decimal kB, independent level-9 gzip):

| Asset | Before | After |
| --- | ---: | ---: |
| Initial JS | 400.12 kB / 115.99 kB gzip | 401.79 kB / 116.63 kB gzip |
| Deferred Explorer JS | absent | 7,341 bytes / 3,465 gzip |
| Deferred Explorer CSS | absent | 4,208 bytes / 1,423 gzip |

Entry growth is **1.67 kB raw / 0.64 kB gzip** (about 0.42% / 0.55%). The existing map runtime stays deferred. [Baseline build](evidence/civic-explorer/baseline-build.txt), [production measurement](evidence/civic-explorer/production-loading.json).

## Visual and accessibility evidence

[English desktop](evidence/civic-explorer/en-desktop.png), [Chinese desktop](evidence/civic-explorer/zh-desktop.png), [English mobile](evidence/civic-explorer/en-mobile.png), [Chinese mobile](evidence/civic-explorer/zh-mobile.png). Visual verdict **94/100** against the Feitsui reference, with intentional host cream/ink palette and seven-hub adaptation. [Verdict](evidence/civic-explorer/visual-verdict.json).

Native semantic controls, screen-reader labels, decorative aria-hidden SVG, result announcements, visible focus, 44px targets, mobile no-overflow, list fallback and reduced-motion behavior are checked in browser tests. Physical devices, Safari/Firefox and an independent screen-reader audit remain untested. This is a JavaScript HTML fallback, not a separate server-rendered application. Initial dataset-fetch behavior remains the host's existing behavior. No unresolved dependency finding remains in the current audit.
