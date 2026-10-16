import { Order } from '../models/order.js';

export interface IOrderRepository {
  /**
   * Persiste una orden en el almacenamiento.
   */
  create(order: Order): Promise<Order>;

  /**
   * Busca una orden por su identificador único.
   */
  findById(id: string): Promise<Order | null>;

  /**
   * Lista todas las órdenes registradas en el sistema.
   */
  findAll(): Promise<Order[]>;

  /**
   * Limpia las órdenes (útil para pruebas).
   */
  reset(): Promise<void>;
}
