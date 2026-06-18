import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { buildCivicGroupSummary } from '../src/lib/civicGroups';
import type { CivicGroup } from '../src/types';

const dataDir = join(process.cwd(), 'public/data');
const groups = JSON.parse(await readFile(join(dataDir, 'civic-groups.json'), 'utf8')) as CivicGroup[];
await writeFile(join(dataDir, 'civic-group-summary.json'), JSON.stringify(buildCivicGroupSummary(groups)));
console.log(`Built summary for ${groups.length} records.`);
