import {
  fulfillGelatoFromShopifyOrder,
  type ShopifyOrderWebhookPayload,
} from './shopify-orders-webhook.service';

import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('./gelato-fulfillment.service', async (importOriginal) => {
  const mod = await importOriginal<typeof import('./gelato-fulfillment.service')>();
  return {
    ...mod,
    createGelatoFulfillmentOrder: vi.fn(),
  };
});

const { createGelatoFulfillmentOrder } = await import('./gelato-fulfillment.service');

describe('fulfillGelatoFromShopifyOrder', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns no_printable_items when line items have no printable artwork', async () => {
    const order: ShopifyOrderWebhookPayload = {
      id: 1,
      line_items: [
        {
          id: 1,
          properties: [
            { name: 'final_artwork_url', value: 'https://art.com/1.png' },
            { name: 'product_type', value: 'digital' },
          ],
        },
      ],
      shipping_address: {
        first_name: 'Jane',
        last_name: 'Doe',
        address1: '123 Main St',
        city: 'NY',
        province: 'NY',
        country: 'US',
        zip: '10001',
      },
    };
    const result = await fulfillGelatoFromShopifyOrder(order);
    expect(result).toEqual({ podOrders: 0, skippedReason: 'no_printable_items' });
    expect(createGelatoFulfillmentOrder).not.toHaveBeenCalled();
  });

  it('returns missing_shipping_address when shipping address is absent', async () => {
    const order: ShopifyOrderWebhookPayload = {
      id: 1,
      line_items: [
        {
          id: 1,
          properties: [{ name: 'final_artwork_url', value: 'https://art.com/1.png' }],
        },
      ],
    };
    const result = await fulfillGelatoFromShopifyOrder(order);
    expect(result).toEqual({ podOrders: 0, skippedReason: 'missing_shipping_address' });
    expect(createGelatoFulfillmentOrder).not.toHaveBeenCalled();
  });

  it('returns success when Gelato order succeeds', async () => {
    const createMock = createGelatoFulfillmentOrder as ReturnType<typeof vi.fn>;
    createMock.mockResolvedValue({ ok: true });

    const order: ShopifyOrderWebhookPayload = {
      id: 1,
      line_items: [
        {
          id: 1,
          properties: [{ name: 'final_artwork_url', value: 'https://art.com/1.png' }],
        },
      ],
      shipping_address: {
        first_name: 'Jane',
        last_name: 'Doe',
        address1: '123 Main St',
        city: 'NY',
        province: 'NY',
        country: 'US',
        zip: '10001',
      },
    };
    const result = await fulfillGelatoFromShopifyOrder(order);
    expect(result).toEqual({ podOrders: 1 });
    expect(createMock).toHaveBeenCalledWith({
      orderId: '1',
      lineItems: expect.any(Array),
      shippingAddress: order.shipping_address,
    });
  });

  it('returns gelatoError when Gelato API returns not ok', async () => {
    const createMock = createGelatoFulfillmentOrder as ReturnType<typeof vi.fn>;
    createMock.mockResolvedValue({ ok: false, status: 500, errorText: 'Server error' });

    const order: ShopifyOrderWebhookPayload = {
      id: 1,
      line_items: [
        {
          id: 1,
          properties: [{ name: 'final_artwork_url', value: 'https://art.com/1.png' }],
        },
      ],
      shipping_address: {
        first_name: 'Jane',
        last_name: 'Doe',
        address1: '123 Main St',
        city: 'NY',
        province: 'NY',
        country: 'US',
        zip: '10001',
      },
    };
    const result = await fulfillGelatoFromShopifyOrder(order);
    expect(result.podOrders).toBe(1);
    expect(result.gelatoError).toEqual({
      status: 500,
      message: 'Server error',
    });
  });

  it('returns gelatoError when Gelato throws', async () => {
    const createMock = createGelatoFulfillmentOrder as ReturnType<typeof vi.fn>;
    createMock.mockRejectedValue(new Error('Network failure'));

    const order: ShopifyOrderWebhookPayload = {
      id: 1,
      line_items: [
        {
          id: 1,
          properties: [{ name: 'final_artwork_url', value: 'https://art.com/1.png' }],
        },
      ],
      shipping_address: {
        first_name: 'Jane',
        last_name: 'Doe',
        address1: '123 Main St',
        city: 'NY',
        province: 'NY',
        country: 'US',
        zip: '10001',
      },
    };
    const result = await fulfillGelatoFromShopifyOrder(order);
    expect(result.podOrders).toBe(1);
    expect(result.gelatoError?.message).toBe('Network failure');
  });
});
