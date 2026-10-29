import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { getCatalogueItems } from './catalogueItems';

test('catalogue extraction preserves every original label, ID and ordering in both languages', () => {
  const baseline = {
    zh: '86ae193628db05f90956251426ddb71bd04d8749bf2c983fad482b67ec666cc4',
    en: 'a49a19f2a96e9d6469aea6688708d2d8c54c5609fe177f019968b517602c8ba0',
  };
  for (const language of ['zh', 'en'] as const) {
    assert.equal(createHash('sha256').update(JSON.stringify(getCatalogueItems(language))).digest('hex'), baseline[language]);
  }
});
