import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { buildDisabilityEmploymentResourceSummary } from '../src/lib/disabilityEmploymentResourceMap';
import type { DisabilityEmploymentResourceRecord } from '../src/types';

const outputDir = join(process.cwd(), 'public/data');
const records = JSON.parse(await readFile(join(outputDir, 'disability-employment-resource-map.json'), 'utf8')) as DisabilityEmploymentResourceRecord[];
await writeFile(join(outputDir, 'disability-employment-resource-map-summary.json'), JSON.stringify(buildDisabilityEmploymentResourceSummary(records)));
console.log(`Built disability employment resource summary for ${records.length} records.`);
