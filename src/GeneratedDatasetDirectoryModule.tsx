import { useMemo, useState, type ReactNode } from 'react';
import AccessibleTabs, { AccessibleTabPanel } from './AccessibleTabs';
import { DatasetFamilyFrame, DatasetFamilyHeading } from './DatasetFamilyFrame';
import type { UiFamily } from './lib/uiFamilies';
import {
  detectLocationDimension,
  formatLocationValue,
  locationLabel,
  locationPluralLabel,
  locationValue,
  type DirectoryLocationDimension,
} from './lib/generatedDirectoryLocation';

type RecordValue = string | number | boolean | null | undefined | Record<string, unknown> | unknown[];
type DatasetRecord = Record<string, RecordValue>;
type View = 'overview' | 'districts' | 'directory' | 'quality' | 'notes';

function GeneratedDirectoryFrame({ uiFamily, children }: { uiFamily?: UiFamily; children: ReactNode }) {
  return uiFamily
    ? <DatasetFamilyFrame family={uiFamily}>{children}</DatasetFamilyFrame>
    : <section className="workspace">{children}</section>;
}

const zhTitles: Record<string, string> = {
  'Taipei Ophthalmology Institutions': '臺北市眼科醫療機構',
  'Taipei Hemodialysis Medical Institutions': '臺北市血液透析醫療機構',
  'Taipei Internal Medicine Institutions': '臺北市內科醫療機構',
  'Taipei Occupational Therapy Clinics': '臺北市職能治療所',
  'Designated Foreigner Health Examination Hospitals': '外國人健檢指定醫院',
  'Hospice and Palliative Care Institutions': '安寧緩和醫療機構',
  'Private Senior Residential and Long-Term Care Institutions': '私立老人安養暨長期照顧機構',
  'Taipei Cultural Heritage Assets': '臺北市文化資產',
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

function formatValue(value: RecordValue): string {
  if (value == null || value === '') return '-';
  if (Array.isArray(value)) return value.map((item) => formatValue(item as RecordValue)).filter((item) => item !== '-').join('、') || '-';
  if (typeof value === 'object') return Object.entries(value).filter(([, item]) => item != null && item !== '').map(([key, item]) => `${key}: ${formatValue(item as RecordValue)}`).join('；') || '-';
  return String(value);
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
  title, subtitle, records, language, columns, notice, locationDimension, uiFamily, eyebrow,
}: {
  title: string;
  subtitle: string;
  records: DatasetRecord[];
  language: 'zh' | 'en';
  columns: Array<[string, string]>;
  notice: string;
  locationDimension?: DirectoryLocationDimension | null;
  uiFamily?: UiFamily;
  eyebrow?: string;
}) {
  const [view, setView] = useState<View>('overview');
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [hasPhone, setHasPhone] = useState('');
  const zh = language === 'zh';
  const displayTitle = zh ? zhTitles[title] ?? title : title;
  const displaySubtitle = subtitle;
  const displayNotice = notice;
  const displayColumns = useMemo(() => columns, [columns]);
  const resolvedLocationDimension = useMemo(
    () => locationDimension === undefined ? detectLocationDimension(records) : locationDimension,
    [locationDimension, records],
  );
  const locationName = resolvedLocationDimension ? locationLabel(resolvedLocationDimension, language) : '';
  const locationPluralName = resolvedLocationDimension ? locationPluralLabel(resolvedLocationDimension, language) : '';
  const locations = useMemo(() => {
    if (!resolvedLocationDimension) return [];
    const values = [...new Set(records.map((record) => locationValue(record, resolvedLocationDimension)).filter(Boolean))];
    return values.map((value) => ({ value, label: formatLocationValue(value, resolvedLocationDimension, language) }))
      .sort((a, b) => a.label.localeCompare(b.label, zh ? 'zh-Hant' : 'en'));
  }, [language, records, resolvedLocationDimension, zh]);
  const hasLocationDimension = Boolean(resolvedLocationDimension && locations.length);
  const filteredRecords = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase();
    return records.filter((record) => (!normalizedSearch || displayColumns.some(([key]) => formatValue(record[key]).toLocaleLowerCase().includes(normalizedSearch)))
      && (!location || (resolvedLocationDimension && locationValue(record, resolvedLocationDimension) === location))
      && (!hasPhone || (hasPhone === 'yes' ? Boolean(record.hasPhone ?? record.phone) : !Boolean(record.hasPhone ?? record.phone))));
  }, [displayColumns, records, search, location, hasPhone, resolvedLocationDimension]);
  const summary = useMemo(() => {
    const byLocation = new Map<string, number>();
    if (resolvedLocationDimension) {
      filteredRecords.forEach((record) => {
        const value = locationValue(record, resolvedLocationDimension);
        if (value) byLocation.set(value, (byLocation.get(value) ?? 0) + 1);
      });
    }
    const nameColumn = displayColumns.find(([key]) => /name$/i.test(key))?.[0];
    const phoneRecords = filteredRecords.filter((record) => Boolean(record.hasPhone ?? record.phone));
    return {
      total: filteredRecords.length,
      locationCount: byLocation.size,
      uniqueNames: nameColumn ? new Set(filteredRecords.map((record) => formatValue(record[nameColumn])).filter((value) => value !== '-')).size : 0,
      phoneRecords: phoneRecords.length,
      withoutPhone: filteredRecords.length - phoneRecords.length,
      byLocation: [...byLocation].map(([rawLabel, value]) => ({
        label: resolvedLocationDimension ? formatLocationValue(rawLabel, resolvedLocationDimension, language) : rawLabel,
        value,
      })).sort((a, b) => b.value - a.value || a.label.localeCompare(b.label, zh ? 'zh-Hant' : 'en')),
    };
  }, [displayColumns, filteredRecords, language, resolvedLocationDimension, zh]);
  const hasPhoneField = records.some((record) => 'hasPhone' in record || 'phone' in record || 'phoneRaw' in record || 'fullPhone' in record);
  const tabs: Array<[View, string]> = [
    ['overview', zh ? '總覽' : 'Overview'],
    ...(hasLocationDimension ? [['districts', zh ? `${locationName}分布` : `${locationName} Distribution`] as [View, string]] : []),
    ['directory', zh ? '資料名冊' : 'Directory'], ['quality', zh ? '資料品質' : 'Data Quality'], ['notes', zh ? '資料說明' : 'Data Notes'],
  ];
  const locationChartTitle = zh ? `各${locationName}資料筆數` : `Records by ${locationName.toLocaleLowerCase()}`;

  return <GeneratedDirectoryFrame uiFamily={uiFamily}>
    {uiFamily
      ? <DatasetFamilyHeading eyebrow={eyebrow ?? (zh ? '公開資料名冊' : 'PUBLIC RECORD DIRECTORY')} title={displayTitle} description={displaySubtitle} />
      : <div className="section-heading"><p>{zh ? '公開資料名冊' : 'PUBLIC RECORD DIRECTORY'}</p><h2>{displayTitle}</h2><span>{displaySubtitle}</span></div>}
    <AccessibleTabs tabs={tabs} value={view} onChange={setView} ariaLabel={zh ? '名冊資料檢視' : 'Directory data views'} idPrefix="generated-directory" controlsPanel />
    <aside className="filters"><label className="search"><span aria-hidden="true">⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={zh ? '搜尋名冊資料' : 'Search directory records'} /></label>
      {(hasLocationDimension || hasPhoneField) && <div className="filter-grid">
        {hasLocationDimension && <label>{locationName}<select value={location} onChange={(event) => setLocation(event.target.value)}><option value="">{zh ? '全部' : 'All'}</option>{locations.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>}
        {hasPhoneField && <label>{zh ? '有電話' : 'Has phone'}<select value={hasPhone} onChange={(event) => setHasPhone(event.target.value)}><option value="">{zh ? '全部' : 'All'}</option><option value="yes">{zh ? '有' : 'Yes'}</option><option value="no">{zh ? '無' : 'No'}</option></select></label>}
      </div>}
      {(search || location || hasPhone) && <button className="text-button" onClick={() => { setSearch(''); setLocation(''); setHasPhone(''); }}>{zh ? '清除篩選' : 'Clear filters'}</button>}</aside>
    <div className="section-heading inline"><p>{zh ? '篩選後紀錄' : 'Filtered records'}</p><strong>{summary.total.toLocaleString()} <span>{zh ? '筆' : 'records'}</span></strong></div>
    <AccessibleTabPanel idPrefix="generated-directory" value={view}>
    {view === 'overview' && <><div className="notice subtle">{displayNotice}</div><div className="summary-grid">
      {[
        [zh ? '資料筆數' : 'Total records', summary.total],
        ...(hasLocationDimension ? [[zh ? `涵蓋${locationName}` : `${locationPluralName} covered`, summary.locationCount]] : []),
        [zh ? '不重複名稱' : 'Unique names', summary.uniqueNames],
        [zh ? '有電話紀錄' : 'Records with phone', summary.phoneRecords],
        ...(hasLocationDimension ? [[zh ? `資料最多${locationName}` : `Top ${locationName.toLocaleLowerCase()}`, summary.byLocation[0]?.label ?? '-']] : []),
      ].map(([label, value]) => <article key={String(label)}><span>{label}</span><strong>{typeof value === 'number' ? value.toLocaleString() : value}</strong></article>)}</div>
      <div className="chart-grid">{hasLocationDimension && <BarChart title={locationChartTitle} data={summary.byLocation} />}{hasPhoneField && <BarChart title={zh ? '電話欄位完整度' : 'Records with and without phone'} data={[{ label: zh ? '有電話' : 'With phone', value: summary.phoneRecords }, { label: zh ? '無電話' : 'Without phone', value: summary.withoutPhone }]} />}</div></>}
    {view === 'districts' && hasLocationDimension && <><div className="notice">{zh ? `本頁依資料中的${locationName}欄位彙整；不會將地址自動轉換為精確地圖標記。` : `This page summarizes the ${locationName.toLocaleLowerCase()} field only; it does not turn addresses into exact map markers.`}</div><BarChart title={locationChartTitle} data={summary.byLocation} /></>}
    {view === 'directory' && <div className="comparison-scroll procurement-table"><table><thead><tr>{displayColumns.map(([, label]) => <th key={label}>{label}</th>)}</tr></thead><tbody>{filteredRecords.map((record, index) => <tr key={String(record.id ?? index)}>{displayColumns.map(([key]) => <td key={key}>{isMapQueryColumn(key) && record[key] ? <a target="_blank" rel="noopener noreferrer" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(String(record[key]))}`}>{zh ? '地圖查詢' : 'Map lookup'}</a> : isExternalUrlColumn(key) && record[key] ? <a target="_blank" rel="noopener noreferrer" href={String(record[key])}>{zh ? '官方外部連結' : 'Official external link'}</a> : formatValue(record[key])}</td>)}</tr>)}</tbody></table>{!filteredRecords.length && <p className="empty">{zh ? '沒有符合篩選條件的紀錄。' : 'No records match these filters.'}</p>}</div>}
    {view === 'quality' && <div className="notes-grid"><article><h3>{zh ? '篩選後完整度' : 'Filtered completeness'}</h3><p>{hasLocationDimension ? (zh ? `目前共有 ${summary.total.toLocaleString()} 筆紀錄、${summary.locationCount.toLocaleString()} 個${locationName}；${summary.phoneRecords.toLocaleString()} 筆有電話資料。` : `${summary.total.toLocaleString()} records across ${summary.locationCount.toLocaleString()} ${locationPluralName.toLocaleLowerCase()}; ${summary.phoneRecords.toLocaleString()} records include a phone number.`) : (zh ? `目前共有 ${summary.total.toLocaleString()} 筆紀錄；${summary.phoneRecords.toLocaleString()} 筆有電話資料。此資料未提供可直接彙整的位置欄位。` : `${summary.total.toLocaleString()} records; ${summary.phoneRecords.toLocaleString()} records include a phone number. This dataset has no directly aggregatable location field.`)}</p></article><article><h3>{zh ? '處理方式' : 'Processing'}</h3><p>{zh ? '名冊、卡片與圖表共用相同篩選結果；資料列維持來源轉換後的欄位值。' : 'The directory, cards, and charts share the same filtered result set; displayed values come from the converted source fields.'}</p></article></div>}
    {view === 'notes' && <div className="notes-grid"><article><h3>{zh ? '資料使用說明' : 'Data notes'}</h3><p>{displayNotice}</p></article><article><h3>{zh ? '位置資訊限制' : 'Location limitation'}</h3><p>{hasLocationDimension ? (zh ? `若資料未提供已確認的官方座標，本模組僅提供${locationName}彙整與外部地圖查詢。` : `When no confirmed official coordinates are supplied, this module provides ${locationName.toLocaleLowerCase()} summaries and external map lookup only.`) : (zh ? '此資料未提供可直接彙整的行政區或縣市欄位，因此不顯示位置分布圖；外部地圖查詢僅在來源具備可用查詢值時提供。' : 'This dataset has no directly aggregatable district or city/county field, so no location-distribution view is shown. External map lookup is available only when the source provides a usable lookup value.')}</p></article></div>}
    </AccessibleTabPanel>
  </GeneratedDirectoryFrame>;
}
