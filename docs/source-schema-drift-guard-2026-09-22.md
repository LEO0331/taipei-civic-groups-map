# Batch 29 — source schema drift guard — 2026-09-22

## Purpose

GitHub Pages intentionally refreshes upstream public data before conversion. Batch 29 adds a release boundary between those two steps so a changed CSV column shape cannot silently flow into conversion as though it were the reviewed source contract.

This is a source-structure guard only. It does not decide whether data is current, stale, correct, complete, or semantically equivalent, and it does not invent or normalize source values.

## Contract

The release workflow now performs:

1. \`npm run data:schema:capture\`
2. \`npm run data:fetch\`
3. \`npm run data:schema:check\`
4. \`npm run data:convert\`

The capture step reads the checked-in \`data/raw/**/*.csv\` state before any remote fetch. At the Batch 29 branch point this covers **203 CSV files across 144 raw-data directories**.

For each raw-data directory the baseline records:

- every checked-in CSV path and its ordered header list;
- the unique header signatures already reviewed in that directory.

After fetch, the checker applies two levels of matching:

- if the same CSV path still exists, its ordered headers must match that file's captured headers;
- if a rolling/new filename appears inside an existing dataset directory, its ordered headers must match one of that directory's captured header signatures.

A new CSV dataset directory with no checked-in baseline, a raw-data directory that loses all CSVs, or a fetched CSV with a new header signature blocks conversion.

Outer header whitespace and a UTF BOM are ignored. Added, removed, renamed, or reordered columns are treated as drift.

## Multi-resource and rolling datasets

The guard deliberately does not impose one universal schema across Taipei datasets.

Multi-resource directories may retain multiple known header signatures. Stable filenames keep their exact file-level contract, while rolling filenames such as monthly snapshots may reuse any already reviewed signature within that dataset directory.

This preserves stricter checking for fixed resources without requiring hundreds of hand-maintained schema declarations.

## Evidence

Successful checks write:

\`public/data/source-schema-report.json\`

The Pages release evidence artifact includes this report alongside Data Trust and conversion evidence.

If drift is detected, the checker writes the failed report before exiting non-zero. The workflow then uploads it as a short-lived \`source-schema-drift\` failure artifact when available.

## Local use

Do not run the bulk fetch merely to exercise this guard.

For an intentional source refresh:

\`\`\`bash
npm run data:schema:capture
npm run data:fetch:<dataset>
npm run data:schema:check
npm run data:convert:<dataset>
\`\`\`

The capture must happen before the focused fetch so the comparison is against the reviewed checked-in snapshot.

## Limits

- The guard checks CSV header structure, not field meaning or value distributions.
- Non-CSV upstream formats are outside Batch 29.
- A source can change semantics while retaining the same column names; converter validation and human source review remain necessary.
- An intentional schema migration requires updating the converter/tests and committing a reviewed raw snapshot so the new structure becomes the next release baseline.
