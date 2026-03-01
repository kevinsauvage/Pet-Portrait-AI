import { setGelatoMetafieldsOnProduct } from './shopify-product-gelato-metafields.service';

import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/infra/shopify/client', () => ({
  adminSdk: vi.fn(() => ({ MetafieldsSet: vi.fn() })),
}));

vi.mock('@/core/utils/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

import { logger } from '@/core/utils/logger';
import { adminSdk } from '@/infra/shopify/client';

function mockMetafieldsSet(result: {
  metafields?: unknown[];
  userErrors: { field?: string[] | null; message: string }[];
}) {
  vi.mocked(adminSdk).mockReturnValue({
    MetafieldsSet: vi.fn().mockResolvedValue({ metafieldsSet: result }),
  } as unknown as ReturnType<typeof adminSdk>);
}

afterEach(() => {
  vi.clearAllMocks();
});

describe('setGelatoMetafieldsOnProduct', () => {
  it('sets product metafield only when no variant is provided', async () => {
    mockMetafieldsSet({ metafields: [], userErrors: [] });
    const result = await setGelatoMetafieldsOnProduct({
      shopifyProductGid: 'gid://shopify/Product/1',
      gelatoProductId: 'gelato-prod-uuid',
    });
    expect(result).toEqual({ success: true });
    const { MetafieldsSet } = adminSdk();
    expect(MetafieldsSet).toHaveBeenCalledWith({
      metafields: [
        expect.objectContaining({
          ownerId: 'gid://shopify/Product/1',
          key: 'product_id',
          value: 'gelato-prod-uuid',
        }),
      ],
    });
  });

  it('sets both product and variant metafields when variant info is provided', async () => {
    mockMetafieldsSet({ metafields: [], userErrors: [] });
    const result = await setGelatoMetafieldsOnProduct({
      shopifyProductGid: 'gid://shopify/Product/1',
      gelatoProductId: 'gelato-prod-uuid',
      shopifyVariantGid: 'gid://shopify/ProductVariant/2',
      gelatoVariantId: 'gelato-var-uuid',
    });
    expect(result).toEqual({ success: true });
    const { MetafieldsSet } = adminSdk();
    expect(MetafieldsSet).toHaveBeenCalledWith({
      metafields: [
        expect.objectContaining({ key: 'product_id', value: 'gelato-prod-uuid' }),
        expect.objectContaining({
          ownerId: 'gid://shopify/ProductVariant/2',
          key: 'variant_id',
          value: 'gelato-var-uuid',
        }),
      ],
    });
  });

  it('skips variant metafield when gelatoVariantId is null', async () => {
    mockMetafieldsSet({ metafields: [], userErrors: [] });
    await setGelatoMetafieldsOnProduct({
      shopifyProductGid: 'gid://shopify/Product/1',
      gelatoProductId: 'gelato-prod-uuid',
      shopifyVariantGid: 'gid://shopify/ProductVariant/2',
      gelatoVariantId: null,
    });
    const { MetafieldsSet } = adminSdk();
    const call = vi.mocked(MetafieldsSet).mock.calls[0]?.[0];
    if (!call) throw new Error('MetafieldsSet not called');
    expect(call.metafields).toHaveLength(1);
  });

  it('returns success: false and logs when Admin API returns userErrors', async () => {
    const userErrors = [{ field: ['key'], message: 'invalid key' }];
    mockMetafieldsSet({ userErrors });
    const result = await setGelatoMetafieldsOnProduct({
      shopifyProductGid: 'gid://shopify/Product/1',
      gelatoProductId: 'gelato-prod-uuid',
    });
    expect(result).toEqual({ success: false, userErrors });
    expect(logger.error).toHaveBeenCalledWith(
      'setGelatoMetafieldsOnProduct',
      expect.objectContaining({ userErrors }),
    );
  });

  it('uses gelato namespace for all metafields', async () => {
    mockMetafieldsSet({ metafields: [], userErrors: [] });
    await setGelatoMetafieldsOnProduct({
      shopifyProductGid: 'gid://shopify/Product/1',
      gelatoProductId: 'gelato-prod-uuid',
      shopifyVariantGid: 'gid://shopify/ProductVariant/2',
      gelatoVariantId: 'gelato-var-uuid',
    });
    const { MetafieldsSet } = adminSdk();
    const call = vi.mocked(MetafieldsSet).mock.calls[0]?.[0];
    if (!call) throw new Error('MetafieldsSet not called');
    const { metafields } = call;
    expect((metafields as { namespace: string }[]).every((m) => m.namespace === 'gelato')).toBe(
      true,
    );
  });
});
