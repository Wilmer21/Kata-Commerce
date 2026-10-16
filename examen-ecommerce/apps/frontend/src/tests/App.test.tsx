import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { App } from '../App.js';
import { api } from '../services/api.js';
import { Product } from '../types/index.js';
import { useCartStore } from '../store/useCartStore.js';

const MOCK_PRODUCTS: Product[] = [
  {
    id: 'prod-tech-1',
    name: 'Teclado Mecánico',
    category: 'Tecnología',
    priceCents: 5000,
    stock: 5,
    description: 'Teclado gamer',
    imageUrl: 'img1',
  },
  {
    id: 'prod-home-1',
    name: 'Lámpara Nórdica',
    category: 'Hogar',
    priceCents: 3000,
    stock: 3,
    description: 'Lámpara moderna',
    imageUrl: 'img2',
  },
];

describe('App Component (Integración Principal)', () => {
  beforeEach(() => {
    useCartStore.getState().clearCart();
    useCartStore.getState().resetOrderState();
    vi.restoreAllMocks();
  });

  it('debe cargar y renderizar los productos del catálogo desde el backend', async () => {
    vi.spyOn(api, 'getProducts').mockResolvedValueOnce(MOCK_PRODUCTS);

    render(<App />);

    expect(screen.getByText(/Cargando catálogo desde el backend/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Teclado Mecánico')).toBeInTheDocument();
      expect(screen.getByText('Lámpara Nórdica')).toBeInTheDocument();
    });
  });

  it('debe permitir filtrar productos por categoría', async () => {
    vi.spyOn(api, 'getProducts').mockResolvedValueOnce(MOCK_PRODUCTS);

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Teclado Mecánico')).toBeInTheDocument();
    });

    // Filtrar por 'Hogar'
    const filterHogar = screen.getByTestId('filter-category-Hogar');
    fireEvent.click(filterHogar);

    expect(screen.queryByText('Teclado Mecánico')).not.toBeInTheDocument();
    expect(screen.getByText('Lámpara Nórdica')).toBeInTheDocument();
  });

  it('debe mostrar mensaje de error si el backend no responde', async () => {
    vi.spyOn(api, 'getProducts').mockRejectedValueOnce(new Error('Network error'));

    render(<App />);

    await waitFor(() => {
      expect(
        screen.getByText(/No se pudo conectar con el servidor backend/i)
      ).toBeInTheDocument();
    });
  });
});
