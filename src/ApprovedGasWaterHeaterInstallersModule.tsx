import { useEffect, useMemo, useState, type ReactNode } from 'react';

export interface GasWaterHeaterInstallerRecord {
  id: string;
  installerName: string;
  address: string;
  districtName: string;
  phone: string;
  responsiblePerson: string;
  technicianName: string;
  technicianCertificateNumber: string;
  certificateEffectiveDate: string;
  employmentDate: string;
  latestTrainingDate: string;
  googleMapsQuery: string;
}

const MISSING = '—';
const DISTRICTS = ['中正區', '大同區', '中山區', '松山區', '大安區', '萬華區', '信義區', '士林區', '北投區', '內湖區', '南港區', '文山區'];

function clean(value: string | undefined) {
  return (value ?? '').replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function parseCsv(input: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;
  for (let index = 0; index < input.length; index += 1) {
    const character = input[index];
    if (character === '"') {
      if (quoted && input[index + 1] === '"') { cell += '"'; index += 1; } else quoted = !quoted;
    } else if (character === ',' && !quoted) { row.push(clean(cell)); cell = ''; } else if ((character === '\n' || character === '\r') && !quoted) {
      if (character === '\r' && input[index + 1] === '\n') index += 1;
      row.push(clean(cell));
      if (row.some(Boolean)) rows.push(row);
      row = []; cell = '';
    } else cell += character;
  }
  row.push(clean(cell));
  if (row.some(Boolean)) rows.push(row);
  return rows;
}

function districtFromAddress(address: string) {
  return DISTRICTS.find((district) => address.includes(district)) ?? '';
}

function yearOf(value: string) {
  const match = value.match(/(\d{2,4})/);
  if (!match) return '';
  const year = Number(match[1]);
  return String(year < 1911 ? year + 1911 : year);
}

function dateKey(value: string) {
  const year = yearOf(value);
  const parts = value.match(/\d+/g) ?? [];
  return `${year}${String(Number(parts[1] ?? 0)).padStart(2, '0')}${String(Number(parts[2] ?? 0)).padStart(2, '0')}`;
}

function parseRecords(csv: string): GasWaterHeaterInstallerRecord[] {
  const rows = parseCsv(csv);
  return rows.slice(1).map((row, index) => {
    // The current official file lists the responsible person before the phone despite the displayed header order.
    const [installerName, address, responsiblePerson, phone, technicianName, technicianCertificateNumber, certificateEffectiveDate, employmentDate, latestTrainingDate] = row;
    const certificate = clean(technicianCertificateNumber);
    const installer = clean(installerName);
    const technician = clean(technicianName);
    return {
      id: certificate || `${installer}-${technician}-${index + 1}`,
      installerName: installer,
      address: clean(address),
      districtName: districtFromAddress(clean(address)),
      phone: clean(phone),
      responsiblePerson: clean(responsiblePerson),
      technicianName: technician,
      technicianCertificateNumber: certificate,
      certificateEffectiveDate: clean(certificateEffectiveDate),
      employmentDate: clean(employmentDate),
      latestTrainingDate: clean(latestTrainingDate),
      googleMapsQuery: clean(address),
    };
  }).filter((record) => record.installerName || record.technicianName);
}

function BarChart({ title, data }: { title: string; data: Array<{ label: string; value: number }> }) {
  const maximum = Math.max(1, ...data.map((item) => item.value));
  return <section className="chart"><h3>{title}</h3><div className="bars">{data.map((item) => <div className="bar-row wide-label" key={item.label}><span>{item.label}</span><div><i style={{ width: `${Math.max(2, item.value / maximum * 100)}%` }} /></div><b>{item.value}</b></div>)}</div></section>;
}

function Display({ value }: { value: string }) { return <>{value || MISSING}</>; }

function CopyButton({ value, label }: { value: string; label: string }) {
  if (!value) return null;
  return <button type="button" className="copy-button" onClick={() => navigator.clipboard?.writeText(value)}>{label}</button>;
}

export default function ApprovedGasWaterHeaterInstallersModule({ language }: { language: 'zh' | 'en' }) {
  const zh = language === 'zh';
  const [records, setRecords] = useState<GasWaterHeaterInstallerRecord[]>([]);
  const [loadError, setLoadError] = useState(false);
  const [view, setView] = useState<'overview' | 'districts' | 'installers' | 'technicians' | 'training' | 'notes'>('overview');
  const [search, setSearch] = useState(''); const [district, setDistrict] = useState(''); const [installer, setInstaller] = useState(''); const [phone, setPhone] = useState(''); const [training, setTraining] = useState(''); const [certificateYear, setCertificateYear] = useState(''); const [trainingYear, setTrainingYear] = useState(''); const [sort, setSort] = useState('installer'); const [page, setPage] = useState(1);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/approved-gas-water-heater-installers/records.csv`)
      .then((response) => { if (!response.ok) throw new Error(String(response.status)); return response.text(); })
      .then((csv) => setRecords(parseRecords(csv))).catch(() => setLoadError(true));
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return records.filter((record) => (!query || [record.installerName, record.responsiblePerson, record.technicianName, record.technicianCertificateNumber, record.districtName, record.address, record.phone].join(' ').toLocaleLowerCase().includes(query))
      && (!district || record.districtName === district) && (!installer || record.installerName === installer)
      && (!phone || (phone === 'yes' ? Boolean(record.phone) : !record.phone)) && (!training || (training === 'yes' ? Boolean(record.latestTrainingDate) : !record.latestTrainingDate))
      && (!certificateYear || yearOf(record.certificateEffectiveDate) === certificateYear) && (!trainingYear || yearOf(record.latestTrainingDate) === trainingYear));
  }, [records, search, district, installer, phone, training, certificateYear, trainingYear]);
  const districtCounts = useMemo(() => DISTRICTS.map((label) => ({ label, value: filtered.filter((record) => record.districtName === label).length })).filter((item) => item.value), [filtered]);
  const installerRows = useMemo(() => Object.values(filtered.reduce<Record<string, { installerName: string; districtName: string; address: string; phone: string; responsiblePerson: string; technicianCount: number }>>((groups, record) => {
    const key = `${record.installerName}|${record.address}`;
    groups[key] ??= { installerName: record.installerName, districtName: record.districtName, address: record.address, phone: record.phone, responsiblePerson: record.responsiblePerson, technicianCount: 0 };
    groups[key].technicianCount += 1; return groups;
  }, {})), [filtered]);
  const summary = useMemo(() => ({
    businesses: new Set(filtered.map((record) => record.installerName).filter(Boolean)).size,
    technicians: filtered.length,
    uniqueTechnicians: new Set(filtered.map((record) => record.technicianName).filter(Boolean)).size,
    districts: new Set(filtered.map((record) => record.districtName).filter(Boolean)).size,
    phones: filtered.filter((record) => record.phone).length,
    training: filtered.filter((record) => record.latestTrainingDate).length,
    latestTrainingDate: [...filtered].filter((record) => record.latestTrainingDate).sort((a, b) => dateKey(b.latestTrainingDate).localeCompare(dateKey(a.latestTrainingDate)))[0]?.latestTrainingDate ?? '',
  }), [filtered]);
  const certificateYears = useMemo(() => [...new Set(records.map((record) => yearOf(record.certificateEffectiveDate)).filter(Boolean))].sort().reverse(), [records]);
  const trainingYears = useMemo(() => [...new Set(records.map((record) => yearOf(record.latestTrainingDate)).filter(Boolean))].sort().reverse(), [records]);
  const sortedTechnicians = useMemo(() => [...filtered].sort((a, b) => sort === 'training' ? dateKey(b.latestTrainingDate).localeCompare(dateKey(a.latestTrainingDate)) : sort === 'certificate' ? a.technicianCertificateNumber.localeCompare(b.technicianCertificateNumber) : a.installerName.localeCompare(b.installerName, 'zh-Hant')), [filtered, sort]);
  const currentRows = view === 'installers' ? installerRows : sortedTechnicians;
  const pageSize = 25; const pages = Math.max(1, Math.ceil(currentRows.length / pageSize)); const pagedRows: any[] = currentRows.slice((Math.min(page, pages) - 1) * pageSize, Math.min(page, pages) * pageSize);
  const reset = (action: () => void) => { action(); setPage(1); };
  const downloadCsv = () => {
    const headers = ['Installer business', 'District', 'Address', 'Phone', 'Responsible person', 'Technician', 'Certificate number', 'Certificate effective date', 'Employment date', 'Latest training date'];
    const escape = (value: string) => `"${value.replaceAll('"', '""')}"`;
    const csv = [headers, ...filtered.map((r) => [r.installerName, r.districtName, r.address, r.phone, r.responsiblePerson, r.technicianName, r.technicianCertificateNumber, r.certificateEffectiveDate, r.employmentDate, r.latestTrainingDate])].map((row) => row.map(escape).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8' })); const link = document.createElement('a'); link.href = url; link.download = 'approved-gas-water-heater-installers-filtered.csv'; link.click(); URL.revokeObjectURL(url);
  };
  const filterLabel = (label: string, control: ReactNode) => <label>{label}{control}</label>;
  const mapLink = (address: string) => address ? <a target="_blank" rel="noreferrer" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}>{zh ? '地圖查詢' : 'Map lookup'}</a> : MISSING;

  if (loadError) return <section className="workspace"><div className="notice">{zh ? '無法載入本機資料檔。' : 'The local data file could not be loaded.'}</div></section>;
  return <section className="workspace"><div className="section-heading"><p>HOME SAFETY / PUBLIC DIRECTORY</p><h2>{zh ? '核准燃氣熱水器承裝業及技術士' : 'Approved Gas Water Heater Installers and Technicians'}</h2><span>{zh ? '臺北市政府消防局公開名冊；僅供資料查詢，地址以外部地圖搜尋開啟。' : 'Taipei City Fire Department public directory; address lookup opens an external map search.'}</span></div>
    <div className="subtabs">{([['overview', zh ? '總覽' : 'Overview'], ['districts', zh ? '行政區分布' : 'District Distribution'], ['installers', zh ? '承裝業名冊' : 'Installer Directory'], ['technicians', zh ? '技術士名冊' : 'Technician Directory'], ['training', zh ? '受訓資訊' : 'Training Information'], ['notes', zh ? '資料說明' : 'Data Notes']] as const).map(([id, label]) => <button key={id} className={view === id ? 'active' : ''} onClick={() => { setView(id); setPage(1); }}>{label}</button>)}</div>
    <aside className="filters"><label className="search"><input value={search} onChange={(event) => reset(() => setSearch(event.target.value))} placeholder={zh ? '搜尋承裝業、負責人、技術士、證號、行政區、地址或電話' : 'Search business, responsible person, technician, certificate, district, address, or phone'} /></label><div className="filter-grid">
      {filterLabel(zh ? '行政區' : 'District', <select value={district} onChange={(event) => reset(() => setDistrict(event.target.value))}><option value="">{zh ? '全部' : 'All'}</option>{DISTRICTS.filter((value) => records.some((record) => record.districtName === value)).map((value) => <option key={value}>{value}</option>)}</select>)}
      {filterLabel(zh ? '承裝業' : 'Installer business', <select value={installer} onChange={(event) => reset(() => setInstaller(event.target.value))}><option value="">{zh ? '全部' : 'All'}</option>{[...new Set(records.map((record) => record.installerName).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'zh-Hant')).map((value) => <option key={value}>{value}</option>)}</select>)}
      {filterLabel(zh ? '有電話' : 'Has phone', <select value={phone} onChange={(event) => reset(() => setPhone(event.target.value))}><option value="">{zh ? '全部' : 'All'}</option><option value="yes">{zh ? '有' : 'Yes'}</option><option value="no">{zh ? '無' : 'No'}</option></select>)}
      {filterLabel(zh ? '有受訓日期' : 'Has training date', <select value={training} onChange={(event) => reset(() => setTraining(event.target.value))}><option value="">{zh ? '全部' : 'All'}</option><option value="yes">{zh ? '有' : 'Yes'}</option><option value="no">{zh ? '無' : 'No'}</option></select>)}
      {filterLabel(zh ? '證書生效年' : 'Certificate effective year', <select value={certificateYear} onChange={(event) => reset(() => setCertificateYear(event.target.value))}><option value="">{zh ? '全部' : 'All'}</option>{certificateYears.map((value) => <option key={value}>{value}</option>)}</select>)}
      {filterLabel(zh ? '最近受訓年' : 'Latest training year', <select value={trainingYear} onChange={(event) => reset(() => setTrainingYear(event.target.value))}><option value="">{zh ? '全部' : 'All'}</option>{trainingYears.map((value) => <option key={value}>{value}</option>)}</select>)}
    </div></aside>
    {view === 'overview' && <><div className="notice subtle">{zh ? '本資料為臺北市政府消防局核准燃氣熱水器承裝業及其技術士名冊。證書、任職與受訓資料皆為來源紀錄，不代表目前執業、任職、證書持續有效、服務品質、安裝安全、價格或官方推薦；安排安裝或維修前，請向業者及臺北市政府消防局確認。' : 'This dataset is a public directory of gas water-heater installation businesses and technicians approved by the Taipei City Fire Department. Certificate, employment, and training details are source records and do not confirm current practice, current employment, continuing certificate validity, service quality, installation safety, prices, or official recommendation. Verify current qualifications and services with the business and Taipei City Fire Department before arranging installation or repair.'}</div><div className="summary-grid">{[[zh ? '承裝業數' : 'Installer businesses', summary.businesses], [zh ? '技術士紀錄' : 'Technician records', summary.technicians], [zh ? '不重複技術士' : 'Unique technicians', summary.uniqueTechnicians], [zh ? '涵蓋行政區' : 'Districts covered', summary.districts], [zh ? '有電話紀錄' : 'Records with phone', summary.phones], [zh ? '有受訓日期' : 'Records with training dates', summary.training], [zh ? '最近列示受訓日期' : 'Latest listed training date', summary.latestTrainingDate || MISSING]].map(([label, value]) => <article key={String(label)}><span>{label}</span><strong>{value}</strong></article>)}</div><BarChart title={zh ? '各行政區技術士紀錄' : 'Technician records by district'} data={districtCounts} /></>}
    {view === 'districts' && <><BarChart title={zh ? '各行政區承裝業數' : 'Installer businesses by district'} data={DISTRICTS.map((label) => ({ label, value: new Set(filtered.filter((record) => record.districtName === label).map((record) => record.installerName)).size })).filter((item) => item.value)} /><BarChart title={zh ? '各行政區技術士數' : 'Technicians by district'} data={districtCounts} /><BarChart title={zh ? '各承裝業技術士數' : 'Technicians per installer'} data={installerRows.sort((a, b) => b.technicianCount - a.technicianCount).slice(0, 20).map((row) => ({ label: row.installerName, value: row.technicianCount }))} /></>}
    {view === 'training' && <><BarChart title={zh ? '最近受訓年份分布' : 'Latest training year distribution'} data={trainingYears.map((label) => ({ label, value: filtered.filter((record) => yearOf(record.latestTrainingDate) === label).length })).filter((item) => item.value)} /><BarChart title={zh ? '有無受訓日期紀錄' : 'Records with and without training-date information'} data={[{ label: zh ? '有' : 'With', value: summary.training }, { label: zh ? '無' : 'Without', value: summary.technicians - summary.training }]} /></>}
    {(view === 'installers' || view === 'technicians') && <><div className="section-heading inline"><p>{zh ? '篩選後紀錄' : 'Filtered records'}</p><strong>{currentRows.length}</strong><button type="button" onClick={downloadCsv}>{zh ? '下載篩選 CSV' : 'Download filtered CSV'}</button>{view === 'technicians' && <select aria-label={zh ? '排序' : 'Sort'} value={sort} onChange={(event) => { setSort(event.target.value); setPage(1); }}><option value="installer">{zh ? '依承裝業排序' : 'Sort by installer'}</option><option value="certificate">{zh ? '依證號排序' : 'Sort by certificate'}</option><option value="training">{zh ? '依最近受訓日期排序' : 'Sort by latest training'}</option></select>}</div><div className="comparison-scroll procurement-table"><table><thead><tr>{(view === 'installers' ? (zh ? ['承裝業', '行政區', '地址', '電話', '負責人', '技術士數', '地圖查詢'] : ['Installer business', 'District', 'Address', 'Phone', 'Responsible person', 'Technician count', 'Map lookup']) : (zh ? ['技術士', '證號', '承裝業', '證書生效日期', '任職日期', '最近一次受訓日期'] : ['Technician', 'Certificate number', 'Installer business', 'Certificate effective date', 'Employment date', 'Latest training date'])).map((label) => <th key={label}>{label}</th>)}</tr></thead><tbody>{pagedRows.map((row) => view === 'installers' ? <tr key={`${row.installerName}-${row.address}`}><th>{row.installerName}</th><td><Display value={row.districtName} /></td><td><Display value={row.address} /> <CopyButton value={row.address} label={zh ? '複製' : 'Copy'} /></td><td>{row.phone ? <><a href={`tel:${row.phone.replace(/[^\d+]/g, '')}`}>{row.phone}</a> <CopyButton value={row.phone} label={zh ? '複製' : 'Copy'} /></> : MISSING}</td><td><Display value={row.responsiblePerson} /></td><td>{row.technicianCount}</td><td>{mapLink(row.address)}</td></tr> : <tr key={row.id}><th><Display value={row.technicianName} /></th><td><Display value={row.technicianCertificateNumber} /></td><td><Display value={row.installerName} /></td><td><Display value={row.certificateEffectiveDate} /></td><td><Display value={row.employmentDate} /></td><td><Display value={row.latestTrainingDate} /></td></tr>)}</tbody></table></div><div className="pagination"><button type="button" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>{zh ? '上一頁' : 'Previous'}</button><span>{page} / {pages}</span><button type="button" disabled={page >= pages} onClick={() => setPage((value) => value + 1)}>{zh ? '下一頁' : 'Next'}</button></div></>}
    {view === 'notes' && <div className="notes-grid"><article><h3>{zh ? '資料來源與欄位' : 'Source and fields'}</h3><p>{zh ? '本機靜態 CSV 來自臺北市政府消防局公開資料。來源檔目前的列值將負責人姓名置於電話之前；本頁依實際列值顯示，所有日期均保留原始文字。' : 'The local static CSV is from Taipei City Fire Department public data. The current source rows place the responsible person before the phone, so this page follows the actual row order and preserves all original date text.'}</p></article><article><h3>{zh ? '位置與使用限制' : 'Location and use limits'}</h3><p>{zh ? '資料未提供確認的官方座標，因此不建立精確地圖標記或自動地理編碼；地址僅提供外部地圖搜尋連結。' : 'The dataset has no confirmed official coordinates, so it creates no exact map markers or automatic geocoding; addresses only provide external map-search links.'}</p></article></div>}
  </section>;
}
