export type DirectoryLanguage = 'zh' | 'en';
export type DirectoryLocationRecord = Record<string, unknown>;

export type DirectoryLocationDimension = {
  id: 'district' | 'cityCounty';
  keys: readonly string[];
  zhLabel: string;
  enLabel: string;
  enPluralLabel: string;
};

const DISTRICT_DIMENSION: DirectoryLocationDimension = {
  id: 'district',
  keys: ['districtName', 'districtNameFromAddress', 'district'],
  zhLabel: '行政區',
  enLabel: 'District',
  enPluralLabel: 'Districts',
};

const CITY_COUNTY_DIMENSION: DirectoryLocationDimension = {
  id: 'cityCounty',
  keys: ['sourceCityOrCounty', 'cityName', 'cityCode'],
  zhLabel: '縣市',
  enLabel: 'City / County',
  enPluralLabel: 'Cities / Counties',
};

const AUTO_LOCATION_DIMENSIONS = [DISTRICT_DIMENSION, CITY_COUNTY_DIMENSION] as const;

const TAIWAN_CITY_COUNTY_LABELS: Record<string, { zh: string; en: string }> = {
  '63000000': { zh: '臺北市', en: 'Taipei City' },
  '65000000': { zh: '新北市', en: 'New Taipei City' },
  '68000000': { zh: '桃園市', en: 'Taoyuan City' },
  '66000000': { zh: '臺中市', en: 'Taichung City' },
  '67000000': { zh: '臺南市', en: 'Tainan City' },
  '64000000': { zh: '高雄市', en: 'Kaohsiung City' },
  '10002000': { zh: '宜蘭縣', en: 'Yilan County' },
  '10004000': { zh: '新竹縣', en: 'Hsinchu County' },
  '10005000': { zh: '苗栗縣', en: 'Miaoli County' },
  '10007000': { zh: '彰化縣', en: 'Changhua County' },
  '10008000': { zh: '南投縣', en: 'Nantou County' },
  '10009000': { zh: '雲林縣', en: 'Yunlin County' },
  '10010000': { zh: '嘉義縣', en: 'Chiayi County' },
  '10013000': { zh: '屏東縣', en: 'Pingtung County' },
  '10014000': { zh: '臺東縣', en: 'Taitung County' },
  '10015000': { zh: '花蓮縣', en: 'Hualien County' },
  '10016000': { zh: '澎湖縣', en: 'Penghu County' },
  '10017000': { zh: '基隆市', en: 'Keelung City' },
  '10018000': { zh: '新竹市', en: 'Hsinchu City' },
  '10020000': { zh: '嘉義市', en: 'Chiayi City' },
  '09007000': { zh: '連江縣', en: 'Lienchiang County' },
  '09020000': { zh: '金門縣', en: 'Kinmen County' },
};

function normalizedScalar(value: unknown) {
  if (typeof value === 'string' || typeof value === 'number') return String(value).trim();
  return '';
}

export function locationValue(record: DirectoryLocationRecord, dimension: DirectoryLocationDimension) {
  for (const key of dimension.keys) {
    const value = normalizedScalar(record[key]);
    if (value) return value;
  }
  return '';
}

export function detectLocationDimension(records: DirectoryLocationRecord[]) {
  return AUTO_LOCATION_DIMENSIONS.find((dimension) => records.some((record) => Boolean(locationValue(record, dimension)))) ?? null;
}

export function locationLabel(dimension: DirectoryLocationDimension, language: DirectoryLanguage) {
  return language === 'zh' ? dimension.zhLabel : dimension.enLabel;
}

export function locationPluralLabel(dimension: DirectoryLocationDimension, language: DirectoryLanguage) {
  return language === 'zh' ? dimension.zhLabel : dimension.enPluralLabel;
}

export function formatLocationValue(value: string, dimension: DirectoryLocationDimension, language: DirectoryLanguage) {
  if (dimension.id === 'cityCounty') {
    const mapped = TAIWAN_CITY_COUNTY_LABELS[value];
    if (mapped) return mapped[language];
  }
  return value;
}
