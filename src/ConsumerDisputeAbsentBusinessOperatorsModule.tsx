import { useEffect, useMemo, useState } from 'react';
import { buildConsumerDisputeAbsentBusinessOperatorSummary, filterConsumerDisputeAbsentBusinessOperators } from './lib/consumerDisputeAbsentBusinessOperators';
import type { ConsumerDisputeAbsentBusinessOperatorFilters, ConsumerDisputeAbsentBusinessOperatorRecord, ConsumerDisputeAbsentBusinessOperatorSummary, ConsumerDisputeKeywordCategory, Language } from './types';

const emptyFilters: ConsumerDisputeAbsentBusinessOperatorFilters = { search: '', year: '', yearFrom: '', yearTo: '', negotiationDateFrom: '', negotiationDateTo: '', respondentName: '', disputeKeywordCategory: '', hasNegotiationDate: '', hasDisputeContent: '', yearMismatch: '', resourceName: '' };
const categoryLabels: Record<ConsumerDisputeKeywordCategory, [string, string]> = {
  travel_or_accommodation: ['旅遊或住宿', 'Travel or accommodation'], education_or_courses: ['教育或課程', 'Education or courses'], online_shopping: ['網購', 'Online shopping'],
  retail_goods: ['零售商品', 'Retail goods'], housing_or_real_estate: ['房屋或不動產', 'Housing or real estate'], telecom_or_digital_service: ['電信或數位服務', 'Telecom or digital service'],
  fitness_or_beauty: ['健身或美容', 'Fitness or beauty'], food_or_restaurant: ['食品或餐飲', 'Food or restaurant'], vehicle_or_transport: ['車輛或交通', 'Vehicle or transport'],
  financial_or_payment: ['金融或付款', 'Financial or payment'], medical_or_health_product: ['醫療或健康產品', 'Medical or health product'], contract_or_refund: ['契約或退款', 'Contract or refund'],
  other: ['其他', 'Other'], unknown: ['未知', 'Unknown'],
};
const label = (category: ConsumerDisputeKeywordCategory, language: Language) => categoryLabels[category][language === 'zh' ? 0 : 1];
const notice = (zh: boolean) => zh
  ? '消費爭議無故不到場協商之被申訴企業經營者列表為臺北市公開資料中依臺北市消費者保護自治條例第24條第1款公告之公開紀錄，僅供查詢年度、被申訴人、申訴人、協商日與爭議內容等來源欄位使用，不代表完整消費申訴資料庫、詐欺認定、法律責任認定、法院判決、行政裁罰金額、企業信用評等、即時營業狀態、消費建議、投資訊號、黑名單、法律意見或官方背書。'
  : 'The consumer dispute absent business operator list is Taipei public-data record information published under Article 24, Subparagraph 1 of the Taipei City Consumer Protection Self-Governance Ordinance. It is for looking up source fields only and does not represent a complete consumer complaint database, fraud determination, legal liability, court judgment, penalty amount, credit rating, consumer advice, investment signal, blacklist, legal advice, or official endorsement.';
const noMap = (zh: boolean) => zh
  ? '此資料未提供官方經緯度、地址、道路或行政區欄位，因此不顯示地圖點位，也不自動連結公司或商業登記資料。'
  : 'This dataset does not provide official coordinates, addresses, roads, or district fields, so no map points are shown and no company/business registration records are automatically linked.';

function Bar({ title, rows }: { title: string; rows: Array<{ label: string; count: number }> }) {
  const max = Math.max(...rows.map((row) => row.count), 1);
  return <section className="chart"><h3>{title}</h3><div className="bars">{rows.slice(0, 30).map((row) => <div className="bar-row wide-label" key={row.label}><span title={row.label}>{row.label}</span><div><i style={{ width: `${Math.max(2, row.count / max * 100)}%` }} /></div><b>{row.count.toLocaleString()}</b></div>)}</div></section>;
}

function Filters({ records, summary, filters, setFilters, language }: { records: ConsumerDisputeAbsentBusinessOperatorRecord[]; summary: ConsumerDisputeAbsentBusinessOperatorSummary; filters: ConsumerDisputeAbsentBusinessOperatorFilters; setFilters: (filters: ConsumerDisputeAbsentBusinessOperatorFilters) => void; language: Language }) {
  const zh = language === 'zh', update = (key: keyof ConsumerDisputeAbsentBusinessOperatorFilters, value: string) => setFilters({ ...filters, [key]: value });
  const respondents = summary.byRespondent.slice(0, 200).map((item) => item.respondentName);
  const resources = summary.resourceBreakdown.map((item) => item.resourceName);
  return <aside className="filters">
    <label className="search"><span aria-hidden="true">⌕</span><input value={filters.search} onChange={(event) => update('search', event.target.value)} placeholder={zh ? '搜尋被申訴人、申訴人、爭議內容、年度或協商日' : 'Search respondent, complainant, dispute content, year, or negotiation date'} /></label>
    <div className="filter-grid grant-filters">
      <label>{zh ? '年度' : 'Year'}<select value={filters.year} onChange={(event) => update('year', event.target.value)}><option value="">{zh ? '全部' : 'All'}</option>{summary.byYear.map((item) => <option key={item.year}>{item.year}</option>)}</select></label>
      <label>{zh ? '起始年度' : 'Year from'}<input type="number" value={filters.yearFrom} onChange={(event) => update('yearFrom', event.target.value)} /></label>
      <label>{zh ? '結束年度' : 'Year to'}<input type="number" value={filters.yearTo} onChange={(event) => update('yearTo', event.target.value)} /></label>
      <label>{zh ? '協商日起' : 'Negotiation date from'}<input type="date" value={filters.negotiationDateFrom} onChange={(event) => update('negotiationDateFrom', event.target.value)} /></label>
      <label>{zh ? '協商日至' : 'Negotiation date to'}<input type="date" value={filters.negotiationDateTo} onChange={(event) => update('negotiationDateTo', event.target.value)} /></label>
      <label>{zh ? '被申訴人' : 'Respondent'}<select value={filters.respondentName} onChange={(event) => update('respondentName', event.target.value)}><option value="">{zh ? '全部' : 'All'}</option>{respondents.map((name) => <option key={name}>{name}</option>)}</select></label>
      <label>{zh ? '爭議關鍵類別' : 'Dispute keyword category'}<select value={filters.disputeKeywordCategory} onChange={(event) => update('disputeKeywordCategory', event.target.value)}><option value="">{zh ? '全部' : 'All'}</option>{Object.keys(categoryLabels).map((key) => <option value={key} key={key}>{label(key as ConsumerDisputeKeywordCategory, language)}</option>)}</select></label>
      <label>{zh ? '來源檔案' : 'Source resource'}<select value={filters.resourceName} onChange={(event) => update('resourceName', event.target.value)}><option value="">{zh ? '全部' : 'All'}</option>{resources.map((name) => <option key={name}>{name}</option>)}</select></label>
      {([['hasNegotiationDate', zh ? '有協商日' : 'Has negotiation date'], ['hasDisputeContent', zh ? '有爭議內容' : 'Has dispute content'], ['yearMismatch', zh ? '年度不一致' : 'Year mismatch']] as const).map(([key, title]) => <label key={key}>{title}<select value={filters[key]} onChange={(event) => update(key, event.target.value)}><option value="">{zh ? '全部' : 'All'}</option><option value="yes">{zh ? '是' : 'Yes'}</option><option value="no">{zh ? '否' : 'No'}</option></select></label>)}
    </div>
    <p className="notice subtle">{noMap(zh)}</p>
    {Object.values(filters).some(Boolean) && <button className="text-button" onClick={() => setFilters(emptyFilters)}>{zh ? '清除篩選' : 'Clear filters'}</button>}
    <span className="sr-only">{records.length}</span>
  </aside>;
}

function Overview({ summary, language }: { summary: ConsumerDisputeAbsentBusinessOperatorSummary; language: Language }) {
  const zh = language === 'zh', topRespondent = summary.byRespondent[0], topCategory = summary.byKeywordCategory[0]?.disputeKeywordCategory;
  const cards = [
    [zh ? '公告紀錄數' : 'Notice record count', summary.totalRecords],
    [zh ? '年度範圍' : 'Year range', summary.minYear && summary.maxYear ? `${summary.minYear} – ${summary.maxYear}` : '—'],
    [zh ? '最新年度' : 'Latest year', summary.maxYear ?? '—'],
    [zh ? '不重複被申訴人數' : 'Unique respondent count', summary.uniqueRespondentNameCount],
    [zh ? '不重複申訴人數' : 'Unique complainant count', summary.uniqueComplainantNameCount],
    [zh ? '有協商日紀錄' : 'Records with negotiation date', summary.recordsWithNegotiationDate],
    [zh ? '有爭議內容紀錄' : 'Records with dispute content', summary.recordsWithDisputeContent],
    [zh ? '年度不一致紀錄' : 'Records with year mismatch', summary.recordsWithYearMismatch],
    [zh ? '紀錄最多被申訴人' : 'Top respondent by record count', topRespondent ? `${topRespondent.respondentName} (${topRespondent.recordCount})` : '—'],
    [zh ? '最多爭議關鍵類別' : 'Top dispute keyword category', topCategory ? label(topCategory, language) : '—'],
  ];
  return <><div className="summary-grid">{cards.map(([title, value]) => <article key={title}><span>{title}</span><strong>{typeof value === 'number' ? value.toLocaleString() : value}</strong></article>)}</div>
    <div className="chart-grid"><Bar title={zh ? '各年度公告紀錄數' : 'Notice record count by year'} rows={summary.byYear.map((item) => ({ label: String(item.year), count: item.recordCount }))} /><Bar title={zh ? '爭議關鍵類別分布' : 'Dispute keyword category distribution'} rows={summary.byKeywordCategory.map((item) => ({ label: label(item.disputeKeywordCategory, language), count: item.count }))} /></div></>;
}

function Directory({ records, language }: { records: ConsumerDisputeAbsentBusinessOperatorRecord[]; language: Language }) {
  const zh = language === 'zh';
  const [limit, setLimit] = useState(80);
  useEffect(() => setLimit(80), [records]);
  return <><div className="comparison-scroll procurement-table"><table><thead><tr>{(zh ? ['年度', '被申訴人', '協商日', '爭議內容', '來源', '明細'] : ['Year', 'Respondent', 'Negotiation date', 'Dispute content', 'Source', 'Details']).map((item) => <th key={item}>{item}</th>)}</tr></thead><tbody>{records.slice(0, limit).map((record) => <tr key={record.id}><td>{record.year ?? record.yearRaw ?? '—'}</td><th>{record.respondentName}</th><td>{record.negotiationDate ?? record.negotiationDateRaw ?? '—'}</td><td>{record.disputeContent ?? '—'}</td><td>{record.resourceName ?? record.source}</td><td><details><summary>{zh ? '查看' : 'View'}</summary><p>{zh ? '申訴人' : 'Complainant'}: {record.complainantName ?? '—'}<br />{zh ? '協商月份' : 'Negotiation month'}: {record.negotiationMonthKey ?? '—'}<br />{zh ? '協商季度' : 'Negotiation quarter'}: {record.negotiationQuarter ?? '—'}<br />{zh ? '關鍵類別' : 'Keyword categories'}: {record.disputeKeywordCategories.map((category) => label(category, language)).join('；')}<br />{zh ? '年度不一致' : 'Year mismatch'}: {record.yearMismatch ? (zh ? '是' : 'Yes') : (zh ? '否' : 'No')}<br />{record.source} / {record.sourceAgency}<br />{notice(zh)}</p></details></td></tr>)}</tbody></table></div>{!records.length && <p className="empty">{zh ? '沒有符合條件的紀錄。' : 'No records match these filters.'}</p>}{limit < records.length && <button className="load-more" onClick={() => setLimit(limit + 80)}>{zh ? '載入更多' : 'Load more'} · {records.length - limit}</button>}</>;
}

export default function ConsumerDisputeAbsentBusinessOperatorsModule({ records, summary, language, related }: { records: ConsumerDisputeAbsentBusinessOperatorRecord[]; summary: ConsumerDisputeAbsentBusinessOperatorSummary; language: Language; related?: { laborViolations?: number; businessChanges?: number; companyChanges?: number; publicLiability?: number } }) {
  const zh = language === 'zh';
  const [view, setView] = useState<'overview' | 'trends' | 'respondents' | 'content' | 'directory' | 'relationship' | 'notes'>('overview');
  const [filters, setFilters] = useState(emptyFilters);
  const filtered = useMemo(() => filterConsumerDisputeAbsentBusinessOperators(records, filters), [records, filters]);
  const active = useMemo(() => Object.values(filters).some(Boolean) ? buildConsumerDisputeAbsentBusinessOperatorSummary(filtered) : summary, [filtered, filters, summary]);
  const views = [['overview', zh ? '總覽' : 'Overview'], ['trends', zh ? '年度趨勢' : 'Yearly Trends'], ['respondents', zh ? '被申訴人' : 'Respondents'], ['content', zh ? '爭議內容' : 'Dispute Content'], ['directory', zh ? '公告清冊' : 'Notice Directory'], ['relationship', zh ? '與公司登記資料關係' : 'Relationship with Company Records'], ['notes', zh ? '資料說明' : 'Data Notes']] as const;
  return <><Filters records={records} summary={summary} filters={filters} setFilters={setFilters} language={language} /><section className="workspace"><div className="section-heading"><p>07 / CONSUMER PROTECTION & LEGAL PUBLIC RECORDS</p><h2>{zh ? '消費爭議無故不到場協商之被申訴企業經營者' : 'Consumer Dispute Absent Business Operators'}</h2><span>{zh ? '整理臺北市依消費者保護自治條例公告之消費爭議協商無故不到場被申訴企業經營者公開資料，包含年度、被申訴人、申訴人、協商日與爭議內容。' : 'Explore Taipei public notices of respondent business operators absent from consumer-dispute negotiation without cause, including year, respondent, complainant, negotiation date, and dispute content.'}</span></div>
    <div className="subtabs">{views.map(([id, title]) => <button className={view === id ? 'active' : ''} onClick={() => setView(id)} key={id}>{title}</button>)}</div><div className="notice subtle">{notice(zh)}</div><div className="section-heading inline"><div /><strong>{filtered.length.toLocaleString()} <span>{zh ? '筆符合紀錄' : 'matching records'}</span></strong></div>
    {view === 'overview' && <Overview summary={active} language={language} />}
    {view === 'trends' && <div className="chart-grid"><Bar title={zh ? '各年度公告紀錄數' : 'Notice record count by year'} rows={active.byYear.map((item) => ({ label: String(item.year), count: item.recordCount }))} /><Bar title={zh ? '各月協商公告紀錄數' : 'Notice record count by negotiation month'} rows={active.byNegotiationMonth.map((item) => ({ label: item.negotiationMonthKey, count: item.recordCount }))} /><Bar title={zh ? '各年度不重複被申訴人數' : 'Unique respondent count by year'} rows={active.byYear.map((item) => ({ label: String(item.year), count: item.uniqueRespondentNameCount }))} /><Bar title={zh ? '來源檔案分布' : 'Source resource breakdown'} rows={active.resourceBreakdown.map((item) => ({ label: item.resourceName, count: item.recordCount }))} /></div>}
    {view === 'respondents' && <Bar title={zh ? '紀錄最多被申訴人' : 'Top respondents by record count'} rows={active.byRespondent.map((item) => ({ label: item.respondentName, count: item.recordCount }))} />}
    {view === 'content' && <div className="chart-grid"><Bar title={zh ? '爭議關鍵類別分布' : 'Dispute keyword category distribution'} rows={active.byKeywordCategory.map((item) => ({ label: label(item.disputeKeywordCategory, language), count: item.count }))} /><Bar title={zh ? '常見爭議關鍵字' : 'Top dispute keywords'} rows={active.topDisputeKeywords.map((item) => ({ label: item.keyword, count: item.count }))} /><Bar title={zh ? '有無協商日紀錄' : 'Records with / without negotiation date'} rows={[{ label: zh ? '有協商日' : 'With negotiation date', count: active.recordsWithNegotiationDate }, { label: zh ? '無協商日' : 'Without negotiation date', count: active.totalRecords - active.recordsWithNegotiationDate }]} /><Bar title={zh ? '年度不一致紀錄數' : 'Year mismatch count'} rows={[{ label: zh ? '一致' : 'Consistent', count: active.totalRecords - active.recordsWithYearMismatch }, { label: zh ? '不一致' : 'Mismatch', count: active.recordsWithYearMismatch }]} /></div>}
    {view === 'directory' && <Directory records={filtered} language={language} />}
    {view === 'relationship' && <div className="notes-grid"><article><h3>{zh ? '與公司/商業登記資料不同' : 'Different from company/business registration records'}</h3><p>{zh ? '消費爭議不到場公告與公司或商業登記異動資料性質不同。被申訴人名稱與登記資料名稱相似時，仍需以統一編號、地址或主管機關正式資料確認是否為同一法律主體。' : 'Consumer dispute absence notices and company or business registration change records have different meanings. Similar names still require a unified business number, address, or official authority data to confirm identity.'}</p></article><article><h3>{zh ? '相關模組紀錄數' : 'Related module record counts'}</h3><p>{zh ? '僅作資料量對照，不作合併推論。' : 'Counts are only contextual and are not merged inferences.'}</p><Bar title={zh ? '相關公開資料模組' : 'Related public-record modules'} rows={[{ label: zh ? '消費爭議不到場公告' : 'Consumer dispute notices', count: summary.totalRecords }, { label: zh ? '勞基法違規公布' : 'Labor violations', count: related?.laborViolations ?? 0 }, { label: zh ? '商業異動' : 'Business changes', count: related?.businessChanges ?? 0 }, { label: zh ? '公司異動' : 'Company changes', count: related?.companyChanges ?? 0 }, { label: zh ? '公共意外險' : 'Public liability insurance', count: related?.publicLiability ?? 0 }].filter((row) => row.count)} /></article></div>}
    {view === 'notes' && <div className="notes-grid"><article><h3>{zh ? '資料內容' : 'Data contents'}</h3><p>{zh ? '資料提供臺北市依臺北市消費者保護自治條例第24條第1款公告之公開紀錄，欄位包含年度、被申訴人、申訴人、協商日與爭議內容。本網站整理為年度趨勢、被申訴人清單、爭議內容關鍵字與公告清冊。' : 'The data provides Taipei public notice records under Article 24, Subparagraph 1 of the Taipei City Consumer Protection Self-Governance Ordinance. Fields include year, respondent, complainant, negotiation date, and dispute content.'}</p></article><article><h3>{zh ? '地圖' : 'Map'}</h3><p>{noMap(zh)}</p></article><article><h3>{zh ? '解讀限制' : 'Interpretation limits'}</h3><p>{notice(zh)}</p></article><article><h3>{zh ? '資料來源' : 'Source'}</h3><p><a href="https://data.taipei/dataset/detail?id=c15e49fd-f511-46c8-8613-0ad91f370bfd" target="_blank" rel="noreferrer">{zh ? '臺北市消費爭議無故不到場協商之被申訴企業經營者列表' : 'Taipei consumer dispute absent business operator list'} ↗</a></p></article></div>}
  </section></>;
}
