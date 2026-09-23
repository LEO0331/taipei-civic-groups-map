# Upstream Data Maintenance Plan

## Objective

Keep the production dashboard stable while automating only the evidence-gathering needed to detect authoritative upstream changes and gradually improve source-date provenance.

The maintenance model is intentionally quiet by default:

1. detect authoritative upstream resource changes;
2. investigate only when evidence changes;
3. run a focused guarded refresh for the affected dataset;
4. reduce unknown provenance gradually without inferring dates.

The dashboard UI, conversion output, dependencies, visual baselines, and deployment behavior are not part of this maintenance track unless a later evidence-driven change requires them.

## Branch sequence

| Order | Branch | Purpose | Automation level |
| --- | --- | --- | --- |
| 0 | `main` | Stable production baseline | Frozen except evidence-driven maintenance |
| 1 | `chore/upstream-monitor-core` | Metadata/resource change detector, report, and unit tests | Manual/local command |
| 2 | `chore/upstream-monitor-schedule` | Run the monitor automatically each week | Scheduled GitHub Actions |
| 3 | `chore/provenance-review-registry` | Record review state for unknown-date datasets | Registry + deterministic reporting |
| 4 | `chore/provenance-review-schedule` | Generate a bounded monthly provenance-review queue | Scheduled GitHub Actions |
| Later | `data/refresh-<dataset-id>` | Refresh only a dataset with proven upstream change | Focused, reviewed PR |

Each branch starts from `main` after the previous branch has merged. Do not stack these branches before the preceding change is stable.

## M1 — upstream monitor core

Command:

```bash
npm run data:monitor:upstream
```

Default report:

```text
.tmp/upstream-monitor-report.json
```

The report is an operational artifact, not dashboard data, so it is not written into `public/data` by default.

### Source boundary

M1 monitors datasets that can be tied to an official Taipei Data Platform dataset detail page. It reads the current repository provenance from:

- `public/data/<dataset-id>/metadata.json`
- `data/raw/<dataset-id>/fetch-metadata.json`

It supports both newer and legacy metadata shapes (`sourcePage`, `sourceUrl`, `source`, `sourceName`, `resourceName`, and resource download URLs containing `rid`).

### Authoritative timestamp rule

Only the downloadable resource/file `更新時間` is used for freshness comparison.

Do not substitute:

- `詮釋資料更新時間` / metadata-page edit time;
- collection-period dates;
- fetch time;
- commit time;
- filename dates.

### Statuses

| Status | Meaning | Action |
| --- | --- | --- |
| `unchanged` | Official file timestamp equals recorded provenance | None |
| `newer_resource` | Official file timestamp is newer | Focused investigation/refresh candidate |
| `resource_changed` | Recorded resource identity disappeared but a replacement candidate exists | Manual review before fetch |
| `unknown_date` | Upstream timestamp is visible but local snapshot has no authoritative recorded date | Provenance-review candidate |
| `unresolved` | Resource cannot be selected safely or timestamps conflict | Manual review; never guess |
| `error` | Official page check failed | Retry later; never interpret as a data change |

Datasets without a supported Taipei Data Platform detail page are counted separately as unsupported-source skips, not treated as changed data.

### Safety properties

M1 is detection-only. It must not:

- replace CSV/source files;
- write `sourceFileUpdatedAt` automatically;
- commit or push;
- open or merge PRs;
- trigger deployment;
- treat dataset age alone as evidence of staleness.

Source pages shared by multiple datasets are fetched once per run, and matching fails closed when resource identity is ambiguous.

## M2 — weekly schedule

Implemented by `chore/upstream-monitor-schedule` in:

```text
.github/workflows/upstream-monitor.yml
```

Schedule:

- Monday 09:00 Asia/Taipei
- GitHub cron: `0 1 * * 1`
- manual `workflow_dispatch`
- 15-minute job timeout
- read-only repository permission

Workflow:

```text
checkout
  -> Node 22
  -> npm ci
  -> npm run data:monitor:upstream
  -> write Actions summary
  -> upload .tmp/upstream-monitor-report.json
```

Reports are retained as GitHub Actions artifacts for 30 days. The job summary surfaces counts plus only the strongest attention candidates (`newer_resource`, `resource_changed`, and `error`); `unknown_date` and `unresolved` remain visible in counts without turning the weekly check into notification noise.

M2 does not run `data:fetch`, write repository contents, commit/push, or deploy. A successful workflow only means the evidence-gathering job completed; it does not imply that upstream data was automatically accepted.

If a later iteration is justified, a changed resource may be fetched into the temporary Actions workspace and checked with the existing schema/data-change/anomaly guards, but it still must not auto-commit or auto-merge.

## M3 — provenance review registry

Implemented by `chore/provenance-review-registry`.

Registry:

```text
data/provenance-review.json
```

Validation/report command:

```bash
npm run data:provenance:review
```

Default report:

```text
.tmp/provenance-review-report.json
```

Purpose: distinguish datasets that are still unknown because they have not been reviewed from datasets that were reviewed and genuinely lack a defensible authoritative timestamp.

Supported states:

- `not_reviewed`
- `verified`
- `no_authoritative_timestamp`
- `ambiguous_resource`
- `api_source`
- `source_unavailable`
- `needs_manual_review`

Registry invariants:

- every current unknown-date dataset must have exactly one registry entry;
- `not_reviewed` entries keep `lastReviewedAt: null` and carry no source date;
- every reviewed state requires a valid `YYYY-MM-DD` review date;
- `verified` is allowed only after Data Trust also contains the authoritative source date;
- a retained verified history entry must match the current Data Trust source date exactly;
- if a previously unknown dataset becomes dated, a retained registry entry must be promoted to `verified`;
- unknown/unresolved outcomes remain valid review results and must not be converted into inferred dates.

At implementation time the 49 current unknown-date datasets are initialized as `not_reviewed`. The validator is count-agnostic: later provenance work may reduce the unknown total while preserving registry consistency.

The goal is not to force all unknown dates to zero. Zero fabricated dates is more important than 100% date coverage.

## M4 — monthly provenance queue

After M3 is merged, create `chore/provenance-review-schedule`.

Run approximately once per month and select only 5–10 unresolved/never-reviewed datasets for investigation. Queue generation can be automatic; assigning an authoritative date remains evidence-driven.

Preferred review order:

1. exact source page + exact resource already known;
2. multiple-resource pages requiring resource matching;
3. API/system sources without normal file timestamps;
4. genuinely ambiguous sources, which may remain unknown.

## Focused refresh path

When M1/M2 proves that an official resource changed, create a dataset-specific branch such as:

```text
data/refresh-<dataset-id>
```

Use the existing guarded release sequence:

```text
capture schema baseline
  -> capture release baseline
  -> focused fetch
  -> source schema guard
  -> release data-change comparison
  -> semantic data-quality anomaly guard
  -> conversion
  -> tests/build/performance
  -> desktop/mobile E2E
  -> reviewed PR
  -> merge/deploy
```

Unrelated changed datasets should normally use separate refresh branches unless they are clearly one official source family.

## Operating cadence

| Track | Cadence | Trigger for work |
| --- | --- | --- |
| Upstream resource monitor | Weekly | Timestamp/resource identity/status changes |
| Existing release safeguards | Every real deployment | Schema/content/anomaly evidence |
| Provenance review | Monthly, 5–10 datasets | Authoritative timestamp can be proven or review state clarified |
| Broader maintenance review | Every 2–3 months | Accumulated evidence justifies engineering work |

Normal outcome should be no action.

## Success criteria

The maintenance system is working when:

- upstream checks run without bulk-refreshing production data;
- authoritative file changes are surfaced promptly;
- unchanged sources create no engineering work;
- unknown provenance decreases gradually where evidence exists;
- unresolved sources remain explicitly unresolved instead of receiving inferred dates;
- existing schema, release-change, anomaly, E2E, visual, and performance protections remain unchanged.
