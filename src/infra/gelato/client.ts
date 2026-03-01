const ECOMMERCE_BASE = 'https://ecommerce.gelatoapis.com/v1';

function getApiKey(): string {
  const key = process.env.GELATO_API_KEY;
  if (!key) throw new Error('Missing GELATO_API_KEY environment variable.');
  return key;
}

async function gelatoFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': getApiKey(),
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Gelato API ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

export type GelatoProductStatus = 'created' | 'publishing' | 'active' | 'publishing_error';

export type GelatoProductVariant = {
  id: string;
  productId: string;
  title: string;
  /** Shopify variant REST id when the product is connected to a Shopify store. */
  externalId: string | null;
  connectionStatus: string;
  productUid: string;
};

export type GelatoProduct = {
  id: string;
  storeId: string;
  /** Shopify product REST id when the product is connected to a Shopify store. */
  externalId: string | null;
  title: string;
  description: string;
  previewUrl: string;
  status: GelatoProductStatus;
  variants?: GelatoProductVariant[];
  tags?: string[];
  productType?: string;
  vendor?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type GelatoImagePlaceholder = {
  name: string;
  fileUrl: string;
  fitMethod?: 'slice' | 'meet';
};

export type GelatoCreateVariantInput = {
  templateVariantId: string;
  position?: number;
  imagePlaceholders?: GelatoImagePlaceholder[];
};

export type GelatoCreateProductFromTemplateInput = {
  templateId: string;
  title: string;
  description: string;
  isVisibleInTheOnlineStore?: boolean;
  salesChannels?: ('web' | 'global')[];
  variants?: GelatoCreateVariantInput[];
  tags?: string[];
  productType?: string;
  vendor?: string;
};

type GelatoProductListResponse = {
  data: GelatoProduct[];
  pagination?: { currentPage: number; totalPages: number };
};

export function getGelatoProduct(storeId: string, productId: string): Promise<GelatoProduct> {
  return gelatoFetch<GelatoProduct>(`${ECOMMERCE_BASE}/stores/${storeId}/products/${productId}`);
}

export function createGelatoProductFromTemplate(
  storeId: string,
  input: GelatoCreateProductFromTemplateInput,
): Promise<GelatoProduct> {
  return gelatoFetch<GelatoProduct>(
    `${ECOMMERCE_BASE}/stores/${storeId}/products:create-from-template`,
    { method: 'POST', body: JSON.stringify(input) },
  );
}

/**
 * Searches Gelato store products by Shopify product REST id (via `externalId`).
 * Paginates until a match is found or all pages are exhausted.
 */
export async function findGelatoProductByShopifyId(
  storeId: string,
  shopifyProductRestId: string,
): Promise<GelatoProduct | null> {
  let page = 1;

  while (true) {
    // eslint-disable-next-line no-await-in-loop
    const res = await gelatoFetch<GelatoProductListResponse>(
      `${ECOMMERCE_BASE}/stores/${storeId}/products?limit=50&page=${page}`,
    );
    const match = res.data.find((p) => p.externalId === shopifyProductRestId);
    if (match) return match;

    const totalPages = res.pagination?.totalPages ?? 1;
    if (page >= totalPages) break;
    page++;
  }

  return null;
}
