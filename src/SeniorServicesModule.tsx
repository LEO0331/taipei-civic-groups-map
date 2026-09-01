import { useEffect, useMemo, useState } from 'react';

type SeniorService = { id: string; name?: string; categoryRaw?: string; locationCity?: string; district?: string; address?: string; phone?: string; establishedDate?: string; externalMapQuery?: string };

export default function SeniorServicesModule({ language }: { language: 'zh' | 'en' }) {
  const [records, setRecords] = useState<SeniorService[]>([]);
  const [query, setQuery] = useState('');
  const [loadError, setLoadError] = useState(false);
  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}data/senior-services/records.json`);
        if (!response.ok) throw new Error(`Request failed (${response.status})`);
        const data: unknown = await response.json();
        if (!Array.isArray(data)) throw new Error('Records data must be an array');
        if (active) setRecords(data as SeniorService[]);
      } catch {
        if (active) setLoadError(true);
      }
    })();
    return () => { active = false; };
  }, []);
  const filtered = useMemo(() => records.filter((record) => !query || [record.name, record.categoryRaw, record.district, record.address, record.phone].join(' ').includes(query)), [records, query]);
  return <section className="module-panel generated-module">
    <h1>{language === 'zh' ? '銀髮服務機構' : 'Senior Services'}</h1>
    <p className="notice subtle">{language === 'zh' ? '所在地與資料集收錄不等同服務範圍；請向機構確認實際服務與安排。' : 'Physical location and dataset membership do not establish service coverage; confirm actual services and arrangements with the institution.'}</p>
    {loadError ? <p className="notice error">{language === 'zh' ? '無法載入本機資料快照，請稍後再試或查閱原始資料來源。' : 'The local data snapshot could not be loaded. Please try again later or consult the source dataset.'}</p> : <>
      <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={language === 'zh' ? '搜尋機構、類型、行政區、地址或電話' : 'Search institution, type, district, address, or phone'} />
      <div className="notes-grid">{filtered.map((record) => <article key={record.id}><h2>{record.name}</h2><p>{record.categoryRaw} · {record.locationCity}</p><p>{record.district || '—'} · {record.address}</p><p>{record.phone && <a href={`tel:${record.phone.replace(/[^+\d]/g, '')}`}>{record.phone}</a>}</p><p>{record.establishedDate}</p>{record.address && <a target="_blank" rel="noreferrer" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(record.externalMapQuery ?? record.address)}`}>{language === 'zh' ? '外部地圖查詢' : 'Directions'}</a>}</article>)}</div>
    </>}
  </section>;
}
