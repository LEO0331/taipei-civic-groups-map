import { useEffect, useState } from 'react';
import GeneratedDatasetDirectoryModule from './GeneratedDatasetDirectoryModule';

export default function HemodialysisMedicalInstitutionsModule({ language }: { language: 'zh' | 'en' }) {
  const [records, setRecords] = useState<any[]>([]);
  const zh = language === 'zh';

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/hemodialysis-medical-institutions/records.json`)
      .then((response) => response.json()).then(setRecords).catch(() => setRecords([]));
  }, []);

  return <GeneratedDatasetDirectoryModule language={language} records={records}
    title={zh ? '臺北市血液透析醫療機構' : 'Taipei Hemodialysis Medical Institutions'}
    subtitle={zh ? '血液透析醫療機構公開名冊；依名稱、行政區、郵遞區號與來源聯絡資訊查詢。' : 'Source-recorded hemodialysis institution directory, searchable by name, district, postal code, and source contact information.'}
    columns={[['sourceSequenceNumber', zh ? '序號' : 'ID'], ['institutionName', zh ? '機構名稱' : 'Institution'], ['districtName', zh ? '行政區（地址解析）' : 'District (derived)'], ['postalCode', zh ? '郵遞區號' : 'Postal code'], ['address', zh ? '地址' : 'Address'], ['phoneRaw', zh ? '電話' : 'Telephone'], ['externalMapQuery', zh ? '地圖查詢' : 'Map lookup']]}
    notice={zh ? '本名冊不表示目前提供透析服務、接受新病人、可預約、具急診能力或有可用透析量能；請直接向醫療機構確認。' : 'This listing does not establish current dialysis services, new-patient acceptance, appointment availability, emergency capability, or available dialysis capacity. Confirm directly with the institution.'}
  />;
}
