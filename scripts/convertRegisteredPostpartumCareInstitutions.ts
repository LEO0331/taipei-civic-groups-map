import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { parseCsv } from './convertCivicGroups';
import { buildRegisteredPostpartumCareInstitutionSummary, cleanText, districtFromAddress, normalizeText, parseBed, roadNameFromAddress } from '../src/lib/registeredPostpartumCareInstitutions';
import type { RegisteredPostpartumCareInstitutionRecord } from '../src/types';

const inputPath = join(process.cwd(), 'data/raw/registered-postpartum-care-institutions/registered-postpartum-care-institutions.csv');
const outputDirectory = join(process.cwd(), 'public/data/registered-postpartum-care-institutions');
const reportPath = join(process.cwd(), 'public/data/conversion-report.json');
const bytes = await readFile(inputPath);
let text: string;
try { text = new TextDecoder('utf-8', { fatal: true }).decode(bytes).replace(/^\uFEFF/, ''); }
catch { text = new TextDecoder('big5').decode(bytes).replace(/^\uFEFF/, ''); }

const [rawHeaders, ...rows] = parseCsv(text);
const headers = rawHeaders.map((header) => cleanText(header) ?? '');
const duplicateKeys: string[] = [];
const invalidBedCounts: string[] = [];
const seen = new Set<string>();
const records: RegisteredPostpartumCareInstitutionRecord[] = rows.flatMap((row, index): RegisteredPostpartumCareInstitutionRecord[] => {
  const values = Object.fromEntries(headers.map((header, columnIndex) => [header, cleanText(row[columnIndex])])) as Record<string, string | undefined>;
  const institutionCode = values['機構代碼'];
  const institutionName = values['機構名稱'];
  const address = values['機構地址'];
  const postpartumCareBedCount = parseBed(values['產後護理床開放床數']);
  const infantBedCount = parseBed(values['嬰兒床開放床數']);
  if (!institutionName) return [];
  if (values['產後護理床開放床數'] && !Number.isInteger(postpartumCareBedCount)) invalidBedCounts.push(String(index + 2));
  const duplicateKey = institutionCode ?? `${normalizeText(institutionName)}|${normalizeText(address)}`;
  if (seen.has(duplicateKey)) { duplicateKeys.push(duplicateKey); return []; }
  seen.add(duplicateKey);
  const phone = values['連絡電話'];
  const evaluationResult = values['督考或評鑑結果'];
  return [{
    id: createHash('sha1').update(duplicateKey).digest('hex').slice(0, 12), module: 'registered_postpartum_care_institutions',
    sourceSequenceNumber: values['編號'], institutionCode, institutionName, institutionNameNormalized: normalizeText(institutionName),
    districtNameFromAddress: districtFromAddress(address), address, addressNormalized: normalizeText(address), roadName: roadNameFromAddress(address),
    phone, phoneNormalized: phone?.replace(/[\s（）()－–—-]/g, ''), hasPhone: Boolean(phone),
    postpartumCareBedCount, infantBedCount, totalBedCount: (postpartumCareBedCount ?? 0) + (infantBedCount ?? 0),
    evaluationResult, evaluationResultNormalized: normalizeText(evaluationResult), hasEvaluationResult: Boolean(evaluationResult),
    googleMapsQuery: cleanText([address, institutionName].filter(Boolean).join(' ')), source: '臺北市立案產後護理機構名冊', sourceAgency: '臺北市政府衛生局',
  }];
});
const report = await readFile(reportPath, 'utf8').then(JSON.parse).catch(() => ({}));
await mkdir(outputDirectory, { recursive: true });
await Promise.all([
  writeFile(join(outputDirectory, 'records.json'), JSON.stringify(records)),
  writeFile(join(outputDirectory, 'summary.json'), JSON.stringify(buildRegisteredPostpartumCareInstitutionSummary(records))),
  writeFile(reportPath, JSON.stringify({ ...report, registeredPostpartumCareInstitutions: { convertedAt: new Date().toISOString(), headers, outputRecords: records.length, duplicateInstitutionCodes: duplicateKeys, invalidBedCounts } }, null, 2)),
]);
console.log(`Converted ${records.length} postpartum-care institutions.`);
