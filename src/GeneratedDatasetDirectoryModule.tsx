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
  const filteredRecords = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase();
    if (!normalizedSearch) return records;
    return records.filter((record) => JSON.stringify(record).toLocaleLowerCase().includes(normalizedSearch));
  }, [records, search]);

  return <section className="workspace">
    <div className="section-heading"><p>PUBLIC RECORD DIRECTORY</p><h2>{title}</h2><span>{subtitle}</span></div>
    <div className="notice subtle">{notice}</div>
    <label className="search"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={language === 'zh' ? '搜尋資料' : 'Search records'} /></label>
    <div className="section-heading inline"><p>{language === 'zh' ? '篩選後紀錄' : 'Filtered records'}</p><strong>{filteredRecords.length}</strong></div>
    <div className="comparison-scroll procurement-table"><table><thead><tr>{columns.map(([, label]) => <th key={label}>{label}</th>)}</tr></thead><tbody>
      {filteredRecords.map((record, index) => <tr key={String(record.id ?? index)}>{columns.map(([key]) => <td key={key}>{formatValue(record[key])}</td>)}</tr>)}
    </tbody></table></div>
  </section>;
}
