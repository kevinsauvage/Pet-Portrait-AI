# Printful Dynamic Portrait Preview

Dynamic product mockup generation using the Printful Mockup Generator API.

---

## End-to-End Flow

### 1️⃣ User Uploads & AI Generation

- User uploads a pet photo
- AI generates multiple portrait variations (OpenAI Images API)
- Store selected portrait on CDN (permanent URL)

### 2️⃣ Product Selection & Variant Mapping

- User selects a product (canvas, poster, mug, etc.)
- Each Shopify product variant has:
  - **Shopify variant ID** → used for cart/checkout
  - **Metafield `custom.variant_id`** → Printful variant ID for mockups
- Metafield is fetched when loading products: `Shopify Variant → custom.variant_id → Printful variant ID`

### 3️⃣ Generate Preview Mockup

- Server-side API route receives: Printful variant ID, user AI image URL (product_id derived from variant via Catalog API)
- Calls Printful Mockup Generator API:
  ```json
  {
    "variant_ids": [printful_variant_id],
    "files": [{ "placement": "...", "image_url": "<user-ai-image-url>", "position": {...} }],
    "format": "jpg"
  }
  ```
- Receive mockup URL → return to frontend
- Display mockup preview to user

**Optimization:** Mockups are cached per product/variant/artwork. Generated on-demand only (no pre-generation for 100+ products).

### 4️⃣ Add to Cart & Checkout

- Add **Shopify variant ID** to cart (`merchandiseId`)
- Add line item attribute `printful_print_url` = user AI image URL
- Checkout normally
- Printful Shopify App automatically fulfills using `printful_print_url`

### 5️⃣ Key IDs Summary

| Purpose | ID to Use |
|---------|-----------|
| Shopify variant for checkout | `gid://shopify/ProductVariant/<numeric_id>` |
| Printful variant for mockups | `custom.variant_id` metafield value (product_id derived via Catalog API) |
| User AI image for printing | `printful_print_url` line item attribute |

### 6️⃣ Advantages

- **Scalable:** Works with 100+ products
- **Secure:** Printful API key stays server-side
- **Fast:** Mockups cached, API calls minimized
- **Clean:** Shopify is source of truth, fulfillment automatic
- **Flexible:** Supports multiple products, styles, and variants

---

## Overview

The `/create/order` page generates a **real portrait preview** showing how the user's AI-generated artwork will look on the selected product (canvas, poster, etc.). This uses Printful's Mockup Generator API.

**Product filtering:** Only products with at least one variant that has `custom.variant_id` are displayed in the create flow.

---

## Setup

### 1. Printful API Token

Add to `.env`:
```env
PRINTFUL_TOKEN=your_oauth_token
```

Get your token from: [Printful Dashboard](https://www.printful.com/dashboard/) → Settings → API

### 2. Product Identification

**Printful-synced products:** No setup needed. The app derives the Printful catalog variant ID from the SKU that Printful adds when syncing (format `{product_id}_{variant_id}`, e.g. `6868817_22791`). Only variants with a valid SKU are shown.

**Important:** The Printful dashboard shows **#53985903706441** — that is the **Shopify variant ID**, not the Printful catalog ID. The Mockup API needs the catalog ID (e.g. `22791`), which we get from the SKU.

**Manual override (optional):** If you need to support products not synced via Printful, add metafield `custom.variant_id` with the **Printful catalog variant ID** (4–6 digits, from Printful Catalog API or product image URL like `products/885/22791_...`).

### 3. Finding Printful Catalog Variant ID

- **From SKU:** Printful sync adds SKU like `6868817_22791` — the part after `_` is the catalog variant ID
- **From image URL:** In Printful dashboard product details, image URLs contain it: `products/885/22791_...`

---

## API Flow

1. **Create task:** `POST /mockup-generator/create-task/{product_id}`
   - Body: `variant_ids`, `files` (placement, image_url, position)
   - Returns: `task_key`

2. **Poll for result:** `GET /mockup-generator/task?task_key=xxx`
   - Wait at least 10 seconds before first poll
   - Poll every 5 seconds until `status: "completed"`
   - Mockup URLs expire after 72 hours

---

## Cart Attributes

| Attribute | Purpose |
|-----------|---------|
| `printful_print_url` | Print-ready artwork URL (fulfillment) |
| `printful_preview_url` | Product mockup preview URL |

---

## Rate Limits

Printful Mockup Generator API:
- **Established stores:** Up to 10 requests per 60 seconds
- **New stores:** 2 requests per 60 seconds
- **Daily limit:** 20,000 files per account per 24 hours

Preview URLs are cached (Redis) to reduce API calls.

---

## Fallback

When `PRINTFUL_TOKEN` is not set or variant lacks `custom.variant_id` metafield:
- No preview is generated
- Product image is shown instead
- Add to cart still works (fulfillment uses `printful_print_url`)

---

## Related

- [Printful Mockup Generator API](https://developers.printful.com/docs/#tag/Mockup-Generator-API)
