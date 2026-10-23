# Policy #10 official source feasibility

Checked 2026-10-23 (Asia/Taipei). Original evidence is retained in `data/raw/senior-care-policy/`; `manifest.json` records exact original-byte SHA-256, acquisition times, page evidence, publisher, attachment URLs, dates, schema, parser and exclusions.

| Source | Official reference | Accepted edition | Original | Parsed rows |
|---|---|---|---|---:|
| A | [Social Welfare care-site directory](https://dosw.gov.taipei/News_Content.aspx?n=222C9779823FA161&s=0CE286F6AA2F930F&sms=E2A8B6B533500CB0) | Visible header 115.08製表, August 2026 | A.pdf, 14 pages | 520 |
| B | [Programme attachments](https://dosw.gov.taipei/News_Content.aspx?n=63FBD779B8854D69&s=207B5C83CE31EEAE) | Visible header 115.08製表, August 2026 | B.pdf, 2 pages | 88 |
| C | [Taipei legal database FL078396](https://laws.gov.taipei/Law/LawSearch/LawArticleContent/FL078396) | Revised 2025-12-17; effective 2026-01-01 | C-page.html | Regulatory context |

The pages currently expose August 2026 as their latest relevant A/B attachments. Page article metadata says 2026-09-10 14:54 (A) / 14:50 (B). These timestamps do not change the August preparation period. Site-wide footer dates are unrelated to the documents. No exhaustive historical archive or future edition is asserted.

The previously reported A filename/header 115.04 discrepancy is not present in the acquired link: current attachment label and base64 filename both state 115.08. The PDF metadata title contains legacy/spurious XLSX text; the visible PDF header and preparation line establish the retained edition.

C's current official text confirms age 60+, programme service categories and deployment exceptions. Provision IV permits applications where a village only has a 樂齡學堂, or where municipal review confirms additional need. The B list therefore does not establish mandatory facility construction, grant eligibility or care deprivation. Legal HTML is context, not a legal decision engine.

## Admission and reproducibility

`npx tsx scripts/fetchSeniorCarePolicySources.ts` validates accepted originals and derived evidence offline. `--refresh` requires Python with `pdfplumber==0.11.9`; set `SENIOR_CARE_POLICY_PYTHON` when needed. It downloads into a new staging directory under the raw source directory with bounded response bytes/time. It never overwrites accepted originals or promotes changed editions. New editions, changed schemas/page boundaries/serial sequences or incomplete tables fail closed and require a new independent review.

`python scripts/seniorCarePolicyPdf.py` rebuilds extraction in memory and compares its exact bytes to retained `extracted.json`. `--extract` writes deterministically only after all source/hash/title/schema/control checks pass, using a temporary file and atomic replace. The retained acquisition timestamp remains stable. Python package version is checked, not silently upgraded. The browser never parses or downloads PDFs.

A source hash mismatch blocks the audit. Rendered independent controls are documented in the extraction audit. B has exactly 88 serials, not an assumed count copied from the task. A has exactly 520 source records; this is distinct from retained explorer E's 510 source records and programme F's 292 records.

## Identity and interpretation

No authoritative village-code registry or geometry has been admitted in this slice. District plus source village within the accepted edition is usable; cross-edition authoritative government identity remains unavailable. Preserve published Unicode glyphs, including B69 `㇐德里`; any reviewed normalization must remain separate. Organization names cannot establish village location.

Mode A documentary reconciliation is feasible using A and separately retained E. Mode B can use independently verified B village records and bounded administrative identities, with unresolved or cross-source classification issues explicitly gated. Neither mode measures operating availability, resident demand, care capacity, household accessibility or welfare outcomes. Those remain Mode C blockers. No geography or geocoding is admitted.

## Privacy and rights

A's phones and B's elderly-alone counts exist in the acquired official PDFs only. They are deliberately excluded from privacy-minimized extraction and must remain excluded from public snapshots, scoring and standard exports. A addresses remain in internal extraction only for documentary A/E reconciliation; omit them from public shortlists where unnecessary. No individual or household data was acquired.

The [publisher open-data notice](https://dosw.gov.taipei/cp.aspx?Create=1&n=8E5BB52262D3A54D&s=B1A7C295503FEBEA&state=F5D336F102ACBC68) governs publisher-owned website material; preserve attribution, integrity and applicable third-party rights. Do not imply municipal endorsement. Original PDFs are repository evidence under `data/raw`, not public application assets.
