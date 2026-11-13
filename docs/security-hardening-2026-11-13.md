# Security hardening — 2026-11-13

The maintenance branch is based on public main c817565. It addresses the three medium-priority findings from the 2026-11-13 audit.

- Pages and OIDC write permissions are scoped to the deployment job. The build, data refresh, and browser checks run with the workflow's read permissions.
- Directory and Senior Care CSV downloads share one cell serializer. Formula-like text receives a text prefix in the downloaded CSV. Existing CSV columns, filenames, and screen values are preserved. Plain negative numbers retain their numeric spelling. Spreadsheet editors can interpret or remove escape characters differently, especially after re-saving a CSV.
- The Pages batch refresh checks the HTTPS origin before every request, including redirects, and enforces a total request deadline and a streamed response size limit. Focused maintainer URL overrides require HTTPS and retain their starting origin. Existing snapshot fallback and source-quality gates still apply.

## Verification

- Node 22.23.5 typecheck, 226 unit tests, production build, performance budget (402.47 kB raw / 116.87 kB gzip), and npm audit (0 advisories) passed.
- Both new Playwright download checks passed. The full Windows run reported 180 passes, one expected skip, 12 missing Windows visual baselines, and one mobile Data Trust failure that passed when rerun alone. The canonical visual comparison remains a Linux CI check. Test-generated snapshots and build artifacts are excluded from the commit.
- All 53 networked batch scripts use the guarded downloader. Twelve sampled Taipei endpoints returned HTTP 200 without redirects. One guarded GET read the Clinical Pathology source in memory. The full bulk refresh and live Pages deployment were outside this verification.
