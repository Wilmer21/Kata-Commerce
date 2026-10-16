import { IProductRepository } from '../../domain/repositories/IProductRepository.js';
import { IOrderRepository } from '../../domain/repositories/IOrderRepository.js';
import { DiscountEngine } from '../../domain/engine/DiscountEngine.js';
import { CartItem } from '../../domain/types/cart.js';
import { Order, OrderItem } from '../../domain/models/order.js';

export interface CheckoutRequestItem {
  readonly productId: string;
  readonly quantity: number;
}

export interface CheckoutRequest {
  readonly items: readonly CheckoutRequestItem[];
  readonly couponCode?: string;
}

export type CheckoutErrorCode =
  | 'EMPTY_CART'
  | 'INVALID_QUANTITY'
  | 'PRODUCT_NOT_FOUND'
  | 'INSUFFICIENT_STOCK'
  | 'TRANSACTION_FAILED';

export class CheckoutError extends Error {
  constructor(
    public readonly code: CheckoutErrorCode,
    message: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'CheckoutError';
  }
}

export class CheckoutService {
  constructor(
    private readonly productRepository: IProductRepository,
    private readonly orderRepository: IOrderRepository,
    private readonly discountEngine: DiscountEngine = new DiscountEngine()
  ) {}

  /**
   * Orquesta el flujo completo de Checkout con validación estricta y consistencia transaccional:
   * 1. Valida estructura del carrito y cantidades positivas.
   * 2. Consulta los productos en la base de datos (garantía de que el backend es la autoridad de precios).
   * 3. Comprueba stock disponible.
   * 4. Ejecuta el motor de descuentos acumulativos con tope del 35%.
   * 5. Descuenta stock atómicamente.
   * 6. Persiste la orden confirmada.
   */
  async processCheckout(request: CheckoutRequest): Promise<Order> {
    // 1. Validar carrito no vacío
    if (!request.items || request.items.length === 0) {
      throw new CheckoutError('EMPTY_CART', 'El carrito no contiene productos.');
    }

    // 2. Validar cantidades válidas (enteros estrictamente mayores a 0)
    for (const item of request.items) {
      if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
        throw new CheckoutError(
          'INVALID_QUANTITY',
          `Cantidad inválida (${item.quantity}) para el producto ${item.productId}. Debe ser un entero positivo.`,
          { productId: item.productId, quantity: item.quantity }
        );
      }
    }

    // Agrupar cantidades si vienen ítems duplicados del mismo producto
    const aggregatedItemsMap = new Map<string, number>();
    for (const item of request.items) {
      const current = aggregatedItemsMap.get(item.productId) ?? 0;
      aggregatedItemsMap.set(item.productId, current + item.quantity);
    }

    const productIds = Array.from(aggregatedItemsMap.keys());

    // 3. Obtener productos de forma autoritativa desde la base de datos
    const productsMap = await this.productRepository.findByIds(productIds);

    // 4. Verificar que todos los productos existan y tengan stock suficiente
    const cartItemsForEngine: CartItem[] = [];
    const orderItems: OrderItem[] = [];
    const stockDeductionPlan: Array<{ productId: string; quantity: number }> = [];

    for (const [productId, requestedQuantity] of aggregatedItemsMap.entries()) {
      const product = productsMap.get(productId);
      if (!product) {
        throw new CheckoutError(
          'PRODUCT_NOT_FOUND',
          `El producto con ID "${productId}" no existe en el catálogo.`,
          { productId }
        );
      }

      if (product.stock < requestedQuantity) {
        throw new CheckoutError(
          'INSUFFICIENT_STOCK',
          `Stock insuficiente para "${product.name}". Solicitado: ${requestedQuantity}, Disponible: ${product.stock}.`,
          {
            productId,
            productName: product.name,
            requested: requestedQuantity,
            available: product.stock,
          }
        );
      }

      // Añadir al contexto del motor de descuentos (usando el precio autoritativo del backend)
      cartItemsForEngine.push({
        productId: product.id,
        name: product.name,
        category: product.category,
        unitPriceCents: product.priceCents,
        quantity: requestedQuantity,
      });

      // Añadir al detalle de la orden
      orderItems.push({
        productId: product.id,
        name: product.name,
        category: product.category,
        unitPriceCents: product.priceCents,
        quantity: requestedQuantity,
        lineTotalCents: product.priceCents * requestedQuantity,
      });

      stockDeductionPlan.push({
        productId: product.id,
        quantity: requestedQuantity,
      });
    }

    // 5. Ejecutar el motor de descuentos
    const discountSummary = this.discountEngine.calculate(
      cartItemsForEngine,
      request.couponCode
    );

    // 6. Aplicar descuento de inventario atómico
    const deductionSuccess = await this.productRepository.decrementStockAtomic(stockDeductionPlan);
    if (!deductionSuccess) {
      throw new CheckoutError(
        'TRANSACTION_FAILED',
        'No fue posible descontar el inventario debido a un cambio concurrente de stock. Por favor, reintente.',
        { items: stockDeductionPlan }
      );
    }

    // 7. Persistir orden confirmada
    const orderId = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const newOrder: Order = {
      id: orderId,
      status: 'CONFIRMED',
      createdAt: new Date().toISOString(),
      items: orderItems,
      summary: discountSummary,
    };

    return this.orderRepository.create(newOrder);
  }
}
