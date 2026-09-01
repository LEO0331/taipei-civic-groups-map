import { useEffect, useMemo, useState } from 'react';

type HearingCenter = { id: string; name?: string; district?: string; address?: string; postalCode?: string; externalMapQuery?: string };

export default function HearingCentersModule({ language }: { language: 'zh' | 'en' }) {
  const [records, setRecords] = useState<HearingCenter[]>([]);
  const [query, setQuery] = useState('');
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}data/hearing-centers/records.json`);
        if (!response.ok) throw new Error(`Request failed (${response.status})`);
        const data: unknown = await response.json();
        if (!Array.isArray(data)) throw new Error('Records data must be an array');
        if (active) setRecords(data as HearingCenter[]);
      } catch {
        if (active) setLoadError(true);
      }
    })();
    return () => { active = false; };
  }, []);

  const filtered = useMemo(() => records.filter((record) => !query || [record.name, record.district, record.address, record.postalCode].join(' ').includes(query)), [records, query]);

  return <section className="module-panel generated-module">
    <h1>{language === 'zh' ? '臺北市聽力所' : 'Taipei Hearing Centers'}</h1>
    <p className="notice subtle">{language === 'zh' ? '來源未提供官方座標，僅提供外部地址查詢。' : 'The source has no official coordinates; external address lookup only.'}</p>
    {loadError ? <p className="notice error">{language === 'zh' ? '無法載入本機資料快照，請稍後再試或查閱原始資料來源。' : 'The local data snapshot could not be loaded. Please try again later or consult the source dataset.'}</p> : <>
      <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={language === 'zh' ? '搜尋名稱、行政區、郵遞區號或地址' : 'Search name, district, postal code, or address'} />
      <div className="notes-grid">{filtered.map((record) => <article key={record.id}><h2>{record.name}</h2><p>{record.district || '—'} · {record.postalCode || '—'}</p><p>{record.address || '—'}</p>{record.address && <a target="_blank" rel="noreferrer" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(record.externalMapQuery ?? record.address)}`}>{language === 'zh' ? '外部地圖查詢' : 'Directions'}</a>}</article>)}</div>
    </>}
  </section>;
}
