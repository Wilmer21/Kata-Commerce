import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createSqliteDatabase } from './sqlite.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Directorio data/ dentro de apps/backend
const dataDir = path.resolve(__dirname, '../../../data');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = process.env.DB_PATH || path.join(dataDir, 'ecommerce.db');

console.log('====================================================');
console.log('INICIALIZADOR DE BASE DE DATOS SQLITE');
console.log('====================================================');
console.log(`Ruta de la base de datos: ${dbPath}`);

const db = createSqliteDatabase(dbPath);

const productCount = db.prepare('SELECT COUNT(*) as count FROM products').get() as { count: number };
const orderCount = db.prepare('SELECT COUNT(*) as count FROM orders').get() as { count: number };

console.log(`✅ Tabla "products" verificada: ${productCount.count} productos cargados.`);
console.log(`✅ Tabla "orders" verificada:   ${orderCount.count} órdenes registradas.`);
console.log('🎉 Base de datos inicializada y lista para usar.');
console.log('====================================================');

db.close();
