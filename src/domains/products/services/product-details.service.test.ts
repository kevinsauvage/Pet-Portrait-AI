import { getProductDetails, getProductSeo } from './product-details.service';

import { afterEach, describe, expect, it, vi } from 'vitest';

const mockGetProductByHandle = vi.fn().mockResolvedValue({
  product: {
    id: 'prod-1',
    title: 'Test Product',
    descriptionHtml: '<p>Description</p>',
    seo: { title: 'SEO Title', description: 'SEO Desc' },
  },
});
vi.mock('@/infra/shopify/client', () => ({
  storefrontSdk: vi.fn(() => ({
    getProductByHandle: mockGetProductByHandle,
    productRecommendations: vi.fn().mockResolvedValue({ productRecommendations: [] }),
  })),
}));

describe('product-details.service', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('getProductDetails returns product and recommendations', async () => {
    const result = await getProductDetails('test-product');
    expect(result.product?.id).toBe('prod-1');
    expect(result.recommendations).toBeDefined();
  });

  it('getProductDetails returns null product when not found', async () => {
    mockGetProductByHandle.mockResolvedValueOnce({ product: null });
    const result = await getProductDetails('missing');
    expect(result.product).toBeNull();
    expect(result.recommendations).toBeNull();
  });

  it('getProductSeo returns title and description', async () => {
    const result = await getProductSeo('test-product');
    expect(result?.title).toBe('SEO Title');
    expect(result?.description).toBeDefined();
  });
});
