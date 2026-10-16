import { describe, it, expect } from 'vitest';
import {
  dollarsToCents,
  centsToDollars,
  formatCents,
  calculatePercentageDiscount,
} from '../../../src/domain/types/money.js';

describe('Money Utilities (Precisión en Centavos)', () => {
  it('debe convertir dólares a centavos correctamente redondeando fracciones', () => {
    expect(dollarsToCents(10.5)).toBe(1050);
    expect(dollarsToCents(0.1 + 0.2)).toBe(30); // Previene bug de IEEE 754
    expect(dollarsToCents(99.99)).toBe(9999);
  });

  it('debe convertir centavos a dólares decimales', () => {
    expect(centsToDollars(1050)).toBe(10.5);
    expect(centsToDollars(9999)).toBe(99.99);
    expect(centsToDollars(0)).toBe(0);
  });

  it('debe formatear centavos a string monetario con 2 decimales', () => {
    expect(formatCents(1050)).toBe('$10.50');
    expect(formatCents(5)).toBe('$0.05');
    expect(formatCents(0)).toBe('$0.00');
  });

  it('debe calcular porcentajes y retornar 0 en bases negativas o nulas', () => {
    expect(calculatePercentageDiscount(1000, 0.1)).toBe(100);
    expect(calculatePercentageDiscount(0, 0.1)).toBe(0);
    expect(calculatePercentageDiscount(-500, 0.1)).toBe(0);
    expect(calculatePercentageDiscount(1000, 0)).toBe(0);
  });
});
