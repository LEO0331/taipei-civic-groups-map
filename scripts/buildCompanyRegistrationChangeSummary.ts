import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { buildCompanyRegistrationChangeSummary } from '../src/lib/companyRegistrationChanges';
import type { CompanyRegistrationChangeRecord } from '../src/types';

const dataDir = join(process.cwd(), 'public/data');
const records = JSON.parse(await readFile(join(dataDir, 'company-registration-change-records.json'), 'utf8')) as CompanyRegistrationChangeRecord[];
await writeFile(join(dataDir, 'company-registration-change-summary.json'), JSON.stringify(buildCompanyRegistrationChangeSummary(records)));
console.log(`Built company registration change summary for ${records.length} records.`);
