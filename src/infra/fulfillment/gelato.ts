export const GELATO_API_URL = 'https://order.gelatoapis.com/v4/orders';

export type GelatoOrderFile = {
  url: string;
  type: 'default';
};

export type GelatoOrderItem = {
  itemReferenceId: string;
  productUid: string;
  quantity: number;
  files: GelatoOrderFile[];
};

export type GelatoShippingAddress = {
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postCode: string;
  country: string;
};

export type GelatoOrderPayload = {
  orderReferenceId: string;
  customerReferenceId: string;
  shippingAddress: GelatoShippingAddress;
  items: GelatoOrderItem[];
};

export type GelatoOrderResult =
  | { ok: true; status: number; data: unknown }
  | { ok: false; status: number; errorText: string };

export async function createGelatoOrder(
  payload: GelatoOrderPayload,
  options: { apiKey?: string } = {},
): Promise<GelatoOrderResult> {
  const apiKey = options.apiKey ?? process.env.GELATO_API_KEY;
  if (!apiKey) {
    throw new Error('Gelato API not configured');
  }

  const response = await fetch(GELATO_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      errorText: await response.text(),
    };
  }

  return {
    ok: true,
    status: response.status,
    data: await response.json(),
  };
}
