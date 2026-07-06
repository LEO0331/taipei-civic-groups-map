import assert from 'node:assert/strict';
import { test } from 'node:test';
import { classifySpecificPetBusinessEvaluationGrade, classifySpecificPetBusinessItem, parseEvaluationResourceYear, parseLicenseExpirationDate, parsePostalCode, parseSpecificPetBusinessAddress, parseSpecificPetBusinessItems } from './specificPetBusinessEvaluationResults';

test('parses specific pet business evaluation source fields conservatively', () => {
  assert.deepEqual(parseEvaluationResourceYear('114年度臺北市特定寵物業評鑑成果'), { sourceEvaluationYearRoc: 114, sourceEvaluationYearGregorian: 2025, resourceType: 'evaluation_114' });
  assert.equal(parsePostalCode('00123').postalCodeNormalized, '00123');
  assert.equal(parsePostalCode('00123').validFormat, true);
  assert.equal(parseLicenseExpirationDate('114/12/31').licenseExpirationGregorianDate, '2025-12-31');
  assert.equal(parseSpecificPetBusinessAddress('台北市中山區松江路100號2樓').roadName, '松江路');
  assert.deepEqual(parseSpecificPetBusinessItems('買賣、寄養').businessItemCategories, ['sale', 'boarding']);
  assert.equal(classifySpecificPetBusinessItem('繁殖'), 'breeding');
  assert.equal(classifySpecificPetBusinessEvaluationGrade('優等'), 'excellent');
});
