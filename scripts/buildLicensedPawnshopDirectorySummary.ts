import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { buildLicensedPawnshopDirectorySummary } from '../src/lib/licensedPawnshopDirectory';
import type { LicensedPawnshopDirectoryRecord } from '../src/types';

const outputDir = join(process.cwd(), 'public/data');
const records = JSON.parse(await readFile(join(outputDir, 'licensed-pawnshop-directory.json'), 'utf8')) as LicensedPawnshopDirectoryRecord[];
await writeFile(join(outputDir, 'licensed-pawnshop-directory-summary.json'), JSON.stringify(buildLicensedPawnshopDirectorySummary(records)));
console.log(`Built licensed pawnshop directory summary for ${records.length} records.`);
