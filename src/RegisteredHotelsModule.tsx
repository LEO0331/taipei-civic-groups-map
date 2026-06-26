import { useEffect, useMemo, useState } from 'react';
import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet';
import { DISTRICTS, TAIPEI_DISTRICT_CENTROIDS } from './lib/civicGroups';
import { buildRegisteredHotelSummary, filterRegisteredHotels } from './lib/registeredHotels';
import type { Language, RegisteredHotel, RegisteredHotelFilters, RegisteredHotelSummary } from './types';

const emptyFilters: RegisteredHotelFilters = {
  search: '', district: '', hasPhone: '', hasListedRoomRate: '', hasRoomCount: '',
  roomCountMin: '', roomCountMax: '', listedRoomRateMin: '', listedRoomRateMax: '', roomCountBucket: '',
};
const fmt = (value?: number, unit = '') => value === undefined ? '-' : `${value.toLocaleString()}${unit}`;

function BarChart({ title, data }: { title: string; data: Array<{ label: string; value: number }> }) {
  const max = Math.max(...data.map((item) => item.value), 1);
  return <section className="chart"><h3>{title}</h3><div className="bars">{data.map((item) =>
    <div className="bar-row wide-label" key={item.label}><span title={item.label}>{item.label}</span>
      <div><i style={{ width: `${Math.max(2, item.value / max * 100)}%` }} /></div><b>{item.value.toLocaleString()}</b></div>)}
  </div></section>;
}

function Filters({ filters, setFilters, language }: {
  filters: RegisteredHotelFilters; setFilters: (filters: RegisteredHotelFilters) => void; language: Language;
}) {
  const zh = language === 'zh';
  const update = (key: keyof RegisteredHotelFilters, value: string) => setFilters({ ...filters, [key]: value });
  return <aside className="filters">
    <label className="search"><span aria-hidden="true">⌕</span><input value={filters.search} onChange={(event) => update('search', event.target.value)}
      aria-label={zh ? '搜尋旅館名稱、地址、行政區、電話或標識編號' : 'Search hotel name, address, district, phone, or registration ID'}
      placeholder={zh ? '搜尋旅館名稱、地址、行政區、電話或標識編號' : 'Search hotel name, address, district, phone, or registration ID'} /></label>
    <div className="filter-grid grant-filters">
      <label>{zh ? '行政區' : 'District'}<select value={filters.district} onChange={(event) => update('district', event.target.value)}>
        <option value="">{zh ? '全部' : 'All'}</option>{DISTRICTS.map((district) => <option key={district}>{district}</option>)}
      </select></label>
      <label>{zh ? '房間數級距' : 'Room count bucket'}<select value={filters.roomCountBucket} onChange={(event) => update('roomCountBucket', event.target.value)}>
        <option value="">{zh ? '全部' : 'All'}</option>{['< 25', '25-49', '50-99', '100+'].map((bucket) => <option key={bucket}>{bucket}</option>)}
      </select></label>
      <label>{zh ? '有電話' : 'Has phone'}<select value={filters.hasPhone} onChange={(event) => update('hasPhone', event.target.value)}>
        <option value="">{zh ? '全部' : 'All'}</option><option value="yes">{zh ? '有' : 'Yes'}</option><option value="no">{zh ? '無' : 'No'}</option>
      </select></label>
      <label>{zh ? '有定價欄位' : 'Has listed rate'}<select value={filters.hasListedRoomRate} onChange={(event) => update('hasListedRoomRate', event.target.value)}>
        <option value="">{zh ? '全部' : 'All'}</option><option value="yes">{zh ? '有' : 'Yes'}</option><option value="no">{zh ? '無' : 'No'}</option>
      </select></label>
      <label>{zh ? '有房間數' : 'Has room count'}<select value={filters.hasRoomCount} onChange={(event) => update('hasRoomCount', event.target.value)}>
        <option value="">{zh ? '全部' : 'All'}</option><option value="yes">{zh ? '有' : 'Yes'}</option><option value="no">{zh ? '無' : 'No'}</option>
      </select></label>
      {([
        ['roomCountMin', zh ? '房間數下限' : 'Room count min'], ['roomCountMax', zh ? '房間數上限' : 'Room count max'],
        ['listedRoomRateMin', zh ? '最低定價下限' : 'Listed min-rate floor'], ['listedRoomRateMax', zh ? '最低定價上限' : 'Listed min-rate ceiling'],
      ] as const).map(([key, label]) => <label key={key}>{label}<input type="number" value={filters[key]} onChange={(event) => update(key, event.target.value)} /></label>)}
    </div>
    {Object.values(filters).some(Boolean) && <button className="text-button" onClick={() => setFilters(emptyFilters)}>{zh ? '清除篩選' : 'Clear filters'}</button>}
  </aside>;
}

function Overview({ summary, language }: { summary: RegisteredHotelSummary; language: Language }) {
  const zh = language === 'zh';
  const top = summary.byDistrict[0];
  const topRooms = [...summary.byDistrict].sort((a, b) => b.totalRoomCount - a.totalRoomCount)[0];
  const cards = [
    [zh ? '一般旅館登記筆數' : 'Registered hotel records', summary.totalRecords],
    [zh ? '旅館名稱數' : 'Unique hotel names', summary.uniqueHotelNameCount],
    [zh ? '涵蓋行政區數' : 'Districts covered', summary.districtCount],
    [zh ? '有電話紀錄' : 'Records with phone', summary.recordsWithPhone],
    [zh ? '有定價欄位紀錄' : 'Records with listed room-rate fields', summary.recordsWithListedRoomRate],
    [zh ? '有房間數紀錄' : 'Records with room count', summary.recordsWithRoomCount],
    [zh ? '房間數合計' : 'Total room count', summary.totalRoomCount],
    [zh ? '平均房間數' : 'Average room count', summary.averageRoomCount === undefined ? '-' : Math.round(summary.averageRoomCount)],
    [zh ? '最低登錄定價' : 'Lowest listed room rate', fmt(summary.lowestListedRoomRateNtd, ' NTD')],
    [zh ? '最高登錄定價' : 'Highest listed room rate', fmt(summary.highestListedRoomRateNtd, ' NTD')],
    [zh ? '旅館數最多行政區' : 'Top district by hotel count', top?.district ?? '-'],
    [zh ? '房間數最多行政區' : 'Top district by room count', topRooms?.district ?? '-'],
  ];
  return <><div className="summary-grid">{cards.map(([label, value]) => <article key={label}><span>{label}</span><strong>{typeof value === 'number' ? value.toLocaleString() : value}</strong></article>)}</div>
    <div className="chart-grid">
      <BarChart title={zh ? '各行政區一般旅館數' : 'Registered hotels by district'} data={summary.byDistrict.map((item) => ({ label: item.district, value: item.recordCount }))} />
      <BarChart title={zh ? '各行政區房間數合計' : 'Room count by district'} data={summary.byDistrict.map((item) => ({ label: item.district, value: item.totalRoomCount }))} />
      <BarChart title={zh ? '房間數級距' : 'Room count buckets'} data={summary.roomCountBuckets.map((item) => ({ label: item.bucket, value: item.recordCount }))} />
      <BarChart title={zh ? '登錄最低定價級距' : 'Listed minimum room-rate buckets'} data={summary.listedRoomRateBuckets.map((item) => ({ label: item.bucket, value: item.recordCount }))} />
    </div></>;
}

function HotelMap({ summary, language, viewDistrict }: { summary: RegisteredHotelSummary; language: Language; viewDistrict: (district: string) => void }) {
  const zh = language === 'zh';
  const max = Math.max(...summary.byDistrict.map((district) => district.recordCount), 1);
  return <div className="map-wrap"><div className="notice">{zh ? '一般旅館名冊未提供經緯度，地圖以行政區彙總呈現，不代表精確旅館位置。' : 'The general hotel registry does not provide coordinates. The map shows district-level summaries and does not represent exact hotel locations.'}</div>
    <MapContainer center={[25.072, 121.54]} zoom={11} scrollWheelZoom={false}>
      <TileLayer attribution='&copy; OpenStreetMap contributors &copy; CARTO' url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
      {summary.byDistrict.map((district) => {
        const point = TAIPEI_DISTRICT_CENTROIDS[district.district];
        return point && <CircleMarker key={district.district} center={[point.latitude, point.longitude]} radius={10 + 26 * Math.sqrt(district.recordCount / max)} pathOptions={{ fillColor: '#80643b', fillOpacity: .72, color: '#fff7e8', weight: 2 }}>
          <Popup><div className="map-popup"><strong>{zh ? '一般旅館名冊' : 'Registered Hotels'}</strong><p>{zh ? '行政區' : 'District'}: {district.district}</p>
            <p>{zh ? '旅館數' : 'Hotel records'}: {district.recordCount.toLocaleString()}</p><p>{zh ? '房間數合計' : 'Total room count'}: {district.totalRoomCount.toLocaleString()}</p>
            <button onClick={() => viewDistrict(district.district)}>{zh ? '查看名冊' : 'View directory'}</button></div></Popup>
        </CircleMarker>;
      })}
    </MapContainer></div>;
}

function Directory({ records, language }: { records: RegisteredHotel[]; language: Language }) {
  const zh = language === 'zh';
  const [limit, setLimit] = useState(80);
  useEffect(() => setLimit(80), [records]);
  return <><div className="comparison-scroll procurement-table"><table><thead><tr>
    {(zh ? ['標識編號', '旅館名稱', '行政區', '營業地址', '電話', '登錄最低定價', '登錄最高定價', '房間數', '地址查詢'] :
      ['Registration ID', 'Hotel name', 'District', 'Business address', 'Phone', 'Listed min room rate', 'Listed max room rate', 'Room count', 'Address lookup']).map((label) => <th key={label}>{label}</th>)}
  </tr></thead><tbody>{records.slice(0, limit).map((record) => <tr key={record.id}><td>{record.registrationId}</td><th>{record.hotelName}</th>
    <td>{record.district ?? '-'}</td><td>{record.addressWithoutPostalCode ?? record.address ?? '-'}</td><td>{record.phone ?? '-'}</td>
    <td>{fmt(record.listedMinRoomRateNtd, ' NTD')}</td><td>{fmt(record.listedMaxRoomRateNtd, ' NTD')}</td><td>{fmt(record.roomCount)}</td>
    <td>{record.address ? <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(record.address)}`} target="_blank" rel="noreferrer">{zh ? '地址查詢' : 'Address lookup'}</a> : '-'}</td></tr>)}</tbody></table></div>
    {!records.length && <p className="empty">{zh ? '沒有符合條件的紀錄。' : 'No records match these filters.'}</p>}
    {limit < records.length && <button className="load-more" onClick={() => setLimit(limit + 80)}>{zh ? '載入更多' : 'Load more'} · {records.length - limit}</button>}</>;
}

export default function RegisteredHotelsModule({ records, summary, language }: {
  records: RegisteredHotel[]; summary: RegisteredHotelSummary; language: Language;
}) {
  const zh = language === 'zh';
  const [view, setView] = useState<'overview' | 'map' | 'directory' | 'notes'>('overview');
  const [filters, setFilters] = useState(emptyFilters);
  const filtered = useMemo(() => filterRegisteredHotels(records, filters), [records, filters]);
  const activeSummary = useMemo(() => Object.values(filters).some(Boolean) ? buildRegisteredHotelSummary(filtered) : summary, [filtered, filters, summary]);
  const openDistrict = (district: string) => { setFilters({ ...emptyFilters, district }); setView('directory'); };
  const views = [['overview', zh ? '總覽' : 'Overview'], ['map', zh ? '行政區分布' : 'District Distribution'], ['directory', zh ? '旅館名冊' : 'Hotel Directory'], ['notes', zh ? '資料說明' : 'Data Notes']] as const;
  return <><Filters filters={filters} setFilters={setFilters} language={language} />
    <section className="workspace"><div className="section-heading"><p>05 / REGISTERED HOTELS</p><h2>{zh ? '一般旅館名冊' : 'Registered Hotels'}</h2>
      <span>{zh ? '探索臺北市合法一般旅館公開登記清冊，依行政區、營業地址、登錄定價欄位與房間數整理。' : 'Explore Taipei legal general hotel registry records by district, business address, listed room-rate range, and room count.'}</span></div>
      <div className="subtabs">{views.map(([id, label]) => <button className={view === id ? 'active' : ''} onClick={() => setView(id)} key={id}>{label}</button>)}</div>
      <div className="notice subtle">{zh ? '一般旅館名冊資料為公開資料中的旅館登記清冊，僅供資料查詢與探索使用，不代表住宿品質、即時營業狀態、即時房價、訂房可用性、推薦程度或旅宿安全評分。實際營業狀態、房價、房型、訂房資訊與最新登記情形請以觀傳局、主管機關、旅館公告或訂房平台資訊為準。' : 'Registered hotel data is a public registry directory for lookup and exploration only. It does not represent lodging quality, real-time operating status, real-time room prices, booking availability, recommendation, or lodging safety score. Actual operating status, room rates, room types, booking information, and latest registration status should be verified with the Department of Information and Tourism, official authorities, hotel notices, or booking platforms.'}</div>
      {view === 'overview' && <Overview summary={activeSummary} language={language} />}
      {view === 'map' && <HotelMap summary={activeSummary} language={language} viewDistrict={openDistrict} />}
      {view === 'directory' && <><div className="section-heading inline"><div /><strong>{filtered.length.toLocaleString()} <span>{zh ? '筆符合紀錄' : 'matching records'}</span></strong></div><Directory records={filtered} language={language} /></>}
      {view === 'notes' && <div className="notes-grid"><article><h3>{zh ? '資料內容' : 'Data contents'}</h3><p>{zh ? '臺北市一般旅館名冊包含縣市代碼、專用標識編號、旅館名稱、電話或手機號碼、營業地址、客房最低定價、客房最高定價與房間數。' : 'The Taipei general hotel registry includes city code, registration ID, hotel name, phone, business address, listed minimum room rate, listed maximum room rate, and room count.'}</p></article>
        <article><h3>{zh ? '解讀限制' : 'Interpretation limits'}</h3><p>{zh ? '客房最低定價與客房最高定價是公開登記資料中的登錄定價欄位，不是即時房價、訂房價格、推薦排序或旅宿品質指標。' : 'Listed minimum and maximum room-rate fields are public registry fields. They are not real-time prices, booking prices, recommendation rankings, or lodging quality indicators.'}</p></article>
        <article><h3>{zh ? '資料來源' : 'Source'}</h3><p><a href="https://data.taipei/dataset/detail?id=4d7d0b46-2e90-4ee7-b000-c0f2f3a37651" target="_blank" rel="noreferrer">{zh ? '臺北市一般旅館名冊' : 'Taipei General Hotel Registry'} ↗</a></p></article></div>}
    </section></>;
}
