# Session Handoff

## Current Objective

- Goal: Complete Batch 37 semantic data-quality anomaly guard on `postdemo/37-data-quality-anomaly-guard`.
- Baseline: `main@93c6ef4707e181177325efd156c2f65ba20ccdf6`.
- Scope: release-safety tooling/evidence only. No source refresh, converter/domain changes, product/UX work, dependency migration, visual-baseline changes, or performance-budget changes.

## Implemented Contract

Pages retains the authoritative serialized release boundary:

`schema capture → release capture → fetch → schema check → release data-change comparison → data-quality anomaly guard → conversion`

Batch 38 then snapshots the exact converted workspace once and fans out:

- release build / typecheck / unit tests / performance budget;
- desktop Playwright;
- mobile Playwright.

Deployment waits for all three downstream jobs.

### Batch 37 hard blockers

- previously countable dataset disappears;
- previously countable stable source file becomes unreadable for row-count validation;
- previously countable dataset has no current countable source file;
- previously populated dataset becomes empty.

### Batch 37 warnings

- current rows <= 50% of reviewed baseline;
- current rows >= 200% of reviewed baseline;
- proportional warnings apply only for baselines with >= 20 rows.

Warnings do not block release.

Dataset-specific ID uniqueness, required-field, null-rate, coordinate, and domain-value rules are intentionally not generalized without explicit source contracts.

## Files / Commands

- Guard: `scripts/dataQualityAnomalyGuard.ts`
- Tests: `src/lib/dataQualityAnomalyGuard.test.ts`
- Command: `npm run data:quality:check`
- Report: `public/data/data-quality-anomaly-report.json`
- Design note: `docs/data-quality-anomaly-guard-2026-09-23.md`

## Verification Evidence

| Check | Result | Notes |
| --- | --- | --- |
| Batch 38 | Complete | merged `main@cb191332`; final PR CI run 35801220101 green; Pages run 35801721501 green |
| Batch 39 | Complete | merged `main@93c6ef47`; Pages run 35803359072 green |
| Batch 37 focused design/tests | Implemented | stable/empty/unreadable/missing/collapse/spike/small/rolling cases covered |
| Local clone verification | Unavailable | execution container could not resolve github.com |
| Batch 37 implementation Frontend CI | Passed | PR #54 run 35804423617 on `6eacd662`: 173/173 unit; build/budget green; desktop 76/76; mobile 77/77 |
| Batch 37 merged Pages | Pending | must execute live fetch + anomaly gate + conversion + Batch 38 fan-out |
| Production URL | Deployed baseline | https://leo0331.github.io/taipei-civic-groups-map/ |

## Next Actions

1. Require the final documentation/evidence head of PR #54 to repeat optimized Frontend CI successfully.
2. Merge only that exact green head.
3. Verify the merged Pages run succeeds through `data:quality:check`.
4. Confirm `data-quality-anomaly-report.json` is included in release evidence.
5. Only then mark Batch 37 done and proceed to Batch 35 (Source-date Metadata D).

## Preserved Contracts

- Node 22 runtime and Node-22 type line.
- exact `@playwright/test@1.62.1` and `mcr.microsoft.com/playwright:v1.62.1-noble`.
- 12 canonical visual baselines and `maxDiffPixelRatio: 0.0005`.
- 450 kB raw / 130 kB independent-gzip production-entry budget.
- Batch 29 schema guard.
- Batch 30 release data-change evidence.
- Batch 38 one-snapshot Pages fan-out.
- conservative Data Trust/source-date semantics.
