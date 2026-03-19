import type { NextRequest } from 'next/server';

import { CartService } from '@/domains/cart/cart.service';

import { DELETE, PATCH } from './route';

import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/domains/cart/cart.service', () => ({
  CartService: {
    getCartId: vi.fn(),
    addLines: vi.fn(),
    updateLines: vi.fn(),
    removeLines: vi.fn(),
    revalidate: vi.fn(),
  },
}));

describe('/api/cart/lines route', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('PATCH', () => {
    it('adds lines to cart successfully', async () => {
      const getCartIdMock = CartService.getCartId as unknown as ReturnType<typeof vi.fn>;
      getCartIdMock.mockResolvedValue('cart-123');

      const addLinesMock = CartService.addLines as unknown as ReturnType<typeof vi.fn>;
      addLinesMock.mockResolvedValue({
        cart: { id: 'cart-123', lines: { edges: [] } },
        userErrors: [],
      });

      const request = {
        json: vi.fn().mockResolvedValue({
          operation: 'add',
          addLines: [{ merchandiseId: 'var-1', quantity: 1 }],
        }),
        nextUrl: { searchParams: new URLSearchParams() },
      } as unknown as NextRequest;

      const response = await PATCH(request);

      expect(response.status).toBe(200);
      const body = (await (response as any).json()) as any;
      expect(body.success).toBe(true);
      expect(body.message).toBe('Product added successfully');
      expect(addLinesMock).toHaveBeenCalled();
    });

    it('updates lines in cart successfully', async () => {
      const getCartIdMock = CartService.getCartId as unknown as ReturnType<typeof vi.fn>;
      getCartIdMock.mockResolvedValue('cart-123');

      const updateLinesMock = CartService.updateLines as unknown as ReturnType<typeof vi.fn>;
      updateLinesMock.mockResolvedValue({
        cart: { id: 'cart-123', lines: { edges: [] } },
        userErrors: [],
      });

      const request = {
        json: vi.fn().mockResolvedValue({
          operation: 'update',
          lines: [{ id: 'line-1', quantity: 2 }],
        }),
        nextUrl: { searchParams: new URLSearchParams() },
      } as unknown as NextRequest;

      const response = await PATCH(request);

      expect(response.status).toBe(200);
      const body = (await (response as any).json()) as any;
      expect(body.success).toBe(true);
      expect(body.message).toBe('Cart updated successfully');
      expect(updateLinesMock).toHaveBeenCalled();
    });

    it('returns 404 when cart not found', async () => {
      const getCartIdMock = CartService.getCartId as unknown as ReturnType<typeof vi.fn>;
      getCartIdMock.mockResolvedValue(null);

      const request = {
        json: vi.fn().mockResolvedValue({
          operation: 'add',
          addLines: [{ merchandiseId: 'var-1', quantity: 1 }],
        }),
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

      const addLinesMock = CartService.addLines as unknown as ReturnType<typeof vi.fn>;
      addLinesMock.mockResolvedValue({
        cart: null,
        userErrors: [{ field: ['merchandiseId'], message: 'Invalid variant' }],
      });

      const request = {
        json: vi.fn().mockResolvedValue({
          operation: 'add',
          addLines: [{ merchandiseId: 'invalid-var', quantity: 1 }],
        }),
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

      const addLinesMock = CartService.addLines as unknown as ReturnType<typeof vi.fn>;
      addLinesMock.mockRejectedValue(new Error('Network error'));

      const request = {
        json: vi.fn().mockResolvedValue({
          operation: 'add',
          addLines: [{ merchandiseId: 'var-1', quantity: 1 }],
        }),
        nextUrl: { searchParams: new URLSearchParams() },
      } as unknown as NextRequest;

      const response = await PATCH(request);

      expect(response.status).toBe(500);
      const body = (await (response as any).json()) as any;
      expect(body.error).toBeDefined();
      expect(body.success).toBeUndefined();
    });
  });

  describe('DELETE', () => {
    it('removes line from cart successfully', async () => {
      const getCartIdMock = CartService.getCartId as unknown as ReturnType<typeof vi.fn>;
      getCartIdMock.mockResolvedValue('cart-123');

      const removeLinesMock = CartService.removeLines as unknown as ReturnType<typeof vi.fn>;
      removeLinesMock.mockResolvedValue({
        cart: { id: 'cart-123', lines: { edges: [] } },
        userErrors: [],
      });

      const request = {
        nextUrl: {
          searchParams: new URLSearchParams({ lineItemId: 'line-1' }),
        },
      } as unknown as NextRequest;

      const response = await DELETE(request);

      expect(response.status).toBe(200);
      const body = (await (response as any).json()) as any;
      expect(body.success).toBe(true);
      expect(body.message).toBe('Product removed successfully');
      expect(removeLinesMock).toHaveBeenCalledWith('cart-123', ['line-1'], expect.any(Object));
    });

    it('returns 404 when cart not found', async () => {
      const getCartIdMock = CartService.getCartId as unknown as ReturnType<typeof vi.fn>;
      getCartIdMock.mockResolvedValue(null);

      const request = {
        nextUrl: {
          searchParams: new URLSearchParams({ lineItemId: 'line-1' }),
        },
      } as unknown as NextRequest;

      const response = await DELETE(request);

      expect(response.status).toBe(404);
      const body = (await (response as any).json()) as any;
      expect(body.error).toBeDefined();
      expect(body.success).toBeUndefined();
    });

    it('returns 400 when lineItemId is missing', async () => {
      const getCartIdMock = CartService.getCartId as unknown as ReturnType<typeof vi.fn>;
      getCartIdMock.mockResolvedValue('cart-123');

      const request = {
        nextUrl: {
          searchParams: new URLSearchParams(),
        },
      } as unknown as NextRequest;

      const response = await DELETE(request);

      expect(response.status).toBe(400);
      const body = (await (response as any).json()) as any;
      expect(body.error).toBeDefined();
      expect(body.success).toBeUndefined();
    });

    it('returns 400 when Shopify returns user errors', async () => {
      const getCartIdMock = CartService.getCartId as unknown as ReturnType<typeof vi.fn>;
      getCartIdMock.mockResolvedValue('cart-123');

      const removeLinesMock = CartService.removeLines as unknown as ReturnType<typeof vi.fn>;
      removeLinesMock.mockResolvedValue({
        cart: null,
        userErrors: [{ field: ['lineItemId'], message: 'Line item not found' }],
      });

      const request = {
        nextUrl: {
          searchParams: new URLSearchParams({ lineItemId: 'invalid-line' }),
        },
      } as unknown as NextRequest;

      const response = await DELETE(request);

      expect(response.status).toBe(400);
      const body = (await (response as any).json()) as any;
      expect(body.error).toBeDefined();
      expect(body.userErrors).toBeDefined();
      expect(body.success).toBeUndefined();
    });

    it('handles errors gracefully', async () => {
      const getCartIdMock = CartService.getCartId as unknown as ReturnType<typeof vi.fn>;
      getCartIdMock.mockResolvedValue('cart-123');

      const removeLinesMock = CartService.removeLines as unknown as ReturnType<typeof vi.fn>;
      removeLinesMock.mockRejectedValue(new Error('Network error'));

      const request = {
        nextUrl: {
          searchParams: new URLSearchParams({ lineItemId: 'line-1' }),
        },
      } as unknown as NextRequest;

      const response = await DELETE(request);

      expect(response.status).toBe(500);
      const body = (await (response as any).json()) as any;
      expect(body.error).toBeDefined();
      expect(body.success).toBeUndefined();
    });
  });
});
