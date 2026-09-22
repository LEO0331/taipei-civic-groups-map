# Post-demo Cycle 3 verification — 2026-09-22

Cycle 3 closes the scope of Batch 29 (source-schema drift guard), Batch 30 (release data-change summary), Batch 31 (source-date metadata C), Batch 32 (bounded authoritative freshness audit), and Batch 33 (verification/freeze). Batch 33 adds no product feature, data refresh, converter change, UI change, dependency update, or visual-baseline change.

## Baseline and release gate

- Checked-in implementation baseline before Batch 33: `main@b70c2b239747fe439c8babc3193cc9e19d7b819e` (Batch 32 audit PR #49 plus Data Trust fixture correction PR #50).
- Batch 33 branch: `postdemo/33-cycle-3-verification`.
- Batch 33 freeze commit, PR, final Frontend CI run, merged `main` SHA, final Pages run, and release-evidence artifact: **pending**. These must be filled from the exact verified head and merged release; no result is inferred from local checks.
- At branch creation, no implementation PR remained open. The latest Pages run for `main@b70c2b2` was `35700502040` and was **in progress**. The earlier Pages runs for Batch 31 (`35698444114`) and original Batch 32 (`35699398209`) failed because an unknown-date E2E fixture still used adult influenza after Batch 31 gave it an authoritative date. PR #50 replaced that fixture with the still-undated alternative-service statistics route; focused desktop/mobile verification passed 2/2. The corrected full release must still establish final success.

The verified Cycle 2 application baseline (`main@99f47579`, Pages run `35679835524`) remains a historical reference, not a substitute for the final Cycle 3 release.

## Contract A — source-schema drift boundary

The Pages build job runs `data:schema:capture` before `data:fetch`, then `data:schema:check` before `data:convert`. `scripts/sourceSchemaGuard.ts` captures ordered headers for every reviewed CSV path plus distinct header signatures per raw-data directory. The check requires exact headers for a stable filename; a rolling/new filename in an already reviewed directory may use a reviewed signature. A missing CSV directory, new unreviewed CSV directory, or unexpected ordered header signature produces a failed report and blocks conversion. A failure artifact retains `public/data/source-schema-report.json` when present.

PR Frontend CI does not invoke `data:fetch`. This guard checks structure, not field meaning or data quality, and it is not weakened for the freeze.

## Contract B — release data-change evidence

Pages runs `data:release:capture` before fetch and `data:release:changes` after the schema check, before conversion. `scripts/buildDataChangeSummary.ts` records SHA-256, bytes, and conservatively countable rows for raw source files; its comparison separates unchanged content, changed/added/removed files, dataset-level changes, row-count deltas, and explicit source-timestamp changes. Only `csvUpdateDate`, `sourceFileUpdatedAt`, and `sourceUpdatedAt` qualify as source timestamps. The oldest included timestamp is the effective multi-resource timestamp. Fetch-execution fields such as `downloadedAt` and `fetchedAt` are excluded.

A content difference is observational, not an automatic freshness or quality verdict. The Pages `data-release-evidence` upload includes `data-change-summary.json` and `source-schema-report.json` alongside the Data Trust manifest, release summary, and conversion report. The last **completed successful** Cycle 3 Pages release with this machinery is Batch 30 run `35694991663` (`main@da663ad1`): its scanner reported 145 raw-data directories, 12 content-changed and 133 unchanged, with zero source-timestamp changes. Artifact `10680600788` has SHA-256 `7a15cb469be07062504f07af2dfd89f4b95e89d89071fba728f75e904884c82e`. Those are historical run results, not predictions for the pending final release.

## Contract C — source-date metadata and Data Trust

Batch 31 used official Taipei downloadable-resource **更新時間** for ten sources after Batch 30 showed their fetched raw bytes matched the committed snapshots. The public dataset metadata and matching raw fetch provenance carry the explicit `sourceFileUpdatedAt`; absent evidence leaves the date unknown. Multi-resource datasets retain the conservative oldest-included-resource rule. A download execution timestamp is not promoted to source freshness.

The checked-in Cycle 3 evidence at `main@b70c2b2` is:

| Data Trust measure | Count |
| --- | ---: |
| Static dataset directories | 117 |
| Readable source dates | 63 |
| Unknown source dates | 54 |
| Reused-snapshot fallbacks | 0 |

These values come from `public/data/data-release-summary.json` and the matching manifest. The final Pages artifact must be compared with them; an authorized live fetch can change release data, so this document does not predeclare its outcome.

## Contract D — Batch 32 authoritative freshness audit

[Batch 32's source-by-source note](data-freshness-audit-b-2026-09-22.md) records ten previously unchecked June 11, 2025 Taipei Department of Health medical-institution directories: dermatology, ENT, family medicine, general Chinese medicine, general dentistry, general Western medicine, internal medicine, OB-GYN, pediatrics, and plastic surgery. For **10/10**, the official matching downloadable CSV resource timestamp equaled the local source date. **Zero** had a newer authoritative resource, **zero** were refreshed, and **zero** comparisons in the selected tranche remained unresolved. The unselected funeral-service, Hakka, and fixed-site childcare entries remain outside that tranche.

The deterministic checked-in `2026-09-22` audit remains:

| Review band | Count |
| --- | ---: |
| `recent` (≤180 days) | 23 |
| `review` (181–365 days) | 13 |
| `priority_review` (>365 days) | 27 |

The bands are **review priorities only**. They do not establish that any public record is factually current or stale. Batch 32 did not change Data Trust or the audit counts.

## Verified workflow order

The current Pages workflow runs: `npm ci` → schema capture → release-data capture → fresh upstream fetch → schema check → release data-change comparison → conversion → typecheck → unit tests → full desktop/mobile Playwright with visual regression → production build (which generates Data Trust/release-summary evidence in `prebuild`) → performance budget → release-evidence upload → Pages artifact upload → deployment. The generated Data Trust manifest is built at production-build time, **after** the tests, not as a separate step immediately after conversion. This is the actual workflow order.

## Runtime, visual, and performance contract

- Node runtime: 22; `@types/node` stays on the Node 22 line.
- `@playwright/test`: exact `1.62.1`; both workflows use `mcr.microsoft.com/playwright:v1.62.1-noble`.
- Visual regression: six UI families × desktop/mobile = **12** committed PNGs; `maxDiffPixelRatio: 0.0005`; no snapshot updates in Batch 33.
- Frontend CI triggers automatically on `pull_request`, with optional `workflow_dispatch`; ordinary feature-branch pushes do not duplicate it.
- Blocking production-entry budget: **450.00 kB raw / 130.00 kB independent gzip**. The deferred shared map chunk is measured but not independently blocking.
- Exact Batch 33 local entry measurement: **399.63 kB raw / 115.86 kB independent gzip**, within **450 / 130 kB**; Vite reports **116.04 kB gzip**. The deferred shared map runtime remains **154.20 / 45.05 kB** and observation-only. The final Pages build must independently confirm its own numbers.

## Verification matrix

| Check | Batch 33 result |
| --- | --- |
| `npm ci`, typecheck, unit tests, build, performance budget | Passed locally in pinned Noble container; **165 unit tests**, 399.63 / 115.86 kB entry |
| Deterministic `2026-09-22` freshness audit reproduction | Passed; 63 dated / 54 unknown, 23 / 13 / 27 bands; regenerated JSON content-identical |
| JSON/state validation, raw-data/snapshot/dependency diff audit, `git diff --check` | Passed before PR; only documentation/state files changed |
| Full desktop/mobile Playwright and twelve visual comparisons | Pending exact PR-head CI |
| Fresh release schema capture/check, data-change summary, conversion, Data Trust generation | Pending merged Pages run |
| Release evidence artifact and Pages deployment | Pending merged Pages run |

## Remaining non-blockers and freeze posture

Fifty-four directories still have no authoritative readable source date. A source-date age band is not a factual availability/currentness claim; a static local snapshot is not a live service directory. The twelve visual snapshots are representative, not per-route coverage. Schema headers cannot prove field semantics, and content hashes cannot prove data quality. Major runtime/toolchain or Playwright-renderer upgrades remain separate migrations.

Batch 33 is a **freeze candidate**, not complete until its exact PR head passes the existing full Frontend CI and its merged Pages run succeeds with release evidence inspected. After that gate, Cycle 3 is complete. New work should start only for a concrete bug/regression, an authoritative source refresh, an explicitly approved product feature, a separately scoped migration, or another evidence-backed maintenance cycle. Do not start Cycle 4 in this branch.
