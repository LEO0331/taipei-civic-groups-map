import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { buildInfantCareCenterEvaluationSummary } from '../src/lib/infantCareCenterEvaluationResults';
import type { InfantCareCenterEvaluationInstitutionRecord, InfantCareCenterEvaluationYearRecord } from '../src/types';

const dataDir = join(process.cwd(), 'public/data');
const [institutions, yearRecords] = await Promise.all([
  readFile(join(dataDir, 'infant-care-center-evaluation-institutions.json'), 'utf8').then((text) => JSON.parse(text) as InfantCareCenterEvaluationInstitutionRecord[]),
  readFile(join(dataDir, 'infant-care-center-evaluation-year-records.json'), 'utf8').then((text) => JSON.parse(text) as InfantCareCenterEvaluationYearRecord[]),
]);
const summary = buildInfantCareCenterEvaluationSummary(institutions, yearRecords);
const latest = yearRecords.filter((record) => record.evaluationYear === summary.latestEvaluationYear);
await Promise.all([
  writeFile(join(dataDir, 'infant-care-center-evaluation-summary.json'), JSON.stringify(summary)),
  writeFile(join(dataDir, 'infant-care-center-evaluation-latest.json'), JSON.stringify(latest)),
]);
console.log(`Built infant care center evaluation summary for ${institutions.length} institutions and ${yearRecords.length} year records.`);
