import { useEffect, useMemo, useState } from 'react';
import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet';
import {
  buildCivicGroupSummary, CATEGORIES, DISTRICTS, filterCivicGroups, formatFoundedDate, getCategoryLabel,
} from './lib/civicGroups';
import RegisteredLaborUnionsModule from './RegisteredLaborUnionsModule';
import QuasiPublicInfantCareCentersModule from './QuasiPublicInfantCareCentersModule';
import InfantCareCenterEvaluationResultsModule from './InfantCareCenterEvaluationResultsModule';
import TaipeiTravelAccommodationsZhModule from './TaipeiTravelAccommodationsZhModule';
import PerformingArtsGroupsModule from './PerformingArtsGroupsModule';
import ContractedVaccinationMedicalProvidersModule from './ContractedVaccinationMedicalProvidersModule';
import ChildMedicalSubsidyContractedProvidersModule from './ChildMedicalSubsidyContractedProvidersModule';
import DentureSubsidyMedicalProvidersModule from './DentureSubsidyMedicalProvidersModule';
import DisabilityEmploymentResourceMapModule from './DisabilityEmploymentResourceMapModule';
import ShelteredWorkshopDirectoryModule from './ShelteredWorkshopDirectoryModule';
import LicensedPawnshopDirectoryModule from './LicensedPawnshopDirectoryModule';
import TelepsychologyCounselingInstitutionsModule from './TelepsychologyCounselingInstitutionsModule';
import BusinessPremisesPublicLiabilityInsuranceModule from './BusinessPremisesPublicLiabilityInsuranceModule';
import BusinessRegistrationChangesModule from './BusinessRegistrationChangesModule';
import CompanyRegistrationChangesModule from './CompanyRegistrationChangesModule';
import ElderlyWelfareInstitutionsModule from './ElderlyWelfareInstitutionsModule';
import BiotechCompanyDirectoryModule from './BiotechCompanyDirectoryModule';
import IndustryModule from './IndustryModule';
import MetroProcurementModule from './MetroProcurementModule';
import RegisteredCramSchoolsModule from './RegisteredCramSchoolsModule';
import RegisteredHotelsModule from './RegisteredHotelsModule';
import LaborStandardActViolationsModule from './LaborStandardActViolationsModule';
import ConsumerDisputeAbsentBusinessOperatorsModule from './ConsumerDisputeAbsentBusinessOperatorsModule';
import NangangSoftwareParkCompaniesModule from './NangangSoftwareParkCompaniesModule';
import RegisteredAnimalHospitalsModule from './RegisteredAnimalHospitalsModule';
import VeterinarianProfessionalRegistryModule from './VeterinarianProfessionalRegistryModule';
import DistrictComparison from './DistrictComparison';
import PubliclyFundedHpvVaccinationProvidersModule from './PubliclyFundedHpvVaccinationProvidersModule';
import type {
  CivicGroup, CivicGroupFilters, CivicGroupSummary, IndustryGrantRecipient, IndustryGrantSummary, Language,
  MetroProcurementScheduleRecord, MetroProcurementScheduleSummary, RegisteredCramSchool, RegisteredCramSchoolSummary,
  RegisteredHotel, RegisteredHotelSummary, LaborStandardActViolationManifest, LaborStandardActViolationSummary, NangangSoftwareParkCompany, NangangSoftwareParkCompanySummary,
  QuasiPublicInfantCareCenter, QuasiPublicInfantCareCenterSummary, RegisteredAnimalHospital, RegisteredAnimalHospitalSummary, RegisteredLaborUnion, RegisteredLaborUnionSummary, VeterinarianProfessionalRegistryRecord, VeterinarianProfessionalRegistrySummary,
  TaipeiTravelAccommodationZhRecord, TaipeiTravelAccommodationZhSummary, PerformingArtsGroupRecord, PerformingArtsGroupSummary,
  BiotechCompanyDirectoryRecord, BiotechCompanyDirectorySummary, BusinessPremisesPublicLiabilityInsuranceRecord, BusinessPremisesPublicLiabilityInsuranceSummary, BusinessRegistrationChangeRecord, BusinessRegistrationChangeSummary, ChildMedicalSubsidyContractedProviderRecord, ChildMedicalSubsidyContractedProviderSummary, CompanyRegistrationChangeRecord, CompanyRegistrationChangeSummary, ConsumerDisputeAbsentBusinessOperatorRecord, ConsumerDisputeAbsentBusinessOperatorSummary, ContractedVaccinationMedicalProviderRecord, ContractedVaccinationMedicalProviderSummary, DentureSubsidyMedicalProviderRecord, DentureSubsidyMedicalProviderSummary, DisabilityEmploymentResourceRecord, DisabilityEmploymentResourceSummary, ElderlyWelfareInstitutionRecord, ElderlyWelfareInstitutionSummary, InfantCareCenterEvaluationInstitutionRecord, InfantCareCenterEvaluationSummary, InfantCareCenterEvaluationYearRecord, LicensedPawnshopDirectoryRecord, LicensedPawnshopDirectorySummary, PubliclyFundedHpvVaccinationProviderRecord, PubliclyFundedHpvVaccinationProviderSummary, ShelteredWorkshopDirectoryRecord, ShelteredWorkshopDirectorySummary, TelepsychologyCounselingInstitutionRecord, TelepsychologyCounselingInstitutionSummary,
} from './types';

const copy = {
  zh: {
    title: '台北公共登記與行政紀錄地圖', subtitle: '人民團體、演藝團體、工會、身障就業資源、庇護工場、合法當舖、醫療與心理健康院所、HPV疫苗院所、兒童醫療補助院所、假牙補助院所、公共意外險、商業異動、公司異動、立案機構、旅宿、旅遊住宿、採購、補助、生技廠商、法規、消費爭議公告、產業園區、動物照護、兒童照護、托嬰評鑑與老人福利機構公開紀錄探索',
    civicGroups: '人民團體', performingArtsGroups: '演藝團體', vaccinationProviders: '預防接種院所', hpvProviders: 'HPV疫苗院所', childMedicalSubsidyProviders: '兒童醫療補助院所', dentureSubsidyProviders: '假牙補助院所', disabilityEmploymentResources: '身障就業資源', shelteredWorkshops: '庇護工場', licensedPawnshops: '合法當舖', telepsychology: '通訊心理諮商', publicLiabilityInsurance: '公共意外險', businessChanges: '商業異動', companyChanges: '公司異動', laborUnions: '工會名單', infantCareCenters: '準公共化托嬰中心', infantCareEvaluations: '托嬰評鑑', elderlyWelfare: '老人福利機構', biotechCompanies: '生技廠商', travelAccommodations: '旅遊住宿', industryGrants: '產業補助廠商', metroProcurement: '捷運採購時程', registeredCramSchools: '立案補習班', registeredHotels: '一般旅館名冊', laborViolations: '勞基法違規公布紀錄', consumerDisputeAbsence: '消費爭議不到場公告', nangangCompanies: '南港軟體工業園區廠商', animalHospitals: '動物醫院一覽表', veterinarians: '獸醫師資訊', comparison: '行政區比較',
    map: '團體地圖', directory: '團體名冊', overview: '資料概覽', notes: '資料說明',
    search: '搜尋團體名稱、地址、電話或關鍵字', district: '行政區', category: '推測分類',
    decade: '成立年代', phone: '電話資料', all: '全部', yes: '有電話', no: '無電話',
    from: '起始年份', to: '結束年份', clear: '清除篩選', found: '筆符合紀錄',
    address: '地址', phoneLabel: '電話', founded: '成立日期', source: '資料來源',
    mapNotice: '此地圖以行政區彙總呈現，並非各團體精確位置。',
    categoryNotice: '分類係依團體名稱關鍵字推測，並非資料來源提供之正式分類。',
    count: '團體數', top: '主要推測分類', view: '查看名冊', more: '載入更多',
    total: '人民團體總數', withDistrict: '可辨識行政區紀錄', withPhone: '有電話紀錄',
    withYear: '可解析成立年份紀錄', topDistrict: '團體數最多行政區', topCategory: '最多推測分類',
    oldest: '最早成立年份', newest: '最新成立年份', byDistrict: '各行政區人民團體數',
    byDecade: '各成立年代人民團體數', byYear: '各成立年份人民團體數',
    byCategory: '各推測分類人民團體數', phoneAvailability: '電話資料有無', districtAvailability: '行政區辨識狀態',
    disclaimer: '本網站呈現臺北市公開資料中的人民團體名冊。地址、電話與團體狀態請以主管機關公告及團體實際資訊為準。本網站以行政區彙總呈現地圖，不代表各團體精確位置。推測分類係依團體名稱關鍵字產生，並非資料來源提供之正式分類。',
    method: '資料處理方式', methodText: '地址僅比對臺北市 12 個行政區名稱；成立日期支援民國及西元格式；分類僅依團體名稱關鍵字推測。無法解析的原始值仍保留於名冊。',
    fields: '欄位對照', updated: '資料轉換時間', noResults: '沒有符合條件的紀錄。',
    loading: '資料載入中…', loadError: '資料載入失敗，請重新整理頁面。',
    footer: '資料來源：臺北市人民團體名冊、臺北市演藝團體名冊、臺北市各工會名單及聯絡方式、臺北市身障就業資源地圖、臺北市庇護工場名冊、臺北市政府警察局當舖業資料清冊、各項預防接種合約醫療院所、臺北市公費HPV疫苗特約醫療院所、臺北市兒童醫療補助特約院所名冊、臺北市假牙補助醫療院所名單、臺北市可執行通訊心理諮商之心理機構、臺北市營業場所投保公共意外險清冊、商業設立變更歇業登記異動資料、臺北市核准公司設立變更解散清冊、產業補助、臺北市生技廠商企業名錄、捷運採購、立案補習班、一般旅館、臺北旅遊網住宿資料、勞基法違規公布、臺北市消費爭議無故不到場協商之被申訴企業經營者列表、南港軟體工業園區廠商、臺北市動物醫院一覽表、臺北市準公共化托嬰中心、臺北市托嬰中心評鑑結果與臺北市老人福利機構名冊等公開資料。各資料集性質不同，最新與正式資訊請以主管機關正式公告及官方系統為準。',
  },
  en: {
    title: 'Taipei Public Records Explorer', subtitle: 'Civic groups, performing-arts groups, labor unions, disability employment resources, sheltered workshops, licensed pawnshops, healthcare and mental-health providers, HPV vaccine providers, child medical subsidy providers, denture subsidy providers, public liability insurance, business changes, company changes, registered institutions, lodging records, travel accommodations, procurement, grants, biotech companies, compliance, consumer dispute notices, industry park, animal-care, childcare, infant care evaluations, and elderly-care public records explorer',
    civicGroups: 'Civic Groups', performingArtsGroups: 'Performing Arts', vaccinationProviders: 'Vaccination Providers', hpvProviders: 'HPV Vaccine Providers', childMedicalSubsidyProviders: 'Child Medical Subsidy Providers', dentureSubsidyProviders: 'Denture Subsidy Providers', disabilityEmploymentResources: 'Disability Employment Resources', shelteredWorkshops: 'Sheltered Workshops', licensedPawnshops: 'Licensed Pawnshops', telepsychology: 'Telepsychology', publicLiabilityInsurance: 'Public Liability Insurance', businessChanges: 'Business Changes', companyChanges: 'Company Changes', laborUnions: 'Labor Unions', infantCareCenters: 'Quasi-Public Infant Care Centers', infantCareEvaluations: 'Infant Care Evaluation', elderlyWelfare: 'Elderly Care', biotechCompanies: 'Biotech Companies', travelAccommodations: 'Travel Accommodations', industryGrants: 'Industry Grant Recipients', metroProcurement: 'Metro Procurement Schedule', registeredCramSchools: 'Registered Cram Schools', registeredHotels: 'Registered Hotels', laborViolations: 'Labor Standards Act Violation Records', consumerDisputeAbsence: 'Consumer Dispute Absence Notices', nangangCompanies: 'Nangang Software Park Companies', animalHospitals: 'Registered Animal Hospitals', veterinarians: 'Veterinarians', comparison: 'District Comparison',
    map: 'Group Map', directory: 'Group Directory', overview: 'Data Overview', notes: 'Data Notes',
    search: 'Search group name, address, phone, or keyword', district: 'District', category: 'Inferred category',
    decade: 'Founded decade', phone: 'Phone data', all: 'All', yes: 'Has phone', no: 'No phone',
    from: 'Year from', to: 'Year to', clear: 'Clear filters', found: 'matching records',
    address: 'Address', phoneLabel: 'Phone', founded: 'Founded date', source: 'Source',
    mapNotice: 'This map shows district-level summaries, not exact group locations.',
    categoryNotice: 'Categories are inferred from organization-name keywords and are not official categories provided by the data source.',
    count: 'Group count', top: 'Top inferred categories', view: 'View directory', more: 'Load more',
    total: 'Total civic groups', withDistrict: 'Records with district', withPhone: 'Records with phone',
    withYear: 'Records with founding year', topDistrict: 'Top district by group count', topCategory: 'Top inferred category',
    oldest: 'Oldest founding year', newest: 'Newest founding year', byDistrict: 'Civic groups by district',
    byDecade: 'Civic groups by founding decade', byYear: 'Civic groups by founding year',
    byCategory: 'Civic groups by inferred category', phoneAvailability: 'Phone availability', districtAvailability: 'District extraction availability',
    disclaimer: 'This site presents Taipei civic group directory records from public data. Addresses, phone numbers, and organization status should be verified with official sources and the organizations themselves. The map shows district-level summaries, not exact group locations. Inferred categories are generated from organization-name keywords and are not official categories provided by the data source.',
    method: 'Processing method', methodText: 'Addresses are matched only against Taipei’s 12 district names. Founding dates support ROC and Gregorian formats. Categories are inferred only from name keywords. Unparsed raw values remain in the directory.',
    fields: 'Field mapping', updated: 'Converted at', noResults: 'No records match these filters.',
    loading: 'Loading data…', loadError: 'Data failed to load. Please refresh the page.',
    footer: 'Data sources: Taipei civic groups, Taipei performing-arts group registry dataset, registered labor unions, Taipei disability employment resource map, Taipei sheltered workshop directory, Taipei City Police Department licensed pawnshop directory, Taipei contracted vaccination medical provider records, Taipei publicly funded HPV vaccination provider records, Taipei child medical subsidy contracted provider records, Taipei denture subsidy medical provider records, Taipei telepsychology counseling institution records, Taipei business premises public liability insurance records, Taipei business registration change records, Taipei company registration change records, industry grants, Taipei biotech company directory records, Metro procurement, registered cram schools, registered hotels, Taipei Travel accommodation dataset, Labor Standards Act violation publication records, Taipei consumer dispute absent business operator notices, Nangang Software Park company directory, Taipei animal hospital directory, Taipei quasi-public infant care center records, Taipei infant care center evaluation results, Taipei elderly welfare institution directory records, and related public data. These datasets have different meanings. Latest official information should be verified with authorities and official systems.',
  },
} as const;

const emptyFilters: CivicGroupFilters = {
  search: '', district: '', category: '', decade: '', yearFrom: '', yearTo: '', phone: '',
};

function BarChart({ data, label }: { data: Array<{ label: string; count: number }>; label: string }) {
  const max = Math.max(...data.map((item) => item.count), 1);
  return <section className="chart">
    <h3>{label}</h3>
    <div className="bars">
      {data.map((item) => <div className="bar-row" key={item.label}>
        <span title={item.label}>{item.label}</span>
        <div><i style={{ width: `${Math.max(2, item.count / max * 100)}%` }} /></div>
        <b>{item.count.toLocaleString()}</b>
      </div>)}
    </div>
  </section>;
}

function FilterPanel({ filters, setFilters, language, decades }: {
  filters: CivicGroupFilters; setFilters: (filters: CivicGroupFilters) => void;
  language: Language; decades: string[];
}) {
  const t = copy[language];
  const update = (key: keyof CivicGroupFilters, value: string) => setFilters({ ...filters, [key]: value });
  return <aside className="filters" aria-label={language === 'zh' ? '篩選條件' : 'Filters'}>
    <label className="search"><span aria-hidden="true">⌕</span><input aria-label={t.search} value={filters.search} onChange={(event) => update('search', event.target.value)} placeholder={t.search} /></label>
    <div className="filter-grid">
      <label>{t.district}<select value={filters.district} onChange={(event) => update('district', event.target.value)}>
        <option value="">{t.all}</option>{DISTRICTS.map((district) => <option key={district}>{district}</option>)}
      </select></label>
      <label>{t.category}<select value={filters.category} onChange={(event) => update('category', event.target.value)}>
        <option value="">{t.all}</option>{CATEGORIES.map((category) => <option value={category} key={category}>{getCategoryLabel(category, language)}</option>)}
      </select></label>
      <label>{t.decade}<select value={filters.decade} onChange={(event) => update('decade', event.target.value)}>
        <option value="">{t.all}</option>{decades.map((decade) => <option value={decade} key={decade}>{language === 'zh' ? decade.replace('s', '年代') : decade}</option>)}
      </select></label>
      <label>{t.phone}<select value={filters.phone} onChange={(event) => update('phone', event.target.value)}>
        <option value="">{t.all}</option><option value="yes">{t.yes}</option><option value="no">{t.no}</option>
      </select></label>
      <label>{t.from}<input type="number" inputMode="numeric" value={filters.yearFrom} onChange={(event) => update('yearFrom', event.target.value)} /></label>
      <label>{t.to}<input type="number" inputMode="numeric" value={filters.yearTo} onChange={(event) => update('yearTo', event.target.value)} /></label>
    </div>
    {Object.values(filters).some(Boolean) && <button className="text-button" onClick={() => setFilters(emptyFilters)}>{t.clear}</button>}
  </aside>;
}

function GroupDirectory({ groups, language }: { groups: CivicGroup[]; language: Language }) {
  const [limit, setLimit] = useState(60);
  const t = copy[language];
  useEffect(() => setLimit(60), [groups]);
  return <div className="directory-list">
    {groups.slice(0, limit).map((group) => <article className="group-row" key={group.id}>
      <div><p className="eyebrow">{group.district ?? (language === 'zh' ? '行政區未辨識' : 'District unavailable')}</p>
        <h3>{group.name}</h3><span className="tag">{getCategoryLabel(group.inferredCategory, language)}</span></div>
      <dl>
        <div><dt>{t.address}</dt><dd>{group.address ?? '—'}</dd></div>
        <div><dt>{t.phoneLabel}</dt><dd>{group.phone ? <a href={`tel:${group.phone}`}>{group.phone}</a> : '—'}</dd></div>
        <div><dt>{t.founded}</dt><dd>{formatFoundedDate(group, language)}{group.foundedYear ? ` · ${group.foundedYear}` : ''}</dd></div>
        <div><dt>{t.source}</dt><dd>{group.source}</dd></div>
      </dl>
    </article>)}
    {!groups.length && <p className="empty">{t.noResults}</p>}
    {limit < groups.length && <button className="load-more" onClick={() => setLimit(limit + 60)}>{t.more} · {groups.length - limit}</button>}
  </div>;
}

function CivicMap({ summary, language, openDistrict }: {
  summary: CivicGroupSummary; language: Language; openDistrict: (district: string) => void;
}) {
  const t = copy[language];
  return <div className="map-wrap">
    <div className="notice">{t.mapNotice}</div>
    <MapContainer center={[25.072, 121.54]} zoom={11} scrollWheelZoom={false}>
      <TileLayer attribution='&copy; OpenStreetMap contributors &copy; CARTO' url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
      {summary.districtSummaries.filter((district) => district.count).map((district) =>
        <CircleMarker key={district.district} center={[district.latitude, district.longitude]}
          radius={Math.max(10, Math.sqrt(district.count) * 1.15)}
          pathOptions={{ fillColor: '#d75b3f', fillOpacity: .72, color: '#fff7e8', weight: 2 }}>
          <Popup><div className="map-popup"><strong>{district.district}</strong>
            <p>{t.count}: {district.count.toLocaleString()}</p><p>{t.top}: {district.topCategories.map((item) => getCategoryLabel(item.category, language)).join('、')}</p>
            <button onClick={() => openDistrict(district.district)}>{t.view}</button></div></Popup>
        </CircleMarker>)}
    </MapContainer>
  </div>;
}

function Overview({ summary, groups, language }: { summary: CivicGroupSummary; groups: CivicGroup[]; language: Language }) {
  const t = copy[language];
  const years = groups.flatMap((group) => group.foundedYear ?? []);
  const topDistrict = summary.byDistrict[0];
  const topCategory = summary.byInferredCategory[0];
  const stats = [
    [t.total, summary.total], [t.withDistrict, summary.recordsWithDistrict], [t.withPhone, summary.recordsWithPhone],
    [t.withYear, summary.recordsWithFoundedYear], [t.topDistrict, topDistrict?.district ?? '—'],
    [t.topCategory, topCategory ? getCategoryLabel(topCategory.category, language) : '—'],
    [t.oldest, years.length ? Math.min(...years) : '—'], [t.newest, years.length ? Math.max(...years) : '—'],
  ];
  const chartYears = summary.byFoundedYear.filter((item) => item.year >= 1900);
  const bucket = Math.max(1, Math.ceil(chartYears.length / 30));
  const compressedYears = Array.from({ length: Math.ceil(chartYears.length / bucket) }, (_, index) => {
    const slice = chartYears.slice(index * bucket, (index + 1) * bucket);
    return { label: slice.length > 1 ? `${slice[0].year}–${slice.at(-1)!.year}` : String(slice[0]?.year), count: slice.reduce((sum, item) => sum + item.count, 0) };
  });
  return <>
    <div className="summary-grid">{stats.map(([label, value]) => <article key={label}><span>{label}</span><strong>{typeof value === 'number' ? value.toLocaleString() : value}</strong></article>)}</div>
    <div className="chart-grid">
      <BarChart label={t.byDistrict} data={summary.byDistrict.map((item) => ({ label: item.district, count: item.count }))} />
      <BarChart label={t.byDecade} data={summary.byFoundedDecade.map((item) => ({ label: language === 'zh' ? item.decade.replace('s', '年代') : item.decade, count: item.count }))} />
      <BarChart label={t.byCategory} data={summary.byInferredCategory.map((item) => ({ label: getCategoryLabel(item.category, language), count: item.count }))} />
      <BarChart label={t.byYear} data={compressedYears} />
      <BarChart label={t.phoneAvailability} data={[
        { label: t.withPhone, count: summary.recordsWithPhone },
        { label: language === 'zh' ? '無電話紀錄' : 'Without phone', count: summary.total - summary.recordsWithPhone },
      ]} />
      <BarChart label={t.districtAvailability} data={[
        { label: t.withDistrict, count: summary.recordsWithDistrict },
        { label: language === 'zh' ? '無法辨識行政區' : 'Without district', count: summary.recordsWithoutDistrict },
      ]} />
    </div>
  </>;
}

function CombinedOverview({ civic, performingArts, vaccinationProviders, hpvProviders, childMedicalSubsidyProviders, dentureSubsidyProviders, disabilityEmploymentResources, shelteredWorkshops, licensedPawnshops, telepsychology, publicLiabilityInsurance, businessChanges, companyChanges, laborUnions, infantCare, infantCareEvaluations, elderlyWelfare, biotechCompanies, travelAccommodations, grants, procurement, cramSchools, hotels, laborViolations, consumerDisputeAbsence, nangangCompanies, animalHospitals, veterinarians, language }: {
  civic: CivicGroupSummary; performingArts: PerformingArtsGroupSummary; vaccinationProviders: ContractedVaccinationMedicalProviderSummary; hpvProviders: PubliclyFundedHpvVaccinationProviderSummary; childMedicalSubsidyProviders: ChildMedicalSubsidyContractedProviderSummary; dentureSubsidyProviders: DentureSubsidyMedicalProviderSummary; disabilityEmploymentResources: DisabilityEmploymentResourceSummary; shelteredWorkshops: ShelteredWorkshopDirectorySummary; licensedPawnshops: LicensedPawnshopDirectorySummary; telepsychology: TelepsychologyCounselingInstitutionSummary; publicLiabilityInsurance: BusinessPremisesPublicLiabilityInsuranceSummary; businessChanges: BusinessRegistrationChangeSummary; companyChanges: CompanyRegistrationChangeSummary; laborUnions: RegisteredLaborUnionSummary; infantCare: QuasiPublicInfantCareCenterSummary; infantCareEvaluations: InfantCareCenterEvaluationSummary; elderlyWelfare: ElderlyWelfareInstitutionSummary; biotechCompanies: BiotechCompanyDirectorySummary; travelAccommodations: TaipeiTravelAccommodationZhSummary; grants: IndustryGrantSummary; procurement: MetroProcurementScheduleSummary; cramSchools: RegisteredCramSchoolSummary; hotels: RegisteredHotelSummary; laborViolations: LaborStandardActViolationSummary; consumerDisputeAbsence: ConsumerDisputeAbsentBusinessOperatorSummary; nangangCompanies: NangangSoftwareParkCompanySummary; animalHospitals: RegisteredAnimalHospitalSummary; veterinarians: VeterinarianProfessionalRegistrySummary; language: Language;
}) {
  const zh = language === 'zh';
  return <section className="workspace"><div className="section-heading"><p>08 / PUBLIC RECORDS OVERVIEW</p><h2>{zh ? '資料概覽' : 'Data Overview'}</h2></div>
    <div className="notice subtle">{zh ? '此圖僅比較公開資料中的紀錄數與來源欄位，不代表資料重要性、政策成效、法律狀態、會員資格、醫療品質、即時營業狀態、推薦程度或官方背書。' : 'This chart only compares public-data record counts and source fields. It does not represent data importance, policy effectiveness, legal status, membership eligibility, medical quality, real-time operating status, recommendation, or official endorsement.'}</div>
    <div className="summary-grid"><article><span>{zh ? '人民團體紀錄' : 'Civic group records'}</span><strong>{civic.total.toLocaleString()}</strong></article>
      <article><span>{zh ? '演藝團體數' : 'Performing arts group count'}</span><strong>{performingArts.totalRecords.toLocaleString()}</strong></article>
      <article><span>{zh ? '演藝團體有網址紀錄' : 'Performing arts records with website'}</span><strong>{performingArts.recordsWithWebsite.toLocaleString()}</strong></article>
      <article><span>{zh ? '預防接種合約院所數' : 'Vaccination provider records'}</span><strong>{vaccinationProviders.totalRecords.toLocaleString()}</strong></article>
      <article><span>{zh ? 'COVID-19院所數' : 'COVID-19 provider count'}</span><strong>{vaccinationProviders.providerCategorySummary.covidProviderCount.toLocaleString()}</strong></article>
      <article><span>{zh ? 'HPV疫苗特約院所數' : 'HPV vaccination provider count'}</span><strong>{hpvProviders.totalRecords.toLocaleString()}</strong></article>
      <article><span>{zh ? 'HPV院所涵蓋行政區數' : 'HPV districts covered'}</span><strong>{hpvProviders.districtCount.toLocaleString()}</strong></article>
      <article><span>{zh ? '兒童醫療補助特約院所數' : 'Child medical subsidy provider count'}</span><strong>{childMedicalSubsidyProviders.totalRecords.toLocaleString()}</strong></article>
      <article><span>{zh ? '兒童醫療補助院所涵蓋地區' : 'Child subsidy areas covered'}</span><strong>{childMedicalSubsidyProviders.administrativeAreaCount.toLocaleString()}</strong></article>
      <article><span>{zh ? '假牙補助醫療院所數' : 'Denture subsidy provider count'}</span><strong>{dentureSubsidyProviders.totalRecords.toLocaleString()}</strong></article>
      <article><span>{zh ? '假牙補助院所涵蓋區域' : 'Denture subsidy areas covered'}</span><strong>{dentureSubsidyProviders.administrativeAreaCount.toLocaleString()}</strong></article>
      <article><span>{zh ? '身障就業資源數' : 'Disability employment resource count'}</span><strong>{disabilityEmploymentResources.totalRecords.toLocaleString()}</strong></article>
      <article><span>{zh ? '身障就業資源涵蓋行政區' : 'Disability resource districts covered'}</span><strong>{disabilityEmploymentResources.taipeiDistrictCount.toLocaleString()}</strong></article>
      <article><span>{zh ? '庇護工場數' : 'Sheltered workshop count'}</span><strong>{shelteredWorkshops.totalRecords.toLocaleString()}</strong></article>
      <article><span>{zh ? '庇護工場涵蓋行政區' : 'Sheltered workshop districts covered'}</span><strong>{shelteredWorkshops.taipeiDistrictCount.toLocaleString()}</strong></article>
      <article><span>{zh ? '合法當舖數' : 'Licensed pawnshop count'}</span><strong>{licensedPawnshops.totalRecords.toLocaleString()}</strong></article>
      <article><span>{zh ? '不重複許可證號數' : 'Unique license number count'}</span><strong>{licensedPawnshops.uniqueLicenseNumberCount.toLocaleString()}</strong></article>
      <article><span>{zh ? '通訊心理諮商機構數' : 'Telepsychology institution count'}</span><strong>{telepsychology.totalRecords.toLocaleString()}</strong></article>
      <article><span>{zh ? '有手機心理機構紀錄' : 'Mental-health records with mobile'}</span><strong>{telepsychology.recordsWithMobile.toLocaleString()}</strong></article>
      <article><span>{zh ? '公共意外險清冊紀錄' : 'Public liability insurance records'}</span><strong>{publicLiabilityInsurance.totalRecords.toLocaleString()}</strong></article>
      <article><span>{zh ? '公共意外險有效座標' : 'Insurance records with coordinates'}</span><strong>{publicLiabilityInsurance.recordsWithValidCoordinates.toLocaleString()}</strong></article>
      <article><span>{zh ? '商業異動紀錄' : 'Business change records'}</span><strong>{businessChanges.totalRecords.toLocaleString()}</strong></article>
      <article><span>{zh ? '商業異動有效座標' : 'Business changes with coordinates'}</span><strong>{businessChanges.recordsWithValidCoordinates.toLocaleString()}</strong></article>
      <article><span>{zh ? '公司異動紀錄數' : 'Company change record count'}</span><strong>{companyChanges.totalRecords.toLocaleString()}</strong></article>
      <article><span>{zh ? '公司異動有效座標' : 'Company changes with coordinates'}</span><strong>{companyChanges.recordsWithValidCoordinates.toLocaleString()}</strong></article>
      <article><span>{zh ? '工會名單紀錄' : 'Labor union records'}</span><strong>{laborUnions.totalRecords.toLocaleString()}</strong></article>
      <article><span>{zh ? '托嬰中心數' : 'Infant care centers'}</span><strong>{infantCare.totalRecords.toLocaleString()}</strong></article>
      <article><span>{zh ? '托嬰評鑑機構數' : 'Infant care evaluation institutions'}</span><strong>{infantCareEvaluations.totalInstitutions.toLocaleString()}</strong></article>
      <article><span>{zh ? '核定收托人數總計' : 'Total approved capacity'}</span><strong>{infantCare.totalApprovedCapacity?.toLocaleString() ?? '—'}</strong></article>
      <article><span>{zh ? '老人福利機構數' : 'Elderly care institutions'}</span><strong>{elderlyWelfare.totalRecords.toLocaleString()}</strong></article>
      <article><span>{zh ? '老人福利機構核定床位' : 'Elderly care approved beds'}</span><strong>{elderlyWelfare.totalApprovedBeds.toLocaleString()}</strong></article>
      <article><span>{zh ? '生技廠商數' : 'Biotech company count'}</span><strong>{biotechCompanies.totalRecords.toLocaleString()}</strong></article>
      <article><span>{zh ? '生技廠商有效座標' : 'Biotech valid coordinates'}</span><strong>{biotechCompanies.recordsWithValidCoordinates.toLocaleString()}</strong></article>
      <article><span>{zh ? '臺北旅遊網住宿紀錄' : 'Taipei Travel accommodation records'}</span><strong>{travelAccommodations.totalRecords.toLocaleString()}</strong></article>
      <article><span>{zh ? '表列房間數總計' : 'Listed total room count'}</span><strong>{travelAccommodations.totalRoomCount?.toLocaleString() ?? '—'}</strong></article>
      <article><span>{zh ? '補助紀錄' : 'Subsidy records'}</span><strong>{grants.totalRecords.toLocaleString()}</strong></article>
      <article><span>{zh ? '獲補助廠商' : 'Grant recipient companies'}</span><strong>{grants.uniqueCompanyCount.toLocaleString()}</strong></article>
      <article><span>{zh ? '捷運採購時程紀錄' : 'Metro procurement schedule records'}</span><strong>{procurement.totalRecords.toLocaleString()}</strong></article>
      <article><span>{zh ? '立案補習班紀錄' : 'Registered cram-school records'}</span><strong>{cramSchools.totalRecords.toLocaleString()}</strong></article>
      <article><span>{zh ? '一般旅館登記紀錄' : 'Registered hotel records'}</span><strong>{hotels.totalRecords.toLocaleString()}</strong></article>
      <article><span>{zh ? '勞基法違規公布紀錄' : 'Labor violation publication records'}</span><strong>{laborViolations.totalRecords.toLocaleString()}</strong></article>
      <article><span>{zh ? '消費爭議不到場公告' : 'Consumer dispute absence notices'}</span><strong>{consumerDisputeAbsence.totalRecords.toLocaleString()}</strong></article></div>
    <div className="summary-grid"><article><span>{zh ? '園區廠商紀錄' : 'Industry park company records'}</span><strong>{nangangCompanies.totalRecords.toLocaleString()}</strong></article><article><span>{zh ? '園區有效座標' : 'Valid park coordinates'}</span><strong>{nangangCompanies.recordsWithValidCoordinates.toLocaleString()}</strong></article><article><span>{zh ? '動物醫院數' : 'Animal hospital count'}</span><strong>{animalHospitals.totalRecords.toLocaleString()}</strong></article><article><span>{zh ? '動物醫院最多行政區' : 'Top animal-hospital district'}</span><strong>{animalHospitals.byDistrict[0]?.district ?? '—'}</strong></article><article><span>{zh ? '獸醫師資訊紀錄' : 'Veterinarian records'}</span><strong>{veterinarians.totalRecords.toLocaleString()}</strong></article><article><span>{zh ? '服務獸醫診療機構數' : 'Service veterinary institutions'}</span><strong>{veterinarians.uniqueServiceVeterinaryInstitutionNameCount.toLocaleString()}</strong></article></div>
    <div className="chart-grid"><BarChart label={zh ? '各行政區人民團體數' : 'Civic groups by district'} data={civic.byDistrict.map((item) => ({ label: item.district, count: item.count }))} />
      <BarChart label={zh ? '各行政區演藝團體數' : 'Performing arts groups by district'} data={performingArts.byDistrict.map((item) => ({ label: item.district, count: item.groupCount }))} />
      <BarChart label={zh ? '各行政區預防接種合約院所數' : 'Vaccination providers by district'} data={vaccinationProviders.byDistrict.map((item) => ({ label: item.district, count: item.providerCount }))} />
      <BarChart label={zh ? '各行政區HPV疫苗特約院所數' : 'HPV providers by district'} data={hpvProviders.byDistrict.map((item) => ({ label: item.district, count: item.providerCount }))} />
      <BarChart label={zh ? '兒童醫療補助各地區院所數' : 'Child subsidy providers by area'} data={childMedicalSubsidyProviders.byAdministrativeArea.map((item) => ({ label: item.administrativeArea, count: item.providerCount }))} />
      <BarChart label={zh ? '假牙補助各區域院所數' : 'Denture subsidy providers by area'} data={dentureSubsidyProviders.byAdministrativeArea.map((item) => ({ label: item.administrativeArea, count: item.providerCount }))} />
      <BarChart label={zh ? '各行政區身障就業資源數' : 'Disability employment resources by district'} data={disabilityEmploymentResources.byDistrict.map((item) => ({ label: item.district, count: item.resourceCount }))} />
      <BarChart label={zh ? '各行政區庇護工場數' : 'Sheltered workshops by district'} data={shelteredWorkshops.byDistrict.map((item) => ({ label: item.district, count: item.workshopCount }))} />
      <BarChart label={zh ? '各行政區當舖數' : 'Pawnshops by district'} data={licensedPawnshops.byDistrict.map((item) => ({ label: item.district, count: item.pawnshopCount }))} />
      <BarChart label={zh ? '各行政區通訊心理諮商機構數' : 'Telepsychology institutions by district'} data={telepsychology.byDistrict.map((item) => ({ label: item.district, count: item.institutionCount }))} />
      <BarChart label={zh ? '各行政區公共意外險清冊紀錄數' : 'Public liability insurance records by district'} data={publicLiabilityInsurance.byDistrict.map((item) => ({ label: item.district, count: item.recordCount }))} />
      <BarChart label={zh ? '各行政區商業異動紀錄數' : 'Business changes by district'} data={businessChanges.byDistrict.map((item) => ({ label: item.district, count: item.totalCount }))} />
      <BarChart label={zh ? '各行政區公司異動紀錄數' : 'Company changes by district'} data={companyChanges.byDistrict.map((item) => ({ label: item.district, count: item.totalCount }))} />
      <BarChart label={zh ? '各申請類別演藝團體數' : 'Performing arts groups by application category'} data={performingArts.byApplicationCategory.map((item) => ({ label: item.applicationCategoryRaw ?? item.applicationCategory, count: item.count }))} />
      <BarChart label={zh ? '各行政區工會數' : 'Labor unions by district'} data={laborUnions.byDistrict.map((item) => ({ label: item.district, count: item.count }))} />
      <BarChart label={zh ? '各行政區托嬰中心數' : 'Infant care centers by district'} data={infantCare.byDistrict.map((item) => ({ label: item.district, count: item.centerCount }))} />
      <BarChart label={zh ? '各行政區托嬰評鑑機構數' : 'Infant care evaluation institutions by district'} data={infantCareEvaluations.byDistrictLatestYear.map((item) => ({ label: item.district, count: item.institutionCount }))} />
      <BarChart label={zh ? '各行政區老人福利機構數' : 'Elderly care institutions by district'} data={elderlyWelfare.byDistrict.map((item) => ({ label: item.district, count: item.institutionCount }))} />
      <BarChart label={zh ? '各行政區生技廠商數' : 'Biotech companies by district'} data={biotechCompanies.byDistrict.map((item) => ({ label: item.district, count: item.companyCount }))} />
      <BarChart label={zh ? '各行政區旅遊住宿數' : 'Travel accommodations by district'} data={travelAccommodations.byDistrict.map((item) => ({ label: item.district, count: item.accommodationCount }))} />
      <BarChart label={zh ? '各行政區補助紀錄數' : 'Grant records by district'} data={grants.byDistrict.map((item) => ({ label: item.district, count: item.recordCount }))} />
      <BarChart label={zh ? '各行政區立案補習班數' : 'Registered cram schools by district'} data={cramSchools.byDistrict.map((item) => ({ label: item.district, count: item.recordCount }))} />
      <BarChart label={zh ? '各行政區一般旅館數' : 'Registered hotels by district'} data={hotels.byDistrict.map((item) => ({ label: item.district, count: item.recordCount }))} />
      <BarChart label={zh ? '各行政區動物醫院數' : 'Animal hospitals by district'} data={animalHospitals.byDistrict.map((item) => ({ label: item.district, count: item.count }))} />
      <BarChart label={zh ? '服務獸醫診療機構前 30 名' : 'Top 30 service veterinary institutions'} data={veterinarians.topServiceVeterinaryInstitutions.map((item) => ({ label: item.serviceVeterinaryInstitutionName, count: item.veterinarianCount }))} />
      <BarChart label={zh ? '不同公開資料模組紀錄數' : 'Record count by public-data module'} data={[
        { label: zh ? '人民團體' : 'Civic groups', count: civic.total },
        { label: zh ? '演藝團體' : 'Performing arts groups', count: performingArts.totalRecords },
        { label: zh ? '預防接種院所' : 'Vaccination providers', count: vaccinationProviders.totalRecords },
        { label: zh ? 'HPV疫苗院所' : 'HPV providers', count: hpvProviders.totalRecords },
        { label: zh ? '兒童醫療補助院所' : 'Child subsidy providers', count: childMedicalSubsidyProviders.totalRecords },
        { label: zh ? '假牙補助院所' : 'Denture subsidy providers', count: dentureSubsidyProviders.totalRecords },
        { label: zh ? '身障就業資源' : 'Disability employment resources', count: disabilityEmploymentResources.totalRecords },
        { label: zh ? '庇護工場' : 'Sheltered workshops', count: shelteredWorkshops.totalRecords },
        { label: zh ? '合法當舖' : 'Licensed pawnshops', count: licensedPawnshops.totalRecords },
        { label: zh ? '通訊心理諮商' : 'Telepsychology', count: telepsychology.totalRecords },
        { label: zh ? '公共意外險' : 'Public liability insurance', count: publicLiabilityInsurance.totalRecords },
        { label: zh ? '商業異動' : 'Business changes', count: businessChanges.totalRecords },
        { label: zh ? '公司異動' : 'Company changes', count: companyChanges.totalRecords },
        { label: zh ? '工會名單' : 'Labor unions', count: laborUnions.totalRecords },
        { label: zh ? '托嬰中心' : 'Infant care centers', count: infantCare.totalRecords },
        { label: zh ? '托嬰評鑑' : 'Infant care evaluations', count: infantCareEvaluations.totalInstitutions },
        { label: zh ? '老人福利機構' : 'Elderly care institutions', count: elderlyWelfare.totalRecords },
        { label: zh ? '生技廠商' : 'Biotech companies', count: biotechCompanies.totalRecords },
        { label: zh ? '旅遊住宿' : 'Travel accommodations', count: travelAccommodations.totalRecords },
        { label: zh ? '產業補助' : 'Industry grants', count: grants.totalRecords },
        { label: zh ? '捷運採購時程' : 'Metro procurement', count: procurement.totalRecords },
        { label: zh ? '立案補習班' : 'Registered cram schools', count: cramSchools.totalRecords },
        { label: zh ? '一般旅館名冊' : 'Registered hotels', count: hotels.totalRecords },
        { label: zh ? '勞基法違規公布' : 'Labor violations', count: laborViolations.totalRecords },
        { label: zh ? '消費爭議不到場公告' : 'Consumer dispute notices', count: consumerDisputeAbsence.totalRecords },
        { label: zh ? '南港軟體園區廠商' : 'Nangang park companies', count: nangangCompanies.totalRecords },
        { label: zh ? '動物醫院' : 'Animal hospitals', count: animalHospitals.totalRecords },
        { label: zh ? '獸醫師資訊' : 'Veterinarians', count: veterinarians.totalRecords },
      ]} /></div>
  </section>;
}

export default function App() {
  const [language, setLanguage] = useState<Language>('zh');
  const [tab, setTab] = useState<'civic' | 'performingArts' | 'vaccinationProviders' | 'hpvProviders' | 'childMedicalSubsidyProviders' | 'dentureSubsidyProviders' | 'disabilityEmploymentResources' | 'shelteredWorkshops' | 'licensedPawnshops' | 'telepsychology' | 'publicLiabilityInsurance' | 'businessChanges' | 'companyChanges' | 'laborUnions' | 'infantCare' | 'infantCareEvaluations' | 'elderlyWelfare' | 'biotechCompanies' | 'travelAccommodations' | 'grants' | 'procurement' | 'cramSchools' | 'hotels' | 'laborViolations' | 'consumerDisputeAbsence' | 'nangangCompanies' | 'animalHospitals' | 'veterinarians' | 'comparison' | 'overview' | 'notes'>('civic');
  const [civicView, setCivicView] = useState<'map' | 'directory' | 'overview'>('map');
  const [groups, setGroups] = useState<CivicGroup[]>([]);
  const [summary, setSummary] = useState<CivicGroupSummary | null>(null);
  const [performingArtsRecords, setPerformingArtsRecords] = useState<PerformingArtsGroupRecord[]>([]);
  const [performingArtsSummary, setPerformingArtsSummary] = useState<PerformingArtsGroupSummary | null>(null);
  const [vaccinationProviderRecords, setVaccinationProviderRecords] = useState<ContractedVaccinationMedicalProviderRecord[]>([]);
  const [vaccinationProviderSummary, setVaccinationProviderSummary] = useState<ContractedVaccinationMedicalProviderSummary | null>(null);
  const [hpvProviderRecords, setHpvProviderRecords] = useState<PubliclyFundedHpvVaccinationProviderRecord[]>([]);
  const [hpvProviderSummary, setHpvProviderSummary] = useState<PubliclyFundedHpvVaccinationProviderSummary | null>(null);
  const [childMedicalSubsidyProviderRecords, setChildMedicalSubsidyProviderRecords] = useState<ChildMedicalSubsidyContractedProviderRecord[]>([]);
  const [childMedicalSubsidyProviderSummary, setChildMedicalSubsidyProviderSummary] = useState<ChildMedicalSubsidyContractedProviderSummary | null>(null);
  const [dentureSubsidyProviderRecords, setDentureSubsidyProviderRecords] = useState<DentureSubsidyMedicalProviderRecord[]>([]);
  const [dentureSubsidyProviderSummary, setDentureSubsidyProviderSummary] = useState<DentureSubsidyMedicalProviderSummary | null>(null);
  const [disabilityEmploymentResourceRecords, setDisabilityEmploymentResourceRecords] = useState<DisabilityEmploymentResourceRecord[]>([]);
  const [disabilityEmploymentResourceSummary, setDisabilityEmploymentResourceSummary] = useState<DisabilityEmploymentResourceSummary | null>(null);
  const [shelteredWorkshopRecords, setShelteredWorkshopRecords] = useState<ShelteredWorkshopDirectoryRecord[]>([]);
  const [shelteredWorkshopSummary, setShelteredWorkshopSummary] = useState<ShelteredWorkshopDirectorySummary | null>(null);
  const [licensedPawnshopRecords, setLicensedPawnshopRecords] = useState<LicensedPawnshopDirectoryRecord[]>([]);
  const [licensedPawnshopSummary, setLicensedPawnshopSummary] = useState<LicensedPawnshopDirectorySummary | null>(null);
  const [telepsychologyRecords, setTelepsychologyRecords] = useState<TelepsychologyCounselingInstitutionRecord[]>([]);
  const [telepsychologySummary, setTelepsychologySummary] = useState<TelepsychologyCounselingInstitutionSummary | null>(null);
  const [publicLiabilityRecords, setPublicLiabilityRecords] = useState<BusinessPremisesPublicLiabilityInsuranceRecord[]>([]);
  const [publicLiabilitySummary, setPublicLiabilitySummary] = useState<BusinessPremisesPublicLiabilityInsuranceSummary | null>(null);
  const [businessChangeRecords, setBusinessChangeRecords] = useState<BusinessRegistrationChangeRecord[]>([]);
  const [businessChangeSummary, setBusinessChangeSummary] = useState<BusinessRegistrationChangeSummary | null>(null);
  const [companyChangeRecords, setCompanyChangeRecords] = useState<CompanyRegistrationChangeRecord[]>([]);
  const [companyChangeSummary, setCompanyChangeSummary] = useState<CompanyRegistrationChangeSummary | null>(null);
  const [laborUnionRecords, setLaborUnionRecords] = useState<RegisteredLaborUnion[]>([]);
  const [laborUnionSummary, setLaborUnionSummary] = useState<RegisteredLaborUnionSummary | null>(null);
  const [infantCareRecords, setInfantCareRecords] = useState<QuasiPublicInfantCareCenter[]>([]);
  const [infantCareSummary, setInfantCareSummary] = useState<QuasiPublicInfantCareCenterSummary | null>(null);
  const [infantCareEvaluationInstitutions, setInfantCareEvaluationInstitutions] = useState<InfantCareCenterEvaluationInstitutionRecord[]>([]);
  const [infantCareEvaluationYearRecords, setInfantCareEvaluationYearRecords] = useState<InfantCareCenterEvaluationYearRecord[]>([]);
  const [infantCareEvaluationSummary, setInfantCareEvaluationSummary] = useState<InfantCareCenterEvaluationSummary | null>(null);
  const [elderlyWelfareRecords, setElderlyWelfareRecords] = useState<ElderlyWelfareInstitutionRecord[]>([]);
  const [elderlyWelfareSummary, setElderlyWelfareSummary] = useState<ElderlyWelfareInstitutionSummary | null>(null);
  const [biotechCompanyRecords, setBiotechCompanyRecords] = useState<BiotechCompanyDirectoryRecord[]>([]);
  const [biotechCompanySummary, setBiotechCompanySummary] = useState<BiotechCompanyDirectorySummary | null>(null);
  const [travelAccommodationRecords, setTravelAccommodationRecords] = useState<TaipeiTravelAccommodationZhRecord[]>([]);
  const [travelAccommodationSummary, setTravelAccommodationSummary] = useState<TaipeiTravelAccommodationZhSummary | null>(null);
  const [grantRecords, setGrantRecords] = useState<IndustryGrantRecipient[]>([]);
  const [grantSummary, setGrantSummary] = useState<IndustryGrantSummary | null>(null);
  const [procurementRecords, setProcurementRecords] = useState<MetroProcurementScheduleRecord[]>([]);
  const [procurementSummary, setProcurementSummary] = useState<MetroProcurementScheduleSummary | null>(null);
  const [cramSchoolRecords, setCramSchoolRecords] = useState<RegisteredCramSchool[]>([]);
  const [cramSchoolSummary, setCramSchoolSummary] = useState<RegisteredCramSchoolSummary | null>(null);
  const [hotelRecords, setHotelRecords] = useState<RegisteredHotel[]>([]);
  const [hotelSummary, setHotelSummary] = useState<RegisteredHotelSummary | null>(null);
  const [laborViolationSummary, setLaborViolationSummary] = useState<LaborStandardActViolationSummary | null>(null);
  const [laborViolationManifest, setLaborViolationManifest] = useState<LaborStandardActViolationManifest | null>(null);
  const [consumerDisputeRecords, setConsumerDisputeRecords] = useState<ConsumerDisputeAbsentBusinessOperatorRecord[]>([]);
  const [consumerDisputeSummary, setConsumerDisputeSummary] = useState<ConsumerDisputeAbsentBusinessOperatorSummary | null>(null);
  const [nangangCompanyRecords, setNangangCompanyRecords] = useState<NangangSoftwareParkCompany[]>([]);
  const [nangangCompanySummary, setNangangCompanySummary] = useState<NangangSoftwareParkCompanySummary | null>(null);
  const [animalHospitalRecords, setAnimalHospitalRecords] = useState<RegisteredAnimalHospital[]>([]);
  const [animalHospitalSummary, setAnimalHospitalSummary] = useState<RegisteredAnimalHospitalSummary | null>(null);
  const [veterinarianRecords, setVeterinarianRecords] = useState<VeterinarianProfessionalRegistryRecord[]>([]);
  const [veterinarianSummary, setVeterinarianSummary] = useState<VeterinarianProfessionalRegistrySummary | null>(null);
  const [report, setReport] = useState<{
    convertedAt?: string; performingArtsGroups?: { convertedAt?: string }; contractedVaccinationMedicalProviders?: { convertedAt?: string }; publiclyFundedHpvVaccinationProviders?: { convertedAt?: string }; childMedicalSubsidyContractedProviders?: { convertedAt?: string }; dentureSubsidyMedicalProviders?: { convertedAt?: string }; disabilityEmploymentResourceMap?: { convertedAt?: string }; shelteredWorkshopDirectory?: { convertedAt?: string }; licensedPawnshopDirectory?: { convertedAt?: string }; telepsychologyCounselingInstitutions?: { convertedAt?: string }; businessPremisesPublicLiabilityInsuranceRecords?: { convertedAt?: string }; businessRegistrationChangeRecords?: { convertedAt?: string }; companyRegistrationChangeRecords?: { convertedAt?: string }; registeredLaborUnions?: { convertedAt?: string }; quasiPublicInfantCareCenters?: { convertedAt?: string }; infantCareCenterEvaluationResults?: { convertedAt?: string }; elderlyWelfareInstitutions?: { convertedAt?: string }; biotechCompanyDirectory?: { convertedAt?: string }; taipeiTravelAccommodationsZh?: { convertedAt?: string }; industryGrantRecipients?: { convertedAt?: string }; metroProcurementSchedules?: { convertedAt?: string }; registeredCramSchools?: { convertedAt?: string }; registeredHotels?: { convertedAt?: string }; laborStandardActViolationRecords?: { convertedAt?: string }; consumerDisputeAbsentBusinessOperators?: { convertedAt?: string }; nangangSoftwareParkCompanies?: { convertedAt?: string }; registeredAnimalHospitals?: { convertedAt?: string }; veterinarianProfessionalRegistry?: { convertedAt?: string };
  }>({});
  const [filters, setFilters] = useState(emptyFilters);
  const [loadError, setLoadError] = useState(false);
  const t = copy[language];

  useEffect(() => {
    const loadJson = async (path: string) => {
      const response = await fetch(`${import.meta.env.BASE_URL}${path}`);
      if (!response.ok) throw new Error(`${path}: ${response.status}`);
      return response.json();
    };
    Promise.all([
      loadJson('data/civic-groups.json'),
      loadJson('data/civic-group-summary.json'),
      loadJson('data/performing-arts-groups.json'),
      loadJson('data/performing-arts-group-summary.json'),
      loadJson('data/contracted-vaccination-medical-providers.json'),
      loadJson('data/contracted-vaccination-medical-provider-summary.json'),
      loadJson('data/publicly-funded-hpv-vaccination-providers.json'),
      loadJson('data/publicly-funded-hpv-vaccination-provider-summary.json'),
      loadJson('data/child-medical-subsidy-contracted-providers.json'),
      loadJson('data/child-medical-subsidy-contracted-provider-summary.json'),
      loadJson('data/denture-subsidy-medical-providers.json'),
      loadJson('data/denture-subsidy-medical-provider-summary.json'),
      loadJson('data/disability-employment-resource-map.json'),
      loadJson('data/disability-employment-resource-map-summary.json'),
      loadJson('data/sheltered-workshop-directory.json'),
      loadJson('data/sheltered-workshop-directory-summary.json'),
      loadJson('data/licensed-pawnshop-directory.json'),
      loadJson('data/licensed-pawnshop-directory-summary.json'),
      loadJson('data/telepsychology-counseling-institutions.json'),
      loadJson('data/telepsychology-counseling-institution-summary.json'),
      loadJson('data/business-premises-public-liability-insurance-records.json'),
      loadJson('data/business-premises-public-liability-insurance-summary.json'),
      loadJson('data/business-registration-change-records.json'),
      loadJson('data/business-registration-change-summary.json'),
      loadJson('data/company-registration-change-records.json'),
      loadJson('data/company-registration-change-summary.json'),
      loadJson('data/registered-labor-unions.json'),
      loadJson('data/registered-labor-union-summary.json'),
      loadJson('data/quasi-public-infant-care-centers.json'),
      loadJson('data/quasi-public-infant-care-center-summary.json'),
      loadJson('data/infant-care-center-evaluation-institutions.json'),
      loadJson('data/infant-care-center-evaluation-year-records.json'),
      loadJson('data/infant-care-center-evaluation-summary.json'),
      loadJson('data/elderly-welfare-institutions.json'),
      loadJson('data/elderly-welfare-institution-summary.json'),
      loadJson('data/biotech-company-directory.json'),
      loadJson('data/biotech-company-directory-summary.json'),
      loadJson('data/taipei-travel-accommodations-zh.json'),
      loadJson('data/taipei-travel-accommodation-zh-summary.json'),
      loadJson('data/industry-grant-recipients.json'),
      loadJson('data/industry-grant-summary.json'),
      loadJson('data/metro-procurement-schedules.json'),
      loadJson('data/metro-procurement-summary.json'),
      loadJson('data/registered-cram-schools.json'),
      loadJson('data/registered-cram-school-summary.json'),
      loadJson('data/registered-hotels.json'),
      loadJson('data/registered-hotel-summary.json'),
      loadJson('data/labor-standard-act-violation-summary.json'),
      loadJson('data/labor-standard-act-violation-records/manifest.json'),
      loadJson('data/consumer-dispute-absent-business-operators.json'),
      loadJson('data/consumer-dispute-absent-business-operator-summary.json'),
      loadJson('data/nangang-software-park-companies.json'),
      loadJson('data/nangang-software-park-company-summary.json'),
      loadJson('data/registered-animal-hospitals.json'),
      loadJson('data/registered-animal-hospital-summary.json'),
      loadJson('data/veterinarian-professional-registry.json'),
      loadJson('data/veterinarian-professional-registry-summary.json'),
      loadJson('data/conversion-report.json'),
    ]).then(([groupData, summaryData, performingArtsData, performingArtsSummaryData, vaccinationProviderData, vaccinationProviderSummaryData, hpvProviderData, hpvProviderSummaryData, childMedicalSubsidyProviderData, childMedicalSubsidyProviderSummaryData, dentureSubsidyProviderData, dentureSubsidyProviderSummaryData, disabilityEmploymentResourceData, disabilityEmploymentResourceSummaryData, shelteredWorkshopData, shelteredWorkshopSummaryData, licensedPawnshopData, licensedPawnshopSummaryData, telepsychologyData, telepsychologySummaryData, publicLiabilityData, publicLiabilitySummaryData, businessChangeData, businessChangeSummaryData, companyChangeData, companyChangeSummaryData, laborUnionData, laborUnionSummaryData, infantCareData, infantCareSummaryData, infantCareEvaluationData, infantCareEvaluationYearData, infantCareEvaluationSummaryData, elderlyWelfareData, elderlyWelfareSummaryData, biotechData, biotechSummaryData, travelData, travelSummaryData, grantData, grantSummaryData, procurementData, procurementSummaryData, cramSchoolData, cramSchoolSummaryData, hotelData, hotelSummaryData, laborSummaryData, laborManifestData, consumerDisputeData, consumerDisputeSummaryData, nangangData, nangangSummaryData, animalData, animalSummaryData, veterinarianData, veterinarianSummaryData, reportData]) => {
      setGroups(groupData); setSummary(summaryData); setGrantRecords(grantData); setGrantSummary(grantSummaryData);
      setPerformingArtsRecords(performingArtsData); setPerformingArtsSummary(performingArtsSummaryData);
      setVaccinationProviderRecords(vaccinationProviderData); setVaccinationProviderSummary(vaccinationProviderSummaryData);
      setHpvProviderRecords(hpvProviderData); setHpvProviderSummary(hpvProviderSummaryData);
      setChildMedicalSubsidyProviderRecords(childMedicalSubsidyProviderData); setChildMedicalSubsidyProviderSummary(childMedicalSubsidyProviderSummaryData);
      setDentureSubsidyProviderRecords(dentureSubsidyProviderData); setDentureSubsidyProviderSummary(dentureSubsidyProviderSummaryData);
      setDisabilityEmploymentResourceRecords(disabilityEmploymentResourceData); setDisabilityEmploymentResourceSummary(disabilityEmploymentResourceSummaryData);
      setShelteredWorkshopRecords(shelteredWorkshopData); setShelteredWorkshopSummary(shelteredWorkshopSummaryData);
      setLicensedPawnshopRecords(licensedPawnshopData); setLicensedPawnshopSummary(licensedPawnshopSummaryData);
      setTelepsychologyRecords(telepsychologyData); setTelepsychologySummary(telepsychologySummaryData);
      setPublicLiabilityRecords(publicLiabilityData); setPublicLiabilitySummary(publicLiabilitySummaryData);
      setBusinessChangeRecords(businessChangeData); setBusinessChangeSummary(businessChangeSummaryData);
      setCompanyChangeRecords(companyChangeData); setCompanyChangeSummary(companyChangeSummaryData);
      setLaborUnionRecords(laborUnionData); setLaborUnionSummary(laborUnionSummaryData);
      setInfantCareRecords(infantCareData); setInfantCareSummary(infantCareSummaryData);
      setInfantCareEvaluationInstitutions(infantCareEvaluationData); setInfantCareEvaluationYearRecords(infantCareEvaluationYearData); setInfantCareEvaluationSummary(infantCareEvaluationSummaryData);
      setElderlyWelfareRecords(elderlyWelfareData); setElderlyWelfareSummary(elderlyWelfareSummaryData);
      setBiotechCompanyRecords(biotechData); setBiotechCompanySummary(biotechSummaryData);
      setTravelAccommodationRecords(travelData); setTravelAccommodationSummary(travelSummaryData);
      setProcurementRecords(procurementData); setProcurementSummary(procurementSummaryData);
      setCramSchoolRecords(cramSchoolData); setCramSchoolSummary(cramSchoolSummaryData);
      setHotelRecords(hotelData); setHotelSummary(hotelSummaryData);
      setLaborViolationSummary(laborSummaryData); setLaborViolationManifest(laborManifestData); setReport(reportData);
      setConsumerDisputeRecords(consumerDisputeData); setConsumerDisputeSummary(consumerDisputeSummaryData);
      setNangangCompanyRecords(nangangData); setNangangCompanySummary(nangangSummaryData);
      setAnimalHospitalRecords(animalData); setAnimalHospitalSummary(animalSummaryData);
      setVeterinarianRecords(veterinarianData); setVeterinarianSummary(veterinarianSummaryData);
    }).catch(() => setLoadError(true));
  }, []);

  useEffect(() => {
    document.documentElement.lang = language === 'zh' ? 'zh-Hant' : 'en';
    document.title = t.title;
  }, [language, t.title]);

  const filtered = useMemo(() => filterCivicGroups(groups, filters, language), [groups, filters, language]);
  const hasFilters = Object.values(filters).some(Boolean);
  const activeSummary = useMemo(
    () => summary && hasFilters ? buildCivicGroupSummary(filtered) : summary,
    [filtered, hasFilters, summary],
  );
  const decades = useMemo(() => [...new Set(groups.flatMap((group) => group.foundedDecade ?? []))].sort(), [groups]);
  const openDistrict = (district: string) => { setFilters({ ...emptyFilters, district }); setCivicView('directory'); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const tabs = [
    ['civic', t.civicGroups], ['performingArts', t.performingArtsGroups], ['vaccinationProviders', t.vaccinationProviders], ['hpvProviders', t.hpvProviders], ['childMedicalSubsidyProviders', t.childMedicalSubsidyProviders], ['dentureSubsidyProviders', t.dentureSubsidyProviders], ['disabilityEmploymentResources', t.disabilityEmploymentResources], ['shelteredWorkshops', t.shelteredWorkshops], ['licensedPawnshops', t.licensedPawnshops], ['telepsychology', t.telepsychology], ['publicLiabilityInsurance', t.publicLiabilityInsurance], ['businessChanges', t.businessChanges], ['companyChanges', t.companyChanges], ['laborUnions', t.laborUnions], ['infantCare', t.infantCareCenters], ['infantCareEvaluations', t.infantCareEvaluations], ['elderlyWelfare', t.elderlyWelfare], ['biotechCompanies', t.biotechCompanies], ['travelAccommodations', t.travelAccommodations], ['grants', t.industryGrants], ['procurement', t.metroProcurement],
    ['cramSchools', t.registeredCramSchools], ['hotels', t.registeredHotels], ['laborViolations', t.laborViolations], ['consumerDisputeAbsence', t.consumerDisputeAbsence], ['nangangCompanies', t.nangangCompanies],
    ['animalHospitals', t.animalHospitals], ['veterinarians', t.veterinarians],
    ['comparison', t.comparison], ['overview', t.overview], ['notes', t.notes],
  ] as const;
  const civicViews = [['map', t.map], ['directory', t.directory], ['overview', t.overview]] as const;

  return <div className="app">
    <header>
      <div className="masthead"><div className="brand-mark">北</div><div><p>TAIPEI · OPEN DIRECTORY</p><h1>{t.title}</h1><span>{t.subtitle}</span></div>
        <button className="language" onClick={() => setLanguage(language === 'zh' ? 'en' : 'zh')} aria-label="Switch language">{language === 'zh' ? 'EN' : '中文'}</button></div>
      <nav aria-label={language === 'zh' ? '主要導覽' : 'Main navigation'}>{tabs.map(([id, label]) => <button aria-pressed={tab === id} className={tab === id ? 'active' : ''} onClick={() => setTab(id)} key={id}>{label}</button>)}</nav>
    </header>
    <main>
      {loadError && <p className="status" role="alert">{t.loadError}</p>}
      {!loadError && (!summary || !performingArtsSummary || !vaccinationProviderSummary || !hpvProviderSummary || !childMedicalSubsidyProviderSummary || !dentureSubsidyProviderSummary || !disabilityEmploymentResourceSummary || !shelteredWorkshopSummary || !licensedPawnshopSummary || !telepsychologySummary || !publicLiabilitySummary || !businessChangeSummary || !companyChangeSummary || !laborUnionSummary || !infantCareSummary || !infantCareEvaluationSummary || !elderlyWelfareSummary || !biotechCompanySummary || !travelAccommodationSummary || !grantSummary || !procurementSummary || !cramSchoolSummary || !hotelSummary || !laborViolationSummary || !laborViolationManifest || !consumerDisputeSummary || !nangangCompanySummary || !animalHospitalSummary || !veterinarianSummary) && <p className="status" role="status">{t.loading}</p>}
      {tab === 'civic' && summary && <><FilterPanel filters={filters} setFilters={setFilters} language={language} decades={decades} /><section className="workspace civic-header"><div className="section-heading"><p>01 / CIVIC GROUPS</p><h2>{t.civicGroups}</h2></div>
        <div className="subtabs">{civicViews.map(([id, label]) => <button className={civicView === id ? 'active' : ''} onClick={() => setCivicView(id)} key={id}>{label}</button>)}</div>
        {civicView === 'map' && activeSummary && <CivicMap summary={activeSummary} language={language} openDistrict={openDistrict} />}
        {civicView === 'directory' && <><div className="section-heading inline"><div /><strong>{filtered.length.toLocaleString()} <span>{t.found}</span></strong></div><div className="notice subtle">{t.categoryNotice}</div><GroupDirectory groups={filtered} language={language} /></>}
        {civicView === 'overview' && activeSummary && <Overview summary={activeSummary} groups={hasFilters ? filtered : groups} language={language} />}</section></>}
      {tab === 'performingArts' && performingArtsSummary && <PerformingArtsGroupsModule records={performingArtsRecords} summary={performingArtsSummary} civicSummary={summary ?? undefined} language={language} />}
      {tab === 'vaccinationProviders' && vaccinationProviderSummary && <ContractedVaccinationMedicalProvidersModule records={vaccinationProviderRecords} summary={vaccinationProviderSummary} language={language} />}
      {tab === 'hpvProviders' && hpvProviderSummary && <PubliclyFundedHpvVaccinationProvidersModule records={hpvProviderRecords} summary={hpvProviderSummary} related={{ vaccinationProviders: vaccinationProviderSummary?.totalRecords, telepsychology: telepsychologySummary?.totalRecords, elderlyWelfare: elderlyWelfareSummary?.totalRecords }} language={language} />}
      {tab === 'childMedicalSubsidyProviders' && childMedicalSubsidyProviderSummary && <ChildMedicalSubsidyContractedProvidersModule records={childMedicalSubsidyProviderRecords} summary={childMedicalSubsidyProviderSummary} related={{ vaccination: vaccinationProviderSummary ?? undefined, hpv: hpvProviderSummary ?? undefined, telepsychology: telepsychologySummary ?? undefined }} language={language} />}
      {tab === 'dentureSubsidyProviders' && dentureSubsidyProviderSummary && <DentureSubsidyMedicalProvidersModule records={dentureSubsidyProviderRecords} summary={dentureSubsidyProviderSummary} related={{ elderlyWelfare: elderlyWelfareSummary ?? undefined, childMedical: childMedicalSubsidyProviderSummary ?? undefined, vaccination: vaccinationProviderSummary ?? undefined, telepsychology: telepsychologySummary ?? undefined }} language={language} />}
      {tab === 'disabilityEmploymentResources' && disabilityEmploymentResourceSummary && <DisabilityEmploymentResourceMapModule records={disabilityEmploymentResourceRecords} summary={disabilityEmploymentResourceSummary} related={{ laborUnions: laborUnionSummary ?? undefined, laborViolations: laborViolationSummary ?? undefined, elderlyWelfare: elderlyWelfareSummary ?? undefined, telepsychology: telepsychologySummary ?? undefined }} language={language} />}
      {tab === 'shelteredWorkshops' && shelteredWorkshopSummary && <ShelteredWorkshopDirectoryModule records={shelteredWorkshopRecords} summary={shelteredWorkshopSummary} related={{ disabilityEmployment: disabilityEmploymentResourceSummary ?? undefined, laborUnions: laborUnionSummary ?? undefined, laborViolations: laborViolationSummary ?? undefined, businessChanges: businessChangeSummary ?? undefined, companyChanges: companyChangeSummary ?? undefined, elderlyWelfare: elderlyWelfareSummary ?? undefined }} language={language} />}
      {tab === 'licensedPawnshops' && licensedPawnshopSummary && <LicensedPawnshopDirectoryModule records={licensedPawnshopRecords} summary={licensedPawnshopSummary} related={{ businessChanges: businessChangeSummary ?? undefined, companyChanges: companyChangeSummary ?? undefined, consumerDispute: consumerDisputeSummary ?? undefined, publicLiability: publicLiabilitySummary ?? undefined, laborViolations: laborViolationSummary ?? undefined }} language={language} />}
      {tab === 'telepsychology' && telepsychologySummary && <TelepsychologyCounselingInstitutionsModule records={telepsychologyRecords} summary={telepsychologySummary} language={language} />}
      {tab === 'publicLiabilityInsurance' && publicLiabilitySummary && <BusinessPremisesPublicLiabilityInsuranceModule records={publicLiabilityRecords} summary={publicLiabilitySummary} language={language} />}
      {tab === 'businessChanges' && businessChangeSummary && <BusinessRegistrationChangesModule records={businessChangeRecords} summary={businessChangeSummary} language={language} />}
      {tab === 'companyChanges' && companyChangeSummary && <CompanyRegistrationChangesModule records={companyChangeRecords} summary={companyChangeSummary} businessSummary={businessChangeSummary ?? undefined} language={language} />}
      {tab === 'laborUnions' && laborUnionSummary && <RegisteredLaborUnionsModule records={laborUnionRecords} summary={laborUnionSummary} language={language} />}
      {tab === 'infantCare' && infantCareSummary && <QuasiPublicInfantCareCentersModule records={infantCareRecords} summary={infantCareSummary} language={language} />}
      {tab === 'infantCareEvaluations' && infantCareEvaluationSummary && <InfantCareCenterEvaluationResultsModule institutions={infantCareEvaluationInstitutions} yearRecords={infantCareEvaluationYearRecords} summary={infantCareEvaluationSummary} quasiPublicRecords={infantCareRecords} language={language} />}
      {tab === 'elderlyWelfare' && elderlyWelfareSummary && <ElderlyWelfareInstitutionsModule records={elderlyWelfareRecords} summary={elderlyWelfareSummary} language={language} />}
      {tab === 'biotechCompanies' && biotechCompanySummary && <BiotechCompanyDirectoryModule records={biotechCompanyRecords} summary={biotechCompanySummary} related={{ grants: grantSummary?.totalRecords, nangang: nangangCompanySummary?.totalRecords, companyChanges: companyChangeSummary?.totalRecords, businessChanges: businessChangeSummary?.totalRecords }} language={language} />}
      {tab === 'travelAccommodations' && travelAccommodationSummary && <TaipeiTravelAccommodationsZhModule records={travelAccommodationRecords} summary={travelAccommodationSummary} registeredHotelSummary={hotelSummary ?? undefined} language={language} />}
      {tab === 'grants' && grantSummary && <IndustryModule records={grantRecords} summary={grantSummary} language={language} />}
      {tab === 'procurement' && procurementSummary && <MetroProcurementModule records={procurementRecords} summary={procurementSummary} language={language} />}
      {tab === 'cramSchools' && cramSchoolSummary && <RegisteredCramSchoolsModule records={cramSchoolRecords} summary={cramSchoolSummary} language={language} />}
      {tab === 'hotels' && hotelSummary && <RegisteredHotelsModule records={hotelRecords} summary={hotelSummary} language={language} />}
      {tab === 'laborViolations' && laborViolationSummary && laborViolationManifest && <LaborStandardActViolationsModule summary={laborViolationSummary} manifest={laborViolationManifest} language={language} />}
      {tab === 'consumerDisputeAbsence' && consumerDisputeSummary && <ConsumerDisputeAbsentBusinessOperatorsModule records={consumerDisputeRecords} summary={consumerDisputeSummary} related={{ laborViolations: laborViolationSummary?.totalRecords, businessChanges: businessChangeSummary?.totalRecords, companyChanges: companyChangeSummary?.totalRecords, publicLiability: publicLiabilitySummary?.totalRecords }} language={language} />}
      {tab === 'nangangCompanies' && nangangCompanySummary && <NangangSoftwareParkCompaniesModule records={nangangCompanyRecords} summary={nangangCompanySummary} language={language} />}
      {tab === 'animalHospitals' && animalHospitalSummary && <RegisteredAnimalHospitalsModule records={animalHospitalRecords} summary={animalHospitalSummary} language={language} />}
      {tab === 'veterinarians' && veterinarianSummary && <VeterinarianProfessionalRegistryModule records={veterinarianRecords} summary={veterinarianSummary} related={{ animalHospitals: animalHospitalSummary ?? undefined, businessChanges: businessChangeSummary ?? undefined, companyChanges: companyChangeSummary ?? undefined, consumerDispute: consumerDisputeSummary ?? undefined, laborViolations: laborViolationSummary ?? undefined }} language={language} />}
      {tab === 'comparison' && summary && grantSummary && <DistrictComparison groups={groups} civicSummary={summary} grants={grantRecords} grantSummary={grantSummary} language={language} />}
      {tab === 'overview' && summary && performingArtsSummary && vaccinationProviderSummary && hpvProviderSummary && childMedicalSubsidyProviderSummary && dentureSubsidyProviderSummary && disabilityEmploymentResourceSummary && shelteredWorkshopSummary && licensedPawnshopSummary && telepsychologySummary && publicLiabilitySummary && businessChangeSummary && companyChangeSummary && laborUnionSummary && infantCareSummary && infantCareEvaluationSummary && elderlyWelfareSummary && biotechCompanySummary && travelAccommodationSummary && grantSummary && procurementSummary && cramSchoolSummary && hotelSummary && laborViolationSummary && consumerDisputeSummary && nangangCompanySummary && animalHospitalSummary && veterinarianSummary && <CombinedOverview civic={summary} performingArts={performingArtsSummary} vaccinationProviders={vaccinationProviderSummary} hpvProviders={hpvProviderSummary} childMedicalSubsidyProviders={childMedicalSubsidyProviderSummary} dentureSubsidyProviders={dentureSubsidyProviderSummary} disabilityEmploymentResources={disabilityEmploymentResourceSummary} shelteredWorkshops={shelteredWorkshopSummary} licensedPawnshops={licensedPawnshopSummary} telepsychology={telepsychologySummary} publicLiabilityInsurance={publicLiabilitySummary} businessChanges={businessChangeSummary} companyChanges={companyChangeSummary} laborUnions={laborUnionSummary} infantCare={infantCareSummary} infantCareEvaluations={infantCareEvaluationSummary} elderlyWelfare={elderlyWelfareSummary} biotechCompanies={biotechCompanySummary} travelAccommodations={travelAccommodationSummary} grants={grantSummary} procurement={procurementSummary} cramSchools={cramSchoolSummary} hotels={hotelSummary} laborViolations={laborViolationSummary} consumerDisputeAbsence={consumerDisputeSummary} nangangCompanies={nangangCompanySummary} animalHospitals={animalHospitalSummary} veterinarians={veterinarianSummary} language={language} />}
      {tab === 'notes' && <section className="workspace notes"><div className="section-heading"><p>09 / METHODOLOGY</p><h2>{t.notes}</h2></div>
        <blockquote>{language === 'zh' ? '本網站整理臺北市公開資料中的人民團體名冊、演藝團體名冊、工會名單、身障就業資源、庇護工場名冊、當舖業資料清冊、產業補助廠商資料、生技廠商企業名錄、捷運採購案件預定招標時程、立案補習班資訊、一般旅館名冊、臺北旅遊網住宿資料、勞基法違規公布紀錄、消費爭議不到場公告、南港軟體工業園區廠商資料、動物醫院一覽表、獸醫師資訊、準公共化托嬰中心、托嬰中心評鑑結果、老人福利機構名冊、各項預防接種合約醫療院所、公費HPV疫苗特約醫療院所、兒童醫療補助特約院所、假牙補助醫療院所、可執行通訊心理諮商之心理機構、營業場所投保公共意外險清冊、商業設立變更及歇業登記異動資料、公司設立變更及解散登記異動資料等公開資料，僅供資料探索與整理使用。各資料集性質不同，不應直接解讀為相同類型組織、活動、服務可用性、即時營業狀態、醫療建議、兒童照顧或老人照顧建議、就業媒合保證、補助資格判定、消費糾紛狀態、貸款建議、官方排名、法規遵循狀態、法律責任、信用狀態、投資訊號、黑名單、法律意見、財務建議或官方背書。最新與正式資訊請以主管機關正式公告及官方系統為準。' : 'This site organizes Taipei public-data records such as civic group directory records, performing-arts group registry records, labor union directory records, disability employment resource records, sheltered workshop directory records, licensed pawnshop directory records, industry grant recipient records, biotech company directory records, Taipei Metro planned procurement tender schedules, registered cram-school records, registered hotel records, Taipei Travel accommodation records, Labor Standards Act violation publication records, consumer dispute absence notices, Nangang Software Park company records, animal hospital directory records, veterinarian professional registry records, quasi-public infant care center records, infant care center evaluation result records, elderly welfare institution directory records, contracted vaccination medical provider records, publicly funded HPV vaccination provider records, child medical subsidy contracted provider records, denture subsidy medical provider records, telepsychology counseling institution records, business premises public liability insurance records, business establishment / modification / closure registration change records, company establishment / modification / dissolution registration change records, and related public records for data exploration and organization only. These datasets have different meanings and should not be interpreted as the same type of organization, activity, service availability, real-time operating status, medical advice, childcare or elderly care advice, employment placement guarantee, subsidy eligibility determination, consumer dispute status, loan advice, official ranking, legal compliance status, legal liability, credit status, investment signal, blacklist, legal advice, financial advice, or official endorsement. Latest and official information should be verified with official authority notices and official systems.'}</blockquote>
        <div className="notes-grid"><article><h3>{t.method}</h3><p>{t.methodText}</p></article>
          <article><h3>{t.fields}</h3><p>機關代碼 → agencyCode<br />名稱 → name<br />地址 → address<br />電話 → phone<br />成立日期 → foundedDateRaw</p></article>
          <article><h3>{language === 'zh' ? '演藝團體名冊' : 'Performing-arts group registry'}</h3><p>{language === 'zh' ? '演藝團體名冊提供臺北市演藝團體登記名冊，欄位包含演藝團體名稱、申請類別、立案字號、主管機關、主管機關代碼、團址與網址。本網站將團址解析為行政區與道路名稱，並依申請類別、行政區、主管機關與網址有無整理統計。資料未提供官方經緯度，因此預設不顯示精確點位。' : 'The performing-arts group directory provides Taipei performing-arts group registry records. Fields include performing-arts group name, application category, registration number, competent authority, competent authority code, registered address, and website. This site parses registered addresses into district and road name and organizes statistics by application category, district, competent authority, and website availability. The data does not provide official coordinates, so exact points are not shown by default.'}</p></article>
          <article><h3>{language === 'zh' ? '預防接種合約醫療院所' : 'Contracted vaccination providers'}</h3><p>{language === 'zh' ? '資料提供臺北市合約院所名冊，欄位包含序號、行政區、院所名稱、各項預防接種服務欄位、地址、電話與語音預約。本網站將地址解析為行政區與道路名稱，並將各接種服務欄位轉換為篩選用服務項目。資料未提供官方經緯度，因此預設不顯示精確點位。' : 'The data provides Taipei contracted provider directory records with sequence number, district, provider name, vaccination service fields, address, phone, and voice reservation. This site parses addresses into district and road name and converts vaccination service fields into filterable service items. The data does not provide official coordinates, so exact points are not shown by default.'}</p></article>
          <article><h3>{language === 'zh' ? '公費HPV疫苗特約醫療院所' : 'Publicly funded HPV vaccination providers'}</h3><p>{language === 'zh' ? '資料提供臺北市公費HPV疫苗接種服務特約醫療院所名冊，欄位包含項次、行政區代碼、醫療院所名稱、地址與聯絡電話。本網站將行政區代碼對應為臺北市行政區名稱，並從地址解析行政區與道路名稱。資料未提供官方經緯度，因此僅以行政區彙總呈現，不代表即時門診時間、預約名額、疫苗庫存、接種資格或醫療建議。' : 'The data provides Taipei publicly funded HPV vaccination provider records with sequence number, district code, provider name, address, and phone. This site maps district codes to Taipei district names and parses address district and road name. The data provides no official coordinates, so it is shown as district summaries only and does not represent real-time clinic hours, appointment availability, vaccine stock, eligibility, or medical advice.'}</p></article>
          <article><h3>{language === 'zh' ? '兒童醫療補助特約院所名冊' : 'Child medical subsidy contracted providers'}</h3><p>{language === 'zh' ? '資料提供臺北市兒童醫療補助特約醫療院所公開資料，欄位包含編號、院所代碼、診所名稱、行政區、地址與電話。本網站保留來源行政區欄位，並從地址解析臺北市行政區與道路名稱，整理為行政區分布與院所清單。資料未提供官方經緯度，因此預設不顯示精確點位，也不代表即時門診時間、即時預約名額、補助資格判定、補助金額、費用標準、醫療建議、兒科就醫建議、服務品質排名、急診或緊急醫療服務、即時營運狀態或官方背書。' : 'Child medical subsidy contracted provider data provides Taipei public records for medical institutions contracted for child medical subsidy services. Fields include sequence number, provider code, clinic name, administrative area, address, and phone. This site preserves the source administrative area field, parses Taipei districts and road names from addresses, and organizes the data into district distribution and a provider directory. The data does not provide official coordinates, so exact points are not shown by default. It does not represent real-time clinic hours, appointment availability, subsidy eligibility, subsidy amount, fees, medical advice, pediatric care advice, service quality ranking, emergency medical service, real-time operating status, or official endorsement.'}</p></article>
          <article><h3>{language === 'zh' ? '假牙補助醫療院所名單' : 'Denture subsidy medical providers'}</h3><p>{language === 'zh' ? '資料提供臺北市假牙補助相關醫療院所公開資料，欄位包含補助類型、區域、院所名稱、地址與連絡電話。本網站保留來源區域欄位，並從地址解析臺北市行政區與道路名稱，整理為行政區分布與院所清單。資料未提供官方經緯度，因此預設不顯示精確點位，也不代表即時門診時間、即時預約名額、補助資格判定、補助金額、費用標準、牙科治療建議、醫療建議、服務品質排名、急診或緊急醫療服務、即時營運狀態或官方背書。' : 'Denture subsidy medical provider data provides Taipei public records for medical institutions related to denture subsidy services. Fields include subsidy type, area, medical institution name, address, and contact phone. This site preserves the source area field, parses Taipei districts and road names from addresses, and organizes the data into district distribution and a provider directory. The data does not provide official coordinates, so exact points are not shown by default. It does not represent real-time clinic hours, appointment availability, subsidy eligibility, subsidy amount, fees, dental treatment advice, medical advice, service quality ranking, emergency dental or medical service, real-time operating status, or official endorsement.'}</p></article>
          <article><h3>{language === 'zh' ? '身障就業資源地圖' : 'Disability employment resource map'}</h3><p>{language === 'zh' ? '資料提供臺北市身心障礙者就業與職業重建相關資源公開資料，欄位包含SEQNO、Year、name、type、business item、contact、address與telephone。本網站保留來源欄位，並從地址解析臺北市行政區與道路名稱，整理為行政區分布、業務項目、服務類別與資源清單。資料未提供官方經緯度，因此預設不顯示精確點位，也不代表即時服務名額、職缺資訊、就業媒合保證、補助或福利資格判定、職業重建評估、身心障礙鑑定、醫療建議、法律意見、服務品質排名、無障礙認證、法規遵循狀態或官方背書。' : 'Disability employment resource map data provides Taipei public records of disability employment and vocational rehabilitation resources. Fields include SEQNO, Year, name, type, business item, contact, address, and telephone. This site preserves the source fields, parses Taipei districts and road names from addresses, and organizes the data into district distribution, business items, service categories, and a resource directory. The data does not provide official coordinates, so exact points are not shown by default. It does not represent real-time service capacity, job vacancies, employment placement guarantees, subsidy or welfare eligibility determination, vocational rehabilitation assessment, disability assessment, medical advice, legal advice, service quality ranking, accessibility certification, legal compliance status, or official endorsement.'}</p></article>
          <article><h3>{language === 'zh' ? '庇護工場名冊' : 'Sheltered workshop directory'}</h3><p>{language === 'zh' ? '資料提供臺北市庇護工場公開名冊，欄位包含編號、年度、工場名稱、營業項目、聯絡人、地址、電話與統一編號。本網站保留來源欄位，解析民國年度、臺北市行政區與道路名稱，並依營業項目產生輔助分類。資料未提供官方經緯度，因此不做地理編碼、不顯示精確點位或附近功能；僅以行政區彙總呈現並提供外部地圖查詢。此資料不代表職缺、即時服務量能、安置保證、補助或福利資格、職業重建或身障鑑定、品質排名、無障礙認證、法規遵循、採購或消費建議、醫療或法律意見、官方背書。' : 'Sheltered workshop directory data provides Taipei public records with sequence number, year, workshop name, business item, contact, address, phone, and unified business number. This site preserves source fields, parses ROC years, Taipei districts and road names, and derives helper categories from business items. The data provides no official coordinates, so this module performs no geocoding, shows no exact points or near-me feature, and only presents district summaries plus external map lookup. It does not represent vacancies, real-time capacity, placement guarantees, subsidy or welfare eligibility, vocational rehabilitation or disability assessment, quality ranking, accessibility certification, legal compliance, procurement or consumption recommendation, medical/legal advice, or endorsement.'}</p></article>
          <article><h3>{language === 'zh' ? '當舖業資料清冊' : 'Licensed pawnshop directory'}</h3><p>{language === 'zh' ? '資料提供臺北市政府警察局合法當舖業資料，欄位包含序號、許可證號、當舖名稱、營業地址與縣市。本網站保留來源欄位，並從營業地址解析臺北市行政區與道路名稱，整理為行政區分布、許可證號與當舖清單。資料未提供官方經緯度，因此預設不顯示精確點位，也不代表即時營業狀態、消費糾紛紀錄、違法紀錄、執法案件、信用評等、貸款建議、投資建議、金融建議、法律意見、服務品質排名、官方推薦或官方背書。' : 'Licensed pawnshop directory data provides Taipei City Police Department legal pawnshop records. Fields include sequence number, license number, pawnshop name, business address, and city/county. This site preserves the source fields, parses Taipei districts and road names from business addresses, and organizes the data into district distribution, license numbers, and a pawnshop directory. The data does not provide official coordinates, so exact points are not shown by default. It does not represent real-time operating status, consumer dispute records, violation records, law enforcement cases, credit ratings, loan advice, investment advice, financial advice, legal advice, service quality ranking, official recommendation, or endorsement.'}</p></article>
          <article><h3>{language === 'zh' ? '可執行通訊心理諮商之心理機構' : 'Telepsychology counseling institutions'}</h3><p>{language === 'zh' ? '資料提供臺北市可執行通訊心理諮商業務之心理治療所、諮商所、基金會與學校名冊，欄位包含序號、機構類型、行政區、機構名稱、地址、電話、分機與手機。本網站解析行政區與道路名稱，並整理機構類型與聯絡欄位。資料未提供官方經緯度，因此預設不顯示精確點位，也不作醫療建議、心理治療建議、危機服務、預約、收費、保險、推薦或品質判斷。' : 'The data provides Taipei records for psychological treatment clinics, counseling clinics, foundations, and schools permitted to perform communication-based psychological counseling. Fields include sequence number, institution type, district, institution name, address, phone, extension, and mobile. This site parses district and road name and organizes institution type and contact fields. It has no official coordinates, so exact points are not shown, and the site does not provide medical advice, psychotherapy advice, crisis service, appointment, fee, insurance, recommendation, or quality judgments.'}</p></article>
          <article><h3>{language === 'zh' ? '營業場所投保公共意外險清冊' : 'Business premises public liability insurance records'}</h3><p>{language === 'zh' ? '資料提供臺北市公司／商業登記投保公共意外責任險公開資料，欄位包含序號、統一立案編號、類別、名稱、營業地址、保單到期日、經度與緯度。本網站依來源座標顯示點位，並依營業地址解析行政區與道路名稱。到期狀態僅依來源保單到期日與資料建置日期計算，不代表即時投保狀態、法規遵循判定、場所安全保證、法律意見或保險建議。' : 'Business premises public liability insurance records provide Taipei public-data records for company / business registration public accident liability insurance information. Fields include sequence number, registration number, category, name, business address, policy expiry date, longitude, and latitude. This site displays source-coordinate points and parses business addresses into district and road name. Expiry status is calculated only from the source policy expiry date and data build date; it is not real-time insurance status, legal compliance determination, venue safety guarantee, legal advice, or insurance advice.'}</p></article>
          <article><h3>{language === 'zh' ? '商業設立、變更及歇業登記異動資料' : 'Business registration change records'}</h3><p>{language === 'zh' ? '資料提供臺北市商業設立、變更與歇業登記異動清冊，欄位包含統一編號、商業名稱、商業地址、異動日期、經度與緯度。本網站依來源座標顯示點位，並依地址解析行政區與道路名稱。異動事件不代表目前營業狀態、商業信用、法規遵循、投資價值、法律意見或財務意見。' : 'Business registration change records provide Taipei establishment, modification, and closure registration change events. Fields include business number, business name, address, event date, longitude, and latitude. This site displays source-coordinate points and parses addresses into district and road name. Change events do not represent current operating status, creditworthiness, legal compliance, investment value, legal advice, or financial advice.'}</p></article>
          <article><h3>{language === 'zh' ? '公司設立、變更及解散登記異動資料' : 'Company registration change records'}</h3><p>{language === 'zh' ? '資料提供臺北市核准公司登記異動資料，來源分為設立、變更與解散等CSV資源，欄位包含統一編號、公司名稱、公司地址、核准日期、核准變更日期、核准解散日期、經度與緯度。本網站依來源檔案判斷異動類型，並依來源座標顯示點位、依地址解析行政區與道路名稱。' : 'Company establishment, modification, and dissolution registration change records provide Taipei approved company registration change data. Source resources are separated into establishment, modification, and dissolution CSV files. Fields include unified business number, company name, company address, approval date, modification approval date, dissolution approval date, longitude, and latitude. This site determines the change type from the source resource, displays source-coordinate points, and parses addresses into district and road name.'}</p></article>
          <article><h3>{language === 'zh' ? '工會名單資料' : 'Registered labor union data'}</h3><p>{language === 'zh' ? '來源為 CP950/Big5 CSV，欄位包含工會屬性、工會名稱、理事長、郵遞區號、通訊地址與聯絡電話。資料未提供經緯度，因此僅以臺北市行政區中心點呈現彙總；理事長姓名只在來源明細中呈現。' : 'The source is a CP950/Big5 CSV with union type, union name, chairperson, postal code, contact address, and phone fields. It provides no coordinates, so Taipei records are shown only as district-centroid summaries; chairperson names appear only in source details.'}</p></article>
          <article><h3>{language === 'zh' ? '產業補助資料' : 'Industry grant data'}</h3><p>{language === 'zh' ? '來源包含負責人姓名欄位；本網站預設不在卡片中顯示。日期由民國年轉換，金額以新臺幣解析。' : 'The source includes responsible-person names; this site does not display them in default cards. ROC dates are converted and amounts are parsed as NTD.'}</p></article>
          <article><h3>{language === 'zh' ? '生技廠商企業名錄' : 'Biotech company directory'}</h3><p>{language === 'zh' ? '資料提供臺北市生技相關廠商公開資料，欄位包含單位名稱、統一編號、負責人、登記地址、公司電話、產業範疇與來源座標。本網站將來源座標偵測為 TWD97 / EPSG:3826 格式並轉換為 WGS84 後顯示於地圖。此資料不代表完整產業登記、即時營業狀態、產品許可、公司品質、投資價值、信用評等、法規遵循或官方背書。' : 'The data provides Taipei public records for biotech-related companies, including company name, unified business number, responsible person, registered address, company phone, industry category, and source coordinates. This site detects TWD97 / EPSG:3826-style coordinates and converts them to WGS84 for map display. This data does not represent a complete industry registry, real-time operating status, product approval, company quality, investment value, credit rating, legal compliance, or official endorsement.'}</p></article>
          <article><h3>{language === 'zh' ? '捷運採購時程' : 'Metro procurement schedule'}</h3><p>{language === 'zh' ? '資料為每月公布的預定招標排程。「預算金額」原始欄位會完整保留；僅在內容可辨識時衍生招標方式，且不建立地圖點位。' : 'The data is a monthly planned tender schedule. The raw “budget amount” field is preserved, tender method is derived only when recognizable, and no map points are created.'}</p></article>
          <article><h3>{language === 'zh' ? '立案補習班資料' : 'Registered cram-school data'}</h3><p>{language === 'zh' ? '資料未提供經緯度，因此以行政區彙總與清單呈現，並透過地址提供地圖查詢連結。' : 'The data does not provide coordinates, so this site presents district-level summaries and directory records, with map lookup links based on addresses.'}</p></article>
          <article><h3>{language === 'zh' ? '一般旅館名冊' : 'Registered hotel data'}</h3><p>{language === 'zh' ? '資料未提供經緯度，因此以行政區彙總與地址型名冊呈現。客房定價欄位為公開登記欄位，不是即時房價或訂房價格。' : 'The data does not provide coordinates, so this site presents district-level summaries and an address-based directory. Room-rate fields are public registry fields, not real-time room prices or booking prices.'}</p></article>
          <article><h3>{language === 'zh' ? '臺北旅遊網住宿資料' : 'Taipei Travel accommodation data'}</h3><p>{language === 'zh' ? '資料提供中文旅遊住宿名錄，欄位包含旅館類別、旅宿名稱、地址、電話或手機號碼、傳真與房間數。資料未提供官方經緯度，因此以行政區彙總與地址型清單呈現，不作訂房、房價、空房、推薦或品質保證。' : 'The data provides Chinese tourism accommodation directory records with category, name, address, phone/mobile, fax, and room count. It has no official coordinates, so this site shows district summaries and an address-based directory, not booking, pricing, vacancy, recommendation, or quality guarantees.'}</p></article>
          <article><h3>{language === 'zh' ? '勞基法違規公布紀錄' : 'Labor violation publication records'}</h3><p>{language === 'zh' ? '資料未提供地址或經緯度，因此不建立地圖點位。民國日期會轉為西元日期；負責人姓名僅在來源明細中呈現，不作個人排名或評價。' : 'The data provides no addresses or coordinates, so it has no map layer. ROC dates are converted to Gregorian dates; responsible-person names appear only in source details and are not ranked or evaluated.'}</p></article>
          <article><h3>{language === 'zh' ? '消費爭議不到場公告' : 'Consumer dispute absence notices'}</h3><p>{language === 'zh' ? '資料提供臺北市依消費者保護自治條例公告之消費爭議協商無故不到場被申訴企業經營者公開紀錄，欄位包含年度、被申訴人、申訴人、協商日與爭議內容。本網站不建立地圖點位，也不自動連結公司或商業登記資料。' : 'The data provides Taipei public notice records for respondent business operators absent from consumer-dispute negotiation without cause. Fields include year, respondent, complainant, negotiation date, and dispute content. This site creates no map points and does not automatically link company or business registration records.'}</p></article>
          <article><h3>{language === 'zh' ? '南港軟體工業園區廠商' : 'Nangang Software Park companies'}</h3><p>{language === 'zh' ? '來源欄位名稱為經度與緯度，但資料型態接近 TWD97；系統會判斷座標型態並轉換為 WGS84。園區廠商名錄不代表即時營運或進駐狀態。' : 'Source coordinate values resemble TWD97, so the app detects the type and converts them to WGS84. The directory does not represent real-time operating or tenancy status.'}</p></article>
          <article><h3>{language === 'zh' ? '動物醫院一覽表' : 'Animal hospital directory'}</h3><p>{language === 'zh' ? '資料未提供經緯度，因此以行政區彙總與清單呈現。負責人姓名為來源資料欄位，僅於明細中呈現，不作個人排名或評價。' : 'The data provides no coordinates, so this site presents district summaries and a directory. Responsible person name is a source field shown only in details, not ranked or evaluated.'}</p></article>
          <article><h3>{language === 'zh' ? '準公共化托嬰中心' : 'Quasi-public infant care centers'}</h3><p>{language === 'zh' ? '資料未提供經緯度，因此以行政區彙總與清單呈現。表列收托差額由核定收托人數與實際收托人數衍生，不是即時可收托名額。' : 'The data provides no coordinates, so this site presents district summaries and a directory. Listed capacity gap is derived from approved capacity and actual enrollment; it is not real-time vacancy.'}</p></article>
          <article><h3>{language === 'zh' ? '托嬰中心評鑑結果' : 'Infant care center evaluation results'}</h3><p>{language === 'zh' ? '資料為各托嬰中心年度評鑑結果。本網站將寬表年度欄位轉為逐年紀錄，保留未評鑑年份與特殊備註，並以行政區彙總呈現。資料未提供地址或官方經緯度，因此不建立精確點位，也不自動與準公共化托嬰中心名冊合併；可能相同名稱僅作比對提示。評鑑資料不代表即時營運狀態、收托名額、費用、違規裁罰、官方排名、照顧建議或背書。' : 'The data provides yearly evaluation results for infant care centers. This site converts wide year columns into yearly records, preserves non-evaluated years and special notes, and presents district-level summaries. The data has no address or official coordinates, so no exact points are created and it is not automatically merged with the quasi-public infant care center directory; possible same-name records are only comparison hints. Evaluation data does not represent real-time operating status, vacancies, fees, violations, penalties, official ranking, care advice, or endorsement.'}</p></article>
          <article><h3>{language === 'zh' ? '老人福利機構名冊' : 'Elderly welfare institutions'}</h3><p>{language === 'zh' ? '資料未提供經緯度，因此以行政區彙總與清單呈現，並透過地址提供外部地圖查詢連結。床位欄位為來源名冊中的核定床位分類，不是即時空床、收住資格、收費標準、補助資格、照護品質、推薦排名、醫療建議或長照建議。' : 'The data provides no coordinates, so this site presents district summaries and a directory, with external map lookup links based on addresses. Bed-count fields are approved bed categories from the source directory; they are not real-time vacancies, admission eligibility, fees, subsidy eligibility, care quality, recommendation ranking, medical advice, or long-term care advice.'}</p></article>
          <article><h3>{t.source}</h3><p><a href="https://data.taipei/dataset/detail?id=72417af0-7dec-4fad-b762-5f2baafcf084" target="_blank" rel="noreferrer">臺北市人民團體名冊 ↗</a><br /><a href="https://data.taipei/dataset/detail?id=f56e77c6-cc69-480c-8ba4-057fc7e1d8d6" target="_blank" rel="noreferrer">臺北市演藝團體名冊 ↗</a><br /><a href="https://data.taipei/dataset/detail?id=ec201f0a-2efa-4426-9439-a8daea7b33c7" target="_blank" rel="noreferrer">臺北市各項預防接種合約醫療院所 ↗</a><br /><a href="https://data.taipei/dataset/detail?id=96f143fe-4c95-4d88-9985-77f28e2d2c3d" target="_blank" rel="noreferrer">臺北市公費HPV疫苗特約醫療院所 ↗</a><br /><a href="https://data.taipei/dataset/detail?id=3cc250f5-9f5a-4670-ac7b-f13ecd316032" target="_blank" rel="noreferrer">臺北市兒童醫療補助特約院所名冊 ↗</a><br /><a href="https://data.taipei/dataset/detail?id=76b8b514-e793-4cca-8dcf-065d5af4b760" target="_blank" rel="noreferrer">臺北市假牙補助醫療院所名單 ↗</a><br /><a href="https://data.taipei/dataset/detail?id=c5aafda8-ef14-4f66-a6b7-d5da995a14b5" target="_blank" rel="noreferrer">臺北市身障就業資源地圖 ↗</a><br /><a href="https://data.taipei/dataset/detail?id=fb88e4fd-c287-4fbb-91ab-0ed1fbeaf28c" target="_blank" rel="noreferrer">臺北市庇護工場名冊 ↗</a><br /><a href="https://data.taipei/dataset/detail?id=024da777-25b0-4bee-b1b9-2f8ceb8bd68a" target="_blank" rel="noreferrer">臺北市政府警察局當舖業資料清冊 ↗</a><br /><a href="https://data.taipei/dataset/detail?id=428a78d5-867a-4e55-9630-040a89c8cd94" target="_blank" rel="noreferrer">臺北市可執行通訊心理諮商之心理機構 ↗</a><br /><a href="https://data.taipei/dataset/detail?id=5880bb98-ab6a-476c-ae55-37564b0d0fc9" target="_blank" rel="noreferrer">臺北市營業場所投保公共意外險清冊 ↗</a><br /><a href="https://data.taipei/dataset/detail?id=5fdefcca-e0a6-41bc-a520-7c8f067caad3" target="_blank" rel="noreferrer">臺北市核准商業設立、變更及歇業登記等異動資料清冊 ↗</a><br /><a href="https://data.taipei/dataset/detail?id=0a1f284d-e985-4c39-b0b5-53389fbfa6e9" target="_blank" rel="noreferrer">臺北市核准公司設立變更解散清冊 ↗</a><br /><a href="https://data.taipei/dataset/detail?id=bea69229-8349-4208-8a68-988718f4ea48" target="_blank" rel="noreferrer">臺北市各工會名單及聯絡方式 ↗</a><br /><a href="https://data.taipei/dataset/detail?id=3e78bffa-3fa3-46d5-a632-df99447de695" target="_blank" rel="noreferrer">臺北市產業補助廠商資料 ↗</a><br /><a href="https://data.taipei/dataset/detail?id=a05ee8ee-d7f1-4024-86c1-e2f97f2120bf" target="_blank" rel="noreferrer">臺北市生技廠商企業名錄 ↗</a><br /><a href="https://data.taipei/dataset/detail?id=f4fd7f03-9bf6-41de-a003-02c437596570" target="_blank" rel="noreferrer">臺北捷運公司採購案件預定招標時程資訊 ↗</a><br /><a href="https://data.taipei/dataset/detail?id=b124a967-fc88-4c45-bea8-41b4ef158a15" target="_blank" rel="noreferrer">臺北市立案補習班資訊 ↗</a><br /><a href="https://data.taipei/dataset/detail?id=4d7d0b46-2e90-4ee7-b000-c0f2f3a37651" target="_blank" rel="noreferrer">臺北市一般旅館名冊 ↗</a><br /><a href="https://data.taipei/dataset/detail?id=58093ba6-4c98-4148-b27a-50ad97d7afca" target="_blank" rel="noreferrer">臺北市臺北旅遊網住宿資料(中文) ↗</a><br /><a href="https://data.taipei/dataset/detail?id=23630879-4926-4877-a48a-a0ae6cc2f7d5" target="_blank" rel="noreferrer">臺北市勞基法違規公布紀錄 ↗</a><br /><a href="https://data.taipei/dataset/detail?id=c15e49fd-f511-46c8-8613-0ad91f370bfd" target="_blank" rel="noreferrer">臺北市消費爭議無故不到場協商之被申訴企業經營者列表 ↗</a><br /><a href="https://data.taipei/dataset/detail?id=01bcb5ee-7c18-41fa-86d4-4e75daee1f94" target="_blank" rel="noreferrer">臺北市動物醫院一覽表 ↗</a><br /><a href="https://data.taipei/dataset/detail?id=aeaaa517-089c-42a7-ad5b-60fef89c3545" target="_blank" rel="noreferrer">臺北市準公共化托嬰中心 ↗</a><br /><a href="https://data.taipei/dataset/detail?id=e7b45593-9d44-469c-97fa-f1a52c69ebaa" target="_blank" rel="noreferrer">臺北市托嬰中心評鑑結果 ↗</a><br /><a href="https://data.taipei/dataset/detail?id=d455b149-1a2f-4d5a-a9a8-315eb71f51f6" target="_blank" rel="noreferrer">臺北市老人福利機構名冊 ↗</a></p>
            <p>{t.updated}: {report.convertedAt ? new Date(report.convertedAt).toLocaleString(language === 'zh' ? 'zh-TW' : 'en') : '—'}<br />{report.performingArtsGroups?.convertedAt ? new Date(report.performingArtsGroups.convertedAt).toLocaleString(language === 'zh' ? 'zh-TW' : 'en') : '—'}<br />{report.contractedVaccinationMedicalProviders?.convertedAt ? new Date(report.contractedVaccinationMedicalProviders.convertedAt).toLocaleString(language === 'zh' ? 'zh-TW' : 'en') : '—'}<br />{report.publiclyFundedHpvVaccinationProviders?.convertedAt ? new Date(report.publiclyFundedHpvVaccinationProviders.convertedAt).toLocaleString(language === 'zh' ? 'zh-TW' : 'en') : '—'}<br />{report.childMedicalSubsidyContractedProviders?.convertedAt ? new Date(report.childMedicalSubsidyContractedProviders.convertedAt).toLocaleString(language === 'zh' ? 'zh-TW' : 'en') : '—'}<br />{report.dentureSubsidyMedicalProviders?.convertedAt ? new Date(report.dentureSubsidyMedicalProviders.convertedAt).toLocaleString(language === 'zh' ? 'zh-TW' : 'en') : '—'}<br />{report.telepsychologyCounselingInstitutions?.convertedAt ? new Date(report.telepsychologyCounselingInstitutions.convertedAt).toLocaleString(language === 'zh' ? 'zh-TW' : 'en') : '—'}<br />{report.businessPremisesPublicLiabilityInsuranceRecords?.convertedAt ? new Date(report.businessPremisesPublicLiabilityInsuranceRecords.convertedAt).toLocaleString(language === 'zh' ? 'zh-TW' : 'en') : '—'}<br />{report.businessRegistrationChangeRecords?.convertedAt ? new Date(report.businessRegistrationChangeRecords.convertedAt).toLocaleString(language === 'zh' ? 'zh-TW' : 'en') : '—'}<br />{report.companyRegistrationChangeRecords?.convertedAt ? new Date(report.companyRegistrationChangeRecords.convertedAt).toLocaleString(language === 'zh' ? 'zh-TW' : 'en') : '—'}<br />{report.registeredLaborUnions?.convertedAt ? new Date(report.registeredLaborUnions.convertedAt).toLocaleString(language === 'zh' ? 'zh-TW' : 'en') : '—'}<br />{report.quasiPublicInfantCareCenters?.convertedAt ? new Date(report.quasiPublicInfantCareCenters.convertedAt).toLocaleString(language === 'zh' ? 'zh-TW' : 'en') : '—'}<br />{report.infantCareCenterEvaluationResults?.convertedAt ? new Date(report.infantCareCenterEvaluationResults.convertedAt).toLocaleString(language === 'zh' ? 'zh-TW' : 'en') : '—'}<br />{report.elderlyWelfareInstitutions?.convertedAt ? new Date(report.elderlyWelfareInstitutions.convertedAt).toLocaleString(language === 'zh' ? 'zh-TW' : 'en') : '—'}<br />{report.biotechCompanyDirectory?.convertedAt ? new Date(report.biotechCompanyDirectory.convertedAt).toLocaleString(language === 'zh' ? 'zh-TW' : 'en') : '—'}<br />{report.taipeiTravelAccommodationsZh?.convertedAt ? new Date(report.taipeiTravelAccommodationsZh.convertedAt).toLocaleString(language === 'zh' ? 'zh-TW' : 'en') : '—'}<br />{report.industryGrantRecipients?.convertedAt ? new Date(report.industryGrantRecipients.convertedAt).toLocaleString(language === 'zh' ? 'zh-TW' : 'en') : '—'}<br />{report.metroProcurementSchedules?.convertedAt ? new Date(report.metroProcurementSchedules.convertedAt).toLocaleString(language === 'zh' ? 'zh-TW' : 'en') : '—'}<br />{report.registeredCramSchools?.convertedAt ? new Date(report.registeredCramSchools.convertedAt).toLocaleString(language === 'zh' ? 'zh-TW' : 'en') : '—'}<br />{report.registeredHotels?.convertedAt ? new Date(report.registeredHotels.convertedAt).toLocaleString(language === 'zh' ? 'zh-TW' : 'en') : '—'}<br />{report.laborStandardActViolationRecords?.convertedAt ? new Date(report.laborStandardActViolationRecords.convertedAt).toLocaleString(language === 'zh' ? 'zh-TW' : 'en') : '—'}<br />{report.consumerDisputeAbsentBusinessOperators?.convertedAt ? new Date(report.consumerDisputeAbsentBusinessOperators.convertedAt).toLocaleString(language === 'zh' ? 'zh-TW' : 'en') : '—'}<br />{report.registeredAnimalHospitals?.convertedAt ? new Date(report.registeredAnimalHospitals.convertedAt).toLocaleString(language === 'zh' ? 'zh-TW' : 'en') : '—'}</p></article></div>
      </section>}
    </main>
    <footer>{t.footer}</footer>
  </div>;
}
