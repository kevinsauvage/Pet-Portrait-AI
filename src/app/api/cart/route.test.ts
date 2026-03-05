import { CartService } from '@/domains/cart/services/cart.service';

import { GET } from './route';

import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/domains/cart/services/cart.service', () => ({
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

    const response = await GET();

    expect(response.status).toBe(200);
    const body = (await (response as any).json()) as any;
    expect(body.success).toBe(true);
    expect(body.data).toEqual(mockCart);
  });

  it('GET returns 404 when no cart id exists', async () => {
    const getCartIdMock = CartService.getCartId as unknown as ReturnType<typeof vi.fn>;
    getCartIdMock.mockResolvedValue(null);

    const response = await GET();

    expect(response.status).toBe(404);
    const body = (await (response as any).json()) as any;
    expect(body.error).toBeDefined();
    expect(body.success).toBeUndefined();
  });

  it('GET returns 404 when cart does not exist', async () => {
    const getCartIdMock = CartService.getCartId as unknown as ReturnType<typeof vi.fn>;
    getCartIdMock.mockResolvedValue('cart-123');

    const getCartMock = CartService.getCart as unknown as ReturnType<typeof vi.fn>;
    getCartMock.mockResolvedValue(null);

    const response = await GET();

    expect(response.status).toBe(404);
    const body = (await (response as any).json()) as any;
    expect(body.error).toBeDefined();
    expect(body.success).toBeUndefined();
  });

  it('GET handles errors gracefully', async () => {
    const getCartIdMock = CartService.getCartId as unknown as ReturnType<typeof vi.fn>;
    getCartIdMock.mockResolvedValue('cart-123');

    const getCartMock = CartService.getCart as unknown as ReturnType<typeof vi.fn>;
    getCartMock.mockRejectedValue(new Error('Database error'));

    const response = await GET();

    expect(response.status).toBe(500);
    const body = (await (response as any).json()) as any;
    expect(body.error).toBeDefined();
    expect(body.success).toBeUndefined();
  });
});
