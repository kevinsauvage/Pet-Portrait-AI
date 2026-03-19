import type { NextRequest } from 'next/server';

import { CartService } from '@/domains/cart/cart.service';

import { PATCH } from './route';

import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/domains/cart/cart.service', () => ({
  CartService: {
    getCartId: vi.fn(),
    updateDiscountCodes: vi.fn(),
    revalidate: vi.fn(),
  },
}));

describe('/api/cart/discount-codes route', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('PATCH applies discount codes successfully', async () => {
    const getCartIdMock = CartService.getCartId as unknown as ReturnType<typeof vi.fn>;
    getCartIdMock.mockResolvedValue('cart-123');

    const updateDiscountCodesMock = CartService.updateDiscountCodes as unknown as ReturnType<
      typeof vi.fn
    >;
    updateDiscountCodesMock.mockResolvedValue({
      cart: { id: 'cart-123', discountCodes: ['DISCOUNT10'] },
      userErrors: [],
      warnings: [],
    });

    const request = {
      json: vi.fn().mockResolvedValue({ discountCodes: ['DISCOUNT10'] }),
      nextUrl: { searchParams: new URLSearchParams() },
    } as unknown as NextRequest;

    const response = await PATCH(request);

    expect(response.status).toBe(200);
    const body = (await (response as any).json()) as any;
    expect(body.success).toBe(true);
    expect(body.message).toBe('Discount codes updated successfully');
    expect(updateDiscountCodesMock).toHaveBeenCalledWith(
      'cart-123',
      ['DISCOUNT10'],
      expect.any(Object),
    );
  });

  it('returns 404 when cart not found', async () => {
    const getCartIdMock = CartService.getCartId as unknown as ReturnType<typeof vi.fn>;
    getCartIdMock.mockResolvedValue(null);

    const request = {
      json: vi.fn().mockResolvedValue({ discountCodes: ['DISCOUNT10'] }),
      nextUrl: { searchParams: new URLSearchParams() },
    } as unknown as NextRequest;

    const response = await PATCH(request);

    expect(response.status).toBe(404);
    const body = (await (response as any).json()) as any;
    expect(body.error).toBeDefined();
    expect(body.success).toBeUndefined();
  });

  it('returns 400 for invalid request body', async () => {
    const getCartIdMock = CartService.getCartId as unknown as ReturnType<typeof vi.fn>;
    getCartIdMock.mockResolvedValue('cart-123');

    const request = {
      json: vi.fn().mockResolvedValue({ invalid: 'data' }),
      nextUrl: { searchParams: new URLSearchParams() },
    } as unknown as NextRequest;

    const response = await PATCH(request);

    expect(response.status).toBe(400);
    const body = (await (response as any).json()) as any;
    expect(body.error).toBeDefined();
    expect(body.success).toBeUndefined();
  });

  it('returns 400 when Shopify returns user errors', async () => {
    const getCartIdMock = CartService.getCartId as unknown as ReturnType<typeof vi.fn>;
    getCartIdMock.mockResolvedValue('cart-123');

    const updateDiscountCodesMock = CartService.updateDiscountCodes as unknown as ReturnType<
      typeof vi.fn
    >;
    updateDiscountCodesMock.mockResolvedValue({
      cart: null,
      userErrors: [{ field: ['discountCodes'], message: 'Invalid discount code' }],
      warnings: [],
    });

    const request = {
      json: vi.fn().mockResolvedValue({ discountCodes: ['INVALID'] }),
      nextUrl: { searchParams: new URLSearchParams() },
    } as unknown as NextRequest;

    const response = await PATCH(request);

    expect(response.status).toBe(400);
    const body = (await (response as any).json()) as any;
    expect(body.error).toBeDefined();
    expect(body.userErrors).toBeDefined();
    expect(body.success).toBeUndefined();
  });

  it('handles errors gracefully', async () => {
    const getCartIdMock = CartService.getCartId as unknown as ReturnType<typeof vi.fn>;
    getCartIdMock.mockResolvedValue('cart-123');

    const updateDiscountCodesMock = CartService.updateDiscountCodes as unknown as ReturnType<
      typeof vi.fn
    >;
    updateDiscountCodesMock.mockRejectedValue(new Error('Network error'));

    const request = {
      json: vi.fn().mockResolvedValue({ discountCodes: ['DISCOUNT10'] }),
      nextUrl: { searchParams: new URLSearchParams() },
    } as unknown as NextRequest;

    const response = await PATCH(request);

    expect(response.status).toBe(500);
    const body = (await (response as any).json()) as any;
    expect(body.error).toBeDefined();
    expect(body.success).toBeUndefined();
  });
});
