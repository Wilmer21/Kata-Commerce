import { ApiResponse, CheckoutPayload, Order, Product } from '../types/index.js';

const API_BASE = (import.meta.env && import.meta.env.VITE_API_URL) || '/api';

export class ApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly issues?: Array<{ field: string; message: string }>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  const body: ApiResponse<T> = await response.json();

  if (!response.ok || !body.success) {
    throw new ApiError(
      body.error || `HTTP_${response.status}`,
      body.message || 'Error en la comunicación con el servidor',
      body.issues
    );
  }

  return body.data as T;
}

export const api = {
  /**
   * Obtiene la lista completa de productos disponibles con su stock actualizado.
   */
  async getProducts(): Promise<Product[]> {
    return request<Product[]>('/products');
  },

  /**
   * Envía los ítems del carrito y el cupón para procesar el checkout autoritativo.
   */
  async processCheckout(payload: CheckoutPayload): Promise<Order> {
    return request<Order>('/checkout', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Consulta una orden confirmada por su identificador único.
   */
  async getOrder(id: string): Promise<Order> {
    return request<Order>(`/orders/${id}`);
  },
};
