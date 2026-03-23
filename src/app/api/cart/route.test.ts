import { NextRequest } from 'next/server';

import { CartService } from '@/domains/cart/cart.service';
import {
  apiErrorBodySchema,
  apiSuccessBodySchema,
  parseApiRouteJson,
} from '@/test-support/api-route-response';

import { GET } from './route';

import { afterEach, describe, expect, it, vi } from 'vitest';

const cartGetRequest = () => new NextRequest('http://localhost/api/cart');

vi.mock('@/domains/cart/cart.service', () => ({
  CartService: {
    getCartId: vi.fn(),
    getCart: vi.fn(),
  },
}));

describe('/api/cart route', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('GET returns cart when cart exists', async () => {
    const mockCart = {
      id: 'cart-123',
      lines: { edges: [] },
      checkoutUrl: 'https://checkout.shopify.com/cart-123',
    };

    const getCartIdMock = CartService.getCartId as unknown as ReturnType<typeof vi.fn>;
    getCartIdMock.mockResolvedValue('cart-123');

    const getCartMock = CartService.getCart as unknown as ReturnType<typeof vi.fn>;
    getCartMock.mockResolvedValue(mockCart);

    const response = await GET(cartGetRequest());

    expect(response.status).toBe(200);
    const body = await parseApiRouteJson(response, apiSuccessBodySchema);
    expect(body.success).toBe(true);
    expect(body.data).toEqual(mockCart);
  });

  it('GET returns 404 when no cart id exists', async () => {
    const getCartIdMock = CartService.getCartId as unknown as ReturnType<typeof vi.fn>;
    getCartIdMock.mockResolvedValue(null);

    const response = await GET(cartGetRequest());

    expect(response.status).toBe(404);
    const body = await parseApiRouteJson(response, apiErrorBodySchema);
    expect(body.error).toBeDefined();
  });

  it('GET returns 404 when cart does not exist', async () => {
    const getCartIdMock = CartService.getCartId as unknown as ReturnType<typeof vi.fn>;
    getCartIdMock.mockResolvedValue('cart-123');

    const getCartMock = CartService.getCart as unknown as ReturnType<typeof vi.fn>;
    getCartMock.mockResolvedValue(null);

    const response = await GET(cartGetRequest());

    expect(response.status).toBe(404);
    const body = await parseApiRouteJson(response, apiErrorBodySchema);
    expect(body.error).toBeDefined();
  });

  it('GET handles errors gracefully', async () => {
    const getCartIdMock = CartService.getCartId as unknown as ReturnType<typeof vi.fn>;
    getCartIdMock.mockResolvedValue('cart-123');

    const getCartMock = CartService.getCart as unknown as ReturnType<typeof vi.fn>;
    getCartMock.mockRejectedValue(new Error('Database error'));

    const response = await GET(cartGetRequest());

    expect(response.status).toBe(500);
    const body = await parseApiRouteJson(response, apiErrorBodySchema);
    expect(body.error).toBeDefined();
  });
});
