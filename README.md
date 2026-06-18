# Taipei Civic Groups Map / 台北人民團體地圖

Mobile-first bilingual directory and district map for exploring Taipei civic group public records.

## Purpose

The app presents the Taipei Open Data dataset [臺北市人民團體名冊](https://data.taipei/dataset/detail?id=72417af0-7dec-4fad-b762-5f2baafcf084) as a searchable directory, district-level aggregate map, and founding-year overview. Traditional Chinese is the default language; English is available in the header.

The source data has no coordinates. The map therefore uses the supplied centroids of Taipei’s 12 districts and displays aggregate bubbles only. It does not show exact organization locations.

## Data processing

Source fields:

| CSV | JSON |
| --- | --- |
| 機關代碼 | `agencyCode` |
| 名稱 | `name` |
| 地址 | `address` |
| 電話 | `phone` |
| 成立日期 | `foundedDateRaw` |

Districts are extracted by matching address text against Taipei’s 12 district names. ROC and Gregorian founding dates are normalized where possible. Categories are inferred from organization-name keywords; they are not official source categories.

Generated files:

- `public/data/civic-groups.json`
- `public/data/civic-group-summary.json`
- `public/data/conversion-report.json`

## Local development

Requires Node.js 22.

```bash
npm install
npm run data:fetch
npm run data:convert
npm test
npm run dev
```

The repository includes the uploaded raw CSV. To replace it:

```bash
npm run data:fetch -- --force --local=/absolute/path/to/file.csv
```

Or download a known official CSV resource:

```bash
npm run data:fetch -- --force --url=https://example.gov/resource.csv
```

Build and preview:

```bash
npm run build
npm run preview
```

## Deployment

Push `main` to deploy through `.github/workflows/deploy.yml`. Vite is configured for:

`https://LEO0331.github.io/taipei-civic-groups-map/`

## Disclaimer

This site presents public directory records. Addresses, phone numbers, and organization status should be verified with official sources and the organizations themselves. District bubbles are aggregates, not exact locations. Inferred categories are generated from name keywords and are not official categories supplied by the data source.
