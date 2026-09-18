# Session Handoff

## Current Objective

- Goal: Hold the repository at the verified pre-demo baseline unless a narrowly scoped demo-blocking bug is found.
- Status: A–H remediation/polish is merged to `main`; pre-demo verification passed and the verified production commit is deployed.
- Verified commit: `9031db0c3b75eeae7d0bb756b0bd9aee78bf3cb5`
- Release record: `docs/pre-demo-verification-2026-09-18.md`

## Verification Evidence

| Check | Result | Notes |
| --- | --- | --- |
| Data fetch | Passed | `npm run data:fetch` in Pages workflow |
| Data conversion | Passed | `npm run data:convert` in Pages workflow |
| Typecheck | Passed | exact verified main commit |
| Unit tests | Passed | exact verified main commit |
| Playwright | Passed | 91 passed, 1 expected desktop-only skip, 0 failed across desktop/mobile |
| Production build | Passed | Vite build succeeded |
| Data release evidence | Passed | 117 directories; 32 dated; 85 unknown-date; 0 reused-snapshot fallbacks |
| GitHub Pages deployment | Passed | workflow run `35298325891` |
| Production URL | Deployed | https://leo0331.github.io/taipei-civic-groups-map/ |

## Current Architecture / UX Baseline

- Dataset and language state are shareable through the URL; Back/Forward, reload, and onboarding persistence are covered by E2E tests.
- Tab-like navigation has a shared accessible contract with keyboard Arrow/Home/End behavior.
- Dataset modules are route-level lazy-loaded and unrelated directory data is deferred.
- Data Trust uses compact normal/caution treatment while stale data and reused snapshots remain prominent.
- Generated-directory geography is dimension-aware: district, city/county, or no distribution tab when no usable location field exists.
- All 156 catalogue routes/views resolve to one of six UI families:
  - `healthcare-standard`
  - `healthcare-rich-directory`
  - `location-directory`
  - `registry-directory`
  - `records-analysis`
  - `statistics-analysis`
- Representative legacy modules have been migrated to shared family primitives; remaining family migration is post-demo work.

## Known Non-blocking Items

- Main production JavaScript chunk is approximately 549.5 kB minified / 161.4 kB gzip; Vite still emits the >500 kB advisory.
- Source-date metadata remains incomplete: 85 of 117 Data Trust directories have no readable source date.
- GitHub Actions emits deprecation/runtime notices for older action internals.
- Full legacy-shell migration is intentionally deferred until after the demo.

## Next Session Startup

1. Read `AGENTS.md`, `feature_list.json`, `progress.md`, and `docs/pre-demo-verification-2026-09-18.md`.
2. Check `git status --short` for unrelated user changes.
3. During the pre-demo freeze, only fix reproducible demo-blocking issues.
4. After the demo, migrate remaining legacy shells in this order: registry-directory → records-analysis → statistics-analysis → location-directory → healthcare exceptions.
5. Keep dataset parsing, calculations, filters, charts, and tables unchanged unless the task specifically requires domain-logic changes.
6. Run focused tests first, then typecheck, unit tests, Playwright for UI-facing changes, production build, and `git diff --check`.
