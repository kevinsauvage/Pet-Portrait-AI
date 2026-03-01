import { getGelatoIdsForShopifyProduct } from './get-gelato-ids-for-product';
import type { ShopifyProductWebhookPayload } from './shopify-product-webhook.types';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/infra/gelato/client', () => ({
  findGelatoProductByShopifyId: vi.fn(),
}));

// Keep retry delays from actually sleeping in tests
vi.mock('@/core/utils/retry', async (importOriginal) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const original = await importOriginal<typeof import('@/core/utils/retry')>();
  return {
    withRetry: async <T>(
      fn: () => Promise<T>,
      options: Parameters<typeof original.withRetry>[1],
    ): Promise<T | undefined> => {
      for (let attempt = 1; attempt <= options.maxAttempts; attempt++) {
        // eslint-disable-next-line no-await-in-loop
        const result = await fn();
        if (!options.isSuccess || options.isSuccess(result)) return result;
      }
      return undefined;
    },
  };
});

import { findGelatoProductByShopifyId } from '@/infra/gelato/client';

const mockPayload = (
  overrides: Partial<ShopifyProductWebhookPayload> = {},
): ShopifyProductWebhookPayload => ({
  id: 123456,
  title: 'Test Product',
  ...overrides,
});

const mockGelatoProduct = (overrides = {}) => ({
  id: 'gelato-prod-uuid',
  storeId: 'store-1',
  externalId: '123456',
  title: 'Test Product',
  description: '',
  previewUrl: '',
  status: 'active' as const,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  ...overrides,
});

beforeEach(() => {
  process.env.GELATO_API_KEY = 'test-key';
  process.env.GELATO_STORE_ID = 'store-1';
});

afterEach(() => {
  vi.clearAllMocks();
  delete process.env.GELATO_API_KEY;
  delete process.env.GELATO_STORE_ID;
});

describe('getGelatoIdsForShopifyProduct', () => {
  it('returns null when GELATO_API_KEY is missing', async () => {
    delete process.env.GELATO_API_KEY;
    const result = await getGelatoIdsForShopifyProduct(mockPayload());
    expect(result).toBeNull();
    expect(findGelatoProductByShopifyId).not.toHaveBeenCalled();
  });

  it('returns null when GELATO_STORE_ID is missing', async () => {
    delete process.env.GELATO_STORE_ID;
    const result = await getGelatoIdsForShopifyProduct(mockPayload());
    expect(result).toBeNull();
    expect(findGelatoProductByShopifyId).not.toHaveBeenCalled();
  });

  it('returns null when Gelato product is not found after all retries', async () => {
    vi.mocked(findGelatoProductByShopifyId).mockResolvedValue(null);
    const result = await getGelatoIdsForShopifyProduct(mockPayload());
    expect(result).toBeNull();
    expect(findGelatoProductByShopifyId).toHaveBeenCalledTimes(5);
  });

  it('retries until Gelato product becomes available', async () => {
    const product = mockGelatoProduct();
    vi.mocked(findGelatoProductByShopifyId)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(product);
    const result = await getGelatoIdsForShopifyProduct(mockPayload());
    expect(result).toEqual({ gelatoProductId: 'gelato-prod-uuid', gelatoVariantId: null });
    expect(findGelatoProductByShopifyId).toHaveBeenCalledTimes(3);
  });

  it('returns ids immediately when product is found on first attempt', async () => {
    vi.mocked(findGelatoProductByShopifyId).mockResolvedValue(mockGelatoProduct());
    await getGelatoIdsForShopifyProduct(mockPayload());
    expect(findGelatoProductByShopifyId).toHaveBeenCalledTimes(1);
  });

  it('returns gelatoProductId and first connected variant id', async () => {
    vi.mocked(findGelatoProductByShopifyId).mockResolvedValue(
      mockGelatoProduct({
        variants: [
          {
            id: 'v1',
            externalId: null,
            productId: 'p',
            title: 'S',
            connectionStatus: 'disconnected',
            productUid: '',
          },
          {
            id: 'v2',
            externalId: '9001',
            productId: 'p',
            title: 'M',
            connectionStatus: 'connected',
            productUid: '',
          },
        ],
      }),
    );
    const result = await getGelatoIdsForShopifyProduct(mockPayload());
    expect(result).toEqual({ gelatoProductId: 'gelato-prod-uuid', gelatoVariantId: 'v2' });
  });

  it('falls back to first variant when none has externalId', async () => {
    vi.mocked(findGelatoProductByShopifyId).mockResolvedValue(
      mockGelatoProduct({
        variants: [
          {
            id: 'v1',
            externalId: null,
            productId: 'p',
            title: 'S',
            connectionStatus: 'disconnected',
            productUid: '',
          },
        ],
      }),
    );
    const result = await getGelatoIdsForShopifyProduct(mockPayload());
    expect(result).toEqual({ gelatoProductId: 'gelato-prod-uuid', gelatoVariantId: 'v1' });
  });

  it('returns null gelatoVariantId when product has no variants', async () => {
    vi.mocked(findGelatoProductByShopifyId).mockResolvedValue(mockGelatoProduct({ variants: [] }));
    const result = await getGelatoIdsForShopifyProduct(mockPayload());
    expect(result).toEqual({ gelatoProductId: 'gelato-prod-uuid', gelatoVariantId: null });
  });

  it('returns null gelatoVariantId when variants field is undefined', async () => {
    vi.mocked(findGelatoProductByShopifyId).mockResolvedValue(
      mockGelatoProduct({ variants: undefined }),
    );
    const result = await getGelatoIdsForShopifyProduct(mockPayload());
    expect(result).toEqual({ gelatoProductId: 'gelato-prod-uuid', gelatoVariantId: null });
  });

  it('calls Gelato with the Shopify product REST id as string', async () => {
    vi.mocked(findGelatoProductByShopifyId).mockResolvedValue(null);
    await getGelatoIdsForShopifyProduct(mockPayload({ id: 789 }));
    expect(findGelatoProductByShopifyId).toHaveBeenCalledWith('store-1', '789');
  });
});
