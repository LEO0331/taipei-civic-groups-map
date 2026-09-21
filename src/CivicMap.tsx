import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet';
import { getCategoryLabel } from './lib/civicGroups';
import type { CivicGroupSummary, Language } from './types';

const labels = {
  zh: {
    notice: '此地圖以行政區彙總呈現，並非各團體精確位置。',
    count: '團體數',
    top: '主要推測分類',
    view: '查看名冊',
  },
  en: {
    notice: 'This map shows district-level summaries, not exact group locations.',
    count: 'Group count',
    top: 'Top inferred categories',
    view: 'View directory',
  },
} as const;

export default function CivicMap({ summary, language, openDistrict }: {
  summary: CivicGroupSummary;
  language: Language;
  openDistrict: (district: string) => void;
}) {
  const t = labels[language];
  return <div className="map-wrap">
    <div className="notice">{t.notice}</div>
    <MapContainer center={[25.072, 121.54]} zoom={11} scrollWheelZoom={false}>
      <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {summary.districtSummaries.filter((district) => district.count).map((district) =>
        <CircleMarker key={district.district} center={[district.latitude, district.longitude]}
          radius={Math.max(10, Math.sqrt(district.count) * 1.15)}
          pathOptions={{ fillColor: '#d75b3f', fillOpacity: .72, color: '#fff7e8', weight: 2 }}>
          <Popup><div className="map-popup"><strong>{district.district}</strong>
            <p>{t.count}: {district.count.toLocaleString()}</p>
            <p>{t.top}: {district.topCategories.map((item) => getCategoryLabel(item.category, language)).join('、')}</p>
            <button onClick={() => openDistrict(district.district)}>{t.view}</button>
          </div></Popup>
        </CircleMarker>)}
    </MapContainer>
  </div>;
}
