import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import {
  buildCivicGroupSummary, extractDistrictFromAddress, inferCivicGroupCategory,
  normalizeColumnName, normalizeText, parseFoundedDate,
} from '../src/lib/civicGroups';
import type { CivicGroup } from '../src/types';

const rawDir = join(process.cwd(), 'data/raw/civic-groups');
const outputDir = join(process.cwd(), 'public/data');

export function parseCsv(input: string) {
  const rows: string[][] = [];
  let row: string[] = [], value = '', quoted = false;
  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];
    if (char === '"') {
      if (quoted && input[index + 1] === '"') value += input[++index];
      else quoted = !quoted;
    } else if (char === ',' && !quoted) {
      row.push(value); value = '';
    } else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && input[index + 1] === '\n') index += 1;
      row.push(value); value = '';
      if (row.some(Boolean)) rows.push(row);
      row = [];
    } else value += char;
  }
  if (value || row.length) { row.push(value); rows.push(row); }
  return rows;
}

export async function convertCivicGroups(filePath?: string) {
  const files = await readdir(rawDir);
  const inputPath = filePath ?? join(rawDir, files.find((file) => file.toLowerCase().endsWith('.csv')) ?? '');
  if (!basename(inputPath)) throw new Error('No CSV found. Run npm run data:fetch or add one under data/raw/civic-groups/.');
  const content = await readFile(inputPath, 'utf8');
  const [rawHeaders, ...rows] = parseCsv(content.replace(/^\uFEFF/, ''));
  const headers = rawHeaders.map(normalizeColumnName);
  const failedDates: string[] = [];
  let recordsWithoutDistrict = 0;

  const groups = rows.flatMap((row, index): CivicGroup[] => {
    const values = Object.fromEntries(headers.map((header, column) => [header, normalizeText(row[column])]));
    const name = values['名稱'];
    if (!name) return [];
    const address = values['地址'];
    const foundedDateRaw = values['成立日期'];
    const parsedDate = parseFoundedDate(foundedDateRaw);
    const district = extractDistrictFromAddress(address);
    const inferredCategory = inferCivicGroupCategory(name);
    if (!district) recordsWithoutDistrict += 1;
    if (foundedDateRaw && !parsedDate.foundedYear && failedDates.length < 20) failedDates.push(foundedDateRaw);
    return [{
      id: createHash('sha1').update(`${values['機關代碼'] ?? ''}|${name}|${index}`).digest('hex').slice(0, 12),
      agencyCode: values['機關代碼'], name, address, phone: values['電話'], district,
      foundedDateRaw, ...parsedDate, inferredCategory,
      inferredCategorySource: inferredCategory === 'other' ? 'unknown' : 'name_keyword',
      source: '臺北市人民團體名冊',
    }];
  });

  const fileInfo = await stat(inputPath);
  const report = {
    source: '臺北市人民團體名冊',
    sourcePage: 'https://data.taipei/dataset/detail?id=72417af0-7dec-4fad-b762-5f2baafcf084',
    inputFile: basename(inputPath),
    convertedAt: new Date().toISOString(),
    fileSize: fileInfo.size,
    inputRows: rows.length,
    outputRecords: groups.length,
    recordsWithoutDistrict,
    failedFoundedDateCount: rows.filter((row) => {
      const raw = normalizeText(row[headers.indexOf('成立日期')]);
      return raw && !parseFoundedDate(raw).foundedYear;
    }).length,
    failedFoundedDateExamples: failedDates,
    notes: ['UTF-8-SIG decoded', 'Empty strings normalized', 'Categories inferred from organization-name keywords'],
  };

  await mkdir(outputDir, { recursive: true });
  await Promise.all([
    writeFile(join(outputDir, 'civic-groups.json'), JSON.stringify(groups)),
    writeFile(join(outputDir, 'civic-group-summary.json'), JSON.stringify(buildCivicGroupSummary(groups))),
    writeFile(join(outputDir, 'conversion-report.json'), JSON.stringify(report, null, 2)),
  ]);
  return { groups, report };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const file = process.argv.find((arg) => arg.startsWith('--file='))?.slice(7);
  const { report } = await convertCivicGroups(file);
  console.log(`Converted ${report.outputRecords} records from ${report.inputFile}.`);
}
