# ADR-005: Printful Shopify App Integration (No Direct API for Fulfillment)

## Status

Accepted

## Context

The application needs print-on-demand fulfillment for physical products (canvas, posters, apparel). Printful provides a Shopify app that handles fulfillment automatically.

## Decision

Use the Printful Shopify app for fulfillment. Do NOT make direct Printful API calls from the storefront for order fulfillment. The Printful Mockup Generator API is used only for generating product preview images.

**How it works:**
1. Printful app syncs products to Shopify (with SKUs and product/variant IDs)
2. Storefront adds items to cart with `printful_print_url` attribute
3. Customer checks out normally through Shopify
4. Printful app reads order and fulfills automatically
5. Printful sends tracking back to Shopify

## Consequences

### Positive

- No backend fulfillment code needed
- No webhooks to manage
- No Printful API keys required for fulfillment
- Automatic order processing
- Tracking synced automatically
- Simpler architecture
- Printful Mockup Generator API used for preview only (optional)

### Negative

- Less control over fulfillment process
- Dependent on Printful app functionality
- Can't customize fulfillment flow

## Implementation

When adding items to cart, include `printful_print_url`:

```typescript
{
  merchandiseId: "gid://shopify/ProductVariant/123",
  quantity: 1,
  attributes: [
    { key: "printful_print_url", value: "https://cdn.example.com/image.png" }
  ]
}
```

## Related Documentation

- [Printful Portrait Preview](./PRINTFUL_PORTRAIT_PREVIEW.md)
