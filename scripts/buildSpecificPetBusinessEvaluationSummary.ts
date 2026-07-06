import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { buildSpecificPetBusinessEvaluationSummary } from '../src/lib/specificPetBusinessEvaluationResults';
import type { SpecificPetBusinessEvaluationRecord } from '../src/types';

const dataDir = join(process.cwd(), 'public/data/specific-pet-business-evaluation-results');
const records = JSON.parse(await readFile(join(dataDir, 'records.json'), 'utf8')) as SpecificPetBusinessEvaluationRecord[];
const summary = buildSpecificPetBusinessEvaluationSummary(records);
const latestYearRecords = records.filter((record) => record.sourceEvaluationYearRoc === summary.latestEvaluationYearRoc);
await Promise.all([
  writeFile(join(dataDir, 'summary.json'), JSON.stringify(summary)),
  writeFile(join(dataDir, 'district-summary.json'), JSON.stringify(summary.byDistrict)),
  writeFile(join(dataDir, 'evaluation-grade-summary.json'), JSON.stringify(summary.byEvaluationGrade)),
  writeFile(join(dataDir, 'business-item-summary.json'), JSON.stringify(summary.byBusinessItemCategory)),
  writeFile(join(dataDir, 'latest-year-records.json'), JSON.stringify(latestYearRecords)),
  writeFile(join(dataDir, 'year-comparison.json'), JSON.stringify(summary.yearComparison)),
]);
console.log(`Built specific pet business evaluation summary for ${records.length} records.`);
