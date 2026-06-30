import { useEffect, useMemo, useState } from 'react';
import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet';
import { DISTRICTS, TAIPEI_DISTRICT_CENTROIDS } from './lib/civicGroups';
import {
  buildElderlyWelfareInstitutionSummary,
  ELDERLY_ATTRIBUTE_LABELS_EN,
  ELDERLY_ATTRIBUTE_LABELS_ZH,
  ELDERLY_CARE_LABELS_EN,
  ELDERLY_CARE_LABELS_ZH,
  filterElderlyWelfareInstitutions,
} from './lib/elderlyWelfareInstitutions';
import type { ElderlyWelfareCareRecipientCategory, ElderlyWelfareInstitutionAttribute, ElderlyWelfareInstitutionFilters, ElderlyWelfareInstitutionRecord, ElderlyWelfareInstitutionSummary, Language } from './types';

const emptyFilters: ElderlyWelfareInstitutionFilters = { search: '', institutionAttribute: '', district: '', careRecipientCategory: '', roadName: '', hasPhone: '', hasLongTermCareBeds: '', hasNursingCareBeds: '', hasDementiaCareBeds: '', hasResidentialCareBeds: '', approvedMin: '', approvedMax: '', bedCountMismatch: '' };
const attrs = Object.keys(ELDERLY_ATTRIBUTE_LABELS_ZH) as ElderlyWelfareInstitutionAttribute[];
const cares = Object.keys(ELDERLY_CARE_LABELS_ZH) as ElderlyWelfareCareRecipientCategory[];
const fmt = (value?: number) => value === undefined ? '-' : value.toLocaleString();
const attrLabels = (language: Language) => language === 'zh' ? ELDERLY_ATTRIBUTE_LABELS_ZH : ELDERLY_ATTRIBUTE_LABELS_EN;
const careLabels = (language: Language) => language === 'zh' ? ELDERLY_CARE_LABELS_ZH : ELDERLY_CARE_LABELS_EN;
const disclaimer = (zh: boolean) => zh ? '老人福利機構名冊為臺北市公開資料中的老人福利機構資料，僅供查詢屬性、機構名稱、區域別、地址、電話、收容對象與核定床位數等來源欄位使用，不代表即時營運狀態、即時空床、收住資格、收費標準、補助資格、照護品質、推薦排名、醫療建議、長照建議、法律意見或官方背書。實際服務內容、收住條件、床位狀況、收費、補助、評鑑與最新資料請以機構、臺北市政府社會局、衛生福利部或主管機關公告為準。' : 'Elderly welfare institution directory data is Taipei public-data information about elderly welfare institutions. It is for looking up source fields such as institution attribute, institution name, district, address, phone, care recipient category, and approved bed counts only. It does not represent real-time operating status, real-time vacancies, admission eligibility, fees, subsidy eligibility, care quality, recommendation ranking, medical advice, long-term care advice, legal advice, or official endorsement. Actual services, admission conditions, bed availability, fees, subsidies, evaluations, and latest information should be verified with the institution, Taipei City Department of Social Welfare, Ministry of Health and Welfare, or competent-authority announcements.';
const mapNotice = (zh: boolean) => zh ? '老人福利機構名冊資料未提供官方經緯度，地圖以行政區彙總呈現，不代表精確機構位置、即時空床或服務可用性。' : 'Elderly welfare institution data does not provide official coordinates. The map shows district-level summaries and does not represent exact institution locations, real-time vacancies, or service availability.';

function BarChart({ title, data }: { title: string; data: Array<{ label: string; value: number }> }) {
  const max = Math.max(...data.map((item) => item.value), 1);
  return <section className="chart"><h3>{title}</h3><div className="bars">{data.map((item) => <div className="bar-row wide-label" key={item.label}><span title={item.label}>{item.label}</span><div><i style={{ width: `${Math.max(2, item.value / max * 100)}%` }} /></div><b>{fmt(item.value)}</b></div>)}</div></section>;
}

function Filters({ filters, setFilters, records, language }: { filters: ElderlyWelfareInstitutionFilters; setFilters: (filters: ElderlyWelfareInstitutionFilters) => void; records: ElderlyWelfareInstitutionRecord[]; language: Language }) {
  const zh = language === 'zh', update = (key: keyof ElderlyWelfareInstitutionFilters, value: string) => setFilters({ ...filters, [key]: value });
  const options = <T extends string>(values: Array<T | undefined>) => [...new Set(values.filter(Boolean) as T[])].sort((a, b) => a.localeCompare(b));
  const yesNo = <><option value="">{zh ? '全部' : 'All'}</option><option value="yes">{zh ? '有' : 'Yes'}</option><option value="no">{zh ? '無' : 'No'}</option></>;
  return <aside className="filters"><label className="search"><span aria-hidden="true">⌕</span><input value={filters.search} onChange={(event) => update('search', event.target.value)} placeholder={zh ? '搜尋機構名稱、屬性、行政區、地址、電話或收容對象' : 'Search institution name, attribute, district, address, phone, or care recipient category'} /></label>
    <div className="filter-grid grant-filters">
      <label>{zh ? '屬性' : 'Attribute'}<select value={filters.institutionAttribute} onChange={(event) => update('institutionAttribute', event.target.value)}><option value="">{zh ? '全部' : 'All'}</option>{attrs.map((key) => <option value={key} key={key}>{attrLabels(language)[key]}</option>)}</select></label>
      <label>{zh ? '行政區' : 'District'}<select value={filters.district} onChange={(event) => update('district', event.target.value)}><option value="">{zh ? '全部' : 'All'}</option>{DISTRICTS.map((district) => <option key={district}>{district}</option>)}</select></label>
      <label>{zh ? '收容對象' : 'Care recipient category'}<select value={filters.careRecipientCategory} onChange={(event) => update('careRecipientCategory', event.target.value)}><option value="">{zh ? '全部' : 'All'}</option>{cares.map((key) => <option value={key} key={key}>{careLabels(language)[key]}</option>)}</select></label>
      <label>{zh ? '道路' : 'Road'}<select value={filters.roadName} onChange={(event) => update('roadName', event.target.value)}><option value="">{zh ? '全部' : 'All'}</option>{options(records.map((record) => record.roadName)).map((road) => <option key={road}>{road}</option>)}</select></label>
      <label>{zh ? '有電話' : 'Has phone'}<select value={filters.hasPhone} onChange={(event) => update('hasPhone', event.target.value)}>{yesNo}</select></label>
      <label>{zh ? '有長照床位' : 'Has long-term care beds'}<select value={filters.hasLongTermCareBeds} onChange={(event) => update('hasLongTermCareBeds', event.target.value)}>{yesNo}</select></label>
      <label>{zh ? '有養護床位' : 'Has nursing care beds'}<select value={filters.hasNursingCareBeds} onChange={(event) => update('hasNursingCareBeds', event.target.value)}>{yesNo}</select></label>
      <label>{zh ? '有失智床位' : 'Has dementia care beds'}<select value={filters.hasDementiaCareBeds} onChange={(event) => update('hasDementiaCareBeds', event.target.value)}>{yesNo}</select></label>
      <label>{zh ? '有安養床位' : 'Has residential care beds'}<select value={filters.hasResidentialCareBeds} onChange={(event) => update('hasResidentialCareBeds', event.target.value)}>{yesNo}</select></label>
      <label>{zh ? '最小核定床位' : 'Min approved beds'}<input type="number" value={filters.approvedMin} onChange={(event) => update('approvedMin', event.target.value)} /></label>
      <label>{zh ? '最大核定床位' : 'Max approved beds'}<input type="number" value={filters.approvedMax} onChange={(event) => update('approvedMax', event.target.value)} /></label>
      <label>{zh ? '床位數加總不一致' : 'Bed-count mismatch'}<select value={filters.bedCountMismatch} onChange={(event) => update('bedCountMismatch', event.target.value)}>{yesNo}</select></label>
    </div>{Object.values(filters).some(Boolean) && <button className="text-button" onClick={() => setFilters(emptyFilters)}>{zh ? '清除篩選' : 'Clear filters'}</button>}</aside>;
}

function Overview({ summary, language }: { summary: ElderlyWelfareInstitutionSummary; language: Language }) {
  const zh = language === 'zh';
  const count = (attr: ElderlyWelfareInstitutionAttribute) => summary.byInstitutionAttribute.find((item) => item.institutionAttribute === attr)?.count ?? 0;
  return <><div className="notice subtle">{disclaimer(zh)}</div><div className="summary-grid">{[
    [zh ? '老人福利機構數' : 'Elderly welfare institution count', summary.totalRecords],
    [zh ? '涵蓋行政區數' : 'Districts covered', summary.districtCount],
    [zh ? '公立機構數' : 'Public institution count', count('public')],
    [zh ? '公設民營機構數' : 'Public-owned privately operated count', count('public_private_operated')],
    [zh ? '私立機構數' : 'Private institution count', count('private')],
    [zh ? '核定總床位數' : 'Approved total beds', summary.totalApprovedBeds],
    [zh ? '長照床位數' : 'Long-term care beds', summary.totalLongTermCareBeds],
    [zh ? '養護床位數' : 'Nursing care beds', summary.totalNursingCareBeds],
    [zh ? '失智床位數' : 'Dementia care beds', summary.totalDementiaCareBeds],
    [zh ? '安養床位數' : 'Residential care beds', summary.totalResidentialCareBeds],
    [zh ? '機構最多行政區' : 'Top district by institution count', summary.byDistrict[0]?.district ?? '-'],
    [zh ? '床位最多行政區' : 'Top district by approved beds', [...summary.byDistrict].sort((a, b) => b.approvedTotalBedCount - a.approvedTotalBedCount)[0]?.district ?? '-'],
  ].map(([label, value]) => <article key={label}><span>{label}</span><strong>{typeof value === 'number' ? fmt(value) : value}</strong></article>)}</div>
    <div className="chart-grid"><BarChart title={zh ? '各行政區老人福利機構數' : 'Institutions by district'} data={summary.byDistrict.map((item) => ({ label: item.district, value: item.institutionCount }))} /><BarChart title={zh ? '各行政區核定總床位數' : 'Approved beds by district'} data={summary.byDistrict.map((item) => ({ label: item.district, value: item.approvedTotalBedCount }))} /><BarChart title={zh ? '各屬性機構數' : 'Institutions by attribute'} data={summary.byInstitutionAttribute.map((item) => ({ label: attrLabels(language)[item.institutionAttribute], value: item.count }))} /><BarChart title={zh ? '收容對象分布' : 'Care recipient categories'} data={summary.byCareRecipientCategory.map((item) => ({ label: careLabels(language)[item.careRecipientCategory], value: item.count }))} /></div></>;
}

function DistrictMap({ summary, language, openDistrict }: { summary: ElderlyWelfareInstitutionSummary; language: Language; openDistrict: (district: string) => void }) {
  const zh = language === 'zh';
  const [metric, setMetric] = useState<'institutionCount' | 'approvedTotalBedCount' | 'longTermCareBedCount' | 'nursingCareBedCount' | 'dementiaCareBedCount' | 'residentialCareBedCount'>('institutionCount');
  const max = Math.max(...summary.byDistrict.map((item) => item[metric]), 1);
  return <div className="map-wrap"><div className="notice">{mapNotice(zh)}</div><label className="metric-toggle">{zh ? '地圖指標' : 'Map metric'}<select value={metric} onChange={(event) => setMetric(event.target.value as typeof metric)}><option value="institutionCount">{zh ? '機構數' : 'Institution count'}</option><option value="approvedTotalBedCount">{zh ? '核定總床位' : 'Approved beds'}</option><option value="longTermCareBedCount">{zh ? '長照床位' : 'Long-term care beds'}</option><option value="nursingCareBedCount">{zh ? '養護床位' : 'Nursing care beds'}</option><option value="dementiaCareBedCount">{zh ? '失智床位' : 'Dementia beds'}</option><option value="residentialCareBedCount">{zh ? '安養床位' : 'Residential beds'}</option></select></label><MapContainer center={[25.072, 121.54]} zoom={11} scrollWheelZoom={false}><TileLayer attribution='&copy; OpenStreetMap contributors &copy; CARTO' url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />{summary.byDistrict.map((district) => { const point = TAIPEI_DISTRICT_CENTROIDS[district.district]; return point && <CircleMarker key={district.district} center={[point.latitude, point.longitude]} radius={Math.max(8, Math.sqrt(district[metric] / max) * 30)} pathOptions={{ fillColor: '#6f8f72', fillOpacity: .72, color: '#fff7e8', weight: 2 }}><Popup><div className="map-popup"><strong>{district.district}</strong><p>{zh ? '機構數' : 'Institutions'}: {fmt(district.institutionCount)}</p><p>{zh ? '核定總床位' : 'Approved beds'}: {fmt(district.approvedTotalBedCount)}</p><small>{zh ? '本圖以行政區彙總呈現，不代表精確機構位置、即時空床或服務可用性。' : 'This map shows district-level summaries and does not represent exact institution locations, real-time vacancies, or service availability.'}</small><button onClick={() => openDistrict(district.district)}>{zh ? '查看清單' : 'View directory'}</button></div></Popup></CircleMarker>; })}</MapContainer></div>;
}

function Directory({ records, language }: { records: ElderlyWelfareInstitutionRecord[]; language: Language }) {
  const zh = language === 'zh';
  const [limit, setLimit] = useState(80);
  useEffect(() => setLimit(80), [records]);
  return <><h3>{zh ? '老人福利機構清單' : 'Elderly Welfare Institution Directory'}</h3><div className="comparison-scroll procurement-table"><table><thead><tr>{(zh ? ['機構名稱', '屬性', '區域別', '地址', '電話', '收容對象', '核定總床位數量', '地圖查詢', '來源明細'] : ['Institution name', 'Attribute', 'District', 'Address', 'Phone', 'Care recipients', 'Approved total beds', 'Map lookup', 'Source details']).map((label) => <th key={label}>{label}</th>)}</tr></thead><tbody>{records.slice(0, limit).map((record) => <tr key={record.id}><th>{record.institutionName}</th><td>{attrLabels(language)[record.institutionAttribute]}</td><td>{record.district ?? '-'}</td><td>{record.address ?? '-'}</td><td>{record.phoneDialHref ? <a href={record.phoneDialHref}>{record.phoneDisplay ?? record.phone}</a> : record.phoneDisplay ?? record.phone ?? '-'}</td><td>{record.careRecipientCategories.map((item) => careLabels(language)[item]).join('、')}</td><td>{fmt(record.approvedTotalBedCount)}</td><td>{record.googleMapsQuery ? <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(record.googleMapsQuery)}`} target="_blank" rel="noreferrer">{zh ? '地圖查詢' : 'Map lookup'}</a> : '-'}</td><td><details><summary>{zh ? '來源明細' : 'Source details'}</summary><dl><div><dt>{zh ? '編號' : 'Sequence number'}</dt><dd>{record.sourceSequenceNumber ?? '-'}</dd></div><div><dt>{zh ? '長照床位' : 'Long-term care beds'}</dt><dd>{fmt(record.longTermCareBedCount)}</dd></div><div><dt>{zh ? '養護床位' : 'Nursing care beds'}</dt><dd>{fmt(record.nursingCareBedCount)}</dd></div><div><dt>{zh ? '失智床位' : 'Dementia beds'}</dt><dd>{fmt(record.dementiaCareBedCount)}</dd></div><div><dt>{zh ? '安養床位' : 'Residential beds'}</dt><dd>{fmt(record.residentialCareBedCount)}</dd></div><div><dt>{zh ? '床位加總' : 'Computed bed count'}</dt><dd>{fmt(record.computedTotalBedCount)}</dd></div><div><dt>{zh ? '床位數加總不一致' : 'Bed-count mismatch'}</dt><dd>{record.bedCountMismatch ? (zh ? '是' : 'Yes') : (zh ? '否' : 'No')}</dd></div><div><dt>{zh ? '道路' : 'Road'}</dt><dd>{record.roadName ?? '-'}</dd></div><div><dt>{zh ? '電話類型' : 'Phone type'}</dt><dd>{record.phoneType}</dd></div><div><dt>{zh ? '資料來源' : 'Source'}</dt><dd>{record.source}</dd></div><div><dt>{zh ? '來源機關' : 'Source agency'}</dt><dd>{record.sourceAgency}</dd></div><div><dt>{zh ? '解讀限制' : 'Disclaimer'}</dt><dd>{disclaimer(zh)}</dd></div></dl></details></td></tr>)}</tbody></table></div>{!records.length && <p className="empty">{zh ? '沒有符合條件的紀錄。' : 'No records match these filters.'}</p>}{limit < records.length && <button className="load-more" onClick={() => setLimit(limit + 80)}>{zh ? '載入更多' : 'Load more'} · {records.length - limit}</button>}</>;
}

export default function ElderlyWelfareInstitutionsModule({ records, summary, language }: { records: ElderlyWelfareInstitutionRecord[]; summary: ElderlyWelfareInstitutionSummary; language: Language }) {
  const zh = language === 'zh';
  const [view, setView] = useState<'overview' | 'districts' | 'attributes' | 'care' | 'beds' | 'directory' | 'notes'>('overview');
  const [filters, setFilters] = useState(emptyFilters);
  const filtered = useMemo(() => filterElderlyWelfareInstitutions(records, filters, language), [records, filters, language]);
  const activeSummary = useMemo(() => Object.values(filters).some(Boolean) ? buildElderlyWelfareInstitutionSummary(filtered) : summary, [filtered, filters, summary]);
  const openDistrict = (district: string) => { setFilters({ ...emptyFilters, district }); setView('directory'); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const views = [['overview', zh ? '總覽' : 'Overview'], ['districts', zh ? '行政區分布' : 'District Distribution'], ['attributes', zh ? '機構屬性' : 'Institution Attributes'], ['care', zh ? '收容對象' : 'Care Recipient Categories'], ['beds', zh ? '床位統計' : 'Bed Counts'], ['directory', zh ? '機構清單' : 'Institution Directory'], ['notes', zh ? '資料說明' : 'Data Notes']] as const;
  return <><Filters filters={filters} setFilters={setFilters} records={records} language={language} /><section className="workspace"><div className="section-heading"><p>06 / SOCIAL WELFARE & CARE SERVICE PUBLIC RECORDS</p><h2>{zh ? '老人福利機構名冊' : 'Elderly Welfare Institutions'}</h2><span>{zh ? '查詢臺北市老人福利機構名冊，包含屬性、機構名稱、區域別、地址、電話、收容對象與核定床位數等公開資料。' : 'Look up Taipei elderly welfare institution directory records, including institution attribute, institution name, district, address, phone, care recipient category, and approved bed counts.'}</span></div>
    <div className="subtabs">{views.map(([id, label]) => <button className={view === id ? 'active' : ''} onClick={() => setView(id)} key={id}>{label}</button>)}</div>
    <div className="section-heading inline"><div><p>{zh ? '篩選結果' : 'Filtered records'}</p></div><strong>{filtered.length.toLocaleString()} <span>{zh ? '筆' : 'records'}</span></strong></div>
    {view === 'overview' && <Overview summary={activeSummary} language={language} />}
    {view === 'districts' && <DistrictMap summary={activeSummary} language={language} openDistrict={openDistrict} />}
    {view === 'attributes' && <div className="chart-grid"><BarChart title={zh ? '各屬性機構數' : 'Institutions by attribute'} data={activeSummary.byInstitutionAttribute.map((item) => ({ label: attrLabels(language)[item.institutionAttribute], value: item.count }))} /><BarChart title={zh ? '各屬性核定床位數' : 'Approved beds by attribute'} data={activeSummary.byInstitutionAttribute.map((item) => ({ label: attrLabels(language)[item.institutionAttribute], value: item.approvedTotalBedCount }))} /></div>}
    {view === 'care' && <div className="chart-grid"><BarChart title={zh ? '收容對象分布' : 'Care recipient category distribution'} data={activeSummary.byCareRecipientCategory.map((item) => ({ label: careLabels(language)[item.careRecipientCategory], value: item.count }))} /></div>}
    {view === 'beds' && <><div className="notice subtle">{zh ? '此圖僅整理老人福利機構名冊公開資料中的床位數，不代表即時空床、收住資格、收費標準、補助資格、照護品質、推薦排名、醫療建議或長照建議。' : 'This chart only organizes bed-count fields from elderly welfare institution public data. It does not represent real-time vacancies, admission eligibility, fees, subsidy eligibility, care quality, recommendation ranking, medical advice, or long-term care advice.'}</div><div className="chart-grid"><BarChart title={zh ? '床位類型分布' : 'Bed type distribution'} data={[{ label: zh ? '長照' : 'Long-term care', value: activeSummary.totalLongTermCareBeds }, { label: zh ? '養護' : 'Nursing care', value: activeSummary.totalNursingCareBeds }, { label: zh ? '失智' : 'Dementia care', value: activeSummary.totalDementiaCareBeds }, { label: zh ? '安養' : 'Residential care', value: activeSummary.totalResidentialCareBeds }]} /><BarChart title={zh ? '核定床位數最多機構' : 'Top institutions by approved beds'} data={activeSummary.topInstitutionsByApprovedBeds.slice(0, 20).map((item) => ({ label: item.institutionName, value: item.approvedTotalBedCount ?? 0 }))} /></div></>}
    {view === 'directory' && <Directory records={filtered} language={language} />}
    {view === 'notes' && <div className="notes-grid"><article><h3>{zh ? '資料來源與限制' : 'Source and limits'}</h3><p>{disclaimer(zh)}</p></article><article><h3>{zh ? '處理方式' : 'Processing'}</h3><p>{zh ? '資料未提供官方經緯度，因此地圖以行政區彙總呈現；清單提供地址外部地圖查詢，不建立精確內部點位。老人福利機構與準公共化托嬰中心、通訊心理諮商機構、預防接種合約院所資料性質不同，不應直接合併比較服務容量或品質。' : 'The data has no official coordinates, so the map shows district summaries only. The directory provides external address map lookup and does not create exact internal points. Elderly welfare institutions, quasi-public infant care centers, telepsychology institutions, and contracted vaccination providers have different meanings and should not be directly merged for service capacity or quality comparison.'}</p></article></div>}
  </section></>;
}
