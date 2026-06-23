import { useEffect, useMemo, useState } from 'react';
import { buildMetroProcurementSummary, filterMetroProcurement } from './lib/metroProcurement';
import type {
  Language, MetroProcurementFilters, MetroProcurementScheduleRecord, MetroProcurementScheduleSummary,
  ProcurementSubjectCategory, TenderMethod,
} from './types';

const emptyFilters: MetroProcurementFilters = {
  search: '', periodYear: '', periodMonth: '', periodKey: '', subjectCategory: '',
  tenderMethod: '', keywordGroup: '', budgetStatus: '',
};

const subjectLabels: Record<Language, Record<ProcurementSubjectCategory, string>> = {
  zh: { goods: '財物類', services: '勞務類', works: '工程類', other: '其他標的分類', unknown: '未知標的分類' },
  en: { goods: 'Goods', services: 'Services', works: 'Works', other: 'Other subject category', unknown: 'Unknown subject category' },
};
const methodLabels: Record<Language, Record<TenderMethod, string>> = {
  zh: {
    open_tender: '公開招標', public_quotation_or_proposal: '公開取得報價單或企劃書',
    selective_limited_tender_after_public_review: '經公開評選或公開徵求之限制性招標',
    other: '其他招標方式', unknown: '未知招標方式',
  },
  en: {
    open_tender: 'Open tender', public_quotation_or_proposal: 'Public quotation or proposal',
    selective_limited_tender_after_public_review: 'Selective limited tender after public review',
    other: 'Other tender method', unknown: 'Unknown tender method',
  },
};
const keywordLabels: Record<string, [string, string]> = {
  station_facility: ['車站設施', 'Station facilities'], rolling_stock: ['列車與車輛', 'Rolling stock'],
  elevator_escalator: ['電梯與扶梯', 'Elevators and escalators'], signal_control: ['號誌與控制', 'Signal and control'],
  power_electrical: ['電力與機電', 'Power and electrical'], fire_safety: ['消防與防火', 'Fire safety'],
  air_conditioning: ['空調', 'Air conditioning'], civil_works: ['土建工程', 'Civil works'],
  security: ['保全', 'Security'], cable_car: ['纜車', 'Cable car'],
  children_amusement_park: ['兒童新樂園', 'Children’s Amusement Park'], it_system: ['資訊系統', 'IT systems'],
  maintenance: ['維護改善', 'Maintenance'], other: ['其他', 'Other'],
};
const keywordLabel = (key: string, language: Language) => keywordLabels[key]?.[language === 'zh' ? 0 : 1] ?? key;
const money = (value?: number, language: Language = 'zh') => value === undefined ? '—' : new Intl.NumberFormat(language === 'zh' ? 'zh-TW' : 'en', {
  style: 'currency', currency: 'TWD', maximumFractionDigits: 0,
}).format(value);

function BarChart({ title, data }: { title: string; data: Array<{ label: string; value: number }> }) {
  const max = Math.max(...data.map((item) => item.value), 1);
  return <section className="chart"><h3>{title}</h3><div className="bars">{data.map((item) =>
    <div className="bar-row wide-label" key={item.label}><span title={item.label}>{item.label}</span>
      <div><i style={{ width: `${Math.max(2, item.value / max * 100)}%` }} /></div><b>{item.value.toLocaleString()}</b></div>)}
  </div></section>;
}

function ProcurementFilters({ filters, setFilters, records, language }: {
  filters: MetroProcurementFilters; setFilters: (filters: MetroProcurementFilters) => void;
  records: MetroProcurementScheduleRecord[]; language: Language;
}) {
  const zh = language === 'zh';
  const update = (key: keyof MetroProcurementFilters, value: string) => setFilters({ ...filters, [key]: value });
  const values = (key: 'periodYear' | 'periodMonth' | 'periodKey') =>
    [...new Set(records.flatMap((record) => record[key] ?? []))].sort((a, b) => String(a).localeCompare(String(b)));
  const subjects = [...new Set(records.map((record) => record.subjectCategory))];
  const methods = [...new Set(records.map((record) => record.tenderMethod))];
  const keywords = [...new Set(records.flatMap((record) => record.derivedKeywordGroups))].sort();
  return <aside className="filters">
    <label className="search"><span aria-hidden="true">⌕</span><input value={filters.search} onChange={(event) => update('search', event.target.value)}
      aria-label={zh ? '搜尋標案名稱、標的分類、招標方式或月份' : 'Search case name, subject category, tender method, or period'}
      placeholder={zh ? '搜尋標案名稱、標的分類、招標方式或月份' : 'Search case name, subject category, tender method, or period'} /></label>
    <div className="filter-grid procurement-filters">
      {([
        ['periodYear', zh ? '年份' : 'Year', values('periodYear')],
        ['periodMonth', zh ? '月份' : 'Month', values('periodMonth')],
        ['periodKey', zh ? '年月' : 'Year-month', values('periodKey')],
      ] as const).map(([key, label, options]) => <label key={key}>{label}<select value={filters[key]} onChange={(event) => update(key, event.target.value)}>
        <option value="">{zh ? '全部' : 'All'}</option>{options.map((value) => <option key={value} value={value}>{value}</option>)}
      </select></label>)}
      <label>{zh ? '標的分類' : 'Subject category'}<select value={filters.subjectCategory} onChange={(event) => update('subjectCategory', event.target.value)}>
        <option value="">{zh ? '全部' : 'All'}</option>{subjects.map((value) => <option key={value} value={value}>{subjectLabels[language][value]}</option>)}
      </select></label>
      <label>{zh ? '招標方式' : 'Tender method'}<select value={filters.tenderMethod} onChange={(event) => update('tenderMethod', event.target.value)}>
        <option value="">{zh ? '全部' : 'All'}</option>{methods.map((value) => <option key={value} value={value}>{methodLabels[language][value]}</option>)}
      </select></label>
      <label>{zh ? '衍生關鍵字分類' : 'Derived keyword group'}<select value={filters.keywordGroup} onChange={(event) => update('keywordGroup', event.target.value)}>
        <option value="">{zh ? '全部' : 'All'}</option>{keywords.map((value) => <option key={value} value={value}>{keywordLabel(value, language)}</option>)}
      </select></label>
      <label>{zh ? '預算欄位狀態' : 'Budget field status'}<select value={filters.budgetStatus} onChange={(event) => update('budgetStatus', event.target.value)}>
        <option value="">{zh ? '全部' : 'All'}</option><option value="numeric">{zh ? '有數字預算金額' : 'Has numeric budget amount'}</option>
        <option value="textual">{zh ? '無數字預算金額' : 'No numeric budget amount'}</option>
      </select></label>
    </div>
    {Object.values(filters).some(Boolean) && <button className="text-button" onClick={() => setFilters(emptyFilters)}>{zh ? '清除篩選' : 'Clear filters'}</button>}
  </aside>;
}

function Overview({ summary, records, language }: {
  summary: MetroProcurementScheduleSummary; records: MetroProcurementScheduleRecord[]; language: Language;
}) {
  const zh = language === 'zh';
  const categoryCount = (category: ProcurementSubjectCategory) => summary.bySubjectCategory.find((item) => item.subjectCategory === category)?.count ?? 0;
  const topDerivedMethod = summary.byTenderMethod.find((item) => !['unknown', 'other'].includes(item.tenderMethod));
  const cards = [
    [zh ? '採購時程紀錄數' : 'Procurement schedule record count', summary.totalRecords],
    [zh ? '採購時程月份數' : 'Procurement period count', summary.periodCount],
    [zh ? '最新採購時程月份' : 'Latest procurement period', summary.maxPeriodKey ?? '—'],
    [zh ? '最早採購時程月份' : 'Earliest procurement period', summary.minPeriodKey ?? '—'],
    [zh ? '財物類案件數' : 'Goods case count', categoryCount('goods')],
    [zh ? '勞務類案件數' : 'Services case count', categoryCount('services')],
    [zh ? '工程類案件數' : 'Works case count', categoryCount('works')],
    [zh ? '最多衍生招標方式' : 'Top derived tender method', topDerivedMethod ? methodLabels[language][topDerivedMethod.tenderMethod] : '—'],
    [zh ? '最多標的分類' : 'Top subject category', summary.bySubjectCategory[0] ? subjectLabels[language][summary.bySubjectCategory[0].subjectCategory] : '—'],
    [zh ? '有數字預算金額紀錄' : 'Records with numeric budget amount', summary.recordsWithNumericBudgetAmount],
    [zh ? '預算欄位為文字紀錄' : 'Records with textual budget column', summary.recordsWithTextualBudgetColumn],
  ];
  const budgetByPeriod = summary.byPeriod.map((period) => ({
    label: period.periodKey,
    value: records.filter((record) => record.periodKey === period.periodKey).reduce((sum, record) => sum + (record.budgetAmountNtd ?? 0), 0),
  }));
  return <><div className="summary-grid procurement-summary">{cards.map(([label, value]) => <article key={label}><span>{label}</span>
    <strong>{typeof value === 'number' ? value.toLocaleString() : value}</strong></article>)}</div>
    <div className="chart-grid">
      <BarChart title={zh ? '各月份採購時程紀錄數' : 'Procurement records by month'} data={summary.byPeriod.map((item) => ({ label: item.periodKey, value: item.recordCount }))} />
      <BarChart title={zh ? '各標的分類紀錄數' : 'Procurement records by subject category'} data={summary.bySubjectCategory.map((item) => ({ label: subjectLabels[language][item.subjectCategory], value: item.count }))} />
      <BarChart title={zh ? '各招標方式紀錄數' : 'Procurement records by tender method'} data={summary.byTenderMethod.map((item) => ({ label: methodLabels[language][item.tenderMethod], value: item.count }))} />
      <BarChart title={zh ? '預算欄位狀態' : 'Budget field status'} data={[
        { label: zh ? '有數字預算金額' : 'Numeric budget amount', value: summary.recordsWithNumericBudgetAmount },
        { label: zh ? '預算欄位為文字' : 'Textual budget column', value: summary.recordsWithTextualBudgetColumn },
      ]} />
      {summary.recordsWithNumericBudgetAmount > 0 && <BarChart title={zh ? '各月份可解析預算金額' : 'Parseable budget amount by month'} data={budgetByPeriod} />}
    </div></>;
}

function Trends({ summary, records, language }: {
  summary: MetroProcurementScheduleSummary; records: MetroProcurementScheduleRecord[]; language: Language;
}) {
  const zh = language === 'zh';
  const topKeywords = summary.keywordFrequency.slice(0, 5).map((item) => item.keyword);
  const keywordByPeriod = summary.byPeriod.map((period) => {
    const counts = topKeywords.map((keyword) => ({
      keyword,
      count: records.filter((record) => record.periodKey === period.periodKey && record.derivedKeywordGroups.includes(keyword)).length,
    })).sort((a, b) => b.count - a.count);
    return { label: `${period.periodKey} · ${keywordLabel(counts[0]?.keyword ?? 'other', language)}`, value: counts[0]?.count ?? 0 };
  });
  return <><div className="chart-grid">
    {(['goods', 'services', 'works'] as const).map((category) => <BarChart key={category}
      title={`${subjectLabels[language][category]} · ${zh ? '各月份' : 'by month'}`}
      data={summary.byPeriod.map((item) => ({ label: item.periodKey, value: item[`${category}Count`] }))} />)}
    <BarChart title={zh ? '各月份最常見案件關鍵字分類' : 'Top case keyword group by month'} data={keywordByPeriod} />
  </div><div className="comparison-scroll period-table"><table><thead><tr><th>{zh ? '統計期' : 'Period'}</th><th>{zh ? '紀錄數' : 'Records'}</th>
    <th>{subjectLabels[language].goods}</th><th>{subjectLabels[language].services}</th><th>{subjectLabels[language].works}</th></tr></thead>
    <tbody>{summary.byPeriod.map((period) => <tr key={period.periodKey}><th>{period.periodKey}</th><td>{period.recordCount}</td>
      <td>{period.goodsCount}</td><td>{period.servicesCount}</td><td>{period.worksCount}</td></tr>)}</tbody></table></div></>;
}

function Categories({ summary, language }: { summary: MetroProcurementScheduleSummary; language: Language }) {
  const zh = language === 'zh';
  return <div className="chart-grid">
    <BarChart title={zh ? '各標的分類紀錄數' : 'Procurement records by subject category'} data={summary.bySubjectCategory.map((item) => ({ label: subjectLabels[language][item.subjectCategory], value: item.count }))} />
    <BarChart title={zh ? '各招標方式紀錄數' : 'Procurement records by tender method'} data={summary.byTenderMethod.map((item) => ({ label: methodLabels[language][item.tenderMethod], value: item.count }))} />
    <BarChart title={zh ? '常見案件關鍵字分類' : 'Top procurement keyword groups'} data={summary.keywordFrequency.map((item) => ({ label: keywordLabel(item.keyword, language), value: item.count }))} />
  </div>;
}

function Directory({ records, language }: { records: MetroProcurementScheduleRecord[]; language: Language }) {
  const zh = language === 'zh';
  const [limit, setLimit] = useState(100);
  useEffect(() => setLimit(100), [records]);
  return <><div className="comparison-scroll procurement-table"><table><thead><tr>
    {(zh ? ['統計期', '序號', '標案名稱', '標的分類', '招標方式', '預算金額', '原始預算欄位', '來源'] :
      ['Period', 'Sequence', 'Case name', 'Subject category', 'Tender method', 'Budget amount', 'Raw budget field', 'Source']).map((label) => <th key={label}>{label}</th>)}
  </tr></thead><tbody>{records.slice(0, limit).map((record) => <tr key={record.id}><td>{record.periodKey ?? record.periodRocYearMonth}</td>
    <td>{record.sourceSequenceNumber ?? '—'}</td><th>{record.caseName}</th><td>{subjectLabels[language][record.subjectCategory]}</td>
    <td>{methodLabels[language][record.tenderMethod]}</td><td>{money(record.budgetAmountNtd, language)}</td>
    <td>{record.budgetAmountRaw ?? '—'}</td><td>{record.source}</td></tr>)}</tbody></table></div>
    {!records.length && <p className="empty">{zh ? '沒有符合條件的紀錄。' : 'No records match these filters.'}</p>}
    {limit < records.length && <button className="load-more" onClick={() => setLimit(limit + 100)}>{zh ? '載入更多' : 'Load more'} · {records.length - limit}</button>}</>;
}

export default function MetroProcurementModule({ records, summary, language }: {
  records: MetroProcurementScheduleRecord[]; summary: MetroProcurementScheduleSummary; language: Language;
}) {
  const zh = language === 'zh';
  const [view, setView] = useState<'overview' | 'trends' | 'categories' | 'directory' | 'notes'>('overview');
  const [filters, setFilters] = useState(emptyFilters);
  const filtered = useMemo(() => filterMetroProcurement(records, filters), [records, filters]);
  const activeSummary = useMemo(() => Object.values(filters).some(Boolean) ? buildMetroProcurementSummary(filtered) : summary, [filtered, filters, summary]);
  const views = [
    ['overview', zh ? '時程總覽' : 'Schedule Overview'], ['trends', zh ? '月份趨勢' : 'Monthly Trends'],
    ['categories', zh ? '標的分類' : 'Subject Categories'], ['directory', zh ? '案件清單' : 'Case Directory'],
    ['notes', zh ? '資料說明' : 'Data Notes'],
  ] as const;
  return <><ProcurementFilters filters={filters} setFilters={setFilters} records={records} language={language} />
    <section className="workspace"><div className="section-heading"><p>03 / METRO PROCUREMENT</p><h2>{zh ? '捷運採購時程' : 'Metro Procurement Schedule'}</h2>
      <span>{zh ? '探索臺北捷運公司採購案件預定招標時程，依月份、標的分類、招標方式與案件關鍵字整理。' : 'Explore Taipei Metro planned procurement tender schedules by month, subject category, tender method, and case keywords.'}</span></div>
      <div className="subtabs">{views.map(([id, label]) => <button className={view === id ? 'active' : ''} onClick={() => setView(id)} key={id}>{label}</button>)}</div>
      <div className="notice">{zh ? '臺北捷運公司採購案件預定招標時程資訊僅為預定排程，實際公告時間、招標文件、資格條件與最新狀態仍應以政府電子採購網及主管機關正式公告為準。' : 'Taipei Metro procurement schedule data is a planned schedule only. Actual announcement timing, tender documents, eligibility requirements, and latest status should be verified through the Government e-Procurement System and official authority notices.'}</div>
      {activeSummary.recordsWithNumericBudgetAmount > 0 && <div className="notice subtle">{zh ? '僅部分資料列含可解析之數字預算金額；其餘資料列保留原始欄位內容。' : 'Only some records contain parseable numeric budget amounts; other records preserve the raw source field content.'}</div>}
      {view === 'overview' && <Overview summary={activeSummary} records={filtered} language={language} />}
      {view === 'trends' && <Trends summary={activeSummary} records={filtered} language={language} />}
      {view === 'categories' && <Categories summary={activeSummary} language={language} />}
      {view === 'directory' && <><div className="section-heading inline"><div /><strong>{filtered.length.toLocaleString()} <span>{zh ? '筆符合紀錄' : 'matching records'}</span></strong></div><Directory records={filtered} language={language} /></>}
      {view === 'notes' && <div className="notes-grid procurement-notes"><article><h3>{zh ? '無地圖資料' : 'No map data'}</h3><p>{zh ? '捷運採購時程資料未提供地理座標或行政區欄位，因此不顯示為地圖點位。請使用時程總覽與案件清單查詢。' : 'Metro procurement schedule data does not provide coordinates or district fields, so it is not displayed as map points. Please use the schedule overview and case directory.'}</p></article>
        <article><h3>{zh ? '來源欄位說明' : 'Source schema note'}</h3><p>{zh ? '資料來源欄位名稱可能與實際內容不完全一致；例如樣本資料中的「預算金額」欄位包含公開招標、公開取得報價單或企劃書等文字。系統會保留原始欄位，並在可判斷時另行衍生招標方式。' : 'Source column names may not always match the observed content. For example, the sample file’s “budget amount” column contains text such as open tender and public quotation/proposal. The system preserves the raw source field and derives tender method where possible.'}</p></article>
        <article><h3>{zh ? '資料來源' : 'Source'}</h3><p><a href="https://data.taipei/dataset/detail?id=f4fd7f03-9bf6-41de-a003-02c437596570" target="_blank" rel="noreferrer">{zh ? '臺北捷運公司採購案件預定招標時程資訊' : 'Taipei Metro Planned Procurement Tender Schedule'} ↗</a></p></article></div>}
    </section></>;
}
