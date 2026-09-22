import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const packageJson = JSON.parse(await readFile('package.json', 'utf8'));
const packageLock = JSON.parse(await readFile('package-lock.json', 'utf8'));
const frontendWorkflow = await readFile('.github/workflows/frontend-ci.yml', 'utf8');
const deployWorkflow = await readFile('.github/workflows/deploy.yml', 'utf8');

test('pins Playwright npm and CI renderer to the same exact version', () => {
  assert.equal(packageJson.devDependencies['@playwright/test'], '1.62.1');
  assert.equal(packageLock.packages['node_modules/@playwright/test'].version, '1.62.1');

  for (const workflow of [frontendWorkflow, deployWorkflow]) {
    assert.match(workflow, /mcr\.microsoft\.com\/playwright:v1\.62\.1-noble/);
  }
});

test('keeps Node type definitions on the Node 22 runtime line', () => {
  assert.equal(packageJson.devDependencies['@types/node'], '^22.20.4');
  assert.equal(packageLock.packages['node_modules/@types/node'].version, '22.20.4');

  for (const workflow of [frontendWorkflow, deployWorkflow]) {
    assert.match(workflow, /node-version:\s*22/);
  }
});

test('locks the reviewed type-only maintenance versions', () => {
  assert.equal(packageLock.packages['node_modules/@types/leaflet'].version, '1.9.22');
  assert.equal(packageLock.packages['node_modules/@types/react'].version, '19.3.0');
  assert.equal(packageLock.packages['node_modules/@types/react-dom'].version, '19.3.0');
});
