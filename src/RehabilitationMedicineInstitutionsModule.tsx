import { useEffect, useMemo, useState } from 'react';
import SourceFields from './SourceFields';
import { loadLocalJson } from './lib/loadLocalJson';
import { UI_FAMILIES } from './lib/uiFamilies';

type RecordItem = {
  id: string;
  sourceSequenceNumber: string;
  institutionName: string;
  cityCode: string;
  districtCode: string;
  districtName: string;
  address: string;
  hasAddress: boolean;
  externalMapQuery: string;
  sourceValues: Record<string, unknown>;
};

const PAGE_SIZE = 18;

export default function RehabilitationMedicineInstitutionsModule({ language }: { language: 'zh' | 'en' }) {
  const zh = language === 'zh';
  const text = (chinese: string, english: string) => zh ? chinese : english;
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [query, setQuery] = useState('');
  const [district, setDistrict] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let active = true;
    loadLocalJson<RecordItem[]>('data/rehabilitation-medicine-institutions/records.json')
      .then((data) => {
        if (!active) return;
        if (!Array.isArray(data)) throw new Error('Records payload must be an array.');
        setRecords(data);
      })
      .catch(() => { if (active) setLoadError(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const districts = useMemo(() => [...new Set(records.map((record) => record.districtName).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'zh-Hant')), [records]);
  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return records.filter((record) => (!normalizedQuery || [record.institutionName, record.districtName, record.districtCode, record.address].join(' ').toLocaleLowerCase().includes(normalizedQuery)) && (!district || record.districtName === district));
  }, [records, query, district]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visibleRecords = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const updateFilter = (action: () => void) => { action(); setPage(1); };

  return <section className="workspace rehab-directory" data-ui-family={UI_FAMILIES.healthcareStandard}>
    <header className="rehab-hero">
      <p className="eyebrow">{text('醫療資源名冊', 'HEALTHCARE RESOURCE DIRECTORY')}</p>
      <h1>{text('臺北市復健科醫療機構', 'Taipei Rehabilitation Medicine Institutions')}</h1>
      <p>{text('依官方行政區代碼與來源地址，快速查找復健科醫療機構。', 'Find rehabilitation medicine institutions using official district codes and source addresses.')}</p>
    </header>
    <div className="notice subtle">{text('本名冊反映來源更新時的公開紀錄，不表示目前門診、復健治療、醫師、設備、預約、費用或服務品質。到訪前請直接向機構或主管機關確認。', 'This directory reflects public records at the source update time. It does not establish current clinics, rehabilitation treatment, physicians, equipment, appointments, fees, or service quality. Confirm directly before visiting.')}</div>

    {loading && <p className="module-loading" role="status">{text('正在載入復健科醫療機構…', 'Loading rehabilitation medicine institutions…')}</p>}
    {loadError && <p className="notice error" role="alert">{text('無法載入本機資料快照。請稍後再試或查閱原始資料來源。', 'The local data snapshot could not be loaded. Please try again later or consult the source dataset.')}</p>}
    {!loading && !loadError && <>
      <aside className="rehab-filters" aria-label={text('篩選復健科醫療機構', 'Filter rehabilitation medicine institutions')}>
        <label><span>{text('關鍵字', 'Keyword')}</span><input value={query} onChange={(event) => updateFilter(() => setQuery(event.target.value))} placeholder={text('搜尋機構、行政區、代碼或地址', 'Search institution, district, code, or address')} /></label>
        <label><span>{text('行政區', 'District')}</span><select value={district} onChange={(event) => updateFilter(() => setDistrict(event.target.value))}><option value="">{text('全部行政區', 'All districts')}</option>{districts.map((value) => <option key={value}>{value}</option>)}</select></label>
        {(query || district) && <button type="button" onClick={() => { setQuery(''); setDistrict(''); setPage(1); }}>{text('清除篩選', 'Clear filters')}</button>}
      </aside>

      <div className="rehab-summary" aria-label={text('篩選結果摘要', 'Filtered result summary')}>
        {[[text('符合紀錄', 'Matching records'), filtered.length], [text('不重複機構', 'Unique institutions'), new Set(filtered.map((record) => record.institutionName).filter(Boolean)).size], [text('涵蓋行政區', 'Districts covered'), new Set(filtered.map((record) => record.districtName).filter(Boolean)).size], [text('有地址紀錄', 'Records with addresses'), filtered.filter((record) => record.hasAddress).length]].map(([label, value]) => <article key={String(label)}><span>{label}</span><strong>{Number(value).toLocaleString()}</strong></article>)}
      </div>

      <div className="rehab-directory-heading"><div><p className="eyebrow">{text('查詢結果', 'DIRECTORY RESULTS')}</p><h2>{text('復健科醫療機構名冊', 'Rehabilitation medicine directory')}</h2></div><span>{filtered.length.toLocaleString()} {text('筆', 'records')}</span></div>
      {visibleRecords.length ? <div className="rehab-card-grid">{visibleRecords.map((record) => <article className="rehab-card" key={record.id}>
        <div className="rehab-card-index"><span>{text('來源序號', 'Source ID')}</span><strong>{record.sourceSequenceNumber || '—'}</strong></div>
        <div className="rehab-card-body"><h3>{record.institutionName || '—'}</h3><p className="rehab-location"><span>{record.districtName || text('行政區未解析', 'District unresolved')}</span><code>{record.districtCode || '—'}</code></p><address>{record.address || '—'}</address><div className="rehab-actions">{record.hasAddress && <a target="_blank" rel="noopener noreferrer" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(record.externalMapQuery)}`}>{text('外部地圖查詢 ↗', 'Map lookup ↗')}</a>}<details><summary>{text('來源細節', 'Source details')}</summary><SourceFields fields={record.sourceValues} /></details></div></div>
      </article>)}</div> : <p className="empty">{text('沒有符合篩選條件的紀錄。', 'No records match these filters.')}</p>}

      {totalPages > 1 && <nav className="pagination" aria-label={text('名冊分頁', 'Directory pagination')}><button type="button" disabled={currentPage <= 1} onClick={() => setPage((value) => value - 1)}>{text('上一頁', 'Previous')}</button><span>{currentPage} / {totalPages}</span><button type="button" disabled={currentPage >= totalPages} onClick={() => setPage((value) => value + 1)}>{text('下一頁', 'Next')}</button></nav>}
    </>}
  </section>;
}
