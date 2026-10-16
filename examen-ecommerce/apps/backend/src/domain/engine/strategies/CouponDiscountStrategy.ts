import { IDiscountStrategy } from './IDiscountStrategy.js';
import { DiscountContext, StrategyCalculationResult } from '../../types/discount.js';
import { calculatePercentageDiscount } from '../../types/money.js';

export class CouponDiscountStrategy implements IDiscountStrategy {
  readonly id = 'COUPON' as const;
  readonly name = 'Descuento por Cupón Promocional';
  private readonly validCouponCode = 'WELCOME2E26';
  private readonly discountRate = 0.15; // 15%

  calculate(context: DiscountContext): StrategyCalculationResult {
    const rawCoupon = context.couponCode?.trim().toUpperCase();
    const isCouponProvided = Boolean(rawCoupon);
    const isValid = rawCoupon === this.validCouponCode;
    const eligibleBaseCents = context.currentAdjustedSubtotalCents;

    const calculatedDiscountCents = isValid && eligibleBaseCents > 0
      ? calculatePercentageDiscount(eligibleBaseCents, this.discountRate)
      : 0;

    let description = 'No se aplicó cupón';
    if (isCouponProvided) {
      if (isValid) {
        description = `15% aplicado sobre $${(eligibleBaseCents / 100).toFixed(2)} con cupón ${this.validCouponCode}`;
      } else {
        description = `Cupón "${rawCoupon}" no es válido o ha expirado`;
      }
    }

    return {
      id: this.id,
      name: this.name,
      eligibleBaseCents,
      calculatedDiscountCents,
      appliedDiscountCents: calculatedDiscountCents,
      description,
      meta: {
        providedCode: rawCoupon || null,
        isValid,
        ratePercentage: 15,
      },
    };
  }
}
