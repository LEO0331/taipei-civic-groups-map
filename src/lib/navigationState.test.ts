import assert from 'node:assert/strict';
import test from 'node:test';
import { buildHistoryState, buildNavigationUrl, readNavigationState } from './navigationState';

test('reads dataset and language from a shareable URL', () => {
  assert.deepEqual(
    readNavigationState('https://example.test/?dataset=physicalTherapyClinics&lang=en#records', 'zh'),
    { dataset: 'physicalTherapyClinics', language: 'en' },
  );
});

test('falls back to stored language and civic dataset for incomplete URLs', () => {
  assert.deepEqual(readNavigationState('https://example.test/', 'en'), { dataset: 'civic', language: 'en' });
  assert.deepEqual(readNavigationState('https://example.test/?lang=invalid', 'zh'), { dataset: 'civic', language: 'zh' });
});

test('builds shareable URLs while preserving unrelated query parameters and hash', () => {
  const url = buildNavigationUrl('https://example.test/?foo=bar#records', { dataset: 'gbsScreeningClinics', language: 'en' });
  assert.equal(url.searchParams.get('foo'), 'bar');
  assert.equal(url.searchParams.get('dataset'), 'gbsScreeningClinics');
  assert.equal(url.searchParams.get('lang'), 'en');
  assert.equal(url.hash, '#records');
});

test('civic navigation removes the redundant dataset parameter but retains language', () => {
  const url = buildNavigationUrl('https://example.test/?dataset=gbsScreeningClinics&foo=bar', { dataset: 'civic', language: 'zh' });
  assert.equal(url.searchParams.has('dataset'), false);
  assert.equal(url.searchParams.get('lang'), 'zh');
  assert.equal(url.searchParams.get('foo'), 'bar');
});

test('history state preserves unrelated state values', () => {
  assert.deepEqual(
    buildHistoryState({ scroll: 42 }, { dataset: 'physicalTherapyClinics', language: 'en' }),
    { scroll: 42, dataset: 'physicalTherapyClinics', language: 'en' },
  );
});
