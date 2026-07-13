import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { buildSeniorGroupMealServiceSiteSummary } from '../src/lib/seniorGroupMealServiceSites';
import type { SeniorGroupMealServiceSiteRecord } from '../src/types';

const dataDir = join(process.cwd(), 'public/data/senior-group-meal-service-sites');
const records = JSON.parse(await readFile(join(dataDir, 'records.json'), 'utf8')) as SeniorGroupMealServiceSiteRecord[];
await writeFile(join(dataDir, 'summary.json'), JSON.stringify(buildSeniorGroupMealServiceSiteSummary(records)));
console.log(`Built senior group meal service site summary for ${records.length} records.`);
