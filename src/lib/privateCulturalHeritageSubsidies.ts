export type ProjectCategory = 'restoration' | 'planning_design' | 'survey_research' | 'emergency_repair' | 'routine_maintenance' | 'disaster_prevention' | 'management_maintenance' | 'other';

export type PrivateCulturalHeritageSubsidyRecord = {
  id: string; yearRaw: string; rocYear: number | null; gregorianYear: number | null; areaRaw: string; areaName: string; districtName: string | null;
  heritageAssetName: string; approvedProjectRaw: string; approvedProjectCategories: ProjectCategory[]; approvedSubsidyRaw: string; approvedSubsidyTwd: number | null;
  hasValidYear: boolean; hasValidAmount: boolean; possibleHeritageRegistryMatch: boolean; sourceValues: Record<string, string>;
};

const districts = ['中正區', '大同區', '中山區', '松山區', '大安區', '萬華區', '信義區', '士林區', '北投區', '內湖區', '南港區', '文山區'];
const categoryRules: Array<[ProjectCategory, RegExp]> = [
  ['emergency_repair', /緊急|搶修/], ['disaster_prevention', /防災|防震|耐震|消防/], ['planning_design', /規劃|設計|監造/],
  ['survey_research', /調查|研究|測繪|普查|修復計畫/], ['management_maintenance', /管理|維護計畫/], ['routine_maintenance', /維護|保養/], ['restoration', /修復|整修|修繕/],
];

export function parseSubsidyYear(value: string) {
  const text = value.trim();
  if (/^\d{2,3}$/.test(text)) { const rocYear = Number(text); return rocYear >= 1 && rocYear <= 300 ? { rocYear, gregorianYear: rocYear + 1911 } : { rocYear: null, gregorianYear: null }; }
  if (/^\d{4}$/.test(text)) { const gregorianYear = Number(text); return gregorianYear >= 1900 && gregorianYear <= 2200 ? { rocYear: null, gregorianYear } : { rocYear: null, gregorianYear: null }; }
  return { rocYear: null, gregorianYear: null };
}

export function parseApprovedSubsidy(value: string) {
  const text = value.trim();
  if (!text || /^(--|-|—|無)$/u.test(text) || /[~～至]/u.test(text)) return null;
  const numeric = text.replace(/[\s\u3000,]/g, '').replace(/NT\$|NTD|新臺幣|元|\$/gi, '');
  return /^\d+(?:\.\d+)?$/.test(numeric) ? Number(numeric) : null;
}

export function classifyApprovedProject(value: string): ProjectCategory[] {
  const matches = categoryRules.filter(([, pattern]) => pattern.test(value)).map(([category]) => category);
  return matches.length ? matches : ['other'];
}

export function parseTaipeiDistrict(value: string) { return districts.find((district) => value.includes(district)) ?? null; }
export const normalizeAssetName = (value: string) => value.replace(/\s+/g, '').replace(/臺/g, '台').trim().toLocaleLowerCase();

export function formatTwd(value: number | null, language: 'zh' | 'en') { return value === null ? '—' : new Intl.NumberFormat(language === 'zh' ? 'zh-TW' : 'en-US', { style: 'currency', currency: 'TWD', maximumFractionDigits: 2 }).format(value); }
