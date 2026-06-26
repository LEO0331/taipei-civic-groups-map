import { useEffect, useMemo, useState } from 'react';
import { filterLaborStandardActViolationRecords } from './lib/laborStandardActViolations';
import type {
  LaborPenaltyAmountBucket, LaborStandardActViolationFilters, LaborStandardActViolationManifest,
  LaborStandardActViolationRecord, LaborStandardActViolationSummary, LaborViolationTopicTag, Language,
} from './types';

const emptyFilters: LaborStandardActViolationFilters = {
  search: '', announcementYear: '', announcementMonth: '', dispositionYear: '', dispositionMonth: '',
  violatedProvision: '', violationTopicTag: '', penaltyAmountBucket: '', hasPenaltyAmount: '',
  hasResponsiblePersonName: '', hasNote: '',
};
const topicLabels: Record<LaborViolationTopicTag, [string, string]> = {
  wage_payment: ['工資給付', 'Wage payment'], overtime_pay: ['加班費', 'Overtime pay'], working_hours: ['工時', 'Working hours'],
  rest_day: ['例假與休息日', 'Rest days'], attendance_record: ['出勤紀錄', 'Attendance records'], wage_record: ['工資清冊', 'Wage records'],
  leave_or_holiday: ['休假與假日', 'Leave and holidays'], labor_inspection: ['勞動檢查', 'Labor inspection'],
  retirement_or_severance: ['退休或資遣', 'Retirement or severance'], employment_contract: ['勞動契約', 'Employment contract'],
  other: ['其他', 'Other'], unknown: ['未知', 'Unknown'],
};
const penaltyLabels: Record<LaborPenaltyAmountBucket, [string, string]> = {
  none_or_missing: ['無或未提供', 'None or missing'], '1_to_20000': ['1–20,000元', 'NTD 1–20,000'],
  '20001_to_50000': ['20,001–50,000元', 'NTD 20,001–50,000'], '50001_to_100000': ['50,001–100,000元', 'NTD 50,001–100,000'],
  '100001_to_300000': ['100,001–300,000元', 'NTD 100,001–300,000'], '300001_to_1000000': ['300,001–1,000,000元', 'NTD 300,001–1,000,000'],
  '1000001_plus': ['1,000,001元以上', 'NTD 1,000,001+'], unknown: ['未知', 'Unknown'],
};
const label = <T extends string>(items: Record<T, [string, string]>, key: T, language: Language) => items[key][language === 'zh' ? 0 : 1];
const fmtNtd = (value?: number) => value === undefined ? '—' : `${value.toLocaleString()} NTD`;

function BarChart({ title, data, money = false }: { title: string; data: Array<{ label: string; value: number }>; money?: boolean }) {
  const max = Math.max(...data.map((item) => item.value), 1);
  return <section className="chart"><h3>{title}</h3><div className="bars">{data.slice(0, 30).map((item) =>
    <div className="bar-row wide-label" key={item.label}><span title={item.label}>{item.label}</span>
      <div><i style={{ width: `${Math.max(2, item.value / max * 100)}%` }} /></div><b>{money ? fmtNtd(item.value) : item.value.toLocaleString()}</b></div>)}
  </div></section>;
}

function Filters({ filters, setFilters, summary, language }: {
  filters: LaborStandardActViolationFilters; setFilters: (filters: LaborStandardActViolationFilters) => void;
  summary: LaborStandardActViolationSummary; language: Language;
}) {
  const zh = language === 'zh';
  const update = (key: keyof LaborStandardActViolationFilters, value: string) => setFilters({ ...filters, [key]: value });
  const announcementYears = summary.byAnnouncementYear.map((item) => item.year);
  const dispositionYears = summary.byDispositionYear.map((item) => item.year);
  return <aside className="filters">
    <label className="search"><span aria-hidden="true">⌕</span><input value={filters.search} onChange={(event) => update('search', event.target.value)}
      aria-label={zh ? '搜尋事業單位、處分字號、違反條款或違反內容' : 'Search business, disposition number, violated provision, or violation content'}
      placeholder={zh ? '搜尋事業單位、處分字號、違反條款或違反內容' : 'Search business, disposition number, violated provision, or violation content'} /></label>
    <div className="filter-grid grant-filters">
      <label>{zh ? '公告年份' : 'Announcement year'}<select value={filters.announcementYear} onChange={(event) => update('announcementYear', event.target.value)}>
        <option value="">{zh ? '全部' : 'All'}</option>{announcementYears.map((year) => <option key={year}>{year}</option>)}
      </select></label>
      <label>{zh ? '公告月份' : 'Announcement month'}<select value={filters.announcementMonth} onChange={(event) => update('announcementMonth', event.target.value)}>
        <option value="">{zh ? '全部' : 'All'}</option>{summary.byAnnouncementMonth.map((item) => <option key={item.month}>{item.month}</option>)}
      </select></label>
      <label>{zh ? '處分年份' : 'Disposition year'}<select value={filters.dispositionYear} onChange={(event) => update('dispositionYear', event.target.value)}>
        <option value="">{zh ? '全部' : 'All'}</option>{dispositionYears.map((year) => <option key={year}>{year}</option>)}
      </select></label>
      <label>{zh ? '處分月份' : 'Disposition month'}<select value={filters.dispositionMonth} onChange={(event) => update('dispositionMonth', event.target.value)}>
        <option value="">{zh ? '全部' : 'All'}</option>{summary.byDispositionMonth.map((item) => <option key={item.month}>{item.month}</option>)}
      </select></label>
      <label>{zh ? '違反條款' : 'Violated provision'}<select value={filters.violatedProvision} onChange={(event) => update('violatedProvision', event.target.value)}>
        <option value="">{zh ? '全部' : 'All'}</option>{summary.byViolatedProvision.map((item) => <option key={item.provision}>{item.provision}</option>)}
      </select></label>
      <label>{zh ? '違規主題' : 'Violation topic'}<select value={filters.violationTopicTag} onChange={(event) => update('violationTopicTag', event.target.value)}>
        <option value="">{zh ? '全部' : 'All'}</option>{Object.keys(topicLabels).map((topic) => <option key={topic} value={topic}>{label(topicLabels, topic as LaborViolationTopicTag, language)}</option>)}
      </select></label>
      <label>{zh ? '罰鍰金額級距' : 'Penalty amount bucket'}<select value={filters.penaltyAmountBucket} onChange={(event) => update('penaltyAmountBucket', event.target.value)}>
        <option value="">{zh ? '全部' : 'All'}</option>{Object.keys(penaltyLabels).map((bucket) => <option key={bucket} value={bucket}>{label(penaltyLabels, bucket as LaborPenaltyAmountBucket, language)}</option>)}
      </select></label>
      {([
        ['hasPenaltyAmount', zh ? '有罰鍰金額' : 'Has penalty amount'],
        ['hasResponsiblePersonName', zh ? '有負責人姓名' : 'Has responsible person name'],
        ['hasNote', zh ? '有備註' : 'Has note'],
      ] as const).map(([key, title]) => <label key={key}>{title}<select value={filters[key]} onChange={(event) => update(key, event.target.value)}>
        <option value="">{zh ? '全部' : 'All'}</option><option value="yes">{zh ? '有' : 'Yes'}</option><option value="no">{zh ? '無' : 'No'}</option>
      </select></label>)}
    </div>
    {Object.values(filters).some(Boolean) && <button className="text-button" onClick={() => setFilters(emptyFilters)}>{zh ? '清除篩選' : 'Clear filters'}</button>}
  </aside>;
}

function Overview({ summary, language }: { summary: LaborStandardActViolationSummary; language: Language }) {
  const zh = language === 'zh';
  const commonProvision = summary.byViolatedProvision[0]?.provision ?? '—';
  const commonTopic = summary.byViolationTopicTag[0]?.topicTag;
  const cards = [
    [zh ? '公布紀錄數' : 'Published record count', summary.totalRecords],
    [zh ? '事業單位或事業主數' : 'Business / employer name count', summary.uniqueBusinessOrEmployerNameCount],
    [zh ? '資料日期範圍' : 'Data date range', summary.minAnnouncementDate && summary.maxAnnouncementDate ? `${summary.minAnnouncementDate} – ${summary.maxAnnouncementDate}` : '—'],
    [zh ? '最新公告日期' : 'Latest announcement date', summary.maxAnnouncementDate ?? '—'],
    [zh ? '有罰鍰金額紀錄' : 'Records with penalty amount', summary.recordsWithPenaltyAmount],
    [zh ? '罰鍰金額合計' : 'Total parsed penalty amount', fmtNtd(summary.totalPenaltyAmountNtd)],
    [zh ? '罰鍰金額中位數' : 'Median parsed penalty amount', fmtNtd(summary.medianPenaltyAmountNtd)],
    [zh ? '最高罰鍰金額' : 'Maximum parsed penalty amount', fmtNtd(summary.maxPenaltyAmountNtd)],
    [zh ? '最常見違反條款' : 'Most common violated provision', commonProvision],
    [zh ? '最常見違規主題' : 'Most common violation topic', commonTopic ? label(topicLabels, commonTopic, language) : '—'],
  ];
  return <><div className="summary-grid">{cards.map(([title, value]) => <article key={title}><span>{title}</span><strong>{typeof value === 'number' ? value.toLocaleString() : value}</strong></article>)}</div>
    <div className="chart-grid">
      <BarChart title={zh ? '各公告年份紀錄數' : 'Records by announcement year'} data={summary.byAnnouncementYear.map((item) => ({ label: String(item.year), value: item.recordCount }))} />
      <BarChart title={zh ? '各公告年份罰鍰金額合計' : 'Penalty amount by announcement year'} money data={summary.byAnnouncementYear.map((item) => ({ label: String(item.year), value: item.totalPenaltyAmountNtd }))} />
      <BarChart title={zh ? '各違反條款紀錄數' : 'Records by violated provision'} data={summary.byViolatedProvision.map((item) => ({ label: item.provision, value: item.count }))} />
      <BarChart title={zh ? '各違規主題紀錄數' : 'Records by violation topic'} data={summary.byViolationTopicTag.map((item) => ({ label: label(topicLabels, item.topicTag, language), value: item.count }))} />
    </div></>;
}

function RecordDirectory({ records, loading, language, selected, setSelected }: {
  records: LaborStandardActViolationRecord[]; loading: boolean; language: Language;
  selected: LaborStandardActViolationRecord | null; setSelected: (record: LaborStandardActViolationRecord | null) => void;
}) {
  const zh = language === 'zh';
  const [limit, setLimit] = useState(80);
  useEffect(() => setLimit(80), [records]);
  if (loading) return <p className="status" role="status">{zh ? '紀錄載入中…' : 'Loading records…'}</p>;
  return <><div className="comparison-scroll procurement-table"><table><thead><tr>
    {(zh ? ['公告日期', '處分日期', '事業單位或事業主名稱', '違反條款', '違反內容', '罰鍰金額', '備註', '來源明細'] :
      ['Announcement date', 'Disposition date', 'Business / employer name', 'Violated provisions', 'Violation content', 'Penalty amount', 'Note', 'Source details']).map((title) => <th key={title}>{title}</th>)}
  </tr></thead><tbody>{records.slice(0, limit).map((record) => <tr key={record.id}>
    <td>{record.announcementDate ?? record.announcementDateRaw ?? '—'}</td><td>{record.dispositionDate ?? record.dispositionDateRaw ?? '—'}</td>
    <th>{record.businessOrEmployerName}</th><td>{record.violatedProvisions.join('；') || '—'}</td><td>{record.violationContents.join('；') || '—'}</td>
    <td>{fmtNtd(record.penaltyAmountNtd)}</td><td>{record.hasNote ? (zh ? '有' : 'Yes') : '—'}</td>
    <td><button className="text-button" onClick={() => setSelected(record)}>{zh ? '查看' : 'View'}</button></td>
  </tr>)}</tbody></table></div>
    {!records.length && <p className="empty">{zh ? '沒有符合條件的紀錄。' : 'No records match these filters.'}</p>}
    {limit < records.length && <button className="load-more" onClick={() => setLimit(limit + 80)}>{zh ? '載入更多' : 'Load more'} · {records.length - limit}</button>}
    {selected && <section className="record-detail notice subtle"><div className="section-heading inline"><h3>{zh ? '來源明細' : 'Source Details'}</h3><button className="text-button" onClick={() => setSelected(null)}>{zh ? '關閉' : 'Close'}</button></div>
      <dl><div><dt>{zh ? '處分字號' : 'Disposition number'}</dt><dd>{selected.dispositionNumber ?? '—'}</dd></div>
        <div><dt>{zh ? '負責人姓名' : 'Responsible person name'}</dt><dd>{selected.responsiblePersonName ?? '—'}</dd></div>
        <div><dt>{zh ? '違反條款' : 'Violated provisions'}</dt><dd>{selected.violatedProvisionsRaw ?? '—'}</dd></div>
        <div><dt>{zh ? '違反內容' : 'Violation content'}</dt><dd>{selected.violationContentRaw ?? '—'}</dd></div>
        <div><dt>{zh ? '罰鍰原始欄位' : 'Raw penalty amount'}</dt><dd>{selected.penaltyAmountRaw ?? '—'}</dd></div>
        <div><dt>{zh ? '備註' : 'Note'}</dt><dd>{selected.note ?? '—'}</dd></div>
        <div><dt>{zh ? '來源額外備註' : 'Source extra note'}</dt><dd>{selected.sourceExtraNote ?? '—'}</dd></div>
        <div><dt>{zh ? '資料來源' : 'Source'}</dt><dd>{selected.source} · {selected.sourceAgency}</dd></div></dl>
    </section>}</>;
}

export default function LaborStandardActViolationsModule({ summary, manifest, language }: {
  summary: LaborStandardActViolationSummary; manifest: LaborStandardActViolationManifest; language: Language;
}) {
  const zh = language === 'zh';
  const [view, setView] = useState<'overview' | 'trends' | 'provisions' | 'content' | 'penalties' | 'directory' | 'notes'>('overview');
  const [filters, setFilters] = useState(emptyFilters);
  const [records, setRecords] = useState<LaborStandardActViolationRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<LaborStandardActViolationRecord | null>(null);
  useEffect(() => {
    if (view !== 'directory') return;
    let cancelled = false;
    const chunks = filters.announcementYear ? manifest.chunks.filter((chunk) => chunk.year === Number(filters.announcementYear)) : manifest.chunks;
    setLoading(true);
    Promise.all(chunks.map((chunk) => fetch(`${import.meta.env.BASE_URL}data/labor-standard-act-violation-records/${chunk.file}`).then((response) => {
      if (!response.ok) throw new Error(String(response.status));
      return response.json() as Promise<LaborStandardActViolationRecord[]>;
    }))).then((rows) => {
      if (!cancelled) setRecords(rows.flat());
    }).catch(() => {
      if (!cancelled) setRecords([]);
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [filters.announcementYear, manifest.chunks, view]);
  const filtered = useMemo(() => filterLaborStandardActViolationRecords(records, filters), [filters, records]);
  const views = [
    ['overview', zh ? '總覽' : 'Overview'], ['trends', zh ? '時間趨勢' : 'Time Trends'], ['provisions', zh ? '違反條款' : 'Violated Provisions'],
    ['content', zh ? '違反內容' : 'Violation Content'], ['penalties', zh ? '罰鍰分析' : 'Penalty Analysis'],
    ['directory', zh ? '紀錄清單' : 'Record Directory'], ['notes', zh ? '資料說明' : 'Data Notes'],
  ] as const;
  return <><Filters filters={filters} setFilters={setFilters} summary={summary} language={language} />
    <section className="workspace"><div className="section-heading"><p>06 / LABOR & COMPLIANCE PUBLIC RECORDS</p><h2>{zh ? '勞基法違規公布紀錄' : 'Labor Standards Act Violation Records'}</h2>
      <span>{zh ? '整理臺北市政府勞動局公開公布之違反勞動基準法事業單位及事業主資料，依公告日期、處分日期、違反條款、違反內容與罰鍰金額進行查詢與統計。' : 'Explore Taipei Department of Labor public records of businesses and employers published for Labor Standards Act violations by announcement date, disposition date, violated provision, violation content, and penalty amount.'}</span></div>
      <div className="subtabs">{views.map(([id, title]) => <button className={view === id ? 'active' : ''} onClick={() => setView(id)} key={id}>{title}</button>)}</div>
      <div className="notice subtle">{zh ? '勞基法違規公布紀錄為主管機關公開公布之行政紀錄，僅供資料查詢、統計整理與公共資料探索使用，不代表目前營運狀態、即時違規狀態、雇主整體評價、求職建議、法律意見或裁判結果。資料內容、處分狀態與最新資訊請以臺北市政府勞動局公告、主管機關資料及正式文件為準。' : 'Labor Standards Act violation publication records are administrative records published by the competent authority for lookup, statistical organization, and public-data exploration only. They do not represent current operating status, real-time violation status, overall employer evaluation, job-seeking advice, legal advice, or court outcome. Record content, disposition status, and latest information should be verified with Taipei City Government Department of Labor announcements, competent authorities, and official documents.'}</div>
      {view === 'overview' && <Overview summary={summary} language={language} />}
      {view === 'trends' && <div className="chart-grid"><BarChart title={zh ? '各公告年份紀錄數' : 'Records by announcement year'} data={summary.byAnnouncementYear.map((item) => ({ label: String(item.year), value: item.recordCount }))} /><BarChart title={zh ? '各公告月份紀錄數' : 'Records by announcement month'} data={summary.byAnnouncementMonth.map((item) => ({ label: item.month, value: item.recordCount }))} /><BarChart title={zh ? '各公告年份罰鍰金額合計' : 'Penalty amount by announcement year'} money data={summary.byAnnouncementYear.map((item) => ({ label: String(item.year), value: item.totalPenaltyAmountNtd }))} /></div>}
      {view === 'provisions' && <div className="chart-grid"><BarChart title={zh ? '各違反條款紀錄數' : 'Records by violated provision'} data={summary.byViolatedProvision.map((item) => ({ label: item.provision, value: item.count }))} /><BarChart title={zh ? '各違規主題紀錄數' : 'Records by violation topic'} data={summary.byViolationTopicTag.map((item) => ({ label: label(topicLabels, item.topicTag, language), value: item.count }))} /></div>}
      {view === 'content' && <div className="chart-grid"><BarChart title={zh ? '各違反內容紀錄數' : 'Records by violation content'} data={summary.byViolationContent.map((item) => ({ label: item.violationContent, value: item.count }))} /></div>}
      {view === 'penalties' && <div className="chart-grid"><BarChart title={zh ? '罰鍰金額級距分布' : 'Penalty amount bucket distribution'} data={summary.byPenaltyAmountBucket.map((item) => ({ label: label(penaltyLabels, item.penaltyAmountBucket, language), value: item.count }))} /><BarChart title={zh ? '有無罰鍰金額紀錄' : 'Records with and without penalty amount'} data={[{ label: zh ? '有罰鍰金額' : 'With penalty amount', value: summary.recordsWithPenaltyAmount }, { label: zh ? '無或未提供' : 'None or missing', value: summary.recordsMissingPenaltyAmount }]} /></div>}
      {view === 'directory' && <><div className="section-heading inline"><div /><strong>{loading ? '…' : filtered.length.toLocaleString()} <span>{zh ? '筆符合紀錄' : 'matching records'}</span></strong></div><RecordDirectory records={filtered} loading={loading} language={language} selected={selected} setSelected={setSelected} /></>}
      {view === 'notes' && <div className="notes-grid"><article><h3>{zh ? '資料內容' : 'Data contents'}</h3><p>{zh ? '勞基法違規公布紀錄資料提供臺北市政府勞動局公開公布之違反勞動基準法事業單位及事業主紀錄，欄位包含公告日期、處分日期、處分字號、事業單位或事業主之名稱、負責人姓名、違反勞動基準法條款、違反法規內容、罰鍰金額與備註。本網站將民國日期轉換為西元日期，並將多個違反條款與違反內容拆分為可篩選項目。' : 'Labor Standards Act violation records provide Taipei Department of Labor public publication records for businesses and employers that violated the Labor Standards Act. Fields include announcement date, disposition date, disposition number, business or employer name, responsible person name, violated provisions, violation content, penalty amount, and notes. This site converts ROC dates to Gregorian dates and splits multiple provisions and contents into filterable items.'}</p></article>
        <article><h3>{zh ? '解讀限制' : 'Interpretation limits'}</h3><p>{zh ? '本資料為主管機關公開公布之行政紀錄，僅供資料查詢與統計整理，不代表目前營運狀態、即時違規狀態、雇主整體評價、求職建議、法律意見或裁判結果。負責人姓名為來源資料欄位，本網站僅於來源明細中呈現，不作個人排名或評價。' : 'This data is an administrative publication record from the competent authority for lookup and statistical organization only. It does not represent current operating status, real-time violation status, overall employer evaluation, job-seeking advice, legal advice, or court outcome. Responsible person names are shown only in source details and are not ranked or evaluated.'}</p></article>
        <article><h3>{zh ? '地圖' : 'Map'}</h3><p>{zh ? '此資料集未提供地址或經緯度，因此不製作地圖點位。' : 'This dataset does not provide addresses or coordinates, so no map points are created.'}</p></article>
        <article><h3>{zh ? '資料來源' : 'Source'}</h3><p><a href="https://data.taipei/dataset/detail?id=23630879-4926-4877-a48a-a0ae6cc2f7d5" target="_blank" rel="noreferrer">{zh ? '臺北市政府勞動局違反勞動基準法事業單位及事業主公布總表' : 'Taipei Labor Standards Act Violation Publication Records'} ↗</a></p></article></div>}
    </section></>;
}
