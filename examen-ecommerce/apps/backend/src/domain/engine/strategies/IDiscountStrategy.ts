import { DiscountContext, DiscountStrategyId, StrategyCalculationResult } from '../../types/discount.js';

/**
 * Contrato formal para el patrón Strategy de descuentos.
 * Cada regla de descuento encapsula su propia lógica de elegibilidad y cálculo monetario.
 */
export interface IDiscountStrategy {
  readonly id: DiscountStrategyId;
  readonly name: string;

  /**
   * Ejecuta el cálculo de la estrategia basándose en el contexto acumulativo actual.
   * Retorna el cálculo potencial (calculatedDiscountCents).
   * La aplicación final puede ser recortada posteriormente por el tope absoluto del 35%.
   */
  calculate(context: DiscountContext): StrategyCalculationResult;
}
