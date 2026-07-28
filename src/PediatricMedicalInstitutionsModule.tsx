import { useEffect, useMemo, useState } from 'react';

type Institution = {
  id: string;
  sourceSequenceNumber: string;
  institutionName: string;
  postalCode: string;
  districtName: string;
  address: string;
  phoneRaw: string;
  phoneNumbers: string[];
  hasAddress: boolean;
  hasPhone: boolean;
  hasResolvedDistrict: boolean;
  externalMapQuery: string;
  sourceValues: Record<string, string>;
};

type Summary = {
  totalRecords?: number;
  uniqueInstitutionNames?: number;
  districtsCovered?: number;
  postalCodesRepresented?: number;
  recordsWithCompleteAddresses?: number;
  recordsWithPhones?: number;
  recordsWithResolvedDistricts?: number;
  suspectedDuplicateRecords?: number;
  sourceFileUpdatedAt?: string;
  metadataUpdatedAt?: string;
  ingestedAt?: string;
  sourceUrl?: string;
};

type QualityReport = Record<string, unknown>;
type Language = 'zh' | 'en';

const empty = '—';
const pageSize = 25;
const copy = {
  zh: {
    category: '醫療院所 / 兒科與兒童健康',
    title: '臺北市兒科醫療機構',
    subtitle: '依公開來源名錄查找兒科醫療機構；地址僅供外部地圖查詢，不建立精確地圖標記。',
    notice: '本名錄僅整理來源所載的機構名稱、地址與聯絡資訊，不代表目前可掛號、兒科醫師出診或特定兒科服務可用。前往前請直接向機構確認。',
    search: '搜尋機構名稱、行政區、郵遞區號、地址或電話',
    name: '機構名稱', district: '行政區', postal: '郵遞區號', phone: '電話', address: '地址',
    all: '全部', hasPhone: '有電話', completeAddress: '完整地址',
    yes: '是', no: '否', find: '查找兒科醫療機構', directory: '機構名錄', distribution: '行政區分布', contact: '聯絡資訊', coverage: '地址涵蓋', quality: '資料品質', notes: '資料說明',
    results: '筆符合紀錄', sourceContact: '來源聯絡資訊', map: '地圖查詢', copy: '複製', copied: '已複製',
    sourceUpdate: '來源檔更新日期', metadataUpdate: '資料集更新日期', ingestedAt: '匯入日期',
    total: '來源紀錄', unique: '不重複機構名稱', districts: '涵蓋行政區', postals: '郵遞區號數',
    fullAddresses: '完整地址紀錄', phones: '有電話紀錄', resolved: '已解析行政區', duplicates: '疑似重複紀錄',
    recordsByDistrict: '各行政區來源紀錄數', recordsByPostal: '各郵遞區號來源紀錄數',
    phoneStatus: '電話資訊狀態', addressStatus: '地址資訊狀態', districtStatus: '行政區解析狀態',
    withPhone: '有電話', withoutPhone: '無電話', withAddress: '有完整地址', withoutAddress: '地址不完整', withDistrict: '已解析行政區', withoutDistrict: '未解析行政區',
    directoryInsights: '名錄觀察',
    coverageInsight: '此處顯示公開來源紀錄在行政區的分布，不代表兒科服務可近性、容量或品質。',
    noResults: '沒有符合條件的紀錄。可調整搜尋字詞或篩選條件。',
    sorting: '排序', sortName: '機構名稱', sortDistrict: '行政區', sortPostal: '郵遞區號', sortId: '序號',
    fields: '欄位顯示', export: '下載篩選結果 CSV', previous: '上一頁', next: '下一頁',
    sourceDetails: '原始來源欄位', dataStatus: '資料狀態',
    dataQuality: '資料品質檢查',
    qualityText: '轉換報告會列出缺少名稱、地址或電話、郵遞區號或電話格式、未解析行政區、重複來源列，以及名稱、地址或電話的衝突。這些檢查不判定服務資格、品質或目前狀態。',
    dataNotes: '資料範圍與使用限制',
    notesText: '本資料為臺北市兒科醫療機構公開名錄。名稱、郵遞區號、地址和電話均為來源更新時的行政紀錄，並非即時門診、預約、兒科醫師出診、服務或急診資訊。網站不提供診斷、治療、用藥或醫療建議，也不建立排名或推薦。',
    loadError: '無法載入本機資料檔。',
  },
  en: {
    category: 'HEALTHCARE PROVIDERS / PEDIATRICS & CHILD HEALTH',
    title: 'Taipei Pediatric Medical Institutions',
    subtitle: 'Find source-recorded pediatric medical institutions. Addresses are for external map lookup only; no exact map markers are shown.',
    notice: 'This listing does not establish current appointment availability, pediatrician attendance, or availability of a particular pediatric service. Confirm directly with the institution before visiting.',
    search: 'Search institution, district, postal code, address, or phone',
    name: 'Institution name', district: 'District', postal: 'Postal code', phone: 'Telephone', address: 'Address',
    all: 'All', hasPhone: 'Has telephone', completeAddress: 'Complete address',
    yes: 'Yes', no: 'No', find: 'Find a Pediatric Institution', directory: 'Institution Directory', distribution: 'District Distribution', contact: 'Contact Information', coverage: 'Address Coverage', quality: 'Data Quality', notes: 'Data Notes',
    results: 'matching records', sourceContact: 'Source-recorded contact information', map: 'Map lookup', copy: 'Copy', copied: 'Copied',
    sourceUpdate: 'Dataset file update', metadataUpdate: 'Metadata update', ingestedAt: 'Ingestion date',
    total: 'Source records', unique: 'Unique institution names', districts: 'Districts covered', postals: 'Postal codes represented',
    fullAddresses: 'Records with complete addresses', phones: 'Records with telephone numbers', resolved: 'Records with resolved districts', duplicates: 'Suspected duplicate records',
    recordsByDistrict: 'Source records by district', recordsByPostal: 'Source records by postal code',
    phoneStatus: 'Records with and without telephone numbers', addressStatus: 'Records with and without complete addresses', districtStatus: 'Records with and without resolved districts',
    withPhone: 'With telephone', withoutPhone: 'Without telephone', withAddress: 'With complete address', withoutAddress: 'Without complete address', withDistrict: 'With resolved district', withoutDistrict: 'Without resolved district',
    directoryInsights: 'Directory Insights',
    coverageInsight: 'This shows the distribution of public source records by district. It does not measure pediatric access, capacity, or service quality.',
    noResults: 'No records match these filters. Try adjusting the search or filters.',
    sorting: 'Sort', sortName: 'Institution name', sortDistrict: 'District', sortPostal: 'Postal code', sortId: 'ID',
    fields: 'Column visibility', export: 'Download filtered CSV', previous: 'Previous', next: 'Next',
    sourceDetails: 'Original source fields', dataStatus: 'Data status',
    dataQuality: 'Data-quality checks',
    qualityText: 'The conversion report identifies missing names, addresses or phones, postal-code or telephone formats, unresolved districts, duplicate source rows, and name, address, or telephone conflicts. These checks do not determine service eligibility, quality, or current status.',
    dataNotes: 'Scope and interpretation limits',
    notesText: 'This dataset is a public directory of pediatric medical institutions in Taipei. Institution names, postal codes, addresses, and telephone numbers reflect source records at the update time and are not real-time clinic, appointment, pediatrician-attendance, service, or emergency-care information. This dashboard provides no diagnosis, treatment, medication, or medical advice, ranking, or recommendation.',
    loadError: 'The local data file could not be loaded.',
  },
};

const countBy = (records: Institution[], key: 'districtName' | 'postalCode') => Object.entries(records.reduce<Record<string, number>>((result, record) => {
  const value = record[key]?.trim();
  if (value) result[value] = (result[value] ?? 0) + 1;
  return result;
}, {})).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value || a.label.localeCompare(b.label, 'zh-Hant'));

const displayDate = (value: string | undefined, language: Language) => value ? new Date(value).toLocaleDateString(language === 'zh' ? 'zh-TW' : 'en') : empty;

export default function PediatricMedicalInstitutionsModule({ language }: { language: Language }) {
  const t = copy[language];
  const [records, setRecords] = useState<Institution[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [report, setReport] = useState<QualityReport | null>(null);
  const [failed, setFailed] = useState(false);
  const [view, setView] = useState('find');
  const [keyword, setKeyword] = useState('');
  const [nameQuery, setNameQuery] = useState('');
  const [district, setDistrict] = useState('');
  const [postal, setPostal] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [sort, setSort] = useState('name');
  const [page, setPage] = useState(1);
  const [hidden, setHidden] = useState<string[]>([]);
  const [copied, setCopied] = useState('');

  useEffect(() => {
    const base = `${import.meta.env.BASE_URL}data/pediatric-medical-institutions/`;
    Promise.all([fetch(`${base}records.json`), fetch(`${base}summary.json`), fetch(`${import.meta.env.BASE_URL}data/conversion-report.json`)])
      .then(async ([recordResponse, summaryResponse, reportResponse]) => {
        if (!recordResponse.ok || !summaryResponse.ok) throw new Error('Local pediatric data missing');
        setRecords(await recordResponse.json());
        setSummary(await summaryResponse.json());
        const conversionReport = reportResponse.ok ? await reportResponse.json() : null;
        setReport(conversionReport?.pediatricMedicalInstitutions ?? null);
      })
      .catch(() => setFailed(true));
  }, []);

  const resetPage = (action: () => void) => { action(); setPage(1); };
  const districts = useMemo(() => [...new Set(records.map((record) => record.districtName).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'zh-Hant')), [records]);
  const postals = useMemo(() => [...new Set(records.map((record) => record.postalCode).filter(Boolean))].sort(), [records]);
  const filtered = useMemo(() => records.filter((record) => {
    const haystack = [record.institutionName, record.districtName, record.postalCode, record.address, record.phoneRaw, ...record.phoneNumbers].join(' ').toLocaleLowerCase();
    return (!keyword.trim() || haystack.includes(keyword.trim().toLocaleLowerCase()))
      && (!nameQuery.trim() || record.institutionName.toLocaleLowerCase().includes(nameQuery.trim().toLocaleLowerCase()))
      && (!district || record.districtName === district)
      && (!postal || record.postalCode === postal)
      && (!phone || (phone === 'yes' ? record.hasPhone : !record.hasPhone))
      && (!address || (address === 'yes' ? record.hasAddress : !record.hasAddress));
  }), [records, keyword, nameQuery, district, postal, phone, address]);
  const byDistrict = useMemo(() => countBy(filtered, 'districtName'), [filtered]);
  const byPostal = useMemo(() => countBy(filtered, 'postalCode'), [filtered]);
  const uniqueNames = useMemo(() => new Set(filtered.map((record) => record.institutionName.trim()).filter(Boolean)).size, [filtered]);
  const sorted = useMemo(() => [...filtered].sort((left, right) => {
    if (sort === 'district') return left.districtName.localeCompare(right.districtName, 'zh-Hant') || left.institutionName.localeCompare(right.institutionName, 'zh-Hant');
    if (sort === 'postal') return left.postalCode.localeCompare(right.postalCode) || left.institutionName.localeCompare(right.institutionName, 'zh-Hant');
    if (sort === 'id') return left.sourceSequenceNumber.localeCompare(right.sourceSequenceNumber, undefined, { numeric: true });
    return left.institutionName.localeCompare(right.institutionName, 'zh-Hant');
  }), [filtered, sort]);
  const pages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, pages);
  const rows = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const phoneStatus = [{ label: t.withPhone, value: filtered.filter((record) => record.hasPhone).length }, { label: t.withoutPhone, value: filtered.filter((record) => !record.hasPhone).length }];
  const addressStatus = [{ label: t.withAddress, value: filtered.filter((record) => record.hasAddress).length }, { label: t.withoutAddress, value: filtered.filter((record) => !record.hasAddress).length }];
  const districtStatus = [{ label: t.withDistrict, value: filtered.filter((record) => record.hasResolvedDistrict).length }, { label: t.withoutDistrict, value: filtered.filter((record) => !record.hasResolvedDistrict).length }];

  const chart = (title: string, data: Array<{ label: string; value: number }>) => {
    if (data.length < 2 || new Set(data.map((item) => item.value)).size < 2) return null;
    const max = Math.max(...data.map((item) => item.value), 1);
    return <section className="chart"><h3>{title}</h3><div className="bars">{data.map((item) => <div className="bar-row wide-label" key={item.label}><span>{item.label}</span><div><i style={{ width: `${Math.max(2, item.value / max * 100)}%` }} /></div><b>{item.value.toLocaleString()}</b></div>)}</div></section>;
  };

  const copyValue = async (value: string) => {
    if (!value) return;
    await navigator.clipboard?.writeText(value);
    setCopied(value);
    window.setTimeout(() => setCopied(''), 1500);
  };
  const copyButton = (value: string) => value ? <button type="button" className="copy-button" onClick={() => void copyValue(value)}>{copied === value ? t.copied : t.copy}</button> : null;
  const exportCsv = () => {
    const header = ['ID', 'Institution name', 'District', 'Postal code', 'Address', 'Telephone'];
    const quote = (value: string) => `"${value.replaceAll('"', '""')}"`;
    const csv = [header, ...sorted.map((record) => [record.sourceSequenceNumber, record.institutionName, record.districtName, record.postalCode, record.address, record.phoneRaw])]
      .map((line) => line.map((value) => quote(value ?? '')).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = 'pediatric-medical-institutions-filtered.csv'; link.click(); URL.revokeObjectURL(url);
  };
  const setHiddenColumn = (column: string) => setHidden((current) => current.includes(column) ? current.filter((item) => item !== column) : [...current, column]);
  const visible = (column: string) => !hidden.includes(column);
  const columns = [['id', 'ID'], ['name', t.name], ['district', t.district], ['postal', t.postal], ['address', t.address], ['phone', t.phone], ['map', t.map], ['status', t.dataStatus]];

  if (failed) return <section className="workspace"><div className="notice" role="alert">{t.loadError}</div></section>;
  const topDistrict = byDistrict[0]?.label ?? empty;

  return <section className="workspace">
    <div className="section-heading"><p>{t.category}</p><h2>{t.title}</h2><span>{t.subtitle}</span></div>
    <div className="notice subtle">{t.notice}</div>
    <div className="subtabs">{[['find', t.find], ['directory', t.directory], ['districts', t.distribution], ['contact', t.contact], ['coverage', t.coverage], ['quality', t.quality], ['notes', t.notes]].map(([id, label]) => <button type="button" key={id} className={view === id ? 'active' : ''} onClick={() => { setView(id); setPage(1); }}>{label}</button>)}</div>
    <aside className="filters" aria-label={t.find}>
      <label className="search"><input value={keyword} onChange={(event) => resetPage(() => setKeyword(event.target.value))} placeholder={t.search} aria-label={t.search} /></label>
      <div className="filter-grid">
        <label>{t.name}<input value={nameQuery} onChange={(event) => resetPage(() => setNameQuery(event.target.value))} /></label>
        <label>{t.district}<select value={district} onChange={(event) => resetPage(() => setDistrict(event.target.value))}><option value="">{t.all}</option>{districts.map((value) => <option value={value} key={value}>{value}</option>)}</select></label>
        <label>{t.postal}<select value={postal} onChange={(event) => resetPage(() => setPostal(event.target.value))}><option value="">{t.all}</option>{postals.map((value) => <option value={value} key={value}>{value}</option>)}</select></label>
        <label>{t.hasPhone}<select value={phone} onChange={(event) => resetPage(() => setPhone(event.target.value))}><option value="">{t.all}</option><option value="yes">{t.yes}</option><option value="no">{t.no}</option></select></label>
        <label>{t.completeAddress}<select value={address} onChange={(event) => resetPage(() => setAddress(event.target.value))}><option value="">{t.all}</option><option value="yes">{t.yes}</option><option value="no">{t.no}</option></select></label>
      </div>
    </aside>
    {view === 'find' && <><div className="summary-grid">{[[t.total, filtered.length], [t.unique, uniqueNames], [t.districts, byDistrict.length], [t.phones, phoneStatus[0].value], [t.fullAddresses, addressStatus[0].value], [t.resolved, districtStatus[0].value], [t.duplicates, summary?.suspectedDuplicateRecords ?? 0], [t.sourceUpdate, displayDate(summary?.sourceFileUpdatedAt, language)], [t.metadataUpdate, displayDate(summary?.metadataUpdatedAt, language)]].map(([label, value]) => <article key={String(label)}><span>{label}</span><strong>{value}</strong></article>)}</div><section className="notes-grid"><article><h3>{t.directoryInsights}</h3><p>{t.coverageInsight} {topDistrict === empty ? '' : `${t.district}: ${topDistrict}.`}</p></article></section><div className="directory-cards">{rows.slice(0, 12).map((record) => <article key={record.id}><h3>{record.institutionName || empty}</h3><p>{record.districtName || empty} · {record.postalCode || empty}</p><p>{record.address || empty} {copyButton(record.address)}</p><p>{t.sourceContact}: {record.phoneRaw ? <a href={`tel:${record.phoneRaw.replace(/[^+\d]/g, '')}`}>{record.phoneRaw}</a> : empty} {copyButton(record.phoneRaw)}</p><p>{t.sourceUpdate}: {displayDate(summary?.sourceFileUpdatedAt, language)}</p>{record.externalMapQuery && <a target="_blank" rel="noreferrer" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(record.externalMapQuery)}`}>{t.map}</a>}</article>)}</div>{!filtered.length && <p className="empty">{t.noResults}</p>}</>}
    {view === 'districts' && chart(t.recordsByDistrict, byDistrict)}
    {view === 'contact' && <>{chart(t.phoneStatus, phoneStatus)}<div className="summary-grid">{[[t.withPhone, phoneStatus[0].value], [t.withoutPhone, phoneStatus[1].value]].map(([label, value]) => <article key={String(label)}><span>{label}</span><strong>{value}</strong></article>)}</div></>}
    {view === 'coverage' && <>{chart(t.recordsByPostal, byPostal)}{chart(t.addressStatus, addressStatus)}{chart(t.districtStatus, districtStatus)}</>}
    {view === 'directory' && <><div className="section-heading inline"><strong>{sorted.length.toLocaleString()} {t.results}</strong><button type="button" onClick={exportCsv}>{t.export}</button><label>{t.sorting}<select value={sort} onChange={(event) => { setSort(event.target.value); setPage(1); }}><option value="name">{t.sortName}</option><option value="district">{t.sortDistrict}</option><option value="postal">{t.sortPostal}</option><option value="id">{t.sortId}</option></select></label><details><summary>{t.fields}</summary>{columns.map(([key, label]) => <label key={key}><input type="checkbox" checked={visible(key)} onChange={() => setHiddenColumn(key)} /> {label}</label>)}</details></div><div className="comparison-scroll procurement-table"><table><thead><tr>{visible('id') && <th>ID</th>}{visible('name') && <th>{t.name}</th>}{visible('district') && <th>{t.district}</th>}{visible('postal') && <th>{t.postal}</th>}{visible('address') && <th>{t.address}</th>}{visible('phone') && <th>{t.phone}</th>}{visible('map') && <th>{t.map}</th>}{visible('status') && <th>{t.dataStatus}</th>}</tr></thead><tbody>{rows.map((record) => <tr key={record.id}>{visible('id') && <td>{record.sourceSequenceNumber || empty}</td>}{visible('name') && <th>{record.institutionName || empty}</th>}{visible('district') && <td>{record.districtName || empty}</td>}{visible('postal') && <td>{record.postalCode || empty}</td>}{visible('address') && <td>{record.address || empty} {copyButton(record.address)}</td>}{visible('phone') && <td>{record.phoneRaw ? <><a href={`tel:${record.phoneRaw.replace(/[^+\d]/g, '')}`}>{record.phoneRaw}</a> {copyButton(record.phoneRaw)}</> : empty}</td>}{visible('map') && <td>{record.externalMapQuery ? <a target="_blank" rel="noreferrer" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(record.externalMapQuery)}`}>{t.map}</a> : empty}</td>}{visible('status') && <td>{record.hasAddress && record.hasPhone && record.hasResolvedDistrict ? t.yes : t.no}<details><summary>{t.sourceDetails}</summary><pre>{JSON.stringify(record.sourceValues, null, 2)}</pre></details></td>}</tr>)}</tbody></table></div>{!rows.length && <p className="empty">{t.noResults}</p>}<div className="pagination"><button type="button" disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)}>{t.previous}</button><span>{currentPage} / {pages}</span><button type="button" disabled={currentPage >= pages} onClick={() => setPage(currentPage + 1)}>{t.next}</button></div></>}
    {view === 'quality' && <div className="notes-grid"><article><h3>{t.dataQuality}</h3><p>{t.qualityText}</p><pre>{report ? JSON.stringify(report, null, 2) : empty}</pre></article></div>}
    {view === 'notes' && <div className="notes-grid"><article><h3>{t.dataNotes}</h3><p>{t.notesText}</p><p>{t.sourceUpdate}: {displayDate(summary?.sourceFileUpdatedAt, language)}<br />{t.metadataUpdate}: {displayDate(summary?.metadataUpdatedAt, language)}<br />{t.ingestedAt}: {displayDate(summary?.ingestedAt, language)}</p>{summary?.sourceUrl && <p><a href={summary.sourceUrl} target="_blank" rel="noreferrer">{summary.sourceUrl}</a></p>}</article></div>}
  </section>;
}
