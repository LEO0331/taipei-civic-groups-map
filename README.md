# Taipei Public Data Explorer

[English](README.md) · [繁體中文](README.zh-TW.md)

A bilingual Vite + React dashboard for browsing selected Taipei public-record datasets. It helps people find source-recorded directories, inspect their scope and freshness, and compare descriptive summaries without implying that public records are rankings, recommendations, or real-time service information.

## What it provides

- A searchable, topic-based data catalogue for 107 directories.
- Bilingual Traditional Chinese and English interface text.
- Dataset-specific filtering, source-field detail, CSV export, and external address lookup where the source supports them.
- Build-time data-trust evidence: readable source dates, clearly marked unknown dates, and a local-data/privacy reminder.
- Static deployment to GitHub Pages.

## Data catalogue

Directories are grouped by public-service topic: health and medical care; social welfare, family and care; work, industry and business; education, culture and travel; city services and environment; animals and pets; and exploration and comparison.

Catalogue metadata lives in [`src/lib/datasetCatalogue.ts`](src/lib/datasetCatalogue.ts). When adding a dataset, give it one deliberate category and useful search terms; an uncategorized dataset is rejected rather than silently hidden from the catalogue.

### Private cultural heritage subsidies

`private_cultural_heritage_subsidies` is a local snapshot of Taipei’s private cultural-heritage subsidy records. It preserves the five source columns, adds conservative ROC/Gregorian year and amount parsing, and labels project-text categories and exact name-and-area registry comparisons as derived—not official—information. Refresh it with `npm run data:fetch:private-cultural-heritage-subsidies` followed by `npm run data:convert:private-cultural-heritage-subsidies`.

### Travel medicine clinics

`travel_medicine_clinics` is a local snapshot of the Taipei Department of Health travel-medicine outpatient hospital directory. It preserves the official contact, address, department, and self-paid mpox-service fields. “Listed as available” means only that the source explicitly marks the record; it is not real-time stock, appointment, eligibility, or price information. Refresh it with `npm run data:fetch:travel-medicine-clinics` followed by `npm run data:convert:travel-medicine-clinics`.

### Taipei Hakka organizations

`hakka_organizations` is a local snapshot of the 109 ROC year (2020) Taipei Hakka Organizations Registry. It preserves every actual CSV column while presenting only its source-recorded registry fields. A later file update does not make organization or leader information current. Refresh it with `npm run data:fetch:hakka-organizations` followed by `npm run data:convert:hakka-organizations`.

### Hospital discharge-to-LTC partners

`hospital_discharge_long_term_care_partners` is a local snapshot of Taipei hospitals listed for discharge preparation linked with long-term-care services. Its location field is an address, so the directory offers external map lookup only—no geocoding or markers. Listing does not establish immediate services, capacity, eligibility, fees, or suitability. Refresh it with `npm run data:fetch:hospital-discharge-long-term-care-partners` followed by `npm run data:convert:hospital-discharge-long-term-care-partners`.

### Funeral service businesses

`funeral_service_businesses` is a local snapshot of Taipei's filed-and-approved funeral-service-business registry. It preserves all five official fields, keeps the responsible-person field inside expandable source detail, and offers external address lookup without geocoding or map markers. A listing is an administrative registry record only—not evidence of current operation, services, pricing, quality, eligibility, or a recommendation. Refresh it with `npm run data:fetch:funeral-service-businesses` followed by `npm run data:convert:funeral-service-businesses`.

### Fixed-site temporary childcare

`fixed_site_temporary_childcare` is a local snapshot of Taipei's fixed-site temporary-childcare directory. It preserves the five official fields, offers source-preserving location/contact filters and external address lookup only, and never represents real-time reservations, vacancies, opening hours, age limits, fees, eligibility, safety, or service quality. Refresh it with `npm run data:fetch:fixed-site-temporary-childcare` followed by `npm run data:convert:fixed-site-temporary-childcare`.

### Government ethics office contacts

`government_ethics_offices` is a local snapshot of Taipei City Government ethics-office contacts. It preserves the official agency, area-code, and telephone fields, and provides no map because the source has no address or coordinates. It does not establish case jurisdiction, case acceptance, real-time phone staffing, legal advice, or wrongdoing by an agency or person. Refresh it with `npm run data:fetch:government-ethics-offices` followed by `npm run data:convert:government-ethics-offices`.

### Internal medicine institutions

`internal_medicine_institutions` is a local snapshot of Taipei’s internal-medicine institution directory. It retains the five official fields, derives districts only from explicit address text or a conservative Taipei postal-code map, and exposes source/update metadata and quality flags. It is not real-time clinic, physician, appointment, or subspecialty availability information. Refresh it with `npm run data:fetch:internal-medicine-institutions` followed by `npm run data:convert:internal-medicine-institutions`.

### Withdrawn illegal-hotel enforcement records

`withdrawn_illegal_hotel_enforcement_records` is a local historical snapshot of withdrawn or revoked administrative enforcement records. It is not a current illegal-hotel list: names, addresses, dates, and source-recorded amounts must not be read as current illegality or continuing liability. Refresh it with `npm run data:fetch:withdrawn-illegal-hotel-enforcement-records` followed by `npm run data:convert:withdrawn-illegal-hotel-enforcement-records`.

### Recent public-service directories

Recent additions include program-specific health providers (senior pneumococcal, under-3 influenza, GBS screening, high-myopia prevention, kidney health, addiction treatment, and internet-addiction services), social-welfare directories (emergency assistance, disability day services, child/youth welfare, early intervention, and senior services), civic transparency records (public-asset operations, Labor Pension Act enforcement, and healthcare/welfare budgets), and registered environmental-pesticide vendors. Each remains a local source snapshot with its own focused `data:fetch:<dataset>` and `data:convert:<dataset>` commands. They are directories or historical public records—not real-time availability, eligibility, quality, ranking, enforcement-currentness, or recommendation services.

## Quick start

Requirements: Node.js 22 and npm.

```bash
npm ci
npm run dev
```

Open the local URL printed by Vite.

## Common commands

```bash
# Check types, tests, and a production bundle
npm run typecheck
npm test
npm run build

# Run only the interface accessibility contracts
npm run test:accessibility

# Refresh all remote sources, then convert them
npm run data:fetch
npm run data:convert
```

`npm run data:fetch` is a bulk remote refresh. Do not run it as routine local verification: it can change many public-data files at once. Prefer a focused `data:fetch:<dataset>` and matching `data:convert:<dataset>` command when working on one directory.

The build runs `scripts/buildDataTrustManifest.ts`, which writes `public/data/data-trust-manifest.json` and `public/data/data-release-summary.json`.

## Adding a dataset

1. Add a focused fetch/conversion script and source metadata.
2. Create the directory module using the existing source-preserving patterns.
3. Register its visible label and module in the application.
4. Assign it exactly one category in `datasetCatalogue.ts` and add user-facing search keywords if the official name is hard to discover.
5. Add or update conversion and UI tests.
6. Run the verification suite below.

Avoid inferring current availability, eligibility, quality, safety, compliance, prices, or recommendations unless the public source directly establishes that claim.

## Verification

Before opening a pull request or deploying, run:

```bash
npm run typecheck
npm test
npm run build
git diff --check
```

The GitHub Pages workflow repeats conversion, type checking, tests, and build. It retains the trust manifest, release summary, and conversion report as deployment evidence.

## Project layout

```text
src/                 React modules, catalogue metadata, and shared utilities
scripts/             source fetchers, converters, and build-time reports
public/data/         generated local static datasets
.github/workflows/   GitHub Pages deployment workflow
doc/                 product and design-decision documentation
```

## Deployment

Push to `main` to deploy through [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml). The production site is served from GitHub Pages at <https://leo0331.github.io/taipei-civic-groups-map/>.

## Important limits

This is an exploration tool for public records, not an authoritative real-time service directory. Source dates may be absent or old; unknown dates are intentionally disclosed. Addresses are used only for optional external-map lookup where available. Searches and filters remain in the browser, but opening an external map shares the selected address with that map provider. The app intentionally uses network-first deployment: legacy Service Worker caches are removed to prevent GitHub Pages from pairing stale HTML with replaced, content-hashed bundles.

Read the product recommendations and ongoing risks in [臺北公共資料儀表板－設計決策與演進方向](doc/臺北公共資料儀表板－設計決策與演進方向.md).
