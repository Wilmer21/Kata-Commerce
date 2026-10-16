import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = process.env.DB_PATH || path.resolve(__dirname, '../../../data/ecommerce.db');

const db = new Database(dbPath, { readonly: true });

console.log('\n========================================================================================');
console.log(`📦 EXPLORADOR DE BASE DE DATOS SQLITE (${dbPath})`);
console.log('========================================================================================\n');

interface ProductRow {
  id: string;
  name: string;
  category: string;
  priceCents: number;
  stock: number;
}

const rawProducts = db.prepare('SELECT id, name, category, priceCents, stock FROM products').all() as ProductRow[];
const products = rawProducts.map(p => ({
  ID: p.id,
  Nombre: p.name,
  Categoría: p.category,
  'Precio USD': `$${(p.priceCents / 100).toFixed(2)}`,
  'Stock Disp.': `${p.stock} un.`,
}));
console.table(products);

console.log('📋 TABLA: "orders" (Historial de Compras)');
const orders = db.prepare('SELECT id, status, createdAt FROM orders').all();
if (orders.length === 0) {
  console.log('   ℹ️  (Aún no hay órdenes. Al realizar una compra desde el frontend o API se guardará aquí)\n');
} else {
  console.table(orders);
}

console.log('========================================================================================\n');
db.close();
