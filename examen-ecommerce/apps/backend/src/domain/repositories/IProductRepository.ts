import { Product } from '../models/product.js';

export interface StockDeductionItem {
  readonly productId: string;
  readonly quantity: number;
}

export interface IProductRepository {
  /**
   * Obtiene todos los productos del catálogo.
   */
  findAll(): Promise<Product[]>;

  /**
   * Busca un producto por su identificador único.
   */
  findById(id: string): Promise<Product | null>;

  /**
   * Busca múltiples productos por sus IDs y retorna un mapa indexado por ID.
   */
  findByIds(ids: readonly string[]): Promise<Map<string, Product>>;

  /**
   * Descuenta stock de múltiples productos de forma estrictamente atómica.
   * Si cualquiera de los productos no tiene stock suficiente, revierte toda la operación
   * y retorna false sin modificar ningún inventario.
   */
  decrementStockAtomic(items: readonly StockDeductionItem[]): Promise<boolean>;

  /**
   * Reinicia los datos del catálogo (útil para pruebas y seed inicial).
   */
  reset(seed?: readonly Product[]): Promise<void>;
}
