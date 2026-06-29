import { useEffect, useMemo, useState } from 'react';
import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet';
import { DISTRICTS, TAIPEI_DISTRICT_CENTROIDS } from './lib/civicGroups';
import { buildRegisteredLaborUnionSummary, filterRegisteredLaborUnions } from './lib/registeredLaborUnions';
import type {
  LaborUnionAddressLocationCategory, LaborUnionPhoneType, Language, RegisteredLaborUnion,
  RegisteredLaborUnionFilters, RegisteredLaborUnionSummary, RegisteredLaborUnionType,
} from './types';

const emptyFilters: RegisteredLaborUnionFilters = { search: '', unionType: '', district: '', addressLocationCategory: '', city: '', postalCode: '', roadName: '', phoneType: '', hasPhone: '', hasChairpersonName: '' };
const unionTypeLabels: Record<Language, Record<RegisteredLaborUnionType, string>> = {
  zh: { occupational_union: '職業工會', enterprise_union: '企業工會', industrial_union: '產業工會', union_federation: '工會聯合組織', other: '其他', unknown: '未知' },
  en: { occupational_union: 'Occupational union', enterprise_union: 'Enterprise union', industrial_union: 'Industrial union', union_federation: 'Union federation', other: 'Other', unknown: 'Unknown' },
};
const addressLabels: Record<Language, Record<LaborUnionAddressLocationCategory, string>> = {
  zh: { taipei_address: '臺北市地址', new_taipei_address: '新北市地址', other_taiwan_address: '其他縣市地址', postal_box_or_unparsed: '郵政信箱或未解析', missing: '未提供' },
  en: { taipei_address: 'Taipei address', new_taipei_address: 'New Taipei address', other_taiwan_address: 'Other Taiwan address', postal_box_or_unparsed: 'Postal box or unparsed', missing: 'Missing' },
};
const phoneLabels: Record<Language, Record<LaborUnionPhoneType, string>> = {
  zh: { taipei_landline: '臺北市話', other_landline: '外縣市話', mobile: '手機', extension: '含分機', missing: '未提供', unknown: '未知' },
  en: { taipei_landline: 'Taipei landline', other_landline: 'Other landline', mobile: 'Mobile', extension: 'Extension', missing: 'Missing', unknown: 'Unknown' },
};

function BarChart({ title, data }: { title: string; data: Array<{ label: string; value: number }> }) {
  const max = Math.max(...data.map((item) => item.value), 1);
  return <section className="chart"><h3>{title}</h3><div className="bars">{data.map((item) =>
    <div className="bar-row wide-label" key={item.label}><span title={item.label}>{item.label}</span>
      <div><i style={{ width: `${Math.max(2, item.value / max * 100)}%` }} /></div><b>{item.value.toLocaleString()}</b></div>)}
  </div></section>;
}

function Filters({ filters, setFilters, records, language }: {
  filters: RegisteredLaborUnionFilters; setFilters: (filters: RegisteredLaborUnionFilters) => void; records: RegisteredLaborUnion[]; language: Language;
}) {
  const zh = language === 'zh';
  const update = (key: keyof RegisteredLaborUnionFilters, value: string) => setFilters({ ...filters, [key]: value });
  const options = <T extends string>(values: Array<T | undefined>) => [...new Set(values.filter(Boolean) as T[])].sort((a, b) => a.localeCompare(b));
  const unionTypes = options(records.map((record) => record.unionType));
  const addressTypes = options(records.map((record) => record.addressLocationCategory));
  const cities = options(records.map((record) => record.city));
  const postalCodes = options(records.map((record) => record.postalCode));
  const roads = options(records.map((record) => record.roadName));
  const phoneTypes = options(records.map((record) => record.phoneType));
  return <aside className="filters">
    <label className="search"><span aria-hidden="true">⌕</span><input value={filters.search} onChange={(event) => update('search', event.target.value)}
      aria-label={zh ? '搜尋工會名稱、地址、電話、郵遞區號或關鍵字' : 'Search union name, address, phone, postal code, or keyword'}
      placeholder={zh ? '搜尋工會名稱、地址、電話、郵遞區號或關鍵字' : 'Search union name, address, phone, postal code, or keyword'} /></label>
    <div className="filter-grid grant-filters">
      <label>{zh ? '工會屬性' : 'Union type'}<select value={filters.unionType} onChange={(event) => update('unionType', event.target.value)}>
        <option value="">{zh ? '全部' : 'All'}</option>{unionTypes.map((type) => <option value={type} key={type}>{unionTypeLabels[language][type]}</option>)}
      </select></label>
      <label>{zh ? '行政區' : 'District'}<select value={filters.district} onChange={(event) => update('district', event.target.value)}>
        <option value="">{zh ? '全部' : 'All'}</option>{DISTRICTS.map((district) => <option key={district}>{district}</option>)}
      </select></label>
      <label>{zh ? '地址類型' : 'Address type'}<select value={filters.addressLocationCategory} onChange={(event) => update('addressLocationCategory', event.target.value)}>
        <option value="">{zh ? '全部' : 'All'}</option>{addressTypes.map((type) => <option value={type} key={type}>{addressLabels[language][type]}</option>)}
      </select></label>
      <label>{zh ? '縣市' : 'City'}<select value={filters.city} onChange={(event) => update('city', event.target.value)}>
        <option value="">{zh ? '全部' : 'All'}</option>{cities.map((city) => <option key={city}>{city}</option>)}
      </select></label>
      <label>{zh ? '郵遞區號' : 'Postal code'}<select value={filters.postalCode} onChange={(event) => update('postalCode', event.target.value)}>
        <option value="">{zh ? '全部' : 'All'}</option>{postalCodes.map((code) => <option key={code}>{code}</option>)}
      </select></label>
      <label>{zh ? '道路' : 'Road'}<select value={filters.roadName} onChange={(event) => update('roadName', event.target.value)}>
        <option value="">{zh ? '全部' : 'All'}</option>{roads.map((road) => <option key={road}>{road}</option>)}
      </select></label>
      <label>{zh ? '電話類型' : 'Phone type'}<select value={filters.phoneType} onChange={(event) => update('phoneType', event.target.value)}>
        <option value="">{zh ? '全部' : 'All'}</option>{phoneTypes.map((type) => <option value={type} key={type}>{phoneLabels[language][type]}</option>)}
      </select></label>
      <label>{zh ? '有電話' : 'Has phone'}<select value={filters.hasPhone} onChange={(event) => update('hasPhone', event.target.value)}>
        <option value="">{zh ? '全部' : 'All'}</option><option value="yes">{zh ? '有' : 'Yes'}</option><option value="no">{zh ? '無' : 'No'}</option>
      </select></label>
      <label>{zh ? '有理事長' : 'Has chairperson'}<select value={filters.hasChairpersonName} onChange={(event) => update('hasChairpersonName', event.target.value)}>
        <option value="">{zh ? '全部' : 'All'}</option><option value="yes">{zh ? '有' : 'Yes'}</option><option value="no">{zh ? '無' : 'No'}</option>
      </select></label>
    </div>
    {Object.values(filters).some(Boolean) && <button className="text-button" onClick={() => setFilters(emptyFilters)}>{zh ? '清除篩選' : 'Clear filters'}</button>}
  </aside>;
}

function Overview({ summary, language }: { summary: RegisteredLaborUnionSummary; language: Language }) {
  const zh = language === 'zh';
  const cards = [
    [zh ? '工會筆數' : 'Union count', summary.totalRecords], [zh ? '工會屬性數' : 'Union type count', summary.byUnionType.length],
    [zh ? '臺北市地址筆數' : 'Taipei-address count', summary.taipeiAddressCount],
    [zh ? '非臺北或未解析' : 'Non-Taipei/unparsed count', summary.nonTaipeiAddressCount + summary.postalBoxOrUnparsedAddressCount],
    [zh ? '涵蓋行政區數' : 'Districts covered', summary.districtCount], [zh ? '有電話紀錄' : 'Records with phone', summary.recordsWithPhone],
    [zh ? '通訊地址數' : 'Contact address count', summary.uniqueAddressCount],
    [zh ? '最多工會屬性' : 'Top union type', summary.byUnionType[0] ? unionTypeLabels[language][summary.byUnionType[0].unionType] : '-'],
    [zh ? '最多行政區' : 'Top district', summary.byDistrict[0]?.district ?? '-'],
    [zh ? '同地址多筆群組' : 'Duplicate address groups', summary.duplicateAddressGroups.length],
  ];
  return <><div className="summary-grid">{cards.map(([label, value]) => <article key={label}><span>{label}</span><strong>{typeof value === 'number' ? value.toLocaleString() : value}</strong></article>)}</div>
    <div className="chart-grid">
      <BarChart title={zh ? '各工會屬性筆數' : 'Labor unions by type'} data={summary.byUnionType.map((item) => ({ label: unionTypeLabels[language][item.unionType], value: item.count }))} />
      <BarChart title={zh ? '臺北市行政區分布' : 'Taipei district distribution'} data={summary.byDistrict.map((item) => ({ label: item.district, value: item.count }))} />
      <BarChart title={zh ? '地址類型分布' : 'Address type distribution'} data={summary.byAddressLocationCategory.map((item) => ({ label: addressLabels[language][item.addressLocationCategory], value: item.count }))} />
      <BarChart title={zh ? '電話類型分布' : 'Phone type distribution'} data={summary.byPhoneType.map((item) => ({ label: phoneLabels[language][item.phoneType], value: item.count }))} />
    </div></>;
}

function LaborUnionMap({ summary, language, viewDistrict }: { summary: RegisteredLaborUnionSummary; language: Language; viewDistrict: (district: string) => void }) {
  const zh = language === 'zh';
  const max = Math.max(...summary.byDistrict.map((district) => district.count), 1);
  return <div className="map-wrap"><div className="notice">{zh ? '工會名單資料未提供經緯度，地圖以臺北市行政區彙總呈現，不代表精確工會地址位置。部分工會通訊地址位於臺北市以外或為郵政信箱，僅於清單與統計中保留。' : 'Labor union directory data does not provide latitude/longitude. The map shows Taipei district-level summaries and does not represent exact union address locations. Some contact addresses are outside Taipei or postal boxes and are retained only in the directory and statistics.'}</div>
    <MapContainer center={[25.072, 121.54]} zoom={11} scrollWheelZoom={false}>
      <TileLayer attribution='&copy; OpenStreetMap contributors &copy; CARTO' url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
      {summary.byDistrict.map((district) => {
        const point = TAIPEI_DISTRICT_CENTROIDS[district.district];
        return point && <CircleMarker key={district.district} center={[point.latitude, point.longitude]} radius={10 + 26 * Math.sqrt(district.count / max)} pathOptions={{ fillColor: '#9b6a47', fillOpacity: .76, color: '#fff7e8', weight: 2 }}>
          <Popup><div className="map-popup"><strong>{zh ? '工會名單' : 'Labor Unions'}</strong><p>{zh ? '行政區' : 'District'}: {district.district}</p>
            <p>{zh ? '工會數' : 'Union count'}: {district.count.toLocaleString()}</p><button onClick={() => viewDistrict(district.district)}>{zh ? '查看清單' : 'View directory'}</button></div></Popup>
        </CircleMarker>;
      })}
    </MapContainer></div>;
}

function Directory({ records, language }: { records: RegisteredLaborUnion[]; language: Language }) {
  const zh = language === 'zh';
  const [limit, setLimit] = useState(80);
  useEffect(() => setLimit(80), [records]);
  return <><div className="comparison-scroll procurement-table"><table><thead><tr>
    {(zh ? ['工會名稱', '工會屬性', '行政區 / 地址類型', '通訊地址', '電話', '地圖查詢', '來源明細'] : ['Union name', 'Union type', 'District / address type', 'Contact address', 'Phone', 'Map lookup', 'Source details']).map((label) => <th key={label}>{label}</th>)}
  </tr></thead><tbody>{records.slice(0, limit).map((record) => <tr key={record.id}><th>{record.unionName}</th><td>{unionTypeLabels[language][record.unionType]}</td>
    <td>{record.district ?? addressLabels[language][record.addressLocationCategory]}</td><td>{record.contactAddress ?? '-'}</td>
    <td>{record.phoneDialHref ? <a href={record.phoneDialHref}>{record.phoneDisplay ?? record.phone}</a> : record.phoneDisplay ?? record.phone ?? '-'}</td>
    <td>{record.contactAddress ? <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(record.addressNormalized ?? record.contactAddress)}`} target="_blank" rel="noreferrer">{zh ? '地圖查詢' : 'Map lookup'}</a> : '-'}</td>
    <td><details><summary>{zh ? '來源明細' : 'Source details'}</summary><dl>
      <div><dt>{zh ? '來源序號' : 'Source sequence'}</dt><dd>{record.sourceSequenceNumber ?? '-'}</dd></div>
      <div><dt>{zh ? '理事長' : 'Chairperson'}</dt><dd>{record.chairpersonName ?? '-'}</dd></div>
      <div><dt>{zh ? '郵遞區號' : 'Postal code'}</dt><dd>{record.postalCode ?? '-'}</dd></div>
      <div><dt>{zh ? '標準化地址' : 'Normalized address'}</dt><dd>{record.addressNormalized ?? '-'}</dd></div>
      <div><dt>{zh ? '縣市' : 'City'}</dt><dd>{record.city ?? '-'}</dd></div><div><dt>{zh ? '行政區' : 'District'}</dt><dd>{record.district ?? '-'}</dd></div>
      <div><dt>{zh ? '道路' : 'Road'}</dt><dd>{record.roadName ?? '-'}</dd></div><div><dt>{zh ? '電話類型' : 'Phone type'}</dt><dd>{phoneLabels[language][record.phoneType]}</dd></div>
      <div><dt>{zh ? '資料來源' : 'Source'}</dt><dd>{record.source}</dd></div><div><dt>{zh ? '來源機關' : 'Source agency'}</dt><dd>{record.sourceAgency}</dd></div>
      <div><dt>{zh ? '解讀限制' : 'Disclaimer'}</dt><dd>{zh ? '本資料為公開名冊欄位，不代表法律狀態、會員資格、推薦程度或官方背書。' : 'This public directory field does not represent legal status, membership eligibility, recommendation, or official endorsement.'}</dd></div>
    </dl></details></td></tr>)}</tbody></table></div>
    {!records.length && <p className="empty">{zh ? '沒有符合條件的紀錄。' : 'No records match these filters.'}</p>}
    {limit < records.length && <button className="load-more" onClick={() => setLimit(limit + 80)}>{zh ? '載入更多' : 'Load more'} · {records.length - limit}</button>}</>;
}

export default function RegisteredLaborUnionsModule({ records, summary, language }: {
  records: RegisteredLaborUnion[]; summary: RegisteredLaborUnionSummary; language: Language;
}) {
  const zh = language === 'zh';
  const [view, setView] = useState<'overview' | 'types' | 'districts' | 'address' | 'directory' | 'notes'>('overview');
  const [filters, setFilters] = useState(emptyFilters);
  const filtered = useMemo(() => filterRegisteredLaborUnions(records, filters), [records, filters]);
  const activeSummary = useMemo(() => Object.values(filters).some(Boolean) ? buildRegisteredLaborUnionSummary(filtered) : summary, [filtered, filters, summary]);
  const openDistrict = (district: string) => { setFilters({ ...emptyFilters, district }); setView('directory'); };
  const views = [['overview', zh ? '總覽' : 'Overview'], ['types', zh ? '工會屬性' : 'Union Types'], ['districts', zh ? '行政區分布' : 'District Distribution'], ['address', zh ? '地址與聯絡方式' : 'Address & Contact'], ['directory', zh ? '工會清單' : 'Labor Union Directory'], ['notes', zh ? '資料說明' : 'Data Notes']] as const;
  return <><Filters filters={filters} setFilters={setFilters} records={records} language={language} />
    <section className="workspace"><div className="section-heading"><p>02 / LABOR UNIONS</p><h2>{zh ? '各工會名單及聯絡方式' : 'Registered Labor Unions'}</h2>
      <span>{zh ? '整理臺北市公開資料中的工會名單，依工會屬性、行政區、通訊地址與電話欄位提供查詢與統計。' : 'Explore Taipei public-data labor union directory records by union type, district, contact address, and phone fields.'}</span></div>
      <div className="subtabs">{views.map(([id, label]) => <button className={view === id ? 'active' : ''} onClick={() => setView(id)} key={id}>{label}</button>)}</div>
      <div className="notice subtle">{zh ? '本資料為工會名單與聯絡方式公開資料，僅供資料查詢、行政區分布與公共資料探索使用，不代表法律狀態、會員資格、推薦程度、勞資建議或官方背書。' : 'This labor union directory is public data for lookup, district distribution, and public-data exploration only. It does not represent legal status, membership eligibility, recommendation, labor-relations advice, or official endorsement.'}</div>
      {view === 'overview' && <Overview summary={activeSummary} language={language} />}
      {view === 'types' && <div className="chart-grid"><BarChart title={zh ? '各工會屬性筆數' : 'Labor unions by type'} data={activeSummary.byUnionType.map((item) => ({ label: unionTypeLabels[language][item.unionType], value: item.count }))} /></div>}
      {view === 'districts' && <LaborUnionMap summary={activeSummary} language={language} viewDistrict={openDistrict} />}
      {view === 'address' && <div className="chart-grid">
        <BarChart title={zh ? '地址類型分布' : 'Address type distribution'} data={activeSummary.byAddressLocationCategory.map((item) => ({ label: addressLabels[language][item.addressLocationCategory], value: item.count }))} />
        <BarChart title={zh ? '道路名稱分布' : 'Road-name distribution'} data={activeSummary.byRoadName.slice(0, 40).map((item) => ({ label: item.roadName, value: item.count }))} />
        <BarChart title={zh ? '電話類型分布' : 'Phone type distribution'} data={activeSummary.byPhoneType.map((item) => ({ label: phoneLabels[language][item.phoneType], value: item.count }))} />
        {activeSummary.duplicateAddressGroups.length > 0 && <BarChart title={zh ? '同地址多筆群組' : 'Duplicate address groups'} data={activeSummary.duplicateAddressGroups.map((item) => ({ label: item.address, value: item.count }))} />}
      </div>}
      {view === 'directory' && <><div className="section-heading inline"><div /><strong>{filtered.length.toLocaleString()} <span>{zh ? '筆符合紀錄' : 'matching records'}</span></strong></div><Directory records={filtered} language={language} /></>}
      {view === 'notes' && <div className="notes-grid"><article><h3>{zh ? '資料內容' : 'Data contents'}</h3><p>{zh ? '來源欄位包含項次、工會屬性、工會名稱、理事長、郵遞區號、通訊地址與聯絡電話。本網站保留原始通訊資料，並將臺北市地址彙總至行政區層級。' : 'Source fields include sequence number, union type, union name, chairperson, postal code, contact address, and phone. This site preserves contact fields and summarizes Taipei addresses at district level.'}</p></article>
        <article><h3>{zh ? '地圖限制' : 'Map limits'}</h3><p>{zh ? '資料未提供經緯度；本網站不進行地理編碼，僅以臺北市行政區中心點呈現彙總。臺北市以外、郵政信箱或未解析地址只保留於清單與統計。' : 'The data provides no coordinates; this site does not geocode. Taipei records are mapped only as district-centroid summaries. Outside-Taipei, postal-box, and unparsed addresses remain in the directory and statistics only.'}</p></article>
        <article><h3>{zh ? '資料來源' : 'Source'}</h3><p><a href="https://data.taipei/dataset/detail?id=bea69229-8349-4208-8a68-988718f4ea48" target="_blank" rel="noreferrer">{zh ? '臺北市各工會名單及聯絡方式' : 'Taipei Registered Labor Unions'} ↗</a></p></article></div>}
    </section></>;
}
