# Policy #10 PDF extraction audit

Independent visual check: 2026-10-23. Status: verified for the accepted bytes only. `data/raw/senior-care-policy/extraction-audit.json` binds controls to source hashes and the exact `extracted.json` hash. Machine-readable row references remain retained there.

| Source | SHA-256 | PDF pages | Rows |
|---|---|---:|---:|
| A | 26a56351439c42d92a386bb02ad561fffe462b9c0f001776087c28223bc0bcf2 | 14 | 520 |
| B | c66d04fd36a5f4293e86769a5a1c02b02f746f73b6581b8e1357524fe019e3a7 | 2 | 88 |

Parser: `pdfplumber==0.11.9`, ruled-table extraction, version `table-lines-v1`. Text cells preserve source glyphs; PDF line-wrap newlines are removed and outer whitespace trimmed. Phone/count columns are discarded before emitting extracted rows. No OCR, LLM extraction or fabricated replacement rows are used. Required cells, ordinal continuity, page count, title/preparation line, schemas and page boundaries are enforced. A names need not be unique; source ordinal is the record identity input.

## Page-boundary controls

All first/last rows per page were compared with rendered PDF row strips, independently of the extracted table text.

| A page | First–last serial |
|---|---|
| 1 | 1–36 |
| 2 | 37–74 |
| 3 | 75–112 |
| 4 | 113–149 |
| 5 | 150–187 |
| 6 | 188–225 |
| 7 | 226–262 |
| 8 | 263–298 |
| 9 | 299–335 |
| 10 | 336–373 |
| 11 | 374–412 |
| 12 | 413–451 |
| 13 | 452–489 |
| 14 | 490–520 |

A1 is 士林區/三玉里, multiline 士林老人服務中心 operator text. A520 is 信義區/興隆里, 社團法人中華民國新能量促進協會（興隆）. A14 long venue text, A17 two addresses, and A35 two venues were visually compared. These are source rows, not distinct facility/capacity counts. A14/A15 share a venue in the source and are retained separately. Every district transition was visually checked: serials 1,49,80,145,189,220,253,307,361,400,451,477,515,516,517,519. The final page includes appended records returning to several districts; no assumption of district sorting is made.

## B merged-cell and Unicode controls

B page 1 is serials 1–48; page 2 is 49–88. Every displayed village and district block was visually compared. Group ranges: 士林1–16, 大同17–21, 大安22–32, 中山33–40, 中正41–46, 內湖47–58, 文山59–64, 北投65–70, 松山71–74, 信義75–79, 南港80–82, 萬華83–88.

The 內湖區 cell crosses the page break: B47紫陽里 and B48內溝里 are on page 1 below the 中正區 cell boundary. The district label itself is printed on page 2 beside B49–58. A naïve forward-fill would incorrectly assign B47–58 to 中正區. The parser instead checks open-ended district-column geometry, the next-page cropped label, the independently reviewed 47–58 span and all district transitions. Other inheritance is permitted only when the original merged district cell geometrically covers the row. Missing unexplained district cells fail.

B1福安里 and B88榮德里 are the endpoints. B69 visually reads 一德里 but its embedded text uses stroke glyph `㇐德里`. The original glyph is preserved in extraction; downstream normalization must explicitly document it. No village code is invented.

## Verification and limits

Successful commands: Python extraction with `--extract`, Python offline exact-byte rebuild, TypeScript offline source audit and default fetch audit. All 520/88 ordinal sequences and no missing required village/district cells passed. Source-page HTML is retained and hashed; accepted downloadable URLs must remain members of that retained evidence. `extracted.json` contains no telephone or elderly-alone-count field.

Visual review used PDF rasterization at 120 DPI for both B pages, all A pages as a contact sheet, and readable 140 DPI row strips for every A boundary, district transition and selected multiline row. Renderings were temporary inspection artifacts and are not public assets. Reproduce with `pdfplumber.open(path).pages[n].to_image(resolution=140)` (bundled pypdfium2 renderer).

These controls validate this edition, not future editions. A future identical row count is insufficient evidence of correct extraction. New title/date, page layout, district spans, columns, source hashes and row identities require staged admission and renewed visual verification. Public policy outputs must gate on successful source/audit binding and must not infer care demand or operational availability.

Focused parser regression command: `python scripts/seniorCarePolicyPdf.test.py`. Twenty checks pass, including invalid PDF, changed page count/date/schema, missing ordinal/district/village, malformed columns, original-hash failure, deterministic real-source extraction, merged-cell continuation, Unicode and privacy field contracts. Synthetic malformed rows exist only in the test module and never supply production results.

The expanded acquisition fixtures additionally verify latest-edition selection against retained official pages, future labels while old links remain, ambiguity/date/host failures, bounded downloads and stage-only provenance. These changes do not alter the accepted PDF extraction or snapshot. Attachment-label dates remain distinct from verified document-header preparation dates.
