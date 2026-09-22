# Dependency maintenance — 2026-09-22

Batch 27 performs a conservative dependency audit and low-risk maintenance pass. It intentionally avoids bundling major runtime/toolchain migrations into routine maintenance.

## Applied changes

| Package | Before | After | Rationale |
| --- | --- | --- | --- |
| `@types/leaflet` | declared `^1.9.18`, locked `1.9.21` | declared `^1.9.22`, locked `1.9.22` | Type-only patch update |
| `@types/react` | declared `^19.1.0`, locked `19.2.17` | declared `^19.3.0`, locked `19.3.0` | Type-only update on current React major |
| `@types/react-dom` | declared `^19.1.0`, locked `19.2.3` | declared `^19.3.0`, locked `19.3.0` | Type-only update paired with React types |
| `@types/node` | declared `^24.0.0`, locked `24.13.2` | declared `^22.20.4`, locked `22.20.4` | Align type surface with the Node 22 CI/release runtime |
| `undici-types` | `7.18.2` | `6.21.0` | Transitive version required by Node 22 type definitions |
| `@playwright/test` declaration | `^1.62.1` | **`1.62.1` exact** | Prevent lockfile regeneration from drifting away from the committed screenshot renderer |

The installed Playwright packages remain `1.62.1`; this batch does not change Chromium rendering or regenerate snapshots.

## Audited current lock baseline

The branch starts from the following resolved versions:

- React: `19.2.7`
- React DOM: `19.2.7`
- React Leaflet: `5.0.0`
- Leaflet: `1.9.4`
- Vite: `6.4.3`
- `@vitejs/plugin-react`: `4.7.0`
- TypeScript: `5.8.3`
- `tsx`: `4.22.4`
- Playwright: `1.62.1`

Existing semver ranges had already resolved several packages above the minimum versions written in `package.json`; Batch 27 does not rewrite those runtime declarations simply to mirror the lockfile.

## Deferred upgrades

The following available upgrades are intentionally **not** included:

- React / React DOM `19.3.0`: runtime update, published very recently; review separately from type-only maintenance.
- Vite `8.x`: major build-system migration.
- `@vitejs/plugin-react` `6.x`: major plugin migration that should be evaluated with the Vite migration.
- TypeScript `7.x`: major compiler migration.
- `tsx` newer `4.x`: tool-runtime update with transitive esbuild movement; defer until there is a concrete maintenance reason.
- Playwright newer than `1.62.1`: renderer migration requiring all 12 committed screenshots to be reviewed in the new official image before baseline regeneration.

## Enforced contract

`src/lib/dependencyContract.test.ts` verifies:

1. `@playwright/test` is exactly `1.62.1`;
2. both GitHub workflows use `mcr.microsoft.com/playwright:v1.62.1-noble`;
3. `@types/node` is on the Node 22 line and both workflows run Node 22;
4. the reviewed type package versions are present in the lockfile.

This makes the visual-renderer and runtime/type alignment executable repository policy rather than documentation only.

## Validation boundary

Batch 27 changes dependency metadata/types only. It does not change application source, dataset records, lazy-loading boundaries, UI behavior, visual thresholds, or public-data semantics.

Completion requires the ordinary pull-request verification:

- `npm ci`
- typecheck
- unit tests, including the dependency contract
- production build
- 450 / 130 kB performance budget
- full desktop/mobile Playwright and visual regression
