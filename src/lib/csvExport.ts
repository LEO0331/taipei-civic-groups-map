const formulaPrefix = /^[\s\p{Cc}\p{Cf}]*[=+@＝＋－＠−-]/u;
const leadingControl = /^[\s\p{Cc}\p{Cf}]*[\t\r\n]/u;
const negativeNumber = /^-\d+(?:\.\d+)?(?:[eE][+-]?\d+)?$/;

export function csvExportCell(value: unknown): string {
  const text = String(value ?? '');
  // Literal negative numbers remain numeric. Other formula-like fields are exported as text.
  const needsText = !negativeNumber.test(text) && (formulaPrefix.test(text) || leadingControl.test(text));
  return '"' + (needsText ? "'" : '') + text.replaceAll('"', '""') + '"';
}
