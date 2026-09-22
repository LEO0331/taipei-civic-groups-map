# Demo briefing — 2026-09-22

## Demo freeze

Use `main@bcbf7e81629f5011026260f2ebc80e3201bf51d4` for this afternoon's demo. It is a documentation/freeze commit over the verified application-maintenance baseline `main@99f47579c5523d688900a7bb72b5c165238e168a` (PR #42).

The application baseline passed Frontend CI run `35679197317`:

| Check | Result |
| --- | --- |
| Unit tests | 154 passed |
| Production entry budget | 399.63 kB raw / 115.86 kB gzip, within 450 / 130 kB |
| Desktop/mobile Playwright | 153 passed / 1 expected skip / 0 failed |
| Six-family visual baseline | 12 Linux Chromium snapshots passed |

GitHub Pages run `35679835524` deployed the application baseline. The final freeze commit then passed the same release path and deployed successfully in Pages run `35681488171`.

## Current facts to present accurately

- The catalogue provides 156 classified routes/views across six UI families.
- Data Trust tracks 117 static local directories: 53 have a readable source date, 64 remain unknown, and no release fallback snapshot was used.
- The dashboard is built from local source snapshots, not a live service availability, eligibility, pricing, quality, or recommendation system.
- The production entry is below the enforced 450 kB raw / 130 kB gzip budget. The mapping runtime is deferred until a map surface is opened.

## Short smoke check before presenting

1. Open the catalogue and search for a known task term, then switch datasets.
2. Visit one representative from each UI family: hospice, adult influenza, physical therapy, labor unions, labor violations, and alternative-service statistics.
3. Switch Chinese/English, reload, and use Back/Forward once.
4. Confirm the Data Trust panel is visible and the page does not imply real-time service availability.

## Freeze posture

Do not refresh public data, regenerate visual snapshots, upgrade the renderer/toolchain, or start feature work before the demo unless a concrete blocker is demonstrated. The remaining known limitations are intentionally visible: unknown source dates, representative rather than exhaustive screenshot coverage, and local snapshots instead of real-time service data.
