import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { buildRegisteredAnimalHospitalSummary } from '../src/lib/registeredAnimalHospitals';
import type { RegisteredAnimalHospital } from '../src/types';

const dataDir = join(process.cwd(), 'public/data');
const records = JSON.parse(await readFile(join(dataDir, 'registered-animal-hospitals.json'), 'utf8')) as RegisteredAnimalHospital[];
await writeFile(join(dataDir, 'registered-animal-hospital-summary.json'), JSON.stringify(buildRegisteredAnimalHospitalSummary(records)));
console.log(`Built animal hospital summary for ${records.length} records.`);
