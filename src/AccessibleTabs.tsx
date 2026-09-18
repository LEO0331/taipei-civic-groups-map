import { useRef, type KeyboardEvent, type ReactNode } from 'react';

export type AccessibleTabOption<T extends string = string> = readonly [T, ReactNode, ReactNode?];

type AccessibleTabsProps<T extends string> = {
  tabs: readonly AccessibleTabOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
  idPrefix: string;
  className?: string;
  controlsPanel?: boolean;
};

export default function AccessibleTabs<T extends string>({
  tabs,
  value,
  onChange,
  ariaLabel,
  idPrefix,
  className = 'subtabs',
  controlsPanel = false,
}: AccessibleTabsProps<T>) {
  const refs = useRef<Array<HTMLButtonElement | null>>([]);

  const activate = (index: number) => {
    const option = tabs[index];
    if (!option) return;
    onChange(option[0]);
    window.requestAnimationFrame(() => refs.current[index]?.focus());
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next = index;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % tabs.length;
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index - 1 + tabs.length) % tabs.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = tabs.length - 1;
    else return;
    event.preventDefault();
    activate(next);
  };

  return <div className={className} role="tablist" aria-label={ariaLabel} data-accessible-tabs="true">
    {tabs.map(([id, label, marker], index) => {
      const selected = value === id;
      return <button
        key={id}
        ref={(element) => { refs.current[index] = element; }}
        type="button"
        role="tab"
        id={`${idPrefix}-tab-${id}`}
        aria-selected={selected}
        aria-controls={controlsPanel ? `${idPrefix}-panel-${id}` : undefined}
        tabIndex={selected ? 0 : -1}
        className={selected ? 'active' : ''}
        onClick={() => onChange(id)}
        onKeyDown={(event) => onKeyDown(event, index)}
      >
        {marker != null && <span aria-hidden="true">{marker}</span>}
        {label}
      </button>;
    })}
  </div>;
}

export function AccessibleTabPanel<T extends string>({
  idPrefix,
  value,
  children,
  className,
}: {
  idPrefix: string;
  value: T;
  children: ReactNode;
  className?: string;
}) {
  return <div
    className={className}
    role="tabpanel"
    id={`${idPrefix}-panel-${value}`}
    aria-labelledby={`${idPrefix}-tab-${value}`}
    tabIndex={0}
  >
    {children}
  </div>;
}
