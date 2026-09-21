# Post-demo visual regression baseline — 2026-09-21

## Purpose

Batch 16 adds a focused visual regression complement to the existing semantic and accessibility E2E suites. It protects representative workspace hierarchy and responsive layout without changing application behavior, public data, parsing, filters, charts, tables, or source semantics.

## Canonical matrix

The snapshots live in `tests/e2e/visual-regression.spec.ts-snapshots/` and use Playwright's normal project/platform naming. The committed matrix has 12 images: each representative below in both the existing `desktop` and `mobile` projects.

| UI family | Dataset | Stable state |
| --- | --- | --- |
| `healthcare-standard` | `hospicePalliativeCareInstitutions` | Generated-directory overview |
| `healthcare-rich-directory` | `adultInfluenzaVaccineProviders` | Adult influenza find view |
| `location-directory` | `physicalTherapyClinics` | Physical-therapy find view with local source-record cards |
| `registry-directory` | `laborUnions` | Overview |
| `records-analysis` | `laborViolations` | Overview |
| `statistics-analysis` | `alternativeServiceReserveStatistics` | Overview |

The physical-therapy representative deliberately stays on its default find view. It contains no live Leaflet tiles and avoids using a horizontally scrollable table as the mobile canonical composition.

## Determinism policy

Every visual test directly navigates with `dataset` and `lang=zh`, asserts the `main` dataset/family markers and exact representative heading, waits for font readiness and any lazy family root, checks that no module loading placeholder remains, and resets scroll before capture.

The test disables animations, transitions, smooth scrolling, and caret rendering only in the test page. It also gives each capture a 6000-pixel-tall viewport, so Playwright can capture the representative workspace without scrolling a sticky filter bar through the image. Widths retain the existing desktop/mobile project values; production styling is unchanged. It uses `maxDiffPixelRatio: 0.0005` (0.05%) across all twelve snapshots: enough for very small Linux Chromium rasterization noise without allowing meaningful hierarchy or responsive-layout changes. There are no masks.

## Baseline environment and verification

Snapshots were generated and visually inspected in the official `mcr.microsoft.com/playwright:v1.62.1-noble` Linux image with `CI=1`, matching GitHub Actions' Chromium selection. The focused commands were:

```bash
CI=1 npx playwright test tests/e2e/visual-regression.spec.ts --update-snapshots
CI=1 npx playwright test tests/e2e/visual-regression.spec.ts
```

The clean second comparison passed: **12 passed**. No snapshot captures loading/error states, the catalogue/onboarding overlay, or third-party map imagery. All images show the intended Traditional Chinese representative content, including family headings, tabs, filters, summaries, and substantive cards or charts.

## Limitations

The baseline is intentionally a representative-family guard, not a screenshot for every dataset route or every tab. Full application E2E, accessibility, and structural cross-family tests remain the broader behavioral coverage.
