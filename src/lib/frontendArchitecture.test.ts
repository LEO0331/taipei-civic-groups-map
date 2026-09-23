import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import test from 'node:test';

test('dataset modules are route-level lazy imports', async () => {
  const app = await readFile('src/App.tsx', 'utf8');
  assert.doesNotMatch(app, /^import \w+Module from ['\"]\.\/[^'\"]+Module['\"];$/m);
  const lazyModules = app.match(/const \w+Module = lazy\(\(\) => import\(/g) ?? [];
  assert.ok(lazyModules.length > 100, 'expected broad route-level code splitting, found ' + lazyModules.length + ' lazy modules');
  assert.match(app, /LEGACY_DATA_TABS/);
  assert.match(app, /loadedDataGroups/);
});

test('entry navigation defers mapping runtime until a map surface opens', async () => {
  const app = await readFile('src/App.tsx', 'utf8');
  assert.doesNotMatch(app, /from ['"]react-leaflet['"]/);
  assert.match(app, /const CivicMap = lazy\(\(\) => import\('\.\/CivicMap'\)\)/);
  assert.match(app, /const DistrictComparison = lazy\(\(\) => import\('\.\/DistrictComparison'\)\)/);
});

test('application source stays under TypeScript checking', async () => {
  const entries = await readdir('src', { recursive: true });
  const sourceFiles = entries.filter((entry) => /\.tsx?$/.test(entry));
  const suppression = ['@ts', 'nocheck'].join('-');

  for (const sourceFile of sourceFiles) {
    const source = await readFile(`src/${sourceFile}`, 'utf8');
    assert.doesNotMatch(source, new RegExp(suppression), `${sourceFile} disables TypeScript checking`);
  }
});

test('physical-therapy component styles do not override generic global utility classes', async () => {
  const css = await readFile('src/styles.css', 'utf8');
  const forbidden = [
    /\.pt-source span,\.eyebrow\s*\{/ ,
    /\.ghost-button,\.outline-button,\.text-button,\.copy-button,\.icon-button,\.row-detail\s*\{/ ,
    /(^|\n)\.muted,\.empty\s*\{/ ,
    /\.pt-source a,\.map-link,\.tel-link\s*\{/ ,
  ];
  for (const pattern of forbidden) assert.doesNotMatch(css, pattern);
  assert.match(css, /\.physical-therapy-module \.eyebrow/);
  assert.match(css, /\.physical-therapy-module \.text-button/);
});
