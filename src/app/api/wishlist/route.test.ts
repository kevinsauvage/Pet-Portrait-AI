import type { NextRequest } from 'next/server';

import { getUser } from '@/domains/user/get-user';
import { WishlistService } from '@/domains/wishlist/services/wishlist.service';

import { GET, POST } from './route';

import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/domains/wishlist/services/wishlist.service', () => ({
  WishlistService: {
    getWishlist: vi.fn(),
    requireAuth: vi.fn(),
    addProductWithValidation: vi.fn(),
  },
}));

vi.mock('@/domains/user/get-user', () => ({
  getUser: vi.fn(),
}));

describe('/api/wishlist route', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('GET returns wishlist from service', async () => {
    const wishlist = [{ id: 'prod-1' }] as unknown[];
    const getWishlistMock = WishlistService.getWishlist as unknown as ReturnType<typeof vi.fn>;
    getWishlistMock.mockResolvedValue(wishlist);

    const response = await GET();

    expect(response.status).toBe(200);

    const body = (await (response as any).json()) as any;
    expect(body.success).toBe(true);
    expect(body.data).toEqual(wishlist);
  });

  it('POST adds a product and returns updated wishlist', async () => {
    const requireAuthMock = WishlistService.requireAuth as unknown as ReturnType<typeof vi.fn>;
    requireAuthMock.mockResolvedValue('token');

    const getUserMock = getUser as unknown as ReturnType<typeof vi.fn>;
    getUserMock.mockResolvedValue({ id: 'user-1' });

    const addProductWithValidationMock =
      WishlistService.addProductWithValidation as unknown as ReturnType<typeof vi.fn>;
    addProductWithValidationMock.mockResolvedValue({
      success: true,
      wishlistIds: ['prod-1'],
      message: 'Product correctly added to wishlist',
    });

    const wishlist = [{ id: 'prod-1' }] as unknown[];
    const getWishlistMock = WishlistService.getWishlist as unknown as ReturnType<typeof vi.fn>;
    getWishlistMock.mockResolvedValue(wishlist);

    const request = {
      json: vi.fn().mockResolvedValue({ productId: 'prod-1' }),
    } as unknown as NextRequest;

    const response = await POST(request);

    expect(requireAuthMock).toHaveBeenCalled();
    expect(addProductWithValidationMock).toHaveBeenCalledWith('prod-1', 'user-1');

    expect(response.status).toBe(200);
    const body = (await (response as any).json()) as any;

    expect(body.success).toBe(true);
    expect(body.data).toEqual(wishlist);
    expect(body.message).toBe('Product correctly added to wishlist');
    expect((response as any).headers.get('Cache-Control')).toContain('no-store');
  });

  it('POST returns validation error when productId is missing', async () => {
    const requireAuthMock = WishlistService.requireAuth as unknown as ReturnType<typeof vi.fn>;
    requireAuthMock.mockResolvedValue('token');

    const getUserMock = getUser as unknown as ReturnType<typeof vi.fn>;
    getUserMock.mockResolvedValue({ id: 'user-1' });

    const addProductWithValidationMock =
      WishlistService.addProductWithValidation as unknown as ReturnType<typeof vi.fn>;

    const request = {
      json: vi.fn().mockResolvedValue({}),
    } as unknown as NextRequest;

    const response = await POST(request);

    expect(response.status).toBe(400);
    const body = (await (response as any).json()) as any;

    expect(body.error).toBe('A valid product ID is required.');
    expect(typeof body.message).toBe('string');
    expect(body.message).toContain('Invalid input');
    expect(addProductWithValidationMock).not.toHaveBeenCalled();
  });
});
