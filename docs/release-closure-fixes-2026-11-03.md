# Release-closure corrections — 2026-11-03

Base: `e392a5bebf4f3137374268e862792aed7f7376e0`. Delivery branch: `codex/fix-civic-release-closure`. This work is committed/pushed for review only; it does not merge or deploy a release.

## Verified defects and corrections

1. The retiring `public/sw.js` deleted every other cache on the shared GitHub Pages origin during activation. It now deletes only stale names beginning `taipei-civic-groups-`. Production startup also unregisters only the exact civic application scope, preserving foreign registrations and their caches.
2. Existing `hearingCenters` and `seniorServices` catalogue destinations requested absent local snapshots and returned HTTP 404. Their existing official fetchers/converters were omitted from aggregate release commands. Both commands are now integrated, raw sources and reproducible outputs are checked in, and the hearing converter uses the established fatal UTF-8 / Big5 fallback instead of corrupting CP950 names. Required official headers and nonempty readable output are checked; raw field strings remain in `sourceValues`.
3. Source licenses and adapted artwork attribution were absent from the served distribution. Prebuild now assembles the full exact installed production-package license files and the retained Civic Explorer MIT attribution into `public/THIRD_PARTY_NOTICES.txt`. The bilingual footer links to the copied build artifact. This includes the full upstream Hippocratic 2.1 texts and does not certify suitability or compliance for a particular use.

No new catalogue destination, geocoding, service-availability inference, analytical method, policy recommendation, dependency, runtime pin, screenshot baseline, pixel tolerance or performance ceiling is introduced.

## Reviewed source admission

Only these original official resource endpoints were fetched:

| Existing destination | Official resource | Raw bytes / records | Decoding | Raw SHA-256 |
| --- | --- | --- | --- | --- |
| Hearing centers | `https://data.taipei/api/frontstage/tpeod/dataset/resource.download?rid=05d2c646-b36c-4fd0-9613-8a870147309f` | 285 / 4 | CP950 / Big5-compatible | `953c755ce1f94890e1c496678373caf936fe417a840875b4c6792fc3985035aa` |
| Senior services | `https://data.taipei/api/frontstage/tpeod/dataset/resource.download?rid=f432adf0-0e92-473f-a81e-5d5e8ef75965` | 62,220 / 355 | UTF-8 | `1b8895c210f48952da50fca195e16ecf6db93adc800e2c1efb9d2f2739bbc676` |

Raw paths are `data/raw/hearing-centers/` and `data/raw/senior-services/`; generated counterparts are `public/data/hearing-centers/` and `public/data/senior-services/`. `.gitattributes` preserves the acquisition bytes across checkout. Fetch metadata records the actual download time and content hash, separately from the unknown source-file update date.

The schema and raw-content baselines were captured before the focused fetch. The first schema check correctly blocked exactly the two previously absent raw datasets. Both official header contracts, decoded fields, 4/355 source-row counts, unchanged original source strings and reproducible converters were then reviewed and tested before explicitly admitting those two contracts into the local verification baseline. The subsequent schema check passed 205 CSV files across 146 raw directories; release-data and semantic-quality guards passed. The initial blocker and reviewed admission evidence are retained in the external audit directory; schema guards are unchanged and have no bypass.

All original 117 Data Trust entries retain their exact values. Restoring two previously missing directory snapshots yields 119 total / 68 dated / 51 unknown / 0 fallback. Their authoritative update timestamps have not been established, so the provenance registry explicitly records `needs_manual_review`. No download timestamp is promoted to source freshness. The deterministic age audit keeps its existing explicit 2026-09-22 reference date and age bands; only total/unknown membership counts change. Policy #10's separate snapshot and the original data/model boundaries remain intact.

## Verification

- Typecheck and 218 unit tests pass, including original worker-code execution, scope/cache ownership, Big5/source-field preservation, nonempty header guards, reproducible directory snapshots and exact notice texts.
- Production build and unchanged entry budget pass: 402.04 kB raw / 116.72 kB gzip against 450/130 kB.
- Focused desktop/mobile Playwright: 4 passed. An actual installed legacy worker activates, removes only its stale cache, unregisters itself, and preserves foreign application caches/registration. Both restored directories render readable cards, filtering works, and the discoverable notice artifact responds successfully.
- A separate production-build browser regression passes: startup begins with civic and foreign workers/caches, removes only the civic worker/cache, preserves the foreign scope and both foreign caches, and serves the full notice artifact with HTTP 200.
- Offline Policy #10 source audit and snapshot verification pass. Dependency audit reports zero vulnerabilities. Schema, release-content, semantic-quality and provenance review checks pass.
- Full documented desktop/mobile Playwright: 192 tests executed, 179 passed / 1 expected skip / 12 missing Windows canonical screenshot baselines. All behavioral tests passed, including the native 390px Explorer focus/overflow checks; no mobile-focus code change was warranted. Canonical Linux pixel comparison for this correction commit remains unverified. No screenshot baseline or threshold was changed to hide the platform limitation.

The original developer checkout's modified `feature_list.json`, modified `progress.md` and untracked `docs/pages-oidc-recovery-2026-10-02.md` remain untouched; this work uses a dedicated clean worktree. Task-generated screenshots and transient schema/change reports are excluded from the commit. No unrelated public dataset is refreshed.
