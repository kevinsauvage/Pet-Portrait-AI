import { ShopifyStorefrontService } from './storefront.service';

import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/infra/shopify/client', () => ({
  storefrontSdk: vi.fn(),
}));

vi.mock('@/domains/products/repositories/product.repository', () => ({
  ShopifyProductRepository: vi.fn().mockImplementation(function (this: Record<string, unknown>) {
    this.findAll = vi.fn().mockResolvedValue([{ id: 'prod-1', title: 'Product 1' }]);
    this.findByHandle = vi.fn().mockResolvedValue({ id: 'prod-1', title: 'Product 1' });
    return this;
  }),
}));

describe('ShopifyStorefrontService', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('getProducts returns products', async () => {
    const result = await ShopifyStorefrontService.getProducts(8);
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Product 1');
  });

  it('getProductByHandle returns product', async () => {
    const result = await ShopifyStorefrontService.getProductByHandle('test-product');
    expect(result).toEqual({ id: 'prod-1', title: 'Product 1' });
  });
});
