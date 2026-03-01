export type ShopifyProductWebhookImage = {
  id: number;
  src: string;
  alt?: string | null;
};

export type ShopifyProductWebhookVariant = {
  id: number;
  admin_graphql_api_id?: string;
  title?: string;
};

export type ShopifyProductWebhookPayload = {
  id: number;
  admin_graphql_api_id?: string;
  title?: string;
  product_type?: string;
  vendor?: string;
  tags?: string;
  variants?: ShopifyProductWebhookVariant[];
  images?: ShopifyProductWebhookImage[];
};

export function toProductGid(restId: number, adminGraphqlApiId?: string): string {
  return adminGraphqlApiId ?? `gid://shopify/Product/${restId}`;
}

export function toVariantGid(restId: number, adminGraphqlApiId?: string): string {
  return adminGraphqlApiId ?? `gid://shopify/ProductVariant/${restId}`;
}
