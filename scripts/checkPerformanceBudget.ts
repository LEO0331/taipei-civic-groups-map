import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { gzipSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';

export const ENTRY_RAW_LIMIT_BYTES = 450_000;
export const ENTRY_GZIP_LIMIT_BYTES = 130_000;

export type EntryMeasurement = {
  assetPath: string;
  rawBytes: number;
  gzipBytes: number;
};

export type EntryBudget = {
  rawBytes: number;
  gzipBytes: number;
};

export const entryBudget: EntryBudget = {
  rawBytes: ENTRY_RAW_LIMIT_BYTES,
  gzipBytes: ENTRY_GZIP_LIMIT_BYTES,
};

export function findEntryAssetPath(indexHtml: string) {
  const scriptTags = indexHtml.match(/<script\b[^>]*>/gi) ?? [];
  for (const tag of scriptTags) {
    if (!/\btype=(["'])module\1/i.test(tag)) continue;
    const source = tag.match(/\bsrc=(["'])(.*?)\1/i)?.[2];
    if (!source) continue;

    const pathname = new URL(source, 'https://build.local/').pathname;
    if (!pathname.endsWith('.js')) continue;

    const assetsIndex = pathname.lastIndexOf('/assets/');
    const relativePath = assetsIndex >= 0 ? pathname.slice(assetsIndex + 1) : pathname.replace(/^\/+/, '');
    if (!relativePath || relativePath.includes('..')) continue;
    return relativePath;
  }

  throw new Error('Could not find the production module entry script in dist/index.html.');
}

export function evaluateEntryBudget(measurement: EntryMeasurement, budget: EntryBudget = entryBudget) {
  const violations: string[] = [];
  if (measurement.rawBytes > budget.rawBytes) {
    violations.push(`raw entry size ${formatKilobytes(measurement.rawBytes)} exceeds ${formatKilobytes(budget.rawBytes)}`);
  }
  if (measurement.gzipBytes > budget.gzipBytes) {
    violations.push(`gzip entry size ${formatKilobytes(measurement.gzipBytes)} exceeds ${formatKilobytes(budget.gzipBytes)}`);
  }
  return violations;
}

export function formatKilobytes(bytes: number) {
  return `${(bytes / 1000).toFixed(2)} kB`;
}

export async function measureEntry(distDirectory = 'dist'): Promise<EntryMeasurement> {
  const indexPath = resolve(distDirectory, 'index.html');
  const indexHtml = await readFile(indexPath, 'utf8');
  const assetPath = findEntryAssetPath(indexHtml);
  const bytes = await readFile(resolve(distDirectory, assetPath));

  return {
    assetPath,
    rawBytes: bytes.byteLength,
    gzipBytes: gzipSync(bytes, { level: 9 }).byteLength,
  };
}

export async function checkPerformanceBudget(distDirectory = 'dist') {
  const measurement = await measureEntry(distDirectory);
  const violations = evaluateEntryBudget(measurement);

  console.log(
    `Performance budget: ${measurement.assetPath} = ${formatKilobytes(measurement.rawBytes)} / ${formatKilobytes(measurement.gzipBytes)} gzip; limits = ${formatKilobytes(entryBudget.rawBytes)} / ${formatKilobytes(entryBudget.gzipBytes)} gzip.`,
  );

  if (violations.length) {
    throw new Error(`Performance budget failed: ${violations.join('; ')}.`);
  }

  return measurement;
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) await checkPerformanceBudget(process.argv[2] ?? 'dist');
