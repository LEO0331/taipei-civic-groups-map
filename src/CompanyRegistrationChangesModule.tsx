import { useEffect, useMemo, useState } from 'react';
import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet';
import { DISTRICTS } from './lib/civicGroups';
import {
  buildCompanyRegistrationChangeSummary,
  COMPANY_CHANGE_EVENT_LABELS_EN,
  COMPANY_CHANGE_EVENT_LABELS_ZH,
  filterCompanyRegistrationChanges,
  haversineDistanceMeters,
} from './lib/companyRegistrationChanges';
import type { BusinessRegistrationChangeSummary, CompanyRegistrationChangeEventType, CompanyRegistrationChangeFilters, CompanyRegistrationChangeRecord, CompanyRegistrationChangeSummary, Language } from './types';

const emptyFilters: CompanyRegistrationChangeFilters = { search: '', eventType: '', eventYear: '', eventMonth: '', eventFrom: '', eventTo: '', district: '', roadName: '', hasUnifiedBusinessNumber: '', hasValidCoordinates: '', coordinateStatus: '', resourceName: '' };
const eventTypes = Object.keys(COMPANY_CHANGE_EVENT_LABELS_ZH) as CompanyRegistrationChangeEventType[];
const fmt = (value?: number) => value === undefined ? '-' : value.toLocaleString();
const labels = (language: Language) => language === 'zh' ? COMPANY_CHANGE_EVENT_LABELS_ZH : COMPANY_CHANGE_EVENT_LABELS_EN;
const notice = (zh: boolean) => zh ? '公司設立、變更及解散登記異動資料清冊為臺北市公開資料中的核准公司登記異動資料，僅供查詢統一編號、公司名稱、公司地址、核准日期、核准變更日期、核准解散日期與來源座標等欄位使用，不代表即時營業狀態、完整公司登記資料、法規遵循判定、信用評等、投資訊號、公司推薦、法律意見、財務建議或官方背書。實際公司登記狀態、營業狀態、負責人、登記事項與最新資料請以主管機關、商工登記查詢系統及官方公告為準。' : 'Company establishment, modification, and dissolution registration change records are Taipei public-data records of approved company registration changes. They are for looking up source fields such as unified business number, company name, company address, approval date, modification approval date, dissolution approval date, and source coordinates only. They do not represent real-time operating status, complete company registration information, legal compliance determination, credit rating, investment signal, company recommendation, legal advice, financial advice, or official endorsement. Actual company registration status, operating status, responsible person, registered matters, and latest information should be verified with competent authorities, official business registration query systems, and official announcements.';
const popupNotice = (zh: boolean) => zh ? '點位與異動日期僅依來源資料呈現，不代表即時營業狀態、完整登記內容、信用狀態、投資訊號、法律意見或官方背書。' : 'The point and change date are shown only from source data. They do not represent real-time operating status, complete registration information, credit status, investment signals, legal advice, or official endorsement.';

function BarChart({ title, data }: { title: string; data: Array<{ label: string; value: number }> }) {
  const max = Math.max(...data.map((item) => item.value), 1);
  return <section className="chart"><h3>{title}</h3><div className="bars">{data.map((item) =>
    <div className="bar-row wide-label" key={item.label}><span title={item.label}>{item.label}</span><div><i style={{ width: `${Math.max(2, item.value / max * 100)}%` }} /></div><b>{fmt(item.value)}</b></div>)}</div></section>;
}

function Filters({ filters, setFilters, records, language }: { filters: CompanyRegistrationChangeFilters; setFilters: (filters: CompanyRegistrationChangeFilters) => void; records: CompanyRegistrationChangeRecord[]; language: Language }) {
  const zh = language === 'zh', update = (key: keyof CompanyRegistrationChangeFilters, value: string) => setFilters({ ...filters, [key]: value });
  const options = <T extends string>(values: Array<T | undefined>) => [...new Set(values.filter(Boolean) as T[])].sort((a, b) => a.localeCompare(b));
  const eventLabels = labels(language), yesNo = <><option value="">{zh ? '全部' : 'All'}</option><option value="yes">{zh ? '有' : 'Yes'}</option><option value="no">{zh ? '無' : 'No'}</option></>;
  return <aside className="filters"><label className="search"><span aria-hidden="true">⌕</span><input value={filters.search} onChange={(event) => update('search', event.target.value)} placeholder={zh ? '搜尋統一編號、公司名稱、地址、行政區或異動日期' : 'Search business number, company name, address, district, or change date'} /></label>
    <div className="filter-grid grant-filters">
      <label>{zh ? '異動類型' : 'Change type'}<select value={filters.eventType} onChange={(event) => update('eventType', event.target.value)}><option value="">{zh ? '全部' : 'All'}</option>{eventTypes.map((key) => <option value={key} key={key}>{eventLabels[key]}</option>)}</select></label>
      <label>{zh ? '行政區' : 'District'}<select value={filters.district} onChange={(event) => update('district', event.target.value)}><option value="">{zh ? '全部' : 'All'}</option>{DISTRICTS.map((district) => <option key={district}>{district}</option>)}</select></label>
      <label>{zh ? '道路' : 'Road'}<select value={filters.roadName} onChange={(event) => update('roadName', event.target.value)}><option value="">{zh ? '全部' : 'All'}</option>{options(records.map((record) => record.roadName)).map((road) => <option key={road}>{road}</option>)}</select></label>
      <label>{zh ? '異動年度' : 'Change year'}<select value={filters.eventYear} onChange={(event) => update('eventYear', event.target.value)}><option value="">{zh ? '全部' : 'All'}</option>{options(records.map((record) => record.eventYear ? String(record.eventYear) : undefined)).map((year) => <option key={year}>{year}</option>)}</select></label>
      <label>{zh ? '異動月份' : 'Change month'}<select value={filters.eventMonth} onChange={(event) => update('eventMonth', event.target.value)}><option value="">{zh ? '全部' : 'All'}</option>{options(records.map((record) => record.eventMonthKey)).map((month) => <option key={month}>{month}</option>)}</select></label>
      <label>{zh ? '起始日期' : 'Change from'}<input type="date" value={filters.eventFrom} onChange={(event) => update('eventFrom', event.target.value)} /></label>
      <label>{zh ? '結束日期' : 'Change to'}<input type="date" value={filters.eventTo} onChange={(event) => update('eventTo', event.target.value)} /></label>
      <label>{zh ? '有統一編號' : 'Has unified business number'}<select value={filters.hasUnifiedBusinessNumber} onChange={(event) => update('hasUnifiedBusinessNumber', event.target.value)}>{yesNo}</select></label>
      <label>{zh ? '有有效座標' : 'Has valid coordinates'}<select value={filters.hasValidCoordinates} onChange={(event) => update('hasValidCoordinates', event.target.value)}>{yesNo}</select></label>
      <label>{zh ? '座標狀態' : 'Coordinate status'}<select value={filters.coordinateStatus} onChange={(event) => update('coordinateStatus', event.target.value)}><option value="">{zh ? '全部' : 'All'}</option>{['valid', 'missing', 'outlier', 'unparsed'].map((status) => <option key={status}>{status}</option>)}</select></label>
      <label>{zh ? '來源檔案' : 'Source resource'}<select value={filters.resourceName} onChange={(event) => update('resourceName', event.target.value)}><option value="">{zh ? '全部' : 'All'}</option>{options(records.map((record) => record.resourceName)).map((resource) => <option key={resource}>{resource}</option>)}</select></label>
    </div>{Object.values(filters).some(Boolean) && <button className="text-button" onClick={() => setFilters(emptyFilters)}>{zh ? '清除篩選' : 'Clear filters'}</button>}</aside>;
}

function Overview({ summary, language }: { summary: CompanyRegistrationChangeSummary; language: Language }) {
  const zh = language === 'zh', eventLabels = labels(language);
  const count = (type: CompanyRegistrationChangeEventType) => summary.byEventType.find((item) => item.eventType === type)?.count ?? 0;
  return <><div className="notice subtle">{notice(zh)}</div>
    <div className="summary-grid">{[
      [zh ? '公司異動紀錄數' : 'Company change record count', summary.totalRecords],
      [zh ? '設立紀錄數' : 'Establishment records', count('establishment')],
      [zh ? '變更紀錄數' : 'Modification records', count('modification')],
      [zh ? '解散紀錄數' : 'Dissolution records', count('dissolution')],
      [zh ? '涵蓋行政區數' : 'Districts covered', summary.districtCount],
      [zh ? '有效座標數' : 'Valid coordinate count', summary.recordsWithValidCoordinates],
      [zh ? '有統一編號紀錄' : 'Records with unified business number', summary.recordsWithUnifiedBusinessNumber],
      [zh ? '最新異動月份' : 'Latest change month', summary.latestEventMonth ?? '-'],
      [zh ? '異動最多行政區' : 'Top district by change count', summary.byDistrict[0]?.district ?? '-'],
      [zh ? '異動最多道路' : 'Top road by change count', summary.byRoadName[0]?.roadName ?? '-'],
    ].map(([label, value]) => <article key={label}><span>{label}</span><strong>{typeof value === 'number' ? fmt(value) : value}</strong></article>)}</div>
    <div className="chart-grid"><BarChart title={zh ? '各異動類型公司紀錄數' : 'Company changes by event type'} data={summary.byEventType.map((item) => ({ label: eventLabels[item.eventType], value: item.count }))} /><BarChart title={zh ? '各行政區公司異動紀錄數' : 'Company changes by district'} data={summary.byDistrict.map((item) => ({ label: item.district, value: item.totalCount }))} /><BarChart title={zh ? '各月份公司異動紀錄數' : 'Company changes by month'} data={summary.byMonth.map((item) => ({ label: item.monthKey, value: item.totalCount }))} /><BarChart title={zh ? '公司異動座標有無' : 'Company change coordinate availability'} data={Object.entries(summary.coordinateQuality).map(([label, value]) => ({ label, value }))} /></div></>;
}

function ChangeMap({ records, language }: { records: CompanyRegistrationChangeRecord[]; language: Language }) {
  const zh = language === 'zh', eventLabels = labels(language);
  const color = (type: CompanyRegistrationChangeEventType) => type === 'establishment' ? '#2f7f90' : type === 'modification' ? '#c9892b' : type === 'dissolution' ? '#b85c38' : '#777';
  const points = records.filter((record) => record.coordinateStatus === 'valid' && record.latitude !== undefined && record.longitude !== undefined).slice(0, 1400);
  return <div className="map-wrap"><div className="notice">{popupNotice(zh)}</div><MapContainer center={[25.072, 121.54]} zoom={11} scrollWheelZoom={false}><TileLayer attribution='&copy; OpenStreetMap contributors &copy; CARTO' url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />{points.map((record) => <CircleMarker key={record.id} center={[record.latitude!, record.longitude!]} radius={5} pathOptions={{ fillColor: color(record.eventType), fillOpacity: .7, color: '#fff7e8', weight: 1 }}><Popup><div className="map-popup"><strong>{record.companyName}</strong><p>{zh ? '異動類型' : 'Change type'}: {eventLabels[record.eventType]}</p><p>{zh ? '統一編號' : 'Unified business number'}: {record.unifiedBusinessNumber ?? '-'}</p><p>{zh ? '公司地址' : 'Company address'}: {record.companyAddress ?? '-'}</p><p>{zh ? '異動日期' : 'Change date'}: {record.eventDate ?? record.eventDateRaw ?? '-'}</p><p>{zh ? '資料來源' : 'Source'}: {record.source}</p><small>{popupNotice(zh)}</small></div></Popup></CircleMarker>)}</MapContainer></div>;
}

function Directory({ records, language }: { records: CompanyRegistrationChangeRecord[]; language: Language }) {
  const zh = language === 'zh', eventLabels = labels(language);
  const [limit, setLimit] = useState(80);
  useEffect(() => setLimit(80), [records]);
  return <><h3>{zh ? '公司異動清冊' : 'Company Change Directory'}</h3><div className="comparison-scroll procurement-table"><table><thead><tr>{(zh ? ['異動類型', '異動日期', '統一編號', '公司名稱', '行政區', '公司地址', '地圖', '來源明細'] : ['Change type', 'Change date', 'Unified business number', 'Company name', 'District', 'Company address', 'Map', 'Source details']).map((label) => <th key={label}>{label}</th>)}</tr></thead><tbody>{records.slice(0, limit).map((record) => <tr key={record.id}><td>{eventLabels[record.eventType]}</td><td>{record.eventDate ?? record.eventDateRaw ?? '-'}</td><td>{record.unifiedBusinessNumber ?? '-'}</td><th>{record.companyName}</th><td>{record.district ?? '-'}</td><td>{record.companyAddress ?? '-'}</td><td>{record.hasCoordinates ? <a href={`https://www.google.com/maps/search/?api=1&query=${record.latitude},${record.longitude}`} target="_blank" rel="noreferrer">{zh ? '地圖' : 'Map'}</a> : '-'}</td><td><details><summary>{zh ? '來源明細' : 'Source details'}</summary><dl><div><dt>{zh ? '來源檔案' : 'Source resource'}</dt><dd>{record.resourceName}</dd></div><div><dt>{zh ? '核准日期' : 'Approval date'}</dt><dd>{record.approvalDate ?? record.approvalDateRaw ?? '-'}</dd></div><div><dt>{zh ? '核准變更日期' : 'Modification approval date'}</dt><dd>{record.modificationApprovalDate ?? record.modificationApprovalDateRaw ?? '-'}</dd></div><div><dt>{zh ? '核准解散日期' : 'Dissolution approval date'}</dt><dd>{record.dissolutionApprovalDate ?? record.dissolutionApprovalDateRaw ?? '-'}</dd></div><div><dt>{zh ? '標準化名稱' : 'Normalized company name'}</dt><dd>{record.companyNameNormalized ?? '-'}</dd></div><div><dt>{zh ? '道路' : 'Road'}</dt><dd>{record.roadName ?? '-'}</dd></div><div><dt>{zh ? '來源經度' : 'Source longitude'}</dt><dd>{record.sourceLongitudeRaw ?? '-'}</dd></div><div><dt>{zh ? '來源緯度' : 'Source latitude'}</dt><dd>{record.sourceLatitudeRaw ?? '-'}</dd></div><div><dt>{zh ? '座標狀態' : 'Coordinate status'}</dt><dd>{record.coordinateStatus}</dd></div><div><dt>{zh ? '座標系統' : 'Coordinate system'}</dt><dd>{record.coordinateSystem}</dd></div><div><dt>{zh ? '解讀限制' : 'Disclaimer'}</dt><dd>{notice(zh)}</dd></div></dl></details></td></tr>)}</tbody></table></div>{!records.length && <p className="empty">{zh ? '沒有符合條件的紀錄。' : 'No records match these filters.'}</p>}{limit < records.length && <button className="load-more" onClick={() => setLimit(limit + 80)}>{zh ? '載入更多' : 'Load more'} · {records.length - limit}</button>}</>;
}

export default function CompanyRegistrationChangesModule({ records, summary, businessSummary, language }: { records: CompanyRegistrationChangeRecord[]; summary: CompanyRegistrationChangeSummary; businessSummary?: BusinessRegistrationChangeSummary; language: Language }) {
  const zh = language === 'zh', eventLabels = labels(language);
  const [view, setView] = useState<'overview' | 'map' | 'types' | 'districts' | 'trends' | 'directory' | 'compare' | 'notes'>('overview');
  const [filters, setFilters] = useState(emptyFilters);
  const [nearby, setNearby] = useState<Array<{ record: CompanyRegistrationChangeRecord; distance: number }>>([]);
  const [nearbyError, setNearbyError] = useState('');
  const filtered = useMemo(() => filterCompanyRegistrationChanges(records, filters, language), [records, filters, language]);
  const activeSummary = useMemo(() => Object.values(filters).some(Boolean) ? buildCompanyRegistrationChangeSummary(filtered) : summary, [filtered, filters, summary]);
  const findNearby = () => {
    setNearbyError('');
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      const origin = { latitude: coords.latitude, longitude: coords.longitude };
      setNearby(filtered.filter((record) => record.coordinateStatus === 'valid' && record.latitude !== undefined && record.longitude !== undefined)
        .map((record) => ({ record, distance: haversineDistanceMeters(origin, { latitude: record.latitude!, longitude: record.longitude! }) }))
        .sort((a, b) => a.distance - b.distance).slice(0, 10));
    }, () => setNearbyError(zh ? '無法取得目前位置。' : 'Could not get current location.'));
  };
  const views = [['overview', zh ? '總覽' : 'Overview'], ['map', zh ? '地圖' : 'Map'], ['types', zh ? '異動類型' : 'Change Types'], ['districts', zh ? '行政區分布' : 'District Distribution'], ['trends', zh ? '時間趨勢' : 'Time Trends'], ['directory', zh ? '清冊' : 'Directory'], ['compare', zh ? '公司與商業異動比較' : 'Company vs Business Changes'], ['notes', zh ? '資料說明' : 'Data Notes']] as const;
  return <><Filters filters={filters} setFilters={setFilters} records={records} language={language} /><section className="workspace"><div className="section-heading"><p>07 / COMPANY REGISTRATION CHANGE RECORDS</p><h2>{zh ? '公司設立、變更及解散登記異動資料' : 'Company Registration Change Records'}</h2><span>{zh ? '查詢臺北市核准公司設立、變更及解散登記異動資料，包含統一編號、公司名稱、公司地址、核准日期、核准變更日期、核准解散日期與來源座標。' : 'Explore Taipei approved company establishment, modification, and dissolution registration change records, including unified business number, company name, company address, approval date, modification approval date, dissolution approval date, and source coordinates.'}</span></div>
    <div className="subtabs">{views.map(([id, label]) => <button className={view === id ? 'active' : ''} onClick={() => setView(id)} key={id}>{label}</button>)}</div>
    <div className="section-heading inline"><div><p>{zh ? '篩選結果' : 'Filtered records'}</p></div><strong>{filtered.length.toLocaleString()} <span>{zh ? '筆' : 'records'}</span></strong></div>
    <button className="text-button" onClick={findNearby}>{zh ? '找附近公司異動紀錄' : 'Find nearby company change records'}</button>
    <div className="notice subtle">{zh ? '附近功能僅依公開資料座標計算距離，不代表公司目前營業、目前解散、信用狀態、商業風險、投資價值或法規遵循狀態。' : 'The nearby feature only calculates distance from public-data coordinates. It does not mean the company is currently operating, currently dissolved, creditworthy, risky, investable, or legally compliant.'}</div>
    {nearbyError && <p className="status" role="alert">{nearbyError}</p>}
    {nearby.length > 0 && <div className="directory-list compact">{nearby.map(({ record, distance }) => <article className="group-row" key={record.id}><div><p className="eyebrow">{eventLabels[record.eventType]} · {Math.round(distance).toLocaleString()}m</p><h3>{record.companyName}</h3><span className="tag">{record.eventDate ?? record.eventDateRaw ?? '-'}</span></div><dl><div><dt>{zh ? '地址' : 'Address'}</dt><dd>{record.companyAddress ?? '-'}</dd></div><div><dt>{zh ? '統一編號' : 'Business number'}</dt><dd>{record.unifiedBusinessNumber ?? '-'}</dd></div></dl></article>)}</div>}
    {view === 'overview' && <Overview summary={activeSummary} language={language} />}
    {view === 'map' && <ChangeMap records={filtered} language={language} />}
    {view === 'types' && <div className="chart-grid"><BarChart title={zh ? '各異動類型公司紀錄數' : 'Company changes by event type'} data={activeSummary.byEventType.map((item) => ({ label: eventLabels[item.eventType], value: item.count }))} /></div>}
    {view === 'districts' && <div className="chart-grid"><BarChart title={zh ? '各行政區公司異動紀錄數' : 'Company changes by district'} data={activeSummary.byDistrict.map((item) => ({ label: item.district, value: item.totalCount }))} /><BarChart title={zh ? '各行政區有效座標數' : 'Valid coordinates by district'} data={activeSummary.byDistrict.map((item) => ({ label: item.district, value: item.validCoordinateCount }))} /></div>}
    {view === 'trends' && <><div className="notice subtle">{zh ? '此圖僅整理公司設立、變更及解散登記異動公開資料中的統一編號、公司名稱、地址、日期與座標，不代表即時營業狀態、完整登記內容、信用狀態、投資訊號、公司推薦、法律意見或財務建議。' : 'This chart only organizes unified business number, company name, address, dates, and coordinates from public company registration change records. It does not represent real-time operating status, complete registration information, credit status, investment signals, company recommendation, legal advice, or financial advice.'}</div><div className="chart-grid"><BarChart title={zh ? '各月份公司異動紀錄數' : 'Company changes by month'} data={activeSummary.byMonth.map((item) => ({ label: item.monthKey, value: item.totalCount }))} /><BarChart title={zh ? '設立、變更與解散趨勢' : 'Establishment, modification, and dissolution trend'} data={activeSummary.byMonth.flatMap((item) => [{ label: `${item.monthKey} ${zh ? '設立' : 'est.'}`, value: item.establishmentCount }, { label: `${item.monthKey} ${zh ? '變更' : 'mod.'}`, value: item.modificationCount }, { label: `${item.monthKey} ${zh ? '解散' : 'diss.'}`, value: item.dissolutionCount }])} /></div></>}
    {view === 'directory' && <Directory records={filtered} language={language} />}
    {view === 'compare' && <><div className="notice subtle">{zh ? '公司異動資料與商業異動資料性質不同。公司登記與商業登記是不同登記類型；公司設立、變更、解散不等同於商業設立、變更、歇業，不應合併解讀為同一種營業狀態。' : 'Company change records and business change records have different meanings. Company registration and business registration are different registration types. Company establishment, modification, and dissolution are not the same as business establishment, modification, and closure, and should not be merged as the same operating status.'}</div>{businessSummary && <div className="chart-grid"><BarChart title={zh ? '公司異動與商業異動比較' : 'Company Changes vs Business Changes'} data={[{ label: zh ? '公司異動' : 'Company changes', value: activeSummary.totalRecords }, { label: zh ? '商業異動' : 'Business changes', value: businessSummary.totalRecords }]} /><BarChart title={zh ? '有效座標比較' : 'Valid coordinate comparison'} data={[{ label: zh ? '公司異動' : 'Company changes', value: activeSummary.recordsWithValidCoordinates }, { label: zh ? '商業異動' : 'Business changes', value: businessSummary.recordsWithValidCoordinates }]} /></div>}</>}
    {view === 'notes' && <div className="notes-grid"><article><h3>{zh ? '資料來源與限制' : 'Source and limits'}</h3><p>{notice(zh)}</p></article><article><h3>{zh ? '處理方式' : 'Processing'}</h3><p>{zh ? '來源分為設立、變更與解散等CSV資源。本網站依來源檔案判斷異動類型，依來源座標顯示點位，並依地址解析行政區與道路名稱。' : 'Source resources are separated into establishment, modification, and dissolution CSV files. This site determines the change type from the source resource, displays source-coordinate points, and parses addresses into district and road name.'}</p></article></div>}
  </section></>;
}
