import {
  buildGelatoOrderPayload,
  type GelatoFulfillmentRequest,
  getPrintableLineItems,
  type ShopifyLineItem,
  type ShopifyShippingAddress,
} from './gelato-fulfillment.service';

import { describe, expect, it } from 'vitest';

const baseAddress: ShopifyShippingAddress = {
  first_name: 'Jane',
  last_name: 'Doe',
  address1: '123 Main St',
  city: 'New York',
  province: 'NY',
  country: 'US',
  zip: '10001',
};

describe('getPrintableLineItems', () => {
  it('filters out items without final_artwork_url', () => {
    const items: ShopifyLineItem[] = [
      { id: 1, properties: [{ name: 'final_artwork_url', value: 'https://art.com/1.png' }] },
      { id: 2, properties: [] },
    ];
    expect(getPrintableLineItems(items)).toHaveLength(1);
    expect(getPrintableLineItems(items)[0].id).toBe(1);
  });

  it('filters out digital product types', () => {
    const items: ShopifyLineItem[] = [
      {
        id: 1,
        properties: [
          { name: 'final_artwork_url', value: 'https://art.com/1.png' },
          { name: 'product_type', value: 'digital' },
        ],
      },
    ];
    expect(getPrintableLineItems(items)).toHaveLength(0);
  });

  it('includes canvas and poster product types', () => {
    const items: ShopifyLineItem[] = [
      {
        id: 1,
        properties: [
          { name: 'final_artwork_url', value: 'https://art.com/1.png' },
          { name: 'product_type', value: 'canvas' },
        ],
      },
      {
        id: 2,
        properties: [
          { name: 'final_artwork_url', value: 'https://art.com/2.png' },
          { name: 'product_type', value: 'poster' },
        ],
      },
    ];
    expect(getPrintableLineItems(items)).toHaveLength(2);
  });

  it('includes items without product_type (defaults to printable)', () => {
    const items: ShopifyLineItem[] = [
      {
        id: 1,
        properties: [{ name: 'final_artwork_url', value: 'https://art.com/1.png' }],
      },
    ];
    expect(getPrintableLineItems(items)).toHaveLength(1);
  });
});

describe('buildGelatoOrderPayload', () => {
  it('throws when orderId is missing', () => {
    const request: GelatoFulfillmentRequest = {
      orderId: '',
      lineItems: [
        {
          id: 1,
          properties: [
            { name: 'final_artwork_url', value: 'https://art.com/1.png' },
            { name: 'product_type', value: 'canvas' },
          ],
        },
      ],
      shippingAddress: baseAddress,
    };
    expect(() => buildGelatoOrderPayload(request)).toThrow('Missing required fulfillment fields');
  });

  it('throws when lineItems is empty', () => {
    const request: GelatoFulfillmentRequest = {
      orderId: '123',
      lineItems: [],
      shippingAddress: baseAddress,
    };
    expect(() => buildGelatoOrderPayload(request)).toThrow('Missing required fulfillment fields');
  });

  it('throws when shippingAddress is missing', () => {
    const request = {
      orderId: '123',
      lineItems: [
        {
          id: 1,
          properties: [
            { name: 'final_artwork_url', value: 'https://art.com/1.png' },
            { name: 'product_type', value: 'canvas' },
          ],
        },
      ],
      shippingAddress: null,
    } as unknown as GelatoFulfillmentRequest;
    expect(() => buildGelatoOrderPayload(request)).toThrow('Missing required fulfillment fields');
  });

  it('throws when no printable line items', () => {
    const request: GelatoFulfillmentRequest = {
      orderId: '123',
      lineItems: [{ id: 1, properties: [{ name: 'product_type', value: 'digital' }] }],
      shippingAddress: baseAddress,
    };
    expect(() => buildGelatoOrderPayload(request)).toThrow('No printable line items found');
  });

  it('builds valid payload with canvas item', () => {
    const request: GelatoFulfillmentRequest = {
      orderId: '456',
      lineItems: [
        {
          id: 1,
          properties: [
            { name: 'final_artwork_url', value: 'https://art.com/1.png' },
            { name: 'product_type', value: 'canvas' },
          ],
        },
      ],
      shippingAddress: baseAddress,
    };
    const payload = buildGelatoOrderPayload(request);
    expect(payload.orderReferenceId).toBe('shopify-456');
    expect(payload.customerReferenceId).toBe('shopify-order-456');
    expect(payload.items).toHaveLength(1);
    expect(payload.items[0].productUid).toBeDefined();
    expect(payload.items[0].files[0].url).toBe('https://art.com/1.png');
    expect(payload.shippingAddress.firstName).toBe('Jane');
    expect(payload.shippingAddress.addressLine1).toBe('123 Main St');
  });

  it('includes address2 when provided', () => {
    const request: GelatoFulfillmentRequest = {
      orderId: '789',
      lineItems: [
        {
          id: 1,
          properties: [
            { name: 'final_artwork_url', value: 'https://art.com/1.png' },
            { name: 'product_type', value: 'poster' },
          ],
        },
      ],
      shippingAddress: { ...baseAddress, address2: 'Apt 4' },
    };
    const payload = buildGelatoOrderPayload(request);
    expect(payload.shippingAddress.addressLine2).toBe('Apt 4');
  });
});
