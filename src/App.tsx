import { useEffect, useMemo, useState } from 'react';
import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet';
import {
  buildCivicGroupSummary, CATEGORIES, DISTRICTS, filterCivicGroups, formatFoundedDate, getCategoryLabel,
} from './lib/civicGroups';
import type { CivicGroup, CivicGroupFilters, CivicGroupSummary, Language } from './types';

const copy = {
  zh: {
    title: '台北人民團體地圖', subtitle: '探索臺北市人民團體名冊、行政區分布與成立年份概覽',
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
    footer: '資料來源：臺北市人民團體名冊。實際資料內容請以臺北市資料大平臺及主管機關公告為準。',
  },
  en: {
    title: 'Taipei Civic Groups Map', subtitle: 'Explore Taipei civic group directory records, district distribution, and founding-year overview',
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
    footer: 'Data source: Taipei civic groups directory dataset. Please refer to Taipei Open Data and official authority notices for official records.',
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

export default function App() {
  const [language, setLanguage] = useState<Language>('zh');
  const [tab, setTab] = useState('map');
  const [groups, setGroups] = useState<CivicGroup[]>([]);
  const [summary, setSummary] = useState<CivicGroupSummary | null>(null);
  const [report, setReport] = useState<{ convertedAt?: string }>({});
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
      loadJson('data/conversion-report.json'),
    ]).then(([groupData, summaryData, reportData]) => {
      setGroups(groupData); setSummary(summaryData); setReport(reportData);
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
  const openDistrict = (district: string) => { setFilters({ ...emptyFilters, district }); setTab('directory'); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const tabs = [['map', t.map], ['directory', t.directory], ['overview', t.overview], ['notes', t.notes]];

  return <div className="app">
    <header>
      <div className="masthead"><div className="brand-mark">北</div><div><p>TAIPEI · OPEN DIRECTORY</p><h1>{t.title}</h1><span>{t.subtitle}</span></div>
        <button className="language" onClick={() => setLanguage(language === 'zh' ? 'en' : 'zh')} aria-label="Switch language">{language === 'zh' ? 'EN' : '中文'}</button></div>
      <nav aria-label={language === 'zh' ? '主要導覽' : 'Main navigation'}>{tabs.map(([id, label]) => <button aria-pressed={tab === id} className={tab === id ? 'active' : ''} onClick={() => setTab(id)} key={id}>{label}</button>)}</nav>
    </header>
    <main>
      {loadError && <p className="status" role="alert">{t.loadError}</p>}
      {!loadError && !summary && <p className="status" role="status">{t.loading}</p>}
      {summary && (tab === 'map' || tab === 'directory' || tab === 'overview') && <FilterPanel filters={filters} setFilters={setFilters} language={language} decades={decades} />}
      {tab === 'map' && activeSummary && <section className="workspace"><div className="section-heading"><p>01 / DISTRICT VIEW</p><h2>{t.map}</h2></div><CivicMap summary={activeSummary} language={language} openDistrict={openDistrict} /></section>}
      {tab === 'directory' && summary && <section className="workspace"><div className="section-heading inline"><div><p>02 / PUBLIC RECORDS</p><h2>{t.directory}</h2></div><strong>{filtered.length.toLocaleString()} <span>{t.found}</span></strong></div><div className="notice subtle">{t.categoryNotice}</div><GroupDirectory groups={filtered} language={language} /></section>}
      {tab === 'overview' && activeSummary && <section className="workspace"><div className="section-heading"><p>03 / DISTRIBUTION</p><h2>{t.overview}</h2></div><Overview summary={activeSummary} groups={hasFilters ? filtered : groups} language={language} /></section>}
      {tab === 'notes' && <section className="workspace notes"><div className="section-heading"><p>04 / METHODOLOGY</p><h2>{t.notes}</h2></div>
        <blockquote>{t.disclaimer}</blockquote><div className="notes-grid"><article><h3>{t.method}</h3><p>{t.methodText}</p></article>
          <article><h3>{t.fields}</h3><p>機關代碼 → agencyCode<br />名稱 → name<br />地址 → address<br />電話 → phone<br />成立日期 → foundedDateRaw</p></article>
          <article><h3>{t.source}</h3><p><a href="https://data.taipei/dataset/detail?id=72417af0-7dec-4fad-b762-5f2baafcf084" target="_blank" rel="noreferrer">臺北市人民團體名冊 ↗</a></p><p>{t.updated}: {report.convertedAt ? new Date(report.convertedAt).toLocaleString(language === 'zh' ? 'zh-TW' : 'en') : '—'}</p></article></div>
      </section>}
    </main>
    <footer>{t.footer}</footer>
  </div>;
}
