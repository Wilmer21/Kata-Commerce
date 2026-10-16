import { Cents } from './money.js';
import { CartItem } from './cart.js';

export type DiscountStrategyId = 'CATEGORY' | 'VOLUME' | 'COUPON';

export interface StrategyCalculationResult {
  readonly id: DiscountStrategyId;
  readonly name: string;
  readonly eligibleBaseCents: Cents;
  readonly calculatedDiscountCents: Cents;
  readonly appliedDiscountCents: Cents;
  readonly description: string;
  readonly meta?: Record<string, unknown>;
}

export interface DiscountContext {
  readonly items: readonly CartItem[];
  readonly originalSubtotalCents: Cents;
  readonly currentAdjustedSubtotalCents: Cents;
  readonly couponCode?: string;
  readonly previousDiscounts: ReadonlyMap<DiscountStrategyId, StrategyCalculationResult>;
}

export interface DiscountEngineResult {
  readonly originalSubtotalCents: Cents;
  readonly discounts: {
    readonly category: StrategyCalculationResult;
    readonly volume: StrategyCalculationResult;
    readonly coupon: StrategyCalculationResult;
  };
  readonly totalCalculatedDiscountCents: Cents;
  readonly totalEffectiveDiscountCents: Cents;
  readonly maxAllowedDiscountCents: Cents;
  readonly effectiveSavingsPercentage: number;
  readonly isCapReached: boolean;
  readonly finalTotalCents: Cents;
}
