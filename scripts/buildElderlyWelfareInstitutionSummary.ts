import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { buildElderlyWelfareInstitutionSummary } from '../src/lib/elderlyWelfareInstitutions';
import type { ElderlyWelfareInstitutionRecord } from '../src/types';

const dataDir = join(process.cwd(), 'public/data');
const records = JSON.parse(await readFile(join(dataDir, 'elderly-welfare-institutions.json'), 'utf8')) as ElderlyWelfareInstitutionRecord[];
await writeFile(join(dataDir, 'elderly-welfare-institution-summary.json'), JSON.stringify(buildElderlyWelfareInstitutionSummary(records)));
console.log(`Built elderly welfare institution summary for ${records.length} records.`);
