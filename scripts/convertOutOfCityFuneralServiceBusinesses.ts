import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { parseCsv } from './convertCivicGroups';
import { clean, city, norm, summary } from '../src/lib/outOfCityFuneralServiceBusinesses';
import type { OutOfCityFuneralServiceBusinessRecord } from '../src/types';

const inputPath = join(process.cwd(), 'data/raw/out-of-city-funeral-service-businesses/out-of-city-funeral-service-businesses.csv');
const outputDirectory = join(process.cwd(), 'public/data/out-of-city-funeral-service-businesses');
const reportPath = join(process.cwd(), 'public/data/conversion-report.json');
const bytes = await readFile(inputPath);
let text: string;
try { text = new TextDecoder('utf-8', { fatal: true }).decode(bytes).replace(/^\uFEFF/, ''); }
catch { text = new TextDecoder('big5', { fatal: true }).decode(bytes).replace(/^\uFEFF/, ''); }

const [rawHeaders, ...rows] = parseCsv(text);
const headers = rawHeaders.map((header) => clean(header) ?? '');
const duplicates: string[] = [];
const missingFields: string[] = [];
const seen = new Set<string>();
const records: OutOfCityFuneralServiceBusinessRecord[] = rows.flatMap((row, index): OutOfCityFuneralServiceBusinessRecord[] => {
  const values = Object.fromEntries(headers.map((header, columnIndex) => [header, clean(row[columnIndex])])) as Record<string, string | undefined>;
  const companyName = values['公司名稱'];
  const companyAddress = values['公司所在地'];
  const phone = values['電話'];
  if (!companyName || !companyAddress) { missingFields.push(String(index + 2)); return []; }
  const duplicateKey = `${norm(companyName)}|${norm(companyAddress)}|${norm(phone)}`;
  if (seen.has(duplicateKey)) { duplicates.push(duplicateKey); return []; }
  seen.add(duplicateKey);
  const responsiblePerson = values['負責人'];
  return [{
    id: createHash('sha1').update(duplicateKey).digest('hex').slice(0, 12), module: 'out_of_city_funeral_service_businesses', registryType: 'out_of_city_cross_jurisdiction',
    companyName, companyNameNormalized: norm(companyName), responsiblePerson, responsiblePersonNormalized: norm(responsiblePerson),
    postalCode: values['郵遞區號'], postalCodeNormalized: clean(values['郵遞區號']), companyAddress, companyAddressNormalized: norm(companyAddress),
    sourceCityOrCounty: city(companyAddress), phone, phoneNormalized: phone?.replace(/[\s（）()－–—-]/g, ''), hasPhone: Boolean(phone),
    googleMapsQuery: clean(`${companyAddress} ${companyName}`), source: '外縣市殯葬禮儀服務業跨區營運登記名冊', sourceAgency: '臺北市政府民政局殯葬管理處',
  }];
});
const report = await readFile(reportPath, 'utf8').then(JSON.parse).catch(() => ({}));
await mkdir(outputDirectory, { recursive: true });
await Promise.all([
  writeFile(join(outputDirectory, 'records.json'), JSON.stringify(records)),
  writeFile(join(outputDirectory, 'summary.json'), JSON.stringify(summary(records))),
  writeFile(reportPath, JSON.stringify({ ...report, outOfCityFuneralServiceBusinesses: {
    convertedAt: new Date().toISOString(), headers, outputRecords: records.length, duplicates, missingFields,
    notes: ['UTF-8-SIG decoded with Big5 / CP950 fallback.', 'Addresses are registered locations outside Taipei and not Taipei service locations.', 'No geocoding or map markers created.'],
  } }, null, 2)),
]);
console.log(`Converted ${records.length} out-of-city funeral service businesses.`);
