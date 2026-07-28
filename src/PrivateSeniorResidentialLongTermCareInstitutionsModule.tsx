import { useEffect, useState } from 'react';
import GeneratedDatasetDirectoryModule from './GeneratedDatasetDirectoryModule';

export default function PrivateSeniorResidentialLongTermCareInstitutionsModule({ language }: { language: 'zh' | 'en' }) {
  const [records, setRecords] = useState<any[]>([]);
  const zh = language === 'zh';

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/private-senior-residential-long-term-care-institutions/records.json`)
      .then((response) => response.json()).then(setRecords).catch(() => setRecords([]));
  }, []);

  return <GeneratedDatasetDirectoryModule language={language} records={records}
    title={zh ? '私立老人安養暨長期照顧機構' : 'Private Senior Residential and Long-Term Care Institutions'}
    subtitle={zh ? '私立老人照顧機構與核定床位公開名冊；依名稱、行政區與來源登錄資訊查詢。' : 'Source-recorded private senior-care directory and approved-bed capacity.'}
    columns={[['institutionName', zh ? '機構名稱' : 'Institution'], ['institutionAttributeRaw', zh ? '機構屬性' : 'Attribute'], ['districtName', zh ? '行政區' : 'District'], ['eligibleResidentsRaw', zh ? '收住對象' : 'Eligible residents'], ['approvedTotalBedsRaw', zh ? '核定總床位' : 'Approved total beds'], ['longTermCareBedsRaw', zh ? '長期照顧床位' : 'Long-term-care beds'], ['nursingCareBedsRaw', zh ? '養護床位' : 'Nursing-care beds'], ['dementiaCareBedsRaw', zh ? '失智照顧床位' : 'Dementia-care beds'], ['seniorHousingBedsRaw', zh ? '老人住宅床位' : 'Senior-housing beds'], ['address', zh ? '地址' : 'Address'], ['phone', zh ? '電話' : 'Phone'], ['externalMapQuery', zh ? '地圖查詢' : 'Map lookup']]}
    notice={zh ? '床位數為來源更新時的核定或登錄容量，不表示目前空床、可立即入住或符合資格；請直接向機構或主管機關確認。' : 'Bed figures are approved or source-recorded capacity at the source update time and do not establish current vacancies, immediate admission, or eligibility. Confirm directly with the institution or competent authority.'}
  />;
}
