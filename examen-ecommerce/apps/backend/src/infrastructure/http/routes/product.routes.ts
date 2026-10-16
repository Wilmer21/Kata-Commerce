import { Router, Request, Response, NextFunction } from 'express';
import { ProductService } from '../../../application/services/ProductService.js';

export function createProductRouter(productService: ProductService): Router {
  const router = Router();

  router.get('/', async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const products = await productService.getAllProducts();
      res.json({
        success: true,
        data: products,
      });
    } catch (error) {
      next(error);
    }
  });

  router.get('/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const product = await productService.getProductById(req.params.id as string);
      if (!product) {
        res.status(404).json({
          success: false,
          error: 'PRODUCT_NOT_FOUND',
          message: `El producto con ID "${req.params.id}" no fue encontrado.`,
        });
        return;
      }

      res.json({
        success: true,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
