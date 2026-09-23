# Batch 38 — CI / Pages runtime optimization — 2026-09-23

## Objective

Reduce developer and release wall-clock waiting time without weakening verification.

Batch 38 changes workflow orchestration only. It does not change product behavior, public-data interpretation, dependencies, Playwright/browser versions, visual baselines, test coverage, performance budgets, or the authoritative Pages fresh-data boundary.

## Measured baseline

Three successful runs were measured before implementation.

Frontend CI:

| Run | Workflow wall-clock | Playwright |
| --- | ---: | ---: |
| 35701409634 | 9m26s | 8.0m |
| 35700490190 | 10m50s | 9.5m |
| 35694279668 | 9m05s | 7.6m |
| Median | **9m26s** | **~8m04s** |

Pages:

| Run | Workflow wall-clock | Playwright |
| --- | ---: | ---: |
| 35701648289 | 10m53s | 7.5m |
| 35700502040 | 13m38s | 9.3m |
| 35694991663 | 12m26s | 9.4m |
| Median | **12m26s** | **~9m16s** |

The npm cache hit on all sampled jobs and `npm ci` was only a few seconds. The dominant cost was Playwright.

## Stage 1 — Frontend CI

The former single serialized `verify` job is split into three independent jobs:

- `quality`: typecheck → unit tests → production build → performance budget;
- `e2e-desktop`: complete desktop Playwright project;
- `e2e-mobile`: complete mobile Playwright project.

All three retain Node 22 and `mcr.microsoft.com/playwright:v1.62.1-noble`.

Failure artifacts are separated by desktop/mobile job so concurrent failures cannot collide.

### Stage 1 measurement

PR #52 run `35800538287` passed at the first split head:

- workflow wall-clock: **5m50s**;
- quality: success;
- desktop: **76 passed in 3.7m**;
- mobile: **77 passed in 5.1m**;
- total executable E2E coverage remains 153 passes plus the existing expected skip across the suite.

Compared with the measured 9m26s median baseline, PR feedback wall-clock fell by about **38%**.

## Stage 2 — Pages

The source-data release boundary remains serialized and authoritative in `release-prepare`:

`npm ci`

→ schema capture

→ release-data capture

→ fresh upstream fetch

→ schema check

→ release data-change comparison

→ conversion

Only after conversion succeeds is the release workspace frozen.

The workflow packs the post-conversion repository workspace into one short-lived `release-workspace` artifact, excluding only:

- `.git`;
- `node_modules`;
- `dist`.

Downstream jobs restore that exact snapshot rather than independently fetching or converting data.

The snapshot fans out to:

- `release-build`: typecheck, unit tests, build, performance budget, release evidence, Pages artifact;
- `e2e-desktop`: complete desktop Playwright project;
- `e2e-mobile`: complete mobile Playwright project.

Deployment requires all three jobs to succeed.

This preserves one release-data observation point while allowing independent post-conversion verification to run concurrently.

## Preserved contracts

Batch 38 does not change:

- Node 22;
- exact `@playwright/test` 1.62.1;
- `mcr.microsoft.com/playwright:v1.62.1-noble`;
- full desktop coverage;
- full mobile coverage;
- 12 canonical visual baselines;
- `maxDiffPixelRatio: 0.0005`;
- 450 kB raw / 130 kB independent-gzip production-entry budget;
- Batch 29 source-schema guard;
- Batch 30 release data-change evidence;
- fresh Pages fetch and conversion;
- release evidence upload;
- Pages deployment gate.

`actions/download-artifact` is pinned to current explicit release `v8.0.1`; existing first-party action pins remain unchanged.

## Remaining release gate

The final PR #52 head must pass the split Frontend CI.

After merge, the first Pages run using the new structure must verify:

1. `release-prepare` succeeds;
2. the converted workspace artifact restores correctly in every downstream job;
3. desktop and mobile Playwright remain green;
4. release-build reproduces Data Trust/release evidence and the production budget;
5. the Pages artifact deploys successfully;
6. actual Pages wall-clock is recorded against the ~12m26s baseline.

Do not mark Batch 38 complete before that merged Pages evidence exists.
