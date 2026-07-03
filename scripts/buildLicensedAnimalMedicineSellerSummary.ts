import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { buildLicensedAnimalMedicineSellerSummary } from '../src/lib/licensedAnimalMedicineSellers';
import type { LicensedAnimalMedicineSellerRecord } from '../src/types';

const dataDir = join(process.cwd(), 'public/data');
const records = JSON.parse(await readFile(join(dataDir, 'licensed-animal-medicine-sellers.json'), 'utf8')) as LicensedAnimalMedicineSellerRecord[];
await writeFile(join(dataDir, 'licensed-animal-medicine-seller-summary.json'), JSON.stringify(buildLicensedAnimalMedicineSellerSummary(records)));
console.log(`Built animal medicine seller summary for ${records.length} records.`);
