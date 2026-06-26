import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { buildNangangSoftwareParkCompanySummary } from '../src/lib/nangangSoftwareParkCompanies';
import type { NangangSoftwareParkCompany } from '../src/types';

const dataDir = join(process.cwd(), 'public/data');
const records = JSON.parse(await readFile(join(dataDir, 'nangang-software-park-companies.json'), 'utf8')) as NangangSoftwareParkCompany[];
await writeFile(join(dataDir, 'nangang-software-park-company-summary.json'), JSON.stringify(buildNangangSoftwareParkCompanySummary(records)));
console.log(`Built Nangang Software Park company summary for ${records.length} records.`);
