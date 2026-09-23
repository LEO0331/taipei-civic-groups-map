# Batch 39 — Dependency / toolchain audit — 2026-09-23

## Objective

Inventory the current runtime, production dependencies, test stack, and build toolchain; classify available upgrades by risk; apply only low-risk maintenance; and define the migration order for everything else.

This batch does **not** combine major migrations.

## Repository baseline

Batch 39 branches from:

`main@cb191332463d6aaafefb563d44326174e9342db2`

The dependency baseline comes from the checked-in `package.json` and `package-lock.json`, not from semver ranges alone.

## Inventory

| Area | Declared | Locked / workflow | Upstream observed 2026-09-23 | Classification | Batch 39 action |
| --- | --- | --- | --- | --- | --- |
| Node runtime | workflow `22` | Node 22 line | Node 22.23.2 LTS; Node 24 LTS also available | runtime-major available | keep Node 22; separate migration |
| React | `^19.1.0` | 19.2.7 | 19.3.0 | production minor | defer to dedicated React runtime PR |
| React DOM | `^19.1.0` | 19.2.7 | 19.3.0 | production minor | defer with React |
| Leaflet | `^1.9.4` | 1.9.4 | 1.9.4 stable | current | no change |
| React Leaflet | `^5.0.0` | 5.0.0 | 5.0.0 stable | current | no change |
| Playwright Test | exact `1.62.1` | 1.62.1 | 1.63.0 | renderer-sensitive minor | separate renderer migration |
| `@types/leaflet` | `^1.9.22` | 1.9.22 | 1.9.22 | current | no change |
| `@types/node` | `^22.20.4` | 22.20.4 | 22.20.4 on Node-22 line | current contract | no change |
| `@types/react` | `^19.3.0` | 19.3.0 | 19.3.0 | current | no change |
| `@types/react-dom` | `^19.3.0` | 19.3.0 | 19.3.0 | current | no change |
| Vite React plugin | `^4.5.0` | 4.7.0 | 4.7.0 latest v4; 6.1.1 latest overall | major available | defer with build-tool migration |
| `tsx` | `^4.20.0` | 4.22.4 | 4.23.15 | dev-only minor | **upgrade now** |
| TypeScript | `~5.8.3` | 5.8.3 | 5.9.3 latest v5; 7.0.2 latest overall | compiler minor + major available | separate compiler migration |
| Vite | `^6.3.5` | 6.4.3 | 6.4.3 latest v6; 8.3.0 latest overall | build-tool major available | separate build-tool migration |

There is no separate browser-testing library beyond Playwright. Unit tests use Node's built-in test runner through `tsx --test`.

## Upstream evidence

Authoritative/public references checked for this audit:

- Node release status and maintained lines: https://nodejs.org/en/about/previous-releases
- Node current downloads: https://nodejs.org/en/download/current
- React: https://www.npmjs.com/package/react
- React DOM: https://www.npmjs.com/package/react-dom
- Leaflet: https://www.npmjs.com/package/leaflet
- React Leaflet: https://www.npmjs.com/package/react-leaflet
- Playwright Test: https://www.npmjs.com/package/@playwright/test
- TypeScript: https://www.npmjs.com/package/typescript
- Vite: https://www.npmjs.com/package/vite
- Vite React plugin: https://www.npmjs.com/package/@vitejs/plugin-react
- tsx: https://www.npmjs.com/package/tsx
- React / Node / Leaflet type packages: their matching npm package pages.

## Low-risk maintenance applied

### `tsx` 4.22.4 → 4.23.15

This is the only dependency update in Batch 39.

Reasons:

- development/tooling dependency only;
- stays on major 4;
- Node requirement remains `>=18`, compatible with project Node 22;
- dependency contract remains `esbuild ~0.28.0`;
- the repository already locks esbuild 0.28.1;
- the 4.23 line contains bug fixes and startup/runtime performance improvements rather than a new production runtime contract.

Changes:

- `package.json`: `tsx` minimum range moves to `^4.23.15`;
- `package-lock.json`: lock resolution moves to exact 4.23.15;
- no production dependency changes.

## Deferred migration queue

### 1. React 19.3 runtime migration

Scope:

- React 19.2.7 → 19.3.0;
- React DOM 19.2.7 → 19.3.0;
- keep matching React types;
- run full typecheck/unit/build/performance/E2E;
- inspect all 12 visual baselines;
- compare entry and deferred map bundle sizes.

Reason for separation:

React is production runtime behavior. Even though 19.3 is a semver minor, it should not be hidden inside a broad toolchain audit.

### 2. TypeScript 5.9 compiler migration

Scope:

- TypeScript 5.8.3 → 5.9.3 first;
- resolve any new diagnostics/config behavior;
- full CI.

Do **not** jump directly from 5.8 to TypeScript 7 in the same change.

### 3. Playwright 1.63 renderer migration

Scope:

- update `@playwright/test` and the Playwright container together;
- preserve exact version equality;
- run full desktop/mobile E2E;
- inspect the 12 visual baselines before accepting any regenerated images;
- keep `maxDiffPixelRatio: 0.0005`.

This is renderer-sensitive and remains intentionally separate.

### 4. Vite / plugin-react build-tool migration

Current same-major state is already at the latest observed compatible line:

- Vite 6.4.3;
- `@vitejs/plugin-react` 4.7.0.

A future migration should treat Vite 8 and the compatible plugin-react major as one bounded build-tool subsystem change. It must inspect:

- build output;
- chunk topology;
- entry raw/gzip size;
- deferred map chunk;
- dev-server behavior used by Playwright;
- full CI and visuals.

Do not mix this migration with React, TypeScript, or Playwright renderer changes.

### 5. Node 22 → Node 24 LTS

Node 22 remains an LTS line and is not EOL, so there is no need to force a runtime-major migration in Batch 39.

A future Node 24 migration should update:

- CI Node runtime;
- Pages Node runtime;
- `@types/node` major line;
- dependency-contract tests;
- local documentation.

Run it independently from Vite/TypeScript major migrations so runtime regressions remain attributable.

### 6. TypeScript 7

Only after the TypeScript 5.9 migration is stable.

TypeScript 7 is a compiler-major migration and must be isolated.

## Explicit non-actions

Batch 39 does not:

- run `npm audit fix --force`;
- upgrade Playwright independently from its container;
- update visual baselines;
- upgrade Node major;
- upgrade React runtime;
- upgrade Vite major;
- upgrade TypeScript compiler;
- mix production and build-tool migrations;
- change source data, product behavior, or UX.

## Verification contract

Before merge, Batch 39 must pass the existing optimized Frontend CI:

- `npm ci`;
- typecheck;
- unit tests;
- production build;
- 450 / 130 kB performance budget;
- full desktop E2E;
- full mobile E2E;
- all 12 visual baselines.

The dependency audit implementation head is green.

## Verification evidence

PR #53 Frontend CI run `35802278329` on head `49d5dfccf9e3735537e95e98a88c48b0f3b6f4c5` passed:

- `npm ci`;
- typecheck;
- unit tests;
- production build;
- performance budget;
- desktop Playwright: **76 passed**;
- mobile Playwright: **77 passed**;
- production entry: **399.63 kB raw / 116.04 kB Vite-reported gzip**.

The final documentation-only head must repeat the existing optimized CI before merge; no further dependency changes are planned in Batch 39.
