import express, { Express } from 'express';
import cors from 'cors';
import { IProductRepository } from './domain/repositories/IProductRepository.js';
import { IOrderRepository } from './domain/repositories/IOrderRepository.js';
import { ProductService } from './application/services/ProductService.js';
import { CheckoutService } from './application/services/CheckoutService.js';
import { createProductRouter } from './infrastructure/http/routes/product.routes.js';
import { createCheckoutRouter } from './infrastructure/http/routes/checkout.routes.js';
import { createOrderRouter } from './infrastructure/http/routes/order.routes.js';
import { errorHandler } from './infrastructure/http/middlewares/errorHandler.js';

export interface AppDependencies {
  readonly productRepository: IProductRepository;
  readonly orderRepository: IOrderRepository;
}

export function createApp(dependencies: AppDependencies): Express {
  const app = express();

  // Middlewares globales
  app.use(cors());
  app.use(express.json());

  // Servicios de aplicación
  const productService = new ProductService(dependencies.productRepository);
  const checkoutService = new CheckoutService(
    dependencies.productRepository,
    dependencies.orderRepository
  );

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      service: 'kata-ecommerce-backend',
    });
  });

  // Montar rutas de API
  app.use('/api/products', createProductRouter(productService));
  app.use('/api/checkout', createCheckoutRouter(checkoutService));
  app.use('/api/orders', createOrderRouter(dependencies.orderRepository));

  // Middleware global de errores (debe ir al final)
  app.use(errorHandler);

  return app;
}
