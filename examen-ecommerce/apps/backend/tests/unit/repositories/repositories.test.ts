import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryProductRepository } from '../../../src/infrastructure/repositories/InMemoryProductRepository.js';
import { InMemoryOrderRepository } from '../../../src/infrastructure/repositories/InMemoryOrderRepository.js';
import { SQLiteProductRepository } from '../../../src/infrastructure/repositories/SQLiteProductRepository.js';
import { SQLiteOrderRepository } from '../../../src/infrastructure/repositories/SQLiteOrderRepository.js';
import { createSqliteDatabase } from '../../../src/infrastructure/database/sqlite.js';
import { Product } from '../../../src/domain/models/product.js';
import { Order } from '../../../src/domain/models/order.js';

const TEST_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Teclado Test',
    category: 'Tecnología',
    priceCents: 5000,
    stock: 5,
    description: 'Desc',
    imageUrl: 'img',
  },
  {
    id: 'p2',
    name: 'Mouse Test',
    category: 'Tecnología',
    priceCents: 2500,
    stock: 2,
    description: 'Desc',
    imageUrl: 'img',
  },
];

describe('Repositories — Patrón Repository (InMemory y SQLite)', () => {
  describe('1. InMemoryProductRepository', () => {
    let repo: InMemoryProductRepository;

    beforeEach(() => {
      repo = new InMemoryProductRepository(TEST_PRODUCTS);
    });

    it('debe listar todos los productos y buscar por ID', async () => {
      const all = await repo.findAll();
      expect(all.length).toBe(2);

      const p1 = await repo.findById('p1');
      expect(p1?.name).toBe('Teclado Test');

      const nonExistent = await repo.findById('invalid-id');
      expect(nonExistent).toBeNull();
    });

    it('debe descontar stock atómicamente cuando hay unidades suficientes', async () => {
      const success = await repo.decrementStockAtomic([
        { productId: 'p1', quantity: 2 },
        { productId: 'p2', quantity: 1 },
      ]);

      expect(success).toBe(true);

      const p1 = await repo.findById('p1');
      const p2 = await repo.findById('p2');
      expect(p1?.stock).toBe(3); // 5 - 2
      expect(p2?.stock).toBe(1); // 2 - 1
    });

    it('NO debe modificar el inventario de NINGÚN producto si uno de ellos no tiene stock suficiente (Rollback)', async () => {
      // p1 tiene 5, p2 tiene 2. Pedimos 2 de p1 (posible) y 3 de p2 (imposible).
      const success = await repo.decrementStockAtomic([
        { productId: 'p1', quantity: 2 },
        { productId: 'p2', quantity: 3 }, // Supera el stock de 2
      ]);

      expect(success).toBe(false);

      const p1 = await repo.findById('p1');
      const p2 = await repo.findById('p2');
      expect(p1?.stock).toBe(5); // Intacto
      expect(p2?.stock).toBe(2); // Intacto
    });
  });

  describe('2. SQLiteProductRepository (Transacciones ACID)', () => {
    let repo: SQLiteProductRepository;

    beforeEach(async () => {
      const db = createSqliteDatabase(':memory:');
      repo = new SQLiteProductRepository(db);
      await repo.reset(TEST_PRODUCTS);
    });

    it('debe persistir y consultar productos en SQLite', async () => {
      const all = await repo.findAll();
      expect(all.length).toBe(2);

      const map = await repo.findByIds(['p1', 'p2']);
      expect(map.size).toBe(2);
      expect(map.get('p1')?.stock).toBe(5);
    });

    it('debe ejecutar decremento atómico con ROLLBACK automático ante stock insuficiente en SQLite', async () => {
      const success = await repo.decrementStockAtomic([
        { productId: 'p1', quantity: 3 },
        { productId: 'p2', quantity: 10 }, // Falla
      ]);

      expect(success).toBe(false);

      // Verificamos que p1 NO sufrió decremento parcial
      const p1 = await repo.findById('p1');
      expect(p1?.stock).toBe(5);
    });

    it('debe descontar correctamente cuando la transacción es válida', async () => {
      const success = await repo.decrementStockAtomic([
        { productId: 'p1', quantity: 5 }, // Exactamente suficiente
      ]);

      expect(success).toBe(true);
      const p1 = await repo.findById('p1');
      expect(p1?.stock).toBe(0);
    });
  });

  describe('3. Order Repositories (InMemory y SQLite)', () => {
    const dummyOrder: Order = {
      id: 'ord-test-1',
      status: 'CONFIRMED',
      createdAt: new Date().toISOString(),
      items: [
        {
          productId: 'p1',
          name: 'Teclado Test',
          category: 'Tecnología',
          unitPriceCents: 5000,
          quantity: 1,
          lineTotalCents: 5000,
        },
      ],
      summary: {
        originalSubtotalCents: 5000,
        discounts: {
          category: {
            id: 'CATEGORY',
            name: 'Cat',
            eligibleBaseCents: 5000,
            calculatedDiscountCents: 500,
            appliedDiscountCents: 500,
            description: '',
          },
          volume: {
            id: 'VOLUME',
            name: 'Vol',
            eligibleBaseCents: 4500,
            calculatedDiscountCents: 0,
            appliedDiscountCents: 0,
            description: '',
          },
          coupon: {
            id: 'COUPON',
            name: 'Coup',
            eligibleBaseCents: 4500,
            calculatedDiscountCents: 0,
            appliedDiscountCents: 0,
            description: '',
          },
        },
        totalCalculatedDiscountCents: 500,
        totalEffectiveDiscountCents: 500,
        maxAllowedDiscountCents: 1750,
        effectiveSavingsPercentage: 10,
        isCapReached: false,
        finalTotalCents: 4500,
      },
    };

    it('debe crear y recuperar una orden en InMemoryOrderRepository', async () => {
      const repo = new InMemoryOrderRepository();
      await repo.create(dummyOrder);

      const found = await repo.findById('ord-test-1');
      expect(found).not.toBeNull();
      expect(found?.id).toBe('ord-test-1');
      expect(found?.summary.finalTotalCents).toBe(4500);

      const all = await repo.findAll();
      expect(all.length).toBe(1);

      await repo.reset();
      expect((await repo.findAll()).length).toBe(0);
    });

    it('debe crear y recuperar una orden en SQLiteOrderRepository serializando JSON', async () => {
      const db = createSqliteDatabase(':memory:');
      const repo = new SQLiteOrderRepository(db);

      await repo.create(dummyOrder);
      const found = await repo.findById('ord-test-1');

      expect(found?.id).toBe('ord-test-1');
      expect(found?.items[0]?.name).toBe('Teclado Test');
      expect(found?.summary.isCapReached).toBe(false);

      const all = await repo.findAll();
      expect(all.length).toBe(1);

      await repo.reset();
      expect((await repo.findAll()).length).toBe(0);
    });
  });
});
