import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { buildOccupationalSafetyHealthViolationSummary } from '../src/lib/occupationalSafetyHealthViolations';
import type { OccupationalSafetyHealthViolationRecord } from '../src/types';

const dataDir = join(process.cwd(), 'public/data');
const records = JSON.parse(await readFile(join(dataDir, 'occupational-safety-health-violation-records.json'), 'utf8')) as OccupationalSafetyHealthViolationRecord[];
await writeFile(join(dataDir, 'occupational-safety-health-violation-summary.json'), JSON.stringify(buildOccupationalSafetyHealthViolationSummary(records)));
console.log(`Built OSH violation summary for ${records.length} records.`);
