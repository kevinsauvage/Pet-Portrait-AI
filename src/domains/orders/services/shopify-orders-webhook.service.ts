import {
  createGelatoFulfillmentOrder,
  getPrintableLineItems,
  type ShopifyLineItem,
  type ShopifyShippingAddress,
} from '@/domains/orders/services/gelato-fulfillment.service';

export type ShopifyOrderWebhookPayload = {
  id: number;
  line_items?: ShopifyLineItem[];
  shipping_address?: ShopifyShippingAddress;
};

export type ShopifyOrderFulfillmentOutcome = {
  podOrders: number;
  skippedReason?: 'no_printable_items' | 'missing_shipping_address';
  gelatoError?: { status?: number; message: string };
};

export async function fulfillGelatoFromShopifyOrder(
  order: ShopifyOrderWebhookPayload,
): Promise<ShopifyOrderFulfillmentOutcome> {
  const podItems = getPrintableLineItems(order.line_items ?? []);

  if (!podItems.length) {
    return { podOrders: 0, skippedReason: 'no_printable_items' };
  }

  if (!order.shipping_address) {
    return { podOrders: 0, skippedReason: 'missing_shipping_address' };
  }

  try {
    const result = await createGelatoFulfillmentOrder({
      orderId: String(order.id),
      lineItems: podItems,
      shippingAddress: order.shipping_address,
    });

    if (!result.ok) {
      return {
        podOrders: podItems.length,
        gelatoError: {
          status: result.status,
          message: result.errorText || 'Gelato fulfillment failed',
        },
      };
    }
  } catch (error) {
    return {
      podOrders: podItems.length,
      gelatoError: {
        message: error instanceof Error ? error.message : 'Gelato fulfillment failed',
      },
    };
  }

  return { podOrders: podItems.length };
}
