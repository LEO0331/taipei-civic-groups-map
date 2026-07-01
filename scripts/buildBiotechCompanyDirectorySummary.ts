import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { buildBiotechCompanyDirectorySummary } from '../src/lib/biotechCompanyDirectory';
import type { BiotechCompanyDirectoryRecord } from '../src/types';

const dataDir = join(process.cwd(), 'public/data');
const records = JSON.parse(await readFile(join(dataDir, 'biotech-company-directory.json'), 'utf8')) as BiotechCompanyDirectoryRecord[];
await writeFile(join(dataDir, 'biotech-company-directory-summary.json'), JSON.stringify(buildBiotechCompanyDirectorySummary(records)));
console.log(`Built biotech company directory summary for ${records.length} records.`);
