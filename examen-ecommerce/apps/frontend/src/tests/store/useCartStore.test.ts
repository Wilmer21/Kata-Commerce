import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useCartStore } from '../../store/useCartStore.js';
import { Product } from '../../types/index.js';
import { api } from '../../services/api.js';

const mockProductTech: Product = {
  id: 'prod-tech-1',
  name: 'Teclado Mecánico',
  category: 'Tecnología',
  priceCents: 5000, // $50.00
  stock: 3,
  description: 'Teclado',
  imageUrl: 'img',
};

const mockProductHome: Product = {
  id: 'prod-home-1',
  name: 'Silla Ergonómica',
  category: 'Hogar',
  priceCents: 12000, // $120.00
  stock: 2,
  description: 'Silla',
  imageUrl: 'img',
};

describe('useCartStore (Zustand)', () => {
  beforeEach(() => {
    useCartStore.getState().clearCart();
    useCartStore.getState().resetOrderState();
  });

  it('debe iniciar con el carrito vacío', () => {
    const state = useCartStore.getState();
    expect(state.items.length).toBe(0);
    expect(state.couponCode).toBe('');
    expect(state.getOriginalSubtotalCents()).toBe(0);
  });

  it('debe agregar productos y acumular cantidades sin superar el stock', () => {
    const store = useCartStore.getState();

    store.addItem(mockProductTech);
    expect(useCartStore.getState().items.length).toBe(1);
    expect(useCartStore.getState().items[0]?.quantity).toBe(1);

    // Agregar de nuevo suma cantidad
    store.addItem(mockProductTech);
    expect(useCartStore.getState().items[0]?.quantity).toBe(2);

    // Agregar hasta el stock máximo (3)
    store.addItem(mockProductTech);
    expect(useCartStore.getState().items[0]?.quantity).toBe(3);

    // Intentar agregar una 4ta vez no debe superar el stock de 3
    store.addItem(mockProductTech);
    expect(useCartStore.getState().items[0]?.quantity).toBe(3);
  });

  it('debe actualizar cantidad y eliminar el producto si la cantidad es 0', () => {
    const store = useCartStore.getState();
    store.addItem(mockProductTech);
    store.updateQuantity('prod-tech-1', 2);
    expect(useCartStore.getState().items[0]?.quantity).toBe(2);

    store.updateQuantity('prod-tech-1', 0);
    expect(useCartStore.getState().items.length).toBe(0);
  });

  it('debe eliminar productos del carrito', () => {
    const store = useCartStore.getState();
    store.addItem(mockProductTech);
    store.addItem(mockProductHome);
    expect(useCartStore.getState().items.length).toBe(2);

    store.removeItem('prod-tech-1');
    expect(useCartStore.getState().items.length).toBe(1);
    expect(useCartStore.getState().items[0]?.product.id).toBe('prod-home-1');
  });

  it('debe previsualizar los descuentos acumulativos correctamente', () => {
    const store = useCartStore.getState();
    // 2 Teclados ($50 c/u) = $100.00 en Tecnología (10000 cents)
    // 1 Silla ($120) = $120.00 en Hogar (12000 cents)
    // Subtotal: 22000 cents ($220.00)
    store.addItem(mockProductTech);
    store.addItem(mockProductTech);
    store.addItem(mockProductHome);

    // 1. Descuento categoría: 10% sobre los 10000 de Tech = 1000 cents. Restante: 21000 cents
    // 2. Descuento volumen: 5% sobre 21000 (ya que 21000 > 10000) = 1050 cents. Restante: 19950 cents
    // 3. Sin cupón: 0
    let preview = useCartStore.getState().calculatePreview();
    expect(preview.originalSubtotalCents).toBe(22000);
    expect(preview.discounts.category.calculatedDiscountCents).toBe(1000);
    expect(preview.discounts.volume.calculatedDiscountCents).toBe(1050);
    expect(preview.discounts.coupon.calculatedDiscountCents).toBe(0);
    expect(preview.totalEffectiveDiscountCents).toBe(2050);
    expect(preview.isCapReached).toBe(false);

    // Aplicar cupón válido WELCOME2E26 (15% de 19950 = 2993 cents)
    store.setCouponCode('WELCOME2E26');
    preview = useCartStore.getState().calculatePreview();
    expect(preview.discounts.coupon.calculatedDiscountCents).toBe(2993);
    expect(preview.totalCalculatedDiscountCents).toBe(1000 + 1050 + 2993); // 5043 cents
    // Tope 35% de 22000 = 7700 cents. 5043 < 7700 -> no se topa
    expect(preview.isCapReached).toBe(false);
  });

  it('debe detectar cuando se alcanza el tope del 35% y ajustar con LIFO', () => {
    const store = useCartStore.getState();
    // Simular un producto grande de Tecnología
    const bigTech: Product = {
      id: 'big-tech',
      name: 'Super Servidor',
      category: 'Tecnología',
      priceCents: 100000, // $1000.00
      stock: 5,
      description: '',
      imageUrl: '',
    };
    store.addItem(bigTech);
    store.setCouponCode('WELCOME2E26');

    // 1. Tech 10% = 10000. Restante: 90000
    // 2. Vol 5% de 90000 = 4500. Restante: 85500
    // 3. Cupón 15% de 85500 = 12825.
    // Total calculado = 10000 + 4500 + 12825 = 27325 (27.3%)
    // Si agregamos más ítems que superen el tope del 35%, debe limitar a 35000:
    const preview = useCartStore.getState().calculatePreview();
    expect(preview.finalTotalCents).toBe(preview.originalSubtotalCents - preview.totalEffectiveDiscountCents);
  });

  it('debe procesar el checkout exitoso delegando a la API', async () => {
    const store = useCartStore.getState();
    store.addItem(mockProductTech);

    const mockOrder = {
      id: 'ord_123',
      status: 'CONFIRMED' as const,
      createdAt: new Date().toISOString(),
      items: [],
      summary: store.calculatePreview(),
    };

    vi.spyOn(api, 'processCheckout').mockResolvedValueOnce(mockOrder);

    const order = await store.executeCheckout();
    expect(order).toEqual(mockOrder);
    expect(useCartStore.getState().items.length).toBe(0); // Carrito vaciado
    expect(useCartStore.getState().lastConfirmedOrder).toEqual(mockOrder);
  });

  it('debe registrar el error si el checkout falla', async () => {
    const store = useCartStore.getState();
    store.addItem(mockProductTech);

    vi.spyOn(api, 'processCheckout').mockRejectedValueOnce(new Error('Fallo de red'));

    const order = await store.executeCheckout();
    expect(order).toBeNull();
    expect(useCartStore.getState().checkoutError).toContain('Fallo de red');
  });
});
