import { useEffect, useState } from 'react';
import { DatasetFamilyFrame, DatasetFamilyHeading } from './DatasetFamilyFrame';
import { UI_FAMILIES } from './lib/uiFamilies';

export default function ChildYouthWelfareInstitutionsModule({ language }: { language: 'zh' | 'en' }) {
  const [records, setRecords] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/child-youth-welfare-institutions/records.json`).then((response) => response.json()).then(setRecords);
  }, []);

  return <DatasetFamilyFrame family={UI_FAMILIES.registryDirectory}>
    <DatasetFamilyHeading
      eyebrow="CHILD & YOUTH WELFARE / PUBLIC DIRECTORY"
      title={language === 'zh' ? '兒少福利機構' : 'Child & Youth Welfare Services'}
    />
    <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={language === 'zh' ? '搜尋機構、類型或地址' : 'Search institution, type, or address'} />
    <div className="notes-grid">{records.filter((record) => !query || [record.name, record.institutionType, record.address].join(' ').includes(query)).map((record) => <article key={record.id}><h2>{record.name}</h2><p>{record.institutionType}</p><p>{record.address}</p><p>{record.phone && <a href={`tel:${record.phone.replace(/[^+\d]/g, '')}`}>{record.phone}</a>}{record.email && <> · <a href={`mailto:${record.email}`}>{language === 'zh' ? '寄送 Email' : 'Email'}</a></>}</p></article>)}</div>
  </DatasetFamilyFrame>;
}
