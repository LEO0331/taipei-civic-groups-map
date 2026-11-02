# Session handoff — release audit follow-up

Updated 2026-11-03 (Asia/Taipei).

PR [#68](https://github.com/LEO0331/taipei-civic-groups-map/pull/68) merged on 2026-10-31; its merge commit is `f4a784a69a55fc5395fb1995eb4af839eb119af5`. It is no longer an open Draft PR. The audit follow-up [PR #69](https://github.com/LEO0331/taipei-civic-groups-map/pull/69) also merged externally on 2026-11-02 as `1fd336ec9281bf58820d00cb7f15a42805ab2bf2`; the agent did not perform that merge. The current evidence-only closeout is `codex/audit-civic-canonical-closeout`, based on that refreshed main commit. Keep its new PR Draft; no merge or deployment is authorized by this handoff.

The 2026-11-02 local audit passed typecheck, 211 unit tests, production build, offline Policy 10 audit/snapshot verification, dependency audit (zero vulnerabilities), and the unchanged 450/130 kB budget: 401.79 kB raw / 116.63 kB gzip. Local Windows E2E passed 175 behavioral tests with one expected skip; all twelve pixel checks requested missing Windows baselines. The local renderer gap was subsequently closed by the canonical Linux run below.

The existing `Frontend CI` workflow already provides Node 22 / Playwright 1.62.1 Noble and the twelve committed Linux baselines. Audit follow-up [run 41396921714](https://github.com/LEO0331/taipei-civic-groups-map/actions/runs/41396921714) passed all four jobs for PR #69 head `5eb668befd3a21eec5846f5d647f9c52f7ee2d34`: 211 unit tests, 20 PDF extraction tests, desktop 93 passed / 1 expected skip, mobile 94 passed, including all twelve unchanged canonical screenshots. Logs verify Node 22.23.4 / Playwright 1.62.1 Noble and the unchanged 401.79/116.63 kB budget. The CI synthetic merge `1fbe448289bf98e005ee9829220ec0fb39c81361` has the same tree `5bdc93a0d9251b04586cd26f1c48a181826116c4` as the submitted PR head. Canonical validation is complete for that audit content. This closeout changes documentation only; its own final-head checks are linked from its Draft PR and the external audit report. Prior PR #68 head `65eee74f469119200b720c30a7ba8a3f5d2b4176` passed [run 41198097441](https://github.com/LEO0331/taipei-civic-groups-map/actions/runs/41198097441); that historical result is not substituted for this follow-up's checks.

This change repairs handoff accuracy only. All source records, policy snapshots, catalogue/navigation behavior, dependency locks, runtime pins, screenshot baselines and performance limits remain unchanged. The original developer checkout's uncommitted files are preserved separately; all follow-up work uses the isolated audit worktree.

Replay: `npm ci`; `npm run data:audit:senior-care-policy`; `npm run data:verify:senior-care-policy`; `npm run typecheck`; `npm test`; `npm run build`; `npm run performance:budget`; `npm audit --json`; `git diff --check`. Run `npm run test:e2e` in the pinned Linux CI container for canonical pixels. Do not refresh upstream sources or replace visual baselines during routine verification.

## Historical handoff retained verbatim

The following describes the pre-merge delivery state and is retained for history, not current instructions.
# Session handoff — Civic Explorer

Updated 2026-10-31. Existing Draft PR: https://github.com/LEO0331/taipei-civic-groups-map/pull/68.

Delivery branch: `codex/civic-explorer`, isolated checkout `C:/Users/LeoLi/.codex/worktrees/civic-explorer-4968/taipei-civic-groups-map`, baseline `aff5a81`. One Draft PR, no automatic merge or deployment.

Implementation, catalogue integrity, URL/history preservation and local verification are recorded in [verification](docs/civic-explorer-verification-2026-10-29.md) and progress.md. All 157 current-main entries and their bilingual labels/order are preserved. No source/dependency/model changes. Main's separately merged Vite fix is incorporated; audit is now clean. Its Policy 10 destination and trust behavior are preserved.

Next concrete action: inspect the Draft PR's exact-head Linux Frontend CI (Node 22 / Playwright 1.62.1 Noble), including all 12 canonical screenshots; the current outcome is maintained in the PR description. Review screenshots and seven-hub behavior manually. Keep PR Draft and do not merge unless the human separately requests it. Do not run bulk data refresh or overwrite visual baselines to resolve renderer differences.

Local replay: npm ci; npm run typecheck; npm test; npm run build; npm run performance:budget; CI=1 npm run test:e2e (PowerShell: set $env:CI='1'); node scripts/checkCivicExplorerLoading.mjs; npm audit --json; git diff --check. Restore only task-generated build manifests before committing. No lint script exists.
