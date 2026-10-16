import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CartSummary } from '../../components/CartSummary.js';
import { useCartStore } from '../../store/useCartStore.js';
import { Product } from '../../types/index.js';
import { api } from '../../services/api.js';

const mockTechProduct: Product = {
  id: 'tech-1',
  name: 'Teclado Mecánico RGB',
  category: 'Tecnología',
  priceCents: 10000, // $100.00
  stock: 5,
  description: 'Teclado',
  imageUrl: 'img',
};

describe('CartSummary Component', () => {
  beforeEach(() => {
    useCartStore.getState().clearCart();
    useCartStore.getState().resetOrderState();
  });

  it('debe mostrar mensaje de carrito vacío si no hay ítems', () => {
    render(<CartSummary />);
    expect(screen.getByText(/Tu carrito está vacío/i)).toBeInTheDocument();
  });

  it('debe renderizar los productos, controlar cantidades y reflejar subtotal', () => {
    useCartStore.getState().addItem(mockTechProduct);

    render(<CartSummary />);

    expect(screen.getByText('Teclado Mecánico RGB')).toBeInTheDocument();
    expect(screen.getByTestId('original-subtotal')).toHaveTextContent('$100.00');

    // Incrementar cantidad
    const plusBtn = screen.getByTestId('increase-qty-tech-1');
    fireEvent.click(plusBtn);

    expect(screen.getByTestId('qty-tech-1')).toHaveTextContent('2');
    expect(screen.getByTestId('original-subtotal')).toHaveTextContent('$200.00');

    // Decrementar cantidad
    const minusBtn = screen.getByTestId('decrease-qty-tech-1');
    fireEvent.click(minusBtn);

    expect(screen.getByTestId('qty-tech-1')).toHaveTextContent('1');
    expect(screen.getByTestId('original-subtotal')).toHaveTextContent('$100.00');
  });

  it('debe permitir aplicar y remover cupones', () => {
    useCartStore.getState().addItem(mockTechProduct);

    render(<CartSummary />);

    const couponInput = screen.getByTestId('coupon-input');
    const applyBtn = screen.getByTestId('apply-coupon-btn');

    // Aplicar WELCOME2E26
    fireEvent.change(couponInput, { target: { value: 'WELCOME2E26' } });
    fireEvent.click(applyBtn);

    expect(screen.getByTestId('coupon-status-badge')).toHaveTextContent(/WELCOME2E26 \(-15%\)/i);

    // Remover cupón
    const removeBtn = screen.getByTestId('remove-coupon-btn');
    fireEvent.click(removeBtn);

    expect(screen.queryByTestId('coupon-status-badge')).not.toBeInTheDocument();
  });

  it('debe invocar executeCheckout al presionar el botón de Confirmar Pedido', async () => {
    useCartStore.getState().addItem(mockTechProduct);

    const mockOrder = {
      id: 'ord_mock_123',
      status: 'CONFIRMED' as const,
      createdAt: new Date().toISOString(),
      items: [],
      summary: useCartStore.getState().calculatePreview(),
    };

    const spy = vi.spyOn(api, 'processCheckout').mockResolvedValueOnce(mockOrder);
    const onCheckoutSuccess = vi.fn();

    render(<CartSummary onCheckoutSuccess={onCheckoutSuccess} />);

    const checkoutBtn = screen.getByTestId('checkout-button');
    fireEvent.click(checkoutBtn);

    await waitFor(() => {
      expect(spy).toHaveBeenCalledTimes(1);
      expect(onCheckoutSuccess).toHaveBeenCalledTimes(1);
    });
  });
});
