# Policy #10 delivery evidence

Prepared 2026-10-24 (Asia/Taipei). Analysis date 2026-10-23; source reference period August 2026.

- Repository: LEO0331/taipei-civic-groups-map.
- Branch: `codex/senior-community-care-policy-10`.
- Verified base: `e3a96dfc50c90b3e772fb4e0d20f14ab0e3a697a` (origin/main fetched before implementation and again on resume).
- PR: pending creation; target `main`. Human review only; no automatic merge or Pages deployment.

## Official sources and accepted findings

[A: official care-site page](https://dosw.gov.taipei/News_Content.aspx?n=222C9779823FA161&s=0CE286F6AA2F930F&sms=E2A8B6B533500CB0), [B: programme/unbuilt-village attachments](https://dosw.gov.taipei/News_Content.aspx?n=63FBD779B8854D69&s=207B5C83CE31EEAE), [C: effective implementation plan](https://laws.gov.taipei/Law/LawSearch/LawArticleContent/FL078396).

A: 520 rows / 14 PDF pages. B: 88 rows / 2 pages, all 88 eligible for bounded administrative follow-up. Both visible document headers say 115.08. A/B page metadata updates are 2026-09-10, kept distinct from document preparation. Current attachment labels/encoded filenames agree with 115.08; the previously reported 115.04 mismatch was not observed. The PDF's legacy internal XLSX title is not used as edition proof. C is revised 2025-12-17, effective 2026-01-01; programme exceptions remain explicit context rather than an eligibility engine.

Original-byte A/B/C SHA-256 values; E identifies the separate retained Git LF CSV edition (not original HTTP bytes):

- A: `26a56351439c42d92a386bb02ad561fffe462b9c0f001776087c28223bc0bcf2`
- B: `c66d04fd36a5f4293e86769a5a1c02b02f746f73b6581b8e1357524fe019e3a7`
- C: `2e598f8d48b46a9b832dd3a661f900badb33f0ef79cc84ada48893af369b5336`
- E: `db5873afbb0e5edd376f90ebb02fca975e0844cf786e09407d022be03567772f`

Original PDFs and official-page HTML are retained under `data/raw/senior-care-policy`. Hash-bound independent controls verify A page endpoints/transitions/multiline cells, B all village rows and district transitions, B47–58 cross-page 內湖區 merged cell and B69 ㇐德里. Git attributes prevent checkout newline conversion from changing accepted bytes. Eleven pinned Python parser tests validate malformed files/layouts/identities and real source controls.

A/E reconciliation: 427 exact + 66 normalized accepted research associations (493 total), 1 ambiguous, 9 rejected, 17 PDF-only; 17 E rows lack an accepted association. A has 368 distinct published district/village keys; B has 88. There are 0 A/B normalized village-key overlaps, 0 missing district/village cells and 0 duplicate serials in the admitted documents. The one ambiguous A record is #114. These are source relationships, not facility opening/closure findings. Existing E (510 rows) and F (292 rows) remain byte-for-byte unchanged and separate.

Mode A broader-review tiers: A=1, B=61, C=458. PDF-only scope removes cross-edition E questions before tiering. Text-category subsets, source scopes and exact sensitivity ID changes are recorded in [performance/sensitivity evidence](senior-care-policy-performance.json); machine-readable baseline selections are in [results](senior-care-policy-results.json).

## Actual capacity and strategy results

Both strategies use the same eligible population in each row. No demographic or care-need weight is used.

| Mode | Capacity | Eligible / used | Evidence districts | Balanced districts | Shared IDs |
|---|---:|---:|---:|---:|---:|
| A | 5 | 520 / 5 | 3 | 5 | 0 |
| A | 10 | 520 / 10 | 3 | 10 | 3 |
| A | all | 520 / 520 | 12 | 12 | 520 |
| B | 5 | 88 / 5 | 1 | 5 | 0 |
| B | 10 | 88 / 10 | 1 | 10 | 1 |
| B | all | 88 / 88 | 12 | 12 | 88 |



### Mode A: default evidence-first five

- A #114, p.4, 大安區/新龍里, 臺北市大安區大安新龍社區發展協會 — ambiguous-association. ID: `A:26a56351439c42d92a386bb02ad561fffe462b9c0f001776087c28223bc0bcf2:0114:a382ed6d906c5c313e3bfcb4bc359db10a17ea7b4c837087184399e37e46d2fb:1`
- A #1, p.1, 士林區/三玉里, 士林老人服務中心(財團法人台北市中國基督教靈糧世界佈道會士林靈糧堂) — session-band-unknown. ID: `A:26a56351439c42d92a386bb02ad561fffe462b9c0f001776087c28223bc0bcf2:0001:93d6c283a994775d7332a327149b50dd82ddf03c0a4c4f4386de11803bda6a27:1`
- A #59, p.2, 大同區/保安里, 社團法人中華無齡酷活協會 — type-edition-discrepancy. ID: `A:26a56351439c42d92a386bb02ad561fffe462b9c0f001776087c28223bc0bcf2:0059:a003356dfe0a02d1e43a6dfe2fa334f0cf62e80fc5842caa8e45c3cc30a93180:1`
- A #60, p.2, 大同區/南芳里, 社團法人中華國際照顧發展協會 — type-edition-discrepancy. ID: `A:26a56351439c42d92a386bb02ad561fffe462b9c0f001776087c28223bc0bcf2:0060:c48ef6c5ca6a0d8102e6d531ed75abc8629162f4c964eaa159c1e6f7d3bb5433:1`
- A #66, p.2, 大同區/重慶里, 大同老人服務暨日間照顧中心 — session-band-unknown. ID: `A:26a56351439c42d92a386bb02ad561fffe462b9c0f001776087c28223bc0bcf2:0066:c3c0cad58a6b5d482bf48262b13020204b2c3a3e8036c577699cdeebb96d6568:1`

### Mode B: default evidence-first five

- B #1, p.1, 士林區/福安里, 福安里 — source-order-baseline. ID: `B:c66d04fd36a5f4293e86769a5a1c02b02f746f73b6581b8e1357524fe019e3a7:0001:54e6eeb5ea7c9c2081182d81f6e9cc468919a972592b3fa6b85bc10b2e9a7c87:1`
- B #2, p.1, 士林區/德華里, 德華里 — source-order-baseline. ID: `B:c66d04fd36a5f4293e86769a5a1c02b02f746f73b6581b8e1357524fe019e3a7:0002:8b1baca7f1aaeb0c5e02a59359595f0ffc8a2766b1abae6c2a374594814b3f2e:1`
- B #3, p.1, 士林區/社子里, 社子里 — source-order-baseline. ID: `B:c66d04fd36a5f4293e86769a5a1c02b02f746f73b6581b8e1357524fe019e3a7:0003:3adbd77d18421da522e6a7d1dfab02dd9ed42fe20472aa5bacf808da454d3d6e:1`
- B #4, p.1, 士林區/蘭雅里, 蘭雅里 — source-order-baseline. ID: `B:c66d04fd36a5f4293e86769a5a1c02b02f746f73b6581b8e1357524fe019e3a7:0004:b8fb2a9431ca506fcb24cfb6f46af9ae64ba18203d88f3efa708d4b08e352f71:1`
- B #5, p.1, 士林區/天和里, 天和里 — source-order-baseline. ID: `B:c66d04fd36a5f4293e86769a5a1c02b02f746f73b6581b8e1357524fe019e3a7:0005:336024b3b87346ad440c8b71c2b73598baa34141152c87e8d08f140e91b02103:1`


Full selected IDs for all twelve baseline configurations are embedded in the immutable snapshot and results JSON. Same-selection all-capacity outcomes are reported honestly. B evidence-first ties use stable source order; balanced review provides administrative district representation, not an equity outcome. Unavailable comparisons include authoritative geographic eligibility, actual care capacity, measured accessibility and welfare outcomes.

## Snapshot and architecture

- Snapshot ID: `senior-care-f3dabc24478b89c72dc25a4e7154fb8efed4669d9e07809dcff72c1d7a4e502c`.
- Exact-file SHA-256: `f3dabc24478b89c72dc25a4e7154fb8efed4669d9e07809dcff72c1d7a4e502c`.
- Current pointer: `public/policy/senior-care-policy/current.json`.
- Content file: `public/policy/senior-care-policy/snapshot-f3dabc24478b89c72dc25a4e7154fb8efed4669d9e07809dcff72c1d7a4e502c.json`.
- Bytes: 771155; gzip: 119539.
- Method: `senior-community-care-evidence-review-v1`; schema 1.

Pinned Python extraction → offline Node source audit → edition-bound row identity/reconciliation → deterministic tier/scenario engine → content-addressed publication + atomic current pointer → integrity-checked local loading → existing catalogue/language/navigation with a lazy React module. Accepted source acquisition dates are retained on rebuild. Default fetch audits offline; explicit refresh stages bounded official attachments without overwriting accepted sources. Promotion of any new edition requires independent review. No global `data:fetch` was run.

Policy evidence is outside `public/data`, so the historical 117-directory Data Trust/freshness/provenance universe and all original source dates remain unchanged. Policy renders its own multi-edition source status and audit details instead of attaching a single misleading freshness date. All original Data Trust entries and E/F source files remain unchanged.

## Verification and performance

- `npm ci`: passed with existing lockfile; no Node dependency added or upgraded. Its audit reported one pre-existing high-severity advisory; dependencies were not automatically changed.
- `npm run typecheck`: passed.
- `npm test`: 208 passed / 0 failed.
- `npm run build`: passed.
- `npm run performance:budget`: 400.12 kB raw / 116.05 kB independent gzip, below unchanged 450 / 130 kB limits.
- Policy lazy chunk: approximately 27 kB raw / 10.4 kB Vite gzip; policy CSS 1.67 / 0.63 kB. Main CSS 54.31 / 14.82 kB.
- Snapshot rebuild and exact-file SHA verification: passed; all 5/10/all scenarios and privacy assertions passed.
- Python: 11 parser tests and deterministic offline re-extraction passed.
- Additional static analysis: application noUnusedLocals/noUnusedParameters passes; applying those optional flags to all legacy scripts reports nine existing unused declarations in untouched converters. No new policy diagnostic was reported; normal project typecheck passes.
- Policy Playwright: 24 passes, both languages × 320/390/768/1024/1440px in desktop/mobile projects plus retry, corrupted bytes, export and empty-state checks; no page/console errors or government/PDF requests in successful policy flows.
- Full local Playwright attempt: 165 passed / 1 expected skip / 12 Windows missing-platform-baseline failures. Existing twelve Linux baselines and thresholds are unchanged. Exact Linux PR CI remains pending and is the authoritative visual gate.
- Host runtime is Node 24.14.1; repository/CI remains Node 22 with Playwright exactly 1.62.1. No POSIX `init.sh` was used on PowerShell; equivalent commands ran directly.
- Visual-verdict manual check: pass 92/100 against the existing records-analysis family reference, with intentional policy-specific grouped evidence sections. Desktop/mobile source counts, controls and vertical flow are readable; automated overflow checks passed. The existing app has no dark-theme implementation.

Production local-preview measurement: 31 shell requests, 24 total requests when entering the policy view; no policy module/snapshot requested by the civic shell. Policy evidence itself is a pointer + one immutable JSON fetch. Browser capacity-change interaction: 26.8 ms; mean pure scenario calculation over 1,000 local iterations: 0.345 ms. These are informational local measurements, not user-service performance guarantees. Full request/resource evidence is retained in the performance JSON.

| Mode | Capacity | JSON bytes | CSV bytes |
|---|---:|---:|---:|
| A | 5 | 13255 | 36285 |
| A | 10 | 18069 | 72229 |
| A | all | 526870 | 3740225 |
| B | 5 | 12233 | 36090 |
| B | 10 | 16391 | 71861 |
| B | all | 81499 | 630245 |

## Privacy, limitations and remaining risks

No elderly-alone count, household/individual identifier, phone, full address, vulnerability score, care-need weight or geocoded resident is present in public candidates or standard briefings. The original B PDF retains its official aggregate column only as source evidence under `data/raw`, outside application assets. Public CSV cells guard spreadsheet formula injection, including leading whitespace/control prefixes. Populated and empty JSON/CSV briefings carry policy/date/grain, configuration, provenance, exclusions and limitations.

Mode C remains unavailable for lack of current operation, real hours, staffing/capacity, utilization/waitlists, travel/barriers, comparable denominators and outcomes. No compatible all-village registry or geometry is admitted; no government village codes, complete citywide coverage percentage, site map or accessibility radii are invented. Documentary issues and district balancing do not measure care quality, vulnerability or unmet demand. No site approval, subsidy, care placement or individual eligibility recommendation is issued.

The accepted parser is intentionally edition-bound and rejects future layout/date/schema/control changes until renewed admission. A/E associations are conservative research relationships with different editions, not certified operating-site identity. CSV repeats lineage to retain standalone row context, so all-row exports are larger than JSON. Linux PR checks and human review remain the final delivery gates.

## Changed files and Case Study 010 material

- Raw original bytes, manifest, extraction and independent audit under `data/raw/senior-care-policy/`; exact-byte Git attributes.
- Focused fetch/audit/build/verify scripts, pinned Python parser/tests/requirements and Node identity/scenario/export tests.
- Content-addressed snapshot and atomic pointer under `public/policy/senior-care-policy/`.
- `SeniorCarePolicyDashboard`, scoped styles/types, shared local loader/scenario engine, three small catalogue/App/family integration edits.
- Four focused npm commands, offline policy verification in PR/Pages preparation and pinned PDF tests in PR CI.
- Source feasibility, extraction audit, identity contract, methodology, Traditional Chinese MVP, actual results/performance and delivery report; README/state/handoff updates.

Simplifications: reuse the existing catalogue, URL/language state, family frame and local JSON pattern; no router, Node runtime dependency, GIS stack, arbitrary scoring layer or new global source date. Case Study 010 can demonstrate PDF admission, the cross-page district trap, conservative identity and typed evidence gates, explainable administrative selection, privacy exclusion and bilingual reproducibility. It cannot claim improved care access or welfare outcomes.

Source E CSV SHA/byte size explicitly normalize retained repository CRLF/LF text to its canonical Git LF edition; the generated-record JSON has a separate exact-byte hash. The original acquired A/B/C bytes are never normalized. This prevents Windows/Linux checkout differences from changing policy identities while preserving all existing E files.
