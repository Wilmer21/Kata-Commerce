import { Product } from '../../domain/models/product.js';
import { IProductRepository } from '../../domain/repositories/IProductRepository.js';

export class ProductService {
  constructor(private readonly productRepository: IProductRepository) {}

  async getAllProducts(): Promise<Product[]> {
    return this.productRepository.findAll();
  }

  async getProductById(id: string): Promise<Product | null> {
    return this.productRepository.findById(id);
  }
}
