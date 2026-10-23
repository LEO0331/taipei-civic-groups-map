# Policy #10 identity contract

Version: senior-community-care-evidence-review-v1. Analysis date: 2026-10-23; documentary reference period: 2026-08.

A candidate is one published Source A row. Its ID binds the full original PDF SHA-256, zero-padded serial, canonical row SHA-256 and occurrence suffix. Page is a locator, not an identity. Equal names, operators or venues never automatically collapse rows. Raw row hashes include source serial/district/village/name/type/address in a fixed array; phone data is deliberately omitted. Two identical rows still receive distinct suffixes. Duplicate serials trigger Tier A documentary review.

B candidates are published village rows. IDs bind the original B hash, serial, row hash and occurrence. The within-edition key is normalized district + `/` + village. Accepted district labels are Taipei's twelve source-labelled districts. Blank village/district, duplicate keys or an unverified extraction exclude a B row. No government village code, actual-site/operator identity, geographic position or cross-edition government identity is invented.

Formatting normalization uses NFKC, whitespace removal, 台→臺, recognized parentheses and independently reviewed B69 ㇐→一. The published text remains separate. This is formatting research, not certification of a current village registry. Village identity comes only from the explicit published village column, never organization names or inferred address geography.

A/E associations require exact name + address + district, or an unambiguous normalized match on all three. Both editions must be one-to-one. Same-name or same-address candidates that fail the full key are rejected or ambiguous research relationships, not accepted facility identity. Published type differences remain separate edition-review questions. Rejected/ambiguous relationship hashes retain evidence without exposing addresses. A-only/E-only rows do not prove openings or closures. F and other programmes are never pooled into this population.

A: 520 rows; B: 88 unique district/village rows, 88 eligible; E: 510 retained rows; F: 292 separate programme rows. A/E: 427 exact + 66 normalized accepted associations, 1 ambiguous, 9 rejected research associations and 17 PDF-only rows. E has 17 rows without an accepted association. No normalized A/B village-key overlaps. Source A broad-review tiers: A=1, B=61, C=458. These are documentation questions, not quality or care-need findings.

No complete compatible administrative registry has been admitted, so no citywide coverage percentage, polygons, government codes or inter-edition authoritative village claims are available. Source A/B labels are compatible for a bounded same-period documentary-key comparison only. The legal plan allows category exceptions; overlaps, if found, require follow-up rather than automatic contradiction or eligibility conclusions.

Source E is the retained repository Git-text edition: its CSV SHA/byte size use explicit LF normalization so Windows CRLF checkouts and Linux LF checkouts identify the same stored edition. This is not claimed as an original HTTP payload hash. Source A/B/C acquired originals remain exact bytes with no normalization. The E generated-record JSON has its own exact-byte hash.
