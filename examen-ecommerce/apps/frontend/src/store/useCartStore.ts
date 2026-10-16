import { create } from 'zustand';
import { CartItem, DiscountEngineResult, Order, Product } from '../types/index.js';
import { api } from '../services/api.js';

interface CartState {
  items: CartItem[];
  couponCode: string;
  isCheckingOut: boolean;
  checkoutError: string | null;
  lastConfirmedOrder: Order | null;

  // Acciones
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  setCouponCode: (code: string) => void;
  clearCart: () => void;
  resetOrderState: () => void;
  executeCheckout: () => Promise<Order | null>;

  // Getters / Cálculos derivados para la previsualización
  getOriginalSubtotalCents: () => number;
  calculatePreview: () => DiscountEngineResult;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  couponCode: '',
  isCheckingOut: false,
  checkoutError: null,
  lastConfirmedOrder: null,

  addItem: (product: Product) => {
    set(state => {
      const existing = state.items.find(i => i.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          return state; // No superar el stock disponible
        }
        return {
          items: state.items.map(i =>
            i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
          ),
          checkoutError: null,
        };
      }
      return {
        items: [...state.items, { product, quantity: 1 }],
        checkoutError: null,
      };
    });
  },

  removeItem: (productId: string) => {
    set(state => ({
      items: state.items.filter(i => i.product.id !== productId),
      checkoutError: null,
    }));
  },

  updateQuantity: (productId: string, quantity: number) => {
    if (quantity <= 0) {
      get().removeItem(productId);
      return;
    }
    set(state => ({
      items: state.items.map(i => {
        if (i.product.id === productId) {
          const clamped = Math.min(quantity, i.product.stock);
          return { ...i, quantity: clamped };
        }
        return i;
      }),
      checkoutError: null,
    }));
  },

  setCouponCode: (code: string) => {
    set({ couponCode: code, checkoutError: null });
  },

  clearCart: () => {
    set({ items: [], couponCode: '', checkoutError: null });
  },

  resetOrderState: () => {
    set({ lastConfirmedOrder: null, checkoutError: null });
  },

  getOriginalSubtotalCents: () => {
    return get().items.reduce(
      (acc, item) => acc + item.product.priceCents * item.quantity,
      0
    );
  },

  /**
   * Previsualización instantánea en frontend utilizando las mismas reglas matemáticas
   * puras de centavos que el backend para una experiencia de usuario fluida y transparente.
   */
  calculatePreview: (): DiscountEngineResult => {
    const items = get().items;
    const coupon = get().couponCode.trim().toUpperCase();
    const originalSubtotalCents = items.reduce(
      (acc, i) => acc + i.product.priceCents * i.quantity,
      0
    );

    if (originalSubtotalCents <= 0) {
      const emptyStrategy = (id: 'CATEGORY' | 'VOLUME' | 'COUPON', name: string) => ({
        id,
        name,
        eligibleBaseCents: 0,
        calculatedDiscountCents: 0,
        appliedDiscountCents: 0,
        description: 'Carrito vacío',
      });
      return {
        originalSubtotalCents: 0,
        discounts: {
          category: emptyStrategy('CATEGORY', 'Descuento de Categoría'),
          volume: emptyStrategy('VOLUME', 'Descuento por Volumen'),
          coupon: emptyStrategy('COUPON', 'Descuento por Cupón'),
        },
        totalCalculatedDiscountCents: 0,
        totalEffectiveDiscountCents: 0,
        maxAllowedDiscountCents: 0,
        effectiveSavingsPercentage: 0,
        isCapReached: false,
        finalTotalCents: 0,
      };
    }

    // 1. Descuento de Categoría (10% Tecnología)
    const techSubtotal = items
      .filter(i => i.product.category.trim().toLowerCase() === 'tecnología')
      .reduce((acc, i) => acc + i.product.priceCents * i.quantity, 0);

    const catCalculated = techSubtotal > 0 ? Math.round(techSubtotal * 0.10) : 0;
    const catResult = {
      id: 'CATEGORY' as const,
      name: 'Descuento de Categoría (Tecnología)',
      eligibleBaseCents: techSubtotal,
      calculatedDiscountCents: catCalculated,
      appliedDiscountCents: catCalculated,
      description: techSubtotal > 0
        ? `10% aplicado sobre $${(techSubtotal / 100).toFixed(2)} en Tecnología`
        : 'No aplica (sin productos de Tecnología)',
    };

    // 2. Descuento por Volumen (5% si subtotal ajustado > 100 USD / 10,000 centavos)
    const adjustedAfterCat = originalSubtotalCents - catCalculated;
    const isVolEligible = adjustedAfterCat > 10000;
    const volCalculated = isVolEligible ? Math.round(adjustedAfterCat * 0.05) : 0;
    const volResult = {
      id: 'VOLUME' as const,
      name: 'Descuento por Volumen (> $100 USD)',
      eligibleBaseCents: adjustedAfterCat,
      calculatedDiscountCents: volCalculated,
      appliedDiscountCents: volCalculated,
      description: isVolEligible
        ? `5% aplicado sobre $${(adjustedAfterCat / 100).toFixed(2)} por superar $100.00`
        : 'No aplica (subtotal no supera estrictamente $100.00 USD)',
    };

    // 3. Descuento por Cupón (15% si WELCOME2E26)
    const adjustedAfterVol = adjustedAfterCat - volCalculated;
    const isCouponValid = coupon === 'WELCOME2E26';
    const couponCalculated = isCouponValid ? Math.round(adjustedAfterVol * 0.15) : 0;
    const couponResult = {
      id: 'COUPON' as const,
      name: 'Descuento por Cupón Promocional',
      eligibleBaseCents: adjustedAfterVol,
      calculatedDiscountCents: couponCalculated,
      appliedDiscountCents: couponCalculated,
      description: isCouponValid
        ? `15% aplicado sobre $${(adjustedAfterVol / 100).toFixed(2)} con cupón WELCOME2E26`
        : coupon ? `Cupón "${coupon}" no válido` : 'No se aplicó cupón',
    };

    // 4. Tope del 35% y resolución LIFO
    const totalCalculated = catCalculated + volCalculated + couponCalculated;
    const maxAllowed = Math.round(originalSubtotalCents * 0.35);
    const isCapReached = originalSubtotalCents > 0 && totalCalculated >= maxAllowed;
    const totalEffective = Math.min(totalCalculated, maxAllowed);

    // LIFO distribution
    let coupApplied = couponCalculated;
    let volApplied = volCalculated;
    let catApplied = catCalculated;

    if (totalCalculated > maxAllowed) {
      let excess = totalCalculated - maxAllowed;
      const coupRecorte = Math.min(coupApplied, excess);
      coupApplied -= coupRecorte;
      excess -= coupRecorte;

      const volRecorte = Math.min(volApplied, excess);
      volApplied -= volRecorte;
      excess -= volRecorte;

      const catRecorte = Math.min(catApplied, excess);
      catApplied -= catRecorte;
    }

    const finalTotal = originalSubtotalCents - totalEffective;
    const savingsPct = Number(((totalEffective / originalSubtotalCents) * 100).toFixed(2));

    return {
      originalSubtotalCents,
      discounts: {
        category: { ...catResult, appliedDiscountCents: catApplied },
        volume: { ...volResult, appliedDiscountCents: volApplied },
        coupon: { ...couponResult, appliedDiscountCents: coupApplied },
      },
      totalCalculatedDiscountCents: totalCalculated,
      totalEffectiveDiscountCents: totalEffective,
      maxAllowedDiscountCents: maxAllowed,
      effectiveSavingsPercentage: savingsPct,
      isCapReached,
      finalTotalCents: finalTotal,
    };
  },

  executeCheckout: async (): Promise<Order | null> => {
    const { items, couponCode } = get();
    if (items.length === 0) {
      set({ checkoutError: 'El carrito está vacío.' });
      return null;
    }

    set({ isCheckingOut: true, checkoutError: null });

    try {
      const order = await api.processCheckout({
        items: items.map(i => ({
          productId: i.product.id,
          quantity: i.quantity,
        })),
        couponCode: couponCode || undefined,
      });

      // Éxito: vaciar carrito y guardar la orden confirmada
      set({
        items: [],
        couponCode: '',
        isCheckingOut: false,
        lastConfirmedOrder: order,
        checkoutError: null,
      });

      return order;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Error inesperado durante el checkout';
      set({
        isCheckingOut: false,
        checkoutError: message,
      });
      return null;
    }
  },
}));
