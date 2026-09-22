# Batch 30 — release data-change summary — 2026-09-22

## Purpose

Batch 29 prevents an unreviewed CSV header shape from reaching conversion. Batch 30 answers a different operational question for successful releases:

> What source data actually changed during this deployment?

The new summary is observational. A content change is not automatically good, bad, fresh, stale, or semantically meaningful, and Batch 30 does not approve or reject a refresh. The existing schema guard remains the structural release gate.

## Release contract

Pages now performs the relevant data steps in this order:

1. \`npm run data:schema:capture\`
2. \`npm run data:release:capture\`
3. \`npm run data:fetch\`
4. \`npm run data:schema:check\`
5. \`npm run data:release:changes\`
6. \`npm run data:convert\`

At the Batch 30 branch point, the raw baseline contains **204 source files across 144 raw-data directories**: **203 CSV files and one JSON source file**. \`fetch-metadata.json\` is not treated as source content.

## What is compared

For each raw source file the pre-fetch baseline records:

- relative path;
- SHA-256;
- byte size;
- source row count where it can be measured conservatively.

CSV row counts are logical records after the header, so a quoted newline inside one field does not create a false extra row. JSON row counts are reported only when the source is a top-level array. Unsupported or unparseable formats still receive hash and byte comparison but leave row count unknown.

After fetch, the same state is measured again. The generated report distinguishes:

- changed files;
- added files;
- removed files;
- unchanged raw-data directories;
- content-changed directories;
- source timestamp changes.

A rolling source can therefore show an old monthly file removed and a new monthly file added even when the dataset-level schema remains valid.

## Source timestamps

Batch 30 intentionally ignores fetch-execution timestamps such as \`downloadedAt\` / \`fetchedAt\`, and it ignores metadata-page edit timestamps.

Only these explicitly named fields are treated as authoritative source timestamps when they appear in raw fetch metadata:

- \`csvUpdateDate\`
- \`sourceFileUpdatedAt\`
- \`sourceUpdatedAt\`

Nested resource entries are supported. When several authoritative resource timestamps are present, the report records all of them and uses the **oldest included timestamp** as the effective dataset timestamp, matching the existing conservative multi-resource freshness contract.

No missing timestamp is inferred.

## Evidence

The comparison writes:

\`public/data/data-change-summary.json\`

The Pages \`data-release-evidence\` artifact now includes this file alongside:

- Data Trust manifest;
- Data Trust release summary;
- conversion report;
- source-schema report.

The summary itself does not block a release simply because data changed. Structural incompatibility is still handled by Batch 29 before conversion.

## Local use

Do not run the bulk fetch just to generate a summary. For an intentional focused refresh:

\`\`\`bash
npm run data:schema:capture
npm run data:release:capture
npm run data:fetch:<dataset>
npm run data:schema:check
npm run data:release:changes
npm run data:convert:<dataset>
\`\`\`

Capture steps must run before the fetch.

## Limits

- Hash equality proves byte equality, not semantic correctness.
- Row-count changes do not prove that records were added or removed semantically; source ordering, duplicates, and source formatting can also change.
- The summary does not compare derived UI outputs or make freshness claims.
- A source can retain identical bytes while an external source page changes metadata; Batch 30 reports only the explicit timestamp fields available in the raw fetch metadata.
