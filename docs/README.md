# Documentation index

## Current release baseline

- [Pre-demo verification — 2026-09-18](pre-demo-verification-2026-09-18.md) — exact production commit, release workflow evidence, desktop/mobile verification, Data Trust counts, known non-blockers, and final demo spot-check.
- [UI family classification and post-demo migration inventory](ui-family-classification.md) — all 156 catalogue routes/views grouped into the six UI families, with Batch H direct migrations marked and the post-demo migration contract.
- [Product/design decisions and evolution](../doc/臺北公共資料儀表板－設計決策與演進方向.md) — long-form design rationale, data-governance boundaries, historical review context, and the current September baseline.
- [Project progress](../progress.md) — chronological implementation evidence and current freeze/post-demo priorities.
- [Session handoff](../session-handoff.md) — restartable current state for the next maintenance session.

## Current verified state

As of 2026-09-18:

- production commit: `9031db0c3b75eeae7d0bb756b0bd9aee78bf3cb5`;
- GitHub Pages deployment workflow: `35298325891`, successful;
- Playwright: 91 passed, 1 expected skip, 0 failed;
- Data Trust: 117 static dataset directories; 32 with readable source dates; 85 with unknown dates; 0 reused-snapshot fallbacks;
- catalogue: 156 classified routes/views across six UI families;
- pre-demo posture: broad feature freeze; only narrow reproducible demo-blocking fixes before presentation.

After the demo, continue legacy-shell normalization family-by-family rather than redesigning working domain/data logic.
