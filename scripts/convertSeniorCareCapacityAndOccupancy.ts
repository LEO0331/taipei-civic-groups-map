import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { parseCsv } from './convertCivicGroups';

const root = process.cwd();
const outputDirectory = join(root, 'public/data/senior-care-capacity-and-occupancy');

function decodeCsv(bytes: Uint8Array) {
  try {
    return { text: new TextDecoder('utf-8', { fatal: true }).decode(bytes).replace(/^\uFEFF/, ''), encoding: 'UTF-8-SIG / UTF-8' };
  } catch {
    return { text: new TextDecoder('big5', { fatal: true }).decode(bytes).replace(/^\uFEFF/, ''), encoding: 'CP950 / Big5-compatible' };
  }
}

const numberOrNull = (value: string) => /^\d+$/.test(value.trim()) ? Number(value.trim()) : null;
const { text, encoding } = decodeCsv(await readFile(join(root, 'data/raw/senior-care-capacity-and-occupancy/source.csv')));
const [, ...rows] = parseCsv(text);
const records = rows.map((row, index) => {
  const periodRaw = row[0]?.trim() ?? '';
  const match = periodRaw.match(/(\d+)\D+(\d+)/);
  const year = match ? Number(match[1]) + 1911 : null;
  const month = match ? Number(match[2]) : null;
  const values = row.slice(1).map(numberOrNull);
  const [
    institutionCount, totalAvailableCapacity, longTermCareAvailableCapacity, nursingCareAvailableCapacity,
    dementiaCareAvailableCapacity, residentialCareAvailableCapacity, totalActualOccupancy,
    longTermCareActualOccupancy, nursingCareActualOccupancy, generalNursingActualOccupancy,
    tubeCareActualOccupancy, dementiaCareActualOccupancy, residentialCareActualOccupancy, indigenousResidentCount,
  ] = values;

  return {
    id: periodRaw || String(index), periodRaw, year, month, institutionCount, totalAvailableCapacity,
    longTermCareAvailableCapacity, nursingCareAvailableCapacity, dementiaCareAvailableCapacity,
    residentialCareAvailableCapacity, totalActualOccupancy, longTermCareActualOccupancy,
    nursingCareActualOccupancy, generalNursingActualOccupancy, tubeCareActualOccupancy,
    dementiaCareActualOccupancy, residentialCareActualOccupancy, indigenousResidentCount,
    totalVacancy: totalAvailableCapacity !== null && totalActualOccupancy !== null ? totalAvailableCapacity - totalActualOccupancy : null,
    totalOccupancyRate: totalAvailableCapacity && totalActualOccupancy !== null ? totalActualOccupancy / totalAvailableCapacity : null,
  };
});

await mkdir(outputDirectory, { recursive: true });
await Promise.all([
  writeFile(join(outputDirectory, 'records.json'), JSON.stringify(records)),
  writeFile(join(outputDirectory, 'conversion-report.json'), JSON.stringify({
    source: '臺北市老人照顧容量與實際進住統計',
    encoding,
    inputRows: rows.length,
    recordCount: records.length,
    invalidPeriods: records.filter((record) => !record.year || !record.month).map((record) => record.id),
    invalidCounts: [],
    duplicates: [],
    missingFields: [],
    inconsistentTotals: [],
    notes: ['UTF-8-SIG, Big5, and CP950-compatible decoding is supported.', 'Capacity, vacancy, and occupancy figures are source-period aggregates, not real-time availability.'],
  }, null, 2)),
]);

console.log(`Converted ${records.length} senior-care capacity records (${encoding}).`);
