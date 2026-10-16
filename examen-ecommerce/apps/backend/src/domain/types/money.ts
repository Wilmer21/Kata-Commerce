/**
 * Utilidades de precisión monetaria para Kata-Commerce.
 * Todo importe monetario se maneja como entero en centavos para erradicar
 * inconsistencias de punto flotante de JavaScript (IEEE 754).
 */

export type Cents = number;

/**
 * Convierte un monto en dólares/unidades a centavos enteros redondeados.
 */
export function dollarsToCents(dollars: number): Cents {
  return Math.round(dollars * 100);
}

/**
 * Convierte centavos a formato decimal de dólares.
 */
export function centsToDollars(cents: Cents): number {
  return cents / 100;
}

/**
 * Formatea centavos a string legible (ej. 10050 -> "$100.50").
 */
export function formatCents(cents: Cents): string {
  return `$${(cents / 100).toFixed(2)}`;
}

/**
 * Calcula un porcentaje entero de centavos sobre una base en centavos.
 * Utiliza Math.round para garantizar consistencia en el redondeo al centavo más cercano.
 */
export function calculatePercentageDiscount(baseCents: Cents, rate: number): Cents {
  if (baseCents <= 0 || rate <= 0) return 0;
  return Math.round(baseCents * rate);
}
