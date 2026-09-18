import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const readSource = (path: string) => readFile(new URL(path, import.meta.url), 'utf8');

test('the application keeps the primary directory controls labelled, searchable, and stateful', async () => {
  const source = await readSource('../App.tsx');
  assert.match(source, /<nav className="catalogue-nav" aria-label=/);
  assert.match(source, /aria-expanded=\{catalogueOpen\}/);
  assert.match(source, /catalogue-search/);
  assert.match(source, /aria-current=\{tab === id \? 'page' : undefined\}/);
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


test('tab navigation uses a shared accessible contract with a legacy migration bridge', async () => {
  const tabs = await readSource('../AccessibleTabs.tsx');
  const bridge = await readSource('../LegacyTabAccessibility.tsx');
  const app = await readSource('../App.tsx');
  assert.match(tabs, /role="tablist"/);
  assert.match(tabs, /role="tab"/);
  assert.match(tabs, /aria-selected=\{selected\}/);
  assert.match(tabs, /aria-controls=/);
  assert.match(tabs, /ArrowRight/);
  assert.match(tabs, /ArrowLeft/);
  assert.match(tabs, /Home/);
  assert.match(tabs, /End/);
  assert.match(bridge, /\.subtabs/);
  assert.match(bridge, /data-legacy-tablist/);
  assert.match(app, /<LegacyTabAccessibility language=\{language\} \/>/);
});
