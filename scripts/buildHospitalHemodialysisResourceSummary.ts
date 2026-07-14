import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
const directory = join(process.cwd(), 'public/data/hospital-hemodialysis-resources');
const records = JSON.parse(await readFile(join(directory, 'records.json'), 'utf8'));
const byDistrict = new Map<string, number>(); records.forEach((record: { districtName?: string }) => { if (record.districtName) byDistrict.set(record.districtName, (byDistrict.get(record.districtName) ?? 0) + 1); });
await writeFile(join(directory, 'summary.json'), JSON.stringify({ totalRecords: records.length, districtCount: byDistrict.size, uniqueInstitutionNameCount: new Set(records.map((record: { institutionNameNormalized?: string }) => record.institutionNameNormalized).filter(Boolean)).size, recordsWithPhone: records.filter((record: { hasPhone: boolean }) => record.hasPhone).length, recordsWithoutPhone: records.filter((record: { hasPhone: boolean }) => !record.hasPhone).length, byDistrict: [...byDistrict].map(([district, count]) => ({ district, count })).sort((a, b) => b.count - a.count) }));
