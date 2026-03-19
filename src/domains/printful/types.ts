export interface PrintfulVariantIdSource {
  metafields?: Array<{ namespace: string; key: string; value: string } | null>;
  sku?: string | null;
}
