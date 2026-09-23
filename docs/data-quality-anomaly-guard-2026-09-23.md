# Batch 37 — Semantic data-quality anomaly guard — 2026-09-23

## Objective

Add a conservative release-time semantic/data-quality guard that catches obviously suspicious source-content outcomes which can pass the existing header/schema boundary.

This batch does **not** replace Batch 29 schema validation or Batch 30 release data-change evidence. It adds one additional gate before conversion.

## Repository baseline

Batch 37 branches from:

`main@93c6ef4707e181177325efd156c2f65ba20ccdf6`

That baseline already includes:

- Batch 29 source-schema drift guard;
- Batch 30 release data-change summary;
- Batch 38 optimized CI / Pages fan-out;
- Batch 39 dependency/toolchain audit.

## Guard design

The new command is:

`npm run data:quality:check`

It reuses the exact pre-fetch release baseline captured by:

`npm run data:release:capture`

and compares it with the freshly fetched `data/raw` state before conversion.

The generated report is:

`public/data/data-quality-anomaly-report.json`

### Hard release blockers

The first bounded guard blocks only conditions with a strong, source-agnostic interpretation:

1. a previously countable raw-data directory disappears;
2. a previously countable stable source file can no longer be parsed for row-count validation;
3. a previously countable dataset has no current countable source file;
4. a dataset that previously contained records becomes empty.

These conditions stop conversion.

### Observational warnings

Large row-count changes are intentionally non-blocking:

- collapse warning: current rows are **50% or less** of the reviewed baseline;
- spike warning: current rows are **200% or more** of the reviewed baseline;
- proportional warnings apply only when the reviewed baseline has at least **20 rows**.

A warning is evidence for review, not proof that the upstream data is wrong.

## Deliberate non-rules

Batch 37 does not create unsafe universal assumptions for:

- stable ID uniqueness;
- mandatory fields;
- null-rate ceilings;
- coordinate systems/ranges;
- domain-specific value constraints.

Those checks require explicit dataset-aware contracts. They can be added later where the source semantics and converter expectations justify them.

The guard also does not treat ordinary source content change as failure; Batch 30 remains observational for normal changed bytes/rows.

## Pages release order

The serialized release boundary is now:

`schema capture → release capture → fetch → schema check → release data-change comparison → data-quality anomaly guard → conversion`

Batch 38 then snapshots the exact post-conversion workspace and fans out:

- release build / typecheck / unit tests / performance budget;
- desktop Playwright;
- mobile Playwright.

Deployment still waits for all three downstream gates.

## Evidence retention

If the semantic guard blocks release, Pages uploads:

`data-quality-anomaly`

containing the anomaly report when available.

On a successful release, `data-quality-anomaly-report.json` is included in the existing `data-release-evidence` artifact alongside schema, data-change, conversion, and Data Trust evidence.

## Tests

Focused unit coverage includes:

- stable row counts;
- unexpectedly empty data;
- newly unreadable stable source files;
- missing previously countable datasets;
- severe collapse warning;
- severe spike warning;
- suppression of proportional warnings for small datasets;
- rolling filenames that remain countable.

## Scope boundaries

Batch 37 changes no:

- source records;
- fetch URLs;
- converters;
- source dates;
- product/UX behavior;
- visual baselines;
- Node/Playwright contracts;
- performance budgets;
- dependency versions.

## Verification status

PR #54 Frontend CI run `35804423617` passed on implementation head `6eacd6623d22223389cda7fa50ebf8ee77fc4403`:

- typecheck passed;
- **173/173 unit tests** passed, including the eight Batch 37 focused cases;
- production build passed;
- production entry remained **399.63 kB raw / 115.86 kB independent gzip** within the 450/130 kB budget;
- desktop Playwright passed **76/76** in 3.4m;
- mobile Playwright passed **77/77** in 5.0m.

The final documentation/evidence head must repeat optimized Frontend CI before merge.

After merge, Pages must still pass the live pre-fetch/fetch/schema/data-change/anomaly/conversion boundary and all Batch 38 downstream verification jobs, and the release evidence artifact must contain `data-quality-anomaly-report.json`.

