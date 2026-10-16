import { Cents } from '../types/money.js';
import { ProductCategory } from '../types/cart.js';

export interface Product {
  readonly id: string;
  readonly name: string;
  readonly category: ProductCategory;
  readonly priceCents: Cents;
  readonly stock: number;
  readonly description: string;
  readonly imageUrl: string;
}

/**
 * Catálogo semilla inicial preconfigurado para la prueba técnica.
 * Contiene una mezcla equilibrada de categorías (Tecnología, Hogar, Moda, Alimentos)
 * para probar con claridad las reglas de negocio.
 */
export const INITIAL_PRODUCTS_SEED: readonly Product[] = [
  {
    id: 'prod-tech-1',
    name: 'Teclado Mecánico RGB Pro',
    category: 'Tecnología',
    priceCents: 8500, // $85.00
    stock: 15,
    description: 'Switches táctiles silenciosos con iluminación RGB personalizable.',
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&auto=format&fit=crop&q=60',
  },
  {
    id: 'prod-tech-2',
    name: 'Ratón Inalámbrico Ergonómico',
    category: 'Tecnología',
    priceCents: 4500, // $45.00
    stock: 20,
    description: 'Sensor óptico de 16000 DPI con conectividad 2.4GHz y Bluetooth.',
    imageUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500&auto=format&fit=crop&q=60',
  },
  {
    id: 'prod-tech-3',
    name: 'Auriculares Noise Cancelling',
    category: 'Tecnología',
    priceCents: 12000, // $120.00
    stock: 8,
    description: 'Cancelación activa de ruido con batería de 30 horas de autonomía.',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60',
  },
  {
    id: 'prod-home-1',
    name: 'Lámpara de Escritorio LED Regulable',
    category: 'Hogar',
    priceCents: 3500, // $35.00
    stock: 25,
    description: 'Temperatura de color ajustable y puerto de carga USB integrado.',
    imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&auto=format&fit=crop&q=60',
  },
  {
    id: 'prod-home-2',
    name: 'Cafetera Prensa Francesa Acero',
    category: 'Hogar',
    priceCents: 2800, // $28.00
    stock: 12,
    description: 'Capacidad de 1L con filtro de doble malla de acero inoxidable.',
    imageUrl: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=500&auto=format&fit=crop&q=60',
  },
  {
    id: 'prod-fashion-1',
    name: 'Mochila Urbana Impermeable',
    category: 'Moda',
    priceCents: 6500, // $65.00
    stock: 10,
    description: 'Compartimento acolchado para laptop de hasta 16 pulgadas.',
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&auto=format&fit=crop&q=60',
  },
  {
    id: 'prod-fashion-2',
    name: 'Camiseta Básica de Algodón Orgánico',
    category: 'Moda',
    priceCents: 2200, // $22.00
    stock: 30,
    description: '100% algodón orgánico certificado, corte regular fit.',
    imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=60',
  },
  {
    id: 'prod-food-1',
    name: 'Café de Especialidad en Grano (500g)',
    category: 'Alimentos',
    priceCents: 1800, // $18.00
    stock: 40,
    description: 'Origen Colombia, notas a caramelo y chocolate con acidez balanceada.',
    imageUrl: 'https://images.unsplash.com/photo-1587734195503-904fca47e0e9?w=500&auto=format&fit=crop&q=60',
  },
];
