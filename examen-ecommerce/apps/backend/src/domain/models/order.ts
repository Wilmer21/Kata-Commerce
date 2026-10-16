import { Cents } from '../types/money.js';
import { ProductCategory } from '../types/cart.js';
import { DiscountEngineResult } from '../types/discount.js';

export interface OrderItem {
  readonly productId: string;
  readonly name: string;
  readonly category: ProductCategory;
  readonly unitPriceCents: Cents;
  readonly quantity: number;
  readonly lineTotalCents: Cents;
}

export type OrderStatus = 'CONFIRMED' | 'FAILED';

export interface Order {
  readonly id: string;
  readonly status: OrderStatus;
  readonly createdAt: string;
  readonly items: readonly OrderItem[];
  readonly summary: DiscountEngineResult;
}
