# AI Pet Portrait Store — Setup Guide

This document describes the AI Pet Portrait features added to the Next.js + Shopify e-commerce project.

## Overview

The store allows users to:
1. Upload a pet photo
2. Choose an AI art style (Pixar, watercolor, anime, royal, cyberpunk)
3. Generate 6 AI portrait variations
4. Select their favorite
5. Add to cart as digital download or print (canvas/poster)
6. For print products: automatic fulfillment via Gelato POD

## Environment Variables

Add these to `.env.local`:

```env
# AI Image Generation (OpenAI)
OPENAI_API_KEY=sk-...

# File Storage (UploadThing)
UPLOADTHING_TOKEN=...

# Print-on-Demand (Gelato)
GELATO_API_KEY=...
GELATO_CANVAS_PRODUCT_UID=...  # Optional; find at dashboard.gelato.com/catalogue
GELATO_POSTER_PRODUCT_UID=poster_glossy_a3  # Optional; default

# Cron (for tracking sync)
CRON_SECRET=...  # Optional; protects /api/cron/sync-gelato-tracking

# Shopify Webhook (for order fulfillment)
SHOPIFY_WEBHOOK_SECRET=...

# AI Product Variant IDs (from Shopify Admin)
NEXT_PUBLIC_AI_DIGITAL_VARIANT_ID=gid://shopify/ProductVariant/...
NEXT_PUBLIC_AI_CANVAS_VARIANT_ID=gid://shopify/ProductVariant/...
NEXT_PUBLIC_AI_POSTER_VARIANT_ID=gid://shopify/ProductVariant/...

# Optional: Error monitoring
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project
```

## Shopify Setup

### 1. Create Products

Create three products in Shopify Admin:

1. **Digital AI Pet Portrait** ($24.99–$39.99)
   - Single variant
   - No physical fulfillment

2. **Canvas Print** ($49–$109)
   - Size variants (e.g., 12x12, 16x20, 24x24)
   - Fulfilled via Gelato

3. **Poster / Art Print** ($29–$79)
   - Size variants
   - Fulfilled via Gelato

Copy each product variant's GID (e.g. `gid://shopify/ProductVariant/123456`) and set the corresponding env vars.

### 2. Webhook

In Shopify Admin → Settings → Notifications → Webhooks:
- Create webhook: **Order creation**
- URL: `https://your-domain.com/api/webhooks/shopify/orders`
- Format: JSON
- Use the webhook signing secret as `SHOPIFY_WEBHOOK_SECRET`

## UploadThing Setup

1. Sign up at [uploadthing.com](https://uploadthing.com)
2. Create an app and copy the token
3. Add `UPLOADTHING_TOKEN` to env

## Gelato Setup

1. Sign up at [gelato.com](https://gelato.com) and get API access
2. Add `GELATO_API_KEY` to env
3. The fulfillment API uses `poster_glossy_a3` as default product. Update `productUid` in `/api/fulfillment/gelato/route.ts` to match your Gelato catalog.

## Routes

| Route | Description |
|-------|-------------|
| `/create` | Photo upload wizard → style selection → AI generation → artwork selection → add to cart |
| `/styles` | Style previews (Pixar, watercolor, anime, royal, cyberpunk) |
| `/gallery` | Example artworks (mock data) |
| `/admin` | Internal admin dashboard (generations, POD orders) |

## Cart Line Item Properties

When adding AI portrait products to cart, these attributes are stored:

- `original_photo_url` — User's uploaded photo
- `final_artwork_url` — Selected AI-generated artwork
- `chosen_style` — Style name (e.g. "Pixar")
- `generation_id` — Unique generation ID

These appear in Shopify order line item properties and are used for Gelato fulfillment.

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/uploadthing` | GET, POST | UploadThing file upload handler |
| `/api/ai/generate` | POST | AI portrait generation (body: `{ originalPhotoUrl, styleId }`) |
| `/api/fulfillment/gelato` | POST | Create Gelato POD order (internal, called by webhook) |
| `/api/webhooks/shopify/orders` | POST | Shopify order creation webhook |
| `/api/admin/generations` | GET | Admin: generation logs (extend with DB) |

## Tech Stack

- **AI**: OpenAI Images API (`gpt-image-1` for image-to-image edit)
- **Storage**: UploadThing
- **POD**: Gelato API
- **UI**: Framer Motion, react-dropzone, shadcn/ui, Tailwind CSS
- **Validation**: Zod
- **Monitoring**: Sentry (optional)
