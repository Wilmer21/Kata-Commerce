import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app.js';
import { InMemoryProductRepository } from '../../src/infrastructure/repositories/InMemoryProductRepository.js';
import { InMemoryOrderRepository } from '../../src/infrastructure/repositories/InMemoryOrderRepository.js';
import { Product } from '../../src/domain/models/product.js';

const MOCK_PRODUCTS: Product[] = [
  {
    id: 'prod-tech-1',
    name: 'Teclado Gamer',
    category: 'Tecnología',
    priceCents: 10000, // $100.00
    stock: 5,
    description: 'Teclado pro',
    imageUrl: 'url',
  },
  {
    id: 'prod-home-1',
    name: 'Mesa Madera',
    category: 'Hogar',
    priceCents: 8000, // $80.00
    stock: 2,
    description: 'Mesa',
    imageUrl: 'url',
  },
];

describe('API REST Integration Tests', () => {
  let app: ReturnType<typeof createApp>;
  let productRepo: InMemoryProductRepository;
  let orderRepo: InMemoryOrderRepository;

  beforeEach(() => {
    productRepo = new InMemoryProductRepository(MOCK_PRODUCTS);
    orderRepo = new InMemoryOrderRepository();
    app = createApp({
      productRepository: productRepo,
      orderRepository: orderRepo,
    });
  });

  describe('GET /api/health', () => {
    it('debe responder 200 OK con el estado del servicio', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('OK');
      expect(res.body.service).toBe('kata-ecommerce-backend');
    });
  });

  describe('GET /api/products', () => {
    it('debe listar todos los productos disponibles', async () => {
      const res = await request(app).get('/api/products');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(2);
      expect(res.body.data[0].id).toBe('prod-tech-1');
    });

    it('debe obtener un producto por su ID', async () => {
      const res = await request(app).get('/api/products/prod-tech-1');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Teclado Gamer');
    });

    it('debe responder 404 si el producto no existe', async () => {
      const res = await request(app).get('/api/products/prod-desconocido');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('PRODUCT_NOT_FOUND');
    });
  });

  describe('POST /api/checkout', () => {
    it('debe rechazar con 400 Bad Request si los datos violan el esquema Zod (items vacío)', async () => {
      const res = await request(app).post('/api/checkout').send({
        items: [],
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('VALIDATION_ERROR');
      expect(res.body.issues.length).toBeGreaterThan(0);
    });

    it('debe rechazar con 400 Bad Request si la cantidad es cero o negativa', async () => {
      const res = await request(app).post('/api/checkout').send({
        items: [{ productId: 'prod-tech-1', quantity: -1 }],
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('VALIDATION_ERROR');
    });

    it('debe rechazar con 404 Not Found si se solicita un producto inexistente', async () => {
      const res = await request(app).post('/api/checkout').send({
        items: [{ productId: 'prod-inexistente', quantity: 1 }],
      });

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('PRODUCT_NOT_FOUND');
    });

    it('debe rechazar con 409 Conflict si no hay stock suficiente', async () => {
      const res = await request(app).post('/api/checkout').send({
        items: [{ productId: 'prod-home-1', quantity: 10 }], // Stock es 2
      });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('INSUFFICIENT_STOCK');
    });

    it('debe procesar exitosamente el checkout con código 201 y retornar la orden completa', async () => {
      const res = await request(app).post('/api/checkout').send({
        items: [
          { productId: 'prod-tech-1', quantity: 1 },
          { productId: 'prod-home-1', quantity: 1 },
        ],
        couponCode: 'WELCOME2E26',
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);

      const order = res.body.data;
      expect(order.status).toBe('CONFIRMED');
      expect(order.id).toMatch(/^ord_/);
      expect(order.summary.originalSubtotalCents).toBe(18000); // 10000 + 8000
      expect(order.summary.finalTotalCents).toBeGreaterThan(0);
      expect(order.summary.finalTotalCents).toBe(
        order.summary.originalSubtotalCents - order.summary.totalEffectiveDiscountCents
      );

      // Verificar que el stock de prod-home-1 disminuyó de 2 a 1
      const stockCheck = await request(app).get('/api/products/prod-home-1');
      expect(stockCheck.body.data.stock).toBe(1);
    });
  });

  describe('GET /api/orders y GET /api/orders/:id', () => {
    it('debe consultar órdenes creadas', async () => {
      // 1. Crear una orden
      const checkoutRes = await request(app).post('/api/checkout').send({
        items: [{ productId: 'prod-tech-1', quantity: 1 }],
      });
      const orderId = checkoutRes.body.data.id;

      // 2. Consultar lista
      const listRes = await request(app).get('/api/orders');
      expect(listRes.status).toBe(200);
      expect(listRes.body.data.length).toBe(1);

      // 3. Consultar por ID
      const singleRes = await request(app).get(`/api/orders/${orderId}`);
      expect(singleRes.status).toBe(200);
      expect(singleRes.body.data.id).toBe(orderId);

      // 4. Consultar ID inexistente
      const notFoundRes = await request(app).get('/api/orders/ord-inexistente');
      expect(notFoundRes.status).toBe(404);
      expect(notFoundRes.body.error).toBe('ORDER_NOT_FOUND');
    });
  });
});
