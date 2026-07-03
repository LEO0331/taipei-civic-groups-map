import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { buildCemeteryPublicFacilitySummary } from '../src/lib/cemeteryPublicFacilities';
import type { CemeteryPublicFacilityRecord } from '../src/types';

const outputDir = join(process.cwd(), 'public/data');
const records = JSON.parse(await readFile(join(outputDir, 'cemetery-public-facilities.json'), 'utf8')) as CemeteryPublicFacilityRecord[];
await writeFile(join(outputDir, 'cemetery-public-facility-summary.json'), JSON.stringify(buildCemeteryPublicFacilitySummary(records)));
console.log('Built cemetery public facility summary.');
