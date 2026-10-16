import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { ProductCard } from '../../components/ProductCard.js';
import { Product } from '../../types/index.js';
import { useCartStore } from '../../store/useCartStore.js';

const mockProduct: Product = {
  id: 'prod-tech-1',
  name: 'Auriculares Inalámbricos',
  category: 'Tecnología',
  priceCents: 4999, // $49.99
  stock: 2,
  description: 'Cancelación de ruido activa',
  imageUrl: 'https://example.com/headphones.jpg',
};

const mockOutOfStockProduct: Product = {
  id: 'prod-out',
  name: 'Producto Agotado',
  category: 'Hogar',
  priceCents: 2000,
  stock: 0,
  description: 'Sin inventario',
  imageUrl: 'https://example.com/out.jpg',
};

describe('ProductCard Component', () => {
  beforeEach(() => {
    useCartStore.getState().clearCart();
  });

  it('debe renderizar el producto con su precio formateado y badge de Tecnología (-10%)', () => {
    render(<ProductCard product={mockProduct} />);

    expect(screen.getByText('Auriculares Inalámbricos')).toBeInTheDocument();
    expect(screen.getByText('$49.99')).toBeInTheDocument();
    expect(screen.getByText(/Tecnología \(-10%\)/i)).toBeInTheDocument();
    expect(screen.getByText('¡Solo 2 disp.!')).toBeInTheDocument();
  });

  it('debe permitir agregar al carrito e incrementar la cantidad', () => {
    render(<ProductCard product={mockProduct} />);

    const addBtn = screen.getByTestId('add-to-cart-prod-tech-1');
    fireEvent.click(addBtn);

    expect(useCartStore.getState().items.length).toBe(1);
    expect(useCartStore.getState().items[0]?.quantity).toBe(1);

    // Al llegar al máximo del stock, el botón se deshabilita
    fireEvent.click(addBtn);
    expect(useCartStore.getState().items[0]?.quantity).toBe(2);
    expect(screen.getByText(/Máximo Alcanzado \(2\)/i)).toBeInTheDocument();
    expect(addBtn).toBeDisabled();
  });

  it('debe mostrar "Agotado" y botón deshabilitado si el stock es cero', () => {
    render(<ProductCard product={mockOutOfStockProduct} />);

    expect(screen.getByText('Agotado')).toBeInTheDocument();
    const btn = screen.getByTestId('add-to-cart-prod-out');
    expect(btn).toBeDisabled();
    expect(screen.getByText('Sin Stock')).toBeInTheDocument();
  });
});
