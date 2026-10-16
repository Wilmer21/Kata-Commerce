import { describe, it, expect, beforeEach } from 'vitest';
import { DiscountEngine } from '../../../src/domain/engine/DiscountEngine.js';
import { CartItem } from '../../../src/domain/types/cart.js';
import { dollarsToCents } from '../../../src/domain/types/money.js';

describe('DiscountEngine — Cascada de Descuentos Acumulativos', () => {
  let engine: DiscountEngine;

  beforeEach(() => {
    engine = new DiscountEngine();
  });

  describe('1. Caso Carrito Vacío', () => {
    it('debe retornar totales en cero y ningún descuento activo si el carrito está vacío', () => {
      const result = engine.calculate([]);

      expect(result.originalSubtotalCents).toBe(0);
      expect(result.totalCalculatedDiscountCents).toBe(0);
      expect(result.totalEffectiveDiscountCents).toBe(0);
      expect(result.finalTotalCents).toBe(0);
      expect(result.effectiveSavingsPercentage).toBe(0);
      expect(result.isCapReached).toBe(false);
    });
  });

  describe('2. Regla 1: Descuento de Categoría (Tecnología 10%)', () => {
    it('debe aplicar 10% únicamente a productos de categoría Tecnología', () => {
      const items: CartItem[] = [
        {
          productId: 'prod-tech',
          name: 'Auriculares Bluetooth',
          category: 'Tecnología',
          unitPriceCents: dollarsToCents(50), // $50.00
          quantity: 1,
        },
        {
          productId: 'prod-home',
          name: 'Lámpara de Mesa',
          category: 'Hogar',
          unitPriceCents: dollarsToCents(30), // $30.00
          quantity: 1,
        },
      ];

      const result = engine.calculate(items);

      // Subtotal: $80.00 (8000 cents)
      expect(result.originalSubtotalCents).toBe(8000);
      // Solo el item de tecnología ($50.00 = 5000 cents) recibe 10% = 500 cents ($5.00)
      expect(result.discounts.category.eligibleBaseCents).toBe(5000);
      expect(result.discounts.category.calculatedDiscountCents).toBe(500);
      expect(result.discounts.category.appliedDiscountCents).toBe(500);

      // Volumen no aplica porque $80 - $5 = $75 <= $100
      expect(result.discounts.volume.calculatedDiscountCents).toBe(0);
      // Cupón no enviado
      expect(result.discounts.coupon.calculatedDiscountCents).toBe(0);

      expect(result.totalEffectiveDiscountCents).toBe(500);
      expect(result.finalTotalCents).toBe(7500); // $75.00
      expect(result.isCapReached).toBe(false);
    });

    it('no debe aplicar descuento de categoría si no hay productos de Tecnología', () => {
      const items: CartItem[] = [
        {
          productId: 'prod-fashion',
          name: 'Camisa Formal',
          category: 'Moda',
          unitPriceCents: dollarsToCents(80),
          quantity: 1,
        },
      ];

      const result = engine.calculate(items);
      expect(result.discounts.category.calculatedDiscountCents).toBe(0);
      expect(result.discounts.category.eligibleBaseCents).toBe(0);
    });
  });

  describe('3. Regla 2: Descuento por Volumen (> $100 USD / 10,000 centavos)', () => {
    it('NO debe aplicar descuento por volumen si el subtotal ajustado es exactamente $100.00 USD (10000 cents)', () => {
      // Carrito con $100.00 en productos no tecnológicos
      const items: CartItem[] = [
        {
          productId: 'prod-home',
          name: 'Silla',
          category: 'Hogar',
          unitPriceCents: 10000, // Exactamente $100.00
          quantity: 1,
        },
      ];

      const result = engine.calculate(items);

      expect(result.originalSubtotalCents).toBe(10000);
      expect(result.discounts.category.calculatedDiscountCents).toBe(0);
      // Subtotal ajustado es 10000, la regla exige ESTRICTAMENTE SUPERIOR (> 100)
      expect(result.discounts.volume.calculatedDiscountCents).toBe(0);
      expect(result.finalTotalCents).toBe(10000);
    });

    it('SÍ debe aplicar 5% si el subtotal ajustado es estrictamente mayor a $100.00 USD ($100.01)', () => {
      const items: CartItem[] = [
        {
          productId: 'prod-home',
          name: 'Escritorio',
          category: 'Hogar',
          unitPriceCents: 10001, // $100.01 (10001 centavos)
          quantity: 1,
        },
      ];

      const result = engine.calculate(items);

      expect(result.originalSubtotalCents).toBe(10001);
      // 5% de 10001 centavos = 500.05 -> Math.round = 500 centavos ($5.00)
      expect(result.discounts.volume.calculatedDiscountCents).toBe(500);
      expect(result.finalTotalCents).toBe(10001 - 500);
    });

    it('debe evaluar el umbral de volumen DESPUÉS de restar el descuento de categoría', () => {
      // Subtotal bruto: $110.00 en Tecnología (11000 cents)
      // Descuento Tecnología (10%): $11.00 (1100 cents)
      // Subtotal ajustado para volumen: $110.00 - $11.00 = $99.00 (9900 cents)
      // Como $99.00 <= $100.00, el descuento de volumen NO DEBE APLICAR
      const items: CartItem[] = [
        {
          productId: 'prod-tech',
          name: 'Monitor',
          category: 'Tecnología',
          unitPriceCents: 11000,
          quantity: 1,
        },
      ];

      const result = engine.calculate(items);

      expect(result.originalSubtotalCents).toBe(11000);
      expect(result.discounts.category.calculatedDiscountCents).toBe(1100);
      expect(result.discounts.volume.eligibleBaseCents).toBe(9900);
      expect(result.discounts.volume.calculatedDiscountCents).toBe(0);
    });
  });

  describe('4. Regla 3: Descuento por Cupón (WELCOME2E26 - 15%)', () => {
    it('debe aplicar 15% sobre el subtotal restante tras categoría y volumen', () => {
      // Subtotal: $200.00 en Hogar (20000 cents)
      // Categoría: $0
      // Volumen (5% de 20000): $10.00 (1000 cents)
      // Subtotal restante: $190.00 (19000 cents)
      // Cupón (15% de 19000): $28.50 (2850 cents)
      const items: CartItem[] = [
        {
          productId: 'prod-home',
          name: 'Mueble',
          category: 'Hogar',
          unitPriceCents: 20000,
          quantity: 1,
        },
      ];

      const result = engine.calculate(items, 'WELCOME2E26');

      expect(result.discounts.volume.calculatedDiscountCents).toBe(1000);
      expect(result.discounts.coupon.eligibleBaseCents).toBe(19000);
      expect(result.discounts.coupon.calculatedDiscountCents).toBe(2850);
      expect(result.discounts.coupon.meta?.isValid).toBe(true);
    });

    it('debe validar cupón ignorando mayúsculas/minúsculas y espacios en blanco', () => {
      const items: CartItem[] = [
        {
          productId: 'prod-home',
          name: 'Mueble',
          category: 'Hogar',
          unitPriceCents: 10000,
          quantity: 1,
        },
      ];

      const resultLower = engine.calculate(items, '  welcome2e26  ');
      expect(resultLower.discounts.coupon.calculatedDiscountCents).toBe(1500); // 15% de 10000
    });

    it('no debe aplicar descuento con cupón incorrecto o ausente', () => {
      const items: CartItem[] = [
        {
          productId: 'prod-home',
          name: 'Mueble',
          category: 'Hogar',
          unitPriceCents: 10000,
          quantity: 1,
        },
      ];

      const resultInvalid = engine.calculate(items, 'CUPON_FALSO');
      expect(resultInvalid.discounts.coupon.calculatedDiscountCents).toBe(0);
      expect(resultInvalid.discounts.coupon.meta?.isValid).toBe(false);

      const resultEmpty = engine.calculate(items, undefined);
      expect(resultEmpty.discounts.coupon.calculatedDiscountCents).toBe(0);
    });
  });

  describe('5. Regla 4: Límite Absoluto del 35% y Distribución LIFO', () => {
    it('debe permitir todos los descuentos calculados si la suma está por debajo del 35%', () => {
      // Subtotal: $150.00 en Tecnología (15000 cents)
      // 1. Categoría (10% de 15000) = 1500 ($15.00). Restante: 13500 ($135.00)
      // 2. Volumen (5% de 13500) = 675 ($6.75). Restante: 12825 ($128.25)
      // Total calculado sin cupón = 1500 + 675 = 2175 ($21.75)
      // Tope 35% de 15000 = 5250 ($52.50)
      // 2175 < 5250 -> Todos aplican íntegros
      const items: CartItem[] = [
        {
          productId: 'prod-tech',
          name: 'Tablet',
          category: 'Tecnología',
          unitPriceCents: 15000,
          quantity: 1,
        },
      ];

      const result = engine.calculate(items);

      expect(result.totalCalculatedDiscountCents).toBe(2175);
      expect(result.totalEffectiveDiscountCents).toBe(2175);
      expect(result.discounts.category.appliedDiscountCents).toBe(1500);
      expect(result.discounts.volume.appliedDiscountCents).toBe(675);
      expect(result.isCapReached).toBe(false);
      expect(result.finalTotalCents).toBe(15000 - 2175);
    });

    it('debe recortar con LIFO sobre el cupón cuando los descuentos acumulados superan el 35%', () => {
      // Simulamos un carrito con alto valor en Tecnología + Volumen + Cupón:
      // Subtotal: $1000.00 (100,000 cents) en Tecnología
      // 1. Categoría (10% de 100,000) = 10,000 cents ($100.00). Subtotal aj: 90,000 cents
      // 2. Volumen (5% de 90,000) = 4,500 cents ($45.00). Subtotal aj: 85,500 cents
      // 3. Cupón (15% de 85,500) = 12,825 cents ($128.25)
      // Suma calculada = 10,000 + 4,500 + 12,825 = 27,325 cents ($273.25 = 27.325%) -> No supera 35%.
      // Para forzar la superación del 35%, inyectamos una estrategia o armamos un caso donde la suma supere 35%:
      // Por ejemplo, usando un subtotal donde los descuentos sumados excedan 35% o inyectando estrategias mock.
      // Verifiquemos primero con un caso mockeado que garantice el exceso:
      const mockVolumeStrategy = {
        id: 'VOLUME' as const,
        name: 'Mock Big Volume',
        calculate: () => ({
          id: 'VOLUME' as const,
          name: 'Mock Big Volume',
          eligibleBaseCents: 100000,
          calculatedDiscountCents: 20000, // 20%
          appliedDiscountCents: 20000,
          description: 'Mock 20%',
        }),
      };

      const mockCouponStrategy = {
        id: 'COUPON' as const,
        name: 'Mock Big Coupon',
        calculate: () => ({
          id: 'COUPON' as const,
          name: 'Mock Big Coupon',
          eligibleBaseCents: 100000,
          calculatedDiscountCents: 15000, // 15%
          appliedDiscountCents: 15000,
          description: 'Mock 15%',
        }),
      };

      const customEngine = new DiscountEngine(undefined, mockVolumeStrategy, mockCouponStrategy);

      // Carrito con $1000.00 en Tecnología (100,000 cents)
      // 1. Categoría: 10% = 10,000 cents
      // 2. Mock Volumen: 20,000 cents
      // 3. Mock Cupón: 15,000 cents
      // Total calculado = 10,000 + 20,000 + 15,000 = 45,000 cents (45%)
      // Tope 35% de 100,000 = 35,000 cents
      // Exceso = 10,000 cents.
      // Distribución LIFO:
      // - Cupón calculado: 15,000 -> absorbe los 10,000 de exceso -> Cupón aplicado: 5,000 cents
      // - Volumen aplicado: 20,000 cents íntegros
      // - Categoría aplicada: 10,000 cents íntegros
      const items: CartItem[] = [
        {
          productId: 'prod-tech',
          name: 'Laptop Gamer',
          category: 'Tecnología',
          unitPriceCents: 100000,
          quantity: 1,
        },
      ];

      const result = customEngine.calculate(items, 'WELCOME2E26');

      expect(result.originalSubtotalCents).toBe(100000);
      expect(result.totalCalculatedDiscountCents).toBe(45000);
      expect(result.maxAllowedDiscountCents).toBe(35000);
      expect(result.totalEffectiveDiscountCents).toBe(35000); // Exactamente 35%
      expect(result.isCapReached).toBe(true);

      // Verificación LIFO:
      expect(result.discounts.category.appliedDiscountCents).toBe(10000);
      expect(result.discounts.volume.appliedDiscountCents).toBe(20000);
      expect(result.discounts.coupon.calculatedDiscountCents).toBe(15000);
      expect(result.discounts.coupon.appliedDiscountCents).toBe(5000); // 15000 - 10000 de exceso
      expect(result.discounts.coupon.description).toContain('ajustado por límite máximo del 35%');

      // Total a pagar
      expect(result.finalTotalCents).toBe(65000); // 100000 - 35000
      expect(result.effectiveSavingsPercentage).toBe(35.0);
    });

    it('debe recortar de volumen si el exceso supera todo el cupón', () => {
      // Total calculado: Categoría 10,000 + Volumen 25,000 + Cupón 5,000 = 40,000 (Tope 35,000). Exceso = 5,000.
      // Si el exceso fuera 8,000:
      // Cupón 5,000 se reduce a 0.
      // Quedan 3,000 de exceso que se descuentan de Volumen: 25,000 - 3,000 = 22,000.
      const mockCatStrategy = {
        id: 'CATEGORY' as const,
        name: 'Mock Cat',
        calculate: () => ({
          id: 'CATEGORY' as const,
          name: 'Mock Cat',
          eligibleBaseCents: 100000,
          calculatedDiscountCents: 10000,
          appliedDiscountCents: 10000,
          description: '',
        }),
      };
      const mockVolStrategy = {
        id: 'VOLUME' as const,
        name: 'Mock Vol',
        calculate: () => ({
          id: 'VOLUME' as const,
          name: 'Mock Vol',
          eligibleBaseCents: 100000,
          calculatedDiscountCents: 28000,
          appliedDiscountCents: 28000,
          description: '',
        }),
      };
      const mockCoupStrategy = {
        id: 'COUPON' as const,
        name: 'Mock Coup',
        calculate: () => ({
          id: 'COUPON' as const,
          name: 'Mock Coup',
          eligibleBaseCents: 100000,
          calculatedDiscountCents: 5000,
          appliedDiscountCents: 5000,
          description: '',
        }),
      };

      const customEngine = new DiscountEngine(mockCatStrategy, mockVolStrategy, mockCoupStrategy);
      const items: CartItem[] = [
        { productId: 'p1', name: 'P1', category: 'General', unitPriceCents: 100000, quantity: 1 },
      ];

      const result = customEngine.calculate(items);
      // Calculado: 10000 + 28000 + 5000 = 43000. Max: 35000. Exceso = 8000.
      // Cupón absorbe 5000 (queda en 0). Exceso restante: 3000.
      // Volumen absorbe 3000 (28000 - 3000 = 25000).
      // Categoría intacta (10000).
      // Total aplicado = 10000 + 25000 + 0 = 35000.
      expect(result.discounts.coupon.appliedDiscountCents).toBe(0);
      expect(result.discounts.volume.appliedDiscountCents).toBe(25000);
      expect(result.discounts.category.appliedDiscountCents).toBe(10000);
      expect(result.totalEffectiveDiscountCents).toBe(35000);
      expect(result.isCapReached).toBe(true);
    });
  });

  describe('6. Invariantes Matemáticos y Redondeo de Centavos', () => {
    it('siempre debe cumplir la ecuación fundamental: finalTotalCents === originalSubtotalCents - totalEffectiveDiscountCents', () => {
      const testCases: CartItem[][] = [
        [
          { productId: '1', name: 'Item 1', category: 'Tecnología', unitPriceCents: 3333, quantity: 3 },
          { productId: '2', name: 'Item 2', category: 'Hogar', unitPriceCents: 1499, quantity: 2 },
        ],
        [
          { productId: '3', name: 'Item 3', category: 'Moda', unitPriceCents: 7999, quantity: 1 },
        ],
        [
          { productId: '4', name: 'Item 4', category: 'Tecnología', unitPriceCents: 50000, quantity: 2 },
        ],
      ];

      for (const items of testCases) {
        const withoutCoupon = engine.calculate(items);
        expect(withoutCoupon.finalTotalCents).toBe(
          withoutCoupon.originalSubtotalCents - withoutCoupon.totalEffectiveDiscountCents
        );

        const withCoupon = engine.calculate(items, 'WELCOME2E26');
        expect(withCoupon.finalTotalCents).toBe(
          withCoupon.originalSubtotalCents - withCoupon.totalEffectiveDiscountCents
        );
      }
    });
  });
});
