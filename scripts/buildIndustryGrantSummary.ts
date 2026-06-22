import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { buildIndustryGrantSummary } from '../src/lib/industryGrants';
import type { IndustryGrantRecipient } from '../src/types';

const dataDir = join(process.cwd(), 'public/data');
const records = JSON.parse(await readFile(join(dataDir, 'industry-grant-recipients.json'), 'utf8')) as IndustryGrantRecipient[];
await writeFile(join(dataDir, 'industry-grant-summary.json'), JSON.stringify(buildIndustryGrantSummary(records)));
console.log(`Built industry grant summary for ${records.length} records.`);
