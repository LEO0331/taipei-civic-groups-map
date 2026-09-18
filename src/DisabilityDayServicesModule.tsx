import { useEffect, useState } from 'react';
import { DatasetFamilyFrame, DatasetFamilyHeading } from './DatasetFamilyFrame';
import { UI_FAMILIES } from './lib/uiFamilies';

export default function DisabilityDayServicesModule({ language }: { language: 'zh' | 'en' }) {
  const [records, setRecords] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/disability-day-services/records.json`).then((response) => response.json()).then(setRecords);
  }, []);

  return <DatasetFamilyFrame family={UI_FAMILIES.registryDirectory}>
    <DatasetFamilyHeading
      eyebrow="DISABILITY SERVICES / DAY SERVICES"
      title={language === 'zh' ? '身心障礙日間服務機構' : 'Disability Day Service Institutions'}
    />
    <p className="notice subtle">{language === 'zh' ? '本目錄僅呈現來源機構聯絡資料；請直接向機構確認實際服務與安排。' : 'This directory presents source institution contacts only; confirm actual services and arrangements with the institution.'}</p>
    <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={language === 'zh' ? '搜尋機構、行政區或地址' : 'Search institution, district, or address'} />
    <div className="notes-grid">{records.filter((record) => !query || [record.name, record.district, record.address].join(' ').includes(query)).map((record) => <article key={record.id}><h2>{record.name}</h2><p>{record.district || '—'} · {record.address || '—'}</p><p>{record.phone && <a href={`tel:${record.phone.replace(/[^+\d]/g, '')}`}>{record.phone}</a>}</p>{record.fax && <p>Fax: {record.fax}</p>}{record.address && <a target="_blank" rel="noreferrer" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(record.externalMapQuery)}`}>{language === 'zh' ? '外部地圖查詢' : 'Directions'}</a>}</article>)}</div>
  </DatasetFamilyFrame>;
}
