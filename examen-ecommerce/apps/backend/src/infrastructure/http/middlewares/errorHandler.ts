import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { CheckoutError } from '../../../application/services/CheckoutService.js';

export const errorHandler: ErrorRequestHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Manejo de errores de validación de Zod
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: 'VALIDATION_ERROR',
      message: 'Los datos enviados en la solicitud son inválidos.',
      issues: err.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
    return;
  }

  // Manejo de errores de negocio / dominio de Checkout
  if (err instanceof CheckoutError) {
    let statusCode = 400;
    if (err.code === 'PRODUCT_NOT_FOUND') {
      statusCode = 404;
    } else if (err.code === 'INSUFFICIENT_STOCK' || err.code === 'TRANSACTION_FAILED') {
      statusCode = 409; // Conflicto de inventario o concurrencia
    }

    res.status(statusCode).json({
      success: false,
      error: err.code,
      message: err.message,
      details: err.details,
    });
    return;
  }

  // Error genérico no controlado
  console.error('[UnhandledError]', err);
  res.status(500).json({
    success: false,
    error: 'INTERNAL_SERVER_ERROR',
    message: 'Ocurrió un error inesperado en el servidor.',
  });
};
