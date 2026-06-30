import { useEffect, useMemo, useState } from 'react';
import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet';
import {
  buildCivicGroupSummary, CATEGORIES, DISTRICTS, filterCivicGroups, formatFoundedDate, getCategoryLabel,
} from './lib/civicGroups';
import RegisteredLaborUnionsModule from './RegisteredLaborUnionsModule';
import QuasiPublicInfantCareCentersModule from './QuasiPublicInfantCareCentersModule';
import TaipeiTravelAccommodationsZhModule from './TaipeiTravelAccommodationsZhModule';
import PerformingArtsGroupsModule from './PerformingArtsGroupsModule';
import ContractedVaccinationMedicalProvidersModule from './ContractedVaccinationMedicalProvidersModule';
import TelepsychologyCounselingInstitutionsModule from './TelepsychologyCounselingInstitutionsModule';
import BusinessPremisesPublicLiabilityInsuranceModule from './BusinessPremisesPublicLiabilityInsuranceModule';
import IndustryModule from './IndustryModule';
import MetroProcurementModule from './MetroProcurementModule';
import RegisteredCramSchoolsModule from './RegisteredCramSchoolsModule';
import RegisteredHotelsModule from './RegisteredHotelsModule';
import LaborStandardActViolationsModule from './LaborStandardActViolationsModule';
import NangangSoftwareParkCompaniesModule from './NangangSoftwareParkCompaniesModule';
import RegisteredAnimalHospitalsModule from './RegisteredAnimalHospitalsModule';
import DistrictComparison from './DistrictComparison';
import type {
  CivicGroup, CivicGroupFilters, CivicGroupSummary, IndustryGrantRecipient, IndustryGrantSummary, Language,
  MetroProcurementScheduleRecord, MetroProcurementScheduleSummary, RegisteredCramSchool, RegisteredCramSchoolSummary,
  RegisteredHotel, RegisteredHotelSummary, LaborStandardActViolationManifest, LaborStandardActViolationSummary, NangangSoftwareParkCompany, NangangSoftwareParkCompanySummary,
  QuasiPublicInfantCareCenter, QuasiPublicInfantCareCenterSummary, RegisteredAnimalHospital, RegisteredAnimalHospitalSummary, RegisteredLaborUnion, RegisteredLaborUnionSummary,
  TaipeiTravelAccommodationZhRecord, TaipeiTravelAccommodationZhSummary, PerformingArtsGroupRecord, PerformingArtsGroupSummary,
  BusinessPremisesPublicLiabilityInsuranceRecord, BusinessPremisesPublicLiabilityInsuranceSummary, ContractedVaccinationMedicalProviderRecord, ContractedVaccinationMedicalProviderSummary, TelepsychologyCounselingInstitutionRecord, TelepsychologyCounselingInstitutionSummary,
} from './types';

const copy = {
  zh: {
    title: '台北公共登記與行政紀錄地圖', subtitle: '人民團體、演藝團體、工會、醫療與心理健康院所、公共意外險、立案機構、旅宿、旅遊住宿、採購、補助、法規、產業園區、動物照護與兒童照護公開紀錄探索',
    civicGroups: '人民團體', performingArtsGroups: '演藝團體', vaccinationProviders: '預防接種院所', telepsychology: '通訊心理諮商', publicLiabilityInsurance: '公共意外險', laborUnions: '工會名單', infantCareCenters: '準公共化托嬰中心', travelAccommodations: '旅遊住宿', industryGrants: '產業補助廠商', metroProcurement: '捷運採購時程', registeredCramSchools: '立案補習班', registeredHotels: '一般旅館名冊', laborViolations: '勞基法違規公布紀錄', nangangCompanies: '南港軟體工業園區廠商', animalHospitals: '動物醫院一覽表', comparison: '行政區比較',
    map: '團體地圖', directory: '團體名冊', overview: '資料概覽', notes: '資料說明',
    search: '搜尋團體名稱、地址、電話或關鍵字', district: '行政區', category: '推測分類',
    decade: '成立年代', phone: '電話資料', all: '全部', yes: '有電話', no: '無電話',
    from: '起始年份', to: '結束年份', clear: '清除篩選', found: '筆符合紀錄',
    address: '地址', phoneLabel: '電話', founded: '成立日期', source: '資料來源',
    mapNotice: '此地圖以行政區彙總呈現，並非各團體精確位置。',
    categoryNotice: '分類係依團體名稱關鍵字推測，並非資料來源提供之正式分類。',
    count: '團體數', top: '主要推測分類', view: '查看名冊', more: '載入更多',
    total: '人民團體總數', withDistrict: '可辨識行政區紀錄', withPhone: '有電話紀錄',
    withYear: '可解析成立年份紀錄', topDistrict: '團體數最多行政區', topCategory: '最多推測分類',
    oldest: '最早成立年份', newest: '最新成立年份', byDistrict: '各行政區人民團體數',
    byDecade: '各成立年代人民團體數', byYear: '各成立年份人民團體數',
    byCategory: '各推測分類人民團體數', phoneAvailability: '電話資料有無', districtAvailability: '行政區辨識狀態',
    disclaimer: '本網站呈現臺北市公開資料中的人民團體名冊。地址、電話與團體狀態請以主管機關公告及團體實際資訊為準。本網站以行政區彙總呈現地圖，不代表各團體精確位置。推測分類係依團體名稱關鍵字產生，並非資料來源提供之正式分類。',
    method: '資料處理方式', methodText: '地址僅比對臺北市 12 個行政區名稱；成立日期支援民國及西元格式；分類僅依團體名稱關鍵字推測。無法解析的原始值仍保留於名冊。',
    fields: '欄位對照', updated: '資料轉換時間', noResults: '沒有符合條件的紀錄。',
    loading: '資料載入中…', loadError: '資料載入失敗，請重新整理頁面。',
    footer: '資料來源：臺北市人民團體名冊、臺北市演藝團體名冊、臺北市各工會名單及聯絡方式、各項預防接種合約醫療院所、臺北市可執行通訊心理諮商之心理機構、臺北市營業場所投保公共意外險清冊、產業補助、捷運採購、立案補習班、一般旅館、臺北旅遊網住宿資料、勞基法違規公布、南港軟體工業園區廠商、臺北市動物醫院一覽表與臺北市準公共化托嬰中心等公開資料。各資料集性質不同，最新與正式資訊請以主管機關正式公告及官方系統為準。',
  },
  en: {
    title: 'Taipei Public Records Explorer', subtitle: 'Civic groups, performing-arts groups, labor unions, healthcare and mental-health providers, public liability insurance, registered institutions, lodging records, travel accommodations, procurement, grants, compliance, industry park, animal-care, and childcare public records explorer',
    civicGroups: 'Civic Groups', performingArtsGroups: 'Performing Arts', vaccinationProviders: 'Vaccination Providers', telepsychology: 'Telepsychology', publicLiabilityInsurance: 'Public Liability Insurance', laborUnions: 'Labor Unions', infantCareCenters: 'Quasi-Public Infant Care Centers', travelAccommodations: 'Travel Accommodations', industryGrants: 'Industry Grant Recipients', metroProcurement: 'Metro Procurement Schedule', registeredCramSchools: 'Registered Cram Schools', registeredHotels: 'Registered Hotels', laborViolations: 'Labor Standards Act Violation Records', nangangCompanies: 'Nangang Software Park Companies', animalHospitals: 'Registered Animal Hospitals', comparison: 'District Comparison',
    map: 'Group Map', directory: 'Group Directory', overview: 'Data Overview', notes: 'Data Notes',
    search: 'Search group name, address, phone, or keyword', district: 'District', category: 'Inferred category',
    decade: 'Founded decade', phone: 'Phone data', all: 'All', yes: 'Has phone', no: 'No phone',
    from: 'Year from', to: 'Year to', clear: 'Clear filters', found: 'matching records',
    address: 'Address', phoneLabel: 'Phone', founded: 'Founded date', source: 'Source',
    mapNotice: 'This map shows district-level summaries, not exact group locations.',
    categoryNotice: 'Categories are inferred from organization-name keywords and are not official categories provided by the data source.',
    count: 'Group count', top: 'Top inferred categories', view: 'View directory', more: 'Load more',
    total: 'Total civic groups', withDistrict: 'Records with district', withPhone: 'Records with phone',
    withYear: 'Records with founding year', topDistrict: 'Top district by group count', topCategory: 'Top inferred category',
    oldest: 'Oldest founding year', newest: 'Newest founding year', byDistrict: 'Civic groups by district',
    byDecade: 'Civic groups by founding decade', byYear: 'Civic groups by founding year',
    byCategory: 'Civic groups by inferred category', phoneAvailability: 'Phone availability', districtAvailability: 'District extraction availability',
    disclaimer: 'This site presents Taipei civic group directory records from public data. Addresses, phone numbers, and organization status should be verified with official sources and the organizations themselves. The map shows district-level summaries, not exact group locations. Inferred categories are generated from organization-name keywords and are not official categories provided by the data source.',
    method: 'Processing method', methodText: 'Addresses are matched only against Taipei’s 12 district names. Founding dates support ROC and Gregorian formats. Categories are inferred only from name keywords. Unparsed raw values remain in the directory.',
    fields: 'Field mapping', updated: 'Converted at', noResults: 'No records match these filters.',
    loading: 'Loading data…', loadError: 'Data failed to load. Please refresh the page.',
    footer: 'Data sources: Taipei civic groups, Taipei performing-arts group registry dataset, registered labor unions, Taipei contracted vaccination medical provider records, Taipei telepsychology counseling institution records, Taipei business premises public liability insurance records, industry grants, Metro procurement, registered cram schools, registered hotels, Taipei Travel accommodation dataset, Labor Standards Act violation publication records, Nangang Software Park company directory, Taipei animal hospital directory, Taipei quasi-public infant care center records, and related public data. These datasets have different meanings. Latest official information should be verified with authorities and official systems.',
  },
} as const;

const emptyFilters: CivicGroupFilters = {
  search: '', district: '', category: '', decade: '', yearFrom: '', yearTo: '', phone: '',
};

function BarChart({ data, label }: { data: Array<{ label: string; count: number }>; label: string }) {
  const max = Math.max(...data.map((item) => item.count), 1);
  return <section className="chart">
    <h3>{label}</h3>
    <div className="bars">
      {data.map((item) => <div className="bar-row" key={item.label}>
        <span title={item.label}>{item.label}</span>
        <div><i style={{ width: `${Math.max(2, item.count / max * 100)}%` }} /></div>
        <b>{item.count.toLocaleString()}</b>
      </div>)}
    </div>
  </section>;
}

function FilterPanel({ filters, setFilters, language, decades }: {
  filters: CivicGroupFilters; setFilters: (filters: CivicGroupFilters) => void;
  language: Language; decades: string[];
}) {
  const t = copy[language];
  const update = (key: keyof CivicGroupFilters, value: string) => setFilters({ ...filters, [key]: value });
  return <aside className="filters" aria-label={language === 'zh' ? '篩選條件' : 'Filters'}>
    <label className="search"><span aria-hidden="true">⌕</span><input aria-label={t.search} value={filters.search} onChange={(event) => update('search', event.target.value)} placeholder={t.search} /></label>
    <div className="filter-grid">
      <label>{t.district}<select value={filters.district} onChange={(event) => update('district', event.target.value)}>
        <option value="">{t.all}</option>{DISTRICTS.map((district) => <option key={district}>{district}</option>)}
      </select></label>
      <label>{t.category}<select value={filters.category} onChange={(event) => update('category', event.target.value)}>
        <option value="">{t.all}</option>{CATEGORIES.map((category) => <option value={category} key={category}>{getCategoryLabel(category, language)}</option>)}
      </select></label>
      <label>{t.decade}<select value={filters.decade} onChange={(event) => update('decade', event.target.value)}>
        <option value="">{t.all}</option>{decades.map((decade) => <option value={decade} key={decade}>{language === 'zh' ? decade.replace('s', '年代') : decade}</option>)}
      </select></label>
      <label>{t.phone}<select value={filters.phone} onChange={(event) => update('phone', event.target.value)}>
        <option value="">{t.all}</option><option value="yes">{t.yes}</option><option value="no">{t.no}</option>
      </select></label>
      <label>{t.from}<input type="number" inputMode="numeric" value={filters.yearFrom} onChange={(event) => update('yearFrom', event.target.value)} /></label>
      <label>{t.to}<input type="number" inputMode="numeric" value={filters.yearTo} onChange={(event) => update('yearTo', event.target.value)} /></label>
    </div>
    {Object.values(filters).some(Boolean) && <button className="text-button" onClick={() => setFilters(emptyFilters)}>{t.clear}</button>}
  </aside>;
}

function GroupDirectory({ groups, language }: { groups: CivicGroup[]; language: Language }) {
  const [limit, setLimit] = useState(60);
  const t = copy[language];
  useEffect(() => setLimit(60), [groups]);
  return <div className="directory-list">
    {groups.slice(0, limit).map((group) => <article className="group-row" key={group.id}>
      <div><p className="eyebrow">{group.district ?? (language === 'zh' ? '行政區未辨識' : 'District unavailable')}</p>
        <h3>{group.name}</h3><span className="tag">{getCategoryLabel(group.inferredCategory, language)}</span></div>
      <dl>
        <div><dt>{t.address}</dt><dd>{group.address ?? '—'}</dd></div>
        <div><dt>{t.phoneLabel}</dt><dd>{group.phone ? <a href={`tel:${group.phone}`}>{group.phone}</a> : '—'}</dd></div>
        <div><dt>{t.founded}</dt><dd>{formatFoundedDate(group, language)}{group.foundedYear ? ` · ${group.foundedYear}` : ''}</dd></div>
        <div><dt>{t.source}</dt><dd>{group.source}</dd></div>
      </dl>
    </article>)}
    {!groups.length && <p className="empty">{t.noResults}</p>}
    {limit < groups.length && <button className="load-more" onClick={() => setLimit(limit + 60)}>{t.more} · {groups.length - limit}</button>}
  </div>;
}

function CivicMap({ summary, language, openDistrict }: {
  summary: CivicGroupSummary; language: Language; openDistrict: (district: string) => void;
}) {
  const t = copy[language];
  return <div className="map-wrap">
    <div className="notice">{t.mapNotice}</div>
    <MapContainer center={[25.072, 121.54]} zoom={11} scrollWheelZoom={false}>
      <TileLayer attribution='&copy; OpenStreetMap contributors &copy; CARTO' url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
      {summary.districtSummaries.filter((district) => district.count).map((district) =>
        <CircleMarker key={district.district} center={[district.latitude, district.longitude]}
          radius={Math.max(10, Math.sqrt(district.count) * 1.15)}
          pathOptions={{ fillColor: '#d75b3f', fillOpacity: .72, color: '#fff7e8', weight: 2 }}>
          <Popup><div className="map-popup"><strong>{district.district}</strong>
            <p>{t.count}: {district.count.toLocaleString()}</p><p>{t.top}: {district.topCategories.map((item) => getCategoryLabel(item.category, language)).join('、')}</p>
            <button onClick={() => openDistrict(district.district)}>{t.view}</button></div></Popup>
        </CircleMarker>)}
    </MapContainer>
  </div>;
}

function Overview({ summary, groups, language }: { summary: CivicGroupSummary; groups: CivicGroup[]; language: Language }) {
  const t = copy[language];
  const years = groups.flatMap((group) => group.foundedYear ?? []);
  const topDistrict = summary.byDistrict[0];
  const topCategory = summary.byInferredCategory[0];
  const stats = [
    [t.total, summary.total], [t.withDistrict, summary.recordsWithDistrict], [t.withPhone, summary.recordsWithPhone],
    [t.withYear, summary.recordsWithFoundedYear], [t.topDistrict, topDistrict?.district ?? '—'],
    [t.topCategory, topCategory ? getCategoryLabel(topCategory.category, language) : '—'],
    [t.oldest, years.length ? Math.min(...years) : '—'], [t.newest, years.length ? Math.max(...years) : '—'],
  ];
  const chartYears = summary.byFoundedYear.filter((item) => item.year >= 1900);
  const bucket = Math.max(1, Math.ceil(chartYears.length / 30));
  const compressedYears = Array.from({ length: Math.ceil(chartYears.length / bucket) }, (_, index) => {
    const slice = chartYears.slice(index * bucket, (index + 1) * bucket);
    return { label: slice.length > 1 ? `${slice[0].year}–${slice.at(-1)!.year}` : String(slice[0]?.year), count: slice.reduce((sum, item) => sum + item.count, 0) };
  });
  return <>
    <div className="summary-grid">{stats.map(([label, value]) => <article key={label}><span>{label}</span><strong>{typeof value === 'number' ? value.toLocaleString() : value}</strong></article>)}</div>
    <div className="chart-grid">
      <BarChart label={t.byDistrict} data={summary.byDistrict.map((item) => ({ label: item.district, count: item.count }))} />
      <BarChart label={t.byDecade} data={summary.byFoundedDecade.map((item) => ({ label: language === 'zh' ? item.decade.replace('s', '年代') : item.decade, count: item.count }))} />
      <BarChart label={t.byCategory} data={summary.byInferredCategory.map((item) => ({ label: getCategoryLabel(item.category, language), count: item.count }))} />
      <BarChart label={t.byYear} data={compressedYears} />
      <BarChart label={t.phoneAvailability} data={[
        { label: t.withPhone, count: summary.recordsWithPhone },
        { label: language === 'zh' ? '無電話紀錄' : 'Without phone', count: summary.total - summary.recordsWithPhone },
      ]} />
      <BarChart label={t.districtAvailability} data={[
        { label: t.withDistrict, count: summary.recordsWithDistrict },
        { label: language === 'zh' ? '無法辨識行政區' : 'Without district', count: summary.recordsWithoutDistrict },
      ]} />
    </div>
  </>;
}

function CombinedOverview({ civic, performingArts, vaccinationProviders, telepsychology, publicLiabilityInsurance, laborUnions, infantCare, travelAccommodations, grants, procurement, cramSchools, hotels, laborViolations, nangangCompanies, animalHospitals, language }: {
  civic: CivicGroupSummary; performingArts: PerformingArtsGroupSummary; vaccinationProviders: ContractedVaccinationMedicalProviderSummary; telepsychology: TelepsychologyCounselingInstitutionSummary; publicLiabilityInsurance: BusinessPremisesPublicLiabilityInsuranceSummary; laborUnions: RegisteredLaborUnionSummary; infantCare: QuasiPublicInfantCareCenterSummary; travelAccommodations: TaipeiTravelAccommodationZhSummary; grants: IndustryGrantSummary; procurement: MetroProcurementScheduleSummary; cramSchools: RegisteredCramSchoolSummary; hotels: RegisteredHotelSummary; laborViolations: LaborStandardActViolationSummary; nangangCompanies: NangangSoftwareParkCompanySummary; animalHospitals: RegisteredAnimalHospitalSummary; language: Language;
}) {
  const zh = language === 'zh';
  return <section className="workspace"><div className="section-heading"><p>08 / PUBLIC RECORDS OVERVIEW</p><h2>{zh ? '資料概覽' : 'Data Overview'}</h2></div>
    <div className="notice subtle">{zh ? '此圖僅比較公開資料中的紀錄數與來源欄位，不代表資料重要性、政策成效、法律狀態、會員資格、醫療品質、即時營業狀態、推薦程度或官方背書。' : 'This chart only compares public-data record counts and source fields. It does not represent data importance, policy effectiveness, legal status, membership eligibility, medical quality, real-time operating status, recommendation, or official endorsement.'}</div>
    <div className="summary-grid"><article><span>{zh ? '人民團體紀錄' : 'Civic group records'}</span><strong>{civic.total.toLocaleString()}</strong></article>
      <article><span>{zh ? '演藝團體數' : 'Performing arts group count'}</span><strong>{performingArts.totalRecords.toLocaleString()}</strong></article>
      <article><span>{zh ? '演藝團體有網址紀錄' : 'Performing arts records with website'}</span><strong>{performingArts.recordsWithWebsite.toLocaleString()}</strong></article>
      <article><span>{zh ? '預防接種合約院所數' : 'Vaccination provider records'}</span><strong>{vaccinationProviders.totalRecords.toLocaleString()}</strong></article>
      <article><span>{zh ? 'COVID-19院所數' : 'COVID-19 provider count'}</span><strong>{vaccinationProviders.providerCategorySummary.covidProviderCount.toLocaleString()}</strong></article>
      <article><span>{zh ? '通訊心理諮商機構數' : 'Telepsychology institution count'}</span><strong>{telepsychology.totalRecords.toLocaleString()}</strong></article>
      <article><span>{zh ? '有手機心理機構紀錄' : 'Mental-health records with mobile'}</span><strong>{telepsychology.recordsWithMobile.toLocaleString()}</strong></article>
      <article><span>{zh ? '公共意外險清冊紀錄' : 'Public liability insurance records'}</span><strong>{publicLiabilityInsurance.totalRecords.toLocaleString()}</strong></article>
      <article><span>{zh ? '公共意外險有效座標' : 'Insurance records with coordinates'}</span><strong>{publicLiabilityInsurance.recordsWithValidCoordinates.toLocaleString()}</strong></article>
      <article><span>{zh ? '工會名單紀錄' : 'Labor union records'}</span><strong>{laborUnions.totalRecords.toLocaleString()}</strong></article>
      <article><span>{zh ? '托嬰中心數' : 'Infant care centers'}</span><strong>{infantCare.totalRecords.toLocaleString()}</strong></article>
      <article><span>{zh ? '核定收托人數總計' : 'Total approved capacity'}</span><strong>{infantCare.totalApprovedCapacity?.toLocaleString() ?? '—'}</strong></article>
      <article><span>{zh ? '臺北旅遊網住宿紀錄' : 'Taipei Travel accommodation records'}</span><strong>{travelAccommodations.totalRecords.toLocaleString()}</strong></article>
      <article><span>{zh ? '表列房間數總計' : 'Listed total room count'}</span><strong>{travelAccommodations.totalRoomCount?.toLocaleString() ?? '—'}</strong></article>
      <article><span>{zh ? '補助紀錄' : 'Subsidy records'}</span><strong>{grants.totalRecords.toLocaleString()}</strong></article>
      <article><span>{zh ? '獲補助廠商' : 'Grant recipient companies'}</span><strong>{grants.uniqueCompanyCount.toLocaleString()}</strong></article>
      <article><span>{zh ? '捷運採購時程紀錄' : 'Metro procurement schedule records'}</span><strong>{procurement.totalRecords.toLocaleString()}</strong></article>
      <article><span>{zh ? '立案補習班紀錄' : 'Registered cram-school records'}</span><strong>{cramSchools.totalRecords.toLocaleString()}</strong></article>
      <article><span>{zh ? '一般旅館登記紀錄' : 'Registered hotel records'}</span><strong>{hotels.totalRecords.toLocaleString()}</strong></article>
      <article><span>{zh ? '勞基法違規公布紀錄' : 'Labor violation publication records'}</span><strong>{laborViolations.totalRecords.toLocaleString()}</strong></article></div>
    <div className="summary-grid"><article><span>{zh ? '園區廠商紀錄' : 'Industry park company records'}</span><strong>{nangangCompanies.totalRecords.toLocaleString()}</strong></article><article><span>{zh ? '園區有效座標' : 'Valid park coordinates'}</span><strong>{nangangCompanies.recordsWithValidCoordinates.toLocaleString()}</strong></article><article><span>{zh ? '動物醫院數' : 'Animal hospital count'}</span><strong>{animalHospitals.totalRecords.toLocaleString()}</strong></article><article><span>{zh ? '動物醫院最多行政區' : 'Top animal-hospital district'}</span><strong>{animalHospitals.byDistrict[0]?.district ?? '—'}</strong></article></div>
    <div className="chart-grid"><BarChart label={zh ? '各行政區人民團體數' : 'Civic groups by district'} data={civic.byDistrict.map((item) => ({ label: item.district, count: item.count }))} />
      <BarChart label={zh ? '各行政區演藝團體數' : 'Performing arts groups by district'} data={performingArts.byDistrict.map((item) => ({ label: item.district, count: item.groupCount }))} />
      <BarChart label={zh ? '各行政區預防接種合約院所數' : 'Vaccination providers by district'} data={vaccinationProviders.byDistrict.map((item) => ({ label: item.district, count: item.providerCount }))} />
      <BarChart label={zh ? '各行政區通訊心理諮商機構數' : 'Telepsychology institutions by district'} data={telepsychology.byDistrict.map((item) => ({ label: item.district, count: item.institutionCount }))} />
      <BarChart label={zh ? '各行政區公共意外險清冊紀錄數' : 'Public liability insurance records by district'} data={publicLiabilityInsurance.byDistrict.map((item) => ({ label: item.district, count: item.recordCount }))} />
      <BarChart label={zh ? '各申請類別演藝團體數' : 'Performing arts groups by application category'} data={performingArts.byApplicationCategory.map((item) => ({ label: item.applicationCategoryRaw ?? item.applicationCategory, count: item.count }))} />
      <BarChart label={zh ? '各行政區工會數' : 'Labor unions by district'} data={laborUnions.byDistrict.map((item) => ({ label: item.district, count: item.count }))} />
      <BarChart label={zh ? '各行政區托嬰中心數' : 'Infant care centers by district'} data={infantCare.byDistrict.map((item) => ({ label: item.district, count: item.centerCount }))} />
      <BarChart label={zh ? '各行政區旅遊住宿數' : 'Travel accommodations by district'} data={travelAccommodations.byDistrict.map((item) => ({ label: item.district, count: item.accommodationCount }))} />
      <BarChart label={zh ? '各行政區補助紀錄數' : 'Grant records by district'} data={grants.byDistrict.map((item) => ({ label: item.district, count: item.recordCount }))} />
      <BarChart label={zh ? '各行政區立案補習班數' : 'Registered cram schools by district'} data={cramSchools.byDistrict.map((item) => ({ label: item.district, count: item.recordCount }))} />
      <BarChart label={zh ? '各行政區一般旅館數' : 'Registered hotels by district'} data={hotels.byDistrict.map((item) => ({ label: item.district, count: item.recordCount }))} />
      <BarChart label={zh ? '各行政區動物醫院數' : 'Animal hospitals by district'} data={animalHospitals.byDistrict.map((item) => ({ label: item.district, count: item.count }))} />
      <BarChart label={zh ? '不同公開資料模組紀錄數' : 'Record count by public-data module'} data={[
        { label: zh ? '人民團體' : 'Civic groups', count: civic.total },
        { label: zh ? '演藝團體' : 'Performing arts groups', count: performingArts.totalRecords },
        { label: zh ? '預防接種院所' : 'Vaccination providers', count: vaccinationProviders.totalRecords },
        { label: zh ? '通訊心理諮商' : 'Telepsychology', count: telepsychology.totalRecords },
        { label: zh ? '公共意外險' : 'Public liability insurance', count: publicLiabilityInsurance.totalRecords },
        { label: zh ? '工會名單' : 'Labor unions', count: laborUnions.totalRecords },
        { label: zh ? '托嬰中心' : 'Infant care centers', count: infantCare.totalRecords },
        { label: zh ? '旅遊住宿' : 'Travel accommodations', count: travelAccommodations.totalRecords },
        { label: zh ? '產業補助' : 'Industry grants', count: grants.totalRecords },
        { label: zh ? '捷運採購時程' : 'Metro procurement', count: procurement.totalRecords },
        { label: zh ? '立案補習班' : 'Registered cram schools', count: cramSchools.totalRecords },
        { label: zh ? '一般旅館名冊' : 'Registered hotels', count: hotels.totalRecords },
        { label: zh ? '勞基法違規公布' : 'Labor violations', count: laborViolations.totalRecords },
        { label: zh ? '南港軟體園區廠商' : 'Nangang park companies', count: nangangCompanies.totalRecords },
        { label: zh ? '動物醫院' : 'Animal hospitals', count: animalHospitals.totalRecords },
      ]} /></div>
  </section>;
}

export default function App() {
  const [language, setLanguage] = useState<Language>('zh');
  const [tab, setTab] = useState<'civic' | 'performingArts' | 'vaccinationProviders' | 'telepsychology' | 'publicLiabilityInsurance' | 'laborUnions' | 'infantCare' | 'travelAccommodations' | 'grants' | 'procurement' | 'cramSchools' | 'hotels' | 'laborViolations' | 'nangangCompanies' | 'animalHospitals' | 'comparison' | 'overview' | 'notes'>('civic');
  const [civicView, setCivicView] = useState<'map' | 'directory' | 'overview'>('map');
  const [groups, setGroups] = useState<CivicGroup[]>([]);
  const [summary, setSummary] = useState<CivicGroupSummary | null>(null);
  const [performingArtsRecords, setPerformingArtsRecords] = useState<PerformingArtsGroupRecord[]>([]);
  const [performingArtsSummary, setPerformingArtsSummary] = useState<PerformingArtsGroupSummary | null>(null);
  const [vaccinationProviderRecords, setVaccinationProviderRecords] = useState<ContractedVaccinationMedicalProviderRecord[]>([]);
  const [vaccinationProviderSummary, setVaccinationProviderSummary] = useState<ContractedVaccinationMedicalProviderSummary | null>(null);
  const [telepsychologyRecords, setTelepsychologyRecords] = useState<TelepsychologyCounselingInstitutionRecord[]>([]);
  const [telepsychologySummary, setTelepsychologySummary] = useState<TelepsychologyCounselingInstitutionSummary | null>(null);
  const [publicLiabilityRecords, setPublicLiabilityRecords] = useState<BusinessPremisesPublicLiabilityInsuranceRecord[]>([]);
  const [publicLiabilitySummary, setPublicLiabilitySummary] = useState<BusinessPremisesPublicLiabilityInsuranceSummary | null>(null);
  const [laborUnionRecords, setLaborUnionRecords] = useState<RegisteredLaborUnion[]>([]);
  const [laborUnionSummary, setLaborUnionSummary] = useState<RegisteredLaborUnionSummary | null>(null);
  const [infantCareRecords, setInfantCareRecords] = useState<QuasiPublicInfantCareCenter[]>([]);
  const [infantCareSummary, setInfantCareSummary] = useState<QuasiPublicInfantCareCenterSummary | null>(null);
  const [travelAccommodationRecords, setTravelAccommodationRecords] = useState<TaipeiTravelAccommodationZhRecord[]>([]);
  const [travelAccommodationSummary, setTravelAccommodationSummary] = useState<TaipeiTravelAccommodationZhSummary | null>(null);
  const [grantRecords, setGrantRecords] = useState<IndustryGrantRecipient[]>([]);
  const [grantSummary, setGrantSummary] = useState<IndustryGrantSummary | null>(null);
  const [procurementRecords, setProcurementRecords] = useState<MetroProcurementScheduleRecord[]>([]);
  const [procurementSummary, setProcurementSummary] = useState<MetroProcurementScheduleSummary | null>(null);
  const [cramSchoolRecords, setCramSchoolRecords] = useState<RegisteredCramSchool[]>([]);
  const [cramSchoolSummary, setCramSchoolSummary] = useState<RegisteredCramSchoolSummary | null>(null);
  const [hotelRecords, setHotelRecords] = useState<RegisteredHotel[]>([]);
  const [hotelSummary, setHotelSummary] = useState<RegisteredHotelSummary | null>(null);
  const [laborViolationSummary, setLaborViolationSummary] = useState<LaborStandardActViolationSummary | null>(null);
  const [laborViolationManifest, setLaborViolationManifest] = useState<LaborStandardActViolationManifest | null>(null);
  const [nangangCompanyRecords, setNangangCompanyRecords] = useState<NangangSoftwareParkCompany[]>([]);
  const [nangangCompanySummary, setNangangCompanySummary] = useState<NangangSoftwareParkCompanySummary | null>(null);
  const [animalHospitalRecords, setAnimalHospitalRecords] = useState<RegisteredAnimalHospital[]>([]);
  const [animalHospitalSummary, setAnimalHospitalSummary] = useState<RegisteredAnimalHospitalSummary | null>(null);
  const [report, setReport] = useState<{
    convertedAt?: string; performingArtsGroups?: { convertedAt?: string }; contractedVaccinationMedicalProviders?: { convertedAt?: string }; telepsychologyCounselingInstitutions?: { convertedAt?: string }; businessPremisesPublicLiabilityInsuranceRecords?: { convertedAt?: string }; registeredLaborUnions?: { convertedAt?: string }; quasiPublicInfantCareCenters?: { convertedAt?: string }; taipeiTravelAccommodationsZh?: { convertedAt?: string }; industryGrantRecipients?: { convertedAt?: string }; metroProcurementSchedules?: { convertedAt?: string }; registeredCramSchools?: { convertedAt?: string }; registeredHotels?: { convertedAt?: string }; laborStandardActViolationRecords?: { convertedAt?: string }; nangangSoftwareParkCompanies?: { convertedAt?: string }; registeredAnimalHospitals?: { convertedAt?: string };
  }>({});
  const [filters, setFilters] = useState(emptyFilters);
  const [loadError, setLoadError] = useState(false);
  const t = copy[language];

  useEffect(() => {
    const loadJson = async (path: string) => {
      const response = await fetch(`${import.meta.env.BASE_URL}${path}`);
      if (!response.ok) throw new Error(`${path}: ${response.status}`);
      return response.json();
    };
    Promise.all([
      loadJson('data/civic-groups.json'),
      loadJson('data/civic-group-summary.json'),
      loadJson('data/performing-arts-groups.json'),
      loadJson('data/performing-arts-group-summary.json'),
      loadJson('data/contracted-vaccination-medical-providers.json'),
      loadJson('data/contracted-vaccination-medical-provider-summary.json'),
      loadJson('data/telepsychology-counseling-institutions.json'),
      loadJson('data/telepsychology-counseling-institution-summary.json'),
      loadJson('data/business-premises-public-liability-insurance-records.json'),
      loadJson('data/business-premises-public-liability-insurance-summary.json'),
      loadJson('data/registered-labor-unions.json'),
      loadJson('data/registered-labor-union-summary.json'),
      loadJson('data/quasi-public-infant-care-centers.json'),
      loadJson('data/quasi-public-infant-care-center-summary.json'),
      loadJson('data/taipei-travel-accommodations-zh.json'),
      loadJson('data/taipei-travel-accommodation-zh-summary.json'),
      loadJson('data/industry-grant-recipients.json'),
      loadJson('data/industry-grant-summary.json'),
      loadJson('data/metro-procurement-schedules.json'),
      loadJson('data/metro-procurement-summary.json'),
      loadJson('data/registered-cram-schools.json'),
      loadJson('data/registered-cram-school-summary.json'),
      loadJson('data/registered-hotels.json'),
      loadJson('data/registered-hotel-summary.json'),
      loadJson('data/labor-standard-act-violation-summary.json'),
      loadJson('data/labor-standard-act-violation-records/manifest.json'),
      loadJson('data/nangang-software-park-companies.json'),
      loadJson('data/nangang-software-park-company-summary.json'),
      loadJson('data/registered-animal-hospitals.json'),
      loadJson('data/registered-animal-hospital-summary.json'),
      loadJson('data/conversion-report.json'),
    ]).then(([groupData, summaryData, performingArtsData, performingArtsSummaryData, vaccinationProviderData, vaccinationProviderSummaryData, telepsychologyData, telepsychologySummaryData, publicLiabilityData, publicLiabilitySummaryData, laborUnionData, laborUnionSummaryData, infantCareData, infantCareSummaryData, travelData, travelSummaryData, grantData, grantSummaryData, procurementData, procurementSummaryData, cramSchoolData, cramSchoolSummaryData, hotelData, hotelSummaryData, laborSummaryData, laborManifestData, nangangData, nangangSummaryData, animalData, animalSummaryData, reportData]) => {
      setGroups(groupData); setSummary(summaryData); setGrantRecords(grantData); setGrantSummary(grantSummaryData);
      setPerformingArtsRecords(performingArtsData); setPerformingArtsSummary(performingArtsSummaryData);
      setVaccinationProviderRecords(vaccinationProviderData); setVaccinationProviderSummary(vaccinationProviderSummaryData);
      setTelepsychologyRecords(telepsychologyData); setTelepsychologySummary(telepsychologySummaryData);
      setPublicLiabilityRecords(publicLiabilityData); setPublicLiabilitySummary(publicLiabilitySummaryData);
      setLaborUnionRecords(laborUnionData); setLaborUnionSummary(laborUnionSummaryData);
      setInfantCareRecords(infantCareData); setInfantCareSummary(infantCareSummaryData);
      setTravelAccommodationRecords(travelData); setTravelAccommodationSummary(travelSummaryData);
      setProcurementRecords(procurementData); setProcurementSummary(procurementSummaryData);
      setCramSchoolRecords(cramSchoolData); setCramSchoolSummary(cramSchoolSummaryData);
      setHotelRecords(hotelData); setHotelSummary(hotelSummaryData);
      setLaborViolationSummary(laborSummaryData); setLaborViolationManifest(laborManifestData); setReport(reportData);
      setNangangCompanyRecords(nangangData); setNangangCompanySummary(nangangSummaryData);
      setAnimalHospitalRecords(animalData); setAnimalHospitalSummary(animalSummaryData);
    }).catch(() => setLoadError(true));
  }, []);

  useEffect(() => {
    document.documentElement.lang = language === 'zh' ? 'zh-Hant' : 'en';
    document.title = t.title;
  }, [language, t.title]);

  const filtered = useMemo(() => filterCivicGroups(groups, filters, language), [groups, filters, language]);
  const hasFilters = Object.values(filters).some(Boolean);
  const activeSummary = useMemo(
    () => summary && hasFilters ? buildCivicGroupSummary(filtered) : summary,
    [filtered, hasFilters, summary],
  );
  const decades = useMemo(() => [...new Set(groups.flatMap((group) => group.foundedDecade ?? []))].sort(), [groups]);
  const openDistrict = (district: string) => { setFilters({ ...emptyFilters, district }); setCivicView('directory'); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const tabs = [
    ['civic', t.civicGroups], ['performingArts', t.performingArtsGroups], ['vaccinationProviders', t.vaccinationProviders], ['telepsychology', t.telepsychology], ['publicLiabilityInsurance', t.publicLiabilityInsurance], ['laborUnions', t.laborUnions], ['infantCare', t.infantCareCenters], ['travelAccommodations', t.travelAccommodations], ['grants', t.industryGrants], ['procurement', t.metroProcurement],
    ['cramSchools', t.registeredCramSchools], ['hotels', t.registeredHotels], ['laborViolations', t.laborViolations], ['nangangCompanies', t.nangangCompanies],
    ['animalHospitals', t.animalHospitals],
    ['comparison', t.comparison], ['overview', t.overview], ['notes', t.notes],
  ] as const;
  const civicViews = [['map', t.map], ['directory', t.directory], ['overview', t.overview]] as const;

  return <div className="app">
    <header>
      <div className="masthead"><div className="brand-mark">北</div><div><p>TAIPEI · OPEN DIRECTORY</p><h1>{t.title}</h1><span>{t.subtitle}</span></div>
        <button className="language" onClick={() => setLanguage(language === 'zh' ? 'en' : 'zh')} aria-label="Switch language">{language === 'zh' ? 'EN' : '中文'}</button></div>
      <nav aria-label={language === 'zh' ? '主要導覽' : 'Main navigation'}>{tabs.map(([id, label]) => <button aria-pressed={tab === id} className={tab === id ? 'active' : ''} onClick={() => setTab(id)} key={id}>{label}</button>)}</nav>
    </header>
    <main>
      {loadError && <p className="status" role="alert">{t.loadError}</p>}
      {!loadError && (!summary || !performingArtsSummary || !vaccinationProviderSummary || !telepsychologySummary || !publicLiabilitySummary || !laborUnionSummary || !infantCareSummary || !travelAccommodationSummary || !grantSummary || !procurementSummary || !cramSchoolSummary || !hotelSummary || !laborViolationSummary || !laborViolationManifest || !nangangCompanySummary || !animalHospitalSummary) && <p className="status" role="status">{t.loading}</p>}
      {tab === 'civic' && summary && <><FilterPanel filters={filters} setFilters={setFilters} language={language} decades={decades} /><section className="workspace civic-header"><div className="section-heading"><p>01 / CIVIC GROUPS</p><h2>{t.civicGroups}</h2></div>
        <div className="subtabs">{civicViews.map(([id, label]) => <button className={civicView === id ? 'active' : ''} onClick={() => setCivicView(id)} key={id}>{label}</button>)}</div>
        {civicView === 'map' && activeSummary && <CivicMap summary={activeSummary} language={language} openDistrict={openDistrict} />}
        {civicView === 'directory' && <><div className="section-heading inline"><div /><strong>{filtered.length.toLocaleString()} <span>{t.found}</span></strong></div><div className="notice subtle">{t.categoryNotice}</div><GroupDirectory groups={filtered} language={language} /></>}
        {civicView === 'overview' && activeSummary && <Overview summary={activeSummary} groups={hasFilters ? filtered : groups} language={language} />}</section></>}
      {tab === 'performingArts' && performingArtsSummary && <PerformingArtsGroupsModule records={performingArtsRecords} summary={performingArtsSummary} civicSummary={summary ?? undefined} language={language} />}
      {tab === 'vaccinationProviders' && vaccinationProviderSummary && <ContractedVaccinationMedicalProvidersModule records={vaccinationProviderRecords} summary={vaccinationProviderSummary} language={language} />}
      {tab === 'telepsychology' && telepsychologySummary && <TelepsychologyCounselingInstitutionsModule records={telepsychologyRecords} summary={telepsychologySummary} language={language} />}
      {tab === 'publicLiabilityInsurance' && publicLiabilitySummary && <BusinessPremisesPublicLiabilityInsuranceModule records={publicLiabilityRecords} summary={publicLiabilitySummary} language={language} />}
      {tab === 'laborUnions' && laborUnionSummary && <RegisteredLaborUnionsModule records={laborUnionRecords} summary={laborUnionSummary} language={language} />}
      {tab === 'infantCare' && infantCareSummary && <QuasiPublicInfantCareCentersModule records={infantCareRecords} summary={infantCareSummary} language={language} />}
      {tab === 'travelAccommodations' && travelAccommodationSummary && <TaipeiTravelAccommodationsZhModule records={travelAccommodationRecords} summary={travelAccommodationSummary} registeredHotelSummary={hotelSummary ?? undefined} language={language} />}
      {tab === 'grants' && grantSummary && <IndustryModule records={grantRecords} summary={grantSummary} language={language} />}
      {tab === 'procurement' && procurementSummary && <MetroProcurementModule records={procurementRecords} summary={procurementSummary} language={language} />}
      {tab === 'cramSchools' && cramSchoolSummary && <RegisteredCramSchoolsModule records={cramSchoolRecords} summary={cramSchoolSummary} language={language} />}
      {tab === 'hotels' && hotelSummary && <RegisteredHotelsModule records={hotelRecords} summary={hotelSummary} language={language} />}
      {tab === 'laborViolations' && laborViolationSummary && laborViolationManifest && <LaborStandardActViolationsModule summary={laborViolationSummary} manifest={laborViolationManifest} language={language} />}
      {tab === 'nangangCompanies' && nangangCompanySummary && <NangangSoftwareParkCompaniesModule records={nangangCompanyRecords} summary={nangangCompanySummary} language={language} />}
      {tab === 'animalHospitals' && animalHospitalSummary && <RegisteredAnimalHospitalsModule records={animalHospitalRecords} summary={animalHospitalSummary} language={language} />}
      {tab === 'comparison' && summary && grantSummary && <DistrictComparison groups={groups} civicSummary={summary} grants={grantRecords} grantSummary={grantSummary} language={language} />}
      {tab === 'overview' && summary && performingArtsSummary && vaccinationProviderSummary && telepsychologySummary && publicLiabilitySummary && laborUnionSummary && infantCareSummary && travelAccommodationSummary && grantSummary && procurementSummary && cramSchoolSummary && hotelSummary && laborViolationSummary && nangangCompanySummary && animalHospitalSummary && <CombinedOverview civic={summary} performingArts={performingArtsSummary} vaccinationProviders={vaccinationProviderSummary} telepsychology={telepsychologySummary} publicLiabilityInsurance={publicLiabilitySummary} laborUnions={laborUnionSummary} infantCare={infantCareSummary} travelAccommodations={travelAccommodationSummary} grants={grantSummary} procurement={procurementSummary} cramSchools={cramSchoolSummary} hotels={hotelSummary} laborViolations={laborViolationSummary} nangangCompanies={nangangCompanySummary} animalHospitals={animalHospitalSummary} language={language} />}
      {tab === 'notes' && <section className="workspace notes"><div className="section-heading"><p>09 / METHODOLOGY</p><h2>{t.notes}</h2></div>
        <blockquote>{language === 'zh' ? '本網站整理臺北市公開資料中的人民團體名冊、演藝團體名冊、各工會名單及聯絡方式、各項預防接種合約醫療院所、可執行通訊心理諮商之心理機構、營業場所投保公共意外險清冊、產業補助廠商資料、捷運採購案件預定招標時程、立案補習班資訊、一般旅館名冊、臺北旅遊網住宿資料、勞基法違規公布紀錄、南港軟體工業園區廠商資料、動物醫院一覽表、準公共化托嬰中心等公開資料，僅供資料探索與整理使用。各資料集性質不同，不應直接解讀為相同類型組織或活動。保險、醫療、心理健康與預防接種相關資料不代表即時營業狀態、保單即時有效狀態、完整保險內容、即時門診時間、即時預約名額、疫苗庫存、接種資格、醫療建議、心理治療建議、危機處理服務、場所安全保證、推薦排名、法律意見、保險建議或官方背書。' : 'This site organizes Taipei public-data records such as civic group directory records, performing-arts group registry records, registered labor union records, contracted vaccination medical provider records, telepsychology counseling institution records, industry grant recipient records, Taipei Metro planned procurement tender schedules, registered cram-school records, registered hotel records, Taipei Travel accommodation records, Labor Standards Act violation publication records, Nangang Software Park company records, animal hospital directory records, quasi-public infant care center records, and related public records for data exploration and organization only. These datasets have different meanings and should not be interpreted as the same type of organization or activity. Insurance, healthcare, mental-health, and vaccination-related data does not represent real-time operating status, real-time policy validity, complete insurance terms, real-time clinic hours, real-time appointment availability, vaccine stock, vaccination eligibility, medical advice, psychotherapy advice, crisis intervention service, venue safety guarantee, recommendation ranking, legal advice, insurance advice, or official endorsement.'}</blockquote>
        <div className="notes-grid"><article><h3>{t.method}</h3><p>{t.methodText}</p></article>
          <article><h3>{t.fields}</h3><p>機關代碼 → agencyCode<br />名稱 → name<br />地址 → address<br />電話 → phone<br />成立日期 → foundedDateRaw</p></article>
          <article><h3>{language === 'zh' ? '演藝團體名冊' : 'Performing-arts group registry'}</h3><p>{language === 'zh' ? '演藝團體名冊提供臺北市演藝團體登記名冊，欄位包含演藝團體名稱、申請類別、立案字號、主管機關、主管機關代碼、團址與網址。本網站將團址解析為行政區與道路名稱，並依申請類別、行政區、主管機關與網址有無整理統計。資料未提供官方經緯度，因此預設不顯示精確點位。' : 'The performing-arts group directory provides Taipei performing-arts group registry records. Fields include performing-arts group name, application category, registration number, competent authority, competent authority code, registered address, and website. This site parses registered addresses into district and road name and organizes statistics by application category, district, competent authority, and website availability. The data does not provide official coordinates, so exact points are not shown by default.'}</p></article>
          <article><h3>{language === 'zh' ? '預防接種合約醫療院所' : 'Contracted vaccination providers'}</h3><p>{language === 'zh' ? '資料提供臺北市合約院所名冊，欄位包含序號、行政區、院所名稱、各項預防接種服務欄位、地址、電話與語音預約。本網站將地址解析為行政區與道路名稱，並將各接種服務欄位轉換為篩選用服務項目。資料未提供官方經緯度，因此預設不顯示精確點位。' : 'The data provides Taipei contracted provider directory records with sequence number, district, provider name, vaccination service fields, address, phone, and voice reservation. This site parses addresses into district and road name and converts vaccination service fields into filterable service items. The data does not provide official coordinates, so exact points are not shown by default.'}</p></article>
          <article><h3>{language === 'zh' ? '可執行通訊心理諮商之心理機構' : 'Telepsychology counseling institutions'}</h3><p>{language === 'zh' ? '資料提供臺北市可執行通訊心理諮商業務之心理治療所、諮商所、基金會與學校名冊，欄位包含序號、機構類型、行政區、機構名稱、地址、電話、分機與手機。本網站解析行政區與道路名稱，並整理機構類型與聯絡欄位。資料未提供官方經緯度，因此預設不顯示精確點位，也不作醫療建議、心理治療建議、危機服務、預約、收費、保險、推薦或品質判斷。' : 'The data provides Taipei records for psychological treatment clinics, counseling clinics, foundations, and schools permitted to perform communication-based psychological counseling. Fields include sequence number, institution type, district, institution name, address, phone, extension, and mobile. This site parses district and road name and organizes institution type and contact fields. It has no official coordinates, so exact points are not shown, and the site does not provide medical advice, psychotherapy advice, crisis service, appointment, fee, insurance, recommendation, or quality judgments.'}</p></article>
          <article><h3>{language === 'zh' ? '營業場所投保公共意外險清冊' : 'Business premises public liability insurance records'}</h3><p>{language === 'zh' ? '資料提供臺北市公司／商業登記投保公共意外責任險公開資料，欄位包含序號、統一立案編號、類別、名稱、營業地址、保單到期日、經度與緯度。本網站依來源座標顯示點位，並依營業地址解析行政區與道路名稱。到期狀態僅依來源保單到期日與資料建置日期計算，不代表即時投保狀態、法規遵循判定、場所安全保證、法律意見或保險建議。' : 'Business premises public liability insurance records provide Taipei public-data records for company / business registration public accident liability insurance information. Fields include sequence number, registration number, category, name, business address, policy expiry date, longitude, and latitude. This site displays source-coordinate points and parses business addresses into district and road name. Expiry status is calculated only from the source policy expiry date and data build date; it is not real-time insurance status, legal compliance determination, venue safety guarantee, legal advice, or insurance advice.'}</p></article>
          <article><h3>{language === 'zh' ? '工會名單資料' : 'Registered labor union data'}</h3><p>{language === 'zh' ? '來源為 CP950/Big5 CSV，欄位包含工會屬性、工會名稱、理事長、郵遞區號、通訊地址與聯絡電話。資料未提供經緯度，因此僅以臺北市行政區中心點呈現彙總；理事長姓名只在來源明細中呈現。' : 'The source is a CP950/Big5 CSV with union type, union name, chairperson, postal code, contact address, and phone fields. It provides no coordinates, so Taipei records are shown only as district-centroid summaries; chairperson names appear only in source details.'}</p></article>
          <article><h3>{language === 'zh' ? '產業補助資料' : 'Industry grant data'}</h3><p>{language === 'zh' ? '來源包含負責人姓名欄位；本網站預設不在卡片中顯示。日期由民國年轉換，金額以新臺幣解析。' : 'The source includes responsible-person names; this site does not display them in default cards. ROC dates are converted and amounts are parsed as NTD.'}</p></article>
          <article><h3>{language === 'zh' ? '捷運採購時程' : 'Metro procurement schedule'}</h3><p>{language === 'zh' ? '資料為每月公布的預定招標排程。「預算金額」原始欄位會完整保留；僅在內容可辨識時衍生招標方式，且不建立地圖點位。' : 'The data is a monthly planned tender schedule. The raw “budget amount” field is preserved, tender method is derived only when recognizable, and no map points are created.'}</p></article>
          <article><h3>{language === 'zh' ? '立案補習班資料' : 'Registered cram-school data'}</h3><p>{language === 'zh' ? '資料未提供經緯度，因此以行政區彙總與清單呈現，並透過地址提供地圖查詢連結。' : 'The data does not provide coordinates, so this site presents district-level summaries and directory records, with map lookup links based on addresses.'}</p></article>
          <article><h3>{language === 'zh' ? '一般旅館名冊' : 'Registered hotel data'}</h3><p>{language === 'zh' ? '資料未提供經緯度，因此以行政區彙總與地址型名冊呈現。客房定價欄位為公開登記欄位，不是即時房價或訂房價格。' : 'The data does not provide coordinates, so this site presents district-level summaries and an address-based directory. Room-rate fields are public registry fields, not real-time room prices or booking prices.'}</p></article>
          <article><h3>{language === 'zh' ? '臺北旅遊網住宿資料' : 'Taipei Travel accommodation data'}</h3><p>{language === 'zh' ? '資料提供中文旅遊住宿名錄，欄位包含旅館類別、旅宿名稱、地址、電話或手機號碼、傳真與房間數。資料未提供官方經緯度，因此以行政區彙總與地址型清單呈現，不作訂房、房價、空房、推薦或品質保證。' : 'The data provides Chinese tourism accommodation directory records with category, name, address, phone/mobile, fax, and room count. It has no official coordinates, so this site shows district summaries and an address-based directory, not booking, pricing, vacancy, recommendation, or quality guarantees.'}</p></article>
          <article><h3>{language === 'zh' ? '勞基法違規公布紀錄' : 'Labor violation publication records'}</h3><p>{language === 'zh' ? '資料未提供地址或經緯度，因此不建立地圖點位。民國日期會轉為西元日期；負責人姓名僅在來源明細中呈現，不作個人排名或評價。' : 'The data provides no addresses or coordinates, so it has no map layer. ROC dates are converted to Gregorian dates; responsible-person names appear only in source details and are not ranked or evaluated.'}</p></article>
          <article><h3>{language === 'zh' ? '南港軟體工業園區廠商' : 'Nangang Software Park companies'}</h3><p>{language === 'zh' ? '來源欄位名稱為經度與緯度，但資料型態接近 TWD97；系統會判斷座標型態並轉換為 WGS84。園區廠商名錄不代表即時營運或進駐狀態。' : 'Source coordinate values resemble TWD97, so the app detects the type and converts them to WGS84. The directory does not represent real-time operating or tenancy status.'}</p></article>
          <article><h3>{language === 'zh' ? '動物醫院一覽表' : 'Animal hospital directory'}</h3><p>{language === 'zh' ? '資料未提供經緯度，因此以行政區彙總與清單呈現。負責人姓名為來源資料欄位，僅於明細中呈現，不作個人排名或評價。' : 'The data provides no coordinates, so this site presents district summaries and a directory. Responsible person name is a source field shown only in details, not ranked or evaluated.'}</p></article>
          <article><h3>{language === 'zh' ? '準公共化托嬰中心' : 'Quasi-public infant care centers'}</h3><p>{language === 'zh' ? '資料未提供經緯度，因此以行政區彙總與清單呈現。表列收托差額由核定收托人數與實際收托人數衍生，不是即時可收托名額。' : 'The data provides no coordinates, so this site presents district summaries and a directory. Listed capacity gap is derived from approved capacity and actual enrollment; it is not real-time vacancy.'}</p></article>
          <article><h3>{t.source}</h3><p><a href="https://data.taipei/dataset/detail?id=72417af0-7dec-4fad-b762-5f2baafcf084" target="_blank" rel="noreferrer">臺北市人民團體名冊 ↗</a><br /><a href="https://data.taipei/dataset/detail?id=f56e77c6-cc69-480c-8ba4-057fc7e1d8d6" target="_blank" rel="noreferrer">臺北市演藝團體名冊 ↗</a><br /><a href="https://data.taipei/dataset/detail?id=ec201f0a-2efa-4426-9439-a8daea7b33c7" target="_blank" rel="noreferrer">臺北市各項預防接種合約醫療院所 ↗</a><br /><a href="https://data.taipei/dataset/detail?id=428a78d5-867a-4e55-9630-040a89c8cd94" target="_blank" rel="noreferrer">臺北市可執行通訊心理諮商之心理機構 ↗</a><br /><a href="https://data.taipei/dataset/detail?id=5880bb98-ab6a-476c-ae55-37564b0d0fc9" target="_blank" rel="noreferrer">臺北市營業場所投保公共意外險清冊 ↗</a><br /><a href="https://data.taipei/dataset/detail?id=bea69229-8349-4208-8a68-988718f4ea48" target="_blank" rel="noreferrer">臺北市各工會名單及聯絡方式 ↗</a><br /><a href="https://data.taipei/dataset/detail?id=3e78bffa-3fa3-46d5-a632-df99447de695" target="_blank" rel="noreferrer">臺北市產業補助廠商資料 ↗</a><br /><a href="https://data.taipei/dataset/detail?id=f4fd7f03-9bf6-41de-a003-02c437596570" target="_blank" rel="noreferrer">臺北捷運公司採購案件預定招標時程資訊 ↗</a><br /><a href="https://data.taipei/dataset/detail?id=b124a967-fc88-4c45-bea8-41b4ef158a15" target="_blank" rel="noreferrer">臺北市立案補習班資訊 ↗</a><br /><a href="https://data.taipei/dataset/detail?id=4d7d0b46-2e90-4ee7-b000-c0f2f3a37651" target="_blank" rel="noreferrer">臺北市一般旅館名冊 ↗</a><br /><a href="https://data.taipei/dataset/detail?id=58093ba6-4c98-4148-b27a-50ad97d7afca" target="_blank" rel="noreferrer">臺北市臺北旅遊網住宿資料(中文) ↗</a><br /><a href="https://data.taipei/dataset/detail?id=23630879-4926-4877-a48a-a0ae6cc2f7d5" target="_blank" rel="noreferrer">臺北市勞基法違規公布紀錄 ↗</a><br /><a href="https://data.taipei/dataset/detail?id=01bcb5ee-7c18-41fa-86d4-4e75daee1f94" target="_blank" rel="noreferrer">臺北市動物醫院一覽表 ↗</a><br /><a href="https://data.taipei/dataset/detail?id=aeaaa517-089c-42a7-ad5b-60fef89c3545" target="_blank" rel="noreferrer">臺北市準公共化托嬰中心 ↗</a></p>
            <p>{t.updated}: {report.convertedAt ? new Date(report.convertedAt).toLocaleString(language === 'zh' ? 'zh-TW' : 'en') : '—'}<br />{report.performingArtsGroups?.convertedAt ? new Date(report.performingArtsGroups.convertedAt).toLocaleString(language === 'zh' ? 'zh-TW' : 'en') : '—'}<br />{report.contractedVaccinationMedicalProviders?.convertedAt ? new Date(report.contractedVaccinationMedicalProviders.convertedAt).toLocaleString(language === 'zh' ? 'zh-TW' : 'en') : '—'}<br />{report.telepsychologyCounselingInstitutions?.convertedAt ? new Date(report.telepsychologyCounselingInstitutions.convertedAt).toLocaleString(language === 'zh' ? 'zh-TW' : 'en') : '—'}<br />{report.businessPremisesPublicLiabilityInsuranceRecords?.convertedAt ? new Date(report.businessPremisesPublicLiabilityInsuranceRecords.convertedAt).toLocaleString(language === 'zh' ? 'zh-TW' : 'en') : '—'}<br />{report.registeredLaborUnions?.convertedAt ? new Date(report.registeredLaborUnions.convertedAt).toLocaleString(language === 'zh' ? 'zh-TW' : 'en') : '—'}<br />{report.quasiPublicInfantCareCenters?.convertedAt ? new Date(report.quasiPublicInfantCareCenters.convertedAt).toLocaleString(language === 'zh' ? 'zh-TW' : 'en') : '—'}<br />{report.taipeiTravelAccommodationsZh?.convertedAt ? new Date(report.taipeiTravelAccommodationsZh.convertedAt).toLocaleString(language === 'zh' ? 'zh-TW' : 'en') : '—'}<br />{report.industryGrantRecipients?.convertedAt ? new Date(report.industryGrantRecipients.convertedAt).toLocaleString(language === 'zh' ? 'zh-TW' : 'en') : '—'}<br />{report.metroProcurementSchedules?.convertedAt ? new Date(report.metroProcurementSchedules.convertedAt).toLocaleString(language === 'zh' ? 'zh-TW' : 'en') : '—'}<br />{report.registeredCramSchools?.convertedAt ? new Date(report.registeredCramSchools.convertedAt).toLocaleString(language === 'zh' ? 'zh-TW' : 'en') : '—'}<br />{report.registeredHotels?.convertedAt ? new Date(report.registeredHotels.convertedAt).toLocaleString(language === 'zh' ? 'zh-TW' : 'en') : '—'}<br />{report.laborStandardActViolationRecords?.convertedAt ? new Date(report.laborStandardActViolationRecords.convertedAt).toLocaleString(language === 'zh' ? 'zh-TW' : 'en') : '—'}<br />{report.registeredAnimalHospitals?.convertedAt ? new Date(report.registeredAnimalHospitals.convertedAt).toLocaleString(language === 'zh' ? 'zh-TW' : 'en') : '—'}</p></article></div>
      </section>}
    </main>
    <footer>{t.footer}</footer>
  </div>;
}
