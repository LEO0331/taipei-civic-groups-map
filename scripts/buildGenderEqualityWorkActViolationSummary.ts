import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { buildGenderEqualityWorkActViolationSummary } from '../src/lib/genderEqualityWorkActViolations';
import type { GenderEqualityWorkActViolationRecord } from '../src/types';

const dataDir = join(process.cwd(), 'public/data');
const records = JSON.parse(await readFile(join(dataDir, 'gender-equality-work-act-violation-records.json'), 'utf8')) as GenderEqualityWorkActViolationRecord[];
await writeFile(join(dataDir, 'gender-equality-work-act-violation-summary.json'), JSON.stringify(buildGenderEqualityWorkActViolationSummary(records)));
console.log(`Built Gender Equality Work Act violation summary for ${records.length} records.`);
