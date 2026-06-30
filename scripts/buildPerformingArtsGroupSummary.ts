import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { buildPerformingArtsGroupSummary } from '../src/lib/performingArtsGroups';
import type { PerformingArtsGroupRecord } from '../src/types';

const outputDir = join(process.cwd(), 'public/data');
const records = JSON.parse(await readFile(join(outputDir, 'performing-arts-groups.json'), 'utf8')) as PerformingArtsGroupRecord[];
await writeFile(join(outputDir, 'performing-arts-group-summary.json'), JSON.stringify(buildPerformingArtsGroupSummary(records)));
console.log(`Built performing-arts group summary for ${records.length} records.`);
