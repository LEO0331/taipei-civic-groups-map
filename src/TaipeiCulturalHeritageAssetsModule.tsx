import { useEffect, useState } from 'react';
import GeneratedDatasetDirectoryModule from './GeneratedDatasetDirectoryModule';

export default function TaipeiCulturalHeritageAssetsModule({ language }: { language: 'zh' | 'en' }) {
  const [records, setRecords] = useState<any[]>([]);
  useEffect(() => { fetch(`${import.meta.env.BASE_URL}data/taipei-cultural-heritage-assets/records.json`).then((response) => response.json()).then(setRecords).catch(() => setRecords([])); }, []);
  return <GeneratedDatasetDirectoryModule language={language} records={records} title="Taipei Cultural Heritage Assets" subtitle={language === 'zh' ? '臺北市文化資產官方登錄名冊；以名稱、類別、種類、主管機關與地理區域探索。' : 'Official Taipei cultural-heritage registry, searchable by name, category, type, authority, and geographic area.'} columns={[
    ['caseName', language === 'zh' ? '資產名稱' : 'Asset name'], ['assetCategoryRaw', language === 'zh' ? '資產類別' : 'Heritage category'], ['assetTypeRaw', language === 'zh' ? '資產種類' : 'Heritage type'], ['geographicAreaRaw', language === 'zh' ? '所在地理區域' : 'Geographic area'], ['districtName', language === 'zh' ? '行政區（衍生）' : 'District (derived)'], ['responsibleAuthority', language === 'zh' ? '所屬主管機關' : 'Responsible authority'], ['authorityCode', language === 'zh' ? '機關代碼' : 'Authority code'], ['cityCode', language === 'zh' ? '縣市別代碼' : 'City code'],
  ]} notice={language === 'zh' ? '本資料為文化資產行政登錄紀錄，不表示目前開放參觀、票價、導覽、無障礙設施、建築狀況、安全性、所有權、修復狀態或官方旅遊推薦。iHeritage API 在本次建置環境無法完成受信任的連線驗證，因此未使用 API 擴充，也未建立地圖標記。' : 'This is an administrative cultural-heritage registry, not real-time information about access, tickets, tours, accessibility, building condition, safety, ownership, restoration, or tourism recommendation. The iHeritage API could not be reached with trusted TLS verification in this build environment, so no API enrichment or map markers were created.'} />;
}
