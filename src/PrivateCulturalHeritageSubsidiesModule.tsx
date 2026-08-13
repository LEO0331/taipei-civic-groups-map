import { useEffect, useMemo, useState } from 'react';
import {
  formatTwd,
  type PrivateCulturalHeritageSubsidyRecord,
  type ProjectCategory,
} from './lib/privateCulturalHeritageSubsidies';

type Language = 'zh' | 'en';
type View = 'overview' | 'trends' | 'assets' | 'projects' | 'geography' | 'directory' | 'quality' | 'notes';

const DATA_ROOT = `${import.meta.env.BASE_URL}data/private-cultural-heritage-subsidies`;

const categoryLabels: Record<ProjectCategory, { zh: string; en: string }> = {
  restoration: { zh: '修復／整修', en: 'Restoration' },
  planning_design: { zh: '規劃／設計／監造', en: 'Planning, design or supervision' },
  survey_research: { zh: '調查／研究／測繪', en: 'Survey, research or documentation' },
  emergency_repair: { zh: '緊急修復／搶修', en: 'Emergency repair' },
  routine_maintenance: { zh: '維護／保養', en: 'Routine maintenance' },
  disaster_prevention: { zh: '防災／耐震／消防', en: 'Disaster prevention' },
  management_maintenance: { zh: '管理／維護計畫', en: 'Management or maintenance plan' },
  other: { zh: '其他／未分類', en: 'Other / unclassified' },
};

const viewLabels: Record<View, { zh: string; en: string }> = {
  overview: { zh: '總覽', en: 'Overview' },
  trends: { zh: '補助趨勢', en: 'Subsidy Trends' },
  assets: { zh: '文化資產', en: 'Heritage Assets' },
  projects: { zh: '補助項目', en: 'Subsidy Projects' },
  geography: { zh: '行政區分布', en: 'Geographic Distribution' },
  directory: { zh: '案件名冊', en: 'Case Directory' },
  quality: { zh: '資料品質', en: 'Data Quality' },
  notes: { zh: '資料說明', en: 'Data Notes' },
};

const median = (values: number[]) => {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
};

const csvCell = (value: string | number | null | undefined) => `"${String(value ?? '').replaceAll('"', '""')}"`;

export default function PrivateCulturalHeritageSubsidiesModule({ language }: { language: Language }) {
  const [records, setRecords] = useState<PrivateCulturalHeritageSubsidyRecord[]>([]);
  const [report, setReport] = useState<Record<string, unknown> | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [view, setView] = useState<View>('overview');
  const [query, setQuery] = useState('');
  const [area, setArea] = useState('');
  const [category, setCategory] = useState<ProjectCategory | ''>('');
  const [amountState, setAmountState] = useState<'all' | 'valid' | 'missing'>('all');
  const [repeatState, setRepeatState] = useState<'all' | 'repeated'>('all');
  const [sort, setSort] = useState<'year-desc' | 'amount-desc' | 'asset'>('year-desc');
  const [page, setPage] = useState(1);

  useEffect(() => {
    Promise.all([
      fetch(`${DATA_ROOT}/records.json`).then((response) => response.ok ? response.json() : Promise.reject(response)),
      fetch(`${DATA_ROOT}/conversion-report.json`).then((response) => response.ok ? response.json() : null),
    ]).then(([nextRecords, nextReport]) => {
      setRecords(nextRecords);
      setReport(nextReport);
    }).catch(() => setLoadError(true));
  }, []);

  const text = (zh: string, en: string) => language === 'zh' ? zh : en;
  const areas = useMemo(() => [...new Set(records.map((record) => record.areaName).filter(Boolean))].sort(), [records]);
  const assetCounts = useMemo(() => new Map(records.map((record) => [record.heritageAssetName, 0])), [records]);
  records.forEach((record) => assetCounts.set(record.heritageAssetName, (assetCounts.get(record.heritageAssetName) ?? 0) + 1));

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return records.filter((record) => {
      const matchesQuery = !normalizedQuery || [record.heritageAssetName, record.approvedProjectRaw, record.areaRaw]
        .some((value) => value.toLocaleLowerCase().includes(normalizedQuery));
      return matchesQuery
        && (!area || record.areaName === area)
        && (!category || record.approvedProjectCategories.includes(category))
        && (amountState === 'all' || (amountState === 'valid' ? record.hasValidAmount : !record.hasValidAmount))
        && (repeatState === 'all' || (assetCounts.get(record.heritageAssetName) ?? 0) > 1);
    });
  }, [records, query, area, category, amountState, repeatState, assetCounts]);

  useEffect(() => setPage(1), [query, area, category, amountState, repeatState, sort]);

  const validAmounts = filtered.flatMap((record) => record.approvedSubsidyTwd === null ? [] : [record.approvedSubsidyTwd]);
  const totalAmount = validAmounts.reduce((total, amount) => total + amount, 0);
  const validYears = filtered.flatMap((record) => record.gregorianYear === null ? [] : [record.gregorianYear]);
  const repeatedAssets = [...assetCounts.values()].filter((count) => count > 1).length;

  const grouped = <T extends string>(key: (record: PrivateCulturalHeritageSubsidyRecord) => T) => {
    const values = new Map<T, PrivateCulturalHeritageSubsidyRecord[]>();
    filtered.forEach((record) => {
      const groupKey = key(record);
      values.set(groupKey, [...(values.get(groupKey) ?? []), record]);
    });
    return [...values.entries()].map(([name, groupRecords]) => ({
      name,
      cases: groupRecords.length,
      amount: groupRecords.reduce((sum, record) => sum + (record.approvedSubsidyTwd ?? 0), 0),
      median: median(groupRecords.flatMap((record) => record.approvedSubsidyTwd === null ? [] : [record.approvedSubsidyTwd])),
    }));
  };

  const byYear = grouped((record) => record.gregorianYear?.toString() ?? text('未能判讀年度', 'Unparsed year')).sort((a, b) => a.name.localeCompare(b.name));
  const byAsset = grouped((record) => record.heritageAssetName || text('未填資產名稱', 'Missing asset name')).sort((a, b) => b.amount - a.amount || b.cases - a.cases);
  const byArea = grouped((record) => record.areaName || text('未填區域', 'Missing area')).sort((a, b) => b.amount - a.amount || b.cases - a.cases);
  const byCategory = (Object.keys(categoryLabels) as ProjectCategory[]).map((key) => {
    const groupRecords = filtered.filter((record) => record.approvedProjectCategories.includes(key));
    return { key, cases: groupRecords.length, amount: groupRecords.reduce((sum, record) => sum + (record.approvedSubsidyTwd ?? 0), 0) };
  }).filter((row) => row.cases > 0).sort((a, b) => b.amount - a.amount || b.cases - a.cases);
  const topAmount = Math.max(1, ...byYear.map((row) => row.amount), ...byAsset.map((row) => row.amount), ...byArea.map((row) => row.amount), ...byCategory.map((row) => row.amount));

  const sortedRows = [...filtered].sort((a, b) => {
    if (sort === 'amount-desc') return (b.approvedSubsidyTwd ?? -1) - (a.approvedSubsidyTwd ?? -1);
    if (sort === 'asset') return a.heritageAssetName.localeCompare(b.heritageAssetName, 'zh-Hant');
    return (b.gregorianYear ?? -1) - (a.gregorianYear ?? -1) || b.yearRaw.localeCompare(a.yearRaw);
  });
  const pageSize = 25;
  const pageCount = Math.max(1, Math.ceil(sortedRows.length / pageSize));
  const pageRows = sortedRows.slice((page - 1) * pageSize, page * pageSize);

  const exportCsv = () => {
    const headers = ['年度', '區域', '私有資產名稱', '同意補助項目', '核定補助經費', '換算西元年度', '補助項目分類', '可能名錄對應'];
    const csv = [headers, ...filtered.map((record) => [
      record.sourceValues['年度'], record.sourceValues['區域'], record.sourceValues['私有資產名稱'], record.sourceValues['同意補助項目'], record.sourceValues['核定補助經費'],
      record.gregorianYear, record.approvedProjectCategories.map((value) => categoryLabels[value].zh).join('；'), record.possibleHeritageRegistryMatch ? '可能' : '',
    ])].map((row) => row.map(csvCell).join(',')).join('\n');
    const anchor = document.createElement('a');
    anchor.href = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' }));
    anchor.download = 'taipei-private-cultural-heritage-subsidies.csv';
    anchor.click();
    URL.revokeObjectURL(anchor.href);
  };

  if (loadError) return <section className="module-panel"><h2>{text('私有文化資產補助案', 'Private Cultural Heritage Subsidies')}</h2><p>{text('本機資料檔目前無法載入。請先執行資料轉換指令。', 'The local dataset could not be loaded. Run the data conversion command first.')}</p></section>;

  return <section className="module-panel generated-module">
    <p className="eyebrow">{text('公開資料名冊', 'PUBLIC DATA RECORDS')}</p>
    <h1>{text('私有文化資產補助案', 'Private Cultural Heritage Subsidies')}</h1>
    <p className="module-intro">{text('依臺北市政府文化局公開資料，瀏覽私有文化資產之同意補助案件、補助項目與核定補助經費。', 'Browse approved subsidy cases, project descriptions and approved subsidy amounts for private cultural heritage assets from Taipei City’s open data.')}</p>
    <p className="muted">{text('文化資產脈絡：可搭配「臺北市文化資產」名錄檢視。標示為可能名錄對應者，僅代表名稱與行政區完全一致的保守比對，並非官方關聯。', 'Cultural-heritage context: use alongside the Taipei Cultural Heritage Assets registry. A possible registry match is only a conservative exact name-and-area comparison, not an official relationship.')}</p>

    <div className="subtabs" role="tablist" aria-label={text('資料檢視', 'Data views')}>
      {(Object.keys(viewLabels) as View[]).map((item) => <button key={item} type="button" className={view === item ? 'active' : ''} onClick={() => setView(item)} role="tab" aria-selected={view === item}>{viewLabels[item][language]}</button>)}
    </div>

    <div className="filters filter-grid">
      <label>{text('搜尋資產、項目或區域', 'Search asset, project or area')}<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={text('輸入關鍵字', 'Enter keywords')} /></label>
      <label>{text('區域', 'Area')}<select value={area} onChange={(event) => setArea(event.target.value)}><option value="">{text('全部', 'All')}</option>{areas.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
      <label>{text('補助項目分類', 'Project category')}<select value={category} onChange={(event) => setCategory(event.target.value as ProjectCategory | '')}><option value="">{text('全部', 'All')}</option>{(Object.keys(categoryLabels) as ProjectCategory[]).map((item) => <option key={item} value={item}>{categoryLabels[item][language]}</option>)}</select></label>
      <label>{text('核定經費', 'Approved amount')}<select value={amountState} onChange={(event) => setAmountState(event.target.value as 'all' | 'valid' | 'missing')}><option value="all">{text('全部', 'All')}</option><option value="valid">{text('可判讀金額', 'Parsed amount')}</option><option value="missing">{text('未能判讀金額', 'Unparsed amount')}</option></select></label>
      <label>{text('案件重複資產', 'Repeated asset cases')}<select value={repeatState} onChange={(event) => setRepeatState(event.target.value as 'all' | 'repeated')}><option value="all">{text('全部', 'All')}</option><option value="repeated">{text('僅重複出現資產', 'Repeated assets only')}</option></select></label>
      <button type="button" className="button-secondary" onClick={exportCsv}>{text('匯出目前篩選 CSV', 'Export filtered CSV')}</button>
    </div>

    <div className="summary-grid">
      <article><span>{text('案件筆數', 'Cases')}</span><strong>{filtered.length.toLocaleString()}</strong></article>
      <article><span>{text('可加總核定補助', 'Parsed approved subsidy')}</span><strong>{formatTwd(totalAmount, language)}</strong></article>
      <article><span>{text('可判讀金額案件', 'Cases with parsed amount')}</span><strong>{validAmounts.length.toLocaleString()}</strong></article>
      <article><span>{text('補助中位數', 'Median subsidy')}</span><strong>{formatTwd(median(validAmounts), language)}</strong></article>
      <article><span>{text('涵蓋西元年度', 'Parsed Gregorian years')}</span><strong>{validYears.length ? `${Math.min(...validYears)}–${Math.max(...validYears)}` : '—'}</strong></article>
      <article><span>{text('重複出現資產', 'Assets with multiple cases')}</span><strong>{repeatedAssets.toLocaleString()}</strong></article>
    </div>

    {view === 'overview' && <div className="notes-grid">
      <article><h2>{text('資料解讀', 'How to read this data')}</h2><p>{text('每筆紀錄是資料來源中的「同意補助」案件；核定補助經費不等同實際支付金額、完工狀態、目前資格或資產品質。', 'Each record is an approved subsidy case in the source. The approved amount does not establish actual payment, completion, current eligibility or asset condition.')}</p></article>
      <article><h2>{text('篩選後摘要', 'Filtered summary')}</h2><p>{text(`目前篩選包含 ${filtered.length.toLocaleString()} 筆案件；可判讀金額 ${validAmounts.length.toLocaleString()} 筆。`, `The current filters contain ${filtered.length.toLocaleString()} cases, including ${validAmounts.length.toLocaleString()} with a parsed amount.`)}</p><p>{text('趨勢圖與排名只比較本資料集內的案件，未標示為績效或優先順序。', 'Trend charts and rankings compare only records in this dataset; they do not represent performance or priority.')}</p></article>
      <article><h2>{text('快速查看', 'Quick look')}</h2><p>{text(`共有 ${byAsset.length.toLocaleString()} 個資產名稱，涉及 ${byArea.length.toLocaleString()} 個區域。`, `${byAsset.length.toLocaleString()} asset names and ${byArea.length.toLocaleString()} areas appear in the filtered data.`)}</p></article>
    </div>}

    {view === 'trends' && <BarTable title={text('依年度的案件與核定補助', 'Cases and approved subsidy by year')} rows={byYear} topAmount={topAmount} language={language} />}
    {view === 'assets' && <BarTable title={text('依文化資產名稱的案件與核定補助', 'Cases and approved subsidy by heritage asset')} rows={byAsset} topAmount={topAmount} language={language} />}
    {view === 'geography' && <BarTable title={text('依區域的案件與核定補助', 'Cases and approved subsidy by area')} rows={byArea} topAmount={topAmount} language={language} />}
    {view === 'projects' && <BarTable title={text('依補助項目分類的案件與核定補助', 'Cases and approved subsidy by project category')} rows={byCategory.map((row) => ({ ...row, name: categoryLabels[row.key][language], median: null }))} topAmount={topAmount} language={language} note={text('分類由補助項目文字中的透明關鍵字規則推得；一筆案件可能同時出現在多個分類。', 'Categories are derived by transparent project-text keyword rules. A case can appear in more than one category.')} />}

    {view === 'directory' && <div>
      <div className="directory-toolbar"><label>{text('排序', 'Sort')}<select value={sort} onChange={(event) => setSort(event.target.value as typeof sort)}><option value="year-desc">{text('年度：新到舊', 'Year: newest first')}</option><option value="amount-desc">{text('經費：高到低', 'Amount: high to low')}</option><option value="asset">{text('資產名稱', 'Asset name')}</option></select></label><span>{text(`顯示 ${sortedRows.length.toLocaleString()} 筆`, `Showing ${sortedRows.length.toLocaleString()} cases`)}</span></div>
      <div className="comparison-scroll"><table className="procurement-table"><thead><tr><th>{text('年度', 'Year')}</th><th>{text('區域', 'Area')}</th><th>{text('私有資產名稱', 'Heritage asset')}</th><th>{text('同意補助項目', 'Approved project')}</th><th>{text('核定補助經費', 'Approved subsidy')}</th><th>{text('資料細節', 'Details')}</th></tr></thead><tbody>{pageRows.map((record) => <tr key={record.id}><td>{record.gregorianYear ?? record.yearRaw}{record.gregorianYear ? <small> ({record.yearRaw})</small> : null}</td><td>{record.areaRaw || '—'}</td><td>{record.heritageAssetName || '—'}{record.possibleHeritageRegistryMatch && <small className="status-badge">{text('可能名錄對應', 'Possible registry match')}</small>}</td><td>{record.approvedProjectRaw || '—'}<small>{record.approvedProjectCategories.map((item) => categoryLabels[item][language]).join(' · ')}</small></td><td>{record.approvedSubsidyTwd === null ? record.approvedSubsidyRaw || '—' : formatTwd(record.approvedSubsidyTwd, language)}</td><td><details><summary>{text('原始欄位', 'Source fields')}</summary><dl>{Object.entries(record.sourceValues).map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{value || '—'}</dd></div>)}</dl></details></td></tr>)}</tbody></table></div>
      <div className="pagination"><button type="button" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>{text('上一頁', 'Previous')}</button><span>{page} / {pageCount}</span><button type="button" disabled={page >= pageCount} onClick={() => setPage((current) => current + 1)}>{text('下一頁', 'Next')}</button></div>
    </div>}

    {view === 'quality' && <div className="notes-grid"><article><h2>{text('轉換檢查', 'Conversion checks')}</h2><p>{text('資料轉換會保留所有原始列，並另外標記未能保守判讀的年度、金額、空白欄位與完全重複列。', 'Conversion preserves all raw rows and separately flags years or amounts that cannot be conservatively parsed, blank fields and exact duplicate rows.')}</p><p>{text(`目前轉換報告的問題計數：${String((report as { privateCulturalHeritageSubsidies?: { issueCount?: number } } | null)?.privateCulturalHeritageSubsidies?.issueCount ?? '—')}。`, `Current conversion-report issue count: ${String((report as { privateCulturalHeritageSubsidies?: { issueCount?: number } } | null)?.privateCulturalHeritageSubsidies?.issueCount ?? '—')}.`)}</p></article><article><h2>{text('重要限制', 'Important limitations')}</h2><p>{text('未做地理編碼、模糊名稱合併或跨來源金額補值。空值／未能判讀值不會被當成零。', 'No geocoding, fuzzy name merging, or cross-source amount filling is performed. Blank or unparsed values are never treated as zero.')}</p></article></div>}

    {view === 'notes' && <div className="notes-grid"><article><h2>{text('來源與更新', 'Source and updates')}</h2><p><a href="https://data.taipei/dataset/detail?id=24205a7e-278a-4e78-9033-47ec5cf74595" target="_blank" rel="noreferrer">{text('臺北市私有文化資產補助案（臺北市資料大平臺）', 'Taipei Private Cultural Heritage Subsidies (Taipei Open Data Platform)')}</a></p><p>{text('資料集涵蓋 2007-01-01 至 2026-06-30，資料平臺標示為不定期更新；本儀表板使用建置時下載的本機靜態快照。', 'The dataset coverage is 2007-01-01 to 2026-06-30 and the platform marks updates as irregular; this dashboard uses a locally generated static snapshot.')}</p></article><article><h2>{text('使用提醒', 'Use notes')}</h2><p>{text('資料提供的是行政補助紀錄，並不表示目前仍可申請、已付款、工程完成、資產狀況、使用資格或官方排名。請回到原始資料與主管機關確認個案。', 'This is an administrative subsidy record, not evidence of current availability, payment, completion, asset condition, eligibility or an official ranking. Confirm individual cases with the source and responsible agency.')}</p></article></div>}
  </section>;
}

function BarTable({ title, rows, topAmount, language, note }: { title: string; rows: Array<{ name: string; cases: number; amount: number; median: number | null }>; topAmount: number; language: Language; note?: string }) {
  return <section className="chart"><h2>{title}</h2>{note && <p className="muted">{note}</p>}<div className="comparison-scroll"><table className="procurement-table"><thead><tr><th>{language === 'zh' ? '項目' : 'Item'}</th><th>{language === 'zh' ? '案件' : 'Cases'}</th><th>{language === 'zh' ? '核定補助' : 'Approved subsidy'}</th><th>{language === 'zh' ? '金額中位數' : 'Median amount'}</th><th>{language === 'zh' ? '相對金額' : 'Relative amount'}</th></tr></thead><tbody>{rows.map((row) => <tr key={row.name}><td>{row.name}</td><td>{row.cases.toLocaleString()}</td><td>{formatTwd(row.amount, language)}</td><td>{formatTwd(row.median, language)}</td><td><span className="bar-track"><span className="bar-fill" style={{ width: `${Math.max(0, Math.min(100, row.amount / topAmount * 100))}%` }} /></span></td></tr>)}</tbody></table></div></section>;
}
