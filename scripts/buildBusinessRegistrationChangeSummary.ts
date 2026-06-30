import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { buildBusinessRegistrationChangeSummary } from '../src/lib/businessRegistrationChanges';
import type { BusinessRegistrationChangeRecord } from '../src/types';

const dataDir = join(process.cwd(), 'public/data');
const records = JSON.parse(await readFile(join(dataDir, 'business-registration-change-records.json'), 'utf8')) as BusinessRegistrationChangeRecord[];
await writeFile(join(dataDir, 'business-registration-change-summary.json'), JSON.stringify(buildBusinessRegistrationChangeSummary(records)));
console.log(`Built business registration change summary for ${records.length} records.`);
