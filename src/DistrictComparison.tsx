import { useState } from 'react';
import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet';
import { DISTRICTS, getCategoryLabel, TAIPEI_DISTRICT_CENTROIDS } from './lib/civicGroups';
import type { CivicGroup, CivicGroupSummary, IndustryGrantRecipient, IndustryGrantSummary, Language } from './types';

const money = (value: number, language: Language) => new Intl.NumberFormat(language === 'zh' ? 'zh-TW' : 'en', {
  style: 'currency', currency: 'TWD', notation: 'compact', maximumFractionDigits: 1,
}).format(value);

export default function DistrictComparison({ groups, civicSummary, grants, grantSummary, language }: {
  groups: CivicGroup[]; civicSummary: CivicGroupSummary; grants: IndustryGrantRecipient[];
  grantSummary: IndustryGrantSummary; language: Language;
}) {
  const zh = language === 'zh';
  const [metric, setMetric] = useState<'civic' | 'companies' | 'subsidy' | 'budget'>('civic');
  const top = (rows: IndustryGrantRecipient[], key: 'industryCategory' | 'grantField') =>
    [...new Map(rows.map((row) => [row[key], rows.filter((item) => item[key] === row[key]).length]))].sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—';
  const rows = DISTRICTS.map((district) => {
    const civic = groups.filter((group) => group.district === district);
    const grant = grants.filter((record) => record.registeredDistrict === district);
    const civicDistrict = civicSummary.byDistrict.find((item) => item.district === district);
    const grantDistrict = grantSummary.byDistrict.find((item) => item.district === district);
    const topCivic = civicSummary.districtSummaries.find((item) => item.district === district)?.topCategories[0]?.category;
    return {
      district, civicCount: civicDistrict?.count ?? 0, topCivic: topCivic ? getCategoryLabel(topCivic, language) : '—',
      phoneCount: civic.filter((group) => group.phone).length, foundedCount: civic.filter((group) => group.foundedYear).length,
      grantCount: grantDistrict?.recordCount ?? 0, companyCount: grantDistrict?.uniqueCompanyCount ?? 0,
      subsidy: grantDistrict?.approvedSubsidyNtd ?? 0, budget: grantDistrict?.totalProjectBudgetNtd ?? 0,
      topIndustry: top(grant, 'industryCategory'), topField: top(grant, 'grantField'),
    };
  });
  const value = (row: typeof rows[number]) => metric === 'civic' ? row.civicCount : metric === 'companies' ? row.companyCount : metric === 'subsidy' ? row.subsidy : row.budget;
  const max = Math.max(...rows.map(value), 1);
  const options = [
    ['civic', zh ? '人民團體數' : 'Civic group count'], ['companies', zh ? '補助廠商數' : 'Grant recipient count'],
    ['subsidy', zh ? '核定補助金額' : 'Approved subsidy amount'], ['budget', zh ? '總經費' : 'Total project budget'],
  ] as const;
  return <section className="workspace"><div className="section-heading"><p>03 / DISTRICT COMPARISON</p><h2>{zh ? '行政區比較' : 'District Comparison'}</h2></div>
    <div className="notice">{zh ? '此表並列人民團體名冊與產業補助廠商資料，僅供行政區公開資料分布比較，不代表因果關係、區域優劣或政策成效。' : 'This table compares civic group directory records and industry grant recipient records by district for public-data exploration only. It does not imply causation, district quality, or policy effectiveness.'}</div>
    <div className="metric-toggle">{options.map(([id, label]) => <button className={metric === id ? 'active' : ''} onClick={() => setMetric(id)} key={id}>{label}</button>)}</div>
    <div className="map-wrap comparison-map"><MapContainer center={[25.072, 121.54]} zoom={11} scrollWheelZoom={false}>
      <TileLayer attribution='&copy; OpenStreetMap contributors &copy; CARTO' url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
      {rows.map((row) => { const point = TAIPEI_DISTRICT_CENTROIDS[row.district]; return <CircleMarker key={row.district} center={[point.latitude, point.longitude]} radius={9 + 30 * Math.sqrt(value(row) / max)} pathOptions={{ fillColor: metric === 'civic' ? '#d75b3f' : '#3d7480', fillOpacity: .74, color: '#fff', weight: 2 }}>
        <Popup><strong>{row.district}</strong><p>{options.find(([id]) => id === metric)?.[1]}: {metric === 'subsidy' || metric === 'budget' ? money(value(row), language) : value(row).toLocaleString()}</p></Popup>
      </CircleMarker>; })}
    </MapContainer></div>
    <div className="comparison-scroll"><table><thead><tr><th rowSpan={2}>{zh ? '行政區' : 'District'}</th><th colSpan={4}>{zh ? '人民團體' : 'Civic groups'}</th><th colSpan={6}>{zh ? '產業補助廠商' : 'Industry grant recipients'}</th></tr>
      <tr>{(zh ? ['團體數', '主要推測分類', '有電話', '有成立年份', '補助紀錄數', '廠商數', '核定補助款', '總經費', '主要產業類別', '主要領域'] : ['Group count', 'Top inferred category', 'With phone', 'With founding year', 'Grant records', 'Companies', 'Approved subsidy', 'Project budget', 'Top industry', 'Top field']).map((label) => <th key={label}>{label}</th>)}</tr></thead>
      <tbody>{rows.map((row) => <tr key={row.district}><th>{row.district}</th><td>{row.civicCount}</td><td>{row.topCivic}</td><td>{row.phoneCount}</td><td>{row.foundedCount}</td>
        <td>{row.grantCount}</td><td>{row.companyCount}</td><td>{money(row.subsidy, language)}</td><td>{money(row.budget, language)}</td><td>{row.topIndustry}</td><td>{row.topField}</td></tr>)}</tbody></table></div>
  </section>;
}
