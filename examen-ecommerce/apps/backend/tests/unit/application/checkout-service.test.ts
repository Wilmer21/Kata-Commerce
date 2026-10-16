import { describe, it, expect, beforeEach } from 'vitest';
import { CheckoutService, CheckoutError } from '../../../src/application/services/CheckoutService.js';
import { InMemoryProductRepository } from '../../../src/infrastructure/repositories/InMemoryProductRepository.js';
import { InMemoryOrderRepository } from '../../../src/infrastructure/repositories/InMemoryOrderRepository.js';
import { Product } from '../../../src/domain/models/product.js';

const SEED_PRODUCTS: Product[] = [
  {
    id: 'prod-tech',
    name: 'Teclado Gamer',
    category: 'Tecnología',
    priceCents: 10000, // $100.00
    stock: 5,
    description: 'Teclado mecánico',
    imageUrl: 'img',
  },
  {
    id: 'prod-home',
    name: 'Lámpara LED',
    category: 'Hogar',
    priceCents: 5000, // $50.00
    stock: 2,
    description: 'Lámpara',
    imageUrl: 'img',
  },
];

describe('CheckoutService — Orquestador de Aplicación', () => {
  let productRepo: InMemoryProductRepository;
  let orderRepo: InMemoryOrderRepository;
  let service: CheckoutService;

  beforeEach(() => {
    productRepo = new InMemoryProductRepository(SEED_PRODUCTS);
    orderRepo = new InMemoryOrderRepository();
    service = new CheckoutService(productRepo, orderRepo);
  });

  describe('1. Validaciones de Entrada', () => {
    it('debe rechazar carritos vacíos con error EMPTY_CART', async () => {
      await expect(service.processCheckout({ items: [] })).rejects.toThrow(
        new CheckoutError('EMPTY_CART', 'El carrito no contiene productos.')
      );
    });

    it('debe rechazar cantidades menores o iguales a cero con INVALID_QUANTITY', async () => {
      await expect(
        service.processCheckout({
          items: [{ productId: 'prod-tech', quantity: 0 }],
        })
      ).rejects.toThrowError(CheckoutError);

      await expect(
        service.processCheckout({
          items: [{ productId: 'prod-tech', quantity: -2 }],
        })
      ).rejects.toThrowError(CheckoutError);
    });

    it('debe rechazar productos inexistentes con PRODUCT_NOT_FOUND', async () => {
      await expect(
        service.processCheckout({
          items: [{ productId: 'prod-inexistente', quantity: 1 }],
        })
      ).rejects.toThrowError(CheckoutError);
    });
  });

  describe('2. Verificación de Stock y Respaldo Transaccional', () => {
    it('debe rechazar checkout si la cantidad solicitada supera el stock disponible', async () => {
      await expect(
        service.processCheckout({
          items: [{ productId: 'prod-home', quantity: 3 }], // Stock es 2
        })
      ).rejects.toThrowError(/Stock insuficiente/);

      // Verificar que el stock no fue alterado
      const prod = await productRepo.findById('prod-home');
      expect(prod?.stock).toBe(2);

      // Verificar que no se creó ninguna orden
      const orders = await orderRepo.findAll();
      expect(orders.length).toBe(0);
    });

    it('debe agrupar cantidades si se envían ítems repetidos del mismo producto', async () => {
      // prod-home tiene stock 2. Si se mandan dos items de quantity 1, suma 2 (válido)
      const order = await service.processCheckout({
        items: [
          { productId: 'prod-home', quantity: 1 },
          { productId: 'prod-home', quantity: 1 },
        ],
      });

      expect(order.status).toBe('CONFIRMED');
      const prod = await productRepo.findById('prod-home');
      expect(prod?.stock).toBe(0); // 2 - 2
    });
  });

  describe('3. Flujo Exitoso con Cálculo Autoritativo de Precios y Descuentos', () => {
    it('debe procesar checkout exitoso, descontar stock y generar orden con desglose del motor', async () => {
      // prod-tech ($100.00 = 10000 cents), 1 unidad. Cupón WELCOME2E26
      // Subtotal: 10000 cents.
      // Descuento Tecnología (10%): 1000 cents. Subtotal restante: 9000 cents.
      // Descuento Volumen: 9000 <= 10000 -> 0.
      // Descuento Cupón (15% de 9000): 1350 cents.
      // Total calculado = 1000 + 1350 = 2350 cents. (Tope 35% de 10000 = 3500 cents).
      // Total efectivo = 2350 cents. Total a pagar = 10000 - 2350 = 7650 cents ($76.50).
      const order = await service.processCheckout({
        items: [{ productId: 'prod-tech', quantity: 1 }],
        couponCode: 'WELCOME2E26',
      });

      expect(order.status).toBe('CONFIRMED');
      expect(order.items.length).toBe(1);
      expect(order.items[0]?.unitPriceCents).toBe(10000);
      expect(order.summary.originalSubtotalCents).toBe(10000);
      expect(order.summary.totalEffectiveDiscountCents).toBe(2350);
      expect(order.summary.finalTotalCents).toBe(7650);
      expect(order.summary.isCapReached).toBe(false);

      // Verificar que el stock se descontó de 5 a 4
      const prod = await productRepo.findById('prod-tech');
      expect(prod?.stock).toBe(4);

      // Verificar que la orden quedó en el repositorio
      const persisted = await orderRepo.findById(order.id);
      expect(persisted).not.toBeNull();
      expect(persisted?.id).toBe(order.id);
    });
  });

  describe('4. Falla Transaccional Atómica', () => {
    it('debe lanzar CheckoutError TRANSACTION_FAILED si el repositorio falla en la deducción', async () => {
      // Mock de repositorio que simula fallo en decrementStockAtomic
      const mockProductRepo = new InMemoryProductRepository(SEED_PRODUCTS);
      mockProductRepo.decrementStockAtomic = async () => false;

      const failService = new CheckoutService(mockProductRepo, orderRepo);

      await expect(
        failService.processCheckout({
          items: [{ productId: 'prod-tech', quantity: 1 }],
        })
      ).rejects.toThrowError(CheckoutError);

      const orders = await orderRepo.findAll();
      expect(orders.length).toBe(0);
    });
  });
});
