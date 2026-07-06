import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { buildEnterpriseHeadquartersSummary } from '../src/lib/enterpriseHeadquartersDistribution';
import type { EnterpriseHeadquartersRecord } from '../src/types';

const dataDir = join(process.cwd(), 'public/data/enterprise-headquarters-distribution');
const records = JSON.parse(await readFile(join(dataDir, 'records.json'), 'utf8')) as EnterpriseHeadquartersRecord[];
await writeFile(join(dataDir, 'summary.json'), JSON.stringify(buildEnterpriseHeadquartersSummary(records)));
console.log(`Built enterprise headquarters summary for ${records.length} records.`);
