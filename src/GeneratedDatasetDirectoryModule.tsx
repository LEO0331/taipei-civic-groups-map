import { useMemo, useState } from 'react';

type RecordValue = string | number | boolean | null | undefined | Record<string, unknown> | unknown[];
type DatasetRecord = Record<string, RecordValue>;
type View = 'overview' | 'districts' | 'directory' | 'quality' | 'notes';

const zhTitles: Record<string, string> = {
  'General Western Medicine Institutions': '西醫一般科醫療機構',
  'Rotavirus Vaccine Subsidy Providers': '輪狀病毒疫苗補助合約醫療院所',
  'Pet Registration Station Directory': '寵物登記站名冊',
  'Bottled Gas Retailer Directory': '桶裝瓦斯零售商名冊',
  'Social Welfare Foundation Directory': '社會福利基金會名冊',
  'Schoolchild Dental Preventive Care Providers': '學童牙齒預防保健醫療院所',
  'Hospital Hemodialysis Resources': '公私立醫院血液透析資源',
  'Street Performer Venues': '街頭藝人展演場地',
  'Domestic Employment Service Agency Directory': '仲介本國人國內工作私立就業服務機構',
  'Registered Postpartum Care Institutions': '立案產後護理機構',
  'Out-of-City Funeral Service Businesses': '外縣市殯葬服務業者',
  'Hotel Hygiene Certification Records': '旅館衛生認證紀錄',
  'Kindergarten Basic Evaluation Pass Records': '公私立幼兒園基礎評鑑通過名單',
};

const zhFieldLabels: Record<string, string> = {
  id: 'ID', sourceId: '編號', sourceSequenceNumber: '序號', stationName: '寵物登記機構名稱', retailerName: '零售商名稱',
  institutionName: '機構名稱', institutionCategory: '機構類別', districtName: '行政區', districtNameFromAddress: '行政區',
  address: '地址', phone: '電話', googleMapsQuery: '地圖查詢', externalMapQuery: '地圖查詢', price16KgRaw: '16 公斤來源列價',
  price20KgRaw: '20 公斤來源列價', coordinateSystem: '座標系統', foundationName: '基金會名稱', foundationCategory: '類別',
  organizationCode: '統一編號', registrationNumber: '登記字號', establishedDateRaw: '設立日期', serviceType: '服務類型',
  venueName: '場地名稱', managingAuthority: '管理機關', openingHoursRaw: '開放時間', allowedPerformanceTypes: '可表演類型',
  applicationMethod: '申請方式', fullPhone: '電話', licenseNumber: '許可證號', agencyName: '機構名稱', responsiblePerson: '負責人',
  licenseExpiryRaw: '許可證期限', capitalAmountRaw: '資本額', professionalPersonnelRaw: '專業人員', totalBedCount: '床位數',
  companyName: '公司名稱', sourceCityOrCounty: '縣市', companyAddress: '登記地址', sourceValues: '來源欄位',
  kindergartenName: '幼兒園', establishmentType: '設立別', evaluationAcademicYearRaw: '評鑑學年度', cityCode: '縣市代碼', postalCode: '郵遞區號',
};

function formatValue(value: RecordValue): string {
  if (value == null || value === '') return '-';
  if (Array.isArray(value)) return value.map((item) => formatValue(item as RecordValue)).filter((item) => item !== '-').join('、') || '-';
  if (typeof value === 'object') return Object.entries(value).filter(([, item]) => item != null && item !== '').map(([key, item]) => `${key}: ${formatValue(item as RecordValue)}`).join('；') || '-';
  return String(value);
}

function districtOf(record: DatasetRecord) {
  return String(record.districtName ?? record.districtNameFromAddress ?? record.district ?? '');
}

function isMapQueryColumn(key: string) {
  return key === 'googleMapsQuery' || key === 'externalMapQuery';
}

function isExternalUrlColumn(key: string) {
  return key === 'bedUsageUrl' || key === 'officialDetailUrl' || key === 'website';
}

function BarChart({ title, data }: { title: string; data: Array<{ label: string; value: number }> }) {
  const max = Math.max(...data.map((item) => item.value), 1);
  return <section className="chart"><h3>{title}</h3><div className="bars">{data.map((item) => <div className="bar-row wide-label" key={item.label}><span>{item.label}</span><div><i style={{ width: `${Math.max(2, item.value / max * 100)}%` }} /></div><b>{item.value.toLocaleString()}</b></div>)}</div></section>;
}

export default function GeneratedDatasetDirectoryModule({
  title, subtitle, records, language, columns, notice,
}: {
  title: string;
  subtitle: string;
  records: DatasetRecord[];
  language: 'zh' | 'en';
  columns: Array<[string, string]>;
  notice: string;
}) {
  const [view, setView] = useState<View>('overview');
  const [search, setSearch] = useState('');
  const [district, setDistrict] = useState('');
  const [hasPhone, setHasPhone] = useState('');
  const zh = language === 'zh';
  const displayTitle = zh ? zhTitles[title] ?? title : title;
  const displaySubtitle = zh ? '以公開來源轉換後的資料提供查詢、摘要與欄位檢視。' : subtitle;
  const displayNotice = zh ? '本資料僅供公開資料查詢與行政區彙整參考，不代表即時營運、服務可用性、資格、費用、品質或官方推薦。實際資訊請向資料來源、各機構或主管機關確認。' : notice;
  const displayColumns = useMemo(() => columns.map(([key, label]) => [key, zh ? zhFieldLabels[key] ?? label : label] as [string, string]), [columns, zh]);
  const districts = useMemo(() => [...new Set(records.map(districtOf).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'zh-Hant')), [records]);
  const filteredRecords = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase();
    return records.filter((record) => (!normalizedSearch || displayColumns.some(([key]) => formatValue(record[key]).toLocaleLowerCase().includes(normalizedSearch)))
      && (!district || districtOf(record) === district)
      && (!hasPhone || (hasPhone === 'yes' ? Boolean(record.hasPhone ?? record.phone) : !Boolean(record.hasPhone ?? record.phone))));
  }, [displayColumns, records, search, district, hasPhone]);
  const summary = useMemo(() => {
    const byDistrict = new Map<string, number>();
    filteredRecords.forEach((record) => {
      const value = districtOf(record);
      if (value) byDistrict.set(value, (byDistrict.get(value) ?? 0) + 1);
    });
    const nameColumn = displayColumns.find(([key]) => /name$/i.test(key))?.[0];
    const phoneRecords = filteredRecords.filter((record) => Boolean(record.hasPhone ?? record.phone));
    return {
      total: filteredRecords.length,
      districtCount: byDistrict.size,
      uniqueNames: nameColumn ? new Set(filteredRecords.map((record) => formatValue(record[nameColumn])).filter((value) => value !== '-')).size : 0,
      phoneRecords: phoneRecords.length,
      withoutPhone: filteredRecords.length - phoneRecords.length,
      byDistrict: [...byDistrict].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value || a.label.localeCompare(b.label, 'zh-Hant')),
    };
  }, [displayColumns, filteredRecords]);
  const hasPhoneField = records.some((record) => 'hasPhone' in record || 'phone' in record);
  const tabs: Array<[View, string]> = [
    ['overview', zh ? '總覽' : 'Overview'], ['districts', zh ? '行政區分布' : 'District Distribution'],
    ['directory', zh ? '資料名冊' : 'Directory'], ['quality', zh ? '資料品質' : 'Data Quality'], ['notes', zh ? '資料說明' : 'Data Notes'],
  ];

  return <section className="workspace">
    <div className="section-heading"><p>PUBLIC RECORD DIRECTORY</p><h2>{displayTitle}</h2><span>{displaySubtitle}</span></div>
    <div className="subtabs">{tabs.map(([id, label]) => <button key={id} className={view === id ? 'active' : ''} onClick={() => setView(id)}>{label}</button>)}</div>
    <aside className="filters"><label className="search"><span aria-hidden="true">⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={zh ? '搜尋目前名冊欄位' : 'Search displayed fields'} /></label>
      {(districts.length > 0 || hasPhoneField) && <div className="filter-grid">
        {districts.length > 0 && <label>{zh ? '行政區' : 'District'}<select value={district} onChange={(event) => setDistrict(event.target.value)}><option value="">{zh ? '全部' : 'All'}</option>{districts.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>}
        {hasPhoneField && <label>{zh ? '有電話' : 'Has phone'}<select value={hasPhone} onChange={(event) => setHasPhone(event.target.value)}><option value="">{zh ? '全部' : 'All'}</option><option value="yes">{zh ? '有' : 'Yes'}</option><option value="no">{zh ? '無' : 'No'}</option></select></label>}
      </div>}
      {(search || district || hasPhone) && <button className="text-button" onClick={() => { setSearch(''); setDistrict(''); setHasPhone(''); }}>{zh ? '清除篩選' : 'Clear filters'}</button>}</aside>
    <div className="section-heading inline"><p>{zh ? '篩選後紀錄' : 'Filtered records'}</p><strong>{summary.total.toLocaleString()} <span>{zh ? '筆' : 'records'}</span></strong></div>
    {view === 'overview' && <><div className="notice subtle">{displayNotice}</div><div className="summary-grid">
      {[[zh ? '資料筆數' : 'Total records', summary.total], [zh ? '涵蓋行政區' : 'Districts covered', summary.districtCount], [zh ? '不重複名稱' : 'Unique names', summary.uniqueNames], [zh ? '有電話紀錄' : 'Records with phone', summary.phoneRecords], [zh ? '資料最多行政區' : 'Top district', summary.byDistrict[0]?.label ?? '-']].map(([label, value]) => <article key={String(label)}><span>{label}</span><strong>{typeof value === 'number' ? value.toLocaleString() : value}</strong></article>)}</div>
      <div className="chart-grid"><BarChart title={zh ? '各行政區資料筆數' : 'Records by district'} data={summary.byDistrict} />{hasPhoneField && <BarChart title={zh ? '電話欄位完整度' : 'Records with and without phone'} data={[{ label: zh ? '有電話' : 'With phone', value: summary.phoneRecords }, { label: zh ? '無電話' : 'Without phone', value: summary.withoutPhone }]} />}</div></>}
    {view === 'districts' && <><div className="notice">{zh ? '本頁依資料中的行政區欄位彙整；不會將地址自動轉換為精確地圖標記。' : 'This page summarizes the district field only; it does not turn addresses into exact map markers.'}</div><BarChart title={zh ? '各行政區資料筆數' : 'Records by district'} data={summary.byDistrict} /></>}
    {view === 'directory' && <div className="comparison-scroll procurement-table"><table><thead><tr>{displayColumns.map(([, label]) => <th key={label}>{label}</th>)}</tr></thead><tbody>{filteredRecords.map((record, index) => <tr key={String(record.id ?? index)}>{displayColumns.map(([key]) => <td key={key}>{isMapQueryColumn(key) && record[key] ? <a target="_blank" rel="noopener noreferrer" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(String(record[key]))}`}>{zh ? '地圖查詢' : 'Map lookup'}</a> : isExternalUrlColumn(key) && record[key] ? <a target="_blank" rel="noopener noreferrer" href={String(record[key])}>{zh ? '官方外部連結' : 'Official external link'}</a> : formatValue(record[key])}</td>)}</tr>)}</tbody></table>{!filteredRecords.length && <p className="empty">{zh ? '沒有符合篩選條件的紀錄。' : 'No records match these filters.'}</p>}</div>}
    {view === 'quality' && <div className="notes-grid"><article><h3>{zh ? '篩選後完整度' : 'Filtered completeness'}</h3><p>{zh ? `目前共有 ${summary.total.toLocaleString()} 筆紀錄、${summary.districtCount.toLocaleString()} 個行政區；${summary.phoneRecords.toLocaleString()} 筆有電話資料。` : `${summary.total.toLocaleString()} records across ${summary.districtCount.toLocaleString()} districts; ${summary.phoneRecords.toLocaleString()} records include a phone number.`}</p></article><article><h3>{zh ? '處理方式' : 'Processing'}</h3><p>{zh ? '名冊、卡片與圖表共用相同篩選結果；資料列維持來源轉換後的欄位值。' : 'The directory, cards, and charts share the same filtered result set; displayed values come from the converted source fields.'}</p></article></div>}
    {view === 'notes' && <div className="notes-grid"><article><h3>{zh ? '資料使用說明' : 'Data notes'}</h3><p>{displayNotice}</p></article><article><h3>{zh ? '位置資訊限制' : 'Location limitation'}</h3><p>{zh ? '若資料未提供已確認的官方座標，本模組僅提供行政區彙整與外部地圖查詢。' : 'When no confirmed official coordinates are supplied, this module provides district summaries and external map lookup only.'}</p></article></div>}
  </section>;
}
