const currencyFormatter = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  maximumFractionDigits: 0
});

/**
 * Formats a number as a compact dashboard currency value.
 * @param value
 * @returns {string}
 */
export function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

/**
 * Formats a YYYY-MM date key into a readable month label.
 * @param month
 * @returns {string}
 */
export function formatMonth(month: string): string {
  const date = new Date(`${month}-01T00:00:00`);
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}
