import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { buildDentureSubsidyMedicalProviderSummary } from '../src/lib/dentureSubsidyMedicalProviders';
import type { DentureSubsidyMedicalProviderRecord } from '../src/types';

const outputDir = join(process.cwd(), 'public/data');
const records = JSON.parse(await readFile(join(outputDir, 'denture-subsidy-medical-providers.json'), 'utf8')) as DentureSubsidyMedicalProviderRecord[];
await writeFile(join(outputDir, 'denture-subsidy-medical-provider-summary.json'), JSON.stringify(buildDentureSubsidyMedicalProviderSummary(records)));
console.log(`Built denture subsidy provider summary for ${records.length} records.`);
