import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { buildLaborStandardActViolationSummary } from '../src/lib/laborStandardActViolations';
import type { LaborStandardActViolationManifest, LaborStandardActViolationRecord } from '../src/types';

const dataDir = join(process.cwd(), 'public/data/labor-standard-act-violation-records');
const manifest = JSON.parse(await readFile(join(dataDir, 'manifest.json'), 'utf8')) as LaborStandardActViolationManifest;
const chunks = await Promise.all(manifest.chunks.map((chunk) =>
  readFile(join(dataDir, chunk.file), 'utf8').then((text) => JSON.parse(text) as LaborStandardActViolationRecord[]),
));
await writeFile(join(process.cwd(), 'public/data/labor-standard-act-violation-summary.json'), JSON.stringify(buildLaborStandardActViolationSummary(chunks.flat())));
console.log('Built labor violation summary.');
