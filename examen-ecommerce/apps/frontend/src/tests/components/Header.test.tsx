import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { Header } from '../../components/Header.js';
import { useCartStore } from '../../store/useCartStore.js';
import { Product } from '../../types/index.js';

const mockProduct: Product = {
  id: 'p1',
  name: 'Test',
  category: 'Tecnología',
  priceCents: 1000,
  stock: 5,
  description: '',
  imageUrl: '',
};

describe('Header Component', () => {
  beforeEach(() => {
    useCartStore.getState().clearCart();
  });

  it('debe renderizar el título de KataCommerce y badge de centavos', () => {
    render(<Header />);
    expect(screen.getByText(/Kata/i)).toBeInTheDocument();
    expect(screen.getByText(/Commerce/i)).toBeInTheDocument();
    expect(screen.getByText(/Precisión en Centavos/i)).toBeInTheDocument();
    expect(screen.getByTestId('cart-badge-count')).toHaveTextContent('0');
  });

  it('debe actualizar el contador de ítems cuando se agregan productos', () => {
    useCartStore.getState().addItem(mockProduct);
    useCartStore.getState().addItem(mockProduct);

    render(<Header />);
    expect(screen.getByTestId('cart-badge-count')).toHaveTextContent('2');
  });
});
