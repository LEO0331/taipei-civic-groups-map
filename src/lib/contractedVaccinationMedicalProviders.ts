import { DISTRICTS } from './civicGroups';
import type {
  ContractedVaccinationMedicalProviderFilters,
  ContractedVaccinationMedicalProviderRecord,
  ContractedVaccinationMedicalProviderSummary,
  HealthcareProviderPhoneType,
  VaccinationServiceItem,
} from '../types';

export const VACCINATION_SERVICE_LABELS_ZH: Record<VaccinationServiceItem, string> = {
  bcg_clinic: '卡介苗門診',
  child_routine: '幼兒常規',
  child_flu_under_3: '幼兒流感3歲以下',
  child_flu_over_3: '幼兒流感3歲以上',
  adult_flu: '成人流感',
  covid_19: 'COVID-19',
  pneumococcal: '肺炎鏈球菌',
  rotavirus: '輪狀病毒',
  mpox_clinic: 'M痘門診',
  enterovirus_clinic: '腸病毒門診',
};
export const VACCINATION_SERVICE_LABELS_EN: Record<VaccinationServiceItem, string> = {
  bcg_clinic: 'BCG clinic',
  child_routine: 'Child routine vaccination',
  child_flu_under_3: 'Child flu under 3',
  child_flu_over_3: 'Child flu age 3+',
  adult_flu: 'Adult flu',
  covid_19: 'COVID-19',
  pneumococcal: 'Pneumococcal',
  rotavirus: 'Rotavirus',
  mpox_clinic: 'Mpox clinic',
  enterovirus_clinic: 'Enterovirus clinic',
};
const DISTRICT_CODES: Record<string, string> = {
  '63000010': '松山區', '63000020': '信義區', '63000030': '大安區', '63000040': '中山區',
  '63000050': '中正區', '63000060': '大同區', '63000070': '萬華區', '63000080': '文山區',
  '63000090': '南港區', '63000100': '內湖區', '63000110': '士林區', '63000120': '北投區',
};

export function cleanText(raw: unknown) {
  const text = String(raw ?? '').replace(/\u3000/g, ' ').trim();
  return text && !['-', '--', 'NaN', 'nan', 'NULL', 'null'].includes(text) ? text : undefined;
}

export const normalizeProviderName = (raw: unknown) => cleanText(raw)?.replace(/[，、,.\s]+/g, '').toLocaleLowerCase();

export function normalizeTaipeiDistrict(raw: unknown) {
  const text = cleanText(raw);
  if (!text) return undefined;
  return DISTRICTS.find((district) => text.includes(district)) ?? DISTRICT_CODES[text];
}

export function parseVaccinationProviderAddress(raw: unknown, sourceDistrict?: string) {
  const address = cleanText(raw);
  if (!address) return {};
  const addressNormalized = address.replaceAll('台北市', '臺北市');
  const parsedDistrict = DISTRICTS.find((item) => addressNormalized.includes(item));
  const district = sourceDistrict ?? parsedDistrict;
  const afterDistrict = parsedDistrict ? addressNormalized.slice(addressNormalized.indexOf(parsedDistrict) + parsedDistrict.length) : addressNormalized;
  const roadName = afterDistrict.match(/([^0-9\s,，]+?[路街大道])(?:([0-9一二三四五六七八九十]+段))?/)?.slice(1, 3).filter(Boolean).join('');
  const warning = sourceDistrict && parsedDistrict && sourceDistrict !== parsedDistrict ? `District mismatch: ${sourceDistrict} / ${parsedDistrict}` : (district ? undefined : 'District not parsed');
  return { address, addressNormalized, district, roadName, warning };
}

export function parseVaccinationServiceFlag(raw: unknown) {
  const text = cleanText(raw);
  if (!text) return false;
  if (/^(?:0|n|N|否|無)$/.test(text)) return false;
  return /^(?:1|v|V|y|Y|是|有|○|●)$/.test(text) || Boolean(text);
}

export function parseHealthcareProviderPhone(raw: unknown) {
  const phone = cleanText(raw);
  if (!phone) return { phoneType: 'missing' as const };
  if (/[、/;,，；]/.test(phone)) return { phone, phoneDisplay: phone, phoneType: 'multiple' as const };
  if (/[#＃]|轉|分機/.test(phone)) return { phone, phoneDisplay: phone, phoneType: 'extension' as const };
  const digits = phone.replace(/\D/g, '');
  let phoneType: HealthcareProviderPhoneType = 'unknown';
  if (/^09\d{8}$/.test(digits)) phoneType = 'mobile';
  else if (/^02\d{7,8}$/.test(digits) || /^\(02\)/.test(phone)) phoneType = 'taipei_landline';
  else if (/^0[3-8]\d{6,8}$/.test(digits) || /^\(0[3-8]\)/.test(phone)) phoneType = 'other_landline';
  return { phone, phoneDisplay: phone, phoneDialHref: phoneType !== 'unknown' ? `tel:${digits}` : undefined, phoneType, warning: phoneType === 'unknown' ? 'Unsupported phone format' : undefined };
}

export function deriveVaccinationServiceItems(record: {
  hasBcgClinic: boolean; hasChildRoutineVaccination: boolean; hasChildFluUnder3: boolean; hasChildFluOver3: boolean; hasAdultFlu: boolean;
  hasCovid19: boolean; hasPneumococcal: boolean; hasRotavirus: boolean; hasMpoxClinic: boolean; hasEnterovirusClinic: boolean;
}) {
  return [
    ['bcg_clinic', record.hasBcgClinic], ['child_routine', record.hasChildRoutineVaccination], ['child_flu_under_3', record.hasChildFluUnder3],
    ['child_flu_over_3', record.hasChildFluOver3], ['adult_flu', record.hasAdultFlu], ['covid_19', record.hasCovid19],
    ['pneumococcal', record.hasPneumococcal], ['rotavirus', record.hasRotavirus], ['mpox_clinic', record.hasMpoxClinic], ['enterovirus_clinic', record.hasEnterovirusClinic],
  ].flatMap(([serviceItem, enabled]) => enabled ? [serviceItem as VaccinationServiceItem] : []);
}

function countBy<T extends string | number>(values: T[]) {
  const counts = new Map<T, number>();
  values.forEach((value) => counts.set(value, (counts.get(value) ?? 0) + 1));
  return [...counts].map(([key, count]) => ({ key, count })).sort((a, b) => b.count - a.count);
}

export function buildContractedVaccinationMedicalProviderSummary(records: ContractedVaccinationMedicalProviderRecord[]): ContractedVaccinationMedicalProviderSummary {
  const districtRows = countBy(records.flatMap((record) => record.district ?? []));
  return {
    totalRecords: records.length,
    uniqueProviderNameCount: new Set(records.map((record) => record.providerNameNormalized ?? record.providerName)).size,
    uniqueAddressCount: new Set(records.flatMap((record) => record.addressNormalized ?? [])).size,
    districtCount: districtRows.length,
    recordsWithPhone: records.filter((record) => record.hasPhone).length,
    recordsWithVoiceReservation: records.filter((record) => record.hasVoiceReservation).length,
    recordsWithParsedRoadName: records.filter((record) => record.roadName).length,
    byDistrict: districtRows.map(({ key: district }) => {
      const rows = records.filter((record) => record.district === district);
      return { district, providerCount: rows.length, serviceBreakdown: countBy(rows.flatMap((record) => record.serviceItems)).map(({ key: serviceItem, count }) => ({ serviceItem, count })) };
    }),
    byServiceItem: countBy(records.flatMap((record) => record.serviceItems)).map(({ key: serviceItem, count }) => ({ serviceItem, count })),
    byServiceItemCount: countBy(records.map((record) => record.serviceItemCount)).map(({ key: serviceItemCount, count }) => ({ serviceItemCount, providerCount: count })),
    byRoadName: countBy(records.flatMap((record) => record.roadName ?? [])).map(({ key: roadName, count }) => ({ roadName, count })),
    topProvidersByServiceItemCount: [...records].sort((a, b) => b.serviceItemCount - a.serviceItemCount).slice(0, 30).map(({ providerName, district, serviceItemCount, serviceItems }) => ({ providerName, district, serviceItemCount, serviceItems })),
    providerCategorySummary: {
      childVaccinationProviderCount: records.filter((record) => record.hasAnyChildVaccinationService).length,
      adultVaccinationProviderCount: records.filter((record) => record.hasAnyAdultVaccinationService).length,
      fluProviderCount: records.filter((record) => record.hasAnyFluService).length,
      covidProviderCount: records.filter((record) => record.hasAnyCovidService).length,
      specialClinicProviderCount: records.filter((record) => record.hasAnySpecialClinicService).length,
    },
  };
}

export function filterContractedVaccinationMedicalProviders(records: ContractedVaccinationMedicalProviderRecord[], filters: ContractedVaccinationMedicalProviderFilters, language: 'zh' | 'en') {
  const query = filters.search.trim().toLocaleLowerCase();
  const labels = language === 'zh' ? VACCINATION_SERVICE_LABELS_ZH : VACCINATION_SERVICE_LABELS_EN;
  return records.filter((record) => {
    const text = [record.providerName, record.district, record.address, record.roadName, record.phone, ...record.serviceItems.map((item) => labels[item])].filter(Boolean).join(' ').toLocaleLowerCase();
    return (!query || text.includes(query))
      && (!filters.district || record.district === filters.district)
      && (!filters.serviceItem || record.serviceItems.includes(filters.serviceItem as VaccinationServiceItem))
      && (!filters.serviceItemCount || record.serviceItemCount === Number(filters.serviceItemCount))
      && (!filters.roadName || record.roadName === filters.roadName)
      && (!filters.hasPhone || (filters.hasPhone === 'yes' ? record.hasPhone : !record.hasPhone))
      && (!filters.hasVoiceReservation || (filters.hasVoiceReservation === 'yes' ? record.hasVoiceReservation : !record.hasVoiceReservation))
      && (!filters.serviceGroup
        || (filters.serviceGroup === 'child' && record.hasAnyChildVaccinationService)
        || (filters.serviceGroup === 'adult' && record.hasAnyAdultVaccinationService)
        || (filters.serviceGroup === 'flu' && record.hasAnyFluService)
        || (filters.serviceGroup === 'covid' && record.hasAnyCovidService)
        || (filters.serviceGroup === 'special' && record.hasAnySpecialClinicService));
  });
}
