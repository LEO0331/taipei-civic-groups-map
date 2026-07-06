import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { buildEmploymentAgencyIntermediaryCompanySummary } from '../src/lib/employmentAgencyIntermediaryCompanies';
import type { EmploymentAgencyIntermediaryCompanyRecord } from '../src/types';

const outputDir = join(process.cwd(), 'public/data/employment-agency-intermediary-companies');
const records = JSON.parse(await readFile(join(outputDir, 'records.json'), 'utf8')) as EmploymentAgencyIntermediaryCompanyRecord[];
const summary = buildEmploymentAgencyIntermediaryCompanySummary(records);

await mkdir(outputDir, { recursive: true });
await writeFile(join(outputDir, 'summary.json'), JSON.stringify(summary));
console.log(`Built employment agency intermediary company summary for ${records.length} records.`);
