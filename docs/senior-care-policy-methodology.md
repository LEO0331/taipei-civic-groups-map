# Policy #10 methodology

The policy question is which published records should be clarified next under limited municipal administrative review capacity. The unit is a source row, not a unique physical facility, organization, resident, household, applicant or operating service.

## Reproducible method

`senior-community-care-evidence-review-v1`, schema 1. Fixed analysis date 2026-10-23 and source reference period 2026-08 are stored independently of acquisition times and page metadata updates. New source editions require a reviewed method/configuration update; do not relabel a rebuild as newly acquired evidence.

A tiers: primary identity/duplicate/programme-overlap/ambiguous-association questions → A; missing or ambiguous administrative/type/session documentation, rejected or absent cross-edition associations, or changed source types → B; remaining rows → C routine. B tiers use documentary identity and cross-source issues only; otherwise stable source-order baseline. There are no vulnerability weights, demand estimates or elderly-alone count inputs.

Evidence-first orders by tier then stable ID. Balanced review sorts represented district labels by deterministic Unicode order, then takes one candidate per district per round; within each district tier/ID precedence remains. It is administrative representation, not equity or care need. Capacities are 5, 10 or all eligible; actual use is bounded by eligible count. Empty populations are valid. Duplicate candidate IDs and source-edition mismatches reject scenario calculation.

Source scope: PDF-only removes E-related questions before tier assignment; accepted-association scope requires an accepted exact/normalized E relationship; broader review retains all documentary relationships. It never introduces E-only records as current PDF sites. Category subsets are conservative published-text classifications: learning-school text first, otherwise care-point text, otherwise other/unknown. Session bands are retained text classifications, never hours, capacity or appointments. Functional care-point records without a parsed session band remain an explicit documentation question. B has only verified within-edition village eligibility; authoritative geographic eligibility is unavailable.

Sensitivity compares capacity, issue scope, PDF/associated/broad source scope and published-text category subsets. For each comparison report population, represented districts and selected/shared/added/removed IDs. Identical selections are valid. Unsupported actual-capacity/accessibility/outcome and geographic comparisons remain unavailable.

## Findings and scenarios

A: 520 rows; B: 88 unique district/village rows, 88 eligible; E: 510 retained rows; F: 292 separate programme rows. A/E: 427 exact + 66 normalized accepted associations, 1 ambiguous, 9 rejected research associations and 17 PDF-only rows. E has 17 rows without an accepted association. No normalized A/B village-key overlaps. Source A broad-review tiers: A=1, B=61, C=458. These are documentation questions, not quality or care-need findings.

| Mode | Capacity | Eligible | Used | Evidence districts | Balanced districts | Shared IDs |
|---|---:|---:|---:|---:|---:|---:|
| A | 5 | 520 | 5 | 3 | 5 | 0 |
| A | 10 | 520 | 10 | 3 | 10 | 3 |
| A | all | 520 | 520 | 12 | 12 | 520 |
| B | 5 | 88 | 5 | 1 | 5 | 0 |
| B | 10 | 88 | 10 | 1 | 10 | 1 |
| B | all | 88 | 88 | 12 | 12 | 88 |


The content-addressed snapshot stores all twelve default baseline configurations with exact selected IDs. Runtime changes produce equally reproducible administrative briefings. Full IDs are source-bound and are not persistent real-world facility identifiers.

## Architecture and audit

Raw evidence → pinned Python table extraction + independent PDF controls → Node offline admission audit → conservative reconciliation → content-addressed immutable JSON → atomic current pointer → integrity-checked lazy React module. Exact-file SHA-256 is stored in the pointer rather than recursively embedded in the hashed file. Identical source bytes/configuration retain identical acquisition metadata and rebuild byte-for-byte. The browser checks SHA-256 before using a snapshot, makes local JSON requests only, and never parses PDFs.

Default fetch audits accepted retained originals offline. Explicit `--refresh` stages bounded downloads, validates official attachment membership/PDF/table shape and never promotes over accepted originals. A changed edition requires independent rendered review and new manifest/control hashes. Failed audits or writes leave the last published pointer intact. Existing CSV data and source dates remain unchanged.

## Exports and privacy

JSON/CSV Administrative Investigation Briefings bind policy ID, analysis/reference dates, candidate grain, method/schema, exact snapshot SHA, source manifests, complete scenario settings, selected IDs/reasons, exclusions, assumptions and limitations. Empty selections retain the same lineage. CSV quotes every cell, escapes quotes and guards formula-prefixed cells including leading whitespace/control characters. Raw addresses/phones, individual/household information and village elderly-alone counts are excluded from public snapshots and briefings; retained relationship IDs are hashed.

Original B includes the restricted-purpose aggregate column, preserved in its official PDF under data/raw only. It is excluded from the public selection method and ordinary exports, and is not unmet demand. Any future demographic use requires a separate privacy/denominator review. No third-party geocoding or resident map is implemented.

Mode C is unavailable: current operation, real hours, staffing/capacity, attendance/utilization/waitlists, travel/barriers, compatible population denominators, inter-village usage and welfare outcomes require separate evidence. Missing values are unknown, not zeros. No new-site, subsidy or individual eligibility recommendation follows from these scenarios.

## Source hashes

- A: `26a56351439c42d92a386bb02ad561fffe462b9c0f001776087c28223bc0bcf2`
- B: `c66d04fd36a5f4293e86769a5a1c02b02f746f73b6581b8e1357524fe019e3a7`
- C: `2e598f8d48b46a9b832dd3a661f900badb33f0ef79cc84ada48893af369b5336`
- E: `db5873afbb0e5edd376f90ebb02fca975e0844cf786e09407d022be03567772f`

## Existing explorer Data Trust boundary

`public/policy/senior-care-policy/current.json` points to the independent multi-edition policy snapshot. It is deliberately outside the historical `public/data` directory universe, so the existing 117-directory manifests, provenance registry, date contracts and dated freshness audit remain intact. The policy view renders its own source editions, integrity status, error/retry and secondary audit details instead of presenting one directory-wide source date for unrelated editions. Existing explorer Data Trust components and metadata are unchanged. Git attributes preserve exact acquired bytes and snapshot bytes across Windows/Linux checkouts.

Source E is the retained repository Git-text edition: its CSV SHA/byte size use explicit LF normalization so Windows CRLF checkouts and Linux LF checkouts identify the same stored edition. This is not claimed as an original HTTP payload hash. Source A/B/C acquired originals remain exact bytes with no normalization. The E generated-record JSON has its own exact-byte hash.
