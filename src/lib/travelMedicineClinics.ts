export type MpoxVaccinationStatus = 'available' | 'not_available' | 'conditional' | 'unknown';

export type TravelMedicineClinicRecord = {
  id: string;
  postalCode: string;
  cityName: string;
  districtName: string | null;
  hospitalName: string;
  departmentRaw: string;
  department: string;
  phoneRaw: string;
  phone: string;
  extensionRaw: string;
  extension: string;
  address: string;
  mpoxSelfPaidVaccinationRaw: string;
  mpoxSelfPaidVaccination: MpoxVaccinationStatus;
  hasPhone: boolean;
  hasExtension: boolean;
  hasAddress: boolean;
  externalMapQuery: string;
  sourceValues: Record<string, string>;
};

const taipeiDistricts = ['中正區', '大同區', '中山區', '松山區', '大安區', '萬華區', '信義區', '士林區', '北投區', '內湖區', '南港區', '文山區'];
const postalDistricts: Record<string, string> = { '100': '中正區', '103': '大同區', '104': '中山區', '105': '松山區', '106': '大安區', '108': '萬華區', '110': '信義區', '111': '士林區', '112': '北投區', '114': '內湖區', '115': '南港區', '116': '文山區' };

export const cleanTravelMedicineValue = (value?: string) => (value ?? '').replace(/\s+/g, ' ').trim();
export const normalizeTravelMedicineText = (value?: string) => cleanTravelMedicineValue(value).replace(/臺/g, '台').toLocaleLowerCase();

export function deriveTaipeiDistrict(cityName: string, postalCode: string, address: string) {
  const explicit = taipeiDistricts.find((district) => address.includes(district));
  if (explicit) return explicit;
  return cityName === '臺北市' ? postalDistricts[postalCode] ?? null : null;
}

export function normalizeMpoxVaccinationStatus(value: string): MpoxVaccinationStatus {
  const text = cleanTravelMedicineValue(value).toLocaleLowerCase();
  if (!text) return 'unknown';
  if (/^(o|○|有|提供|是|yes)$/u.test(text)) return 'available';
  if (/^(x|×|無|未提供|否|no)$/u.test(text)) return 'not_available';
  if (/條件|洽詢|預約|依.*安排|部分/u.test(text)) return 'conditional';
  return 'unknown';
}

export const isPostalCode = (value: string) => /^\d{3}(?:\d{2})?$/.test(value);
export const isPhone = (value: string) => !value || /^[0-9()+\-\s]+$/.test(value);
export const fullPhone = (phone: string, extension: string, language: 'zh' | 'en') => extension ? `${phone}${language === 'zh' ? ' 分機 ' : ' ext. '}${extension.replace(/^#/, '')}` : phone;
