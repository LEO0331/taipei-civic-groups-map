import { useEffect, useMemo, useState } from 'react';

type ProviderRecord = {
  id: string;
  sourceSequenceNumber: string;
  cityName: string;
  institutionName: string;
  physicianName: string;
  specialtyRaw: string;
  clinicHoursRaw: string;
  hasClinicHours: boolean;
};

const fallback = '—';

export default function TbContactScreeningPartnerProvidersModule({ language }: { language: 'zh' | 'en' }) {
  const zh = language === 'zh';
  const text = (chinese: string, english: string) => (zh ? chinese : english);
  const [records, setRecords] = useState<ProviderRecord[]>([]);
  const [query, setQuery] = useState('');
  const [city, setCity] = useState('');
  const [institution, setInstitution] = useState('');
  const [physician, setPhysician] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [hours, setHours] = useState('all');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/tb-contact-screening-partner-providers/records.json`)
      .then((response) => response.json())
      .then(setRecords)
      .catch(() => setRecords([]));
  }, []);

  const values = (field: keyof ProviderRecord) => [...new Set(records.map((record) => String(record[field] || '')).filter(Boolean))].sort();
  const filtered = useMemo(() => records.filter((record) => {
    const searchable = [record.institutionName, record.physicianName, record.specialtyRaw, record.cityName, record.clinicHoursRaw].join(' ').toLowerCase();
    return (!query || searchable.includes(query.toLowerCase()))
      && (!city || record.cityName === city)
      && (!institution || record.institutionName === institution)
      && (!physician || record.physicianName === physician)
      && (!specialty || record.specialtyRaw === specialty)
      && (hours === 'all' || (hours === 'yes' ? record.hasClinicHours : !record.hasClinicHours));
  }), [records, query, city, institution, physician, specialty, hours]);

  const countBy = (field: keyof ProviderRecord) => values(field).map((label) => ({ label, value: filtered.filter((record) => String(record[field]) === label).length })).filter((item) => item.value);
  const specialtyCounts = countBy('specialtyRaw');
  const institutionCount = new Set(filtered.map((record) => record.institutionName).filter(Boolean)).size;
  const physicianCount = new Set(filtered.map((record) => record.physicianName).filter(Boolean)).size;
  const pageCount = Math.max(1, Math.ceil(filtered.length / 25));
  const pageRows = filtered.slice((page - 1) * 25, page * 25);
  const changeFilter = (action: () => void) => { action(); setPage(1); };

  const downloadCsv = () => {
    const csv = [
      ['ID', 'City', 'Institution', 'Physician', 'Specialty', 'Source-recorded clinic information'],
      ...filtered.map((record) => [record.sourceSequenceNumber, record.cityName, record.institutionName, record.physicianName, record.specialtyRaw, record.clinicHoursRaw]),
    ].map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'tb-contact-screening-partner-providers-filtered.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return <section className="workspace">
    <div className="section-heading">
      <p>HEALTHCARE / INFECTIOUS DISEASE CONTROL</p>
      <h2>{text('結核病接觸者篩檢合作醫療院所', 'TB Contact Screening Partner Providers')}</h2>
      <span>{text('依公開來源呈現合作醫療院所、醫師、專科與門診資訊。', 'Source-recorded partner institutions, physicians, specialties, and clinic information.')}</span>
    </div>
    <div className="notice subtle">{text('本資料僅供公開查詢。門診時間為來源文字紀錄，不代表即時看診、檢查服務、預約狀態、資格或收案情況；前往前請向院所或臺北市政府衛生局確認。', 'This public directory does not confirm real-time clinic hours, screening availability, appointments, eligibility, or enrollment. Confirm current information with the institution or Taipei City Department of Health.')}</div>
    <aside className="filters">
      <input value={query} onChange={(event) => changeFilter(() => setQuery(event.target.value))} placeholder={text('搜尋院所、醫師、專科、縣市或門診資訊', 'Search institution, physician, specialty, city, or clinic information')} />
      <select value={city} onChange={(event) => changeFilter(() => setCity(event.target.value))}><option value="">{text('全部縣市', 'All cities')}</option>{values('cityName').map((value) => <option key={value}>{value}</option>)}</select>
      <select value={institution} onChange={(event) => changeFilter(() => setInstitution(event.target.value))}><option value="">{text('全部院所', 'All institutions')}</option>{values('institutionName').map((value) => <option key={value}>{value}</option>)}</select>
      <select value={physician} onChange={(event) => changeFilter(() => setPhysician(event.target.value))}><option value="">{text('全部醫師', 'All physicians')}</option>{values('physicianName').map((value) => <option key={value}>{value}</option>)}</select>
      <select value={specialty} onChange={(event) => changeFilter(() => setSpecialty(event.target.value))}><option value="">{text('全部專科', 'All specialties')}</option>{values('specialtyRaw').map((value) => <option key={value}>{value}</option>)}</select>
      <select value={hours} onChange={(event) => changeFilter(() => setHours(event.target.value))}><option value="all">{text('全部門診資訊', 'All clinic-information records')}</option><option value="yes">{text('有門診資訊', 'With clinic information')}</option><option value="no">{text('缺少門診資訊', 'Without clinic information')}</option></select>
    </aside>
    <div className="summary-grid">
      {[[text('來源紀錄', 'Source records'), filtered.length], [text('醫療院所', 'Medical institutions'), institutionCount], [text('醫師', 'Physicians'), physicianCount], [text('專科別', 'Specialties'), specialtyCounts.length], [text('縣市', 'Cities'), countBy('cityName').length], [text('有門診資訊', 'With clinic information'), filtered.filter((record) => record.hasClinicHours).length]].map(([label, value]) => <article key={String(label)}><span>{label}</span><strong>{value}</strong></article>)}
    </div>
    <section className="chart"><h3>{text('各專科別紀錄數', 'Records by specialty')}</h3><div className="bars">{specialtyCounts.map((item) => <div className="bar-row" key={item.label}><span>{item.label}</span><b>{item.value}</b></div>)}</div></section>
    <button onClick={downloadCsv}>{text('下載篩選結果 CSV', 'Download filtered CSV')}</button>
    <div className="comparison-scroll procurement-table"><table><thead><tr>{[text('編號', 'ID'), text('縣市', 'City'), text('醫療機構名稱', 'Medical institution'), text('醫師姓名', 'Physician'), text('專科別', 'Specialty'), text('門診時間（來源紀錄）', 'Source-recorded clinic information')].map((label) => <th key={label}>{label}</th>)}</tr></thead><tbody>{pageRows.map((record) => <tr key={record.id}><td>{record.sourceSequenceNumber || fallback}</td><td>{record.cityName || fallback}</td><th>{record.institutionName || fallback}</th><td>{record.physicianName || fallback}</td><td>{record.specialtyRaw || fallback}</td><td><details><summary>{record.clinicHoursRaw.slice(0, 45) || fallback}</summary><pre>{record.clinicHoursRaw}</pre></details></td></tr>)}</tbody></table></div>
    <div className="pagination"><button disabled={page <= 1} onClick={() => setPage(page - 1)}>{text('上一頁', 'Previous')}</button><span>{page} / {pageCount}</span><button disabled={page >= pageCount} onClick={() => setPage(page + 1)}>{text('下一頁', 'Next')}</button></div>
  </section>;
}
