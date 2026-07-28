import { useEffect, useState } from 'react';
import GeneratedDatasetDirectoryModule from './GeneratedDatasetDirectoryModule';

export default function HospicePalliativeCareInstitutionsModule({ language }: { language: 'zh' | 'en' }) {
  const [records, setRecords] = useState<any[]>([]);
  const zh = language === 'zh';

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/hospice-palliative-care-institutions/records.json`)
      .then((response) => response.json()).then(setRecords).catch(() => setRecords([]));
  }, []);

  return <GeneratedDatasetDirectoryModule language={language} records={records}
    title={zh ? '安寧緩和醫療機構' : 'Hospice and Palliative Care Institutions'}
    subtitle={zh ? '安寧緩和醫療資源公開名冊；依機構、特約類別、業務組別與縣市查詢。' : 'Source-recorded hospice and palliative-care resource directory, searchable by institution, contracted category, business group, and city or county.'}
    columns={[['institutionName', zh ? '機構名稱' : 'Institution'], ['cityName', zh ? '縣市' : 'City or county'], ['contractCategoryRaw', zh ? '特約類別' : 'Contract category'], ['businessGroupRaw', zh ? '業務組別' : 'Business group'], ['bedUsageUrl', zh ? '官方床位使用資訊' : 'Official bed-usage information']]}
    notice={zh ? '官方連結可能提供床位使用資訊，但不表示目前有安寧床位、可立即收治或符合收治資格；請向機構或主管機關確認。' : 'An official link may provide bed-usage information, but it does not establish current hospice-bed availability, immediate admission, or eligibility. Confirm with the institution or competent authority.'}
  />;
}
