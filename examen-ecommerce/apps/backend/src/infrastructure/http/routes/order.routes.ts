import { Router, Request, Response, NextFunction } from 'express';
import { IOrderRepository } from '../../../domain/repositories/IOrderRepository.js';

export function createOrderRouter(orderRepository: IOrderRepository): Router {
  const router = Router();

  router.get('/', async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orders = await orderRepository.findAll();
      res.json({
        success: true,
        data: orders,
      });
    } catch (error) {
      next(error);
    }
  });

  router.get('/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const order = await orderRepository.findById(req.params.id as string);
      if (!order) {
        res.status(404).json({
          success: false,
          error: 'ORDER_NOT_FOUND',
          message: `La orden con ID "${req.params.id}" no fue encontrada.`,
        });
        return;
      }

      res.json({
        success: true,
        data: order,
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
