import { useEffect, useMemo, useState } from 'react';
import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet';
import { DISTRICTS, TAIPEI_DISTRICT_CENTROIDS } from './lib/civicGroups';
import { buildQuasiPublicInfantCareCenterSummary, filterQuasiPublicInfantCareCenters } from './lib/quasiPublicInfantCareCenters';
import type {
  InfantCareCapacityStatus, InfantCareCenterOperationType, InfantCareCenterPhoneType, InfantCareEvaluationGrade,
  Language, QuasiPublicInfantCareCenter, QuasiPublicInfantCareCenterFilters, QuasiPublicInfantCareCenterSummary,
} from './types';

const emptyFilters: QuasiPublicInfantCareCenterFilters = { search: '', district: '', roadName: '', centerOperationType: '', capacityStatus: '', evaluationGrade: '', evaluationYear: '', hasEvaluationResult: '', approvedMin: '', approvedMax: '', actualMin: '', actualMax: '', gapMin: '', gapMax: '', occupancyMin: '', occupancyMax: '', phoneType: '' };
const capacityLabels: Record<Language, Record<InfantCareCapacityStatus, string>> = {
  zh: { apparent_full: '表列已滿', apparent_remaining_capacity: '表列仍有收托差額', unknown: '未知' },
  en: { apparent_full: 'Listed as full', apparent_remaining_capacity: 'Listed capacity gap remains', unknown: 'Unknown' },
};
const gradeLabels: Record<Language, Record<InfantCareEvaluationGrade, string>> = {
  zh: { excellent: '優', grade_a: '甲', grade_b: '乙', grade_c: '丙', other: '其他', missing: '缺漏', unknown: '未知' },
  en: { excellent: 'Excellent', grade_a: 'Grade A', grade_b: 'Grade B', grade_c: 'Grade C', other: 'Other', missing: 'Missing', unknown: 'Unknown' },
};
const typeLabels: Record<Language, Record<InfantCareCenterOperationType, string>> = {
  zh: { private_infant_care_center: '私立托嬰中心', public_childcare_home: '公共托育家園', public_or_commissioned_center: '公辦或委託經營', other: '其他', unknown: '未知' },
  en: { private_infant_care_center: 'Private infant care center', public_childcare_home: 'Public childcare home', public_or_commissioned_center: 'Public or commissioned center', other: 'Other', unknown: 'Unknown' },
};
const phoneLabels: Record<Language, Record<InfantCareCenterPhoneType, string>> = {
  zh: { taipei_landline: '臺北市話', mobile: '手機', extension: '含分機', missing: '未提供', unknown: '未知' },
  en: { taipei_landline: 'Taipei landline', mobile: 'Mobile', extension: 'Extension', missing: 'Missing', unknown: 'Unknown' },
};
const fmt = (value?: number, suffix = '') => value === undefined ? '-' : `${value.toLocaleString()}${suffix}`;

function BarChart({ title, data }: { title: string; data: Array<{ label: string; value: number }> }) {
  const max = Math.max(...data.map((item) => item.value), 1);
  return <section className="chart"><h3>{title}</h3><div className="bars">{data.map((item) =>
    <div className="bar-row wide-label" key={item.label}><span title={item.label}>{item.label}</span><div><i style={{ width: `${Math.max(2, item.value / max * 100)}%` }} /></div><b>{fmt(item.value)}</b></div>)}</div></section>;
}

function Filters({ filters, setFilters, records, language }: { filters: QuasiPublicInfantCareCenterFilters; setFilters: (filters: QuasiPublicInfantCareCenterFilters) => void; records: QuasiPublicInfantCareCenter[]; language: Language }) {
  const zh = language === 'zh', update = (key: keyof QuasiPublicInfantCareCenterFilters, value: string) => setFilters({ ...filters, [key]: value });
  const options = <T extends string>(values: Array<T | undefined>) => [...new Set(values.filter(Boolean) as T[])].sort((a, b) => a.localeCompare(b));
  return <aside className="filters infant-filters"><label className="search"><span aria-hidden="true">⌕</span><input value={filters.search} onChange={(event) => update('search', event.target.value)} placeholder={zh ? '搜尋機構名稱、行政區、地址、電話或評鑑結果' : 'Search center name, district, address, phone, or evaluation result'} /></label>
    <div className="filter-grid grant-filters">
      <label>{zh ? '行政區' : 'District'}<select value={filters.district} onChange={(event) => update('district', event.target.value)}><option value="">{zh ? '全部' : 'All'}</option>{DISTRICTS.map((district) => <option key={district}>{district}</option>)}</select></label>
      <label>{zh ? '道路' : 'Road'}<select value={filters.roadName} onChange={(event) => update('roadName', event.target.value)}><option value="">{zh ? '全部' : 'All'}</option>{options(records.map((record) => record.roadName)).map((road) => <option key={road}>{road}</option>)}</select></label>
      <label>{zh ? '機構類型' : 'Center type'}<select value={filters.centerOperationType} onChange={(event) => update('centerOperationType', event.target.value)}><option value="">{zh ? '全部' : 'All'}</option>{options(records.map((record) => record.centerOperationType)).map((type) => <option value={type} key={type}>{typeLabels[language][type]}</option>)}</select></label>
      <label>{zh ? '收托狀態' : 'Capacity status'}<select value={filters.capacityStatus} onChange={(event) => update('capacityStatus', event.target.value)}><option value="">{zh ? '全部' : 'All'}</option>{options(records.map((record) => record.capacityStatus)).map((status) => <option value={status} key={status}>{capacityLabels[language][status]}</option>)}</select></label>
      <label>{zh ? '評鑑等第' : 'Evaluation grade'}<select value={filters.evaluationGrade} onChange={(event) => update('evaluationGrade', event.target.value)}><option value="">{zh ? '全部' : 'All'}</option>{options(records.map((record) => record.evaluationGrade)).map((grade) => <option value={grade} key={grade}>{gradeLabels[language][grade]}</option>)}</select></label>
      <label>{zh ? '評鑑年度' : 'Evaluation year'}<select value={filters.evaluationYear} onChange={(event) => update('evaluationYear', event.target.value)}><option value="">{zh ? '全部' : 'All'}</option>{options(records.map((record) => record.evaluationRocYear ? String(record.evaluationRocYear) : undefined)).map((year) => <option key={year}>{year}</option>)}</select></label>
      <label>{zh ? '有評鑑結果' : 'Has evaluation result'}<select value={filters.hasEvaluationResult} onChange={(event) => update('hasEvaluationResult', event.target.value)}><option value="">{zh ? '全部' : 'All'}</option><option value="yes">{zh ? '有' : 'Yes'}</option><option value="no">{zh ? '無' : 'No'}</option></select></label>
      <label>{zh ? '電話類型' : 'Phone type'}<select value={filters.phoneType} onChange={(event) => update('phoneType', event.target.value)}><option value="">{zh ? '全部' : 'All'}</option>{options(records.map((record) => record.phoneType)).map((type) => <option value={type} key={type}>{phoneLabels[language][type]}</option>)}</select></label>
      {(['approved', 'actual', 'gap', 'occupancy'] as const).map((key) => <label key={key}>{({ approved: zh ? '核定收托人數範圍' : 'Approved capacity range', actual: zh ? '實際收托人數範圍' : 'Actual enrollment range', gap: zh ? '表列收托差額範圍' : 'Listed capacity gap range', occupancy: zh ? '收托率範圍' : 'Occupancy rate range' })[key]}<div className="range-pair"><input type="number" value={filters[`${key}Min`]} onChange={(event) => update(`${key}Min`, event.target.value)} /><input type="number" value={filters[`${key}Max`]} onChange={(event) => update(`${key}Max`, event.target.value)} /></div></label>)}
    </div>{Object.values(filters).some(Boolean) && <button className="text-button" onClick={() => setFilters(emptyFilters)}>{zh ? '清除篩選' : 'Clear filters'}</button>}</aside>;
}

function Overview({ summary, language }: { summary: QuasiPublicInfantCareCenterSummary; language: Language }) {
  const zh = language === 'zh', topCapacityDistrict = [...summary.byDistrict].sort((a, b) => (b.totalApprovedCapacity ?? 0) - (a.totalApprovedCapacity ?? 0))[0];
  const cards = [
    [zh ? '托嬰中心數' : 'Center count', summary.totalRecords], [zh ? '涵蓋行政區數' : 'Districts covered', summary.districtCount],
    [zh ? '核定收托人數總計' : 'Total approved capacity', summary.totalApprovedCapacity], [zh ? '實際收托人數總計' : 'Total actual enrollment', summary.totalActualEnrollment],
    [zh ? '表列收托差額' : 'Listed capacity gap', summary.totalApparentRemainingCapacity], [zh ? '平均收托率' : 'Average occupancy rate', fmt(summary.averageOccupancyRatePercent, '%')],
    [zh ? '收托率中位數' : 'Median occupancy rate', fmt(summary.medianOccupancyRatePercent, '%')], [zh ? '有評鑑結果紀錄' : 'Records with evaluation result', summary.recordsWithEvaluationResult],
    [zh ? '托嬰中心最多行政區' : 'Top district by center count', summary.byDistrict[0]?.district ?? '-'], [zh ? '核定收托人數最多行政區' : 'Top district by approved capacity', topCapacityDistrict?.district ?? '-'],
    [zh ? '最常見評鑑等第' : 'Most common evaluation grade', summary.byEvaluationGrade[0] ? gradeLabels[language][summary.byEvaluationGrade[0].evaluationGrade] : '-'],
  ];
  return <><div className="notice subtle">{zh ? '此圖僅比較公開資料中的準公共化托嬰中心名冊、核定收托人數、實際收托人數與評鑑結果，不代表即時收托名額、服務品質保證、推薦排名、托育建議、收費資訊、營運狀態或官方背書。' : 'This chart only compares quasi-public infant care center directory records, approved capacity, actual enrollment, and evaluation results from public data. It does not represent real-time vacancy, service-quality guarantee, recommendation ranking, childcare advice, pricing information, operating status, or official endorsement.'}</div>
    <div className="summary-grid">{cards.map(([label, value]) => <article key={label}><span>{label}</span><strong>{typeof value === 'number' ? fmt(value) : value}</strong></article>)}</div>
    <div className="chart-grid">
      <BarChart title={zh ? '各行政區托嬰中心數' : 'Centers by district'} data={summary.byDistrict.map((item) => ({ label: item.district, value: item.centerCount }))} />
      <BarChart title={zh ? '各行政區核定收托人數' : 'Approved capacity by district'} data={summary.byDistrict.map((item) => ({ label: item.district, value: item.totalApprovedCapacity ?? 0 }))} />
      <BarChart title={zh ? '各行政區實際收托人數' : 'Actual enrollment by district'} data={summary.byDistrict.map((item) => ({ label: item.district, value: item.totalActualEnrollment ?? 0 }))} />
      <BarChart title={zh ? '各行政區表列收托差額' : 'Listed capacity gap by district'} data={summary.byDistrict.map((item) => ({ label: item.district, value: item.totalApparentRemainingCapacity ?? 0 }))} />
      <BarChart title={zh ? '評鑑等第分布' : 'Evaluation grade distribution'} data={summary.byEvaluationGrade.map((item) => ({ label: gradeLabels[language][item.evaluationGrade], value: item.count }))} />
      <BarChart title={zh ? '收托狀態分布' : 'Capacity status distribution'} data={summary.byCapacityStatus.map((item) => ({ label: capacityLabels[language][item.capacityStatus], value: item.count }))} />
    </div></>;
}

function CareMap({ summary, language, viewDistrict }: { summary: QuasiPublicInfantCareCenterSummary; language: Language; viewDistrict: (district: string) => void }) {
  const zh = language === 'zh', max = Math.max(...summary.byDistrict.map((district) => district.centerCount), 1);
  return <div className="map-wrap"><div className="notice">{zh ? '準公共化托嬰中心資料未提供經緯度，地圖以行政區彙總呈現，不代表精確托嬰中心位置。詳細位置請查看地址並以地圖連結、托嬰中心或官方資訊確認。' : 'Quasi-public infant care center data does not provide coordinates. The map shows district-level summaries and does not represent exact infant care center locations. Please check the address and verify details through map links, the center, or official information.'}</div>
    <MapContainer center={[25.072, 121.54]} zoom={11} scrollWheelZoom={false}><TileLayer attribution='&copy; OpenStreetMap contributors &copy; CARTO' url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
      {summary.byDistrict.map((district) => {
        const point = TAIPEI_DISTRICT_CENTROIDS[district.district];
        return point && <CircleMarker key={district.district} center={[point.latitude, point.longitude]} radius={10 + 26 * Math.sqrt(district.centerCount / max)} pathOptions={{ fillColor: '#b25d7b', fillOpacity: .76, color: '#fff7e8', weight: 2 }}>
          <Popup><div className="map-popup"><strong>{zh ? '準公共化托嬰中心' : 'Quasi-Public Infant Care Centers'}</strong><p>{zh ? '行政區' : 'District'}: {district.district}</p><p>{zh ? '托嬰中心數' : 'Center count'}: {fmt(district.centerCount)}</p><p>{zh ? '核定收托人數' : 'Approved capacity'}: {fmt(district.totalApprovedCapacity)}</p><p>{zh ? '實際收托人數' : 'Actual enrollment'}: {fmt(district.totalActualEnrollment)}</p><p>{zh ? '表列收托差額' : 'Listed capacity gap'}: {fmt(district.totalApparentRemainingCapacity)}</p><button onClick={() => viewDistrict(district.district)}>{zh ? '查看清單' : 'View directory'}</button></div></Popup>
        </CircleMarker>;
      })}</MapContainer></div>;
}

function Directory({ records, language }: { records: QuasiPublicInfantCareCenter[]; language: Language }) {
  const zh = language === 'zh';
  const [limit, setLimit] = useState(80);
  useEffect(() => setLimit(80), [records]);
  return <><div className="comparison-scroll procurement-table"><table><thead><tr>{(zh ? ['機構名稱', '行政區', '地址', '電話', '核定收托人數', '實際收托人數', '表列收托差額', '評鑑結果', '地圖查詢', '來源明細'] : ['Center name', 'District', 'Address', 'Phone', 'Approved capacity', 'Actual enrollment', 'Listed capacity gap', 'Evaluation result', 'Map lookup', 'Source details']).map((label) => <th key={label}>{label}</th>)}</tr></thead>
    <tbody>{records.slice(0, limit).map((record) => <tr key={record.id}><th>{record.centerName}</th><td>{record.district ?? '-'}</td><td>{record.address ?? '-'}</td><td>{record.phoneDialHref ? <a href={record.phoneDialHref}>{record.phoneDisplay ?? record.phone}</a> : record.phoneDisplay ?? record.phone ?? '-'}</td><td>{fmt(record.approvedCapacity)}</td><td>{fmt(record.actualEnrollment)}</td><td>{fmt(record.apparentRemainingCapacity)}</td><td>{record.evaluationResultRaw ?? '-'}</td><td>{record.address ? <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(record.addressNormalized ?? record.address)}`} target="_blank" rel="noreferrer">{zh ? '地圖查詢' : 'Map lookup'}</a> : '-'}</td>
      <td><details><summary>{zh ? '來源明細' : 'Source details'}</summary><dl><div><dt>{zh ? '序號' : 'Sequence number'}</dt><dd>{record.sourceSequenceNumber ?? '-'}</dd></div><div><dt>{zh ? '機構類型' : 'Center type'}</dt><dd>{typeLabels[language][record.centerOperationType]} ({zh ? '名稱推測' : 'name heuristic'})</dd></div><div><dt>{zh ? '道路' : 'Road'}</dt><dd>{record.roadName ?? '-'}</dd></div><div><dt>{zh ? '電話類型' : 'Phone type'}</dt><dd>{phoneLabels[language][record.phoneType]}</dd></div><div><dt>{zh ? '收托率' : 'Occupancy rate'}</dt><dd>{fmt(record.occupancyRatePercent, '%')}</dd></div><div><dt>{zh ? '收托狀態' : 'Capacity status'}</dt><dd>{capacityLabels[language][record.capacityStatus]}</dd></div><div><dt>{zh ? '評鑑年度' : 'Evaluation year'}</dt><dd>{record.evaluationRocYear ? `${record.evaluationRocYear} / ${record.evaluationGregorianYear}` : '-'}</dd></div><div><dt>{zh ? '評鑑等第' : 'Evaluation grade'}</dt><dd>{gradeLabels[language][record.evaluationGrade]}</dd></div><div><dt>{zh ? '資料來源' : 'Source'}</dt><dd>{record.source}</dd></div><div><dt>{zh ? '來源機關' : 'Source agency'}</dt><dd>{record.sourceAgency}</dd></div><div><dt>{zh ? '解讀限制' : 'Disclaimer'}</dt><dd>{zh ? '表列收托差額不是即時可收托名額；本資料不代表服務品質保證、推薦排名、托育建議、收費資訊、營運狀態或官方背書。' : 'Listed capacity gap is not real-time vacancy; this data does not represent service-quality guarantee, recommendation ranking, childcare advice, pricing information, operating status, or official endorsement.'}</dd></div></dl></details></td></tr>)}</tbody></table></div>
    {!records.length && <p className="empty">{zh ? '沒有符合條件的紀錄。' : 'No records match these filters.'}</p>}{limit < records.length && <button className="load-more" onClick={() => setLimit(limit + 80)}>{zh ? '載入更多' : 'Load more'} · {records.length - limit}</button>}</>;
}

export default function QuasiPublicInfantCareCentersModule({ records, summary, language }: { records: QuasiPublicInfantCareCenter[]; summary: QuasiPublicInfantCareCenterSummary; language: Language }) {
  const zh = language === 'zh';
  const [view, setView] = useState<'overview' | 'map' | 'capacity' | 'evaluation' | 'directory' | 'notes'>('overview');
  const [filters, setFilters] = useState(emptyFilters);
  const filtered = useMemo(() => filterQuasiPublicInfantCareCenters(records, filters), [records, filters]);
  const activeSummary = useMemo(() => Object.values(filters).some(Boolean) ? buildQuasiPublicInfantCareCenterSummary(filtered) : summary, [filtered, filters, summary]);
  const openDistrict = (district: string) => { setFilters({ ...emptyFilters, district }); setView('directory'); };
  const views = [['overview', zh ? '總覽' : 'Overview'], ['map', zh ? '行政區分布' : 'District Distribution'], ['capacity', zh ? '收托人數與容量' : 'Capacity & Enrollment'], ['evaluation', zh ? '評鑑結果' : 'Evaluation Results'], ['directory', zh ? '托嬰中心清單' : 'Infant Care Center Directory'], ['notes', zh ? '資料說明' : 'Data Notes']] as const;
  return <><Filters filters={filters} setFilters={setFilters} records={records} language={language} /><section className="workspace"><div className="section-heading"><p>10 / CHILDCARE REGISTRY</p><h2>{zh ? '準公共化托嬰中心' : 'Quasi-Public Infant Care Centers'}</h2><span>{zh ? '整理臺北市公開資料中的準公共化托嬰中心名冊，依行政區、地址、核定收托人數、實際收托人數與評鑑結果提供查詢與統計。' : 'Explore Taipei public-data quasi-public infant care center directory records by district, address, approved capacity, actual enrollment, and evaluation result.'}</span></div>
    <div className="subtabs">{views.map(([id, label]) => <button className={view === id ? 'active' : ''} onClick={() => setView(id)} key={id}>{label}</button>)}</div><div className="notice subtle">{zh ? '準公共化托嬰中心資料為臺北市公開資料中的托嬰中心名冊，僅供資料查詢、行政區分布、核定收托人數、實際收托人數與評鑑結果整理使用，不代表即時收托名額、服務品質保證、推薦排名、托育建議、收費資訊、營運狀態或官方背書。實際收托名額、收費、服務內容、營運狀態與最新評鑑資訊請以托嬰中心、主管機關或官方公告為準。' : 'Quasi-public infant care center data is a Taipei public-data directory of infant care centers for lookup, district distribution, approved capacity, actual enrollment, and evaluation-result organization only. It does not represent real-time vacancy, service-quality guarantee, recommendation ranking, childcare advice, pricing information, operating status, or official endorsement. Actual vacancies, fees, services, operating status, and latest evaluation information should be verified with the infant care center, competent authority, or official announcements.'}</div>
    {view === 'overview' && <Overview summary={activeSummary} language={language} />}{view === 'map' && <CareMap summary={activeSummary} language={language} viewDistrict={openDistrict} />}
    {view === 'capacity' && <div className="chart-grid"><BarChart title={zh ? '各行政區核定收托人數' : 'Approved capacity by district'} data={activeSummary.byDistrict.map((item) => ({ label: item.district, value: item.totalApprovedCapacity ?? 0 }))} /><BarChart title={zh ? '各行政區實際收托人數' : 'Actual enrollment by district'} data={activeSummary.byDistrict.map((item) => ({ label: item.district, value: item.totalActualEnrollment ?? 0 }))} /><BarChart title={zh ? '各行政區表列收托差額' : 'Listed capacity gap by district'} data={activeSummary.byDistrict.map((item) => ({ label: item.district, value: item.totalApparentRemainingCapacity ?? 0 }))} /><BarChart title={zh ? '各行政區收托率' : 'Occupancy rate by district'} data={activeSummary.byDistrict.map((item) => ({ label: item.district, value: item.averageOccupancyRatePercent ?? 0 }))} /></div>}
    {view === 'evaluation' && <div className="chart-grid"><BarChart title={zh ? '評鑑等第分布' : 'Evaluation grade distribution'} data={activeSummary.byEvaluationGrade.map((item) => ({ label: gradeLabels[language][item.evaluationGrade], value: item.count }))} /><BarChart title={zh ? '評鑑年度分布' : 'Evaluation year distribution'} data={activeSummary.byEvaluationYear.map((item) => ({ label: `${item.evaluationRocYear} / ${item.evaluationGregorianYear}`, value: item.count }))} /><BarChart title={zh ? '機構類型分布' : 'Center type distribution'} data={activeSummary.byCenterOperationType.map((item) => ({ label: typeLabels[language][item.centerOperationType], value: item.count }))} /></div>}
    {view === 'directory' && <><div className="section-heading inline"><div /><strong>{filtered.length.toLocaleString()} <span>{zh ? '筆符合紀錄' : 'matching records'}</span></strong></div><Directory records={filtered} language={language} /></>}
    {view === 'notes' && <div className="notes-grid"><article><h3>{zh ? '資料內容' : 'Data contents'}</h3><p>{zh ? '準公共化托嬰中心資料提供臺北市準公共化托嬰中心名冊，欄位包含序號、機構名稱、行政區、地址、電話、核定收托人數、實際收托人數與評鑑結果。本網站將地址解析為行政區與道路名稱，並將評鑑結果拆解為評鑑年度與等第，同時衍生表列收托差額與收托率供資料探索使用。資料未提供經緯度，因此預設不顯示精確點位。' : 'Quasi-public infant care center data provides Taipei directory records for quasi-public infant care centers, including sequence number, center name, district, address, phone, approved capacity, actual enrollment, and evaluation result. This site parses addresses into district and road name, splits evaluation results into evaluation year and grade, and derives listed capacity gap and occupancy rate for data exploration. The data does not provide coordinates, so exact map points are not shown by default.'}</p></article><article><h3>{zh ? '解讀限制' : 'Interpretation limits'}</h3><p>{zh ? '本資料為公開名冊，僅供資料查詢與統計整理，不代表即時收托名額、服務品質保證、推薦排名、托育建議、收費資訊、營運狀態或官方背書。核定收托人數與實際收托人數為來源資料欄位，本網站衍生之表列收托差額並非即時可收托名額。評鑑結果為來源資料欄位，應與最新主管機關公告一併確認。' : 'This data is a public directory for lookup and statistical organization only. It does not represent real-time vacancy, service-quality guarantee, recommendation ranking, childcare advice, pricing information, operating status, or official endorsement. Approved capacity and actual enrollment are source-data fields, and the listed capacity gap derived by this site is not real-time vacancy. Evaluation result is a source-data field and should be verified together with latest competent-authority announcements.'}</p></article><article><h3>{zh ? '資料來源' : 'Source'}</h3><p><a href="https://data.taipei/dataset/detail?id=aeaaa517-089c-42a7-ad5b-60fef89c3545" target="_blank" rel="noreferrer">{zh ? '臺北市準公共化托嬰中心' : 'Taipei Quasi-Public Infant Care Centers'} ↗</a></p></article></div>}
  </section></>;
}
