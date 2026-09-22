# Agent Guide

This is a Vite + React + TypeScript public-data directory. Keep data presentation factual: preserve source values, label derived fields clearly, and do not imply service availability, eligibility, quality, or rankings without source evidence.

## Startup Workflow

1. Read `README.md`, this file, `feature_list.json`, `progress.md`, and the latest release/verification note under `docs/` (currently `docs/post-demo-cycle-2-verification-2026-09-22.md`).
2. Inspect `git status --short` and preserve unrelated user changes.
3. Select one active feature or maintenance task; update its state only when there is evidence.
4. Run focused checks first, then the full verification set before claiming completion. For UI/navigation/release work, include Playwright.

The repository must remain clean and restartable: the next agent should be able to read the state files, inspect the working tree, and run the documented checks without guessing the prior session's intent.

## Scope and Data Safety

- Work on one feature at a time unless tasks have explicitly separated file ownership.
- Reuse the existing module, conversion-script, and styling patterns before adding dependencies or abstractions.
- `npm run data:fetch` refreshes many public source files. Do not run it for routine verification; use a focused fetch or conversion command only when the task requires data refresh.
- Before an intentional fetch, capture the reviewed raw CSV contract with `npm run data:schema:capture` and the raw content baseline with `npm run data:release:capture`; after the fetch, run `npm run data:schema:check` and `npm run data:release:changes` before conversion. Pages enforces this automatically. Do not bypass a schema-drift failure without reviewing the upstream structure and matching converter/tests.
- For freshness triage, run `npm run data:audit:freshness -- --as-of=YYYY-MM-DD`. Age bands are review priorities only; confirm the authoritative upstream resource timestamp before refreshing any dataset.
- Keep raw source values and public-data caveats intact. Never replace missing values with invented data.
- Dependency maintenance is conservative: keep `@playwright/test` exactly aligned with the pinned Playwright container image, keep `@types/node` on the Node 22 runtime line, and treat major React/Vite/TypeScript/Playwright upgrades as separate migrations rather than routine bumps.
- Do not overwrite or revert unrelated changes.

## Verification

Run these commands before completion:

```bash
npm run typecheck
npm test
npm run build
npm run performance:budget
git diff --check
```

For UI, navigation, accessibility, or release-facing changes also run:

```bash
npm run test:e2e
```

On POSIX shells, `./init.sh` runs typecheck, unit tests, and build; run `npm run performance:budget` after the build when validating the production bundle. On Windows PowerShell, run the commands above directly. Frontend CI runs automatically on pull requests; use its manual `workflow_dispatch` only when a pre-PR branch verification is intentionally needed. The GitHub Pages release workflow additionally performs a fresh data fetch/conversion and desktop/mobile Playwright before deployment.

## Definition of Done

A task is complete only when the requested behavior is implemented, relevant verification has passed, evidence and remaining risks are recorded in `progress.md`, and `feature_list.json` reflects the current status. Release-level verification should also be recorded under `docs/`.

## End of Session

Update `progress.md`, `feature_list.json`, and (for incomplete or handoff work) `session-handoff.md` with files changed, verification evidence, risks, and the next concrete action. The current post-demo release baseline is documented in `docs/post-demo-cycle-2-verification-2026-09-22.md`.
