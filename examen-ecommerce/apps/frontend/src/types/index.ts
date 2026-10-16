export type ProductCategory = 'Tecnología' | 'Hogar' | 'Moda' | 'Alimentos' | string;

export interface Product {
  readonly id: string;
  readonly name: string;
  readonly category: ProductCategory;
  readonly priceCents: number;
  readonly stock: number;
  readonly description: string;
  readonly imageUrl: string;
}

export interface CartItem {
  readonly product: Product;
  quantity: number;
}

export type DiscountStrategyId = 'CATEGORY' | 'VOLUME' | 'COUPON';

export interface StrategyCalculationResult {
  readonly id: DiscountStrategyId;
  readonly name: string;
  readonly eligibleBaseCents: number;
  readonly calculatedDiscountCents: number;
  readonly appliedDiscountCents: number;
  readonly description: string;
  readonly meta?: Record<string, unknown>;
}

export interface DiscountEngineResult {
  readonly originalSubtotalCents: number;
  readonly discounts: {
    readonly category: StrategyCalculationResult;
    readonly volume: StrategyCalculationResult;
    readonly coupon: StrategyCalculationResult;
  };
  readonly totalCalculatedDiscountCents: number;
  readonly totalEffectiveDiscountCents: number;
  readonly maxAllowedDiscountCents: number;
  readonly effectiveSavingsPercentage: number;
  readonly isCapReached: boolean;
  readonly finalTotalCents: number;
}

export interface OrderItem {
  readonly productId: string;
  readonly name: string;
  readonly category: ProductCategory;
  readonly unitPriceCents: number;
  readonly quantity: number;
  readonly lineTotalCents: number;
}

export interface Order {
  readonly id: string;
  readonly status: 'CONFIRMED' | 'FAILED';
  readonly createdAt: string;
  readonly items: readonly OrderItem[];
  readonly summary: DiscountEngineResult;
}

export interface CheckoutPayload {
  items: Array<{ productId: string; quantity: number }>;
  couponCode?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  issues?: Array<{ field: string; message: string }>;
}
