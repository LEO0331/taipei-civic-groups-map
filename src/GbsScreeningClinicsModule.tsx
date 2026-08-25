import { useEffect, useMemo, useState } from 'react';

type Language = 'zh' | 'en';
type Clinic = { id: string; name: string; district: string; address: string; externalMapQuery: string };
const root = `${import.meta.env.BASE_URL}data/gbs-screening-clinics`;

export default function GbsScreeningClinicsModule({ language }: { language: Language }) {
  const [records, setRecords] = useState<Clinic[]>([]);
  const [query, setQuery] = useState('');
  const [loadError, setLoadError] = useState(false);
  const isChinese = language === 'zh';

  useEffect(() => {
    fetch(`${root}/records.json`).then((response) => response.ok ? response.json() : Promise.reject()).then(setRecords).catch(() => setLoadError(true));
  }, []);

  const filtered = useMemo(() => records.filter((record) => !query || [record.name, record.district, record.address].join(' ').includes(query)), [records, query]);
  if (loadError) return <section className="module-panel"><h1>{isChinese ? '孕婦 GBS 篩檢特約院所' : 'GBS Screening Clinics'}</h1><p>{isChinese ? '無法載入本機資料快照。' : 'The local data snapshot could not be loaded.'}</p></section>;

  return <section className="module-panel generated-module">
    <h1>{isChinese ? '孕婦 GBS 篩檢特約院所' : 'GBS Screening Clinics'}</h1>
    <p className="notice subtle">{isChinese ? '本資料為孕婦乙型鏈球菌篩檢補助特約院所名單；實際服務、資格與受理安排請直接向院所確認。' : 'This is a directory of contracted institutions for subsidized GBS screening for pregnant women. Confirm services, eligibility, and arrangements directly with the institution.'}</p>
    <label>{isChinese ? '搜尋院所、行政區或地址' : 'Search clinic, district, or address'}<input value={query} onChange={(event) => setQuery(event.target.value)} /></label>
    <div className="notes-grid">{filtered.map((record) => <article key={record.id}><h2>{record.name}</h2><p>{record.district || '—'} · {record.address}</p>{record.address && <a target="_blank" rel="noreferrer" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(record.externalMapQuery)}`}>{isChinese ? '外部地圖查詢' : 'Directions'}</a>}</article>)}</div>
  </section>;
}
