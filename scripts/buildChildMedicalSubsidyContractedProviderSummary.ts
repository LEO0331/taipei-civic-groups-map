import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { buildChildMedicalSubsidyContractedProviderSummary } from '../src/lib/childMedicalSubsidyContractedProviders';
import type { ChildMedicalSubsidyContractedProviderRecord } from '../src/types';

const outputDir = join(process.cwd(), 'public/data');
const records = JSON.parse(await readFile(join(outputDir, 'child-medical-subsidy-contracted-providers.json'), 'utf8')) as ChildMedicalSubsidyContractedProviderRecord[];
await writeFile(join(outputDir, 'child-medical-subsidy-contracted-provider-summary.json'), JSON.stringify(buildChildMedicalSubsidyContractedProviderSummary(records)));
console.log(`Built child medical subsidy provider summary for ${records.length} records.`);
