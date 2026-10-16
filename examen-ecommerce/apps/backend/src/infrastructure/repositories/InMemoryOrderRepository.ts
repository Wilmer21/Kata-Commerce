import { Order } from '../../domain/models/order.js';
import { IOrderRepository } from '../../domain/repositories/IOrderRepository.js';

export class InMemoryOrderRepository implements IOrderRepository {
  private orders: Map<string, Order> = new Map();

  async create(order: Order): Promise<Order> {
    this.orders.set(order.id, { ...order });
    return { ...order };
  }

  async findById(id: string): Promise<Order | null> {
    const order = this.orders.get(id);
    return order ? { ...order } : null;
  }

  async findAll(): Promise<Order[]> {
    return Array.from(this.orders.values());
  }

  async reset(): Promise<void> {
    this.orders.clear();
  }
}
