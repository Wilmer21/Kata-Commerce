import { Cents } from './money.js';

export type ProductCategory = 'Tecnología' | 'Hogar' | 'Moda' | 'Alimentos' | string;

export interface CartItem {
  readonly productId: string;
  readonly name: string;
  readonly category: ProductCategory;
  readonly unitPriceCents: Cents;
  readonly quantity: number;
}

/**
 * Calcula el subtotal bruto en centavos de una lista de ítems del carrito.
 */
export function calculateCartSubtotalCents(items: readonly CartItem[]): Cents {
  return items.reduce((total, item) => total + item.unitPriceCents * item.quantity, 0);
}
