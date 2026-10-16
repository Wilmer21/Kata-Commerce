import { Product, INITIAL_PRODUCTS_SEED } from '../../domain/models/product.js';
import { IProductRepository, StockDeductionItem } from '../../domain/repositories/IProductRepository.js';

export class InMemoryProductRepository implements IProductRepository {
  private products: Map<string, Product>;

  constructor(seed: readonly Product[] = INITIAL_PRODUCTS_SEED) {
    this.products = new Map();
    this.populate(seed);
  }

  private populate(seed: readonly Product[]): void {
    this.products.clear();
    for (const item of seed) {
      this.products.set(item.id, { ...item });
    }
  }

  async findAll(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async findById(id: string): Promise<Product | null> {
    const product = this.products.get(id);
    return product ? { ...product } : null;
  }

  async findByIds(ids: readonly string[]): Promise<Map<string, Product>> {
    const result = new Map<string, Product>();
    for (const id of ids) {
      const product = this.products.get(id);
      if (product) {
        result.set(id, { ...product });
      }
    }
    return result;
  }

  /**
   * Operación atómica en memoria:
   * 1. Fase de validación: Comprueba que todos los productos existan y tengan stock suficiente.
   * 2. Si falla alguno, aborta sin tocar ningún producto.
   * 3. Si todos cumplen, ejecuta la mutación de una sola vez.
   */
  async decrementStockAtomic(items: readonly StockDeductionItem[]): Promise<boolean> {
    // 1. Validar precondiciones para todos los ítems
    for (const item of items) {
      const product = this.products.get(item.productId);
      if (!product || product.stock < item.quantity) {
        return false; // Stock insuficiente o producto inexistente
      }
    }

    // 2. Aplicar deducción atómica
    for (const item of items) {
      const product = this.products.get(item.productId)!;
      this.products.set(item.productId, {
        ...product,
        stock: product.stock - item.quantity,
      });
    }

    return true;
  }

  async reset(seed: readonly Product[] = INITIAL_PRODUCTS_SEED): Promise<void> {
    this.populate(seed);
  }
}
