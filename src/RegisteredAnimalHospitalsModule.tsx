import { useEffect, useMemo, useState } from 'react';
import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet';
import { DISTRICTS, TAIPEI_DISTRICT_CENTROIDS } from './lib/civicGroups';
import { buildRegisteredAnimalHospitalSummary, filterRegisteredAnimalHospitals } from './lib/registeredAnimalHospitals';
import type { AnimalHospitalPhoneType, Language, RegisteredAnimalHospital, RegisteredAnimalHospitalFilters, RegisteredAnimalHospitalSummary } from './types';

const emptyFilters: RegisteredAnimalHospitalFilters = { search: '', district: '', roadName: '', phoneType: '', hasPhone: '', hasResponsiblePersonName: '' };
const phoneLabels: Record<Language, Record<AnimalHospitalPhoneType, string>> = {
  zh: { landline: '市話', mobile: '手機', extension: '含分機', unknown: '未知' },
  en: { landline: 'Landline', mobile: 'Mobile', extension: 'Extension', unknown: 'Unknown' },
};
function BarChart({ title, data }: { title: string; data: Array<{ label: string; value: number }> }) {
  const max = Math.max(...data.map((item) => item.value), 1);
  return <section className="chart"><h3>{title}</h3><div className="bars">{data.map((item) =>
    <div className="bar-row wide-label" key={item.label}><span title={item.label}>{item.label}</span>
      <div><i style={{ width: `${Math.max(2, item.value / max * 100)}%` }} /></div><b>{item.value.toLocaleString()}</b></div>)}
  </div></section>;
}

function Filters({ filters, setFilters, records, language }: {
  filters: RegisteredAnimalHospitalFilters; setFilters: (filters: RegisteredAnimalHospitalFilters) => void; records: RegisteredAnimalHospital[]; language: Language;
}) {
  const zh = language === 'zh';
  const update = (key: keyof RegisteredAnimalHospitalFilters, value: string) => setFilters({ ...filters, [key]: value });
  const roads = [...new Set(records.flatMap((record) => record.roadName ?? []))].sort((a, b) => a.localeCompare(b));
  const phoneTypes = [...new Set(records.map((record) => record.phoneType))];
  return <aside className="filters">
    <label className="search"><span aria-hidden="true">⌕</span><input value={filters.search} onChange={(event) => update('search', event.target.value)}
      aria-label={zh ? '搜尋動物醫院名稱、地址、行政區或電話' : 'Search animal hospital name, address, district, or phone'}
      placeholder={zh ? '搜尋動物醫院名稱、地址、行政區或電話' : 'Search animal hospital name, address, district, or phone'} /></label>
    <div className="filter-grid grant-filters">
      <label>{zh ? '行政區' : 'District'}<select value={filters.district} onChange={(event) => update('district', event.target.value)}>
        <option value="">{zh ? '全部' : 'All'}</option>{DISTRICTS.map((district) => <option key={district}>{district}</option>)}
      </select></label>
      <label>{zh ? '道路' : 'Road'}<select value={filters.roadName} onChange={(event) => update('roadName', event.target.value)}>
        <option value="">{zh ? '全部' : 'All'}</option>{roads.map((road) => <option key={road}>{road}</option>)}
      </select></label>
      <label>{zh ? '電話類型' : 'Phone type'}<select value={filters.phoneType} onChange={(event) => update('phoneType', event.target.value)}>
        <option value="">{zh ? '全部' : 'All'}</option>{phoneTypes.map((type) => <option key={type} value={type}>{phoneLabels[language][type]}</option>)}
      </select></label>
      <label>{zh ? '有電話' : 'Has phone'}<select value={filters.hasPhone} onChange={(event) => update('hasPhone', event.target.value)}>
        <option value="">{zh ? '全部' : 'All'}</option><option value="yes">{zh ? '有' : 'Yes'}</option><option value="no">{zh ? '無' : 'No'}</option>
      </select></label>
      <label>{zh ? '有負責人姓名' : 'Has responsible person name'}<select value={filters.hasResponsiblePersonName} onChange={(event) => update('hasResponsiblePersonName', event.target.value)}>
        <option value="">{zh ? '全部' : 'All'}</option><option value="yes">{zh ? '有' : 'Yes'}</option><option value="no">{zh ? '無' : 'No'}</option>
      </select></label>
    </div>
    {Object.values(filters).some(Boolean) && <button className="text-button" onClick={() => setFilters(emptyFilters)}>{zh ? '清除篩選' : 'Clear filters'}</button>}
  </aside>;
}

function Overview({ summary, language }: { summary: RegisteredAnimalHospitalSummary; language: Language }) {
  const zh = language === 'zh';
  const cards = [
    [zh ? '動物醫院數' : 'Animal hospital count', summary.totalRecords],
    [zh ? '涵蓋行政區數' : 'Districts covered', summary.districtCount],
    [zh ? '有電話紀錄' : 'Records with phone', summary.recordsWithPhone],
    [zh ? '地址數' : 'Address count', summary.uniqueAddressCount],
    [zh ? '動物醫院最多行政區' : 'Top district by animal hospital count', summary.byDistrict[0]?.district ?? '-'],
    [zh ? '動物醫院最多道路' : 'Top road by animal hospital count', summary.byRoadName[0]?.roadName ?? '-'],
    [zh ? '同地址多筆紀錄' : 'Duplicate address groups', summary.duplicateAddressGroups.length],
  ];
  return <><div className="summary-grid">{cards.map(([label, value]) => <article key={label}><span>{label}</span><strong>{typeof value === 'number' ? value.toLocaleString() : value}</strong></article>)}</div>
    <div className="chart-grid">
      <BarChart title={zh ? '各行政區動物醫院數' : 'Animal hospitals by district'} data={summary.byDistrict.map((item) => ({ label: item.district, value: item.count }))} />
      <BarChart title={zh ? '各道路動物醫院數' : 'Animal hospitals by road name'} data={summary.byRoadName.slice(0, 30).map((item) => ({ label: item.roadName, value: item.count }))} />
      <BarChart title={zh ? '電話類型分布' : 'Phone type distribution'} data={summary.byPhoneType.map((item) => ({ label: phoneLabels[language][item.phoneType], value: item.count }))} />
      {summary.duplicateAddressGroups.length > 0 && <BarChart title={zh ? '同地址多筆紀錄' : 'Duplicate address groups'} data={summary.duplicateAddressGroups.map((item) => ({ label: item.address, value: item.count }))} />}
    </div></>;
}

function AnimalHospitalMap({ summary, language, viewDistrict }: { summary: RegisteredAnimalHospitalSummary; language: Language; viewDistrict: (district: string) => void }) {
  const zh = language === 'zh';
  const max = Math.max(...summary.byDistrict.map((district) => district.count), 1);
  return <div className="map-wrap"><div className="notice">{zh ? '動物醫院一覽表資料未提供經緯度，地圖以行政區彙總呈現，不代表精確動物醫院位置。' : 'Animal hospital directory data does not provide coordinates. The map shows district-level summaries and does not represent exact animal hospital locations.'}</div>
    <MapContainer center={[25.072, 121.54]} zoom={11} scrollWheelZoom={false}>
      <TileLayer attribution='&copy; OpenStreetMap contributors &copy; CARTO' url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
      {summary.byDistrict.map((district) => {
        const point = TAIPEI_DISTRICT_CENTROIDS[district.district];
        return point && <CircleMarker key={district.district} center={[point.latitude, point.longitude]} radius={10 + 26 * Math.sqrt(district.count / max)} pathOptions={{ fillColor: '#6f8f52', fillOpacity: .76, color: '#fff7e8', weight: 2 }}>
          <Popup><div className="map-popup"><strong>{zh ? '動物醫院' : 'Animal Hospitals'}</strong><p>{zh ? '行政區' : 'District'}: {district.district}</p>
            <p>{zh ? '動物醫院數' : 'Animal hospital count'}: {district.count.toLocaleString()}</p><button onClick={() => viewDistrict(district.district)}>{zh ? '查看清單' : 'View directory'}</button></div></Popup>
        </CircleMarker>;
      })}
    </MapContainer></div>;
}

function Directory({ records, language }: { records: RegisteredAnimalHospital[]; language: Language }) {
  const zh = language === 'zh';
  const [limit, setLimit] = useState(80);
  useEffect(() => setLimit(80), [records]);
  return <><div className="comparison-scroll procurement-table"><table><thead><tr>
    {(zh ? ['動物醫院名稱', '行政區', '地址', '電話', '地圖查詢', '來源明細'] : ['Animal hospital name', 'District', 'Address', 'Phone', 'Map lookup', 'Source Details']).map((label) => <th key={label}>{label}</th>)}
  </tr></thead><tbody>{records.slice(0, limit).map((record) => <tr key={record.id}><th>{record.animalHospitalName}</th><td>{record.district ?? '-'}</td><td>{record.address ?? '-'}</td>
    <td>{record.phoneDialHref ? <a href={record.phoneDialHref}>{record.phoneDisplay ?? record.phone}</a> : record.phoneDisplay ?? record.phone ?? '-'}</td>
    <td>{record.address ? <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(record.addressNormalized ?? record.address)}`} target="_blank" rel="noreferrer">{zh ? '地圖查詢' : 'Map lookup'}</a> : '-'}</td>
    <td><details><summary>{zh ? '來源明細' : 'Source Details'}</summary><dl><div><dt>{zh ? '縣市' : 'City'}</dt><dd>{record.city ?? '-'}</dd></div><div><dt>{zh ? '道路' : 'Road'}</dt><dd>{record.roadName ?? '-'}</dd></div><div><dt>{zh ? '電話類型' : 'Phone type'}</dt><dd>{phoneLabels[language][record.phoneType]}</dd></div><div><dt>{zh ? '負責人姓名' : 'Responsible person name'}</dt><dd>{record.responsiblePersonName ?? '-'}</dd></div><div><dt>{zh ? '資料來源' : 'Source'}</dt><dd>{record.source}</dd></div><div><dt>{zh ? '來源機關' : 'Source agency'}</dt><dd>{record.sourceAgency}</dd></div></dl></details></td></tr>)}</tbody></table></div>
    {!records.length && <p className="empty">{zh ? '沒有符合條件的紀錄。' : 'No records match these filters.'}</p>}
    {limit < records.length && <button className="load-more" onClick={() => setLimit(limit + 80)}>{zh ? '載入更多' : 'Load more'} · {records.length - limit}</button>}</>;
}

export default function RegisteredAnimalHospitalsModule({ records, summary, language }: {
  records: RegisteredAnimalHospital[]; summary: RegisteredAnimalHospitalSummary; language: Language;
}) {
  const zh = language === 'zh';
  const [view, setView] = useState<'overview' | 'map' | 'roads' | 'directory' | 'notes'>('overview');
  const [filters, setFilters] = useState(emptyFilters);
  const filtered = useMemo(() => filterRegisteredAnimalHospitals(records, filters), [records, filters]);
  const activeSummary = useMemo(() => Object.values(filters).some(Boolean) ? buildRegisteredAnimalHospitalSummary(filtered) : summary, [filtered, filters, summary]);
  const openDistrict = (district: string) => { setFilters({ ...emptyFilters, district }); setView('directory'); };
  const views = [['overview', zh ? '總覽' : 'Overview'], ['map', zh ? '行政區分布' : 'District Distribution'], ['roads', zh ? '道路分布' : 'Road Distribution'], ['directory', zh ? '動物醫院清單' : 'Animal Hospital Directory'], ['notes', zh ? '資料說明' : 'Data Notes']] as const;
  return <><Filters filters={filters} setFilters={setFilters} records={records} language={language} />
    <section className="workspace"><div className="section-heading"><p>08 / ANIMAL CARE REGISTRY</p><h2>{zh ? '動物醫院一覽表' : 'Registered Animal Hospitals'}</h2>
      <span>{zh ? '整理臺北市公開資料中的動物醫院名冊，依行政區、地址、電話與來源欄位提供查詢與統計。' : 'Explore Taipei public-data animal hospital directory records by district, address, phone, and source fields.'}</span></div>
      <div className="subtabs">{views.map(([id, label]) => <button className={view === id ? 'active' : ''} onClick={() => setView(id)} key={id}>{label}</button>)}</div>
      <div className="notice subtle">{zh ? '動物醫院一覽表資料為臺北市公開資料中的動物醫院名冊，僅供資料查詢、行政區分布與公共資料探索使用，不代表醫療品質、即時營業狀態、急診服務、看診項目、收費、醫師排班、推薦程度或官方背書。' : 'Animal hospital directory data is a Taipei public-data directory of animal hospitals for lookup, district distribution, and public-data exploration only. It does not represent medical quality, real-time operating status, emergency service, available treatments, pricing, veterinarian schedules, recommendation, or official endorsement.'}</div>
      {view === 'overview' && <Overview summary={activeSummary} language={language} />}
      {view === 'map' && <AnimalHospitalMap summary={activeSummary} language={language} viewDistrict={openDistrict} />}
      {view === 'roads' && <div className="chart-grid"><BarChart title={zh ? '各道路動物醫院數' : 'Animal hospitals by road name'} data={activeSummary.byRoadName.slice(0, 50).map((item) => ({ label: item.roadName, value: item.count }))} /></div>}
      {view === 'directory' && <><div className="section-heading inline"><div /><strong>{filtered.length.toLocaleString()} <span>{zh ? '筆符合紀錄' : 'matching records'}</span></strong></div><Directory records={filtered} language={language} /></>}
      {view === 'notes' && <div className="notes-grid"><article><h3>{zh ? '資料內容' : 'Data contents'}</h3><p>{zh ? '動物醫院一覽表資料提供臺北市動物醫院公開名冊，欄位包含縣市、動物醫院名稱、地址、電話與負責人。本網站將地址解析為行政區與道路名稱，並以行政區彙總與清單方式呈現。資料未提供經緯度，因此預設不顯示精確點位。' : 'Animal hospital directory data provides Taipei public directory records for animal hospitals, including city, animal hospital name, address, phone, and responsible person. This site parses addresses into district and road name, and presents the data as district-level summaries and directory records. The data does not provide coordinates, so exact map points are not shown by default.'}</p></article>
        <article><h3>{zh ? '解讀限制' : 'Interpretation limits'}</h3><p>{zh ? '本資料為公開名冊，僅供資料查詢與統計整理，不代表醫療品質、即時營業狀態、急診服務、看診項目、收費、醫師排班、推薦程度、醫療建議或官方背書。負責人姓名為來源資料欄位，本網站僅於明細中呈現，不作個人排名或評價。' : 'This data is a public directory for lookup and statistical organization only. It does not represent medical quality, real-time operating status, emergency service, available treatments, pricing, veterinarian schedules, recommendation, medical advice, or official endorsement. Responsible person name is a source-data field and is shown only in record details; this site does not rank or evaluate individuals.'}</p></article>
        <article><h3>{zh ? '資料來源' : 'Source'}</h3><p><a href="https://data.taipei/dataset/detail?id=01bcb5ee-7c18-41fa-86d4-4e75daee1f94" target="_blank" rel="noreferrer">{zh ? '臺北市動物醫院一覽表' : 'Taipei Animal Hospital Directory'} ↗</a></p></article></div>}
    </section></>;
}
