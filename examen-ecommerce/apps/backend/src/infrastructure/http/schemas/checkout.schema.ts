import { z } from 'zod';

export const checkoutItemSchema = z.object({
  productId: z.string({
    required_error: 'El identificador del producto (productId) es obligatorio',
  }).min(1, 'El identificador del producto no puede estar vacío'),
  quantity: z
    .number({
      required_error: 'La cantidad (quantity) es obligatoria',
    })
    .int('La cantidad debe ser un número entero')
    .positive('La cantidad debe ser estrictamente mayor a 0'),
});

export const checkoutRequestSchema = z.object({
  items: z
    .array(checkoutItemSchema, {
      required_error: 'La lista de ítems (items) es obligatoria',
    })
    .min(1, 'El carrito no puede estar vacío'),
  couponCode: z.string().optional(),
});

export type CheckoutRequestBody = z.infer<typeof checkoutRequestSchema>;
