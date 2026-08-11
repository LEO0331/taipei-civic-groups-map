import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const readSource = (path: string) => readFile(new URL(path, import.meta.url), 'utf8');

test('the application keeps the primary directory controls labelled and stateful', async () => {
  const source = await readSource('../App.tsx');
  assert.match(source, /<nav aria-label=/);
  assert.match(source, /aria-pressed=\{tab === id\}/);
  assert.match(source, /DirectoryModuleLoading/);
});

test('the data-trust disclosure remains semantic and announces fetched status', async () => {
  const source = await readSource('../DataTrustPanel.tsx');
  assert.match(source, /<aside className="data-trust" aria-label=/);
  assert.match(source, /<details>/);
  assert.match(source, /<summary>/);
  assert.match(source, /role="status" aria-live="polite"/);
});

test('the shared stylesheet retains a visible keyboard focus treatment', async () => {
  const source = await readSource('../styles.css');
  assert.match(source, /:focus-visible/);
  assert.match(source, /--focus-ring/);
});
