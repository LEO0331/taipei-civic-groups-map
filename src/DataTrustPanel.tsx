import { useEffect, useMemo, useState } from 'react';
import { freshnessStatus, type FreshnessStatus } from './lib/dataTrust';

type Language = 'zh' | 'en';
type DatasetEntry = { id: string; sourceUpdatedAt?: string; sourceName?: string; fetchStatus?: 'current' | 'reused_snapshot'; fetchFailedAt?: string };
type Manifest = { datasetDirectoryCount: number; datedDatasetCount: number; fetchFallbackDatasetCount?: number; entries: DatasetEntry[] };
type AttentionLevel = 'normal' | 'caution' | 'warning';

const statusCopy: Record<FreshnessStatus, [string, string]> = {
  current: ['資料日期在 90 天內', 'Source date within 90 days'],
  aging: ['資料日期為 91–180 天前', 'Source date is 91–180 days old'],
  stale: ['資料日期超過 180 天', 'Source date is over 180 days old'],
  unknown: ['無法從現有詮釋資料確認日期', 'No source date in the available metadata'],
};

const compactStatusCopy: Record<FreshnessStatus, [string, string]> = {
  current: ['日期在 90 天內', 'Updated within 90 days'],
  aging: ['日期 91–180 天', '91–180 days old'],
  stale: ['日期超過 180 天', 'Over 180 days old'],
  unknown: ['日期未知', 'Date unknown'],
};

const fallbackDatasetNames: Record<string, [string, string]> = {
  'adult-influenza-vaccine-providers': ['成人流感疫苗合約醫療院所', 'Adult influenza vaccine providers'],
};

function humanizeDatasetId(id: string) {
  return id.split('-').filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
}

function readableDatasetName(entry: DatasetEntry, zh: boolean, activeDatasetLabel?: string) {
  if (activeDatasetLabel) return activeDatasetLabel;
  const fallback = fallbackDatasetNames[entry.id];
  if (fallback) return fallback[zh ? 0 : 1];
  if (entry.sourceName) return entry.sourceName;
  return humanizeDatasetId(entry.id);
}

function attentionLevel(status: FreshnessStatus, fetchStatus?: DatasetEntry['fetchStatus']): AttentionLevel {
  if (fetchStatus === 'reused_snapshot' || status === 'stale') return 'warning';
  if (status === 'aging' || status === 'unknown') return 'caution';
  return 'normal';
}

export default function DataTrustPanel({
  language,
  activeDataset,
  activeDatasetLabel,
  appliesSmallSampleGuard = false,
}: {
  language: Language;
  activeDataset?: string;
  activeDatasetLabel?: string;
  appliesSmallSampleGuard?: boolean;
}) {
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const zh = language === 'zh';

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/data-trust-manifest.json`)
      .then((response) => response.ok ? response.json() : Promise.reject(response.status))
      .then(setManifest)
      .catch(() => setManifest(null));
  }, []);

  const active = useMemo(() => manifest?.entries.find((entry) => entry.id === activeDataset), [manifest, activeDataset]);
  const activeStatus = freshnessStatus(active?.sourceUpdatedAt);
  const activeName = active ? readableDatasetName(active, zh, activeDatasetLabel) : activeDatasetLabel;
  const attention = active ? attentionLevel(activeStatus, active.fetchStatus) : 'normal';
  const staleCount = manifest?.entries.filter((entry) => freshnessStatus(entry.sourceUpdatedAt) === 'stale').length ?? 0;
  const unknownCount = manifest?.entries.filter((entry) => freshnessStatus(entry.sourceUpdatedAt) === 'unknown').length ?? 0;

  return <aside className="data-trust" data-attention={attention} aria-label={zh ? '資料信任與使用提醒' : 'Data trust and use reminders'}>
    <div className="data-trust-summary">
      <div className="data-trust-primary" role="status" aria-live="polite">
        <strong>{zh ? '資料使用提醒' : 'Data use note'}</strong>
        {active && <>
          <span className="data-trust-dataset">{activeName}</span>
          <span className={`data-trust-status ${activeStatus}`}>{compactStatusCopy[activeStatus][zh ? 0 : 1]}</span>
        </>}
        {active?.fetchStatus === 'reused_snapshot' && <span className="data-trust-status refresh-failed">{zh ? '官方刷新失敗 · 使用最近成功快照' : 'Official refresh failed · using latest successful snapshot'}</span>}
        {!manifest && <span className="data-trust-loading">{zh ? '正在讀取資料狀態' : 'Loading data status'}</span>}
      </div>
      <details className="data-trust-details">
        <summary>{zh ? '詳細資訊' : 'Details'}</summary>
        <div className="data-trust-detail-body">
          {active && <p><strong>{activeName}</strong> · {statusCopy[activeStatus][zh ? 0 : 1]}{active.sourceUpdatedAt ? (zh ? `；來源日期：${active.sourceUpdatedAt}` : `; source date: ${active.sourceUpdatedAt}`) : ''}。</p>}
          {active?.fetchStatus === 'reused_snapshot' && <p className="data-trust-refresh-warning">{zh ? `本次官方刷新失敗，顯示最近成功快照${active.fetchFailedAt ? `（失敗時間：${active.fetchFailedAt}）` : ''}。` : `The official refresh failed; the most recently successful snapshot is displayed${active.fetchFailedAt ? ` (failure recorded: ${active.fetchFailedAt})` : ''}.`}</p>}
          {manifest && <p>{zh ? `${manifest.datedDatasetCount}/${manifest.datasetDirectoryCount} 個資料目錄有可判讀的來源日期；${staleCount} 個超過 180 天，${unknownCount} 個日期未知。` : `${manifest.datedDatasetCount}/${manifest.datasetDirectoryCount} dataset directories have a readable source date; ${staleCount} are over 180 days old and ${unknownCount} have an unknown date.`}</p>}
          <p>{zh ? '搜尋與篩選只在此瀏覽器中處理；開啟外部地圖會把所選地址交給該地圖服務。原始來源欄位應僅在需要核對時展開，不應據此建立個人或機構排名。' : 'Searches and filters stay in this browser. Opening an external map shares the selected address with that map service. Open raw source fields only when needed for verification; do not use them to rank people or organisations.'}</p>
          <p>{appliesSmallSampleGuard ? (zh ? '此頁的敏感語音預約摘要會將 1–4 筆顯示為「<5」，避免把極少數來源紀錄過度解讀。' : 'This page displays 1–4 records as “<5” in the sensitive voice-reservation summary to avoid over-interpreting a very small count.') : (zh ? '若頁面採用小樣本保護，1–4 筆敏感摘要會顯示為「<5」。未採用此規則的公開名冊仍應視為來源紀錄，而非品質或可近性比較。' : 'When a page uses the small-sample safeguard, sensitive summaries of 1–4 records display as “<5”. Other public directories remain source records, not quality or accessibility comparisons.')}</p>
        </div>
      </details>
    </div>
  </aside>;
}
