# Taipei Civic Groups Map / 台北人民團體地圖

Mobile-first bilingual explorer for Taipei public records.

Public-record modules: civic groups, performing arts groups, registered labor unions, disability employment resources, contracted vaccination medical providers, publicly funded HPV vaccination providers, child medical subsidy contracted providers, denture subsidy medical providers, telepsychology counseling institutions, business premises public liability insurance records, business registration change records, company registration change records, industry grants, biotech company directory, Taipei Metro procurement schedules, registered cram schools, registered hotels, Taipei Travel accommodations, labor-law compliance publication records, consumer dispute absence notices, Nangang Software Park companies, registered animal hospitals, quasi-public infant care centers, infant care center evaluation results, and elderly welfare institutions / 公開資料模組：人民團體、演藝團體、工會名單、身障就業資源、各項預防接種合約醫療院所、公費HPV疫苗特約醫療院所、兒童醫療補助特約院所名冊、假牙補助醫療院所名單、可執行通訊心理諮商之心理機構、營業場所投保公共意外險清冊、商業異動、公司異動、產業補助、生技廠商企業名錄、捷運採購時程、立案補習班、一般旅館名冊、臺北旅遊網住宿資料、勞動法規公開紀錄、消費爭議不到場公告、南港軟體工業園區廠商、動物醫院一覽表、準公共化托嬰中心、托嬰中心評鑑結果與老人福利機構名冊

## Purpose

The app presents separate Taipei Open Data modules:

- [臺北市人民團體名冊](https://data.taipei/dataset/detail?id=72417af0-7dec-4fad-b762-5f2baafcf084): civic group directory, district distribution, founding years, and inferred categories.
- [臺北市演藝團體名冊](https://data.taipei/dataset/detail?id=f56e77c6-cc69-480c-8ba4-057fc7e1d8d6): performing-arts group registry, source application categories, registration numbers, competent authority fields, registered-address parsing, website preservation, and district summaries.
- [臺北市各項預防接種合約醫療院所](https://data.taipei/dataset/detail?id=ec201f0a-2efa-4426-9439-a8daea7b33c7): contracted vaccination provider directory, source vaccination service flags, phone and voice reservation fields, district/address/road parsing, and district summaries.
- [臺北市公費HPV疫苗特約醫療院所](https://data.taipei/dataset/detail?id=96f143fe-4c95-4d88-9985-77f28e2d2c3d): publicly funded HPV vaccination provider directory, district-code mapping, address/road parsing, phone lookup, and district summaries.
- [臺北市兒童醫療補助特約院所名冊](https://data.taipei/dataset/detail?id=3cc250f5-9f5a-4670-ac7b-f13ecd316032): child medical subsidy contracted provider directory, provider-code parsing, administrative-area parsing, outside-Taipei preservation, address/road parsing, phone lookup, and area summaries.
- [臺北市假牙補助醫療院所名單](https://data.taipei/dataset/detail?id=76b8b514-e793-4cca-8dcf-065d5af4b760): denture subsidy medical provider directory, Big5/CP950 decoding, subsidy-type parsing, provider branch preservation, address/road parsing, phone lookup, and district summaries.
- [臺北市身障就業資源地圖](https://data.taipei/dataset/detail?id=c5aafda8-ef14-4f66-a6b7-d5da995a14b5): disability employment and vocational rehabilitation resource directory, Big5/CP950 decoding, ROC year parsing, business item grouping, service-category grouping, address/road parsing, phone lookup, and district summaries.
- [臺北市可執行通訊心理諮商之心理機構](https://data.taipei/dataset/detail?id=428a78d5-867a-4e55-9630-040a89c8cd94): telepsychology counseling institution directory, institution types, district/address/road parsing, phone/extension/mobile fields, and district summaries.
- [臺北市營業場所投保公共意外險清冊](https://data.taipei/dataset/detail?id=5880bb98-ab6a-476c-ae55-37564b0d0fc9): business premises public liability insurance records, registration numbers, categories, source coordinates, policy expiry dates, and expiry-status summaries based only on source dates.
- [臺北市核准商業設立、變更及歇業登記等異動資料清冊](https://data.taipei/dataset/detail?id=5fdefcca-e0a6-41bc-a520-7c8f067caad3): business registration change records, establishment/modification/closure event types, business numbers, source coordinates, event dates, and district summaries.
- [臺北市核准公司設立變更解散清冊](https://data.taipei/dataset/detail?id=0a1f284d-e985-4c39-b0b5-53389fbfa6e9): company registration change records, establishment/modification/dissolution event types, unified business numbers, source coordinates, event dates, and district summaries.
- [臺北市各工會名單及聯絡方式](https://data.taipei/dataset/detail?id=bea69229-8349-4208-8a68-988718f4ea48): registered labor union directory, union-type grouping, contact-address parsing, phone classification, and district summaries.
- [臺北市準公共化托嬰中心](https://data.taipei/dataset/detail?id=aeaaa517-089c-42a7-ad5b-60fef89c3545): quasi-public infant care center directory, district summaries, approved capacity, actual enrollment, listed capacity gap, occupancy rate, and evaluation-result grouping.
- [臺北市托嬰中心評鑑結果](https://data.taipei/dataset/detail?id=e7b45593-9d44-469c-97fa-f1a52c69ebaa): infant care center evaluation result records, district-code parsing, ROC year-column parsing, wide-to-long conversion, grade/status normalization, and special-note preservation.
- [臺北市老人福利機構名冊](https://data.taipei/dataset/detail?id=d455b149-1a2f-4d5a-a9a8-315eb71f51f6): elderly welfare institution directory, institution attributes, care-recipient categories, district summaries, and approved bed-count fields.
- [臺北市生技廠商企業名錄](https://data.taipei/dataset/detail?id=a05ee8ee-d7f1-4024-86c1-e2f97f2120bf): biotech company directory, company names, unified business numbers, registered addresses, company phones, industry categories, and converted source coordinates.
- [臺北市產業發展獎勵補助計畫獲獎勵補助廠商基本資料](https://data.taipei/dataset/detail?id=3e78bffa-3fa3-46d5-a632-df99447de695): industry grant recipient companies, approved subsidy amounts, project budgets, grant fields, and industry categories.
- [臺北捷運公司採購案件預定招標時程資訊](https://data.taipei/dataset/detail?id=f4fd7f03-9bf6-41de-a003-02c437596570): monthly Taipei Metro planned procurement tender schedule records, subject categories, derived tender methods, and case keywords.
- [臺北市立案補習班資訊](https://data.taipei/dataset/detail?id=b124a967-fc88-4c45-bea8-41b4ef158a15): registered cram-school public registry records, district summaries, filing dates, classroom counts, and classroom/premises areas.
- [臺北市一般旅館名冊](https://data.taipei/dataset/detail?id=4d7d0b46-2e90-4ee7-b000-c0f2f3a37651): general hotel registry records, district summaries, listed room-rate fields, and room counts.
- [臺北市臺北旅遊網住宿資料(中文)](https://data.taipei/dataset/detail?id=58093ba6-4c98-4148-b27a-50ad97d7afca): Taipei Travel tourism-facing accommodation records, categories, contact fields, district summaries, and listed room counts.
- [臺北市政府勞動局違反勞動基準法事業單位及事業主公布總表](https://data.taipei/dataset/detail?id=23630879-4926-4877-a48a-a0ae6cc2f7d5): Labor Standards Act violation publication records, announcement/disposition dates, provisions, source-text violation contents, and parsed penalty amounts.
- [臺北市消費爭議無故不到場協商之被申訴企業經營者列表](https://data.taipei/dataset/detail?id=c15e49fd-f511-46c8-8613-0ad91f370bfd): consumer dispute absence notice records, multiple annual CSV resources, resource-name preservation, ROC year parsing, negotiation-date parsing, respondent/complainant lookup, and dispute-content keyword tags.
- [臺北市南港軟體工業園區廠商資料名錄](https://data.taipei/dataset/detail?id=6b7c48b4-03a6-4fcc-b172-9cee415c20b9): Nangang Software Park public company directory, business IDs, addresses, detected TWD97/WGS84 coordinates, and grouped map locations.
- [臺北市動物醫院一覽表](https://data.taipei/dataset/detail?id=01bcb5ee-7c18-41fa-86d4-4e75daee1f94): animal hospital public directory records, district summaries, road-name grouping, phone lookup, and address-based map links.

Traditional Chinese is the default language; English is available in the header.

## Additional module: Industry Grant Recipients / 產業補助廠商

Grant recipients are not civic groups and remain a separate directory. The source CSV uses CP950/Big5-compatible encoding. Conversion handles ROC dates, NTD currency fields, district normalization, subsidy shares, and summary aggregation. The responsible-person field remains in generated source data but is not shown in default company cards.

The civic-group and grant datasets do not supply organization coordinates. Their maps use Taipei’s 12 district centroids and display aggregate bubbles only, not exact locations.

## Additional module: Performing Arts Groups / 演藝團體名冊

Performing arts groups remain the separate `performing_arts_groups` cultural public-records module, distinct from general `civic_groups` even when organizations overlap. Conversion preserves registration numbers as text, preserves source application categories, parses registered addresses into district and road name, and normalizes website URLs only for safe external links.

The dataset has no official coordinates. The map uses district centroid bubbles only, and the directory provides address-based Google Maps lookup links. The module does not claim event schedules, ticket availability, current operating status, performance quality, recommendation, ranking, grant status, legal advice, or official endorsement.

## Additional module: Contracted Vaccination Medical Providers / 各項預防接種合約醫療院所

Contracted vaccination providers remain the separate `contracted_vaccination_medical_providers` healthcare and public-health directory module. Conversion preserves phone and voice-reservation text, parses source service flags into filterable vaccination service items, maps Taipei district codes, and parses addresses into district and road name.

The dataset has no official coordinates. The map uses district centroid bubbles only, and the directory provides address-based Google Maps lookup links. The module does not claim real-time clinic hours, appointment availability, vaccine stock, vaccination eligibility, medical advice, provider quality, recommendation, ranking, or official endorsement.

## Additional module: Publicly Funded HPV Vaccination Providers / 公費HPV疫苗特約醫療院所

HPV vaccination providers remain the separate `publicly_funded_hpv_vaccination_providers` healthcare and vaccination module. The uploaded UTF-8-SIG CSV includes sequence number, district code, provider name, address, and phone. Conversion preserves district codes as strings, maps them to Taipei district names, parses address districts/roads, reconciles district-code and address districts, and preserves phone text.

The dataset has no official coordinates. The map uses district centroid bubbles only, and the directory provides address-based Google Maps lookup links. The module does not claim real-time clinic hours, appointment availability, vaccine stock, vaccination eligibility, fees, medical advice, vaccination advice, service-quality ranking, or official endorsement.

## Additional module: Child Medical Subsidy Contracted Providers / 兒童醫療補助特約院所名冊

Child medical subsidy contracted providers remain the separate `child_medical_subsidy_contracted_providers` healthcare and child-welfare public-record module. The UTF-8-SIG CSV includes sequence number, provider code, clinic name, administrative area, address, and phone. Conversion preserves provider codes as text, parses Taipei districts and outside-Taipei area values without forcing them into Taipei districts, normalizes `台北市` to `臺北市`, extracts road names where practical, classifies phone values, and reports duplicate provider codes, addresses, phones, and fallback keys.

The dataset has no official coordinates. The map uses Taipei district centroid bubbles only for Taipei records; outside-Taipei areas remain in summaries and the directory. The module does not claim real-time clinic hours, appointment availability, subsidy eligibility, subsidy amount, fees, medical advice, pediatric care advice, service-quality ranking, emergency service, real-time operating status, or official endorsement.

## Additional module: Denture Subsidy Medical Providers / 假牙補助醫療院所名單

Denture subsidy medical providers remain the separate `denture_subsidy_medical_providers` elderly-welfare and healthcare-subsidy public-record module. The Big5/CP950 CSV includes subsidy type, area, provider name, address, and contact phone. Conversion decodes Big5 first with UTF-8-SIG fallback, preserves hospital branch names, parses Taipei districts and road names, classifies phone values, and reports duplicate provider names, addresses, phones, and fallback keys.

The dataset has no official coordinates. The map uses Taipei district centroid bubbles only, and the directory provides address-based Google Maps lookup links. The module does not claim real-time clinic hours, appointment availability, subsidy eligibility, subsidy amount, fees, dental treatment advice, medical advice, service-quality ranking, emergency dental service, real-time operating status, or official endorsement.

## Additional module: Disability Employment Resource Map / 身障就業資源地圖

Disability employment resources remain the separate `disability_employment_resource_map` labor, employment, and vocational rehabilitation public-record module. The Big5/CP950 CSV includes SEQNO, Year, name, type, business item, contact, address, and telephone. Conversion decodes Big5 first with UTF-8-SIG fallback, parses ROC years, preserves resource names and contacts, groups business items and service categories as UI helper categories, parses Taipei districts and road names, classifies phone values, and reports duplicate names, addresses, phones, sequence numbers, and fallback keys.

The dataset has addresses but no official coordinates. The map uses Taipei district centroid bubbles only, and the directory provides address-based Google Maps lookup links. The module does not claim job vacancies, real-time service capacity, employment placement guarantees, subsidy or welfare eligibility, vocational rehabilitation assessment, disability assessment, medical advice, legal advice, accessibility certification, service-quality ranking, legal compliance, or official endorsement.

## Additional module: Telepsychology Counseling Institutions / 可執行通訊心理諮商之心理機構

Telepsychology counseling institutions remain the separate `telepsychology_counseling_institutions` healthcare and mental-health public-record directory module. The uploaded CSV uses CP950/Big5-compatible encoding. Conversion reads all columns as strings, preserves district codes, parses institution types (`諮商所`, `治療所`, `基金會`, `學校`), normalizes `台北市` to `臺北市`, parses district/road names, and preserves phone, extension, and mobile fields including mobile leading zeroes.

The dataset has no official coordinates. The map uses district centroid bubbles only, and the directory provides address-based Google Maps lookup links. The module does not claim diagnosis, medical advice, psychotherapy advice, crisis-service availability, real-time appointment availability, service fees, insurance coverage, provider quality, recommendation, ranking, or official endorsement.

## Additional module: Business Premises Public Liability Insurance / 營業場所投保公共意外險清冊

Public liability insurance records remain the separate `business_premises_public_liability_insurance_records` business-registration and public-liability insurance module. The monthly CSV uses UTF-8-SIG, with Big5/CP950 fallback. Conversion keeps registration numbers as text, preserves raw categories, parses source policy expiry dates including ROC formats, derives expiry status from the source expiry date and build date only, and validates source longitude/latitude against Taipei bounds.

The dataset includes source coordinates, so valid-coordinate records render as source-coordinate map points. The module does not claim legal compliance, current insurance validity, complete insurance terms, claim eligibility, venue safety, real-time operating status, legal advice, insurance advice, recommendation, risk ranking, or official endorsement.

## Additional module: Business Registration Change Records / 商業設立、變更及歇業登記異動資料

Business registration change records remain the separate `business_registration_change_records` module. Conversion reads the three monthly CSV resources for establishment, modification, and closure records, preserves unified business numbers as strings, parses ROC event dates, normalizes Taipei addresses, and validates source longitude/latitude against Taipei bounds.

The dataset includes source coordinates, so valid-coordinate records render as source-coordinate map points. The module does not claim current operating status, post-closure status, business credit, legal compliance, investment value, recommendation, legal advice, financial advice, or official endorsement.

## Additional module: Company Registration Change Records / 公司設立、變更及解散登記異動資料

Company registration change records remain the separate `company_registration_change_records` module. Conversion reads the three monthly CSV resources for establishment, modification, and dissolution records, preserves unified business numbers as strings, parses ROC approval dates, normalizes Taipei addresses, and validates source longitude/latitude against Taipei bounds.

The dataset includes source coordinates, so valid-coordinate records render as source-coordinate map points. The module does not claim current operating status, post-dissolution status, complete company registration information, credit rating, legal compliance, investment value, recommendation, legal advice, financial advice, or official endorsement.

## Additional module: Registered Labor Unions / 工會名單

Labor unions remain the separate `registered_labor_unions` module. The source uses CP950/Big5-compatible encoding and includes union type, union name, chairperson, postal code, contact address, and phone fields. Conversion preserves postal codes, phone text, and chairperson names; chairperson names are shown only in expanded source details.

The dataset has no coordinates. The map uses Taipei district centroid bubbles only. Outside-Taipei addresses, postal boxes, and unparsed addresses remain in directory/search/statistics but are not mapped as exact points. The module does not claim legal status, membership eligibility, recommendation, labor-relations advice, ranking, or official endorsement.

## Additional module: Quasi-Public Infant Care Centers / 準公共化托嬰中心

Infant care centers remain the separate `quasi_public_infant_care_centers` module. The source uses UTF-8-SIG, with Big5/CP950 fallback. Conversion preserves phone text, parses district/address/road name, parses approved capacity and actual enrollment, derives listed capacity gap and occupancy rate, and splits evaluation results into ROC year and grade.

## Additional module: Infant Care Center Evaluation Results / 托嬰中心評鑑結果

Infant care evaluation results remain the separate `infant_care_center_evaluation_results` childcare and social welfare module. Conversion decodes UTF-8-SIG with Big5 fallback, parses district and district code, converts ROC year columns into both institution-level records and institution-year records, normalizes evaluation grade/status, and preserves special result notes.

The dataset has districts but no addresses or official coordinates, so the module uses district-level bubbles only and creates no exact markers or geocoding. It does not claim real-time vacancy, fee comparison, service guarantee, parent recommendation, official ranking, violation finding, legal advice, or official endorsement.

The dataset has no coordinates. The map uses district centroid bubbles only, and the directory provides address-based Google Maps lookup links. Listed capacity gap is not real-time vacancy. The module does not claim real-time availability, service-quality guarantee, recommendation, childcare advice, pricing, operating status, ranking, or official endorsement.

## Additional module: Elderly Welfare Institutions / 老人福利機構名冊

Elderly welfare institutions remain the separate `elderly_welfare_institutions` module. Conversion preserves sequence numbers, institution attributes, institution names, districts, addresses, phone text, care-recipient categories, and approved bed counts for long-term care, nursing care, dementia care, and residential care.

The dataset has no coordinates. The map uses district centroid bubbles only, and the directory provides address-based Google Maps lookup links. Approved bed counts are source registry fields, not real-time vacancy. The module does not claim admission eligibility, fees, subsidy eligibility, care quality, recommendation, ranking, medical advice, long-term care advice, legal advice, or official endorsement.

## Additional module: Biotech Company Directory / 生技廠商企業名錄

Biotech company records remain the separate `biotech_company_directory` module. Conversion preserves company name, unified business number, responsible person, registered address, company phone, and industry category. The responsible-person field is shown only in expanded source details, not as a default table column.

The uploaded UTF-8-SIG CSV uses `位置X座標` / `位置Y座標`; the converter also supports official aliases `位置X座標(經度)` / `位置Y座標(緯度)`. Source coordinate values are detected as TWD97 / EPSG:3826-style values and converted to WGS84 for valid map markers. The module does not claim complete industry coverage, real-time operating status, product approval, company quality, investment value, credit status, legal compliance, or official endorsement.

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

## Additional module: Consumer Dispute Absence Notices / 消費爭議協商不到場公告

The separate `consumer_dispute_absent_business_operators` module reads multiple annual CSV resources, preserves `resourceName`, parses ROC years and negotiation dates, preserves respondent and complainant names, and derives exploratory dispute-content keyword tags. It is not merged with company or business registration records.

The dataset has no coordinates, addresses, roads, or districts, so it has no map layer. It is a consumer protection public notice explorer, not a fraud finding, legal-liability finding, court judgment, administrative penalty amount, credit-risk score, investment signal, blacklist, consumer legal advice, or official endorsement.

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
- `public/data/contracted-vaccination-medical-providers.json`
- `public/data/contracted-vaccination-medical-provider-summary.json`
- `public/data/publicly-funded-hpv-vaccination-providers.json`
- `public/data/publicly-funded-hpv-vaccination-provider-summary.json`
- `public/data/child-medical-subsidy-contracted-providers.json`
- `public/data/child-medical-subsidy-contracted-provider-summary.json`
- `public/data/denture-subsidy-medical-providers.json`
- `public/data/denture-subsidy-medical-provider-summary.json`
- `public/data/disability-employment-resource-map.json`
- `public/data/disability-employment-resource-map-summary.json`
- `public/data/telepsychology-counseling-institutions.json`
- `public/data/telepsychology-counseling-institution-summary.json`
- `public/data/business-premises-public-liability-insurance-records.json`
- `public/data/business-premises-public-liability-insurance-summary.json`
- `public/data/business-registration-change-records.json`
- `public/data/business-registration-change-summary.json`
- `public/data/company-registration-change-records.json`
- `public/data/company-registration-change-summary.json`
- `public/data/conversion-report.json`
- `public/data/registered-labor-unions.json`
- `public/data/registered-labor-union-summary.json`
- `public/data/quasi-public-infant-care-centers.json`
- `public/data/quasi-public-infant-care-center-summary.json`
- `public/data/infant-care-center-evaluation-institutions.json`
- `public/data/infant-care-center-evaluation-year-records.json`
- `public/data/infant-care-center-evaluation-summary.json`
- `public/data/infant-care-center-evaluation-latest.json`
- `public/data/elderly-welfare-institutions.json`
- `public/data/elderly-welfare-institution-summary.json`
- `public/data/biotech-company-directory.json`
- `public/data/biotech-company-directory-summary.json`
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
- `public/data/consumer-dispute-absent-business-operators.json`
- `public/data/consumer-dispute-absent-business-operator-summary.json`
- `public/data/consumer-dispute-absent-business-operator-latest.json`
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

Business registration change data can be loaded from the three monthly CSV resources:

```bash
npm run data:fetch:business-changes -- --force \
  --establishment=/absolute/path/to/商業設立11504.csv \
  --modification=/absolute/path/to/商業變更11504.csv \
  --closure=/absolute/path/to/商業歇業11504.csv
npm run data:convert:business-changes
tsx scripts/buildPublicRecordsSummary.ts
```

Company registration change data can be loaded from the three monthly CSV resources:

```bash
npm run data:fetch:company-changes -- --force \
  --establishment=/absolute/path/to/公司設立11504.csv \
  --modification=/absolute/path/to/公司變更11504.csv \
  --dissolution=/absolute/path/to/公司解散11504.csv
npm run data:convert:company-changes
tsx scripts/buildPublicRecordsSummary.ts
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

Infant care center evaluation result data can be loaded from the uploaded CSV or an official resource:

```bash
npm run data:fetch:infant-care-evaluations -- --force --local=/absolute/path/to/臺北市托嬰中心評鑑結果.csv
npm run data:convert:infant-care-evaluations
tsx scripts/buildPublicRecordsSummary.ts
```

Child medical subsidy contracted provider data can be loaded from the uploaded CSV or an official resource:

```bash
npm run data:fetch:child-medical-subsidy-providers -- --force --local=/absolute/path/to/臺北市兒童醫療補助特約院所名冊.csv
npm run data:convert:child-medical-subsidy-providers
tsx scripts/buildPublicRecordsSummary.ts
```

Denture subsidy medical provider data can be loaded from the uploaded CSV or an official resource:

```bash
npm run data:fetch:denture-subsidy-providers -- --force --local=/absolute/path/to/假牙補助醫療院所名單.csv
npm run data:convert:denture-subsidy-providers
tsx scripts/buildPublicRecordsSummary.ts
```

Disability employment resource data can be loaded from the uploaded CSV or an official resource:

```bash
npm run data:fetch:disability-employment-resources -- --force --local=/absolute/path/to/\(0526版\)身障資源地圖.csv
npm run data:convert:disability-employment-resources
tsx scripts/buildPublicRecordsSummary.ts
```

Elderly welfare institution data can be loaded from the uploaded CSV or an official resource:

```bash
npm run data:fetch:elderly-welfare -- --force --local=/absolute/path/to/臺北市老人福利機構名冊.csv
npm run data:convert:elderly-welfare
tsx scripts/buildPublicRecordsSummary.ts
```

Biotech company directory data can be loaded from the uploaded CSV or an official resource:

```bash
npm run data:fetch:biotech-companies -- --force --local=/absolute/path/to/臺北市生技廠商企業名錄114年.csv
npm run data:convert:biotech-companies
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

Contracted vaccination provider data can be loaded from the uploaded CSV or an official resource:

```bash
npm run data:fetch:vaccination-providers -- --force --local=/absolute/path/to/臺北市各項預防接種合約醫療院所名冊.csv
npm run data:convert:vaccination-providers
tsx scripts/buildPublicRecordsSummary.ts
```

Publicly funded HPV vaccination provider data can be loaded from the uploaded CSV or an official resource:

```bash
npm run data:fetch:hpv-providers -- --force --local=/absolute/path/to/臺北市公費HPV疫苗特約醫療院所.csv
npm run data:convert:hpv-providers
tsx scripts/buildPublicRecordsSummary.ts
```

Telepsychology counseling institution data can be loaded from the uploaded CP950/Big5 CSV or an official resource:

```bash
npm run data:fetch:telepsychology -- --force --local=/absolute/path/to/臺北市可執行通訊心理諮商之心理機構.csv
npm run data:convert:telepsychology
tsx scripts/buildPublicRecordsSummary.ts
```

Public liability insurance data can be loaded from the uploaded CSV or an official monthly resource:

```bash
npm run data:fetch:public-liability-insurance -- --force --local=/absolute/path/to/公共意外責任險11504.csv
npm run data:convert:public-liability-insurance
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

Consumer dispute absence notice data can be loaded from the uploaded annual CSVs or official resources:

```bash
npm run data:fetch:consumer-dispute-absence -- --force --local=/absolute/path/to/109年度無故不到場協商之被申訴企業經營者列表.csv --local=/absolute/path/to/110年度無故不到場協商之被申訴企業經營者列表.csv --local=/absolute/path/to/111年度無故不到場協商之被申訴企業經營者列表.csv --local=/absolute/path/to/無故不到場協商之被申訴企業經營者列表.csv
npm run data:convert:consumer-dispute-absence
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

Infant care center evaluation result data is for source-field lookup and statistical organization only. It does not represent real-time vacancy, fee levels, service quality guarantee, child safety guarantee, parent selection advice, violation or penalty conclusions, real-time operating status, official ranking, legal advice, or official endorsement.

Elderly welfare institution directory data is for lookup, district distribution, and public-data exploration only. It does not represent real-time vacancy, admission eligibility, fees, subsidy eligibility, care quality, recommendation ranking, medical advice, long-term care advice, legal advice, or official endorsement.

Publicly funded HPV vaccination provider data is for source-field lookup and district distribution only. It does not represent real-time clinic hours, appointment availability, vaccine stock, vaccination eligibility, fees, medical advice, vaccination advice, service-quality ranking, or official endorsement.

Biotech company directory data is for source-field lookup, map reference, and statistical organization only. It does not represent a complete industry registry, real-time operating status, company quality ranking, investment signal, credit rating, drug approval, medical device approval, legal compliance determination, legal advice, financial advice, or official endorsement.

Taipei Travel accommodation data is a public tourism accommodation directory only. It does not represent real-time operating status, real-time vacancy, pricing, booking service, accommodation quality, recommendation ranking, travel advice, safety guarantee, or official endorsement.

Taipei Metro procurement schedule data is a planned schedule only. Actual announcement timing, tender documents, eligibility requirements, procurement amounts, and latest status should be verified through the Government e-Procurement System and official authority notices.

Registered cram-school data is a public registration directory only. It does not represent teaching quality, enrollment status, course content, pricing, real-time business status, or recommendation.

Labor Standards Act violation publication records are administrative publication records for lookup and statistical organization only. They do not represent current operating status, real-time violation status, overall employer evaluation, job-seeking advice, legal advice, or court outcomes. Responsible-person names are shown only in source details.

Consumer dispute absence notice records are public notice records for lookup and statistical organization only. They do not represent a complete consumer complaint database, fraud determination, legal liability determination, court judgment, administrative penalty amount, credit rating, real-time operating status, consumer advice, investment signal, blacklist, legal advice, or official endorsement.

Animal hospital directory data is for lookup, district distribution, and public-data exploration only. It does not represent medical quality, real-time operating status, emergency service, pricing, veterinarian schedules, recommendation, medical advice, or official endorsement. Responsible-person names are shown only in source details.
