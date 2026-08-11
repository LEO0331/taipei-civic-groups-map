import { useEffect, useMemo, useState } from 'react';

type Record = { id: string; sourceSequenceNumber: string; cityCode: string; institutionName: string; address: string; districtName: string; phone: string; hasPhone: boolean; googleMapsQuery: string };
type Report = { duplicates: string[]; missingNames: string[]; missingAddresses: string[]; malformedPhones: string[]; unknownCityCodes: string[]; unresolvedDistricts: string[] };
type ChartItem = { label: string; value: number };

const missing = '—';
const Chart = ({ title, data }: { title: string; data: ChartItem[] }) => {
  const max = Math.max(1, ...data.map((item) => item.value));
  return <section className="chart"><h3>{title}</h3><div className="bars">{data.map((item) => <div className="bar-row wide-label" key={item.label}><span>{item.label}</span><div><i style={{ width: `${Math.max(2, item.value / max * 100)}%` }} /></div><b>{item.value}</b></div>)}</div></section>;
};

export default function HomeNursingInstitutionsModule({ language }: { language: 'zh' | 'en' }) {
  const zh = language === 'zh';
  const t = (chinese: string, english: string) => zh ? chinese : english;
  const [records, setRecords] = useState<Record[]>([]);
  const [report, setReport] = useState<Report | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [view, setView] = useState('overview');
  const [search, setSearch] = useState('');
  const [district, setDistrict] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [sort, setSort] = useState('name');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const base = `${import.meta.env.BASE_URL}data/home-nursing-institutions/`;
    fetch(`${base}records.json`).then((response) => {
      if (!response.ok) throw new Error('records unavailable');
      return response.json();
    }).then(setRecords).catch(() => setLoadError(true));
    fetch(`${base}conversion-report.json`).then((response) => response.ok ? response.json() : null).then(setReport).catch(() => setReport(null));
  }, []);

  const resetPage = (set: (value: string) => void, value: string) => { set(value); setPage(1); };
  const filtered = useMemo(() => records.filter((record) => {
    const query = search.trim().toLowerCase();
    return (!query || [record.institutionName, record.districtName, record.address, record.phone, record.cityCode].join(' ').toLowerCase().includes(query))
      && (!district || record.districtName === district)
      && (!phone || (phone === 'yes' ? record.hasPhone : !record.hasPhone))
      && (!address || (address === 'yes' ? Boolean(record.address) : !record.address));
  }), [records, search, district, phone, address]);
  const byDistrict = useMemo(() => [...new Set(filtered.map((record) => record.districtName).filter(Boolean))]
    .map((label) => ({ label, value: filtered.filter((record) => record.districtName === label).length }))
    .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label, 'zh-Hant')), [filtered]);
  const summary = useMemo(() => ({
    total: filtered.length,
    uniqueNames: new Set(filtered.map((record) => record.institutionName).filter(Boolean)).size,
    districts: byDistrict.length,
    phones: filtered.filter((record) => record.hasPhone).length,
    addresses: filtered.filter((record) => Boolean(record.address)).length,
    topDistrict: byDistrict[0]?.label || missing,
  }), [filtered, byDistrict]);
  const sorted = useMemo(() => [...filtered].sort((a, b) => {
    if (sort === 'district') return a.districtName.localeCompare(b.districtName, 'zh-Hant') || a.institutionName.localeCompare(b.institutionName, 'zh-Hant');
    if (sort === 'id') return a.sourceSequenceNumber.localeCompare(b.sourceSequenceNumber, undefined, { numeric: true });
    return a.institutionName.localeCompare(b.institutionName, 'zh-Hant');
  }), [filtered, sort]);
  const pages = Math.max(1, Math.ceil(sorted.length / 25));
  const rows = sorted.slice((Math.min(page, pages) - 1) * 25, Math.min(page, pages) * 25);
  const copy = (value: string) => value && <button type="button" className="copy-button" aria-label={t('複製', 'Copy')} onClick={() => navigator.clipboard?.writeText(value)}>{t('複製', 'Copy')}</button>;
  const mapLink = (query: string) => query ? <a target="_blank" rel="noreferrer" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`}>{t('地圖查詢', 'Map lookup')}</a> : missing;
  const download = () => {
    const quote = (value: string) => `"${value.replaceAll('"', '""')}"`;
    const contents = [['ID', 'Institution name', 'District', 'Address', 'Phone', 'City code'], ...filtered.map((record) => [record.sourceSequenceNumber, record.institutionName, record.districtName, record.address, record.phone, record.cityCode])].map((line) => line.map(quote).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob(['\uFEFF', contents], { type: 'text/csv;charset=utf-8' }));
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'home-nursing-institutions-filtered.csv'; anchor.click(); URL.revokeObjectURL(url);
  };

  if (loadError) return <section className="workspace"><div className="notice">{t('無法載入本機資料檔。', 'The local data file could not be loaded.')}</div></section>;
  const phoneData = [{ label: t('有電話', 'With phone'), value: summary.phones }, { label: t('無電話', 'Without phone'), value: summary.total - summary.phones }];
  const addressData = [{ label: t('有地址', 'With address'), value: summary.addresses }, { label: t('無地址', 'Without address'), value: summary.total - summary.addresses }];
  return <section className="workspace">
    <div className="section-heading"><p>MEDICAL PROVIDERS / HOME NURSING</p><h2>{t('臺北市居家護理所', 'Taipei Home Nursing Institutions')}</h2><span>{t('公開名錄、行政區統計與外部地址查詢；不建立精確地圖標記。', 'Public directory, district summaries, and external address lookup only; no exact map markers.')}</span></div>
    <div className="subtabs">{[['overview', t('總覽', 'Overview')], ['districts', t('行政區分布', 'District Distribution')], ['directory', t('居家護理所名錄', 'Home Nursing Institution Directory')], ['quality', t('資料品質', 'Data Quality')], ['notes', t('資料說明', 'Data Notes')]].map(([id, label]) => <button type="button" className={view === id ? 'active' : ''} key={id} onClick={() => { setView(id); setPage(1); }}>{label}</button>)}</div>
    <aside className="filters"><label className="search"><input value={search} onChange={(event) => resetPage(setSearch, event.target.value)} placeholder={t('搜尋機構、行政區、地址、電話或縣市代碼', 'Search institution, district, address, phone, or city code')} /></label><div className="filter-grid">
      <label>{t('行政區', 'District')}<select value={district} onChange={(event) => resetPage(setDistrict, event.target.value)}><option value="">{t('全部', 'All')}</option>{[...new Set(records.map((record) => record.districtName).filter(Boolean))].map((item) => <option key={item}>{item}</option>)}</select></label>
      {[[t('有電話', 'Has phone'), phone, setPhone], [t('有地址', 'Has address'), address, setAddress]].map(([label, value, set]) => <label key={String(label)}>{String(label)}<select value={String(value)} onChange={(event) => resetPage(set as (value: string) => void, event.target.value)}><option value="">{t('全部', 'All')}</option><option value="yes">{t('是', 'Yes')}</option><option value="no">{t('否', 'No')}</option></select></label>)}
    </div></aside>
    {view === 'overview' && <><div className="notice subtle">{t('本資料為臺北市居家護理所公開名錄，僅供醫療院所與公共資料查詢參考，不代表即時營運狀態、目前容量、服務範圍、到宅服務可用性、資格、費用、護理品質、醫療能力、緊急服務或官方推薦。實際服務、收案條件、費用與其他資訊請向機構或臺北市政府衛生局確認。', 'This dataset is a public directory of home nursing institutions in Taipei. It does not represent real-time operating status, current capacity, service coverage, home-visit availability, eligibility, fees, nursing quality, medical capability, emergency services, or official recommendation. Confirm current services, admission conditions, fees, and other information with the institution or Taipei City Department of Health.')}</div><div className="summary-grid">{[[t('機構總數', 'Total institutions'), summary.total], [t('不重複機構名稱', 'Unique institution names'), summary.uniqueNames], [t('涵蓋行政區', 'Districts covered'), summary.districts], [t('有電話紀錄', 'Records with phone'), summary.phones], [t('有地址紀錄', 'Records with addresses'), summary.addresses], [t('機構最多的行政區', 'District with most institutions'), summary.topDistrict]].map(([label, value]) => <article key={String(label)}><span>{label}</span><strong>{value}</strong></article>)}</div><Chart title={t('各行政區機構數', 'Institutions by district')} data={byDistrict} /></>}
    {view === 'districts' && <><Chart title={t('各行政區機構數', 'Institutions by district')} data={byDistrict} /><Chart title={t('有無電話紀錄', 'Records with and without phone')} data={phoneData} /><Chart title={t('有無可用地址紀錄', 'Records with and without usable addresses')} data={addressData} /></>}
    {view === 'directory' && <><div className="section-heading inline"><p>{t('篩選後紀錄', 'Filtered records')}</p><strong>{sorted.length}</strong><button type="button" onClick={download}>{t('下載篩選後 CSV', 'Download filtered CSV')}</button><label>{t('排序', 'Sort')}<select value={sort} onChange={(event) => { setSort(event.target.value); setPage(1); }}><option value="name">{t('機構名稱', 'Institution name')}</option><option value="district">{t('行政區', 'District')}</option><option value="id">ID</option></select></label></div><div className="comparison-scroll procurement-table"><table><thead><tr>{[[t('序號', 'ID')], [t('機構名稱', 'Institution name')], [t('行政區', 'District')], [t('地址', 'Address')], [t('電話', 'Phone')], [t('地圖查詢', 'Map lookup')]].map(([label]) => <th key={label}>{label}</th>)}</tr></thead><tbody>{rows.map((record) => <tr key={record.id}><td>{record.sourceSequenceNumber || missing}</td><th>{record.institutionName || missing}</th><td>{record.districtName || missing}</td><td>{record.address || missing} {copy(record.address)}</td><td>{record.phone ? <><a href={`tel:${record.phone.replace(/[^\d+]/g, '')}`}>{record.phone}</a> {copy(record.phone)}</> : missing}</td><td>{mapLink(record.googleMapsQuery)}</td></tr>)}</tbody></table></div><div className="pagination"><button type="button" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>{t('上一頁', 'Previous')}</button><span>{page} / {pages}</span><button type="button" disabled={page >= pages} onClick={() => setPage((value) => value + 1)}>{t('下一頁', 'Next')}</button></div></>}
    {view === 'quality' && <div className="notes-grid"><article><h3>{t('資料品質', 'Data quality')}</h3><p>{t(`輸入資料共 ${records.length} 筆；轉換後 ${report ? records.length : filtered.length} 筆可供瀏覽。重複 ${report?.duplicates.length ?? 0} 筆、缺少名稱 ${report?.missingNames.length ?? 0} 筆、缺少地址 ${report?.missingAddresses.length ?? 0} 筆、電話格式待確認 ${report?.malformedPhones.length ?? 0} 筆、非預期縣市代碼 ${report?.unknownCityCodes.length ?? 0} 筆、無法可靠判定行政區 ${report?.unresolvedDistricts.length ?? 0} 筆。`, `The local data contains ${records.length} records available for browsing. The conversion report has ${report?.duplicates.length ?? 0} duplicate rows, ${report?.missingNames.length ?? 0} missing names, ${report?.missingAddresses.length ?? 0} missing addresses, ${report?.malformedPhones.length ?? 0} phone values to verify, ${report?.unknownCityCodes.length ?? 0} unexpected city codes, and ${report?.unresolvedDistricts.length ?? 0} unresolved districts.`)}</p></article></div>}
    {view === 'notes' && <div className="notes-grid"><article><h3>{t('資料範圍', 'Data scope')}</h3><p>{t('地址僅供外部地圖查詢，不表示到宅服務範圍或服務可用性。本頁不提供醫療、護理或緊急照護建議。', 'Addresses are for external map search only; they do not indicate service coverage or home-visit availability. This page does not provide medical, nursing, or emergency-care advice.')}</p></article></div>}
  </section>;
}
