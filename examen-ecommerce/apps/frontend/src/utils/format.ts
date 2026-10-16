/**
 * Formatea un valor en centavos enteros a formato de moneda con 2 decimales ($XX.XX).
 */
export function formatMoney(cents: number): string {
  if (isNaN(cents)) return '$0.00';
  return `$${(cents / 100).toFixed(2)}`;
}

/**
 * Formatea un porcentaje con hasta 2 decimales.
 */
export function formatPercentage(rate: number): string {
  if (isNaN(rate)) return '0%';
  return `${rate.toFixed(1)}%`;
}
