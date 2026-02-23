import {
  createGelatoOrder,
  GELATO_PRODUCT_UIDS,
  type GelatoOrderPayload,
  type GelatoOrderResult,
} from '@/infra/fulfillment/gelato';

// TODO: Replace GELATO_PRODUCT_UIDS with per-variant Gelato product UIDs (metafields or line-item properties).
type ShopifyLineItemProperty = {
  name: string;
  value: string;
};

export type ShopifyLineItem = {
  id: number;
  properties?: ShopifyLineItemProperty[];
};

export type ShopifyShippingAddress = {
  first_name: string;
  last_name: string;
  address1: string;
  address2?: string;
  city: string;
  province: string;
  country: string;
  zip: string;
};

export type GelatoFulfillmentRequest = {
  orderId: string;
  lineItems: ShopifyLineItem[];
  shippingAddress: ShopifyShippingAddress;
};

const getProperty = (
  properties: ShopifyLineItemProperty[] | undefined,
  name: string,
): string | undefined => properties?.find((property) => property.name === name)?.value;

export const getPrintableLineItems = (lineItems: ShopifyLineItem[]): ShopifyLineItem[] => {
  return lineItems.filter((item) => {
    const artworkUrl = getProperty(item.properties, 'final_artwork_url');
    if (!artworkUrl) return false;

    const productType = getProperty(item.properties, 'product_type');
    if (productType === 'digital') return false;

    return productType === 'canvas' || productType === 'poster' || !productType;
  });
};

export const buildGelatoOrderPayload = (
  request: GelatoFulfillmentRequest,
): GelatoOrderPayload => {
  const { orderId, lineItems, shippingAddress } = request;

  if (!orderId || !lineItems.length || !shippingAddress) {
    throw new Error('Missing required fulfillment fields');
  }

  const printableLineItems = getPrintableLineItems(lineItems);
  if (!printableLineItems.length) {
    throw new Error('No printable line items found');
  }

  const gelatoItems = printableLineItems.map((item, index) => {
    const artworkUrl = getProperty(item.properties, 'final_artwork_url');
    if (!artworkUrl) {
      throw new Error(`Line item ${item.id} missing artwork URL`);
    }

    const productType = getProperty(item.properties, 'product_type');
    const productUid =
      productType === 'canvas' ? GELATO_PRODUCT_UIDS.canvas : GELATO_PRODUCT_UIDS.poster;

    return {
      itemReferenceId: `item-${item.id}-${index}`,
      productUid,
      quantity: 1,
      files: [
        {
          url: artworkUrl,
          type: 'default' as const,
        },
      ],
    };
  });

  return {
    orderReferenceId: `shopify-${orderId}`,
    customerReferenceId: `shopify-order-${orderId}`,
    shippingAddress: {
      firstName: shippingAddress.first_name,
      lastName: shippingAddress.last_name,
      addressLine1: shippingAddress.address1,
      addressLine2: shippingAddress.address2 ?? '',
      city: shippingAddress.city,
      state: shippingAddress.province,
      postCode: shippingAddress.zip,
      country: shippingAddress.country,
    },
    items: gelatoItems,
  };
};

export const createGelatoFulfillmentOrder = async (
  request: GelatoFulfillmentRequest,
): Promise<GelatoOrderResult> => {
  const payload = buildGelatoOrderPayload(request);
  return createGelatoOrder(payload);
};
