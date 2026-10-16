import { describe, it, expect } from 'vitest';
import { ProductService } from '../../../src/application/services/ProductService.js';
import { InMemoryProductRepository } from '../../../src/infrastructure/repositories/InMemoryProductRepository.js';
import { Product } from '../../../src/domain/models/product.js';

const TEST_PROD: Product = {
  id: 'test-1',
  name: 'Test Product',
  category: 'Tecnología',
  priceCents: 1000,
  stock: 10,
  description: 'Desc',
  imageUrl: 'img',
};

describe('ProductService', () => {
  it('debe listar productos y buscar por ID', async () => {
    const repo = new InMemoryProductRepository([TEST_PROD]);
    const service = new ProductService(repo);

    const all = await service.getAllProducts();
    expect(all.length).toBe(1);
    expect(all[0]?.name).toBe('Test Product');

    const found = await service.getProductById('test-1');
    expect(found?.priceCents).toBe(1000);

    const notFound = await service.getProductById('non-existent');
    expect(notFound).toBeNull();
  });
});
