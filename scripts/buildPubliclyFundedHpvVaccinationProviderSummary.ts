import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { buildPubliclyFundedHpvVaccinationProviderSummary } from '../src/lib/publiclyFundedHpvVaccinationProviders';
import type { PubliclyFundedHpvVaccinationProviderRecord } from '../src/types';

const dataDir = join(process.cwd(), 'public/data');
const records = JSON.parse(await readFile(join(dataDir, 'publicly-funded-hpv-vaccination-providers.json'), 'utf8')) as PubliclyFundedHpvVaccinationProviderRecord[];
await writeFile(join(dataDir, 'publicly-funded-hpv-vaccination-provider-summary.json'), JSON.stringify(buildPubliclyFundedHpvVaccinationProviderSummary(records)));
console.log(`Built publicly funded HPV vaccination provider summary for ${records.length} records.`);
