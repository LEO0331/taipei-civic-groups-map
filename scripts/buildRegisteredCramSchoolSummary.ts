import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { buildRegisteredCramSchoolSummary } from '../src/lib/registeredCramSchools';
import type { RegisteredCramSchool } from '../src/types';

const dataDir = join(process.cwd(), 'public/data');
const records = JSON.parse(await readFile(join(dataDir, 'registered-cram-schools.json'), 'utf8')) as RegisteredCramSchool[];
await writeFile(join(dataDir, 'registered-cram-school-summary.json'), JSON.stringify(buildRegisteredCramSchoolSummary(records)));
console.log('Built registered cram-school summary.');
