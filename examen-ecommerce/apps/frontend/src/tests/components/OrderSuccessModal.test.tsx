import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { OrderSuccessModal } from '../../components/OrderSuccessModal.js';
import { Order } from '../../types/index.js';

const mockOrder: Order = {
  id: 'ord_test_999',
  status: 'CONFIRMED',
  createdAt: '2026-10-15T10:00:00.000Z',
  items: [
    {
      productId: 'p1',
      name: 'Teclado Gamer Pro',
      category: 'Tecnología',
      unitPriceCents: 5000,
      quantity: 2,
      lineTotalCents: 10000,
    },
  ],
  summary: {
    originalSubtotalCents: 10000,
    discounts: {
      category: {
        id: 'CATEGORY',
        name: 'Cat',
        eligibleBaseCents: 10000,
        calculatedDiscountCents: 1000,
        appliedDiscountCents: 1000,
        description: 'Desc',
      },
      volume: {
        id: 'VOLUME',
        name: 'Vol',
        eligibleBaseCents: 9000,
        calculatedDiscountCents: 0,
        appliedDiscountCents: 0,
        description: 'Desc',
      },
      coupon: {
        id: 'COUPON',
        name: 'Coup',
        eligibleBaseCents: 9000,
        calculatedDiscountCents: 0,
        appliedDiscountCents: 0,
        description: 'Desc',
      },
    },
    totalCalculatedDiscountCents: 1000,
    totalEffectiveDiscountCents: 1000,
    maxAllowedDiscountCents: 3500,
    effectiveSavingsPercentage: 10,
    isCapReached: false,
    finalTotalCents: 9000,
  },
};

describe('OrderSuccessModal Component', () => {
  it('no debe renderizar nada si order es null', () => {
    const { container } = render(<OrderSuccessModal order={null} onClose={() => {}} />);
    expect(container.firstChild).toBeNull();
  });

  it('debe renderizar el ID de la orden, los productos y el total cobrado', () => {
    const onClose = vi.fn();
    render(<OrderSuccessModal order={mockOrder} onClose={onClose} />);

    expect(screen.getByTestId('order-success-modal')).toBeInTheDocument();
    expect(screen.getByTestId('confirmed-order-id')).toHaveTextContent('ord_test_999');
    expect(screen.getByText('Teclado Gamer Pro')).toBeInTheDocument();
    expect(screen.getByTestId('confirmed-order-total')).toHaveTextContent('$90.00');

    // Botón de cerrar
    const closeBtn = screen.getByTestId('close-success-modal');
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('debe mostrar la indicación del tope del 35% si isCapReached es true', () => {
    const orderWithCap: Order = {
      ...mockOrder,
      summary: {
        ...mockOrder.summary,
        isCapReached: true,
      },
    };

    render(<OrderSuccessModal order={orderWithCap} onClose={() => {}} />);
    expect(screen.getByText(/Tope máximo del 35% aplicado exitosamente/i)).toBeInTheDocument();
  });
});
