import assert from 'node:assert/strict';
import test from 'node:test';
import { cleanHakkaOrganizationValue, stableHakkaOrganizationId } from './hakkaOrganizations';

test('preserves source identifiers and conservatively cleans registry strings', () => {
  assert.equal(cleanHakkaOrganizationValue('  大臺北  客家社團  '), '大臺北 客家社團');
  assert.equal(stableHakkaOrganizationId('001', '大臺北客家社團', {}), '001');
  assert.ok(stableHakkaOrganizationId('', '大臺北客家社團', { 編號: '', 單位名稱: '大臺北客家社團' }).includes('大台北客家社團'));
});
