import { useEffect, useMemo, useState } from 'react';
import { DatasetFamilyFrame, DatasetFamilyHeading } from './DatasetFamilyFrame';
import { UI_FAMILIES } from './lib/uiFamilies';

export default function HomeDisabledFamilyPhysicianCareProvidersModule({ language }: { language: 'zh' | 'en' }) {
  const [records, setRecords] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/home-disabled-family-physician-care-providers/records.json`).then((response) => response.json()).then(setRecords);
  }, []);
  const filtered = useMemo(() => records.filter((record) => !query || [record.institutionName, record.serviceAreaRaw, record.districtName, record.institutionAddress, record.phoneRaw, record.mobileRaw].join(' ').includes(query)), [records, query]);

  return <DatasetFamilyFrame family={UI_FAMILIES.registryDirectory}>
    <DatasetFamilyHeading
      eyebrow="HOME-BASED CARE / FAMILY PHYSICIAN PROVIDERS"
      title={language === 'zh' ? '居家失能個案家庭醫師照護服務特約單位' : 'Home-Based Family Physician Care Providers'}
    />
    <p className="notice subtle">{language === 'zh' ? '本名冊不表示目前特約、收案、到府、醫師指派、資格或預約可用性。' : 'This directory does not establish current contracting, case acceptance, home visits, physician assignment, eligibility, or appointments.'}</p>
    <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={language === 'zh' ? '搜尋機構、服務區域、地址或電話' : 'Search provider, service area, address, or phone'} />
    <div className="summary-grid"><article><span>{language === 'zh' ? '來源記錄' : 'Source records'}</span><strong>{filtered.length}</strong></article></div>
    <div className="notes-grid">{filtered.map((record) => <article key={record.id}><h2>{record.institutionName}</h2><p>{language === 'zh' ? '服務區域' : 'Service area'}: {record.serviceAreaRaw || '—'}</p><p>{record.institutionAddress || '—'}</p><p>{record.phoneRaw || record.mobileRaw || '—'}</p>{record.institutionAddress && <a target="_blank" rel="noreferrer" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(record.externalMapQuery)}`}>{language === 'zh' ? '外部地圖查詢' : 'Map lookup'}</a>}</article>)}</div>
  </DatasetFamilyFrame>;
}
