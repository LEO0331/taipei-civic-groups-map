# Taipei Civic Groups Map / 台北人民團體地圖

Mobile-first bilingual explorer for Taipei civic group records and industry development grant recipient records.

## Purpose

The app presents two separate Taipei Open Data modules:

- [臺北市人民團體名冊](https://data.taipei/dataset/detail?id=72417af0-7dec-4fad-b762-5f2baafcf084): civic group directory, district distribution, founding years, and inferred categories.
- [臺北市產業發展獎勵補助計畫獲獎勵補助廠商基本資料](https://data.taipei/dataset/detail?id=3e78bffa-3fa3-46d5-a632-df99447de695): industry grant recipient companies, approved subsidy amounts, project budgets, grant fields, and industry categories.

Traditional Chinese is the default language; English is available in the header.

## Additional module: Industry Grant Recipients / 產業補助廠商

Grant recipients are not civic groups and remain a separate directory. The source CSV uses CP950/Big5-compatible encoding. Conversion handles ROC dates, NTD currency fields, district normalization, subsidy shares, and summary aggregation. The responsible-person field remains in generated source data but is not shown in default company cards.

Neither dataset supplies organization coordinates. Maps use Taipei’s 12 district centroids and display aggregate bubbles only, not exact locations.

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
- `public/data/industry-grant-recipients.json`
- `public/data/industry-grant-summary.json`

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

Industry grant data can be replaced independently:

```bash
npm run data:fetch:industry-grants -- --force --local=/absolute/path/to/grants.csv
npm run data:convert:industry-grants
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

This site presents public records for exploration and district comparison. Civic groups and subsidized companies are different record types. Industry grant data is not investment advice, company evaluation, policy-effectiveness assessment, or official endorsement. Addresses, phone numbers, organization status, subsidy records, and amounts should be verified with official sources. District bubbles are aggregates, not exact locations.
