import type { NextRequest } from 'next/server';

import { getUser } from '@/domains/user/get-user';
import { WishlistService } from '@/domains/wishlist/services/wishlist.service';

import { GET, POST } from './route';

import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/domains/wishlist/services/wishlist.service', () => ({
  WishlistService: {
    getWishlist: vi.fn(),
    requireAuth: vi.fn(),
    addPortrait: vi.fn(),
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
    const wishlist = [{ id: 'portrait-1' }] as unknown[];
    const getWishlistMock = WishlistService.getWishlist as unknown as ReturnType<typeof vi.fn>;
    getWishlistMock.mockResolvedValue(wishlist);

    const response = await GET();

    expect(response.status).toBe(200);

    const body = (await (response as unknown as Response).json()) as { success: boolean; data: unknown };
    expect(body.success).toBe(true);
    expect(body.data).toEqual(wishlist);
  });

  it('POST adds a portrait and returns updated wishlist', async () => {
    const requireAuthMock = WishlistService.requireAuth as unknown as ReturnType<typeof vi.fn>;
    requireAuthMock.mockResolvedValue('token');

    const getUserMock = getUser as unknown as ReturnType<typeof vi.fn>;
    getUserMock.mockResolvedValue({ id: 'user-1' });

    const addPortraitMock = WishlistService.addPortrait as unknown as ReturnType<typeof vi.fn>;
    addPortraitMock.mockResolvedValue({
      success: true,
      data: [{ id: 'portrait-1' }],
      message: 'Portrait saved to favourites',
    });

    const getWishlistMock = WishlistService.getWishlist as unknown as ReturnType<typeof vi.fn>;
    getWishlistMock.mockResolvedValue([{ id: 'portrait-1' }]);

    const request = {
      json: vi.fn().mockResolvedValue({
        imageUrl: 'https://example.com/portrait.jpg',
        originalPhotoUrl: 'https://example.com/original.jpg',
        styleId: 'watercolor',
        generationId: 'gen-1',
      }),
    } as unknown as NextRequest;

    const response = await POST(request);

    expect(requireAuthMock).toHaveBeenCalled();
    expect(addPortraitMock).toHaveBeenCalled();

    expect(response.status).toBe(200);
    const body = (await (response as unknown as Response).json()) as {
      success: boolean;
      message: string;
    };

    expect(body.success).toBe(true);
    expect(body.message).toBe('Portrait saved to favourites');
    expect((response as unknown as Response).headers.get('Cache-Control')).toContain('no-store');
  });

  it('POST returns validation error when required fields are missing', async () => {
    const requireAuthMock = WishlistService.requireAuth as unknown as ReturnType<typeof vi.fn>;
    requireAuthMock.mockResolvedValue('token');

    const getUserMock = getUser as unknown as ReturnType<typeof vi.fn>;
    getUserMock.mockResolvedValue({ id: 'user-1' });

    const addPortraitMock = WishlistService.addPortrait as unknown as ReturnType<typeof vi.fn>;

    const request = {
      json: vi.fn().mockResolvedValue({}),
    } as unknown as NextRequest;

    const response = await POST(request);

    expect(response.status).toBe(400);
    expect(addPortraitMock).not.toHaveBeenCalled();
  });
});
