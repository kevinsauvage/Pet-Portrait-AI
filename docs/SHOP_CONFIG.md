# Shop configuration (`shop_config`)

Runtime settings for AI generation, rate limits, image rules, feature flags, pagination, cache TTL hints, and cookie expiry—stored in a **Shop** metafield so you can change behavior without redeploying.

## Create the metafield in Shopify

1. **Settings** → **Custom data** → **Add definition**
2. Resource: **Shop**
3. **Name**: `shop_config` (or any label you prefer)
4. **Namespace and key**: namespace `custom`, key `shop_config`
5. **Type**: **JSON**
6. **Description** (optional): Configuration for AI, rate limits, images, features, pagination, cache, cookies

Save, then:

7. **Settings** → **Store details** → **Metafields**
8. Open `custom.shop_config` → paste JSON (see below)
9. Save

Validated against [`shop-config-schema.json`](./shop-config-schema.json). A full starter payload is in [`shop-config-example.json`](./shop-config-example.json).

## Example JSON (full)

Use the file as the source of truth, or copy this:

```json
{
  "ai": {
    "variationsCount": 3,
    "generationTimeoutSeconds": 120,
    "apiTimeoutSeconds": 60,
    "model": "gpt-image-1.5",
    "retry": {
      "maxAttempts": 2,
      "baseDelayMs": 2000,
      "maxDelayMs": 6000
    },
    "timeEstimate": {
      "minSeconds": 30,
      "maxSeconds": 60
    }
  },
  "rateLimit": {
    "ai": { "maxRequests": 5, "windowMs": 60000 },
    "upload": { "maxRequests": 12, "windowMs": 60000 }
  },
  "image": {
    "maxFileSize": 8388608,
    "minDimension": 200,
    "maxDimension": 10000,
    "minAspectRatio": 0.5,
    "maxAspectRatio": 2.0,
    "acceptedTypes": ["image/jpeg", "image/png", "image/webp"]
  },
  "features": {
    "enableRegeneration": true,
    "enableGallery": true
  },
  "pagination": { "productsPerPage": 16 },
  "cache": {
    "revalidate": {
      "catalog": 3600,
      "search": 300,
      "product": 3600,
      "shopify": 600
    }
  },
  "cookies": { "expiryDays": 182 }
}
```

## Field reference

### `ai`

| Field | Default | Notes |
| --- | --- | --- |
| `variationsCount` | `3` | Number of portrait variants (1–10) |
| `generationTimeoutSeconds` | `120` | Logging / UX; route `maxDuration` is capped separately in code |
| `apiTimeoutSeconds` | `60` | Reference timeout for API work |
| `model` | `gpt-image-1.5` | OpenAI image model id for `POST /v1/images/edits`. GPT image models use the `image[]` multipart shape; `dall-e-2` uses the legacy single `image` field (see `portrait-generation.service.ts`). |
| `retry.maxAttempts` | `2` | |
| `retry.baseDelayMs` | `2000` | |
| `retry.maxDelayMs` | `6000` | |
| `timeEstimate.minSeconds` / `maxSeconds` | `30` / `60` | Shown in UI |

### `rateLimit`

| Field | Default | Notes |
| --- | --- | --- |
| `ai.maxRequests` / `ai.windowMs` | `5` / `60000` | `/api/ai/generate` |
| `upload.maxRequests` / `upload.windowMs` | `12` / `60000` | Upload route handler |

### `image`

Server-side validation for uploads (bytes, dimensions, aspect ratio, MIME types). Defaults include `maxFileSize` **8388608** (8MB).

### `features`

| Field | Default |
| --- | --- |
| `enableRegeneration` | `true` |
| `enableGallery` | `true` |

### `pagination`

| Field | Default | Notes |
| --- | --- | --- |
| `productsPerPage` | `16` | Search / catalog page size |

### `cache.revalidate` (seconds)

Used where the app reads shop config for Shopify client / data caching—not for Next.js `export const revalidate` on pages (those stay static).

| Field | Default |
| --- | --- |
| `catalog` | `3600` |
| `search` | `300` |
| `product` | `3600` |
| `shopify` | `600` |

### `cookies`

| Field | Default | Notes |
| --- | --- | --- |
| `expiryDays` | `182` | Consent / analytics cookie max-age |

## Partial overrides

All keys are optional. Omitted sections use defaults from code.

## Usage in code

```typescript
import { getShopConfig } from '@/domains/shop/get-shop-config.service';

const shopConfig = await getShopConfig();
```

`ShopConfig` and `DEFAULT_SHOP_CONFIG` live in the same module.

## Where values are read

- `src/domains/shop/get-shop-config.service.ts` — fetch, merge with defaults, in-memory cache (~10 minutes)
- `src/domains/ai/portrait-generation.service.ts` — AI counts, retries, model
- `src/app/api/ai/generate/route.ts` — rate limits
- `src/infra/upload/route-handler.ts` — upload rate limits
- `src/domains/ai/ai-portrait/validate-image.ts` — image rules
- `src/domains/search/search.service.ts` — `pagination.productsPerPage`
- `src/app/create/generating/loading.tsx` — time estimates / variation count
- `src/ui/components/consent/CookieBannerWrapper.tsx` — cookie expiry

## Defaults

Authoritative defaults: `DEFAULT_SHOP_CONFIG` in `src/domains/shop/get-shop-config.service.ts` (keep docs and `shop-config-example.json` aligned when you change defaults).

## Caching and propagation

- Parsed config is cached in the app (~10 minutes) via `withCache` on `getShopConfig`.
- After changing the metafield, allow up to that TTL (and any CDN edge cache) before expecting new values everywhere.

## Error handling

- Missing metafield → defaults
- Invalid JSON → warning log + defaults
- Shopify failure → error log + defaults

## More examples

**Stricter AI rate limit**

```json
{ "rateLimit": { "ai": { "maxRequests": 3, "windowMs": 60000 } } }
```

**More products per page**

```json
{ "pagination": { "productsPerPage": 24 } } }
```

**Shorter cookie lifetime (e.g. compliance)**

```json
{ "cookies": { "expiryDays": 90 } } }
```

**Longer Shopify-side revalidation (seconds)**

```json
{
  "cache": {
    "revalidate": { "catalog": 7200, "search": 600, "product": 7200, "shopify": 1200 }
  }
}
```

## Troubleshooting

- **Changes not visible** — wait for app config cache TTL; redeploy not required for metafield edits.
- **Defaults always used** — check logs for parse errors; validate JSON against `shop-config-schema.json`.
- **Out-of-range values** — invalid fields fall back to defaults with a warning where validation runs.
