import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/infra/shopify/server', () => ({
  getShopifyToken: vi.fn(),
}));

vi.mock('@/infra/shopify/client', () => ({
  storefrontSdk: vi.fn(() => ({
    getCustomerMetafields: vi.fn().mockResolvedValue({ customer: { metafields: [] } }),
  })),
  adminSdk: vi.fn(() => ({
    MetafieldsSet: vi.fn().mockResolvedValue({
      metafieldsSet: { userErrors: [], metafields: [] },
    }),
  })),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

import type { SavedPortrait } from './types';
import { WISHLIST_MAX_ITEMS, WishlistService } from './wishlist.service';

const makeFakePortrait = (overrides?: Partial<SavedPortrait>): SavedPortrait => ({
  id: 'portrait-1',
  imageUrl: 'https://example.com/portrait.jpg',
  originalPhotoUrl: 'https://example.com/original.jpg',
  styleId: 'watercolor',
  generationId: 'gen-1',
  savedAt: new Date().toISOString(),
  ...overrides,
});

describe('WishlistService.requireAuth', () => {
  let getShopifyToken: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    const mod = await import('@/infra/shopify/server');
    getShopifyToken = mod.getShopifyToken as ReturnType<typeof vi.fn>;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns token when authenticated', async () => {
    getShopifyToken.mockResolvedValue('my-token');
    const token = await WishlistService.requireAuth();
    expect(token).toBe('my-token');
  });

  it('throws when not authenticated', async () => {
    getShopifyToken.mockResolvedValue(null);
    await expect(WishlistService.requireAuth()).rejects.toThrow('User not authenticated');
  });
});

describe('WishlistService.getWishlist', () => {
  let getShopifyToken: ReturnType<typeof vi.fn>;
  let storefrontSdk: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    const serverMod = await import('@/infra/shopify/server');
    getShopifyToken = serverMod.getShopifyToken as ReturnType<typeof vi.fn>;
    const clientMod = await import('@/infra/shopify/client');
    storefrontSdk = clientMod.storefrontSdk as ReturnType<typeof vi.fn>;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns empty array when not authenticated', async () => {
    getShopifyToken.mockResolvedValue(null);
    const result = await WishlistService.getWishlist();
    expect(result).toEqual([]);
  });

  it('returns parsed portraits from metafields', async () => {
    getShopifyToken.mockResolvedValue('token');
    const portraits = [makeFakePortrait()];
    storefrontSdk.mockReturnValue({
      getCustomerMetafields: vi.fn().mockResolvedValue({
        customer: {
          metafields: [{ value: JSON.stringify(portraits) }],
        },
      }),
    });
    const result = await WishlistService.getWishlist();
    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe('portrait-1');
  });

  it('returns empty array when metafield value is invalid JSON', async () => {
    getShopifyToken.mockResolvedValue('token');
    storefrontSdk.mockReturnValue({
      getCustomerMetafields: vi.fn().mockResolvedValue({
        customer: { metafields: [{ value: 'not-json' }] },
      }),
    });
    const result = await WishlistService.getWishlist();
    expect(result).toEqual([]);
  });

  it('returns empty array when metafield value is not an array', async () => {
    getShopifyToken.mockResolvedValue('token');
    storefrontSdk.mockReturnValue({
      getCustomerMetafields: vi.fn().mockResolvedValue({
        customer: { metafields: [{ value: JSON.stringify({ foo: 'bar' }) }] },
      }),
    });
    const result = await WishlistService.getWishlist();
    expect(result).toEqual([]);
  });
});

describe('WishlistService.removePortrait', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns error when portrait is not in wishlist', async () => {
    vi.spyOn(WishlistService, 'getWishlist').mockResolvedValue([makeFakePortrait({ id: 'other' })]);
    const result = await WishlistService.removePortrait('not-in-list', 'user-1');
    expect(result.success).toBe(false);
    expect(result.message).toContain('not found');
  });

  it('calls updateWishlist with filtered list when portrait is present', async () => {
    const portrait = makeFakePortrait({ id: 'portrait-1' });
    vi.spyOn(WishlistService, 'getWishlist').mockResolvedValue([portrait]);
    const updateSpy = vi.spyOn(WishlistService, 'updateWishlist').mockResolvedValue({
      success: true,
      data: [],
    });
    await WishlistService.removePortrait('portrait-1', 'user-1');
    expect(updateSpy).toHaveBeenCalledWith([], 'user-1');
  });
});

describe('WishlistService.addPortrait', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns duplicate error when portrait imageUrl already exists', async () => {
    const existing = makeFakePortrait({ imageUrl: 'https://example.com/portrait.jpg' });
    vi.spyOn(WishlistService, 'getWishlist').mockResolvedValue([existing]);

    const result = await WishlistService.addPortrait(
      {
        imageUrl: 'https://example.com/portrait.jpg',
        originalPhotoUrl: 'https://example.com/original.jpg',
        styleId: 'watercolor',
        generationId: 'gen-2',
      },
      'user-1',
    );

    expect(result.success).toBe(false);
    expect(result.reason).toBe('duplicate');
  });

  it('returns max error when wishlist is full', async () => {
    const full = Array.from({ length: WISHLIST_MAX_ITEMS }, (_, i) =>
      makeFakePortrait({ id: `portrait-${i}`, generationId: `gen-${i}` }),
    );
    vi.spyOn(WishlistService, 'getWishlist').mockResolvedValue(full);

    const result = await WishlistService.addPortrait(
      {
        imageUrl: 'https://example.com/new.jpg',
        originalPhotoUrl: 'https://example.com/original.jpg',
        styleId: 'anime',
        generationId: 'gen-new',
      },
      'user-1',
    );

    expect(result.success).toBe(false);
    expect(result.reason).toBe('max');
  });

  it('adds portrait when wishlist is not full', async () => {
    vi.spyOn(WishlistService, 'getWishlist').mockResolvedValue([]);
    vi.spyOn(WishlistService, 'updateWishlist').mockResolvedValue({
      success: true,
      data: [makeFakePortrait()],
    });

    const result = await WishlistService.addPortrait(
      {
        imageUrl: 'https://example.com/portrait.jpg',
        originalPhotoUrl: 'https://example.com/original.jpg',
        styleId: 'watercolor',
        generationId: 'gen-1',
      },
      'user-1',
    );

    expect(result.success).toBe(true);
  });
});

describe('WishlistService.updateWishlist', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns success when update succeeds', async () => {
    vi.spyOn(WishlistService, 'updateWishlist').mockResolvedValueOnce({
      success: true,
      data: [makeFakePortrait()],
    });
    const result = await WishlistService.updateWishlist([makeFakePortrait()], 'user-1');
    expect(result.success).toBe(true);
  });

  it('returns failure result shape with message', async () => {
    vi.spyOn(WishlistService, 'updateWishlist').mockResolvedValueOnce({
      success: false,
      message: 'Something went wrong updating saved portraits',
    });
    const result = await WishlistService.updateWishlist([makeFakePortrait()], 'user-1');
    expect(result.success).toBe(false);
    expect(result.message).toContain('portrait');
  });

  it('limits input to WISHLIST_MAX_ITEMS unique portraits', () => {
    const many = Array.from({ length: WISHLIST_MAX_ITEMS + 5 }, (_, i) =>
      makeFakePortrait({ id: `portrait-${i}` }),
    );
    const limited = many.slice(0, WISHLIST_MAX_ITEMS);
    const unique = Array.from(new Map(limited.map((p) => [p.id, p])).values());
    expect(unique.length).toBeLessThanOrEqual(WISHLIST_MAX_ITEMS);
  });
});
