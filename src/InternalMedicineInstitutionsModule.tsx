import { useEffect, useState } from 'react';
import GeneratedDatasetDirectoryModule from './GeneratedDatasetDirectoryModule';

export default function InternalMedicineInstitutionsModule({ language }: { language: 'zh' | 'en' }) {
  const [records, setRecords] = useState<any[]>([]);
  useEffect(() => { fetch(`${import.meta.env.BASE_URL}data/internal-medicine-institutions/records.json`).then((response) => response.json()).then(setRecords).catch(() => setRecords([])); }, []);
  const zh = language === 'zh';
  return <GeneratedDatasetDirectoryModule language={language} records={records} title={zh ? '臺北市內科醫療機構' : 'Taipei Internal Medicine Institutions'} subtitle={zh ? '內科醫療機構公開名冊；依名稱、行政區、郵遞區號與來源聯絡資訊查詢。' : 'Source-recorded internal medicine institution directory, searchable by name, district, postal code, and source contact information.'} columns={[['sourceSequenceNumber', zh ? '序號' : 'ID'], ['institutionName', zh ? '機構名稱' : 'Institution'], ['districtName', zh ? '行政區（衍生）' : 'District (derived)'], ['postalCode', zh ? '郵遞區號' : 'Postal code'], ['address', zh ? '地址' : 'Address'], ['phoneRaw', zh ? '電話' : 'Telephone'], ['externalMapQuery', zh ? '地圖查詢' : 'Map lookup']]} notice={zh ? '本名冊反映資料更新時的內科機構紀錄，不表示目前門診時間、醫師出勤、預約狀態、次專科或特定診療服務。請直接向機構確認。' : 'This directory reflects institution records at the source update time and does not establish current clinic hours, physician attendance, appointment availability, subspecialties, or particular services. Confirm directly with the institution.'} />;
}
