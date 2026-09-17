const DISMISSED_ONBOARDING_KEY = 'taipei-public-data:onboarding-dismissed';

function currentLanguage() {
  return document.documentElement.lang === 'en' ? 'en' : 'zh';
}

function updateUrl(datasetLabel?: string, language = currentLanguage(), mode: 'push' | 'replace' = 'replace') {
  const url = new URL(window.location.href);
  if (datasetLabel) url.searchParams.set('dataset', datasetLabel);
  else url.searchParams.delete('dataset');
  url.searchParams.set('lang', language);
  window.history[mode === 'push' ? 'pushState' : 'replaceState']({}, '', url);
}

function firstModuleElement() {
  return document.querySelector<HTMLElement>('main .workspace, main .module-panel, main .health-directory');
}

function exactCatalogueButton(label: string) {
  return [...document.querySelectorAll<HTMLButtonElement>('#dataset-catalogue .catalogue-category button')]
    .find((button) => button.textContent?.trim() === label);
}

async function restoreFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const targetLanguage = params.get('lang') === 'en' ? 'en' : 'zh';
  const datasetLabel = params.get('dataset')?.trim();

  const languageButton = document.querySelector<HTMLButtonElement>('button.language');
  if (languageButton && currentLanguage() !== targetLanguage) {
    languageButton.click();
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  }

  if (!datasetLabel) return;
  const trigger = document.querySelector<HTMLButtonElement>('.catalogue-trigger');
  if (!trigger) return;
  if (document.querySelector('.catalogue-trigger-current')?.textContent?.trim() === datasetLabel) {
    firstModuleElement()?.scrollIntoView({ block: 'start' });
    return;
  }

  if (!document.querySelector('#dataset-catalogue')) trigger.click();
  await new Promise((resolve) => requestAnimationFrame(resolve));
  const search = document.querySelector<HTMLInputElement>('#dataset-catalogue .catalogue-popover-search input')
    ?? document.querySelector<HTMLInputElement>('.catalogue-search input');
  if (search) {
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
    setter?.call(search, datasetLabel);
    search.dispatchEvent(new Event('input', { bubbles: true }));
    search.dispatchEvent(new Event('change', { bubbles: true }));
    await new Promise((resolve) => requestAnimationFrame(resolve));
  }
  exactCatalogueButton(datasetLabel)?.click();
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  firstModuleElement()?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function installUiStateBridge() {
  let restoring = false;

  const dismissSavedOnboarding = () => {
    if (localStorage.getItem(DISMISSED_ONBOARDING_KEY) !== '1') return;
    const dismiss = document.querySelector<HTMLButtonElement>('button[aria-label="關閉使用方式"], button[aria-label="Dismiss guide"]');
    dismiss?.click();
  };

  const observer = new MutationObserver(() => dismissSavedOnboarding());
  observer.observe(document.documentElement, { childList: true, subtree: true });
  dismissSavedOnboarding();

  const onClick = (event: MouseEvent) => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;

    const dismiss = target.closest<HTMLButtonElement>('button[aria-label="關閉使用方式"], button[aria-label="Dismiss guide"]');
    if (dismiss) localStorage.setItem(DISMISSED_ONBOARDING_KEY, '1');

    const datasetButton = target.closest<HTMLButtonElement>('#dataset-catalogue .catalogue-category button');
    if (datasetButton && !restoring) {
      const label = datasetButton.textContent?.trim();
      if (label) {
        updateUrl(label, currentLanguage(), 'push');
        requestAnimationFrame(() => requestAnimationFrame(() => firstModuleElement()?.scrollIntoView({ behavior: 'smooth', block: 'start' })));
      }
      return;
    }

    const languageButton = target.closest<HTMLButtonElement>('button.language');
    if (languageButton && !restoring) {
      requestAnimationFrame(() => requestAnimationFrame(() => {
        const label = document.querySelector('.catalogue-trigger-current')?.textContent?.trim();
        updateUrl(label || undefined, currentLanguage(), 'replace');
      }));
    }
  };

  const onPopState = async () => {
    restoring = true;
    try { await restoreFromUrl(); } finally { restoring = false; }
  };

  document.addEventListener('click', onClick);
  window.addEventListener('popstate', onPopState);
  requestAnimationFrame(() => {
    restoring = true;
    restoreFromUrl().finally(() => { restoring = false; });
  });

  return () => {
    observer.disconnect();
    document.removeEventListener('click', onClick);
    window.removeEventListener('popstate', onPopState);
  };
}
