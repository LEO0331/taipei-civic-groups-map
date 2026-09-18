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

test('the data-trust disclosure stays semantic while keeping detail secondary', async () => {
  const source = await readSource('../DataTrustPanel.tsx');
  const app = await readSource('../App.tsx');
  assert.match(source, /<aside className="data-trust" data-attention=\{attention\} aria-label=/);
  assert.match(source, /className="data-trust-primary" role="status" aria-live="polite"/);
  assert.match(source, /<details className="data-trust-details">/);
  assert.match(source, /<summary>\{zh \? '詳細資訊' : 'Details'\}<\/summary>/);
  assert.match(source, /attentionLevel/);
  assert.match(app, /activeDatasetLabel=\{activeDatasetLabel\}/);
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


test('dataset pages expose a stable active UI family and shared family frame contract', async () => {
  const app = await readSource('../App.tsx');
  const frame = await readSource('../DatasetFamilyFrame.tsx');
  const families = await readSource('./datasetUiFamily.ts');
  assert.match(app, /data-active-ui-family=\{uiFamilyForDataset\(tab\)\}/);
  assert.match(frame, /data-ui-family=\{family\}/);
  assert.match(frame, /dataset-family-heading/);
  assert.match(families, /healthcareRichDirectory/);
  assert.match(families, /recordsAnalysis/);
  assert.match(families, /statisticsAnalysis/);
});
