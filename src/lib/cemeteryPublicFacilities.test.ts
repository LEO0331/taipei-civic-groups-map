import assert from 'node:assert/strict';
import test from 'node:test';
import { classifyCemeteryBurialStatus, classifyCemeteryOpeningHours, classifyCemeteryType, parseCemeteryCoordinate, parseCemeteryNote } from './cemeteryPublicFacilities';

test('classifies cemetery source fields', () => {
  assert.equal(classifyCemeteryType('列管公墓'), 'managed_cemetery');
  assert.equal(classifyCemeteryType('公墓'), 'cemetery');
  assert.equal(classifyCemeteryBurialStatus('全面禁葬'), 'fully_burial_prohibited');
  assert.equal(classifyCemeteryBurialStatus('受理申請七年輪葬'), 'rotational_burial_application_accepted');
  assert.equal(classifyCemeteryBurialStatus('受理預留壽穴申請'), 'reserved_life_grave_application_accepted');
  assert.equal(classifyCemeteryOpeningHours('全日'), 'all_day');
  assert.equal(classifyCemeteryOpeningHours('08:00~16:00'), 'time_range');
});

test('validates Taipei coordinate ranges and neutral notes', () => {
  assert.deepEqual(parseCemeteryCoordinate('25.05', 'latitude'), { value: 25.05, valid: true, coordinateQuality: 'valid_wgs84_taipei', warning: undefined });
  assert.equal(parseCemeteryCoordinate('26', 'latitude').coordinateQuality, 'outside_taipei_bounds');
  assert.equal(parseCemeteryCoordinate('', 'longitude').coordinateQuality, 'missing');
  assert.equal(parseCemeteryNote('無').hasNote, false);
  assert.equal(parseCemeteryNote('需洽管理單位').hasNote, true);
});
