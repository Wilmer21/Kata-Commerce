import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createSqliteDatabase } from './infrastructure/database/sqlite.js';
import { SQLiteProductRepository } from './infrastructure/repositories/SQLiteProductRepository.js';
import { SQLiteOrderRepository } from './infrastructure/repositories/SQLiteOrderRepository.js';
import { createApp } from './app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 5000;
const dataDir = path.resolve(__dirname, '../data');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = process.env.DB_PATH || path.join(dataDir, 'ecommerce.db');
console.log(`[Database] Inicializando base de datos SQLite en: ${dbPath}`);

const db = createSqliteDatabase(dbPath);
const productRepository = new SQLiteProductRepository(db);
const orderRepository = new SQLiteOrderRepository(db);

const app = createApp({
  productRepository,
  orderRepository,
});

app.listen(PORT, () => {
  console.log(`🚀 [Server] Kata-Commerce Backend corriendo en http://localhost:${PORT}`);
  console.log(`   - Catálogo: GET http://localhost:${PORT}/api/products`);
  console.log(`   - Checkout: POST http://localhost:${PORT}/api/checkout`);
  console.log(`   - Órdenes:  GET http://localhost:${PORT}/api/orders`);
  console.log(`   - Health:   GET http://localhost:${PORT}/api/health`);
});
