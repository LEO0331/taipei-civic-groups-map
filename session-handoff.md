# Session Handoff

## Current objective

Deliver Policy #10 in exactly one PR from `codex/senior-community-care-policy-10` to `main`. Do not merge automatically.

- Worktree: `C:/Users/LeoLi/.codex/worktrees/senior-community-care-policy-10/taipei-civic-groups-map`.
- Verified base: `e3a96dfc50c90b3e772fb4e0d20f14ab0e3a697a`.
- Accepted analysis date: 2026-10-23; delivery work continued 2026-10-24.
- Sources A/B August 2026: 520 sites / 88 villages. C revised 2025-12-17, effective 2026-01-01.
- Source E/F and all original Data Trust/freshness/provenance data remain unchanged.

## Implemented and verified

See `docs/senior-care-policy-delivery.md` for actual findings, source/snapshot hashes, selected IDs, scenario overlap, local checks and known environment limits. `docs/senior-care-policy-results.json` and performance JSON retain machine-readable measurements. Public evidence is under `public/policy/senior-care-policy`; original PDFs are under `data/raw/senior-care-policy`, outside browser assets.

## Next concrete actions

1. Commit the bounded implementation in reviewable logical groups with Lore trailers.
2. Push the requested branch and open exactly one PR, target main.
3. Attach its URL to this chat and record it in delivery/progress.
4. Require exact-head Linux CI (including canonical screenshots and pinned Python tests), fix actionable failures, and update final evidence/state.
5. Leave the PR open for human review; do not deploy or merge.

## Reproduction

Run `npm ci`, focused policy fetch/audit/build/verify (default offline), `npm run typecheck`, `npm test`, `npm run build`, `npm run performance:budget`, `npm run test:e2e`, `git diff --check`. Python extraction uses `scripts/senior-care-policy-requirements.txt`; set `SENIOR_CARE_POLICY_PYTHON` if needed. `--refresh` only stages; changed editions need renewed independent admission.

Windows tests require installed Chrome or CI-mode pinned Chromium. Local complete suite passed 165 functional cases and expected one skip; twelve canonical Linux screenshot baselines cannot be compared as Windows baselines. Do not create or commit Windows replacements. The original 450/130 kB entry budget, Node 22 CI and Playwright 1.62.1 renderer remain unchanged. Default policy verification must not invoke global data:fetch.
