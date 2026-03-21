import type { NextRequest } from 'next/server';

import { CartService } from '@/domains/cart/cart.service';
import {
  apiErrorBodySchema,
  apiSuccessBodySchema,
  parseApiRouteJson,
} from '@/test-support/api-route-response';

import { PATCH } from './route';

import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/domains/cart/cart.service', () => ({
  CartService: {
    getCartId: vi.fn(),
    updateBuyerIdentity: vi.fn(),
    revalidate: vi.fn(),
  },
}));

vi.mock('@/domains/cart/cart-buyer-identity', () => ({
  buildBuyerIdentityInput: vi.fn((input) => ({
    customerAccessToken: input.customerAccessToken,
    email: input.user?.email,
    phone: input.user?.phone,
  })),
}));

describe('/api/cart/buyer-identity route', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('PATCH updates buyer identity successfully', async () => {
    const getCartIdMock = CartService.getCartId as unknown as ReturnType<typeof vi.fn>;
    getCartIdMock.mockResolvedValue('cart-123');

    const updateBuyerIdentityMock = CartService.updateBuyerIdentity as unknown as ReturnType<
      typeof vi.fn
    >;
    updateBuyerIdentityMock.mockResolvedValue({
      cart: { id: 'cart-123', buyerIdentity: { email: 'test@example.com' } },
      userErrors: [],
    });

    const request = {
      json: vi.fn().mockResolvedValue({
        customerAccessToken: 'token-123',
        user: {
          email: 'test@example.com',
          phone: '+1234567890',
        },
      }),
    } as unknown as NextRequest;

    const response = await PATCH(request);

    expect(response.status).toBe(200);
    const body = await parseApiRouteJson(response, apiSuccessBodySchema);
    expect(body.success).toBe(true);
    expect(body.message).toBe('Cart buyer identity updated successfully');
    expect(updateBuyerIdentityMock).toHaveBeenCalled();
  });

  it('PATCH updates buyer identity with customer access token', async () => {
    const getCartIdMock = CartService.getCartId as unknown as ReturnType<typeof vi.fn>;
    getCartIdMock.mockResolvedValue('cart-123');

    const updateBuyerIdentityMock = CartService.updateBuyerIdentity as unknown as ReturnType<
      typeof vi.fn
    >;
    updateBuyerIdentityMock.mockResolvedValue({
      cart: { id: 'cart-123', buyerIdentity: { customerAccessToken: 'token-123' } },
      userErrors: [],
    });

    const request = {
      json: vi.fn().mockResolvedValue({
        customerAccessToken: 'token-123',
        user: {}, // Schema requires user object even if empty
      }),
    } as unknown as NextRequest;

    const response = await PATCH(request);

    expect(response.status).toBe(200);
    const body = await parseApiRouteJson(response, apiSuccessBodySchema);
    expect(body.success).toBe(true);
    expect(updateBuyerIdentityMock).toHaveBeenCalled();
  });

  it('returns 404 when cart not found', async () => {
    const getCartIdMock = CartService.getCartId as unknown as ReturnType<typeof vi.fn>;
    getCartIdMock.mockResolvedValue(null);

    const request = {
      json: vi.fn().mockResolvedValue({
        customerAccessToken: 'token-123',
        user: { email: 'test@example.com' },
      }),
    } as unknown as NextRequest;

    const response = await PATCH(request);

    expect(response.status).toBe(404);
    const body = await parseApiRouteJson(response, apiErrorBodySchema);
    expect(body.error).toBeDefined();
  });

  it('returns 400 for invalid request body', async () => {
    const getCartIdMock = CartService.getCartId as unknown as ReturnType<typeof vi.fn>;
    getCartIdMock.mockResolvedValue('cart-123');

    const request = {
      json: vi.fn().mockResolvedValue({ invalid: 'data' }),
    } as unknown as NextRequest;

    const response = await PATCH(request);

    expect(response.status).toBe(400);
    const body = await parseApiRouteJson(response, apiErrorBodySchema);
    expect(body.error).toBeDefined();
  });

  it('returns 400 when Shopify returns user errors', async () => {
    const getCartIdMock = CartService.getCartId as unknown as ReturnType<typeof vi.fn>;
    getCartIdMock.mockResolvedValue('cart-123');

    const updateBuyerIdentityMock = CartService.updateBuyerIdentity as unknown as ReturnType<
      typeof vi.fn
    >;
    updateBuyerIdentityMock.mockResolvedValue({
      cart: null,
      userErrors: [{ field: ['email'], message: 'Invalid email format' }],
    });

    const request = {
      json: vi.fn().mockResolvedValue({
        customerAccessToken: 'token-123',
        user: { email: 'valid@example.com' }, // Use valid email to pass schema validation
      }),
    } as unknown as NextRequest;

    const response = await PATCH(request);

    expect(response.status).toBe(400);
    const body = await parseApiRouteJson(response, apiErrorBodySchema);
    expect(body.error).toBeDefined();
    expect(body.userErrors).toBeDefined();
  });

  it('handles errors gracefully', async () => {
    const getCartIdMock = CartService.getCartId as unknown as ReturnType<typeof vi.fn>;
    getCartIdMock.mockResolvedValue('cart-123');

    const updateBuyerIdentityMock = CartService.updateBuyerIdentity as unknown as ReturnType<
      typeof vi.fn
    >;
    updateBuyerIdentityMock.mockRejectedValue(new Error('Network error'));

    const request = {
      json: vi.fn().mockResolvedValue({
        customerAccessToken: 'token-123',
        user: { email: 'test@example.com' },
      }),
    } as unknown as NextRequest;

    const response = await PATCH(request);

    // Error should be 500 since updateBuyerIdentity throws
    expect(response.status).toBe(500);
    const body = await parseApiRouteJson(response, apiErrorBodySchema);
    expect(body.error).toBeDefined();
  });
});
