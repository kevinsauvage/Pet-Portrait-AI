# Gelato x Shopify Integration

How the Gelato Shopify app integrates with this storefront for automated print-on-demand fulfillment.

---

## Overview

This storefront does **not** call the Gelato API. The **Gelato Shopify app** handles everything automatically:

1. Gelato syncs products to Shopify (with template UIDs and variant SKUs).
2. Our storefront adds items to the Shopify cart with `gelato_print_url` as a line item attribute.
3. The customer checks out normally through Shopify.
4. Gelato's Shopify app reads the order, pulls the print file, and fulfills the order.
5. Gelato sends tracking information back to Shopify.

**No backend fulfillment code, no webhooks, no Gelato API calls.**

---

## 1. Shopify Product Model

Gelato's Shopify app syncs products that contain:

| Field                      | Location                                            | Purpose                                                        |
| -------------------------- | --------------------------------------------------- | -------------------------------------------------------------- |
| Title, description, images | Standard Shopify fields                             | Product display                                                |
| Variant SKUs               | `variant.sku`                                       | **Required** — Gelato matches SKUs to its print specifications |
| Template UID               | `metafield(namespace: "gelato", key: "productUid")` | Links the product to a Gelato print template                   |

### Fetching Products (Storefront API)

```graphql
query ProductByHandle($handle: String!) {
  product(handle: $handle) {
    id
    title
    variants(first: 50) {
      edges {
        node {
          id
          title
          sku
        }
      }
    }
    metafield(namespace: "gelato", key: "productUid") {
      value
    }
  }
}
```

> Every variant **must** have a SKU. Gelato will not fulfill variants without a matching SKU.

---

## 2. Cart Line Item Attributes

When adding a Gelato product to the Shopify cart, the storefront includes these attributes:

| Attribute            | Required | Purpose                                                                                  |
| -------------------- | -------- | ---------------------------------------------------------------------------------------- |
| `gelato_print_url`   | Yes      | Public, permanent URL to the print-ready image. Gelato downloads this file for printing. |
| `gelato_product_uid` | Optional | The Gelato template UID from the product metafield.                                      |
| `original_photo_url` | No       | The original uploaded photo (for display/reference only).                                |
| `chosen_style`       | No       | The AI art style selected by the user.                                                   |
| `generation_id`      | No       | Internal generation tracking ID.                                                         |
| `product_type`       | No       | Product category (digital, canvas, poster, etc.).                                        |

### Storefront API Example

```json
{
  "lines": [
    {
      "merchandiseId": "gid://shopify/ProductVariant/123",
      "quantity": 1,
      "attributes": [
        { "key": "gelato_print_url", "value": "https://cdn.example.com/final-image.png" },
        { "key": "gelato_product_uid", "value": "canvas_300x400-mm_170-gsm_4-0" }
      ]
    }
  ]
}
```

### Print File Requirements

The `gelato_print_url` must point to an image that is:

- **Public** — no authentication headers required to download
- **Permanent** — no signed URLs or expiration
- **High resolution** — minimum 150-300 DPI for the target print size
- **Direct download** — URL returns the image file, not an HTML page

We use UploadThing CDN which satisfies all of these requirements.

---

## 3. Order Flow

```
┌─────────────────────────────────────────────────────────────┐
│                        STOREFRONT                            │
│                                                              │
│  Upload photo → AI generates → User selects → Add to cart    │
│                                                              │
│  Cart attributes:                                            │
│    gelato_print_url = "https://cdn.example.com/image.png"    │
│    gelato_product_uid = "canvas_300x400-mm_..."              │
│                                                              │
│  Checkout → Standard Shopify checkout                        │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                     SHOPIFY ORDER                            │
│                                                              │
│  Order created with line items containing:                   │
│    - variant (with SKU matching Gelato spec)                 │
│    - gelato_print_url attribute                              │
│    - gelato_product_uid attribute                            │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                  GELATO SHOPIFY APP                           │
│                                                              │
│  Automatically:                                              │
│  1. Reads product metafield: gelato.productUid               │
│  2. Reads line item attribute: gelato_print_url              │
│  3. Matches variant SKU to Gelato print spec                 │
│  4. Downloads the print file from the URL                    │
│  5. Creates a print job                                      │
│  6. Ships to customer                                        │
│  7. Sends tracking info back to Shopify                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. What This Storefront Does NOT Do

- **No Gelato API calls** — No API keys, no client, no server-side Gelato code.
- **No webhooks** — No products/create or orders/create handlers needed.
- **No manual order creation** — The Gelato Shopify app handles order intake automatically.
- **No tracking/status polling** — Gelato syncs tracking back to Shopify automatically.
- **No SKU management** — Gelato sets SKUs when syncing products to Shopify.
- **No product template creation** — Templates are created in the Gelato dashboard.

---

## 5. Setup Checklist

1. **Gelato Dashboard**
   - Create product templates in Gelato.
   - Install the Gelato Shopify app on your store.
   - Connect products — Gelato syncs them to Shopify with SKUs and template UIDs.

2. **Storefront**
   - Ensure the create wizard passes `gelato_print_url` in cart line item attributes.
   - Ensure print files are hosted on a permanent public CDN (UploadThing).

3. **Verify**
   - Create a test product in Gelato and sync to Shopify.
   - Add to cart with `gelato_print_url` → checkout → confirm Gelato receives the order in the Gelato dashboard.

---

## 6. Troubleshooting

| Issue                            | Cause                                | Fix                                                                       |
| -------------------------------- | ------------------------------------ | ------------------------------------------------------------------------- |
| Gelato doesn't fulfill order     | Missing `gelato_print_url` attribute | Ensure the create wizard passes `gelato_print_url` in cart attributes     |
| Gelato rejects variant           | Missing or wrong SKU                 | Check that the variant SKU in Shopify matches the Gelato template variant |
| Print file download fails        | Signed/expired URL                   | Use a permanent public CDN URL (UploadThing provides this)                |
| Product not appearing in Shopify | Gelato sync issue                    | Check the Gelato dashboard for sync status and errors                     |
