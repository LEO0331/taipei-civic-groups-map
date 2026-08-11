import { useEffect, useMemo, useState } from 'react';
import { freshnessStatus, type FreshnessStatus } from './lib/dataTrust';

type Language = 'zh' | 'en';
type DatasetEntry = { id: string; sourceUpdatedAt?: string; sourceName?: string };
type Manifest = { datasetDirectoryCount: number; datedDatasetCount: number; entries: DatasetEntry[] };

const statusCopy: Record<FreshnessStatus, [string, string]> = {
  current: ['資料日期在 90 天內', 'Source date within 90 days'],
  aging: ['資料日期為 91–180 天前', 'Source date is 91–180 days old'],
  stale: ['資料日期超過 180 天', 'Source date is over 180 days old'],
  unknown: ['無法從現有詮釋資料確認日期', 'No source date in the available metadata'],
};

export default function DataTrustPanel({ language, activeDataset, appliesSmallSampleGuard = false }: { language: Language; activeDataset?: string; appliesSmallSampleGuard?: boolean }) {
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
  const staleCount = manifest?.entries.filter((entry) => freshnessStatus(entry.sourceUpdatedAt) === 'stale').length ?? 0;
  const unknownCount = manifest?.entries.filter((entry) => freshnessStatus(entry.sourceUpdatedAt) === 'unknown').length ?? 0;

  return <aside className="data-trust" aria-label={zh ? '資料信任與使用提醒' : 'Data trust and use reminders'}>
    <div className="data-trust-summary" role="status" aria-live="polite">
      <strong>{zh ? '資料使用提醒' : 'Use data carefully'}</strong>
      {active && <span className={`data-trust-status ${activeStatus}`}>{zh ? `${active.sourceName ?? active.id}：${statusCopy[activeStatus][0]}` : `${active.sourceName ?? active.id}: ${statusCopy[activeStatus][1]}`}</span>}
      {manifest && <span>{zh ? `${manifest.datedDatasetCount}/${manifest.datasetDirectoryCount} 個資料目錄有可判讀的來源日期；${staleCount} 個超過 180 天，${unknownCount} 個日期未知。` : `${manifest.datedDatasetCount}/${manifest.datasetDirectoryCount} dataset directories have a readable source date; ${staleCount} are over 180 days old and ${unknownCount} have an unknown date.`}</span>}
    </div>
    <details>
      <summary>{zh ? '資料時間、隱私與小樣本規則' : 'Data time, privacy, and small-sample rules'}</summary>
      <p>{zh ? '搜尋與篩選只在此瀏覽器中處理；開啟外部地圖會把所選地址交給該地圖服務。原始來源欄位應僅在需要核對時展開，不應據此建立個人或機構排名。' : 'Searches and filters stay in this browser. Opening an external map shares the selected address with that map service. Open raw source fields only when needed for verification; do not use them to rank people or organisations.'}</p>
      <p>{appliesSmallSampleGuard ? (zh ? '此頁的敏感語音預約摘要會將 1–4 筆顯示為「<5」，避免把極少數來源紀錄過度解讀。' : 'This page displays 1–4 records as “<5” in the sensitive voice-reservation summary to avoid over-interpreting a very small count.') : (zh ? '若頁面採用小樣本保護，1–4 筆敏感摘要會顯示為「<5」。未採用此規則的公開名冊仍應視為來源紀錄，而非品質或可近性比較。' : 'When a page uses the small-sample safeguard, sensitive summaries of 1–4 records display as “<5”. Other public directories remain source records, not quality or accessibility comparisons.')}</p>
    </details>
  </aside>;
}
