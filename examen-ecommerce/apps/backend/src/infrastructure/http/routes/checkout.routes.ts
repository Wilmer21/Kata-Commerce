import { Router, Request, Response, NextFunction } from 'express';
import { CheckoutService } from '../../../application/services/CheckoutService.js';
import { checkoutRequestSchema } from '../schemas/checkout.schema.js';

export function createCheckoutRouter(checkoutService: CheckoutService): Router {
  const router = Router();

  router.post('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // 1. Validar cuerpo de la petición con Zod
      const validatedData = checkoutRequestSchema.parse(req.body);

      // 2. Procesar el checkout a través del servicio de aplicación
      const confirmedOrder = await checkoutService.processCheckout({
        items: validatedData.items,
        couponCode: validatedData.couponCode,
      });

      // 3. Responder con la orden confirmada y código 201 Created
      res.status(201).json({
        success: true,
        data: confirmedOrder,
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
