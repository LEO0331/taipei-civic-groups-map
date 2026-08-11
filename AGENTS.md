# Agent Guide

This is a Vite + React + TypeScript public-data directory. Keep data presentation factual: preserve source values, label derived fields clearly, and do not imply service availability, eligibility, quality, or rankings without source evidence.

## Startup Workflow

1. Read `README.md`, this file, `feature_list.json`, and `progress.md`.
2. Inspect `git status --short` and preserve unrelated user changes.
3. Select one active feature or maintenance task; update its state only when there is evidence.
4. Run the focused checks first, then the full verification set before claiming completion.

The repository must remain clean and restartable: the next agent should be able to read the state files, inspect the working tree, and run the documented checks without guessing the prior session's intent.

## Scope and Data Safety

- Work on one feature at a time unless tasks have explicitly separated file ownership.
- Reuse the existing module, conversion-script, and styling patterns before adding dependencies or abstractions.
- `npm run data:fetch` refreshes many public source files. Do not run it for routine verification; use a focused fetch or conversion command only when the task requires data refresh.
- Keep raw source values and public-data caveats intact. Never replace missing values with invented data.
- Do not overwrite or revert unrelated changes.

## Verification

Run these commands before completion:

```bash
npm run typecheck
npm test
npm run build
git diff --check
```

On POSIX shells, `./init.sh` runs the first three checks. On Windows PowerShell, run the commands above directly.

## Definition of Done

A task is complete only when the requested behavior is implemented, relevant verification has passed, evidence and remaining risks are recorded in `progress.md`, and `feature_list.json` reflects the current status.

## End of Session

Update `progress.md`, `feature_list.json`, and (for incomplete or handoff work) `session-handoff.md` with files changed, verification evidence, risks, and the next concrete action.
