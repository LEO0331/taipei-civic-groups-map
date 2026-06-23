# Taipei Civic Groups Map / 台北人民團體地圖

Mobile-first bilingual explorer for Taipei public records.

Public-record modules: civic groups, industry grants, and Taipei Metro procurement schedules / 公開資料模組：人民團體、產業補助與捷運採購時程

## Purpose

The app presents three separate Taipei Open Data modules:

- [臺北市人民團體名冊](https://data.taipei/dataset/detail?id=72417af0-7dec-4fad-b762-5f2baafcf084): civic group directory, district distribution, founding years, and inferred categories.
- [臺北市產業發展獎勵補助計畫獲獎勵補助廠商基本資料](https://data.taipei/dataset/detail?id=3e78bffa-3fa3-46d5-a632-df99447de695): industry grant recipient companies, approved subsidy amounts, project budgets, grant fields, and industry categories.
- [臺北捷運公司採購案件預定招標時程資訊](https://data.taipei/dataset/detail?id=f4fd7f03-9bf6-41de-a003-02c437596570): monthly Taipei Metro planned procurement tender schedule records, subject categories, derived tender methods, and case keywords.

Traditional Chinese is the default language; English is available in the header.

## Additional module: Industry Grant Recipients / 產業補助廠商

Grant recipients are not civic groups and remain a separate directory. The source CSV uses CP950/Big5-compatible encoding. Conversion handles ROC dates, NTD currency fields, district normalization, subsidy shares, and summary aggregation. The responsible-person field remains in generated source data but is not shown in default company cards.

The civic-group and grant datasets do not supply organization coordinates. Their maps use Taipei’s 12 district centroids and display aggregate bubbles only, not exact locations.

## Additional module: Metro Procurement Schedule / 捷運採購時程

The fetcher discovers and downloads all monthly CSV resources listed on the official dataset page. Conversion reads every matching file under `data/raw/metro-procurement-schedules/`, supports Big5/CP950 and UTF-8-SIG, and converts ROC year-month values such as `11506` to `2026-06`.

The source column named `預算金額` is preserved as `budgetAmountRaw`. Numeric values are parsed as NTD; recognizable text values are separately classified as derived tender methods. Subject category and case keyword classifications are derived and are not official source fields. The dataset has no coordinates or district field, so it is not displayed as map markers.

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
- `public/data/metro-procurement-schedules.json`
- `public/data/metro-procurement-summary.json`
- `public/data/public-records-summary.json`

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

Metro procurement data can be refreshed from every monthly resource on the official page:

```bash
npm run data:fetch:metro-procurement -- --force
npm run data:convert:metro-procurement
```

To add a local monthly file:

```bash
npm run data:fetch:metro-procurement -- --local=/absolute/path/to/monthly.csv
npm run data:convert:metro-procurement
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

This site presents public records for exploration and organization. The modules contain different record types and their counts are not directly comparable as measures of importance, effectiveness, procurement scale, or activity.

Taipei Metro procurement schedule data is a planned schedule only. Actual announcement timing, tender documents, eligibility requirements, procurement amounts, and latest status should be verified through the Government e-Procurement System and official authority notices.
