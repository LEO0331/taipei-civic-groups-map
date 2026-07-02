import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { buildShelteredWorkshopDirectorySummary } from '../src/lib/shelteredWorkshopDirectory';
import type { ShelteredWorkshopDirectoryRecord } from '../src/types';

const outputDir = join(process.cwd(), 'public/data');
const records = JSON.parse(await readFile(join(outputDir, 'sheltered-workshop-directory.json'), 'utf8')) as ShelteredWorkshopDirectoryRecord[];
await writeFile(join(outputDir, 'sheltered-workshop-directory-summary.json'), JSON.stringify(buildShelteredWorkshopDirectorySummary(records)));
console.log(`Built sheltered workshop directory summary for ${records.length} records.`);
