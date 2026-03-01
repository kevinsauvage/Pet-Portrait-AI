# Gelato Integration — Product Preview & Fulfillment

## How It Works Today

```
User uploads photo → AI generates artwork → User picks variation → User picks product type → Add to cart → Shopify checkout → Gelato fulfills
```

The Gelato Shopify app reads the `Custom Artwork URL` line-item attribute and prints/ships automatically. No direct Gelato API calls are made.

### What's Missing

- User never sees their artwork on a real product before buying.
- One hardcoded Shopify variant per product type (no size selection).
- No pricing shown before "Add to Cart".
- `product_type` in `CartLineArtworkAttributes` is incomplete (missing tshirt, hoodie, sticker).

---

## Proposed Flow

```
upload → style → generating → select → product & size → add-to-cart
```

After selecting their artwork variation, the user chooses a product category and size, sees a mockup preview with their artwork composited onto the product, sees the price, then adds to cart.

---

## Implementation Steps

### Step 1 — Gelato API Client

**What:** Create a thin server-side Gelato API client.

**Why:** We need to call Gelato's E-commerce API (templates, create-from-template, quote) behind a proxy to keep the API key secret and to cache responses.

**How:**

- New file: `src/infra/gelato/client.ts`
- Base URLs:
  - E-commerce: `https://ecommerce.gelatoapis.com/v1`
  - Orders/Quote: `https://order.gelatoapis.com/v3`
- Auth: `X-API-KEY` header from `GELATO_API_KEY` env var
- Typed wrapper around `fetch` with error handling
- Methods:
  - `getTemplate(templateId)` — `GET /templates/{templateId}`
  - `createProductFromTemplate(storeId, payload)` — `POST /stores/{storeId}/products:create-from-template`
  - `getProduct(storeId, productId)` — `GET /stores/{storeId}/products/{productId}`
  - `quoteOrder(payload)` — `POST /orders:quote`

```typescript
// src/infra/gelato/client.ts
const ECOMMERCE_BASE = 'https://ecommerce.gelatoapis.com/v1';
const ORDER_BASE = 'https://order.gelatoapis.com/v3';

async function gelatoFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': process.env.GELATO_API_KEY!,
      ...options?.headers,
    },
  });
  if (!res.ok) throw new Error(`Gelato API ${res.status}: ${await res.text()}`);
  return res.json() as Promise<T>;
}
```

---

### Step 2 — Product Templates Config

**What:** Replace the single-variant-per-type env-var map with a template-based config that supports multiple sizes per product.

**Why:** The current `AI_PORTRAIT_PRODUCTS` maps each product type to one Shopify variant ID via env vars. This doesn't support size variants (12x12, 16x20, 24x24) or Gelato template IDs. The seed script already creates 3 size variants for canvas and poster, but the wizard ignores them.

**How:**

- New file: `src/domains/ai/ai-portrait/templates.ts`
- Each entry maps a product category to its Gelato template ID, a list of size variants (each with Shopify variant ID, Gelato `productUid`, label, and price), and an `imagePlaceholder` name for the artwork layer.
- The Gelato template IDs and `productUid` values come from the Gelato dashboard (or `GET /templates/{id}` API call).
- Prices can be fetched from Shopify at build time or hardcoded initially.

```typescript
// src/domains/ai/ai-portrait/templates.ts

export interface ProductTemplate {
  category: ProductType;
  label: string;
  gelatoTemplateId: string;
  imagePlaceholder: string; // layer name in Gelato template (e.g. "Artwork")
  variants: TemplateVariant[];
}

export interface TemplateVariant {
  label: string;             // "12×12 in", "16×20 in"
  shopifyVariantId: string;  // gid://shopify/ProductVariant/...
  gelatoVariantId: string;   // Gelato template variant UUID
  productUid: string;        // e.g. "flat_300x300-mm_170-gsm-65lb-uncoated_4-0_ver"
  priceAmount: string;
  currencyCode: string;
}

export const PRODUCT_TEMPLATES: ProductTemplate[] = [
  // populated from Gelato dashboard + bin/seed-shopify.ts output
];
```

- Deprecate `AI_PORTRAIT_PRODUCTS` and the associated `NEXT_PUBLIC_AI_*_VARIANT_ID` env vars.
- Update `bin/seed-shopify.ts` to output created variant IDs in a format that can be pasted into this config.

---

### Step 3 — Mockup Preview via Create-from-Template

**What:** Generate a product mockup image by calling Gelato's Create Product API with the user's artwork, then polling for the preview URL.

**Why:** Gelato does not expose a standalone "composite artwork onto template" endpoint. The way to get a product mockup with custom artwork is:
1. Call `POST /stores/{storeId}/products:create-from-template` with the artwork URL as an `imagePlaceholder`.
2. The API immediately returns a product ID with `status: "created"`.
3. Gelato generates mockup images in the background.
4. Poll `GET /stores/{storeId}/products/{productId}` until `status: "active"`.
5. Read the `previewUrl` (and `externalPreviewUrl`) from the response.

This is a heavier operation than a simple mockup endpoint, but it's the actual Gelato API capability. The product created is a real Gelato store product — we can either:
- **(A) Ephemeral approach:** Create a "preview" product, grab the mockup URL, then delete or ignore it.
- **(B) Reuse approach:** Create the product once per artwork + template combination, cache the mapping, and reuse the preview URL.

Option B is better — it means the Gelato store product is already set up for fulfillment when the order comes through.

**How:**

- New API route: `POST /api/gelato/preview`
- Request body: `{ templateId, artworkUrl, variants: [{ templateVariantId, imagePlaceholder, artworkUrl }] }`
- Server-side flow:
  1. Check cache (Redis/KV or in-memory Map) for `(templateId, artworkUrl)` → existing `productId`.
  2. If cached and product is `active`, return the `previewUrl` immediately.
  3. Otherwise, call Gelato Create Product API.
  4. Poll `GET /stores/{storeId}/products/{productId}` every 2s (max 30s).
  5. Return `{ previewUrl, productId }`.
- Cache the result so repeat visits don't re-create products.

```typescript
// src/app/api/gelato/preview/route.ts
export async function POST(req: NextRequest) {
  const { templateId, artworkUrl } = await req.json();

  // 1. Check cache
  const cached = previewCache.get(cacheKey(templateId, artworkUrl));
  if (cached) return NextResponse.json(cached);

  // 2. Create product from template with artwork
  const product = await gelato.createProductFromTemplate(storeId, {
    templateId,
    variants: templateConfig.variants.map(v => ({
      templateVariantId: v.gelatoVariantId,
      imagePlaceholders: [{ name: templateConfig.imagePlaceholder, fileUrl: artworkUrl }],
    })),
  });

  // 3. Poll until active
  const ready = await pollUntilActive(storeId, product.id, { interval: 2000, timeout: 30000 });

  // 4. Cache and return
  const result = { previewUrl: ready.previewUrl, productId: ready.id };
  previewCache.set(cacheKey(templateId, artworkUrl), result);
  return NextResponse.json(result);
}
```

**Alternative — Client-Side Composite (No Gelato API):**

If the Gelato API latency or plan limitations are a concern, we can skip the Gelato API entirely for previews and composite the artwork onto static product mockup templates client-side using `<canvas>` or CSS transforms. This is simpler and instant, but less realistic. Can be a good Phase 1 while the Gelato API path is validated.

---

### Step 4 — Wizard State: Add Product & Size Selection

**What:** Extend the wizard state machine to include product/size selection between the current `select` and `add-to-cart` steps.

**Why:** The current wizard jumps from artwork selection straight to a flat list of product types. Users need to pick a product category, see a mockup, pick a size, and see the price before adding to cart.

**How:**

- File: `src/ui/components/create/useWizardState.ts`
- Add `'product'` to the `WizardStep` union (between `select` and `add-to-cart`).
- Add state fields:
  - `selectedTemplate: ProductTemplate | null`
  - `selectedVariant: TemplateVariant | null`
  - `previewUrl: string | null`
- Add actions: `setSelectedTemplate()`, `setSelectedVariant()`, `setPreviewUrl()`.
- Update `reset()` to clear these fields.

```typescript
// Before
type WizardStep = 'upload' | 'style' | 'generating' | 'select' | 'add-to-cart';

// After
type WizardStep = 'upload' | 'style' | 'generating' | 'select' | 'product' | 'add-to-cart';
```

---

### Step 5 — New StepProduct Component

**What:** A new wizard step that combines product selection, size picker, mockup preview, and pricing into a single view.

**Why:** The old proposal split this into two separate steps (`template` + `preview`), but that's over-engineered. A single step with two states (category grid → product detail) is simpler and fewer clicks for the user.

**How:**

- New file: `src/ui/components/create/StepProduct.tsx`
- **State 1 — Category Grid:** Show product categories (Poster, Canvas, T-Shirt, etc.) as cards with static preview images and starting prices. Clicking a card transitions to State 2.
- **State 2 — Product Detail:**
  - Left: Mockup preview image (from Gelato API or client-side composite). Skeleton loader with blurred artwork as placeholder while loading.
  - Right: Product name, size selector (pill chips), per-variant price, "Add to Cart" button, "Back to products" link.
- Digital products skip the mockup entirely — show the artwork as-is with a download icon.
- Selecting a different size triggers a new preview if using Gelato API (or just updates the label/price if using client-side composite since the visual difference is minimal for wall art).

---

### Step 6 — Simplify StepAddToCart

**What:** Refactor `StepAddToCart` from a product picker into a confirmation/cart-success view.

**Why:** Product selection moves to `StepProduct`. `StepAddToCart` becomes a lightweight confirmation: "Your item was added to cart" with the mockup, product name, size, price, and links to view cart or continue shopping.

**How:**

- File: `src/ui/components/create/StepAddToCart.tsx`
- Remove the product type list and variant ID lookup logic.
- Receive `selectedTemplate`, `selectedVariant`, `previewUrl` from wizard state.
- Show: mockup image, product label + size, price, "View Cart" and "Create Another" buttons.
- The actual `cartLinesAdd` call uses `selectedVariant.shopifyVariantId` instead of looking up `AI_PORTRAIT_PRODUCTS`.

---

### Step 7 — Wire Up CreateWizard

**What:** Connect the new `StepProduct` into the wizard orchestrator and update the add-to-cart handler.

**Why:** `CreateWizard.tsx` controls step rendering and the `handleAddToCart` function. It needs to render the new step and use the selected variant ID from state instead of from `AI_PORTRAIT_PRODUCTS`.

**How:**

- File: `src/ui/components/create/CreateWizard.tsx`
- Add `case 'product':` to the step-rendering switch, rendering `<StepProduct />`.
- Pass `selectedArtworkUrl`, `onSelectTemplate`, `onSelectVariant`, `onAddToCart` as props.
- Update `handleAddToCart` to read `variantId` from `selectedVariant.shopifyVariantId`.
- Update the progress indicator step count (5 → 6 visible steps, excluding `generating`).

---

### Step 8 — Fix Types & Clean Up

**What:** Fix type gaps and remove deprecated code.

**Why:** `CartLineArtworkAttributes.product_type` only includes 3 of 6 product types. Old env-var variant IDs should be removed.

**How:**

- File: `src/domains/ai/ai-portrait/types.ts`
  - Change `product_type` from `'digital' | 'canvas' | 'poster'` to `ProductType` (imported from `products.ts`).
- File: `src/domains/ai/ai-portrait/products.ts`
  - Keep `PRODUCT_TYPES`, `ProductType`, `isPhysicalProduct()`.
  - Remove `AI_PORTRAIT_PRODUCTS` (replaced by `PRODUCT_TEMPLATES`).
- File: `.env.example`
  - Add `GELATO_API_KEY` and `GELATO_STORE_ID`.
  - Remove `NEXT_PUBLIC_AI_*_VARIANT_ID` entries (now in `PRODUCT_TEMPLATES` config).
- File: `bin/seed-shopify.ts`
  - After creating products/variants, print a JSON blob of `{ category, shopifyVariantId, label }` for each variant so it can be pasted into `templates.ts`.

---

### Step 9 — Quote API for Live Pricing (Optional, Phase 2)

**What:** Use Gelato's Quote API to show production cost + shipping estimate to the user.

**Why:** Currently no pricing is shown. Shopify product prices are set at seed time and don't reflect Gelato's actual production cost or shipping to the user's country. The Quote API returns per-item cost and available shipping methods with delivery estimates.

**How:**

- New API route: `GET /api/gelato/quote?productUid=...&country=US`
- Server calls `POST https://order.gelatoapis.com/v3/orders:quote` with a minimal payload.
- Returns `{ productPrice, currency, shippingMethods: [{ name, price, minDays, maxDays }] }`.
- `StepProduct` can display "Estimated delivery: 5-7 days" and shipping cost alongside the product price.
- This is optional for MVP — hardcoded prices from `PRODUCT_TEMPLATES` work for Phase 1.

---

## Gelato API Reference (Relevant Endpoints)

| Endpoint | Method | Base URL | Purpose |
|---|---|---|---|
| `/templates/{templateId}` | GET | `ecommerce.gelatoapis.com/v1` | Get template info: variants, image placeholders, preview URL |
| `/stores/{storeId}/products:create-from-template` | POST | `ecommerce.gelatoapis.com/v1` | Create product with custom artwork → generates mockups in background |
| `/stores/{storeId}/products/{productId}` | GET | `ecommerce.gelatoapis.com/v1` | Check product status, get preview URLs when `status: "active"` |
| `/orders:quote` | POST | `order.gelatoapis.com/v3` | Get production cost + shipping methods/prices for a product |

Auth: all require `X-API-KEY` header. All requests over HTTPS.

---

## Environment Variables

```bash
# New (server-only)
GELATO_API_KEY=...            # Gelato REST API key
GELATO_STORE_ID=...           # Gelato store ID (from dashboard URL)

# Deprecated (remove after migration)
NEXT_PUBLIC_AI_DIGITAL_VARIANT_ID=...
NEXT_PUBLIC_AI_CANVAS_VARIANT_ID=...
NEXT_PUBLIC_AI_POSTER_VARIANT_ID=...
```

---

## Architecture

```
Browser (CreateWizard)
  │
  ├─ StepUpload → StepStyle → StepGenerating → StepSelect
  │
  ├─ StepProduct (NEW)
  │    ├─ Category grid (static images + prices from PRODUCT_TEMPLATES)
  │    └─ Product detail (mockup preview, size picker, price)
  │         │
  │         └─ POST /api/gelato/preview ──→ Gelato Create-from-Template API
  │                                          └─ Poll GET product until active
  │                                          └─ Return previewUrl
  │
  └─ StepAddToCart (simplified confirmation)
       │
       └─ Shopify Storefront API: cartLinesAdd
            └─ attributes: [Custom Artwork URL, product_type, ...]
                 │
                 └─ Gelato Shopify App syncs order → prints → ships
```

---

## Shopify Product Webhook & Gelato Metafields

When a product is created in Shopify, the app can store the corresponding Gelato product and variant IDs as metafields so the Gelato Shopify app (or order flow) can reference them.

**Endpoint:** `POST /api/webhooks/shopify/products`  
**Shopify topic:** `products/create`

**Flow:**

1. Shopify sends a `products/create` webhook to this URL (register the webhook in Shopify Admin or via API).
2. The handler verifies the request with `SHOPIFY_WEBHOOK_SECRET`.
3. It resolves Gelato product ID and variant ID (see `getGelatoIdsForShopifyProduct` in `src/domains/products/services/get-gelato-ids-for-product.ts`). Default implementation returns `null`; implement it by calling the Gelato API (e.g. create-from-template or lookup) when the Gelato client exists.
4. If Gelato IDs are returned, it sets metafields on the Shopify product and first variant:
   - **Product:** `gelato.product_id` = Gelato product ID
   - **Variant:** `gelato.variant_id` = Gelato variant ID

**Registering the webhook:** In Shopify Admin → Settings → Notifications → Webhooks, add a webhook for “Product creation” with URL `https://your-domain.com/api/webhooks/shopify/products`, or use the Admin API `webhookSubscriptionCreate` mutation with topic `PRODUCTS_CREATE`.

**Setting metafields from your own code:** If you create the product in Gelato first (e.g. via create-from-template) and then create it in Shopify, you can call `setGelatoMetafieldsOnProduct()` directly after creation instead of relying on the webhook.

---

## Fulfillment (Unchanged)

The Gelato Shopify app handles fulfillment automatically:

1. User completes Shopify checkout.
2. Shopify order syncs to Gelato via the Gelato Shopify app.
3. Gelato reads `Custom Artwork URL` from line-item attributes.
4. Gelato downloads the artwork, prints, and ships.

No direct Gelato Order API calls needed for standard Shopify checkout flow. The Gelato API is used only for previews and pricing — not for order creation.

---

## Risks & Decisions

| Item | Notes |
|---|---|
| **Gelato API plan** | Verify the E-commerce API (templates, create-from-template) is available on your Gelato plan. Some plans gate API access. |
| **Mockup generation latency** | Create-from-template + poll can take 10-30s. Show a skeleton with blurred artwork as placeholder. Consider client-side CSS composite as fast fallback for Phase 1. |
| **Preview product cleanup** | Products created via the API for preview purposes will accumulate in the Gelato store. Decide on a cleanup strategy (TTL-based deletion, or accept the buildup if the count stays manageable). |
| **UploadThing URL permanence** | Confirm artwork CDN URLs don't expire, since Gelato downloads from them at fulfillment time (potentially days after the order). |
| **Mockup URL expiry** | Gelato preview URLs are signed S3 URLs that expire. Cache and refresh as needed. Only store `Custom Artwork URL` as the durable print-file reference. |
| **Digital products** | Digital products skip the mockup step entirely. Route directly from `select` → `add-to-cart` for digital. |

---

## Implementation Order

1. `GELATO_API_KEY` + `GELATO_STORE_ID` in `.env` / `.env.example`
2. `src/infra/gelato/client.ts` — API client
3. `src/domains/ai/ai-portrait/templates.ts` — template config (populate from Gelato dashboard)
4. `bin/seed-shopify.ts` — output variant IDs for `templates.ts`
5. `src/app/api/gelato/preview/route.ts` — mockup proxy
6. `src/ui/components/create/useWizardState.ts` — add `product` step + template/variant state
7. `src/ui/components/create/StepProduct.tsx` — product grid + detail view
8. `src/ui/components/create/CreateWizard.tsx` — wire new step
9. `src/ui/components/create/StepAddToCart.tsx` — simplify to confirmation
10. `src/domains/ai/ai-portrait/types.ts` — fix `product_type`
11. `src/domains/ai/ai-portrait/products.ts` — remove `AI_PORTRAIT_PRODUCTS`
12. End-to-end test: full wizard flow → Shopify order → verify Gelato receives `Custom Artwork URL`
