import { useEffect, useMemo, useState } from 'react';

type EntFacility = { id: string; name?: string; district?: string; address?: string; phone?: string; externalMapQuery?: string };

export default function EntFacilitiesModule({ language }: { language: 'zh' | 'en' }) {
  const [records, setRecords] = useState<EntFacility[]>([]);
  const [query, setQuery] = useState('');
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}data/ent-facilities/records.json`);
        if (!response.ok) throw new Error(`Request failed (${response.status})`);
        const data: unknown = await response.json();
        if (!Array.isArray(data)) throw new Error('Records data must be an array');
        if (active) setRecords(data as EntFacility[]);
      } catch {
        if (active) setLoadError(true);
      }
    };
    void load();
    return () => { active = false; };
  }, []);

  const filtered = useMemo(() => records.filter((record) => !query || [record.name, record.district, record.address, record.phone, '耳鼻喉科 ENT'].join(' ').includes(query)), [records, query]);

  return <section className="module-panel generated-module">
    <h1>{language === 'zh' ? '臺北市耳鼻喉科醫療機構' : 'ENT Medical Facilities'}</h1>
    <p className="notice subtle">{language === 'zh' ? '醫療機構資訊來自臺北市公開資料；請直接向院所確認目前門診時間與可提供服務。' : 'Medical facility information is based on Taipei City open data. Please confirm current clinic hours and available services directly with the institution.'}</p>
    {loadError ? <p className="notice error">{language === 'zh' ? '無法載入本機資料快照，請稍後再試或查閱原始資料來源。' : 'The local data snapshot could not be loaded. Please try again later or consult the source dataset.'}</p> : <>
      <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={language === 'zh' ? '搜尋機構、行政區、地址或電話' : 'Search facility, district, address, or phone'} />
      <div className="summary-grid"><article><span>{language === 'zh' ? '耳鼻喉科院所' : 'ENT facilities'}</span><strong>{filtered.length}</strong></article></div>
      <div className="notes-grid">{filtered.map((record) => <article key={record.id}><h2>{record.name}</h2><p>{record.district || '—'} · {record.address || '—'}</p><p>{record.phone ? <a href={`tel:${record.phone.replace(/[^+\d]/g, '')}`}>{record.phone}</a> : '—'}</p>{record.address && <a target="_blank" rel="noreferrer" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(record.externalMapQuery ?? record.address)}`}>{language === 'zh' ? '外部地圖查詢' : 'Map lookup'}</a>}</article>)}</div>
    </>}
  </section>;
}
