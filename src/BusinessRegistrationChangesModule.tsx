import { useEffect, useMemo, useState } from 'react';
import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet';
import { DISTRICTS } from './lib/civicGroups';
import {
  buildBusinessRegistrationChangeSummary,
  BUSINESS_CHANGE_EVENT_LABELS_EN,
  BUSINESS_CHANGE_EVENT_LABELS_ZH,
  filterBusinessRegistrationChanges,
  haversineDistanceMeters,
} from './lib/businessRegistrationChanges';
import type { BusinessRegistrationChangeEventType, BusinessRegistrationChangeFilters, BusinessRegistrationChangeRecord, BusinessRegistrationChangeSummary, Language } from './types';

const emptyFilters: BusinessRegistrationChangeFilters = { search: '', eventType: '', eventYear: '', eventMonth: '', eventFrom: '', eventTo: '', district: '', roadName: '', hasUnifiedBusinessNumber: '', hasValidCoordinates: '', coordinateStatus: '', resourceName: '' };
const eventTypes = Object.keys(BUSINESS_CHANGE_EVENT_LABELS_ZH) as BusinessRegistrationChangeEventType[];
const fmt = (value?: number) => value === undefined ? '-' : value.toLocaleString();
const labels = (language: Language) => language === 'zh' ? BUSINESS_CHANGE_EVENT_LABELS_ZH : BUSINESS_CHANGE_EVENT_LABELS_EN;
const notice = (zh: boolean) => zh ? '商業設立、變更及歇業登記異動資料僅呈現臺北市公開資料中的商業登記異動事件、日期、地址與來源座標，不代表目前仍營業、已歇業後續狀態、商業信用、法規遵循、投資價值、推薦、法律意見、財務意見或官方背書。實際現況與最新資訊請以主管機關、官方系統或商業主體提供資訊為準。' : 'Business registration change records show Taipei public-data registration change events, dates, addresses, and source coordinates only. They do not represent current operating status, post-closure status, creditworthiness, legal compliance, investment value, recommendation, legal advice, financial advice, or official endorsement. Verify current and official status with the competent authority, official systems, or the business entity.';
const popupNotice = (zh: boolean) => zh ? '點位與異動日期僅依來源資料呈現，不代表目前營業、歇業後續狀態、信用、法規遵循、投資價值或官方背書。' : 'The point and change date are shown only from source data. They do not represent current operation, post-closure status, creditworthiness, legal compliance, investment value, or official endorsement.';

function BarChart({ title, data }: { title: string; data: Array<{ label: string; value: number }> }) {
  const max = Math.max(...data.map((item) => item.value), 1);
  return <section className="chart"><h3>{title}</h3><div className="bars">{data.map((item) =>
    <div className="bar-row wide-label" key={item.label}><span title={item.label}>{item.label}</span><div><i style={{ width: `${Math.max(2, item.value / max * 100)}%` }} /></div><b>{fmt(item.value)}</b></div>)}</div></section>;
}

function Filters({ filters, setFilters, records, language }: { filters: BusinessRegistrationChangeFilters; setFilters: (filters: BusinessRegistrationChangeFilters) => void; records: BusinessRegistrationChangeRecord[]; language: Language }) {
  const zh = language === 'zh', update = (key: keyof BusinessRegistrationChangeFilters, value: string) => setFilters({ ...filters, [key]: value });
  const options = <T extends string>(values: Array<T | undefined>) => [...new Set(values.filter(Boolean) as T[])].sort((a, b) => a.localeCompare(b));
  const eventLabels = labels(language), yesNo = <><option value="">{zh ? '全部' : 'All'}</option><option value="yes">{zh ? '有' : 'Yes'}</option><option value="no">{zh ? '無' : 'No'}</option></>;
  return <aside className="filters"><label className="search"><span aria-hidden="true">⌕</span><input value={filters.search} onChange={(event) => update('search', event.target.value)} placeholder={zh ? '搜尋商業名稱、統一編號、地址、日期或資源' : 'Search business name, number, address, date, or resource'} /></label>
    <div className="filter-grid grant-filters">
      <label>{zh ? '異動類型' : 'Event type'}<select value={filters.eventType} onChange={(event) => update('eventType', event.target.value)}><option value="">{zh ? '全部' : 'All'}</option>{eventTypes.map((key) => <option value={key} key={key}>{eventLabels[key]}</option>)}</select></label>
      <label>{zh ? '行政區' : 'District'}<select value={filters.district} onChange={(event) => update('district', event.target.value)}><option value="">{zh ? '全部' : 'All'}</option>{DISTRICTS.map((district) => <option key={district}>{district}</option>)}</select></label>
      <label>{zh ? '道路' : 'Road'}<select value={filters.roadName} onChange={(event) => update('roadName', event.target.value)}><option value="">{zh ? '全部' : 'All'}</option>{options(records.map((record) => record.roadName)).map((road) => <option key={road}>{road}</option>)}</select></label>
      <label>{zh ? '異動年度' : 'Event year'}<select value={filters.eventYear} onChange={(event) => update('eventYear', event.target.value)}><option value="">{zh ? '全部' : 'All'}</option>{options(records.map((record) => record.eventYear ? String(record.eventYear) : undefined)).map((year) => <option key={year}>{year}</option>)}</select></label>
      <label>{zh ? '異動月份' : 'Event month'}<select value={filters.eventMonth} onChange={(event) => update('eventMonth', event.target.value)}><option value="">{zh ? '全部' : 'All'}</option>{options(records.map((record) => record.eventMonthKey)).map((month) => <option key={month}>{month}</option>)}</select></label>
      <label>{zh ? '起始日期' : 'Event from'}<input type="date" value={filters.eventFrom} onChange={(event) => update('eventFrom', event.target.value)} /></label>
      <label>{zh ? '結束日期' : 'Event to'}<input type="date" value={filters.eventTo} onChange={(event) => update('eventTo', event.target.value)} /></label>
      <label>{zh ? '有統一編號' : 'Has business number'}<select value={filters.hasUnifiedBusinessNumber} onChange={(event) => update('hasUnifiedBusinessNumber', event.target.value)}>{yesNo}</select></label>
      <label>{zh ? '有有效座標' : 'Has valid coordinates'}<select value={filters.hasValidCoordinates} onChange={(event) => update('hasValidCoordinates', event.target.value)}>{yesNo}</select></label>
      <label>{zh ? '座標狀態' : 'Coordinate status'}<select value={filters.coordinateStatus} onChange={(event) => update('coordinateStatus', event.target.value)}><option value="">{zh ? '全部' : 'All'}</option>{['valid', 'missing', 'outlier', 'unparsed'].map((status) => <option key={status}>{status}</option>)}</select></label>
      <label>{zh ? '來源資源' : 'Source resource'}<select value={filters.resourceName} onChange={(event) => update('resourceName', event.target.value)}><option value="">{zh ? '全部' : 'All'}</option>{options(records.map((record) => record.resourceName)).map((resource) => <option key={resource}>{resource}</option>)}</select></label>
    </div>{Object.values(filters).some(Boolean) && <button className="text-button" onClick={() => setFilters(emptyFilters)}>{zh ? '清除篩選' : 'Clear filters'}</button>}</aside>;
}

function Overview({ summary, language }: { summary: BusinessRegistrationChangeSummary; language: Language }) {
  const zh = language === 'zh', eventLabels = labels(language);
  return <><div className="notice subtle">{notice(zh)}</div>
    <div className="summary-grid">{[
      [zh ? '異動紀錄數' : 'Change records', summary.totalRecords],
      [zh ? '不重複商業名稱' : 'Unique business names', summary.uniqueBusinessNameCount],
      [zh ? '不重複統一編號' : 'Unique business numbers', summary.uniqueBusinessNumberCount],
      [zh ? '不重複地址' : 'Unique addresses', summary.uniqueAddressCount],
      [zh ? '涵蓋行政區' : 'Districts covered', summary.districtCount],
      [zh ? '有效座標' : 'Valid coordinates', summary.recordsWithValidCoordinates],
      [zh ? '有異動日期' : 'Records with event date', summary.recordsWithEventDate],
      [zh ? '最新異動月份' : 'Latest event month', summary.latestEventMonth ?? '-'],
    ].map(([label, value]) => <article key={label}><span>{label}</span><strong>{typeof value === 'number' ? fmt(value) : value}</strong></article>)}</div>
    <div className="chart-grid"><BarChart title={zh ? '異動類型分布' : 'Change records by event type'} data={summary.byEventType.map((item) => ({ label: eventLabels[item.eventType], value: item.count }))} /><BarChart title={zh ? '各行政區異動紀錄數' : 'Change records by district'} data={summary.byDistrict.map((item) => ({ label: item.district, value: item.totalCount }))} /><BarChart title={zh ? '異動月份分布' : 'Event month distribution'} data={summary.byMonth.map((item) => ({ label: item.monthKey, value: item.totalCount }))} /><BarChart title={zh ? '道路紀錄數' : 'Records by road'} data={summary.byRoadName.slice(0, 30).map((item) => ({ label: item.roadName, value: item.count }))} /><BarChart title={zh ? '座標品質' : 'Coordinate quality'} data={Object.entries(summary.coordinateQuality).map(([label, value]) => ({ label, value }))} /></div></>;
}

function ChangeMap({ records, language }: { records: BusinessRegistrationChangeRecord[]; language: Language }) {
  const zh = language === 'zh', eventLabels = labels(language);
  const color = (type: BusinessRegistrationChangeEventType) => type === 'establishment' ? '#2f7f90' : type === 'modification' ? '#c9892b' : type === 'closure' ? '#b85c38' : '#777';
  const points = records.filter((record) => record.coordinateStatus === 'valid' && record.latitude !== undefined && record.longitude !== undefined).slice(0, 1200);
  return <div className="map-wrap"><div className="notice">{popupNotice(zh)}</div><MapContainer center={[25.072, 121.54]} zoom={11} scrollWheelZoom={false}><TileLayer attribution='&copy; OpenStreetMap contributors &copy; CARTO' url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />{points.map((record) => <CircleMarker key={record.id} center={[record.latitude!, record.longitude!]} radius={5} pathOptions={{ fillColor: color(record.eventType), fillOpacity: .72, color: '#fff7e8', weight: 1 }}><Popup><div className="map-popup"><strong>{record.businessName}</strong><p>{zh ? '異動類型' : 'Event type'}: {eventLabels[record.eventType]}</p><p>{zh ? '異動日期' : 'Event date'}: {record.eventDate ?? record.eventDateRaw ?? '-'}</p><p>{zh ? '商業地址' : 'Business address'}: {record.businessAddress ?? '-'}</p><p>{zh ? '統一編號' : 'Business number'}: {record.unifiedBusinessNumber ?? '-'}</p><small>{popupNotice(zh)}</small></div></Popup></CircleMarker>)}</MapContainer></div>;
}

function Directory({ records, language }: { records: BusinessRegistrationChangeRecord[]; language: Language }) {
  const zh = language === 'zh', eventLabels = labels(language);
  const [limit, setLimit] = useState(80);
  useEffect(() => setLimit(80), [records]);
  return <><div className="comparison-scroll procurement-table"><table><thead><tr>{(zh ? ['異動類型', '異動日期', '統一編號', '商業名稱', '行政區', '商業地址', '地圖', '來源明細'] : ['Event type', 'Event date', 'Business number', 'Business name', 'District', 'Business address', 'Map', 'Source details']).map((label) => <th key={label}>{label}</th>)}</tr></thead><tbody>{records.slice(0, limit).map((record) => <tr key={record.id}><td>{eventLabels[record.eventType]}</td><td>{record.eventDate ?? record.eventDateRaw ?? '-'}</td><td>{record.unifiedBusinessNumber ?? '-'}</td><th>{record.businessName}</th><td>{record.district ?? '-'}</td><td>{record.businessAddress ?? '-'}</td><td>{record.hasCoordinates ? <a href={`https://www.google.com/maps/search/?api=1&query=${record.latitude},${record.longitude}`} target="_blank" rel="noreferrer">{zh ? '地圖' : 'Map'}</a> : '-'}</td><td><details><summary>{zh ? '來源明細' : 'Source details'}</summary><dl><div><dt>{zh ? '來源資源' : 'Source resource'}</dt><dd>{record.resourceName}</dd></div><div><dt>{zh ? '道路' : 'Road'}</dt><dd>{record.roadName ?? '-'}</dd></div><div><dt>{zh ? '設立日期' : 'Establishment date'}</dt><dd>{record.establishmentDate ?? record.establishmentDateRaw ?? '-'}</dd></div><div><dt>{zh ? '變更日期' : 'Modification date'}</dt><dd>{record.modificationDate ?? record.modificationDateRaw ?? '-'}</dd></div><div><dt>{zh ? '歇業日期' : 'Closure date'}</dt><dd>{record.closureDate ?? record.closureDateRaw ?? '-'}</dd></div><div><dt>{zh ? '來源經度' : 'Source longitude'}</dt><dd>{record.sourceLongitudeRaw ?? '-'}</dd></div><div><dt>{zh ? '來源緯度' : 'Source latitude'}</dt><dd>{record.sourceLatitudeRaw ?? '-'}</dd></div><div><dt>{zh ? '座標狀態' : 'Coordinate status'}</dt><dd>{record.coordinateStatus}</dd></div><div><dt>{zh ? '資料來源' : 'Source'}</dt><dd>{record.source}</dd></div><div><dt>{zh ? '來源機關' : 'Source agency'}</dt><dd>{record.sourceAgency}</dd></div><div><dt>{zh ? '解讀限制' : 'Disclaimer'}</dt><dd>{notice(zh)}</dd></div></dl></details></td></tr>)}</tbody></table></div>{!records.length && <p className="empty">{zh ? '沒有符合條件的紀錄。' : 'No records match these filters.'}</p>}{limit < records.length && <button className="load-more" onClick={() => setLimit(limit + 80)}>{zh ? '載入更多' : 'Load more'} · {records.length - limit}</button>}</>;
}

export default function BusinessRegistrationChangesModule({ records, summary, language }: { records: BusinessRegistrationChangeRecord[]; summary: BusinessRegistrationChangeSummary; language: Language }) {
  const zh = language === 'zh', eventLabels = labels(language);
  const [view, setView] = useState<'overview' | 'map' | 'types' | 'districts' | 'trends' | 'directory' | 'notes'>('overview');
  const [filters, setFilters] = useState(emptyFilters);
  const [nearby, setNearby] = useState<Array<{ record: BusinessRegistrationChangeRecord; distance: number }>>([]);
  const [nearbyError, setNearbyError] = useState('');
  const filtered = useMemo(() => filterBusinessRegistrationChanges(records, filters, language), [records, filters, language]);
  const activeSummary = useMemo(() => Object.values(filters).some(Boolean) ? buildBusinessRegistrationChangeSummary(filtered) : summary, [filtered, filters, summary]);
  const findNearby = () => {
    setNearbyError('');
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      const origin = { latitude: coords.latitude, longitude: coords.longitude };
      setNearby(filtered.filter((record) => record.coordinateStatus === 'valid' && record.latitude !== undefined && record.longitude !== undefined)
        .map((record) => ({ record, distance: haversineDistanceMeters(origin, { latitude: record.latitude!, longitude: record.longitude! }) }))
        .sort((a, b) => a.distance - b.distance).slice(0, 10));
    }, () => setNearbyError(zh ? '無法取得目前位置。' : 'Could not get current location.'));
  };
  const views = [['overview', zh ? '總覽' : 'Overview'], ['map', zh ? '地圖' : 'Map'], ['types', zh ? '異動類型' : 'Types'], ['districts', zh ? '行政區' : 'Districts'], ['trends', zh ? '月份趨勢' : 'Trends'], ['directory', zh ? '清冊' : 'Directory'], ['notes', zh ? '資料說明' : 'Data Notes']] as const;
  return <><Filters filters={filters} setFilters={setFilters} records={records} language={language} /><section className="workspace"><div className="section-heading"><p>06 / BUSINESS REGISTRATION CHANGE RECORDS</p><h2>{zh ? '商業設立、變更及歇業登記異動資料' : 'Business Registration Change Records'}</h2><span>{zh ? '查詢臺北市商業設立、變更及歇業登記異動公開資料，包含統一編號、商業名稱、地址、異動日期與來源座標。' : 'Explore Taipei business establishment, modification, and closure registration change records, including business number, name, address, event date, and source coordinates.'}</span></div>
    <div className="subtabs">{views.map(([id, label]) => <button className={view === id ? 'active' : ''} onClick={() => setView(id)} key={id}>{label}</button>)}</div>
    <div className="section-heading inline"><div><p>{zh ? '篩選結果' : 'Filtered records'}</p></div><strong>{filtered.length.toLocaleString()} <span>{zh ? '筆' : 'records'}</span></strong></div>
    <button className="text-button" onClick={findNearby}>{zh ? '使用目前位置找附近異動紀錄' : 'Find nearby change records'}</button>
    <div className="notice subtle">{zh ? '附近功能僅依公開資料座標計算距離，不代表商業目前營業、信用、法規遵循、投資價值或推薦。' : 'The nearby feature only calculates distance from public-data coordinates. It does not mean the business is currently operating, creditworthy, legally compliant, investable, or recommended.'}</div>
    {nearbyError && <p className="status" role="alert">{nearbyError}</p>}
    {nearby.length > 0 && <div className="directory-list compact">{nearby.map(({ record, distance }) => <article className="group-row" key={record.id}><div><p className="eyebrow">{eventLabels[record.eventType]} · {Math.round(distance).toLocaleString()}m</p><h3>{record.businessName}</h3><span className="tag">{record.eventDate ?? record.eventDateRaw ?? '-'}</span></div><dl><div><dt>{zh ? '地址' : 'Address'}</dt><dd>{record.businessAddress ?? '-'}</dd></div><div><dt>{zh ? '統一編號' : 'Business number'}</dt><dd>{record.unifiedBusinessNumber ?? '-'}</dd></div></dl></article>)}</div>}
    {view === 'overview' && <Overview summary={activeSummary} language={language} />}
    {view === 'map' && <ChangeMap records={filtered} language={language} />}
    {view === 'types' && <div className="chart-grid"><BarChart title={zh ? '異動類型分布' : 'Change records by event type'} data={activeSummary.byEventType.map((item) => ({ label: eventLabels[item.eventType], value: item.count }))} /></div>}
    {view === 'districts' && <div className="chart-grid"><BarChart title={zh ? '各行政區異動紀錄數' : 'Change records by district'} data={activeSummary.byDistrict.map((item) => ({ label: item.district, value: item.totalCount }))} /><BarChart title={zh ? '各行政區有效座標數' : 'Valid coordinates by district'} data={activeSummary.byDistrict.map((item) => ({ label: item.district, value: item.validCoordinateCount }))} /></div>}
    {view === 'trends' && <><div className="notice subtle">{zh ? '月份趨勢僅依來源異動日期整理，不代表商業景氣、投資判斷或未來趨勢。' : 'Monthly trends only organize source event dates. They are not business-cycle, investment, or future-trend analysis.'}</div><div className="chart-grid"><BarChart title={zh ? '月份異動總數' : 'Monthly change records'} data={activeSummary.byMonth.map((item) => ({ label: item.monthKey, value: item.totalCount }))} /><BarChart title={zh ? '月份設立數' : 'Monthly establishments'} data={activeSummary.byMonth.map((item) => ({ label: item.monthKey, value: item.establishmentCount }))} /><BarChart title={zh ? '月份變更數' : 'Monthly modifications'} data={activeSummary.byMonth.map((item) => ({ label: item.monthKey, value: item.modificationCount }))} /><BarChart title={zh ? '月份歇業數' : 'Monthly closures'} data={activeSummary.byMonth.map((item) => ({ label: item.monthKey, value: item.closureCount }))} /></div></>}
    {view === 'directory' && <Directory records={filtered} language={language} />}
    {view === 'notes' && <div className="notes-grid"><article><h3>{zh ? '資料來源與限制' : 'Source and limits'}</h3><p>{notice(zh)}</p></article><article><h3>{zh ? '處理方式' : 'Processing'}</h3><p>{zh ? '轉換保留統一編號文字、商業名稱、商業地址、設立／變更／歇業日期與來源經緯度；地址只解析臺北市行政區與道路名稱；有效座標直接以來源座標呈現，未做地理編碼。' : 'Conversion preserves business numbers as text, business names, addresses, establishment/modification/closure dates, and source longitude/latitude. Addresses are parsed only for Taipei district and road names. Valid coordinates are displayed from source data without geocoding.'}</p></article></div>}
  </section></>;
}
