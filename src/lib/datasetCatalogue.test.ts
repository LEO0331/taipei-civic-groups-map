import assert from 'node:assert/strict';
import test from 'node:test';
import { buildDatasetCatalogue, datasetCategoryById } from './datasetCatalogue';

const items: Array<readonly [string, string]> = [
  ['influenzaVaccineProvidersChildren3Plus', '3歲以上幼兒流感疫苗合約院所'],
  ['animalHospitals', '動物醫院'],
];

test('groups every registered dataset under one catalogue category', () => {
  assert.equal(datasetCategoryById.influenzaVaccineProvidersChildren3Plus, 'health');
  assert.equal(datasetCategoryById.animalHospitals, 'animals');
  assert.equal(buildDatasetCatalogue(items, 'zh').reduce((count, category) => count + category.items.length, 0), items.length);
});

test('finds datasets through their category vocabulary as well as their label', () => {
  const results = buildDatasetCatalogue(items, 'zh', 'vaccine');
  assert.deepEqual(results.flatMap((category) => category.items.map(([id]) => id)), ['influenzaVaccineProvidersChildren3Plus']);
});

test('rejects a dataset that has no assigned category', () => {
  assert.throws(() => buildDatasetCatalogue([['new-dataset', 'New dataset']], 'en'), /missing a catalogue category/);
});
