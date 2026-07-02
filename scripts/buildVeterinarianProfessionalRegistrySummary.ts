import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { buildVeterinarianProfessionalRegistrySummary } from '../src/lib/veterinarianProfessionalRegistry';
import type { VeterinarianProfessionalRegistryRecord } from '../src/types';

const dataDir = join(process.cwd(), 'public/data');
const records = JSON.parse(await readFile(join(dataDir, 'veterinarian-professional-registry.json'), 'utf8')) as VeterinarianProfessionalRegistryRecord[];
await writeFile(join(dataDir, 'veterinarian-professional-registry-summary.json'), JSON.stringify(buildVeterinarianProfessionalRegistrySummary(records)));
console.log(`Built veterinarian professional registry summary for ${records.length} records.`);
