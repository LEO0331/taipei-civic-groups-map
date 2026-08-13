import assert from 'node:assert/strict';
import test from 'node:test';
import { deriveTaipeiDistrict, normalizeMpoxVaccinationStatus } from './travelMedicineClinics';

test('derives a Taipei district only from an explicit address or Taipei postal code', () => {
  assert.equal(deriveTaipeiDistrict('臺北市', '104', '104 臺北市中山區中山北路二段92號'), '中山區');
  assert.equal(deriveTaipeiDistrict('臺北市', '116', '臺北市興隆路三段111號'), '文山區');
  assert.equal(deriveTaipeiDistrict('新北市', '220', '新北市板橋區南雅南路二段21號'), null);
});

test('normalizes only explicit mpox source values', () => {
  assert.equal(normalizeMpoxVaccinationStatus('O'), 'available');
  assert.equal(normalizeMpoxVaccinationStatus(''), 'unknown');
  assert.equal(normalizeMpoxVaccinationStatus('X'), 'not_available');
  assert.equal(normalizeMpoxVaccinationStatus('請洽詢'), 'conditional');
});
