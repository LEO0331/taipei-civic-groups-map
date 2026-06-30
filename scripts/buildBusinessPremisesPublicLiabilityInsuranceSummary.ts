import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { buildBusinessPremisesPublicLiabilityInsuranceSummary } from '../src/lib/businessPremisesPublicLiabilityInsurance';
import type { BusinessPremisesPublicLiabilityInsuranceRecord } from '../src/types';

const outputDir = join(process.cwd(), 'public/data');
const records = JSON.parse(await readFile(join(outputDir, 'business-premises-public-liability-insurance-records.json'), 'utf8')) as BusinessPremisesPublicLiabilityInsuranceRecord[];
await writeFile(join(outputDir, 'business-premises-public-liability-insurance-summary.json'), JSON.stringify(buildBusinessPremisesPublicLiabilityInsuranceSummary(records)));
