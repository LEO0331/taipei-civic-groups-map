import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { buildDawannanIndustrialAreaCompanySummary } from '../src/lib/dawannanIndustrialAreaCompanies';
import type { DawannanIndustrialAreaCompanyRecord } from '../src/types';

const dataDir = join(process.cwd(), 'public/data');
const records = JSON.parse(await readFile(join(dataDir, 'dawannan-industrial-area-company-directory.json'), 'utf8')) as DawannanIndustrialAreaCompanyRecord[];
await writeFile(join(dataDir, 'dawannan-industrial-area-company-summary.json'), JSON.stringify(buildDawannanIndustrialAreaCompanySummary(records)));
console.log(`Built Dawannan Industrial Area company summary for ${records.length} records.`);
