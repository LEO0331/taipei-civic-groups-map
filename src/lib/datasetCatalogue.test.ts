import assert from 'node:assert/strict';
import test from 'node:test';
import { buildDatasetCatalogue, datasetCategoryById } from './datasetCatalogue';

const items: Array<readonly [string, string]> = [
  ['influenzaVaccineProvidersChildren3Plus', '3歲以上幼童流感疫苗合約院所'],
  ['familyMedicineInstitutions', '家庭醫學科醫療機構'],
  ['communityPublicChildcareHomes', '社區公共托育家園'],
  ['laborUnions', '工會'],
  ['laborViolations', '勞基法違規公布紀錄'],
  ['funeralServiceBusinesses', '殯葬禮儀服務業'],
  ['artsCulturalVenues', '臺北市藝文場館'],
  ['animalHospitals', '動物醫院'],
];

const resultIds = (query: string) =>
  buildDatasetCatalogue(items, 'zh', query).flatMap((category) => category.items.map(([id]) => id));

test('groups every registered dataset under one catalogue category', () => {
  assert.equal(datasetCategoryById.influenzaVaccineProvidersChildren3Plus, 'health');
  assert.equal(datasetCategoryById.animalHospitals, 'animals');
  assert.equal(buildDatasetCatalogue(items, 'zh').reduce((count, category) => count + category.items.length, 0), items.length);
});

test('broad category vocabulary still browses the full matching category', () => {
  assert.deepEqual(resultIds('health'), ['influenzaVaccineProvidersChildren3Plus', 'familyMedicineInstitutions']);
});

test('specific task synonyms do not expand to unrelated category siblings', () => {
  assert.deepEqual(resultIds('預防針'), ['influenzaVaccineProvidersChildren3Plus']);
  assert.deepEqual(resultIds('daycare'), ['communityPublicChildcareHomes']);
  assert.deepEqual(resultIds('union'), ['laborUnions']);
  assert.deepEqual(resultIds('labor standards'), ['laborViolations']);
  assert.deepEqual(resultIds('mortuary'), ['funeralServiceBusinesses']);
  assert.deepEqual(resultIds('cultural venue'), ['artsCulturalVenues']);
});

test('normalizes common Taipei character variants for label search', () => {
  assert.deepEqual(resultIds('台北'), ['artsCulturalVenues']);
});

test('rejects a dataset that has no assigned category', () => {
  assert.throws(() => buildDatasetCatalogue([['new-dataset', 'New dataset']], 'en'), /missing a catalogue category/);
});
