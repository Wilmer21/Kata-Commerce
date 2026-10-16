import { Database as DatabaseType } from 'better-sqlite3';
import { Order, OrderStatus } from '../../domain/models/order.js';
import { IOrderRepository } from '../../domain/repositories/IOrderRepository.js';

interface OrderRow {
  id: string;
  status: OrderStatus;
  createdAt: string;
  itemsJson: string;
  summaryJson: string;
}

export class SQLiteOrderRepository implements IOrderRepository {
  constructor(private readonly db: DatabaseType) {}

  async create(order: Order): Promise<Order> {
    const stmt = this.db.prepare(`
      INSERT INTO orders (id, status, createdAt, itemsJson, summaryJson)
      VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(
      order.id,
      order.status,
      order.createdAt,
      JSON.stringify(order.items),
      JSON.stringify(order.summary)
    );

    return order;
  }

  async findById(id: string): Promise<Order | null> {
    const stmt = this.db.prepare('SELECT * FROM orders WHERE id = ?');
    const row = stmt.get(id) as OrderRow | undefined;

    if (!row) return null;

    return {
      id: row.id,
      status: row.status,
      createdAt: row.createdAt,
      items: JSON.parse(row.itemsJson),
      summary: JSON.parse(row.summaryJson),
    };
  }

  async findAll(): Promise<Order[]> {
    const stmt = this.db.prepare('SELECT * FROM orders ORDER BY createdAt DESC');
    const rows = stmt.all() as OrderRow[];

    return rows.map(row => ({
      id: row.id,
      status: row.status,
      createdAt: row.createdAt,
      items: JSON.parse(row.itemsJson),
      summary: JSON.parse(row.summaryJson),
    }));
  }

  async reset(): Promise<void> {
    this.db.prepare('DELETE FROM orders').run();
  }
}
