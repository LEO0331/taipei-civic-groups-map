import { useMemo, useState } from 'react';

type RecordValue = string | number | boolean | null | undefined | Record<string, unknown> | unknown[];

function formatValue(value: RecordValue): string {
  if (value == null || value === '') return '-';
  if (Array.isArray(value)) return value.map((item) => formatValue(item as RecordValue)).filter((item) => item !== '-').join('、') || '-';
  if (typeof value === 'object') {
    return Object.entries(value)
      .filter(([, item]) => item != null && item !== '')
      .map(([key, item]) => `${key}: ${formatValue(item as RecordValue)}`)
      .join('；') || '-';
  }
  return String(value);
}

export default function GeneratedDatasetDirectoryModule({
  title, subtitle, records, language, columns, notice,
}: {
  title: string;
  subtitle: string;
  records: Record<string, RecordValue>[];
  language: 'zh' | 'en';
  columns: Array<[string, string]>;
  notice: string;
}) {
  const [search, setSearch] = useState('');
  const [district, setDistrict] = useState('');
  const [hasPhone, setHasPhone] = useState('');
  const districts = useMemo(() => [...new Set(records.map((record) => String(record.districtName ?? record.districtNameFromAddress ?? '')).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'zh-Hant')), [records]);
  const filteredRecords = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase();
    return records.filter((record) => (!normalizedSearch || JSON.stringify(record).toLocaleLowerCase().includes(normalizedSearch))
      && (!district || record.districtName === district || record.districtNameFromAddress === district)
      && (!hasPhone || (hasPhone === 'yes' ? Boolean(record.hasPhone) : !record.hasPhone)));
  }, [records, search, district, hasPhone]);

  return <section className="workspace">
    <div className="section-heading"><p>PUBLIC RECORD DIRECTORY</p><h2>{title}</h2><span>{subtitle}</span></div>
    <div className="notice subtle">{notice}</div>
    <label className="search"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={language === 'zh' ? '搜尋資料' : 'Search records'} /></label>
    {(districts.length > 0 || records.some((record) => 'hasPhone' in record)) && <div className="filter-grid">
      {districts.length > 0 && <label>{language === 'zh' ? '行政區' : 'District'}<select value={district} onChange={(event) => setDistrict(event.target.value)}><option value="">{language === 'zh' ? '全部' : 'All'}</option>{districts.map((value) => <option key={value}>{value}</option>)}</select></label>}
      {records.some((record) => 'hasPhone' in record) && <label>{language === 'zh' ? '有電話' : 'Has phone'}<select value={hasPhone} onChange={(event) => setHasPhone(event.target.value)}><option value="">{language === 'zh' ? '全部' : 'All'}</option><option value="yes">{language === 'zh' ? '是' : 'Yes'}</option><option value="no">{language === 'zh' ? '否' : 'No'}</option></select></label>}
    </div>}
    <div className="section-heading inline"><p>{language === 'zh' ? '篩選後紀錄' : 'Filtered records'}</p><strong>{filteredRecords.length}</strong></div>
    <div className="comparison-scroll procurement-table"><table><thead><tr>{columns.map(([, label]) => <th key={label}>{label}</th>)}</tr></thead><tbody>
      {filteredRecords.map((record, index) => <tr key={String(record.id ?? index)}>{columns.map(([key]) => <td key={key}>{formatValue(record[key])}</td>)}</tr>)}
    </tbody></table></div>
  </section>;
}
