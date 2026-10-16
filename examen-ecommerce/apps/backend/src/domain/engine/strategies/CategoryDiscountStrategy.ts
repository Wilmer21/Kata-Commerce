import { IDiscountStrategy } from './IDiscountStrategy.js';
import { DiscountContext, StrategyCalculationResult } from '../../types/discount.js';
import { calculatePercentageDiscount, Cents } from '../../types/money.js';

export class CategoryDiscountStrategy implements IDiscountStrategy {
  readonly id = 'CATEGORY' as const;
  readonly name = 'Descuento de Categoría (Tecnología)';
  private readonly targetCategory = 'tecnología';
  private readonly discountRate = 0.10; // 10%

  calculate(context: DiscountContext): StrategyCalculationResult {
    // Filtrar únicamente los productos de categoría Tecnología
    const techItems = context.items.filter(
      item => item.category.trim().toLowerCase() === this.targetCategory
    );

    const eligibleBaseCents: Cents = techItems.reduce(
      (acc, item) => acc + item.unitPriceCents * item.quantity,
      0
    );

    const calculatedDiscountCents = calculatePercentageDiscount(eligibleBaseCents, this.discountRate);

    return {
      id: this.id,
      name: this.name,
      eligibleBaseCents,
      calculatedDiscountCents,
      appliedDiscountCents: calculatedDiscountCents, // Ajustable por el tope global
      description: eligibleBaseCents > 0
        ? `10% aplicado sobre $${(eligibleBaseCents / 100).toFixed(2)} en productos de Tecnología`
        : 'No aplica (no hay productos de categoría Tecnología en el carrito)',
      meta: {
        itemCount: techItems.reduce((acc, item) => acc + item.quantity, 0),
        ratePercentage: 10,
      },
    };
  }
}
