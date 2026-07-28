import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

type OfficialService = {
  caseSetId?: string;
  caseSetName?: string;
  orgName?: string | null;
  remark?: string;
  sort?: number | null;
  isHide?: boolean;
  online?: boolean;
  counter?: boolean;
  title?: string;
  tags?: string[];
};

const root = process.cwd();
const rawDirectory = join(root, 'data/raw/taipei-government-application-services');
const outputDirectory = join(root, 'public/data/taipei-government-application-services');
const source = JSON.parse(await readFile(join(rawDirectory, 'source.json'), 'utf8')) as OfficialService[];

if (!Array.isArray(source)) throw new Error('Official Taipei Services source.json must be an array.');
if (JSON.stringify(source).includes('\uFFFD')) throw new Error('Official Taipei Services source contains replacement characters.');

const records = source
  .filter((record) => record.caseSetId && record.caseSetName && !record.isHide)
  .map((record) => {
    const serviceCategory = record.tags?.[0] ?? '';
    const serviceUrl = `https://service.taipei/case-detail/${encodeURIComponent(record.caseSetId!)}`;
    return {
      id: record.caseSetId,
      serviceCategory,
      parentAgency: record.orgName ?? '',
      responsibleAgency: record.orgName ?? '',
      caseNumber: record.caseSetId,
      sortOrder: record.sort ?? null,
      serviceName: record.caseSetName,
      processingUnit: record.orgName ?? '',
      applicationMethod: record.title ?? '',
      createdDate: null,
      updatedDate: null,
      serviceUrl,
      hasValidServiceUrl: true,
      sourceTags: record.tags ?? [],
      sourceRemark: record.remark ?? '',
      supportsOnlineApplication: Boolean(record.online),
      supportsCounterApplication: Boolean(record.counter),
    };
  });

const countBy = (values: string[]) => Object.entries(values.filter(Boolean).reduce<Record<string, number>>((counts, value) => {
  counts[value] = (counts[value] ?? 0) + 1;
  return counts;
}, {})).map(([label, value]) => ({ label, value })).sort((left, right) => right.value - left.value || left.label.localeCompare(right.label, 'zh-Hant'));

const summary = {
  source: '臺北市政府－台北服務通',
  sourceUrl: 'https://service.taipei/',
  generatedAt: new Date().toISOString(),
  totalRecords: records.length,
  categories: countBy(records.map((record) => record.serviceCategory)),
  recordsWithOnlineApplication: records.filter((record) => record.supportsOnlineApplication).length,
  recordsWithCounterApplication: records.filter((record) => record.supportsCounterApplication).length,
};

await mkdir(outputDirectory, { recursive: true });
await Promise.all([
  writeFile(join(outputDirectory, 'records.json'), JSON.stringify(records)),
  writeFile(join(outputDirectory, 'summary.json'), JSON.stringify(summary, null, 2)),
  writeFile(join(outputDirectory, 'conversion-report.json'), JSON.stringify({
    source: summary.source,
    sourceUrl: summary.sourceUrl,
    encoding: 'UTF-8 JSON',
    inputRows: source.length,
    outputRecords: records.length,
    hiddenRecordsExcluded: source.filter((record) => record.isHide).length,
    missingIdsOrNames: source.filter((record) => !record.caseSetId || !record.caseSetName).length,
    notes: [
      'Fetched from the public Taipei Services search endpoint.',
      'The official search response supplies service names, identifiers, tags, application methods, and online/counter flags.',
      'The source response does not provide authoritative created or updated dates, so those fields are intentionally empty.',
    ],
  }, null, 2)),
]);

console.log(`Converted ${records.length} Taipei Government application-service records.`);
