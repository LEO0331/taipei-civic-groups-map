# Taipei Civic Groups Map / 台北人民團體地圖

Mobile-first bilingual explorer for Taipei public records.

Public-record modules: civic groups, performing arts groups, registered labor unions, industry grants, Taipei Metro procurement schedules, registered cram schools, registered hotels, Taipei Travel accommodations, labor-law compliance publication records, Nangang Software Park companies, registered animal hospitals, and quasi-public infant care centers / 公開資料模組：人民團體、演藝團體、工會名單、產業補助、捷運採購時程、立案補習班、一般旅館名冊、臺北旅遊網住宿資料、勞動法規公開紀錄、南港軟體工業園區廠商、動物醫院一覽表與準公共化托嬰中心

## Purpose

The app presents separate Taipei Open Data modules:

- [臺北市人民團體名冊](https://data.taipei/dataset/detail?id=72417af0-7dec-4fad-b762-5f2baafcf084): civic group directory, district distribution, founding years, and inferred categories.
- [臺北市演藝團體名冊](https://data.taipei/dataset/detail?id=f56e77c6-cc69-480c-8ba4-057fc7e1d8d6): performing-arts group registry, source application categories, registration numbers, competent authority fields, registered-address parsing, website preservation, and district summaries.
- [臺北市各工會名單及聯絡方式](https://data.taipei/dataset/detail?id=bea69229-8349-4208-8a68-988718f4ea48): registered labor union directory, union-type grouping, contact-address parsing, phone classification, and district summaries.
- [臺北市準公共化托嬰中心](https://data.taipei/dataset/detail?id=aeaaa517-089c-42a7-ad5b-60fef89c3545): quasi-public infant care center directory, district summaries, approved capacity, actual enrollment, listed capacity gap, occupancy rate, and evaluation-result grouping.
- [臺北市產業發展獎勵補助計畫獲獎勵補助廠商基本資料](https://data.taipei/dataset/detail?id=3e78bffa-3fa3-46d5-a632-df99447de695): industry grant recipient companies, approved subsidy amounts, project budgets, grant fields, and industry categories.
- [臺北捷運公司採購案件預定招標時程資訊](https://data.taipei/dataset/detail?id=f4fd7f03-9bf6-41de-a003-02c437596570): monthly Taipei Metro planned procurement tender schedule records, subject categories, derived tender methods, and case keywords.
- [臺北市立案補習班資訊](https://data.taipei/dataset/detail?id=b124a967-fc88-4c45-bea8-41b4ef158a15): registered cram-school public registry records, district summaries, filing dates, classroom counts, and classroom/premises areas.
- [臺北市一般旅館名冊](https://data.taipei/dataset/detail?id=4d7d0b46-2e90-4ee7-b000-c0f2f3a37651): general hotel registry records, district summaries, listed room-rate fields, and room counts.
- [臺北市臺北旅遊網住宿資料(中文)](https://data.taipei/dataset/detail?id=58093ba6-4c98-4148-b27a-50ad97d7afca): Taipei Travel tourism-facing accommodation records, categories, contact fields, district summaries, and listed room counts.
- [臺北市政府勞動局違反勞動基準法事業單位及事業主公布總表](https://data.taipei/dataset/detail?id=23630879-4926-4877-a48a-a0ae6cc2f7d5): Labor Standards Act violation publication records, announcement/disposition dates, provisions, source-text violation contents, and parsed penalty amounts.
- [臺北市南港軟體工業園區廠商資料名錄](https://data.taipei/dataset/detail?id=6b7c48b4-03a6-4fcc-b172-9cee415c20b9): Nangang Software Park public company directory, business IDs, addresses, detected TWD97/WGS84 coordinates, and grouped map locations.
- [臺北市動物醫院一覽表](https://data.taipei/dataset/detail?id=01bcb5ee-7c18-41fa-86d4-4e75daee1f94): animal hospital public directory records, district summaries, road-name grouping, phone lookup, and address-based map links.

Traditional Chinese is the default language; English is available in the header.

## Additional module: Industry Grant Recipients / 產業補助廠商

Grant recipients are not civic groups and remain a separate directory. The source CSV uses CP950/Big5-compatible encoding. Conversion handles ROC dates, NTD currency fields, district normalization, subsidy shares, and summary aggregation. The responsible-person field remains in generated source data but is not shown in default company cards.

The civic-group and grant datasets do not supply organization coordinates. Their maps use Taipei’s 12 district centroids and display aggregate bubbles only, not exact locations.

## Additional module: Performing Arts Groups / 演藝團體名冊

Performing arts groups remain the separate `performing_arts_groups` cultural public-records module, distinct from general `civic_groups` even when organizations overlap. Conversion preserves registration numbers as text, preserves source application categories, parses registered addresses into district and road name, and normalizes website URLs only for safe external links.

The dataset has no official coordinates. The map uses district centroid bubbles only, and the directory provides address-based Google Maps lookup links. The module does not claim event schedules, ticket availability, current operating status, performance quality, recommendation, ranking, grant status, legal advice, or official endorsement.

## Additional module: Registered Labor Unions / 工會名單

Labor unions remain the separate `registered_labor_unions` module. The source uses CP950/Big5-compatible encoding and includes union type, union name, chairperson, postal code, contact address, and phone fields. Conversion preserves postal codes, phone text, and chairperson names; chairperson names are shown only in expanded source details.

The dataset has no coordinates. The map uses Taipei district centroid bubbles only. Outside-Taipei addresses, postal boxes, and unparsed addresses remain in directory/search/statistics but are not mapped as exact points. The module does not claim legal status, membership eligibility, recommendation, labor-relations advice, ranking, or official endorsement.

## Additional module: Quasi-Public Infant Care Centers / 準公共化托嬰中心

Infant care centers remain the separate `quasi_public_infant_care_centers` module. The source uses UTF-8-SIG, with Big5/CP950 fallback. Conversion preserves phone text, parses district/address/road name, parses approved capacity and actual enrollment, derives listed capacity gap and occupancy rate, and splits evaluation results into ROC year and grade.

The dataset has no coordinates. The map uses district centroid bubbles only, and the directory provides address-based Google Maps lookup links. Listed capacity gap is not real-time vacancy. The module does not claim real-time availability, service-quality guarantee, recommendation, childcare advice, pricing, operating status, ranking, or official endorsement.

## Additional module: Metro Procurement Schedule / 捷運採購時程

The fetcher discovers and downloads all monthly CSV resources listed on the official dataset page. Conversion reads every matching file under `data/raw/metro-procurement-schedules/`, supports Big5/CP950 and UTF-8-SIG, and converts ROC year-month values such as `11506` to `2026-06`.

The source column named `預算金額` is preserved as `budgetAmountRaw`. Numeric values are parsed as NTD; recognizable text values are separately classified as derived tender methods. Subject category and case keyword classifications are derived and are not official source fields. The dataset has no coordinates or district field, so it is not displayed as map markers.

## Additional module: Registered Cram Schools / 立案補習班

Registered cram schools are not civic groups and remain the separate `registered_cram_schools` module. The source CSV uses UTF-8-SIG. Conversion trims column names and values, extracts postal codes and districts from addresses, parses Gregorian and ROC-style registration dates, and parses classroom count, classroom area, and total premises area without treating missing values as zero.

The dataset has no longitude or latitude columns. The map uses Taipei district centroid bubbles and an address-based Google Maps lookup link in the directory. It does not create fake exact markers or make teaching-quality, enrollment-status, business-status, or recommendation claims. A future verified coordinate cache can be added at `public/data/registered-cram-school-locations.json`.

## Additional module: Registered Hotels / 一般旅館名冊

Registered hotels remain a separate `registered_hotels` module. The source uses CP950/Big5-compatible encoding, has no coordinates, and is presented as district summaries plus an address-based directory. Listed room-rate fields are public registry fields, not real-time or booking prices.

## Additional module: Taipei Travel Accommodations / 臺北旅遊網住宿資料

Taipei Travel accommodations remain the separate `taipei_travel_accommodations_zh` module. It is a tourism-facing accommodation directory, distinct from the administrative `registered_hotels` registry even when records overlap. Conversion preserves phone and fax text, parses address/district/road names, parses listed room count, and groups records by source accommodation category.

The dataset has no official coordinates. The map uses district centroid bubbles only, and the directory provides address-based Google Maps lookup links. The module does not claim booking availability, real-time vacancy, pricing, recommendation, ranking, accommodation quality, travel advice, safety guarantee, or official endorsement.

## Additional module: Labor Standards Act Violation Records / 勞基法違規公布紀錄

The separate `labor_standard_act_violation_records` module uses UTF-8-SIG with a Big5 fallback. It parses ROC dates, reports invalid date values without failing conversion, preserves `Unnamed: 9` as `sourceExtraNote`, splits provisions and source-text violation contents, derives non-interpretive topic tags, and does not treat missing penalty amounts as zero.

Records are chunked by announcement year and lazy-loaded only for the directory. The dataset has no addresses or coordinates, so it has no map layer. It is a public administrative-record explorer, not a blacklist, current-compliance assessment, employer ranking, or legal-advice tool. Responsible-person names are preserved from the official source but only shown in source details.

## Additional module: Nangang Software Park Companies / 南港軟體工業園區廠商

The company directory remains separate from civic groups and grants. Business IDs stay as strings to preserve leading zeroes. The source coordinate columns are detected as WGS84 or TWD97/EPSG:3826; valid TWD97 points are converted to WGS84 and grouped by shared coordinate for map display. Company-name keyword tags are a site-derived aid, not official industry classifications. The directory is not evidence of operating status, investment value, real-time tenancy, or government recommendation.

## Additional module: Registered Animal Hospitals / 動物醫院一覽表

Animal hospitals remain the separate `registered_animal_hospitals` module. The uploaded CSV uses UTF-8-SIG, with Big5/CP950 fallback in conversion. The converter preserves phone text, extracts district and road names from addresses, and keeps responsible-person names only for source details.

The dataset has no coordinates. The map uses district centroid bubbles only, and the directory provides address-based Google Maps lookup links. The module does not claim medical quality, emergency service, real-time operating status, recommendation, ranking, or medical advice.

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
- `public/data/performing-arts-groups.json`
- `public/data/performing-arts-group-summary.json`
- `public/data/conversion-report.json`
- `public/data/registered-labor-unions.json`
- `public/data/registered-labor-union-summary.json`
- `public/data/quasi-public-infant-care-centers.json`
- `public/data/quasi-public-infant-care-center-summary.json`
- `public/data/industry-grant-recipients.json`
- `public/data/industry-grant-summary.json`
- `public/data/metro-procurement-schedules.json`
- `public/data/metro-procurement-summary.json`
- `public/data/registered-cram-schools.json`
- `public/data/registered-cram-school-summary.json`
- `public/data/registered-hotels.json`
- `public/data/registered-hotel-summary.json`
- `public/data/taipei-travel-accommodations-zh.json`
- `public/data/taipei-travel-accommodation-zh-summary.json`
- `public/data/labor-standard-act-violation-records/manifest.json`
- `public/data/labor-standard-act-violation-records/chunks/by-announcement-year/*.json`
- `public/data/labor-standard-act-violation-summary.json`
- `public/data/nangang-software-park-companies.json`
- `public/data/nangang-software-park-company-summary.json`
- `public/data/registered-animal-hospitals.json`
- `public/data/registered-animal-hospital-summary.json`
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

Labor union data can be loaded from the uploaded CSV or an official resource:

```bash
npm run data:fetch:labor-unions -- --force --local=/absolute/path/to/臺北市各工會名單及聯絡方式.csv
npm run data:convert:labor-unions
tsx scripts/buildPublicRecordsSummary.ts
```

Infant care center data can be loaded from the uploaded CSV or an official resource:

```bash
npm run data:fetch:infant-care -- --force --local=/absolute/path/to/臺北市準公共化托嬰中心.csv
npm run data:convert:infant-care
tsx scripts/buildPublicRecordsSummary.ts
```

Taipei Travel accommodation data can be loaded from the uploaded CSV or an official resource:

```bash
npm run data:fetch:travel-accommodations -- --force --local=/absolute/path/to/臺北市臺北旅遊網住宿資料\(中文\).csv
npm run data:convert:travel-accommodations
tsx scripts/buildPublicRecordsSummary.ts
```

Performing arts group data can be loaded from the uploaded CSV or an official resource:

```bash
npm run data:fetch:performing-arts -- --force --local=/absolute/path/to/臺北市演藝團體名冊.csv
npm run data:convert:performing-arts
tsx scripts/buildPublicRecordsSummary.ts
```

Metro procurement data can be refreshed from every monthly resource on the official page:

```bash
npm run data:fetch:metro-procurement -- --force
npm run data:convert:metro-procurement
```

Registered cram-school data can be loaded from the uploaded CSV or a known official CSV resource:

```bash
npm run data:fetch:registered-cram-schools -- --force --local=/absolute/path/to/補習班名冊_1140213.csv
npm run data:convert:registered-cram-schools
tsx scripts/buildPublicRecordsSummary.ts
```

Labor violation records can be loaded from the uploaded CSV or an official resource:

```bash
npm run data:fetch:labor-violations -- --force --local=/absolute/path/to/違法名單總表.csv
npm run data:convert:labor-violations
tsx scripts/buildPublicRecordsSummary.ts
```

Nangang Software Park company data can be loaded from the uploaded CSV or an official resource:

```bash
npm run data:fetch:nangang-software-park -- --force --local=/absolute/path/to/臺北市南港軟體工業園區.csv
npm run data:convert:nangang-software-park
tsx scripts/buildPublicRecordsSummary.ts
```

Animal hospital data can be loaded from the uploaded CSV or an official resource:

```bash
npm run data:fetch:animal-hospitals -- --force --local=/absolute/path/to/臺北市動物醫院一覽表.csv
npm run data:convert:animal-hospitals
tsx scripts/buildPublicRecordsSummary.ts
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

Registered labor union directory data is a public contact directory only. It does not represent legal status, membership eligibility, recommendation, labor-relations advice, ranking, or official endorsement. Chairperson names are shown only in source details.

Quasi-public infant care center data is a public directory only. It does not represent real-time vacancy, service-quality guarantee, recommendation ranking, childcare advice, pricing information, operating status, or official endorsement. Listed capacity gap is derived from source fields and is not real-time vacancy.

Taipei Travel accommodation data is a public tourism accommodation directory only. It does not represent real-time operating status, real-time vacancy, pricing, booking service, accommodation quality, recommendation ranking, travel advice, safety guarantee, or official endorsement.

Taipei Metro procurement schedule data is a planned schedule only. Actual announcement timing, tender documents, eligibility requirements, procurement amounts, and latest status should be verified through the Government e-Procurement System and official authority notices.

Registered cram-school data is a public registration directory only. It does not represent teaching quality, enrollment status, course content, pricing, real-time business status, or recommendation.

Labor Standards Act violation publication records are administrative publication records for lookup and statistical organization only. They do not represent current operating status, real-time violation status, overall employer evaluation, job-seeking advice, legal advice, or court outcomes. Responsible-person names are shown only in source details.

Animal hospital directory data is for lookup, district distribution, and public-data exploration only. It does not represent medical quality, real-time operating status, emergency service, pricing, veterinarian schedules, recommendation, medical advice, or official endorsement. Responsible-person names are shown only in source details.
