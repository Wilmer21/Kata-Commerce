import Database, { Database as DatabaseType } from 'better-sqlite3';
import { INITIAL_PRODUCTS_SEED, Product } from '../../domain/models/product.js';

export function createSqliteDatabase(dbPath: string = ':memory:'): DatabaseType {
  const db = new Database(dbPath);

  // Activar WAL mode y foreign keys para rendimiento y consistencia
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  // Crear tablas si no existen
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      priceCents INTEGER NOT NULL,
      stock INTEGER NOT NULL,
      description TEXT NOT NULL,
      imageUrl TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      status TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      itemsJson TEXT NOT NULL,
      summaryJson TEXT NOT NULL
    );
  `);

  // Poblar productos iniciales si la tabla está vacía
  const countRow = db.prepare('SELECT COUNT(*) as count FROM products').get() as { count: number };
  if (countRow.count === 0) {
    const insertStmt = db.prepare(`
      INSERT INTO products (id, name, category, priceCents, stock, description, imageUrl)
      VALUES (@id, @name, @category, @priceCents, @stock, @description, @imageUrl)
    `);

    const insertMany = db.transaction((products: readonly Product[]) => {
      for (const prod of products) {
        insertStmt.run(prod);
      }
    });

    insertMany(INITIAL_PRODUCTS_SEED);
  }

  return db;
}
