import { useEffect, useState } from 'react';
import GeneratedDatasetDirectoryModule from './GeneratedDatasetDirectoryModule';

export default function DesignatedForeignerHealthExamHospitalsModule({ language }: { language: 'zh' | 'en' }) {
  const [records, setRecords] = useState<any[]>([]);
  const zh = language === 'zh';

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/designated-foreigner-health-exam-hospitals/records.json`)
      .then((response) => response.json()).then(setRecords).catch(() => setRecords([]));
  }, []);

  return <GeneratedDatasetDirectoryModule language={language} records={records}
    title={zh ? '外國人健檢指定醫院' : 'Designated Foreigner Health Examination Hospitals'}
    subtitle={zh ? '外國人健檢指定醫院與效期公開名冊；依名稱、行政區與來源登錄效期查詢。' : 'Source-recorded directory of designated foreigner health-examination hospitals and validity periods.'}
    columns={[['sourceSequenceNumber', zh ? '序號' : 'ID'], ['hospitalName', zh ? '醫院名稱' : 'Hospital'], ['districtName', zh ? '行政區（地址解析）' : 'District (derived)'], ['cityCode', zh ? '縣市代碼' : 'City code'], ['designationValidityRaw', zh ? '指定效期' : 'Designation validity'], ['designationValidityStatus', zh ? '計算狀態' : 'Calculated status'], ['daysUntilExpiry', zh ? '距到期天數' : 'Days until expiry'], ['address', zh ? '地址' : 'Address'], ['externalMapQuery', zh ? '地圖查詢' : 'Map lookup']]}
    notice={zh ? '效期與狀態僅依來源紀錄計算，不代表目前仍受指定或可預約；預約前請向醫院及主管機關確認。' : 'Validity periods and statuses are calculated from source records and do not establish current designation or booking availability. Confirm with the hospital and relevant authority before booking.'}
  />;
}
