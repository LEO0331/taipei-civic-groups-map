import { useEffect } from 'react';

function syncLegacyTabList(tablist: HTMLElement, index: number, language: 'zh' | 'en') {
  if (tablist.dataset.accessibleTabs === 'true') return;
  tablist.setAttribute('role', 'tablist');
  if (!tablist.getAttribute('aria-label')) {
    tablist.setAttribute('aria-label', language === 'zh' ? '資料檢視' : 'Data views');
  }
  tablist.dataset.legacyTablist = 'true';
  const tabs = Array.from(tablist.querySelectorAll<HTMLButtonElement>(':scope > button'));
  tabs.forEach((tab, tabIndex) => {
    const selected = tab.classList.contains('active');
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
    if (!tab.id) tab.id = `legacy-tab-${index}-${tabIndex}`;
  });
}

export default function LegacyTabAccessibility({ language }: { language: 'zh' | 'en' }) {
  useEffect(() => {
    const sync = () => {
      document.querySelectorAll<HTMLElement>('.subtabs').forEach((tablist, index) => syncLegacyTabList(tablist, index, language));
    };
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      const target = event.target instanceof HTMLElement ? event.target.closest<HTMLButtonElement>('[role="tab"]') : null;
      const tablist = target?.closest<HTMLElement>('[data-legacy-tablist="true"]');
      if (!target || !tablist) return;
      const tabs = Array.from(tablist.querySelectorAll<HTMLButtonElement>(':scope > [role="tab"]'));
      const current = tabs.indexOf(target);
      if (current < 0 || !tabs.length) return;
      let next = current;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (current + 1) % tabs.length;
      else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (current - 1 + tabs.length) % tabs.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = tabs.length - 1;
      else return;
      event.preventDefault();
      tabs[next]?.focus();
      tabs[next]?.click();
      window.requestAnimationFrame(sync);
    };
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['class'] });
    document.addEventListener('keydown', onKeyDown);
    return () => {
      observer.disconnect();
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [language]);

  return null;
}
