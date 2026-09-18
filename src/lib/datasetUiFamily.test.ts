import assert from 'node:assert/strict';
import test from 'node:test';
import { datasetCategoryById } from './datasetCatalogue';
import { hasExplicitUiFamily, uiFamilyForDataset } from './datasetUiFamily';
import { UI_FAMILIES } from './uiFamilies';

test('every catalogued dataset resolves to one of the six UI families', () => {
  const allowed = new Set(Object.values(UI_FAMILIES));
  const ids = Object.keys(datasetCategoryById);
  assert.ok(ids.length > 100);
  for (const id of ids) {
    assert.equal(hasExplicitUiFamily(id), true, id);
    assert.equal(allowed.has(uiFamilyForDataset(id)), true, `${id}: ${uiFamilyForDataset(id)}`);
  }
});

test('representative task types keep their intended family assignments', () => {
  assert.equal(uiFamilyForDataset('rehabilitationMedicineInstitutions'), UI_FAMILIES.healthcareStandard);
  assert.equal(uiFamilyForDataset('adultInfluenzaVaccineProviders'), UI_FAMILIES.healthcareRichDirectory);
  assert.equal(uiFamilyForDataset('physicalTherapyClinics'), UI_FAMILIES.locationDirectory);
  assert.equal(uiFamilyForDataset('laborUnions'), UI_FAMILIES.registryDirectory);
  assert.equal(uiFamilyForDataset('laborViolations'), UI_FAMILIES.recordsAnalysis);
  assert.equal(uiFamilyForDataset('alternativeServiceReserveStatistics'), UI_FAMILIES.statisticsAnalysis);
});

test('unknown future datasets fail soft into the registry family', () => {
  assert.equal(uiFamilyForDataset('futureDatasetNotYetClassified'), UI_FAMILIES.registryDirectory);
  assert.equal(hasExplicitUiFamily('futureDatasetNotYetClassified'), false);
});
