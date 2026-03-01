type LineItemProperty = { name: string; value: string };

export type ShopifyLineItem = {
  id: number;
  properties?: LineItemProperty[];
};

export type ShopifyOrderWebhookPayload = {
  id: number;
  line_items?: ShopifyLineItem[];
  shipping_address?: {
    first_name: string;
    last_name: string;
    address1: string;
    city: string;
    country: string;
  };
};

export type ShopifyOrderInspection = {
  orderId: string;
  physicalPodItems: number;
  skippedDigitalItems: number;
  missingArtworkItems: number;
};

function getProperty(
  properties: LineItemProperty[] | undefined,
  name: string,
): string | undefined {
  return properties?.find((p) => p.name === name)?.value;
}

/**
 * Inspects a Shopify order for AI portrait line items.
 * Fulfillment is handled automatically by the Gelato Shopify app via the
 * "Custom Artwork URL" line item attribute — no direct Gelato API call is needed.
 */
export function inspectShopifyOrder(
  order: ShopifyOrderWebhookPayload,
): ShopifyOrderInspection {
  const lineItems = order.line_items ?? [];

  let physicalPodItems = 0;
  let skippedDigitalItems = 0;
  let missingArtworkItems = 0;

  for (const item of lineItems) {
    const artworkUrl = getProperty(item.properties, 'Custom Artwork URL');
    const productType = getProperty(item.properties, 'product_type');

    if (!artworkUrl) {
      missingArtworkItems++;
      continue;
    }

    if (productType === 'digital') {
      skippedDigitalItems++;
    } else {
      physicalPodItems++;
    }
  }

  return {
    orderId: String(order.id),
    physicalPodItems,
    skippedDigitalItems,
    missingArtworkItems,
  };
}
