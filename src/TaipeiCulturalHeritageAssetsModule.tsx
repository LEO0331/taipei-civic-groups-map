import { useEffect, useState } from 'react';
import GeneratedDatasetDirectoryModule from './GeneratedDatasetDirectoryModule';

export default function TaipeiCulturalHeritageAssetsModule({ language }: { language: 'zh' | 'en' }) {
  const [records, setRecords] = useState<any[]>([]);
  const zh = language === 'zh';

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/taipei-cultural-heritage-assets/records.json`)
      .then((response) => response.json()).then(setRecords).catch(() => setRecords([]));
  }, []);

  return <GeneratedDatasetDirectoryModule language={language} records={records}
    title={zh ? '臺北市文化資產' : 'Taipei Cultural Heritage Assets'}
    subtitle={zh ? '臺北市文化資產官方名冊；依名稱、類別、型態、主管機關與地理區域查詢。' : 'Official Taipei cultural-heritage registry, searchable by name, category, type, authority, and geographic area.'}
    columns={[['caseName', zh ? '資產名稱' : 'Asset name'], ['assetCategoryRaw', zh ? '文化資產類別' : 'Heritage category'], ['assetTypeRaw', zh ? '文化資產型態' : 'Heritage type'], ['geographicAreaRaw', zh ? '地理區域' : 'Geographic area'], ['districtName', zh ? '行政區（地址解析）' : 'District (derived)'], ['responsibleAuthority', zh ? '主管機關' : 'Responsible authority'], ['authorityCode', zh ? '主管機關代碼' : 'Authority code'], ['cityCode', zh ? '縣市代碼' : 'City code']]}
    notice={zh ? '這是行政登錄名冊，不表示即時開放、票價、導覽、無障礙、建物狀況、安全、所有權、修復或旅遊推薦。此建置環境無法以可信任 TLS 驗證連線 iHeritage API，因此未加入 API 補強或地圖標記。' : 'This is an administrative cultural-heritage registry, not real-time information about access, tickets, tours, accessibility, building condition, safety, ownership, restoration, or tourism recommendation. The iHeritage API could not be reached with trusted TLS verification in this build environment, so no API enrichment or map markers were created.'}
  />;
}
