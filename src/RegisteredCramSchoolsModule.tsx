import { useEffect, useMemo, useState } from 'react';
import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet';
import { DISTRICTS, TAIPEI_DISTRICT_CENTROIDS } from './lib/civicGroups';
import { buildRegisteredCramSchoolSummary, filterRegisteredCramSchools } from './lib/registeredCramSchools';
import type { Language, RegisteredCramSchool, RegisteredCramSchoolFilters, RegisteredCramSchoolSummary } from './types';

const emptyFilters: RegisteredCramSchoolFilters = {
  search: '', district: '', registrationYear: '', registrationDecade: '', hasPhone: '', hasClassroomCount: '',
  classroomCountMin: '', classroomCountMax: '', classroomAreaMin: '', classroomAreaMax: '', premisesAreaMin: '', premisesAreaMax: '',
};
const fmt = (value?: number, unit = '') => value === undefined ? '-' : `${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}${unit}`;

function BarChart({ title, data }: { title: string; data: Array<{ label: string; value: number }> }) {
  const max = Math.max(...data.map((item) => item.value), 1);
  return <section className="chart"><h3>{title}</h3><div className="bars">{data.map((item) =>
    <div className="bar-row wide-label" key={item.label}><span title={item.label}>{item.label}</span>
      <div><i style={{ width: `${Math.max(2, item.value / max * 100)}%` }} /></div><b>{item.value.toLocaleString()}</b></div>)}
  </div></section>;
}

function Filters({ filters, setFilters, records, language }: {
  filters: RegisteredCramSchoolFilters; setFilters: (filters: RegisteredCramSchoolFilters) => void;
  records: RegisteredCramSchool[]; language: Language;
}) {
  const zh = language === 'zh';
  const update = (key: keyof RegisteredCramSchoolFilters, value: string) => setFilters({ ...filters, [key]: value });
  const values = (key: 'registrationYear' | 'registrationDecade') => [...new Set(records.flatMap((record) => record[key] ?? []))].sort((a, b) => String(a).localeCompare(String(b)));
  return <aside className="filters">
    <label className="search"><span aria-hidden="true">⌕</span><input value={filters.search} onChange={(event) => update('search', event.target.value)}
      aria-label={zh ? '搜尋補習班名稱、地址、行政區、電話或立案文號' : 'Search cram-school name, address, district, phone, or registration document number'}
      placeholder={zh ? '搜尋補習班名稱、地址、行政區、電話或立案文號' : 'Search cram-school name, address, district, phone, or registration document number'} /></label>
    <div className="filter-grid grant-filters">
      <label>{zh ? '行政區' : 'District'}<select value={filters.district} onChange={(event) => update('district', event.target.value)}>
        <option value="">{zh ? '全部' : 'All'}</option>{DISTRICTS.map((district) => <option key={district}>{district}</option>)}
      </select></label>
      <label>{zh ? '立案年份' : 'Registration year'}<select value={filters.registrationYear} onChange={(event) => update('registrationYear', event.target.value)}>
        <option value="">{zh ? '全部' : 'All'}</option>{values('registrationYear').map((value) => <option key={value}>{value}</option>)}
      </select></label>
      <label>{zh ? '立案年代' : 'Registration decade'}<select value={filters.registrationDecade} onChange={(event) => update('registrationDecade', event.target.value)}>
        <option value="">{zh ? '全部' : 'All'}</option>{values('registrationDecade').map((value) => <option key={value}>{zh ? String(value).replace('s', '年代') : value}</option>)}
      </select></label>
      <label>{zh ? '有電話' : 'Has phone'}<select value={filters.hasPhone} onChange={(event) => update('hasPhone', event.target.value)}>
        <option value="">{zh ? '全部' : 'All'}</option><option value="yes">{zh ? '有' : 'Yes'}</option><option value="no">{zh ? '無' : 'No'}</option>
      </select></label>
      <label>{zh ? '有教室數' : 'Has classroom count'}<select value={filters.hasClassroomCount} onChange={(event) => update('hasClassroomCount', event.target.value)}>
        <option value="">{zh ? '全部' : 'All'}</option><option value="yes">{zh ? '有' : 'Yes'}</option><option value="no">{zh ? '無' : 'No'}</option>
      </select></label>
      {([
        ['classroomCountMin', zh ? '教室數下限' : 'Classroom count min'], ['classroomCountMax', zh ? '教室數上限' : 'Classroom count max'],
        ['classroomAreaMin', zh ? '教室面積下限' : 'Classroom area min'], ['classroomAreaMax', zh ? '教室面積上限' : 'Classroom area max'],
        ['premisesAreaMin', zh ? '班舍總面積下限' : 'Premises area min'], ['premisesAreaMax', zh ? '班舍總面積上限' : 'Premises area max'],
      ] as const).map(([key, label]) => <label key={key}>{label}<input type="number" value={filters[key]} onChange={(event) => update(key, event.target.value)} /></label>)}
    </div>
    {Object.values(filters).some(Boolean) && <button className="text-button" onClick={() => setFilters(emptyFilters)}>{zh ? '清除篩選' : 'Clear filters'}</button>}
  </aside>;
}

function Overview({ summary, language }: { summary: RegisteredCramSchoolSummary; language: Language }) {
  const zh = language === 'zh';
  const top = summary.byDistrict[0];
  const topClassrooms = [...summary.byDistrict].sort((a, b) => b.totalClassroomCount - a.totalClassroomCount)[0];
  const topPremises = [...summary.byDistrict].sort((a, b) => b.totalPremisesAreaSqm - a.totalPremisesAreaSqm)[0];
  const cards = [
    [zh ? '立案補習班數' : 'Registered cram-school count', summary.totalRecords],
    [zh ? '涵蓋行政區數' : 'Districts covered', summary.districtCount],
    [zh ? '最早立案日期' : 'Earliest registration date', summary.earliestRegistrationDate ?? '-'],
    [zh ? '最新立案日期' : 'Latest registration date', summary.latestRegistrationDate ?? '-'],
    [zh ? '有電話紀錄' : 'Records with phone', summary.recordsWithPhone],
    [zh ? '教室數合計' : 'Total classroom count', summary.totalClassroomCount],
    [zh ? '教室面積合計' : 'Total classroom area', fmt(summary.totalClassroomAreaSqm, ' m²')],
    [zh ? '班舍總面積合計' : 'Total premises area', fmt(summary.totalPremisesAreaSqm, ' m²')],
    [zh ? '立案補習班最多行政區' : 'Top district by cram-school count', top?.district ?? '-'],
    [zh ? '教室數最多行政區' : 'Top district by classroom count', topClassrooms?.district ?? '-'],
    [zh ? '班舍總面積最多行政區' : 'Top district by premises area', topPremises?.district ?? '-'],
  ];
  return <><div className="summary-grid">{cards.map(([label, value]) => <article key={label}><span>{label}</span><strong>{typeof value === 'number' ? value.toLocaleString() : value}</strong></article>)}</div>
    <div className="chart-grid">
      <BarChart title={zh ? '各行政區立案補習班數' : 'Registered cram schools by district'} data={summary.byDistrict.map((item) => ({ label: item.district, value: item.recordCount }))} />
      <BarChart title={zh ? '各行政區教室數合計' : 'Classroom count by district'} data={summary.byDistrict.map((item) => ({ label: item.district, value: item.totalClassroomCount }))} />
      <BarChart title={zh ? '各年份立案紀錄數' : 'Registration records by year'} data={summary.byRegistrationYear.map((item) => ({ label: String(item.year), value: item.recordCount }))} />
      <BarChart title={zh ? '各年代立案紀錄數' : 'Registration records by decade'} data={summary.byRegistrationDecade.map((item) => ({ label: zh ? item.decade.replace('s', '年代') : item.decade, value: item.recordCount }))} />
      <BarChart title={zh ? '教室面積分布' : 'Classroom area distribution'} data={summary.areaDistribution.classroomAreaSqm.map((item) => ({ label: item.bucket, value: item.count }))} />
      <BarChart title={zh ? '班舍總面積分布' : 'Premises area distribution'} data={summary.areaDistribution.premisesAreaSqm.map((item) => ({ label: item.bucket, value: item.count }))} />
    </div></>;
}

function CramSchoolMap({ summary, language, viewDistrict }: { summary: RegisteredCramSchoolSummary; language: Language; viewDistrict: (district: string) => void }) {
  const zh = language === 'zh';
  const max = Math.max(...summary.byDistrict.map((district) => district.recordCount), 1);
  return <div className="map-wrap"><div className="notice">{zh ? '立案補習班資料未提供經緯度，地圖以行政區彙總呈現，不代表精確補習班位置。' : 'Registered cram-school data does not provide coordinates. The map shows district-level summaries and does not represent exact cram-school locations.'}</div>
    <MapContainer center={[25.072, 121.54]} zoom={11} scrollWheelZoom={false}>
      <TileLayer attribution='&copy; OpenStreetMap contributors &copy; CARTO' url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
      {summary.byDistrict.map((district) => {
        const point = TAIPEI_DISTRICT_CENTROIDS[district.district];
        return point && <CircleMarker key={district.district} center={[point.latitude, point.longitude]} radius={10 + 26 * Math.sqrt(district.recordCount / max)} pathOptions={{ fillColor: '#2f7d7b', fillOpacity: .72, color: '#fff7e8', weight: 2 }}>
          <Popup><div className="map-popup"><strong>{zh ? '立案補習班' : 'Registered Cram Schools'}</strong><p>{zh ? '行政區' : 'District'}: {district.district}</p>
            <p>{zh ? '補習班數' : 'Cram-school count'}: {district.recordCount.toLocaleString()}</p><p>{zh ? '教室數合計' : 'Total classroom count'}: {district.totalClassroomCount.toLocaleString()}</p>
            <p>{zh ? '教室面積合計' : 'Total classroom area'}: {fmt(district.totalClassroomAreaSqm, ' m²')}</p><p>{zh ? '班舍總面積合計' : 'Total premises area'}: {fmt(district.totalPremisesAreaSqm, ' m²')}</p>
            <button onClick={() => viewDistrict(district.district)}>{zh ? '查看清單' : 'View directory'}</button></div></Popup>
        </CircleMarker>;
      })}
    </MapContainer></div>;
}

function Directory({ records, language }: { records: RegisteredCramSchool[]; language: Language }) {
  const zh = language === 'zh';
  const [limit, setLimit] = useState(80);
  useEffect(() => setLimit(80), [records]);
  return <><div className="comparison-scroll procurement-table"><table><thead><tr>
    {(zh ? ['序號', '補習班名稱', '行政區', '地址', '電話', '立案日期', '教室數', '教室面積', '班舍總面積', '立案文號', '地圖'] :
      ['Sequence', 'Cram-school name', 'District', 'Address', 'Phone', 'Registration date', 'Classroom count', 'Classroom area', 'Premises area', 'Registration document number', 'Map']).map((label) => <th key={label}>{label}</th>)}
  </tr></thead><tbody>{records.slice(0, limit).map((record) => <tr key={record.id}><td>{record.sourceSequenceNumber ?? '-'}</td><th>{record.cramSchoolName}</th>
    <td>{record.district ?? '-'}</td><td>{record.addressWithoutPostalCode ?? record.address ?? '-'}</td><td>{record.phone ?? '-'}</td><td>{record.registrationDate ?? record.registrationDateRaw ?? '-'}</td>
    <td>{fmt(record.classroomCount)}</td><td>{fmt(record.classroomAreaSqm, ' m²')}</td><td>{fmt(record.premisesAreaSqm, ' m²')}</td><td>{record.registrationDocumentNumber ?? '-'}</td>
    <td>{record.address ? <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(record.address)}`} target="_blank" rel="noreferrer">{zh ? '地址查詢' : 'Address lookup'}</a> : '-'}</td></tr>)}</tbody></table></div>
    {!records.length && <p className="empty">{zh ? '沒有符合條件的紀錄。' : 'No records match these filters.'}</p>}
    {limit < records.length && <button className="load-more" onClick={() => setLimit(limit + 80)}>{zh ? '載入更多' : 'Load more'} · {records.length - limit}</button>}</>;
}

export default function RegisteredCramSchoolsModule({ records, summary, language }: {
  records: RegisteredCramSchool[]; summary: RegisteredCramSchoolSummary; language: Language;
}) {
  const zh = language === 'zh';
  const [view, setView] = useState<'overview' | 'map' | 'timeline' | 'directory' | 'notes'>('overview');
  const [filters, setFilters] = useState(emptyFilters);
  const filtered = useMemo(() => filterRegisteredCramSchools(records, filters), [records, filters]);
  const activeSummary = useMemo(() => Object.values(filters).some(Boolean) ? buildRegisteredCramSchoolSummary(filtered) : summary, [filtered, filters, summary]);
  const openDistrict = (district: string) => { setFilters({ ...emptyFilters, district }); setView('directory'); };
  const views = [['overview', zh ? '總覽' : 'Overview'], ['map', zh ? '行政區分布' : 'District Distribution'], ['timeline', zh ? '立案時間' : 'Registration Timeline'], ['directory', zh ? '補習班清單' : 'Cram School Directory'], ['notes', zh ? '資料說明' : 'Data Notes']] as const;
  return <><Filters filters={filters} setFilters={setFilters} records={records} language={language} />
    <section className="workspace"><div className="section-heading"><p>04 / REGISTERED CRAM SCHOOLS</p><h2>{zh ? '立案補習班' : 'Registered Cram Schools'}</h2>
      <span>{zh ? '探索臺北市立案補習班公開登記資料，依行政區、立案日期、教室數與面積整理。' : 'Explore Taipei registered cram-school public records by district, filing date, classroom count, and area.'}</span></div>
      <div className="subtabs">{views.map(([id, label]) => <button className={view === id ? 'active' : ''} onClick={() => setView(id)} key={id}>{label}</button>)}</div>
      <div className="notice subtle">{zh ? '立案補習班資料為公開資料中的登記清冊，僅供資料查詢與探索使用，不代表教學品質、招生狀態、課程內容、收費標準、即時營業狀態或推薦程度。' : 'Registered cram-school data is a public registry directory for lookup and exploration only. It does not represent teaching quality, enrollment status, course content, pricing, real-time business status, or recommendation.'}</div>
      {view === 'overview' && <Overview summary={activeSummary} language={language} />}
      {view === 'map' && <CramSchoolMap summary={activeSummary} language={language} viewDistrict={openDistrict} />}
      {view === 'timeline' && <div className="chart-grid"><BarChart title={zh ? '各年份立案紀錄數' : 'Registration records by year'} data={activeSummary.byRegistrationYear.map((item) => ({ label: String(item.year), value: item.recordCount }))} /><BarChart title={zh ? '各年代立案紀錄數' : 'Registration records by decade'} data={activeSummary.byRegistrationDecade.map((item) => ({ label: zh ? item.decade.replace('s', '年代') : item.decade, value: item.recordCount }))} /></div>}
      {view === 'directory' && <><div className="section-heading inline"><div /><strong>{filtered.length.toLocaleString()} <span>{zh ? '筆符合紀錄' : 'matching records'}</span></strong></div><Directory records={filtered} language={language} /></>}
      {view === 'notes' && <div className="notes-grid"><article><h3>{zh ? '資料內容' : 'Data contents'}</h3><p>{zh ? '立案補習班資料提供臺北市立案補習班公開登記資料，包含補習班名稱、地址、電話、立案日期、立案文號、教室數、教室面積與班舍總面積等欄位。資料未提供經緯度，因此本網站以行政區彙總與清單方式呈現，並透過地址提供地圖查詢連結。' : 'Registered cram-school data provides Taipei public registry records for registered cram schools, including name, address, phone, registration date, registration document number, classroom count, classroom area, and total premises area. The data does not provide coordinates, so this site presents district-level summaries and directory records, with map lookup links based on addresses.'}</p></article>
        <article><h3>{zh ? '解讀限制' : 'Interpretation limits'}</h3><p>{zh ? '本資料僅為立案登記清冊，不代表補習班教學品質、招生狀態、課程內容、收費標準、即時營業狀態或推薦程度。' : 'This data is only a registration directory. It does not represent teaching quality, enrollment status, course content, pricing, real-time business status, or recommendation.'}</p></article>
        <article><h3>{zh ? '資料來源' : 'Source'}</h3><p><a href="https://data.taipei/dataset/detail?id=b124a967-fc88-4c45-bea8-41b4ef158a15" target="_blank" rel="noreferrer">{zh ? '臺北市立案補習班資訊' : 'Taipei Registered Cram School Information'} ↗</a></p></article></div>}
    </section></>;
}
