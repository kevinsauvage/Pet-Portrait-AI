import { WISHLIST_MAX_ITEMS, WishlistService } from './wishlist.service';

import { afterEach, describe, expect, it, vi } from 'vitest';

describe('WishlistService.addProductWithValidation', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns duplicate error when product is already in wishlist', async () => {
    vi.spyOn(WishlistService, 'getWishlistIds').mockResolvedValue(['prod-1']);

    const result = await WishlistService.addProductWithValidation('prod-1', 'user-1');

    expect(result).toEqual({
      success: false,
      reason: 'duplicate',
      message: 'Product already in wishlist',
    });
  });

  it('returns max error when wishlist is full', async () => {
    const fullWishlist = Array.from({ length: WISHLIST_MAX_ITEMS }, (_, index) => `prod-${index}`);
    vi.spyOn(WishlistService, 'getWishlistIds').mockResolvedValue(fullWishlist);

    const result = await WishlistService.addProductWithValidation('new-prod', 'user-1');

    expect(result.success).toBe(false);
    expect(result.reason).toBe('max');
    expect(result.message).toContain(`${WISHLIST_MAX_ITEMS}`);
  });

  it('adds product when wishlist is not full and does not contain product', async () => {
    vi.spyOn(WishlistService, 'getWishlistIds').mockResolvedValue([]);

    const addProductMock = vi.spyOn(WishlistService, 'addProduct').mockResolvedValue({
      success: true,
      data: ['new-prod'],
      message: 'Product correctly added to wishlist',
    });

    const result = await WishlistService.addProductWithValidation('new-prod', 'user-1');

    expect(addProductMock).toHaveBeenCalledWith('new-prod', 'user-1');
    expect(result).toEqual({
      success: true,
      wishlistIds: ['new-prod'],
      message: 'Product correctly added to wishlist',
    });
  });

  it('returns update_failed when underlying update fails', async () => {
    vi.spyOn(WishlistService, 'getWishlistIds').mockResolvedValue([]);

    vi.spyOn(WishlistService, 'addProduct').mockResolvedValue({
      success: false,
      message: 'Something went wrong',
    });

    const result = await WishlistService.addProductWithValidation('new-prod', 'user-1');

    expect(result.success).toBe(false);
    expect(result.reason).toBe('update_failed');
    expect(result.message).toBe('Something went wrong');
  });
});
