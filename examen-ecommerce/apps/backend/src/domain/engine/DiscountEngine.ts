import { CartItem, calculateCartSubtotalCents } from '../types/cart.js';
import { Cents, calculatePercentageDiscount } from '../types/money.js';
import {
  DiscountContext,
  DiscountEngineResult,
  DiscountStrategyId,
  StrategyCalculationResult,
} from '../types/discount.js';
import { IDiscountStrategy } from './strategies/IDiscountStrategy.js';
import { CategoryDiscountStrategy } from './strategies/CategoryDiscountStrategy.js';
import { VolumeDiscountStrategy } from './strategies/VolumeDiscountStrategy.js';
import { CouponDiscountStrategy } from './strategies/CouponDiscountStrategy.js';

export class DiscountEngine {
  private readonly maxDiscountRate = 0.35; // Tope absoluto del 35%
  private readonly categoryStrategy: IDiscountStrategy;
  private readonly volumeStrategy: IDiscountStrategy;
  private readonly couponStrategy: IDiscountStrategy;

  constructor(
    categoryStrategy?: IDiscountStrategy,
    volumeStrategy?: IDiscountStrategy,
    couponStrategy?: IDiscountStrategy
  ) {
    this.categoryStrategy = categoryStrategy ?? new CategoryDiscountStrategy();
    this.volumeStrategy = volumeStrategy ?? new VolumeDiscountStrategy();
    this.couponStrategy = couponStrategy ?? new CouponDiscountStrategy();
  }

  /**
   * Ejecuta la cascada acumulativa de descuentos respetando precedencia y el tope del 35%.
   */
  public calculate(items: readonly CartItem[], couponCode?: string): DiscountEngineResult {
    const originalSubtotalCents = calculateCartSubtotalCents(items);

    if (originalSubtotalCents <= 0) {
      return this.createEmptyResult();
    }

    const previousDiscounts = new Map<DiscountStrategyId, StrategyCalculationResult>();

    // 1. Regla 1: Categoría (Tecnología 10%)
    const categoryContext: DiscountContext = {
      items,
      originalSubtotalCents,
      currentAdjustedSubtotalCents: originalSubtotalCents,
      couponCode,
      previousDiscounts,
    };
    const categoryResult = this.categoryStrategy.calculate(categoryContext);
    previousDiscounts.set('CATEGORY', categoryResult);

    // 2. Regla 2: Volumen (5% sobre subtotal ajustado si > 100 USD)
    const adjustedAfterCategory = originalSubtotalCents - categoryResult.calculatedDiscountCents;
    const volumeContext: DiscountContext = {
      items,
      originalSubtotalCents,
      currentAdjustedSubtotalCents: adjustedAfterCategory,
      couponCode,
      previousDiscounts,
    };
    const volumeResult = this.volumeStrategy.calculate(volumeContext);
    previousDiscounts.set('VOLUME', volumeResult);

    // 3. Regla 3: Cupón (15% sobre subtotal restante tras volumen si WELCOME2E26)
    const adjustedAfterVolume = adjustedAfterCategory - volumeResult.calculatedDiscountCents;
    const couponContext: DiscountContext = {
      items,
      originalSubtotalCents,
      currentAdjustedSubtotalCents: adjustedAfterVolume,
      couponCode,
      previousDiscounts,
    };
    const couponResult = this.couponStrategy.calculate(couponContext);
    previousDiscounts.set('COUPON', couponResult);

    // 4. Regla 4: Tope Absoluto del 35% y resolución LIFO
    const totalCalculatedDiscountCents =
      categoryResult.calculatedDiscountCents +
      volumeResult.calculatedDiscountCents +
      couponResult.calculatedDiscountCents;

    const maxAllowedDiscountCents = calculatePercentageDiscount(
      originalSubtotalCents,
      this.maxDiscountRate
    );

    const isCapReached =
      originalSubtotalCents > 0 && totalCalculatedDiscountCents >= maxAllowedDiscountCents;

    const totalEffectiveDiscountCents = Math.min(
      totalCalculatedDiscountCents,
      maxAllowedDiscountCents
    );

    // Distribución LIFO del recorte (el cupón absorbe primero, luego volumen, luego categoría)
    const { appliedCategory, appliedVolume, appliedCoupon } = this.distributeCapLIFO(
      categoryResult,
      volumeResult,
      couponResult,
      totalCalculatedDiscountCents,
      maxAllowedDiscountCents
    );

    const finalTotalCents = originalSubtotalCents - totalEffectiveDiscountCents;
    const effectiveSavingsPercentage = Number(
      ((totalEffectiveDiscountCents / originalSubtotalCents) * 100).toFixed(2)
    );

    return {
      originalSubtotalCents,
      discounts: {
        category: appliedCategory,
        volume: appliedVolume,
        coupon: appliedCoupon,
      },
      totalCalculatedDiscountCents,
      totalEffectiveDiscountCents,
      maxAllowedDiscountCents,
      effectiveSavingsPercentage,
      isCapReached,
      finalTotalCents,
    };
  }

  private distributeCapLIFO(
    cat: StrategyCalculationResult,
    vol: StrategyCalculationResult,
    coup: StrategyCalculationResult,
    totalCalculated: Cents,
    maxAllowed: Cents
  ) {
    if (totalCalculated <= maxAllowed) {
      return {
        appliedCategory: cat,
        appliedVolume: vol,
        appliedCoupon: coup,
      };
    }

    let excess = totalCalculated - maxAllowed;

    // 1. Recortar primero de Cupón
    const couponReduction = Math.min(coup.calculatedDiscountCents, excess);
    const coupAppliedCents = coup.calculatedDiscountCents - couponReduction;
    excess -= couponReduction;

    // 2. Si aún hay exceso, recortar de Volumen
    const volumeReduction = Math.min(vol.calculatedDiscountCents, excess);
    const volAppliedCents = vol.calculatedDiscountCents - volumeReduction;
    excess -= volumeReduction;

    // 3. Si aún hay exceso, recortar de Categoría
    const categoryReduction = Math.min(cat.calculatedDiscountCents, excess);
    const catAppliedCents = cat.calculatedDiscountCents - categoryReduction;

    const appliedCoupon: StrategyCalculationResult = {
      ...coup,
      appliedDiscountCents: coupAppliedCents,
      description:
        couponReduction > 0
          ? `${coup.description} (ajustado por límite máximo del 35%: -$${(couponReduction / 100).toFixed(2)})`
          : coup.description,
    };

    const appliedVolume: StrategyCalculationResult = {
      ...vol,
      appliedDiscountCents: volAppliedCents,
      description:
        volumeReduction > 0
          ? `${vol.description} (ajustado por límite máximo del 35%: -$${(volumeReduction / 100).toFixed(2)})`
          : vol.description,
    };

    const appliedCategory: StrategyCalculationResult = {
      ...cat,
      appliedDiscountCents: catAppliedCents,
      description:
        categoryReduction > 0
          ? `${cat.description} (ajustado por límite máximo del 35%: -$${(categoryReduction / 100).toFixed(2)})`
          : cat.description,
    };

    return { appliedCategory, appliedVolume, appliedCoupon };
  }

  private createEmptyResult(): DiscountEngineResult {
    const emptyStrategy = (id: DiscountStrategyId, name: string): StrategyCalculationResult => ({
      id,
      name,
      eligibleBaseCents: 0,
      calculatedDiscountCents: 0,
      appliedDiscountCents: 0,
      description: 'Carrito vacío',
    });

    return {
      originalSubtotalCents: 0,
      discounts: {
        category: emptyStrategy('CATEGORY', 'Descuento de Categoría'),
        volume: emptyStrategy('VOLUME', 'Descuento por Volumen'),
        coupon: emptyStrategy('COUPON', 'Descuento por Cupón'),
      },
      totalCalculatedDiscountCents: 0,
      totalEffectiveDiscountCents: 0,
      maxAllowedDiscountCents: 0,
      effectiveSavingsPercentage: 0,
      isCapReached: false,
      finalTotalCents: 0,
    };
  }
}
