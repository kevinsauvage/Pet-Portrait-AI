# ADR-005: Gelato Shopify App Integration (No Direct API)

## Status

**Deprecated** — Replaced by [ADR-005: Printful Shopify App Integration](./005-printful-shopify-app-integration.md)

## Context

The application needs print-on-demand fulfillment for physical products (canvas, posters, apparel). Gelato provides a Shopify app that handles fulfillment automatically.

## Decision

Use the Gelato Shopify app for fulfillment. Do NOT make direct Gelato API calls from the storefront.

**How it works:**
1. Gelato app syncs products to Shopify (with SKUs and template UIDs)
2. Storefront adds items to cart with `gelato_print_url` attribute
3. Customer checks out normally through Shopify
4. Gelato app reads order and fulfills automatically
5. Gelato sends tracking back to Shopify

## Consequences

### Positive

- No backend fulfillment code needed
- No webhooks to manage
- No Gelato API keys required
- Automatic order processing
- Tracking synced automatically
- Simpler architecture

### Negative

- Less control over fulfillment process
- Dependent on Gelato app functionality
- Can't customize fulfillment flow

## Implementation

When adding items to cart, include `gelato_print_url`:

```typescript
{
  merchandiseId: "gid://shopify/ProductVariant/123",
  quantity: 1,
  attributes: [
    { key: "gelato_print_url", value: "https://cdn.example.com/image.png" }
  ]
}
```

## Related Documentation

- [Gelato Shopify Integration](./GELATO_SHOPIFY_INTEGRATION.md)
