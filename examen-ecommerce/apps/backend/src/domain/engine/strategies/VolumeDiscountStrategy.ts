import { IDiscountStrategy } from './IDiscountStrategy.js';
import { DiscountContext, StrategyCalculationResult } from '../../types/discount.js';
import { calculatePercentageDiscount, Cents } from '../../types/money.js';

export class VolumeDiscountStrategy implements IDiscountStrategy {
  readonly id = 'VOLUME' as const;
  readonly name = 'Descuento por Volumen (> $100 USD)';
  private readonly thresholdCents: Cents = 10000; // $100.00 USD
  private readonly discountRate = 0.05; // 5%

  calculate(context: DiscountContext): StrategyCalculationResult {
    const eligibleBaseCents = context.currentAdjustedSubtotalCents;

    // Regla estricta: sólo aplica si el subtotal ajustado es ESTRICTAMENTE superior a $100 USD (10,000 centavos)
    const isEligible = eligibleBaseCents > this.thresholdCents;

    const calculatedDiscountCents = isEligible
      ? calculatePercentageDiscount(eligibleBaseCents, this.discountRate)
      : 0;

    return {
      id: this.id,
      name: this.name,
      eligibleBaseCents,
      calculatedDiscountCents,
      appliedDiscountCents: calculatedDiscountCents,
      description: isEligible
        ? `5% aplicado sobre $${(eligibleBaseCents / 100).toFixed(2)} por superar el umbral de $100.00 USD`
        : `No aplica (el subtotal ajustado de $${(eligibleBaseCents / 100).toFixed(2)} no supera estrictamente $100.00 USD)`,
      meta: {
        thresholdCents: this.thresholdCents,
        thresholdMet: isEligible,
        ratePercentage: 5,
      },
    };
  }
}
