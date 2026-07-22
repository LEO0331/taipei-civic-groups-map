import { useEffect, useMemo, useState } from 'react';

type Evaluation = { rocYear: number; gregorianYear: number; resultRaw: string; resultCategory: string; sourceStatus: string };
type Institution = { id: string; institutionName: string; postalCode: string; districtName: string; address: string; phone: string; hasAddress: boolean; hasPhone: boolean; evaluations: Evaluation[]; latestEvaluationYear: number | null; latestEvaluationResultRaw: string; latestEvaluationCategory: string; googleMapsQuery: string; sourceValues: Record<string, string> };
type View = 'overview' | 'results' | 'trends' | 'districts' | 'history' | 'directory' | 'quality' | 'notes';
const dash = '—';

export default function SeniorCareInstitutionEvaluationsModule({ language }: { language: 'zh' | 'en' }) {
  const zh = language === 'zh';
  const t = (chinese: string, english: string) => zh ? chinese : english;
  const [records, setRecords] = useState<Institution[]>([]);
  const [report, setReport] = useState<Record<string, unknown> | null>(null);
  const [view, setView] = useState<View>('overview');
  const [query, setQuery] = useState('');
  const [district, setDistrict] = useState('');
  const [year, setYear] = useState('');
  const [result, setResult] = useState('');
  const [institution, setInstitution] = useState('');
  const [phone, setPhone] = useState('all');
  const [address, setAddress] = useState('all');
  const [evaluated, setEvaluated] = useState('all');
  const [page, setPage] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);
  const [historySort, setHistorySort] = useState<'year' | 'institution' | 'district' | 'result'>('year');

  useEffect(() => {
    const base = import.meta.env.BASE_URL;
    Promise.all([fetch(`${base}data/senior-care-institution-evaluations/records.json`).then((response) => response.json()), fetch(`${base}data/senior-care-institution-evaluations/conversion-report.json`).then((response) => response.json())])
      .then(([loadedRecords, loadedReport]) => { setRecords(loadedRecords); setReport(loadedReport); })
      .catch(() => { setRecords([]); setReport(null); });
  }, []);

  const years = useMemo(() => [...new Set(records.flatMap((record) => record.evaluations.map((evaluation) => evaluation.gregorianYear)))].sort((a, b) => a - b), [records]);
  const options = (items: string[]) => [...new Set(items.filter(Boolean))].sort((a, b) => a.localeCompare(b, 'zh-Hant'));
  const filtered = useMemo(() => records.filter((record) => {
    const text = [record.institutionName, record.districtName, record.postalCode, record.address, record.phone, ...record.evaluations.map((evaluation) => evaluation.resultRaw)].join(' ').toLowerCase();
    const selectedYear = Number(year);
    const hasSelectedYear = !year || record.evaluations.some((evaluation) => evaluation.gregorianYear === selectedYear && evaluation.resultRaw);
    return (!query || text.includes(query.toLowerCase()))
      && (!district || record.districtName === district)
      && (!institution || record.institutionName === institution)
      && (!result || record.evaluations.some((evaluation) => evaluation.resultCategory === result))
      && (phone === 'all' || (phone === 'yes' ? record.hasPhone : !record.hasPhone))
      && (address === 'all' || (address === 'yes' ? record.hasAddress : !record.hasAddress))
      && (evaluated === 'all' || (evaluated === 'yes' ? hasSelectedYear : !hasSelectedYear));
  }), [records, query, district, institution, result, phone, address, evaluated, year]);
  const categories = options(records.flatMap((record) => record.evaluations.map((evaluation) => evaluation.resultCategory)).filter((category) => category !== 'blank'));
  const countBy = (items: Institution[], value: (record: Institution) => string) => Object.entries(items.reduce((counts, record) => { const label = value(record); if (label) counts[label] = (counts[label] ?? 0) + 1; return counts; }, {} as Record<string, number>)).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value || a.label.localeCompare(b.label));
  const byDistrict = countBy(filtered, (record) => record.districtName);
  const latestDistribution = Object.entries(filtered.reduce((counts, record) => { const label = record.latestEvaluationResultRaw || t('無評鑑結果', 'No evaluation result'); counts[label] = (counts[label] ?? 0) + 1; return counts; }, {} as Record<string, number>)).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
  const history = useMemo(() => filtered.flatMap((record) => record.evaluations.map((evaluation) => ({ record, evaluation }))).filter(({ evaluation }) => !year || evaluation.gregorianYear === Number(year)).filter(({ evaluation }) => !result || evaluation.resultCategory === result), [filtered, year, result]);
  const sortedHistory = [...history].sort((a, b) => historySort === 'institution' ? a.record.institutionName.localeCompare(b.record.institutionName, 'zh-Hant') : historySort === 'district' ? a.record.districtName.localeCompare(b.record.districtName, 'zh-Hant') : historySort === 'result' ? a.evaluation.resultRaw.localeCompare(b.evaluation.resultRaw, 'zh-Hant') : b.evaluation.gregorianYear - a.evaluation.gregorianYear);
  const cards = {
    total: filtered.length,
    districts: byDistrict.length,
    evaluated: filtered.filter((record) => record.evaluations.some((evaluation) => evaluation.resultRaw)).length,
    latestYear: years.at(-1) ?? dash,
    latestYearEvaluated: filtered.filter((record) => record.evaluations.some((evaluation) => evaluation.gregorianYear === years.at(-1) && evaluation.resultRaw)).length,
    phone: filtered.filter((record) => record.hasPhone).length,
    address: filtered.filter((record) => record.hasAddress).length,
    common: latestDistribution[0]?.label ?? dash,
  };
  const pageCount = Math.max(1, Math.ceil(filtered.length / 20));
  const visibleRecords = filtered.slice((page - 1) * 20, page * 20);
  const historyPageCount = Math.max(1, Math.ceil(sortedHistory.length / 25));
  const visibleHistory = sortedHistory.slice((historyPage - 1) * 25, historyPage * 25);
  const resetPage = (update: () => void) => { update(); setPage(1); setHistoryPage(1); };
  const csv = () => {
    const header = ['Institution', 'District', 'Postal code', 'Address', 'Phone', 'Latest year in dataset', 'Latest result in dataset', ...years.map(String)];
    const rows = filtered.map((record) => [record.institutionName, record.districtName, record.postalCode, record.address, record.phone, record.latestEvaluationYear ?? '', record.latestEvaluationResultRaw, ...years.map((value) => record.evaluations.find((evaluation) => evaluation.gregorianYear === value)?.resultRaw ?? '')]);
    const content = [header, ...rows].map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob(['\uFEFF', content], { type: 'text/csv;charset=utf-8' })); const link = document.createElement('a'); link.href = url; link.download = 'senior-welfare-institution-evaluations-filtered.csv'; link.click(); URL.revokeObjectURL(url);
  };
  const chart = (title: string, data: Array<{ label: string; value: number }>) => <section className="chart"><h3>{title}</h3><div className="bars">{data.map((item) => <div className="bar-row" key={item.label}><span>{item.label}</span><b>{item.value}</b></div>)}</div></section>;
  const mapLink = (record: Institution) => record.googleMapsQuery ? <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(record.googleMapsQuery)}`} target="_blank" rel="noreferrer">{t('地圖查詢', 'Map lookup')}</a> : dash;

  return <section className="workspace">
    <div className="section-heading"><p>SOCIAL WELFARE / SENIOR INSTITUTIONS</p><h2>{t('老人安養暨長期照顧機構評鑑', 'Senior Welfare Institution Evaluations')}</h2><span>{t('依公開來源呈現特定年度的歷史評鑑結果；不代表目前評等。', 'Historical results in specified dataset years; not a current institutional rating.')}</span></div>
    <div className="notice subtle">{t('最新結果是資料集內最近一筆非空白的歷史結果，並非機構目前評鑑、營運、服務品質、收住資格或床位資訊。請向機構或臺北市政府社會局確認最新資訊。', 'The latest result is the most recent nonblank historical result in this dataset, not a current evaluation, operating, quality, admission, or capacity claim. Confirm current information with the institution or Taipei City Department of Social Welfare.')}</div>
    <div className="subtabs">{([['overview', '總覽', 'Overview'], ['results', '評鑑結果', 'Evaluation Results'], ['trends', '評鑑趨勢', 'Evaluation Trends'], ['districts', '行政區分布', 'District Distribution'], ['history', '機構歷程', 'Institution History'], ['directory', '機構名錄', 'Institution Directory'], ['quality', '資料品質', 'Data Quality'], ['notes', '資料說明', 'Data Notes']] as const).map(([id, chinese, english]) => <button key={id} className={view === id ? 'active' : ''} onClick={() => { setView(id); setPage(1); setHistoryPage(1); }}>{t(chinese, english)}</button>)}</div>
    <aside className="filters"><input value={query} onChange={(event) => resetPage(() => setQuery(event.target.value))} placeholder={t('搜尋機構、行政區、郵遞區號、地址、電話或評鑑結果', 'Search institution, district, postal code, address, phone, or result')} /><select value={district} onChange={(event) => resetPage(() => setDistrict(event.target.value))}><option value="">{t('全部行政區', 'All districts')}</option>{options(records.map((record) => record.districtName)).map((value) => <option key={value}>{value}</option>)}</select><select value={year} onChange={(event) => resetPage(() => setYear(event.target.value))}><option value="">{t('全部評鑑年度', 'All evaluation years')}</option>{years.map((value) => <option key={value} value={value}>{value} ({value - 1911})</option>)}</select><select value={result} onChange={(event) => resetPage(() => setResult(event.target.value))}><option value="">{t('全部評鑑結果', 'All evaluation results')}</option>{categories.map((value) => <option key={value}>{value}</option>)}</select><select value={institution} onChange={(event) => resetPage(() => setInstitution(event.target.value))}><option value="">{t('全部機構', 'All institutions')}</option>{options(records.map((record) => record.institutionName)).map((value) => <option key={value}>{value}</option>)}</select><select value={phone} onChange={(event) => resetPage(() => setPhone(event.target.value))}><option value="all">{t('全部電話紀錄', 'All phone records')}</option><option value="yes">{t('有電話', 'With phone')}</option><option value="no">{t('無電話', 'Without phone')}</option></select><select value={address} onChange={(event) => resetPage(() => setAddress(event.target.value))}><option value="all">{t('全部地址紀錄', 'All address records')}</option><option value="yes">{t('有地址', 'With address')}</option><option value="no">{t('無地址', 'Without address')}</option></select><select value={evaluated} onChange={(event) => resetPage(() => setEvaluated(event.target.value))}><option value="all">{t('全部評鑑狀態', 'All evaluation states')}</option><option value="yes">{t('所選年度有評鑑', 'Evaluated in selected year')}</option><option value="no">{t('所選年度無評鑑', 'Not evaluated in selected year')}</option></select></aside>
    {view === 'overview' && <><div className="summary-grid">{[[t('機構總數', 'Total institutions'), cards.total], [t('涵蓋行政區', 'Districts covered'), cards.districts], [t('評鑑年度', 'Evaluation years'), years.length], [t('至少一筆評鑑', 'With an evaluation'), cards.evaluated], [t('最新年度受評', 'Evaluated in latest dataset year'), cards.latestYearEvaluated], [t('有電話', 'With phone'), cards.phone], [t('有地址', 'With address'), cards.address], [t('常見最新結果', 'Most common latest result'), cards.common]].map(([label, value]) => <article key={String(label)}><span>{label}</span><strong>{value}</strong></article>)}</div>{chart(t('機構行政區分布', 'Institutions by district'), byDistrict)}</>}
    {view === 'results' && <>{chart(t('資料集內最新結果分布', 'Latest result in dataset distribution'), latestDistribution)}{chart(t('有無評鑑歷程', 'Records with and without evaluation history'), [{ label: t('有評鑑結果', 'With results'), value: cards.evaluated }, { label: t('無評鑑結果', 'Without results'), value: cards.total - cards.evaluated }])}</>}
    {view === 'trends' && <>{chart(t('各年度受評機構數', 'Institutions evaluated by year'), years.map((value) => ({ label: `${value} (${value - 1911})`, value: filtered.filter((record) => record.evaluations.some((evaluation) => evaluation.gregorianYear === value && evaluation.resultRaw)).length })))}{chart(t('各年度評鑑結果分布', 'Result distribution by year'), years.flatMap((value) => categories.map((category) => ({ label: `${value} / ${category}`, value: filtered.filter((record) => record.evaluations.some((evaluation) => evaluation.gregorianYear === value && evaluation.resultCategory === category)).length }))).filter((item) => item.value))}</>}
    {view === 'districts' && <>{chart(t('機構行政區分布', 'Institutions by district'), byDistrict)}{chart(t('最新結果依行政區', 'Latest result categories by district'), byDistrict.flatMap(({ label }) => categories.map((category) => ({ label: `${label} / ${category}`, value: filtered.filter((record) => record.districtName === label && record.latestEvaluationCategory === category && record.latestEvaluationResultRaw).length }))).filter((item) => item.value))}</>}
    {view === 'history' && <><div className="section-heading inline"><strong>{history.length} {t('筆年度紀錄', 'annual records')}</strong><label>{t('排序', 'Sort')}<select value={historySort} onChange={(event) => { setHistorySort(event.target.value as typeof historySort); setHistoryPage(1); }}><option value="year">{t('評鑑年度', 'Evaluation year')}</option><option value="institution">{t('機構', 'Institution')}</option><option value="district">{t('行政區', 'District')}</option><option value="result">{t('結果', 'Result')}</option></select></label></div><div className="comparison-scroll procurement-table"><table><thead><tr>{[t('評鑑年度', 'Evaluation year'), t('民國年度', 'ROC year'), t('機構', 'Institution'), t('行政區', 'District'), t('評鑑結果', 'Evaluation result'), t('來源狀態', 'Source status')].map((label) => <th key={label}>{label}</th>)}</tr></thead><tbody>{visibleHistory.map(({ record, evaluation }) => <tr key={`${record.id}-${evaluation.rocYear}`}><td>{evaluation.gregorianYear}</td><td>{evaluation.rocYear}</td><th>{record.institutionName || dash}</th><td>{record.districtName || dash}</td><td>{evaluation.resultRaw || dash}</td><td>{evaluation.sourceStatus === 'recorded' ? t('來源已記錄', 'Recorded') : t('來源空白', 'Source blank')}</td></tr>)}</tbody></table></div><div className="pagination"><button disabled={historyPage <= 1} onClick={() => setHistoryPage(historyPage - 1)}>{t('上一頁', 'Previous')}</button><span>{historyPage} / {historyPageCount}</span><button disabled={historyPage >= historyPageCount} onClick={() => setHistoryPage(historyPage + 1)}>{t('下一頁', 'Next')}</button></div></>}
    {view === 'directory' && <><div className="section-heading inline"><strong>{filtered.length} {t('筆機構紀錄', 'institution records')}</strong><button onClick={csv}>{t('下載篩選結果 CSV', 'Download filtered CSV')}</button></div><div className="comparison-scroll procurement-table"><table><thead><tr>{[t('機構', 'Institution'), t('行政區', 'District'), t('郵遞區號', 'Postal code'), t('地址', 'Address'), t('電話', 'Phone'), t('資料集內最新評鑑年度', 'Latest evaluation year in dataset'), t('資料集內最新結果', 'Latest result in dataset'), t('評鑑歷程', 'Evaluation history'), t('地圖查詢', 'Map lookup')].map((label) => <th key={label}>{label}</th>)}</tr></thead><tbody>{visibleRecords.map((record) => <tr key={record.id}><th>{record.institutionName || dash}</th><td>{record.districtName || dash}</td><td>{record.postalCode || dash}</td><td>{record.address || dash}</td><td>{record.phone || dash}</td><td>{record.latestEvaluationYear ?? dash}</td><td>{record.latestEvaluationResultRaw || dash}</td><td><details><summary>{record.evaluations.filter((evaluation) => evaluation.resultRaw).length} {t('筆結果', 'results')}</summary><table><tbody>{record.evaluations.map((evaluation) => <tr key={evaluation.rocYear}><td>{evaluation.gregorianYear} ({evaluation.rocYear})</td><td>{evaluation.resultRaw || t('來源空白', 'Source blank')}</td></tr>)}</tbody></table><small>{t('地址為來源提供之機構聯絡資訊。', 'Address is source-provided institution contact information.')}</small></details></td><td>{mapLink(record)}</td></tr>)}</tbody></table></div><div className="pagination"><button disabled={page <= 1} onClick={() => setPage(page - 1)}>{t('上一頁', 'Previous')}</button><span>{page} / {pageCount}</span><button disabled={page >= pageCount} onClick={() => setPage(page + 1)}>{t('下一頁', 'Next')}</button></div></>}
    {view === 'quality' && <div className="notes-grid"><article><h3>{t('資料品質', 'Data quality')}</h3><p>{t('空白年度欄位保留為來源空白，不會解讀為未通過或零分。', 'Blank annual fields remain source blanks and are not interpreted as failures or zeros.')}</p><ul>{[['duplicateRows', '重複來源列', 'Duplicate source rows'], ['missingInstitutionNames', '缺少機構名稱', 'Missing institution names'], ['missingAddresses', '缺少地址', 'Missing addresses'], ['invalidPostalCodes', '無效郵遞區號', 'Invalid postal codes'], ['malformedPhones', '格式異常電話', 'Malformed phones'], ['unresolvedDistricts', '未解析行政區', 'Unresolved districts'], ['noEvaluationResults', '無評鑑結果機構', 'Records without evaluation results'], ['conflictingResults', '同年度衝突結果', 'Conflicting same-year results']].map(([key, chinese, english]) => <li key={key}>{t(chinese, english)}: {Array.isArray(report?.[key]) ? report?.[key].length : 0}</li>)}</ul></article></div>}
    {view === 'notes' && <div className="notes-grid"><article><h3>{t('資料說明', 'Data notes')}</h3><p>{t('本資料為特定年度的老人福利機構歷史評鑑紀錄。評鑑制度、分類與標準可能因年度而異，不應自動視為可直接比較，也不應作為機構排名、品質、安全或推薦依據。', 'This dataset records historical evaluations in specified years. Systems, labels, and standards may differ by year and must not automatically be treated as directly comparable, rankings, quality scores, safety assessments, or recommendations.')}</p><p>{t('資料不確認目前營運、立案、評鑑、床位、收住資格、費用、人力、照護品質、醫療能力或安全狀態。', 'It does not confirm current operation, licensing, evaluation status, capacity, admission eligibility, fees, staffing, care quality, medical capability, or safety status.')}</p></article></div>}
  </section>;
}
