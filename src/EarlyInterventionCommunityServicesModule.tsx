import { useEffect, useState } from 'react';
import { DatasetFamilyFrame, DatasetFamilyHeading } from './DatasetFamilyFrame';
import { UI_FAMILIES } from './lib/uiFamilies';

export default function EarlyInterventionCommunityServicesModule({ language }: { language: 'zh' | 'en' }) {
  const [records, setRecords] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/early-intervention-community-services/records.json`).then((response) => response.json()).then(setRecords);
  }, []);
  const filtered = records.filter((record) => !query || [record.name, record.district, record.address, record.services].join(' ').includes(query));

  return <DatasetFamilyFrame family={UI_FAMILIES.registryDirectory}>
    <DatasetFamilyHeading
      eyebrow="EARLY INTERVENTION / COMMUNITY SERVICES"
      title={language === 'zh' ? '早療社區療育服務' : 'Early Intervention Services'}
    />
    <p className="notice subtle">{language === 'zh' ? '服務內容為來源記錄；請直接向單位確認實際服務、資格、時間與安排。' : 'Service descriptions are source records; confirm actual services, eligibility, hours, and arrangements with the organization.'}</p>
    <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={language === 'zh' ? '搜尋機構、行政區、地址或服務內容' : 'Search institution, district, address, or services'} />
    <div className="notes-grid">{filtered.map((record) => <article key={record.id}><h2>{record.name}</h2><p>{record.district || '—'} · {record.address || '—'}</p><p>{record.phone && <a href={`tel:${record.phone.replace(/[^+\d]/g, '')}`}>{record.phone}</a>}</p><details><summary>{language === 'zh' ? '服務內容' : 'Services'}</summary><p>{record.services || '—'}</p></details>{record.address && <a target="_blank" rel="noreferrer" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(record.externalMapQuery)}`}>{language === 'zh' ? '外部地圖查詢' : 'Directions'}</a>}</article>)}</div>
  </DatasetFamilyFrame>;
}
