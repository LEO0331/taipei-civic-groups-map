import { useEffect, useMemo, useState } from 'react';
import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet';
import { DISTRICTS, TAIPEI_DISTRICT_CENTROIDS } from './lib/civicGroups';
import { buildIndustryGrantSummary, filterIndustryGrants } from './lib/industryGrants';
import type { IndustryGrantFilters, IndustryGrantRecipient, IndustryGrantSummary, Language } from './types';

const emptyFilters: IndustryGrantFilters = {
  search: '', subsidyYear: '', grantField: '', district: '', industryCategory: '',
  subsidyMin: '', subsidyMax: '', budgetMin: '', budgetMax: '', shareMin: '', shareMax: '',
  projectFrom: '', projectTo: '',
};

const money = (value?: number, language: Language = 'zh') =>
  value === undefined ? '—' : new Intl.NumberFormat(language === 'zh' ? 'zh-TW' : 'en', {
    style: 'currency', currency: 'TWD', maximumFractionDigits: 0, notation: value >= 100_000_000 ? 'compact' : 'standard',
  }).format(value);

function BarChart({ title, data, currency = false, language }: {
  title: string; data: Array<{ label: string; value: number }>; currency?: boolean; language: Language;
}) {
  const max = Math.max(...data.map((item) => item.value), 1);
  return <section className="chart"><h3>{title}</h3><div className="bars">
    {data.map((item) => <div className="bar-row wide-label" key={item.label}><span title={item.label}>{item.label}</span>
      <div><i style={{ width: `${Math.max(2, item.value / max * 100)}%` }} /></div>
      <b>{currency ? money(item.value, language) : item.value.toLocaleString()}</b></div>)}
  </div></section>;
}

function GrantFilters({ filters, setFilters, records, language }: {
  filters: IndustryGrantFilters; setFilters: (filters: IndustryGrantFilters) => void;
  records: IndustryGrantRecipient[]; language: Language;
}) {
  const zh = language === 'zh';
  const update = (key: keyof IndustryGrantFilters, value: string) => setFilters({ ...filters, [key]: value });
  const options = (key: 'grantField' | 'registeredDistrict' | 'industryCategory' | 'subsidyYear') =>
    [...new Set(records.flatMap((record) => record[key] ?? []))].sort((a, b) => String(a).localeCompare(String(b)));
  return <aside className="filters">
    <label className="search"><span aria-hidden="true">⌕</span><input aria-label={zh ? '搜尋公司、計畫名稱、領域或產業類別' : 'Search company, project name, field, or industry category'} value={filters.search} onChange={(event) => update('search', event.target.value)} placeholder={zh ? '搜尋公司、計畫名稱、領域或產業類別' : 'Search company, project name, field, or industry category'} /></label>
    <div className="filter-grid grant-filters">
      {([
        ['subsidyYear', zh ? '獲補助年度' : 'Subsidy year', options('subsidyYear')],
        ['grantField', zh ? '領域' : 'Grant field', options('grantField')],
        ['district', zh ? '登記行政區' : 'Registered district', options('registeredDistrict')],
        ['industryCategory', zh ? '產業類別' : 'Industry category', options('industryCategory')],
      ] as const).map(([key, label, values]) => <label key={key}>{label}<select value={filters[key]} onChange={(event) => update(key, event.target.value)}>
        <option value="">{zh ? '全部' : 'All'}</option>{values.map((value) => <option value={value} key={value}>{value}</option>)}
      </select></label>)}
      <label>{zh ? '最低補助款' : 'Minimum subsidy'}<input type="number" value={filters.subsidyMin} onChange={(event) => update('subsidyMin', event.target.value)} /></label>
      <label>{zh ? '最高補助款' : 'Maximum subsidy'}<input type="number" value={filters.subsidyMax} onChange={(event) => update('subsidyMax', event.target.value)} /></label>
      <label>{zh ? '最低總經費' : 'Minimum budget'}<input type="number" value={filters.budgetMin} onChange={(event) => update('budgetMin', event.target.value)} /></label>
      <label>{zh ? '最高總經費' : 'Maximum budget'}<input type="number" value={filters.budgetMax} onChange={(event) => update('budgetMax', event.target.value)} /></label>
      <label>{zh ? '最低補助比率' : 'Minimum subsidy share'}<input type="number" step=".01" min="0" max="1" value={filters.shareMin} onChange={(event) => update('shareMin', event.target.value)} /></label>
      <label>{zh ? '最高補助比率' : 'Maximum subsidy share'}<input type="number" step=".01" min="0" max="1" value={filters.shareMax} onChange={(event) => update('shareMax', event.target.value)} /></label>
      <label>{zh ? '計畫期間起' : 'Project period from'}<input type="date" value={filters.projectFrom} onChange={(event) => update('projectFrom', event.target.value)} /></label>
      <label>{zh ? '計畫期間迄' : 'Project period to'}<input type="date" value={filters.projectTo} onChange={(event) => update('projectTo', event.target.value)} /></label>
    </div>
    {Object.values(filters).some(Boolean) && <button className="text-button" onClick={() => setFilters(emptyFilters)}>{zh ? '清除篩選' : 'Clear filters'}</button>}
  </aside>;
}

function GrantOverview({ summary, records, language }: { summary: IndustryGrantSummary; records: IndustryGrantRecipient[]; language: Language }) {
  const zh = language === 'zh';
  const topDistrict = summary.byDistrict[0];
  const budgetBins = [
    { label: '< 1M', min: 0, max: 1_000_000 }, { label: '1–3M', min: 1_000_000, max: 3_000_000 },
    { label: '3–10M', min: 3_000_000, max: 10_000_000 }, { label: '10M+', min: 10_000_000, max: Infinity },
  ].map((bin) => ({ label: bin.label, value: records.filter((record) => (record.totalProjectBudgetNtd ?? -1) >= bin.min && (record.totalProjectBudgetNtd ?? Infinity) < bin.max).length }));
  const shareBins = [
    { label: '0–25%', min: 0, max: .25 }, { label: '25–50%', min: .25, max: .5 },
    { label: '50–75%', min: .5, max: .75 }, { label: '75–100%', min: .75, max: 1.01 },
  ].map((bin) => ({ label: bin.label, value: records.filter((record) => (record.subsidyShare ?? -1) >= bin.min && (record.subsidyShare ?? Infinity) < bin.max).length }));
  const cards = [
    [zh ? '補助紀錄數' : 'Subsidy record count', summary.totalRecords.toLocaleString()],
    [zh ? '獲補助廠商數' : 'Grant recipient company count', summary.uniqueCompanyCount.toLocaleString()],
    [zh ? '核定補助款總額' : 'Total approved subsidy', money(summary.totalApprovedSubsidyNtd, language)],
    [zh ? '核定補助款中位數' : 'Median approved subsidy', money(summary.medianApprovedSubsidyNtd, language)],
    [zh ? '總經費' : 'Total project budget', money(summary.totalProjectBudgetNtd, language)],
    [zh ? '自籌款總額' : 'Total self-funded amount', money(summary.totalSelfFundedAmountNtd, language)],
    [zh ? '最新補助年度' : 'Latest subsidy year', summary.maxSubsidyYear ?? '—'],
    [zh ? '最多補助領域' : 'Top grant field', summary.byGrantField[0]?.grantField ?? '—'],
    [zh ? '最多產業類別' : 'Top industry category', summary.byIndustryCategory[0]?.industryCategory ?? '—'],
    [zh ? '核定補助款最高行政區' : 'Top district by approved subsidy', topDistrict?.district ?? '—'],
  ];
  return <><div className="summary-grid grant-summary">{cards.map(([label, value]) => <article key={label}><span>{label}</span><strong>{value}</strong></article>)}</div>
    <div className="chart-grid">
      <BarChart language={language} currency title={zh ? '各年度核定補助款' : 'Approved subsidy by year'} data={summary.byYear.map((item) => ({ label: String(item.year), value: item.approvedSubsidyNtd }))} />
      <BarChart language={language} title={zh ? '各年度補助紀錄數' : 'Record count by year'} data={summary.byYear.map((item) => ({ label: String(item.year), value: item.recordCount }))} />
      <BarChart language={language} currency title={zh ? '各行政區核定補助款' : 'Approved subsidy by district'} data={summary.byDistrict.map((item) => ({ label: item.district, value: item.approvedSubsidyNtd }))} />
      <BarChart language={language} title={zh ? '各行政區補助紀錄數' : 'Record count by district'} data={summary.byDistrict.map((item) => ({ label: item.district, value: item.recordCount }))} />
      <BarChart language={language} currency title={zh ? '各領域核定補助款' : 'Approved subsidy by grant field'} data={summary.byGrantField.map((item) => ({ label: item.grantField, value: item.approvedSubsidyNtd }))} />
      <BarChart language={language} currency title={zh ? '各產業類別核定補助款' : 'Approved subsidy by industry category'} data={summary.byIndustryCategory.map((item) => ({ label: item.industryCategory, value: item.approvedSubsidyNtd }))} />
      <BarChart language={language} currency title={zh ? '核定補助款與自籌款' : 'Approved subsidy vs self-funded amount'} data={[{ label: zh ? '核定補助款' : 'Approved subsidy', value: summary.totalApprovedSubsidyNtd }, { label: zh ? '自籌款' : 'Self-funded', value: summary.totalSelfFundedAmountNtd }]} />
      <BarChart language={language} title={zh ? '總經費分布' : 'Project budget distribution'} data={budgetBins} />
      <BarChart language={language} title={zh ? '補助比率分布' : 'Subsidy share distribution'} data={shareBins} />
    </div></>;
}

function GrantMap({ summary, records, language, viewDistrict }: { summary: IndustryGrantSummary; records: IndustryGrantRecipient[]; language: Language; viewDistrict: (district: string) => void }) {
  const zh = language === 'zh';
  const max = Math.max(...summary.byDistrict.map((district) => district.approvedSubsidyNtd), 1);
  return <div className="map-wrap"><div className="notice">{zh ? '地圖以登記行政區彙總呈現，不代表公司精確位置。' : 'The map shows summaries by registered district and does not represent exact company locations.'}</div>
    <MapContainer center={[25.072, 121.54]} zoom={11} scrollWheelZoom={false}>
      <TileLayer attribution='&copy; OpenStreetMap contributors &copy; CARTO' url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
      {summary.byDistrict.map((district) => {
        const districtRecords = records.filter((record) => record.registeredDistrict === district.district);
        const top = (key: 'industryCategory' | 'grantField') => [...new Map(districtRecords.map((record) => [record[key], districtRecords.filter((item) => item[key] === record[key]).length]))].sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—';
        const point = TAIPEI_DISTRICT_CENTROIDS[district.district];
        return point && <CircleMarker key={district.district} center={[point.latitude, point.longitude]} radius={10 + 28 * Math.sqrt(district.approvedSubsidyNtd / max)} pathOptions={{ fillColor: '#d75b3f', fillOpacity: .72, color: '#fff7e8', weight: 2 }}>
          <Popup><div className="map-popup"><strong>{district.district}</strong><p>{zh ? '補助紀錄數' : 'Subsidy record count'}: {district.recordCount}</p>
            <p>{zh ? '獲補助廠商數' : 'Grant recipient company count'}: {district.uniqueCompanyCount}</p><p>{zh ? '核定補助款' : 'Approved subsidy'}: {money(district.approvedSubsidyNtd, language)}</p>
            <p>{zh ? '總經費' : 'Total project budget'}: {money(district.totalProjectBudgetNtd, language)}</p><p>{zh ? '主要產業類別' : 'Top industry category'}: {top('industryCategory')}</p>
            <p>{zh ? '主要領域' : 'Top grant field'}: {top('grantField')}</p><button onClick={() => viewDistrict(district.district)}>{zh ? '查看產業補助廠商' : 'View industry grant recipients'}</button></div></Popup>
        </CircleMarker>;
      })}
    </MapContainer></div>;
}

function CompanyDirectory({ records, language }: { records: IndustryGrantRecipient[]; language: Language }) {
  const zh = language === 'zh';
  const [limit, setLimit] = useState(60);
  useEffect(() => setLimit(60), [records]);
  return <div className="directory-list">{records.slice(0, limit).map((record) => <article className="group-row company-row" key={record.id}>
    <div><p className="eyebrow">{record.registeredDistrict ?? '—'} · {record.subsidyYear ?? '—'}</p><h3>{record.companyName}</h3><span className="tag">{record.industryCategory ?? '—'}</span></div>
    <dl><div><dt>{zh ? '領域' : 'Grant field'}</dt><dd>{record.grantField ?? '—'}</dd></div><div><dt>{zh ? '計畫名稱' : 'Project name'}</dt><dd>{record.projectName ?? '—'}</dd></div>
      <div><dt>{zh ? '核定補助款' : 'Approved subsidy'}</dt><dd>{money(record.approvedSubsidyNtd, language)}</dd></div><div><dt>{zh ? '自籌款' : 'Self-funded amount'}</dt><dd>{money(record.selfFundedAmountNtd, language)}</dd></div>
      <div><dt>{zh ? '總經費' : 'Total project budget'}</dt><dd>{money(record.totalProjectBudgetNtd, language)}</dd></div><div><dt>{zh ? '計畫期間' : 'Project period'}</dt><dd>{record.projectStartDate ?? record.projectStartDateRaw ?? '—'} – {record.projectEndDate ?? record.projectEndDateRaw ?? '—'}</dd></div></dl>
  </article>)}{!records.length && <p className="empty">{zh ? '沒有符合條件的紀錄。' : 'No records match these filters.'}</p>}
    {limit < records.length && <button className="load-more" onClick={() => setLimit(limit + 60)}>{zh ? '載入更多' : 'Load more'} · {records.length - limit}</button>}</div>;
}

export default function IndustryModule({ records, summary, language }: { records: IndustryGrantRecipient[]; summary: IndustryGrantSummary; language: Language }) {
  const zh = language === 'zh';
  const [view, setView] = useState<'overview' | 'map' | 'categories' | 'directory'>('overview');
  const [filters, setFilters] = useState(emptyFilters);
  const filtered = useMemo(() => filterIndustryGrants(records, filters), [records, filters]);
  const activeSummary = useMemo(() => Object.values(filters).some(Boolean) ? buildIndustryGrantSummary(filtered) : summary, [filtered, filters, summary]);
  const openDistrict = (district: string) => { setFilters({ ...emptyFilters, district }); setView('directory'); };
  const views = [['overview', zh ? '補助總覽' : 'Grant Overview'], ['map', zh ? '行政區分布' : 'District Distribution'], ['categories', zh ? '產業類別' : 'Industry Categories'], ['directory', zh ? '廠商名冊' : 'Company Directory']] as const;
  return <><GrantFilters filters={filters} setFilters={setFilters} records={records} language={language} />
    <section className="workspace"><div className="section-heading"><p>02 / INDUSTRY GRANTS</p><h2>{zh ? '產業補助廠商' : 'Industry Grant Recipients'}</h2>
      <span>{zh ? '探索臺北市產業發展獎勵補助計畫之獲補助廠商、產業類別、補助金額與行政區分布' : 'Explore Taipei industry development grant recipient companies, industry categories, subsidy amounts, and district distribution'}</span></div>
      <div className="subtabs">{views.map(([id, label]) => <button className={view === id ? 'active' : ''} onClick={() => setView(id)} key={id}>{label}</button>)}</div>
      <div className="notice subtle">{zh ? '產業補助資料僅供公開資料探索，不代表投資建議、企業評價、政策成效判斷或官方背書。' : 'Industry grant data is for public-data exploration only. It is not investment advice, company evaluation, policy-effectiveness assessment, or official endorsement.'}</div>
      {view === 'overview' && <GrantOverview summary={activeSummary} records={filtered} language={language} />}
      {view === 'map' && <GrantMap summary={activeSummary} records={filtered} language={language} viewDistrict={openDistrict} />}
      {view === 'categories' && <div className="chart-grid"><BarChart language={language} currency title={zh ? '各產業類別核定補助款' : 'Approved subsidy by industry category'} data={activeSummary.byIndustryCategory.map((item) => ({ label: item.industryCategory, value: item.approvedSubsidyNtd }))} /><BarChart language={language} title={zh ? '各產業類別補助紀錄數' : 'Records by industry category'} data={activeSummary.byIndustryCategory.map((item) => ({ label: item.industryCategory, value: item.recordCount }))} /></div>}
      {view === 'directory' && <><div className="section-heading inline"><div /><strong>{filtered.length.toLocaleString()} <span>{zh ? '筆符合紀錄' : 'matching records'}</span></strong></div><CompanyDirectory records={filtered} language={language} /></>}
    </section></>;
}
