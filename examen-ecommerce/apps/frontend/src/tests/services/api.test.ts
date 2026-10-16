import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { api, ApiError } from '../../services/api.js';

describe('API Client Service', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('debe obtener la lista de productos con éxito', async () => {
    const mockProducts = [{ id: 'p1', name: 'Prod 1' }];
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: mockProducts }),
    });

    const products = await api.getProducts();
    expect(products).toEqual(mockProducts);
    expect(global.fetch).toHaveBeenCalledWith('/api/products', expect.any(Object));
  });

  it('debe procesar el checkout con éxito', async () => {
    const mockOrder = { id: 'ord_1', status: 'CONFIRMED' };
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: mockOrder }),
    });

    const order = await api.processCheckout({ items: [{ productId: 'p1', quantity: 1 }] });
    expect(order).toEqual(mockOrder);
  });

  it('debe consultar una orden por ID', async () => {
    const mockOrder = { id: 'ord_1', status: 'CONFIRMED' };
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: mockOrder }),
    });

    const order = await api.getOrder('ord_1');
    expect(order).toEqual(mockOrder);
  });

  it('debe lanzar ApiError si el servidor responde con error', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 409,
      json: async () => ({
        success: false,
        error: 'INSUFFICIENT_STOCK',
        message: 'No hay stock suficiente',
      }),
    });

    await expect(
      api.processCheckout({ items: [{ productId: 'p1', quantity: 99 }] })
    ).rejects.toThrowError(ApiError);
  });
});
