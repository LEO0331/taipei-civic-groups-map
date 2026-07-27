import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { parseCsv } from './convertCivicGroups';

type SourceValues = Record<string, string>;

const root = process.cwd();
const input = join(root, 'data/raw/child-youth-friendly-welfare-service-sites/source.csv');
const outputDirectory = join(root, 'public/data/child-youth-friendly-welfare-service-sites');
const reportPath = join(root, 'public/data/conversion-report.json');

const aliases = {
  institutionName: ['機構名稱', '機構名稱 ', '璈??迂'],
  programmeName: ['方案名稱', '計畫名稱', '服務方案名稱', '閮?迂'],
  phoneRaw: ['電話', '聯絡電話', '?餉店'],
  address: ['地址', '機構地址', '?啣?'],
  serviceAreaRaw: ['服務區域', '服務範圍', '服務區域 ', '????'],
};

const taipeiDistricts = ['松山區', '信義區', '大安區', '中山區', '中正區', '大同區', '萬華區', '文山區', '南港區', '內湖區', '士林區', '北投區'];
const normalizeText = (value?: string) => (value ?? '').replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();
const normalized = (value?: string) => normalizeText(value).toLocaleLowerCase();
const field = (values: SourceValues, names: string[]) => names.map((name) => values[name]).find((value) => value != null) ?? '';
const districtFromAddress = (address: string) => taipeiDistricts.find((district) => address.includes(district)) ?? '';
const splitServiceAreas = (value: string) => {
  if (!/[、，,;；／/]/.test(value)) return value ? [value] : [];
  return value.split(/[、，,;；／/]+/).map(normalizeText).filter(Boolean);
};
const phoneLooksMalformed = (value: string) => Boolean(value) && !/[0-9０-９]/.test(value);

const buffer = await readFile(input);
const decodedCandidates = ['utf-8', 'big5', 'cp950'].flatMap((encoding) => {
  try {
    const text = new TextDecoder(encoding).decode(buffer).replace(/^\uFEFF/, '');
    return text.includes(',') || text.includes('\t') ? [{ encoding, text, replacements: (text.match(/�/g) ?? []).length }] : [];
  } catch { return []; }
});
const sourceText = decodedCandidates.sort((a, b) => a.replacements - b.replacements)[0]?.text ?? '';
if (!sourceText) throw new Error('Unable to decode source CSV as UTF-8-SIG, Big5, or CP950.');

const [headerRow, ...rows] = parseCsv(sourceText);
const headers = headerRow.map(normalizeText);
const records = rows.map((row): Record<string, unknown> => {
  const sourceValues = Object.fromEntries(headers.map((header, index) => [header, normalizeText(row[index])])) as SourceValues;
  const institutionName = field(sourceValues, aliases.institutionName);
  const programmeName = field(sourceValues, aliases.programmeName);
  const phoneRaw = field(sourceValues, aliases.phoneRaw);
  const address = field(sourceValues, aliases.address);
  const serviceAreaRaw = field(sourceValues, aliases.serviceAreaRaw);
  const identity = [normalized(institutionName), normalized(programmeName), normalized(address)].join('|');
  const hash = createHash('sha256').update(JSON.stringify(sourceValues)).digest('hex').slice(0, 16);
  return {
    id: identity.replaceAll('|', '') ? createHash('sha256').update(identity).digest('hex').slice(0, 16) : hash,
    institutionName, programmeName, phoneRaw, phone: phoneRaw, address,
    districtName: districtFromAddress(address), serviceAreaRaw, serviceAreas: splitServiceAreas(serviceAreaRaw),
    hasPhone: Boolean(phoneRaw), hasAddress: Boolean(address), hasProgramme: Boolean(programmeName), hasServiceArea: Boolean(serviceAreaRaw),
    externalMapQuery: address ? `${address} ${institutionName}`.trim() : '', sourceValues,
  };
});

const exactDeduplicated = records.filter((record, index, all) => all.findIndex((candidate) => JSON.stringify(candidate.sourceValues) === JSON.stringify(record.sourceValues)) === index);
const count = (items: string[]) => Object.entries(items.filter(Boolean).reduce<Record<string, number>>((result, item) => ({ ...result, [item]: (result[item] ?? 0) + 1 }), {})).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value || a.label.localeCompare(b.label, 'zh-Hant'));
const multiAddress = new Map<string, Set<string>>();
const multiInstitution = new Map<string, Set<string>>();
const programmeServiceAreas = new Map<string, Set<string>>();
for (const record of exactDeduplicated) {
  const item = record as { institutionName: string; programmeName: string; address: string; serviceAreaRaw: string };
  const programmeKey = `${normalized(item.institutionName)}|${normalized(item.programmeName)}`;
  if (programmeKey !== '|') (multiAddress.get(programmeKey) ?? multiAddress.set(programmeKey, new Set()).get(programmeKey)!).add(item.address);
  if (item.address) (multiInstitution.get(normalized(item.address)) ?? multiInstitution.set(normalized(item.address), new Set()).get(normalized(item.address))!).add(item.institutionName);
  if (programmeKey !== '|') (programmeServiceAreas.get(programmeKey) ?? programmeServiceAreas.set(programmeKey, new Set()).get(programmeKey)!).add(item.serviceAreaRaw);
}
const updatedAt = new Date().toISOString();
const summary = {
  updatedAt, totalRecords: exactDeduplicated.length,
  uniqueInstitutions: new Set(exactDeduplicated.map((record: any) => normalized(record.institutionName)).filter(Boolean)).size,
  uniqueProgrammes: new Set(exactDeduplicated.map((record: any) => normalized(record.programmeName)).filter(Boolean)).size,
  districtsWithServiceSites: count(exactDeduplicated.map((record: any) => record.districtName)).length,
  sourceRecordedServiceAreas: count(exactDeduplicated.map((record: any) => record.serviceAreaRaw)).length,
  recordsWithPhone: exactDeduplicated.filter((record: any) => record.hasPhone).length,
  recordsWithAddress: exactDeduplicated.filter((record: any) => record.hasAddress).length,
  recordsWithCompleteCoreFields: exactDeduplicated.filter((record: any) => record.institutionName && record.programmeName && record.address && record.phoneRaw && record.serviceAreaRaw).length,
  byDistrict: count(exactDeduplicated.map((record: any) => record.districtName)),
  byProgramme: count(exactDeduplicated.map((record: any) => record.programmeName)),
  byServiceArea: count(exactDeduplicated.map((record: any) => record.serviceAreaRaw)),
};
const report = {
  childYouthFriendlyWelfareServiceSites: {
    updatedAt, headers, inputRows: rows.length, outputRecords: exactDeduplicated.length, exactDuplicatesRemoved: records.length - exactDeduplicated.length,
    missingInstitutionName: exactDeduplicated.filter((record: any) => !record.institutionName).length,
    missingProgrammeName: exactDeduplicated.filter((record: any) => !record.programmeName).length,
    missingAddress: exactDeduplicated.filter((record: any) => !record.address).length,
    missingTelephoneNumber: exactDeduplicated.filter((record: any) => !record.phoneRaw).length,
    malformedTelephoneNumber: exactDeduplicated.filter((record: any) => phoneLooksMalformed(record.phoneRaw)).length,
    unresolvedDistrict: exactDeduplicated.filter((record: any) => record.address && !record.districtName).length,
    missingServiceArea: exactDeduplicated.filter((record: any) => !record.serviceAreaRaw).length,
    sameInstitutionAndProgrammeMultipleAddresses: [...multiAddress.values()].filter((addresses) => [...addresses].filter(Boolean).length > 1).length,
    sameAddressMultipleInstitutions: [...multiInstitution.values()].filter((institutions) => institutions.size > 1).length,
    conflictingServiceAreaDescriptions: [...programmeServiceAreas.values()].filter((areas) => [...areas].filter(Boolean).length > 1).length,
    notes: ['Only exact duplicate source rows are collapsed.', 'Service-area text is preserved; structured values are split only at explicit separators.', 'Addresses are not geocoded and no exact map markers are created.'],
  },
};
await mkdir(outputDirectory, { recursive: true });
await Promise.all([
  writeFile(join(outputDirectory, 'records.json'), JSON.stringify(exactDeduplicated, null, 2)),
  writeFile(join(outputDirectory, 'summary.json'), JSON.stringify(summary, null, 2)),
  writeFile(reportPath, JSON.stringify(report, null, 2)),
]);
console.log(`Converted ${exactDeduplicated.length.toLocaleString()} child and youth welfare service-site records.`);
