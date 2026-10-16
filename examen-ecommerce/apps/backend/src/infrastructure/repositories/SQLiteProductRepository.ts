import { Database as DatabaseType } from 'better-sqlite3';
import { Product, INITIAL_PRODUCTS_SEED } from '../../domain/models/product.js';
import { IProductRepository, StockDeductionItem } from '../../domain/repositories/IProductRepository.js';

export class SQLiteProductRepository implements IProductRepository {
  constructor(private readonly db: DatabaseType) {}

  async findAll(): Promise<Product[]> {
    const stmt = this.db.prepare('SELECT * FROM products ORDER BY name ASC');
    return stmt.all() as Product[];
  }

  async findById(id: string): Promise<Product | null> {
    const stmt = this.db.prepare('SELECT * FROM products WHERE id = ?');
    const row = stmt.get(id);
    return row ? (row as Product) : null;
  }

  async findByIds(ids: readonly string[]): Promise<Map<string, Product>> {
    const result = new Map<string, Product>();
    if (ids.length === 0) return result;

    const placeholders = ids.map(() => '?').join(',');
    const stmt = this.db.prepare(`SELECT * FROM products WHERE id IN (${placeholders})`);
    const rows = stmt.all(...ids) as Product[];

    for (const row of rows) {
      result.set(row.id, row);
    }
    return result;
  }

  /**
   * Ejecuta la comprobación y el decremento de stock dentro de una transacción ACID de SQLite.
   * Si cualquier ítem no dispone de stock suficiente, se lanza un error interno que provoca
   * un ROLLBACK automático de toda la transacción, garantizando cero ventas parciales.
   */
  async decrementStockAtomic(items: readonly StockDeductionItem[]): Promise<boolean> {
    const checkStmt = this.db.prepare('SELECT stock FROM products WHERE id = ?');
    const updateStmt = this.db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?');

    const transaction = this.db.transaction((deductionItems: readonly StockDeductionItem[]) => {
      for (const item of deductionItems) {
        const row = checkStmt.get(item.productId) as { stock: number } | undefined;
        if (!row || row.stock < item.quantity) {
          throw new Error(`INSUFFICIENT_STOCK_${item.productId}`);
        }
      }

      for (const item of deductionItems) {
        updateStmt.run(item.quantity, item.productId);
      }
    });

    try {
      transaction(items);
      return true;
    } catch {
      return false; // Transacción revertida de forma atómica
    }
  }

  async reset(seed: readonly Product[] = INITIAL_PRODUCTS_SEED): Promise<void> {
    const deleteStmt = this.db.prepare('DELETE FROM products');
    const insertStmt = this.db.prepare(`
      INSERT INTO products (id, name, category, priceCents, stock, description, imageUrl)
      VALUES (@id, @name, @category, @priceCents, @stock, @description, @imageUrl)
    `);

    const resetTx = this.db.transaction((products: readonly Product[]) => {
      deleteStmt.run();
      for (const prod of products) {
        insertStmt.run(prod);
      }
    });

    resetTx(seed);
  }
}
