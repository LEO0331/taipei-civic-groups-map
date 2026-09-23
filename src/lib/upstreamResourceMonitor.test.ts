import assert from 'node:assert/strict';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import {
  assessUpstreamEntry,
  buildUpstreamMonitorReport,
  discoverLocalProvenance,
  extractResourceId,
  normalizeTaipeiTimestamp,
  parseTaipeiResourceRows,
} from '../../scripts/upstreamResourceMonitor';

const RID_A = '5fc86f6b-07af-4339-a2d9-06b0764ae8cf';
const RID_B = '702cd8d7-3fa7-43df-a6fa-7d084221dc2e';

const html = `
<div>詮釋資料更新時間 2026-09-21 09:42:03</div>
<table><tbody>
<tr><td>臺北市營業場所衛生優良自主管理分級認證業者名冊〖美容美髮業〗</td><td>6.63 KB</td><td>CSV</td><td>2026-03-06 10:03:31</td><td><a href="/api/frontstage/tpeod/dataset/resource.download?rid=${RID_A}">下載</a></td></tr>
<tr><td>另一項資料</td><td>10 KB</td><td>CSV</td><td>2026-09-01 08:00:00</td><td><a href="/api/frontstage/tpeod/dataset/resource.download?rid=${RID_B}">下載</a></td></tr>
</tbody></table>`;

test('normalizes Taipei platform timestamps and extracts resource IDs', () => {
  assert.equal(normalizeTaipeiTimestamp('2026-03-06 10:03:31'), '2026-03-06T10:03:31+08:00');
  assert.equal(extractResourceId(`https://data.taipei/api/x?rid=${RID_A}`), RID_A);
});

test('parses authoritative downloadable-resource rows without using metadata page timestamps', () => {
  const rows = parseTaipeiResourceRows(html);
  assert.equal(rows.length, 2);
  assert.deepEqual(rows[0], {
    name: '臺北市營業場所衛生優良自主管理分級認證業者名冊〖美容美髮業〗',
    updatedAt: '2026-03-06T10:03:31+08:00',
    resourceId: RID_A,
    format: 'CSV',
  });
});

test('classifies equal, newer, unknown and resource-identity changes', () => {
  const rows = parseTaipeiResourceRows(html);
  const base = { id: 'beauty', sourceName: rows[0].name, resourceId: RID_A };
  assert.equal(assessUpstreamEntry({ ...base, recordedSourceFileUpdatedAt: '2026-03-06T10:03:31+08:00' }, rows).status, 'unchanged');
  assert.equal(assessUpstreamEntry({ ...base, recordedSourceFileUpdatedAt: '2026-03-05T10:03:31+08:00' }, rows).status, 'newer_resource');
  assert.equal(assessUpstreamEntry(base, rows).status, 'unknown_date');
  assert.equal(assessUpstreamEntry({ ...base, resourceId: '11111111-1111-1111-1111-111111111111' }, rows).status, 'resource_changed');
});

test('fails closed when a source cannot be selected safely or timestamps conflict', () => {
  const rows = parseTaipeiResourceRows(html);
  assert.equal(assessUpstreamEntry({ id: 'ambiguous' }, rows).status, 'unresolved');
  assert.equal(assessUpstreamEntry({
    id: 'future-local',
    sourceName: rows[0].name,
    recordedSourceFileUpdatedAt: '2026-03-07T10:03:31+08:00',
  }, rows).status, 'unresolved');
});

test('discovers mixed legacy/new provenance metadata without guessing unsupported sources', async () => {
  const root = await mkdtemp(join(tmpdir(), 'upstream-monitor-'));
  const publicData = join(root, 'public/data');
  const rawData = join(root, 'data/raw');
  await mkdir(join(publicData, 'known'), { recursive: true });
  await mkdir(join(rawData, 'known'), { recursive: true });
  await mkdir(join(publicData, 'legacy'), { recursive: true });
  await mkdir(join(rawData, 'legacy'), { recursive: true });
  await writeFile(join(publicData, 'known', 'metadata.json'), JSON.stringify({
    source: 'Known resource',
    sourcePage: 'https://data.taipei/dataset/detail?id=abc',
    sourceFileUpdatedAt: '2026-03-06T10:03:31+08:00',
  }));
  await writeFile(join(rawData, 'known', 'fetch-metadata.json'), JSON.stringify({
    sourceUrl: `https://data.taipei/api/frontstage/tpeod/dataset/resource.download?rid=${RID_A}`,
  }));
  await writeFile(join(rawData, 'legacy', 'fetch-metadata.json'), JSON.stringify({
    sourceUrl: 'https://data.taipei/dataset/detail?id=legacy',
  }));

  const entries = await discoverLocalProvenance(publicData, rawData);
  assert.equal(entries.length, 2);
  const known = entries.find((entry) => entry.id === 'known');
  assert.equal(known?.resourceId, RID_A);
  assert.equal(known?.recordedSourceFileUpdatedAt, '2026-03-06T10:03:31+08:00');
  assert.equal(entries.find((entry) => entry.id === 'legacy')?.sourcePage, 'https://data.taipei/dataset/detail?id=legacy');
});

test('fetches each source page once and reports unsupported sources separately', async () => {
  let calls = 0;
  const report = await buildUpstreamMonitorReport([
    { id: 'a', sourcePage: 'https://data.taipei/dataset/detail?id=x', sourceName: '另一項資料', recordedSourceFileUpdatedAt: '2026-09-01T08:00:00+08:00' },
    { id: 'b', sourcePage: 'https://data.taipei/dataset/detail?id=x', sourceName: '另一項資料' },
    { id: 'unsupported' },
  ], {
    checkedAt: '2026-09-23T04:00:00.000Z',
    fetchHtml: async () => { calls += 1; return html; },
  });
  assert.equal(calls, 1);
  assert.equal(report.totalDatasetDirectoryCount, 3);
  assert.equal(report.eligibleDatasetCount, 2);
  assert.equal(report.skippedUnsupportedSourceCount, 1);
  assert.equal(report.counts.unchanged, 1);
  assert.equal(report.counts.unknown_date, 1);
});
