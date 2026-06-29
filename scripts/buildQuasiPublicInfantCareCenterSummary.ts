import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { buildQuasiPublicInfantCareCenterSummary } from '../src/lib/quasiPublicInfantCareCenters';
import type { QuasiPublicInfantCareCenter } from '../src/types';

const dataDir = join(process.cwd(), 'public/data');
const records = JSON.parse(await readFile(join(dataDir, 'quasi-public-infant-care-centers.json'), 'utf8')) as QuasiPublicInfantCareCenter[];
await writeFile(join(dataDir, 'quasi-public-infant-care-center-summary.json'), JSON.stringify(buildQuasiPublicInfantCareCenterSummary(records)));
console.log(`Built quasi-public infant care center summary for ${records.length} records.`);
