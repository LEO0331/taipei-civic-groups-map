import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { convertHearingCenters } from '../../scripts/convertHearingCenters';
import { convertSeniorServices } from '../../scripts/convertSeniorServices';

test('restored official hearing source decodes Big5 and reproduces every source row', async () => {
  const result = convertHearingCenters(await readFile('data/raw/hearing-centers/source.csv'));
  const published = JSON.parse(await readFile('public/data/hearing-centers/records.json', 'utf8'));
  assert.equal(result.report.encoding, 'CP950 / Big5-compatible');
  assert.equal(result.records.length, 4);
  assert.equal(result.records[0].name, '建聲台北聽力所');
  assert.equal(result.records[0].district, '中正區');
  assert.deepEqual(result.records, published);
  assert.equal(result.records[0].sourceValues['地址'], '台北市中正區新生南路一段104號4樓');
});

test('restored senior directory preserves source values and existing date/district derivations', async () => {
  const result = convertSeniorServices(await readFile('data/raw/senior-services/source.csv'));
  assert.equal(result.records.length, 355);
  assert.equal(result.records[0].establishedDateRaw, '1070709');
  assert.equal(result.records[0].establishedDate, '2018-07-09');
  assert.equal(result.records[0].district, '萬華區');
  assert.deepEqual(result.records, JSON.parse(await readFile('public/data/senior-services/records.json', 'utf8')));
  assert.equal(new Set(result.records.map(record => record.id)).size, result.records.length);
});

test('directory converters reject missing contracts and empty sources', () => {
  const bytes = (value: string) => new TextEncoder().encode(value);
  assert.throws(() => convertHearingCenters(bytes('name,address\nA,B')), /headers/);
  assert.throws(() => convertSeniorServices(bytes('name,address\nA,B')), /headers/);
  assert.throws(() => convertHearingCenters(bytes('序號,機構名稱,行政區域代碼,郵遞區號,地址\n')), /Empty/);
});

test('restored directory source dates remain unknown and the original trust universe is intact', async () => {
  const manifest = JSON.parse(await readFile('public/data/data-trust-manifest.json', 'utf8'));
  const recovered = manifest.entries.filter((entry: { id: string }) => ['hearing-centers', 'senior-services'].includes(entry.id));
  assert.equal(recovered.length, 2);
  assert.ok(recovered.every((entry: { sourceUpdatedAt?: string }) => !entry.sourceUpdatedAt));
  assert.equal(manifest.entries.length - recovered.length, 117);
});
