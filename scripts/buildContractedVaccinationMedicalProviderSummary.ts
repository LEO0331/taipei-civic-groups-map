import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { buildContractedVaccinationMedicalProviderSummary } from '../src/lib/contractedVaccinationMedicalProviders';
import type { ContractedVaccinationMedicalProviderRecord } from '../src/types';

const outputDir = join(process.cwd(), 'public/data');
const records = JSON.parse(await readFile(join(outputDir, 'contracted-vaccination-medical-providers.json'), 'utf8')) as ContractedVaccinationMedicalProviderRecord[];
await writeFile(join(outputDir, 'contracted-vaccination-medical-provider-summary.json'), JSON.stringify(buildContractedVaccinationMedicalProviderSummary(records)));
console.log(`Built contracted vaccination provider summary for ${records.length} records.`);
