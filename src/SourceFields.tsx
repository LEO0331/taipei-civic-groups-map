type SourceFieldsProps = { fields: Record<string, unknown> };

export default function SourceFields({ fields }: SourceFieldsProps) {
  return <dl className="source-fields">{Object.entries(fields).map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value === null || value === undefined || value === '' ? '—' : String(value)}</dd></div>)}</dl>;
}
