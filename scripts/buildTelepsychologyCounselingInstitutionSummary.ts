import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { buildTelepsychologyCounselingInstitutionSummary } from '../src/lib/telepsychologyCounselingInstitutions';
import type { TelepsychologyCounselingInstitutionRecord } from '../src/types';

const outputDir = join(process.cwd(), 'public/data');
const records = JSON.parse(await readFile(join(outputDir, 'telepsychology-counseling-institutions.json'), 'utf8')) as TelepsychologyCounselingInstitutionRecord[];
await writeFile(join(outputDir, 'telepsychology-counseling-institution-summary.json'), JSON.stringify(buildTelepsychologyCounselingInstitutionSummary(records)));
