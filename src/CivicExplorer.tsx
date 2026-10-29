import { useEffect, useRef, useState } from 'react';
import AccessibleTabs, { AccessibleTabPanel } from './AccessibleTabs';
import { HexIsland } from './explorer/HexIsland';
import { buildCivicCatalogueAdapter } from './lib/civicCatalogueAdapter';
import type { CatalogueCategoryId, CatalogueLanguage } from './lib/datasetCatalogue';
import { buildNavigationUrl } from './lib/navigationState';
import './CivicExplorer.css';

const colors = ['#357b72', '#537da2', '#9c693d', '#886a94', '#667b46', '#ae614e', '#566c83'];

export default function CivicExplorer({ language, dataset, onNavigate, onBack }: {
  language: CatalogueLanguage;
  dataset: string;
  onNavigate: (id: string) => void;
  onBack: () => void;
}) {
  const zh = language === 'zh';
  const [categoryId, setCategoryId] = useState<CatalogueCategoryId>();
  const [query, setQuery] = useState('');
  const [view, setView] = useState<'scene' | 'list'>('scene');
  const root = useRef<HTMLElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const resultsHeading = useRef<HTMLHeadingElement>(null);
  const search = useRef<HTMLInputElement>(null);
  const groups = buildCivicCatalogueAdapter(language, query);
  const selected = groups.find(group => group.id === categoryId);
  const visible = groups.filter(group => !categoryId || group.id === categoryId);
  const count = visible.reduce((sum, group) => sum + group.items.length, 0);
  const total = groups.reduce((sum, group) => sum + group.total, 0);
  useEffect(() => { heading.current?.focus(); }, []);
  useEffect(() => { if (categoryId) resultsHeading.current?.focus(); }, [categoryId]);

  function clearCategory() {
    const previous = categoryId;
    setCategoryId(undefined);
    requestAnimationFrame(() => {
      const hub = root.current?.querySelector<HTMLButtonElement>(`[data-explorer-group="${previous}"]`);
      if (view === 'scene' && hub) hub.focus();
      else search.current?.focus();
    });
  }
  function reset() {
    setCategoryId(undefined);
    setQuery('');
    search.current?.focus();
  }

  return <section className="civic-explorer" ref={root} aria-labelledby="civic-explorer-heading" onKeyDown={event => {
    if (event.key === 'Escape') {
      event.stopPropagation();
      if (categoryId) clearCategory();
      else onBack();
    }
  }}>
    <div className="ce-heading">
      <div><p className="ce-eyebrow">CIVIC EXPLORER / {total}</p>
        <h2 id="civic-explorer-heading" tabIndex={-1} ref={heading}>{zh ? '從七個主題開始探索' : 'Seven starting points for discovery'}</h2>
        <p>{zh ? '選擇主題，或以中英文搜尋現有目錄。圖形僅供導覽，不代表地理位置、排名或服務可用性。' : 'Choose a topic, or search the existing catalogue in either language. Hubs represent navigation, with no geographic, ranking or service-availability meaning.'}</p>
      </div>
      <button type="button" onClick={onBack}>{zh ? '返回資料目錄' : 'Return to catalogue'}</button>
    </div>
    <div className="ce-controls">
      <label>{zh ? '搜尋目錄項目' : 'Search catalogue entries'}<input ref={search} type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder={zh ? '名稱或關鍵字（中英文皆可）' : 'Names or keywords in either language'} /></label>
      <AccessibleTabs tabs={[["scene", zh ? '主題圖' : 'Hubs'], ["list", zh ? '清單' : 'List']]} value={view} onChange={setView} ariaLabel={zh ? '探索顯示方式' : 'Explorer display mode'} idPrefix="ce-view" controlsPanel />
      <button type="button" onClick={reset}>{zh ? '重設探索' : 'Reset explorer'}</button>
    </div>
    <div className="ce-status"><p role="status">{zh ? `${count} 個符合的目錄項目` : `${count} matching catalogue entries`}{selected && ` · ${selected.title}`}</p>
      {selected && <button type="button" onClick={clearCategory}>{zh ? '所有主題' : 'All topics'}</button>}
    </div>
    <AccessibleTabPanel idPrefix="ce-view" value={view} className={`ce-body ce-body-${view}`}>
      {view === 'scene' && <div className="ce-hubs" role="group" aria-label={zh ? '七個目錄主題' : 'Seven catalogue topics'}>
        {groups.map((group, index) => <HexIsland key={group.id} nodeId={group.id} kind="group" color={colors[index]} motif={(index % 6) as 0 | 1 | 2 | 3 | 4 | 5} label={group.title}
          caption={zh ? `${group.total} 個目錄項目 · ${group.items.length} 個符合` : `${group.total} entries · ${group.items.length} matching`}
          selected={categoryId === group.id} onSelect={() => { if (categoryId === group.id) resultsHeading.current?.focus(); else setCategoryId(group.id); }} />)}
      </div>}
      <div className="ce-results">
        <h3 ref={resultsHeading} tabIndex={-1}>{selected?.title ?? (zh ? '現有資料目錄' : 'Existing catalogue')}</h3>
        {count === 0 && <p>{zh ? '找不到符合的項目。請重設探索或嘗試其他關鍵字。' : 'No matching entries. Reset explorer or try another keyword.'}</p>}
        {visible.filter(group => group.items.length).map(group => <section key={group.id}>
          {!selected && <h4><button type="button" onClick={() => setCategoryId(group.id)}>{group.title}</button></h4>}
          <ul>{group.items.map(([id, label]) => <li key={id}><a href={buildNavigationUrl(window.location.href, { dataset: id, language }).href} aria-current={dataset === id ? 'page' : undefined} onClick={event => {
            if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
            event.preventDefault();
            onNavigate(id);
          }}>{label}<span aria-hidden="true"> ↗</span></a></li>)}</ul>
        </section>)}
      </div>
    </AccessibleTabPanel>
    <p className="ce-footnote">{zh ? '目錄項目包含資料集、比較與說明頁。筆數為可導覽項目數，不是機構或服務數。歷史與行政紀錄無法證明目前狀態；來源日期、快照與解讀限制請見各頁「資料使用提醒」。' : 'Catalogue entries include datasets, comparison and notes pages. Counts describe navigation entries, not facilities or services. Historical and administrative records do not establish current status; see each page’s Data Trust panel for source dates, snapshots and interpretation limits.'}</p>
  </section>;
}
