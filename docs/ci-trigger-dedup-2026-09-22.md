# Frontend CI trigger deduplication — 2026-09-22

Batch 24 removes duplicate full Frontend CI runs for open pull requests without changing the verification job itself.

## Previous trigger model

`.github/workflows/frontend-ci.yml` ran on:

- every pull request
- every push to a non-`main` branch

Once a feature branch had an open pull request, each new commit therefore produced two full runs for the same SHA: one `push` event and one `pull_request` event.

Batch 23 provides a concrete example. Final head `f44d67f0b3657083ab039768e5b1602ed4e42371` ran successfully twice:

- push run `35672234669`
- pull-request run `35672288880`

Both executed the same typecheck, unit, build, Playwright, and visual-regression gates.

## New trigger model

Frontend CI now runs on:

- `pull_request` automatically
- `workflow_dispatch` when an explicit pre-PR/manual verification is needed

It no longer runs automatically on feature-branch pushes.

The `main` branch remains protected by the separate GitHub Pages workflow, which already runs automatically on pushes to `main` and performs the stricter release path:

1. `npm ci`
2. fresh `npm run data:fetch`
3. `npm run data:convert`
4. typecheck
5. unit tests
6. full desktop/mobile Playwright including visual regression
7. production build
8. release-evidence upload
9. Pages artifact upload and deployment

## Verification job preserved

Batch 24 does not change:

- Playwright image: `mcr.microsoft.com/playwright:v1.62.1-noble`
- Node: 22
- npm cache setup
- `npm ci`
- `npm run typecheck`
- `npm test`
- `npm run build`
- `npm run test:e2e`
- Playwright failure-artifact upload
- visual-regression snapshots or threshold

Only workflow triggering changes.

## Expected behavior

For a normal feature branch:

1. create/edit branch — no automatic full Frontend CI
2. open PR — one automatic Frontend CI run
3. push another commit while PR is open — one new PR Frontend CI run; the previous run is cancelled by the existing concurrency policy
4. merge to `main` — the Pages release workflow performs the full release verification and deployment

If full verification is needed before opening a PR, run Frontend CI manually through `workflow_dispatch`.
