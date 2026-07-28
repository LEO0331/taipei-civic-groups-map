import { useEffect, useState } from 'react';
import GeneratedDatasetDirectoryModule from './GeneratedDatasetDirectoryModule';

export default function OccupationalTherapyClinicsModule({ language }: { language: 'zh' | 'en' }) {
  const [records, setRecords] = useState<any[]>([]);
  useEffect(() => { fetch(`${import.meta.env.BASE_URL}data/occupational-therapy-clinics/records.json`).then((response) => response.json()).then(setRecords).catch(() => setRecords([])); }, []);
  const zh = language === 'zh';
  return <GeneratedDatasetDirectoryModule language={language} records={records} title={zh ? '臺北市職能治療所' : 'Taipei Occupational Therapy Clinics'} subtitle={zh ? '職能治療所公開名冊；依名稱、行政區、郵遞區號與來源聯絡資訊查詢。' : 'Source-recorded occupational therapy clinic directory, searchable by clinic, district, postal code, and source contact information.'} columns={[['sourceSequenceNumber', zh ? '序號' : 'ID'], ['clinicName', zh ? '機構名稱' : 'Clinic'], ['districtName', zh ? '行政區（衍生）' : 'District (derived)'], ['postalCode', zh ? '郵遞區號' : 'Postal code'], ['address', zh ? '地址' : 'Address'], ['phoneRaw', zh ? '電話' : 'Telephone'], ['externalMapQuery', zh ? '地圖查詢' : 'Map lookup']]} notice={zh ? '本名冊不表示目前可預約、接受新個案、提供特定職能治療服務或治療師出勤。請直接向治療所確認。' : 'This listing does not establish appointment availability, new-client acceptance, provision of a particular occupational therapy service, or therapist attendance. Confirm directly with the clinic.'} />;
}
