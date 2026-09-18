import { useEffect, useState } from 'react';
import { DatasetFamilyFrame, DatasetFamilyHeading } from './DatasetFamilyFrame';
import { UI_FAMILIES } from './lib/uiFamilies';

export default function EmergencyAssistanceProvidersModule({ language }: { language: 'zh' | 'en' }) {
  const [records, setRecords] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/emergency-assistance-providers/records.json`).then((response) => response.json()).then(setRecords);
  }, []);

  return <DatasetFamilyFrame family={UI_FAMILIES.registryDirectory}>
    <DatasetFamilyHeading
      eyebrow="EMERGENCY ASSISTANCE / SOCIAL SERVICES"
      title={language === 'zh' ? '急難救助提供單位' : 'Emergency Assistance Providers'}
    />
    <p className="notice subtle">{language === 'zh' ? '資料為臺北市政府公開之急難救助提供單位資訊。實際服務內容、申請資格與受理時間請直接洽詢各提供單位。' : 'This dataset lists emergency assistance providers published by Taipei City. Contact individual organizations to confirm eligibility, services, and operating hours.'}</p>
    <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={language === 'zh' ? '搜尋機構、類型或地址' : 'Search institution, type, or address'} />
    <div className="notes-grid">{records.filter((record) => !query || [record.name, record.institutionType, record.address].join(' ').includes(query)).map((record) => <article key={record.id}><h2>{record.name}</h2><p>{record.institutionType} · {record.district || '—'}</p><p>{record.address}</p><p>{record.phone && <a href={`tel:${record.phone.replace(/[^+\d]/g, '')}`}>{record.phone}</a>}</p><a target="_blank" rel="noreferrer" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(record.externalMapQuery)}`}>{language === 'zh' ? '外部地圖查詢' : 'Directions'}</a></article>)}</div>
  </DatasetFamilyFrame>;
}
