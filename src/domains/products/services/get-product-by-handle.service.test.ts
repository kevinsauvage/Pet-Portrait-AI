import { GetProductByHandleService } from './get-product-by-handle.service';

import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/domains/products/repositories/product.repository', () => ({
  ShopifyProductRepository: vi.fn().mockImplementation(function (this: Record<string, unknown>) {
    this.findByHandle = vi.fn().mockResolvedValue({ id: 'prod-1', title: 'Product 1' });
    return this;
  }),
}));

describe('GetProductByHandleService', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('execute returns product by handle', async () => {
    const result = await GetProductByHandleService.execute('test-product');
    expect(result).toEqual({ id: 'prod-1', title: 'Product 1' });
  });
});
