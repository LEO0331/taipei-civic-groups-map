import { useEffect, useMemo, useState } from 'react';
import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet';
import {
  buildCivicGroupSummary, CATEGORIES, DISTRICTS, filterCivicGroups, formatFoundedDate, getCategoryLabel,
} from './lib/civicGroups';
import IndustryModule from './IndustryModule';
import MetroProcurementModule from './MetroProcurementModule';
import RegisteredCramSchoolsModule from './RegisteredCramSchoolsModule';
import RegisteredHotelsModule from './RegisteredHotelsModule';
import LaborStandardActViolationsModule from './LaborStandardActViolationsModule';
import DistrictComparison from './DistrictComparison';
import type {
  CivicGroup, CivicGroupFilters, CivicGroupSummary, IndustryGrantRecipient, IndustryGrantSummary, Language,
  MetroProcurementScheduleRecord, MetroProcurementScheduleSummary, RegisteredCramSchool, RegisteredCramSchoolSummary,
  RegisteredHotel, RegisteredHotelSummary, LaborStandardActViolationManifest, LaborStandardActViolationSummary,
} from './types';

const copy = {
  zh: {
    title: '台北公共登記與行政紀錄地圖', subtitle: '人民團體、立案機構、旅宿、採購、補助與法規公開紀錄探索',
    civicGroups: '人民團體', industryGrants: '產業補助廠商', metroProcurement: '捷運採購時程', registeredCramSchools: '立案補習班', registeredHotels: '一般旅館名冊', laborViolations: '勞基法違規公布紀錄', comparison: '行政區比較',
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
    footer: '資料來源：臺北市人民團體名冊、臺北市產業發展獎勵補助計畫獲獎勵補助廠商基本資料、臺北捷運公司採購案件預定招標時程資訊、臺北市立案補習班資訊、臺北市一般旅館名冊、臺北市政府勞動局違反勞動基準法事業單位及事業主公布總表等公開資料。各資料集性質不同，最新與正式資訊請以主管機關正式公告及官方系統為準。',
  },
  en: {
    title: 'Taipei Public Records Explorer', subtitle: 'Civic groups, registered institutions, lodging records, procurement, grants, and compliance public records explorer',
    civicGroups: 'Civic Groups', industryGrants: 'Industry Grant Recipients', metroProcurement: 'Metro Procurement Schedule', registeredCramSchools: 'Registered Cram Schools', registeredHotels: 'Registered Hotels', laborViolations: 'Labor Standards Act Violation Records', comparison: 'District Comparison',
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
    footer: 'Data sources: Taipei civic group directory dataset, Taipei industry development grant recipient dataset, Taipei Metro planned procurement tender schedule dataset, Taipei registered cram-school dataset, Taipei registered hotel dataset, Taipei Department of Labor Labor Standards Act violation publication records, and related public-data records. These datasets have different meanings. Latest and official information should be verified with official authority notices and official systems.',
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

function CombinedOverview({ civic, grants, procurement, cramSchools, hotels, laborViolations, language }: {
  civic: CivicGroupSummary; grants: IndustryGrantSummary; procurement: MetroProcurementScheduleSummary; cramSchools: RegisteredCramSchoolSummary; hotels: RegisteredHotelSummary; laborViolations: LaborStandardActViolationSummary; language: Language;
}) {
  const zh = language === 'zh';
  return <section className="workspace"><div className="section-heading"><p>07 / PUBLIC RECORDS OVERVIEW</p><h2>{zh ? '資料概覽' : 'Data Overview'}</h2></div>
    <div className="notice subtle">{zh ? '此圖僅比較公開資料中的公布紀錄數與來源欄位，不代表雇主整體評價、目前營運狀態、即時違規狀態、求職建議、法律意見或裁判結果。' : 'This chart only compares public-data publication records and source fields. It does not represent overall employer evaluation, current operating status, real-time violation status, job-seeking advice, legal advice, or court outcome.'}</div>
    <div className="summary-grid"><article><span>{zh ? '人民團體紀錄' : 'Civic group records'}</span><strong>{civic.total.toLocaleString()}</strong></article>
      <article><span>{zh ? '補助紀錄' : 'Subsidy records'}</span><strong>{grants.totalRecords.toLocaleString()}</strong></article>
      <article><span>{zh ? '獲補助廠商' : 'Grant recipient companies'}</span><strong>{grants.uniqueCompanyCount.toLocaleString()}</strong></article>
      <article><span>{zh ? '捷運採購時程紀錄' : 'Metro procurement schedule records'}</span><strong>{procurement.totalRecords.toLocaleString()}</strong></article>
      <article><span>{zh ? '立案補習班紀錄' : 'Registered cram-school records'}</span><strong>{cramSchools.totalRecords.toLocaleString()}</strong></article>
      <article><span>{zh ? '一般旅館登記紀錄' : 'Registered hotel records'}</span><strong>{hotels.totalRecords.toLocaleString()}</strong></article>
      <article><span>{zh ? '勞基法違規公布紀錄' : 'Labor violation publication records'}</span><strong>{laborViolations.totalRecords.toLocaleString()}</strong></article></div>
    <div className="chart-grid"><BarChart label={zh ? '各行政區人民團體數' : 'Civic groups by district'} data={civic.byDistrict.map((item) => ({ label: item.district, count: item.count }))} />
      <BarChart label={zh ? '各行政區補助紀錄數' : 'Grant records by district'} data={grants.byDistrict.map((item) => ({ label: item.district, count: item.recordCount }))} />
      <BarChart label={zh ? '各行政區立案補習班數' : 'Registered cram schools by district'} data={cramSchools.byDistrict.map((item) => ({ label: item.district, count: item.recordCount }))} />
      <BarChart label={zh ? '各行政區一般旅館數' : 'Registered hotels by district'} data={hotels.byDistrict.map((item) => ({ label: item.district, count: item.recordCount }))} />
      <BarChart label={zh ? '不同公開資料模組紀錄數' : 'Record count by public-data module'} data={[
        { label: zh ? '人民團體' : 'Civic groups', count: civic.total },
        { label: zh ? '產業補助' : 'Industry grants', count: grants.totalRecords },
        { label: zh ? '捷運採購時程' : 'Metro procurement', count: procurement.totalRecords },
        { label: zh ? '立案補習班' : 'Registered cram schools', count: cramSchools.totalRecords },
        { label: zh ? '一般旅館名冊' : 'Registered hotels', count: hotels.totalRecords },
        { label: zh ? '勞基法違規公布' : 'Labor violations', count: laborViolations.totalRecords },
      ]} /></div>
  </section>;
}

export default function App() {
  const [language, setLanguage] = useState<Language>('zh');
  const [tab, setTab] = useState<'civic' | 'grants' | 'procurement' | 'cramSchools' | 'hotels' | 'laborViolations' | 'comparison' | 'overview' | 'notes'>('civic');
  const [civicView, setCivicView] = useState<'map' | 'directory' | 'overview'>('map');
  const [groups, setGroups] = useState<CivicGroup[]>([]);
  const [summary, setSummary] = useState<CivicGroupSummary | null>(null);
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
  const [report, setReport] = useState<{
    convertedAt?: string; industryGrantRecipients?: { convertedAt?: string }; metroProcurementSchedules?: { convertedAt?: string }; registeredCramSchools?: { convertedAt?: string }; registeredHotels?: { convertedAt?: string }; laborStandardActViolationRecords?: { convertedAt?: string };
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
      loadJson('data/conversion-report.json'),
    ]).then(([groupData, summaryData, grantData, grantSummaryData, procurementData, procurementSummaryData, cramSchoolData, cramSchoolSummaryData, hotelData, hotelSummaryData, laborSummaryData, laborManifestData, reportData]) => {
      setGroups(groupData); setSummary(summaryData); setGrantRecords(grantData); setGrantSummary(grantSummaryData);
      setProcurementRecords(procurementData); setProcurementSummary(procurementSummaryData);
      setCramSchoolRecords(cramSchoolData); setCramSchoolSummary(cramSchoolSummaryData);
      setHotelRecords(hotelData); setHotelSummary(hotelSummaryData);
      setLaborViolationSummary(laborSummaryData); setLaborViolationManifest(laborManifestData); setReport(reportData);
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
    ['civic', t.civicGroups], ['grants', t.industryGrants], ['procurement', t.metroProcurement],
    ['cramSchools', t.registeredCramSchools], ['hotels', t.registeredHotels], ['laborViolations', t.laborViolations],
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
      {!loadError && (!summary || !grantSummary || !procurementSummary || !cramSchoolSummary || !hotelSummary || !laborViolationSummary || !laborViolationManifest) && <p className="status" role="status">{t.loading}</p>}
      {tab === 'civic' && summary && <><FilterPanel filters={filters} setFilters={setFilters} language={language} decades={decades} /><section className="workspace civic-header"><div className="section-heading"><p>01 / CIVIC GROUPS</p><h2>{t.civicGroups}</h2></div>
        <div className="subtabs">{civicViews.map(([id, label]) => <button className={civicView === id ? 'active' : ''} onClick={() => setCivicView(id)} key={id}>{label}</button>)}</div>
        {civicView === 'map' && activeSummary && <CivicMap summary={activeSummary} language={language} openDistrict={openDistrict} />}
        {civicView === 'directory' && <><div className="section-heading inline"><div /><strong>{filtered.length.toLocaleString()} <span>{t.found}</span></strong></div><div className="notice subtle">{t.categoryNotice}</div><GroupDirectory groups={filtered} language={language} /></>}
        {civicView === 'overview' && activeSummary && <Overview summary={activeSummary} groups={hasFilters ? filtered : groups} language={language} />}</section></>}
      {tab === 'grants' && grantSummary && <IndustryModule records={grantRecords} summary={grantSummary} language={language} />}
      {tab === 'procurement' && procurementSummary && <MetroProcurementModule records={procurementRecords} summary={procurementSummary} language={language} />}
      {tab === 'cramSchools' && cramSchoolSummary && <RegisteredCramSchoolsModule records={cramSchoolRecords} summary={cramSchoolSummary} language={language} />}
      {tab === 'hotels' && hotelSummary && <RegisteredHotelsModule records={hotelRecords} summary={hotelSummary} language={language} />}
      {tab === 'laborViolations' && laborViolationSummary && laborViolationManifest && <LaborStandardActViolationsModule summary={laborViolationSummary} manifest={laborViolationManifest} language={language} />}
      {tab === 'comparison' && summary && grantSummary && <DistrictComparison groups={groups} civicSummary={summary} grants={grantRecords} grantSummary={grantSummary} language={language} />}
      {tab === 'overview' && summary && grantSummary && procurementSummary && cramSchoolSummary && hotelSummary && laborViolationSummary && <CombinedOverview civic={summary} grants={grantSummary} procurement={procurementSummary} cramSchools={cramSchoolSummary} hotels={hotelSummary} laborViolations={laborViolationSummary} language={language} />}
      {tab === 'notes' && <section className="workspace notes"><div className="section-heading"><p>08 / METHODOLOGY</p><h2>{t.notes}</h2></div>
        <blockquote>{language === 'zh' ? '本網站整理臺北市公開資料中的人民團體名冊、產業補助廠商資料、捷運採購案件預定招標時程、立案補習班資訊、一般旅館名冊、勞基法違規公布紀錄等公開資料，僅供資料探索與整理使用。各資料集性質不同，不應直接解讀為相同類型組織或活動。勞基法違規公布紀錄為主管機關公開公布之行政紀錄，不代表目前營運狀態、即時違規狀態、雇主整體評價、求職建議、法律意見或裁判結果。' : 'This site organizes Taipei public-data records such as civic group directory records, industry grant recipient records, Taipei Metro planned procurement tender schedules, registered cram-school records, registered hotel records, Labor Standards Act violation publication records, and related public records for data exploration and organization only. These datasets have different meanings and should not be interpreted as the same type of organization or activity. Labor Standards Act violation publication records are administrative publication records from the competent authority and do not represent current operating status, real-time violation status, overall employer evaluation, job-seeking advice, legal advice, or court outcome.'}</blockquote>
        <div className="notes-grid"><article><h3>{t.method}</h3><p>{t.methodText}</p></article>
          <article><h3>{t.fields}</h3><p>機關代碼 → agencyCode<br />名稱 → name<br />地址 → address<br />電話 → phone<br />成立日期 → foundedDateRaw</p></article>
          <article><h3>{language === 'zh' ? '產業補助資料' : 'Industry grant data'}</h3><p>{language === 'zh' ? '來源包含負責人姓名欄位；本網站預設不在卡片中顯示。日期由民國年轉換，金額以新臺幣解析。' : 'The source includes responsible-person names; this site does not display them in default cards. ROC dates are converted and amounts are parsed as NTD.'}</p></article>
          <article><h3>{language === 'zh' ? '捷運採購時程' : 'Metro procurement schedule'}</h3><p>{language === 'zh' ? '資料為每月公布的預定招標排程。「預算金額」原始欄位會完整保留；僅在內容可辨識時衍生招標方式，且不建立地圖點位。' : 'The data is a monthly planned tender schedule. The raw “budget amount” field is preserved, tender method is derived only when recognizable, and no map points are created.'}</p></article>
          <article><h3>{language === 'zh' ? '立案補習班資料' : 'Registered cram-school data'}</h3><p>{language === 'zh' ? '資料未提供經緯度，因此以行政區彙總與清單呈現，並透過地址提供地圖查詢連結。' : 'The data does not provide coordinates, so this site presents district-level summaries and directory records, with map lookup links based on addresses.'}</p></article>
          <article><h3>{language === 'zh' ? '一般旅館名冊' : 'Registered hotel data'}</h3><p>{language === 'zh' ? '資料未提供經緯度，因此以行政區彙總與地址型名冊呈現。客房定價欄位為公開登記欄位，不是即時房價或訂房價格。' : 'The data does not provide coordinates, so this site presents district-level summaries and an address-based directory. Room-rate fields are public registry fields, not real-time room prices or booking prices.'}</p></article>
          <article><h3>{language === 'zh' ? '勞基法違規公布紀錄' : 'Labor violation publication records'}</h3><p>{language === 'zh' ? '資料未提供地址或經緯度，因此不建立地圖點位。民國日期會轉為西元日期；負責人姓名僅在來源明細中呈現，不作個人排名或評價。' : 'The data provides no addresses or coordinates, so it has no map layer. ROC dates are converted to Gregorian dates; responsible-person names appear only in source details and are not ranked or evaluated.'}</p></article>
          <article><h3>{t.source}</h3><p><a href="https://data.taipei/dataset/detail?id=72417af0-7dec-4fad-b762-5f2baafcf084" target="_blank" rel="noreferrer">臺北市人民團體名冊 ↗</a><br /><a href="https://data.taipei/dataset/detail?id=3e78bffa-3fa3-46d5-a632-df99447de695" target="_blank" rel="noreferrer">臺北市產業補助廠商資料 ↗</a><br /><a href="https://data.taipei/dataset/detail?id=f4fd7f03-9bf6-41de-a003-02c437596570" target="_blank" rel="noreferrer">臺北捷運公司採購案件預定招標時程資訊 ↗</a><br /><a href="https://data.taipei/dataset/detail?id=b124a967-fc88-4c45-bea8-41b4ef158a15" target="_blank" rel="noreferrer">臺北市立案補習班資訊 ↗</a><br /><a href="https://data.taipei/dataset/detail?id=4d7d0b46-2e90-4ee7-b000-c0f2f3a37651" target="_blank" rel="noreferrer">臺北市一般旅館名冊 ↗</a><br /><a href="https://data.taipei/dataset/detail?id=23630879-4926-4877-a48a-a0ae6cc2f7d5" target="_blank" rel="noreferrer">臺北市勞基法違規公布紀錄 ↗</a></p>
            <p>{t.updated}: {report.convertedAt ? new Date(report.convertedAt).toLocaleString(language === 'zh' ? 'zh-TW' : 'en') : '—'}<br />{report.industryGrantRecipients?.convertedAt ? new Date(report.industryGrantRecipients.convertedAt).toLocaleString(language === 'zh' ? 'zh-TW' : 'en') : '—'}<br />{report.metroProcurementSchedules?.convertedAt ? new Date(report.metroProcurementSchedules.convertedAt).toLocaleString(language === 'zh' ? 'zh-TW' : 'en') : '—'}<br />{report.registeredCramSchools?.convertedAt ? new Date(report.registeredCramSchools.convertedAt).toLocaleString(language === 'zh' ? 'zh-TW' : 'en') : '—'}<br />{report.registeredHotels?.convertedAt ? new Date(report.registeredHotels.convertedAt).toLocaleString(language === 'zh' ? 'zh-TW' : 'en') : '—'}<br />{report.laborStandardActViolationRecords?.convertedAt ? new Date(report.laborStandardActViolationRecords.convertedAt).toLocaleString(language === 'zh' ? 'zh-TW' : 'en') : '—'}</p></article></div>
      </section>}
    </main>
    <footer>{t.footer}</footer>
  </div>;
}
