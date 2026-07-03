import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { buildRegisteredRecyclingBusinessOrganizationSummary } from '../src/lib/registeredRecyclingBusinessOrganizations';
import type { RegisteredRecyclingBusinessOrganizationRecord } from '../src/types';

const outputDir = join(process.cwd(), 'public/data');
const records = JSON.parse(await readFile(join(outputDir, 'registered-recycling-business-organizations.json'), 'utf8')) as RegisteredRecyclingBusinessOrganizationRecord[];
await writeFile(join(outputDir, 'registered-recycling-business-organization-summary.json'), JSON.stringify(buildRegisteredRecyclingBusinessOrganizationSummary(records)));
console.log('Built registered recycling business organization summary.');
