import type { ReactNode } from 'react';
import type { UiFamily } from './lib/uiFamilies';

export function DatasetFamilyFrame({
  family,
  children,
  className = 'workspace',
}: {
  family: UiFamily;
  children: ReactNode;
  className?: string;
}) {
  return <section className={`${className} dataset-family-frame`} data-ui-family={family}>{children}</section>;
}

export function DatasetFamilyHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return <div className="section-heading dataset-family-heading">
    {eyebrow && <p>{eyebrow}</p>}
    <h2>{title}</h2>
    {description && <span>{description}</span>}
  </div>;
}
