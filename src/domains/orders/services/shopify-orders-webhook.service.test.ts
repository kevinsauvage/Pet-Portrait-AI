import {
  inspectShopifyOrder,
  type ShopifyOrderWebhookPayload,
} from './shopify-orders-webhook.service';

import { describe, expect, it } from 'vitest';

describe('inspectShopifyOrder', () => {
  it('counts physical POD items with Custom Artwork URL', () => {
    const order: ShopifyOrderWebhookPayload = {
      id: 1,
      line_items: [
        {
          id: 1,
          properties: [
            { name: 'Custom Artwork URL', value: 'https://art.com/1.png' },
            { name: 'product_type', value: 'canvas' },
          ],
        },
        {
          id: 2,
          properties: [
            { name: 'Custom Artwork URL', value: 'https://art.com/2.png' },
            { name: 'product_type', value: 'poster' },
          ],
        },
      ],
    };
    const result = inspectShopifyOrder(order);
    expect(result.orderId).toBe('1');
    expect(result.physicalPodItems).toBe(2);
    expect(result.skippedDigitalItems).toBe(0);
    expect(result.missingArtworkItems).toBe(0);
  });

  it('skips digital items', () => {
    const order: ShopifyOrderWebhookPayload = {
      id: 2,
      line_items: [
        {
          id: 1,
          properties: [
            { name: 'Custom Artwork URL', value: 'https://art.com/1.png' },
            { name: 'product_type', value: 'digital' },
          ],
        },
      ],
    };
    const result = inspectShopifyOrder(order);
    expect(result.physicalPodItems).toBe(0);
    expect(result.skippedDigitalItems).toBe(1);
    expect(result.missingArtworkItems).toBe(0);
  });

  it('counts items missing Custom Artwork URL', () => {
    const order: ShopifyOrderWebhookPayload = {
      id: 3,
      line_items: [
        { id: 1, properties: [{ name: 'product_type', value: 'canvas' }] },
        { id: 2, properties: [] },
      ],
    };
    const result = inspectShopifyOrder(order);
    expect(result.physicalPodItems).toBe(0);
    expect(result.missingArtworkItems).toBe(2);
  });

  it('treats items without product_type as physical', () => {
    const order: ShopifyOrderWebhookPayload = {
      id: 4,
      line_items: [
        {
          id: 1,
          properties: [{ name: 'Custom Artwork URL', value: 'https://art.com/1.png' }],
        },
      ],
    };
    const result = inspectShopifyOrder(order);
    expect(result.physicalPodItems).toBe(1);
    expect(result.skippedDigitalItems).toBe(0);
  });

  it('handles empty line items', () => {
    const order: ShopifyOrderWebhookPayload = { id: 5, line_items: [] };
    const result = inspectShopifyOrder(order);
    expect(result.orderId).toBe('5');
    expect(result.physicalPodItems).toBe(0);
    expect(result.skippedDigitalItems).toBe(0);
    expect(result.missingArtworkItems).toBe(0);
  });

  it('handles missing line_items', () => {
    const order: ShopifyOrderWebhookPayload = { id: 6 };
    const result = inspectShopifyOrder(order);
    expect(result.physicalPodItems).toBe(0);
  });
});
