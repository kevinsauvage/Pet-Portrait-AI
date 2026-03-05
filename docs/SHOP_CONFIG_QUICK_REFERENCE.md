# Shop Config Quick Reference

## Copy-Paste JSON for Shopify Dashboard

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
    "ai": {
      "maxRequests": 5,
      "windowMs": 60000
    },
    "upload": {
      "maxRequests": 12,
      "windowMs": 60000
    }
  },
  "image": {
    "maxFileSize": 8388608,
    "minDimension": 200,
    "maxDimension": 10000,
    "minAspectRatio": 0.5,
    "maxAspectRatio": 2.0,
    "acceptedTypes": [
      "image/jpeg",
      "image/png",
      "image/webp"
    ]
  },
  "features": {
    "enableRegeneration": true,
    "enableGallery": true
  }
}
```

## Field Reference

### AI Settings
| Field | Type | Default | Range | Description |
|-------|------|---------|-------|-------------|
| `ai.variationsCount` | number | 3 | 1-10 | Number of images to generate |
| `ai.generationTimeoutSeconds` | number | 120 | 30-600 | Max generation time |
| `ai.apiTimeoutSeconds` | number | 60 | 30-600 | API timeout |
| `ai.model` | string | "gpt-image-1.5" | - | OpenAI model name |
| `ai.retry.maxAttempts` | number | 2 | 1-5 | Retry attempts |
| `ai.retry.baseDelayMs` | number | 2000 | 500-10000 | Base retry delay (ms) |
| `ai.retry.maxDelayMs` | number | 6000 | 1000-60000 | Max retry delay (ms) |
| `ai.timeEstimate.minSeconds` | number | 30 | 10-300 | Min time estimate |
| `ai.timeEstimate.maxSeconds` | number | 60 | 30-600 | Max time estimate |

### Rate Limits
| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `rateLimit.ai.maxRequests` | number | 5 | Max requests per window |
| `rateLimit.ai.windowMs` | number | 60000 | Window in ms (60000 = 1 min) |
| `rateLimit.upload.maxRequests` | number | 12 | Max upload requests |
| `rateLimit.upload.windowMs` | number | 60000 | Window in ms |

### Image Validation
| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `image.maxFileSize` | number | 8388608 | Max size in bytes (8MB) |
| `image.minDimension` | number | 200 | Min dimension in pixels |
| `image.maxDimension` | number | 10000 | Max dimension in pixels |
| `image.minAspectRatio` | number | 0.5 | Min aspect ratio (width/height) |
| `image.maxAspectRatio` | number | 2.0 | Max aspect ratio |
| `image.acceptedTypes` | array | ["image/jpeg", "image/png", "image/webp"] | Allowed MIME types |

### Feature Flags
| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `features.enableRegeneration` | boolean | true | Enable regeneration feature |
| `features.enableGallery` | boolean | true | Enable gallery page |

### Pagination
| Field | Type | Default | Range | Description |
|-------|------|---------|-------|-------------|
| `pagination.productsPerPage` | number | 16 | 4-100 | Products per page |

### Cache Revalidation
| Field | Type | Default | Range | Description |
|-------|------|---------|-------|-------------|
| `cache.revalidate.catalog` | number | 3600 | 60-86400 | Catalog cache (seconds) |
| `cache.revalidate.search` | number | 300 | 60-3600 | Search cache (seconds) |
| `cache.revalidate.product` | number | 3600 | 60-86400 | Product cache (seconds) |
| `cache.revalidate.shopify` | number | 600 | 60-3600 | Shopify API cache (seconds) |

### Cookies
| Field | Type | Default | Range | Description |
|-------|------|---------|-------|-------------|
| `cookies.expiryDays` | number | 182 | 1-365 | Cookie expiry in days |

## Common Configurations

### High Volume (6 variations)
```json
{
  "ai": {
    "variationsCount": 6,
    "timeEstimate": {
      "minSeconds": 60,
      "maxSeconds": 120
    }
  }
}
```

### Fast Generation (2 variations)
```json
{
  "ai": {
    "variationsCount": 2,
    "timeEstimate": {
      "minSeconds": 20,
      "maxSeconds": 40
    }
  }
}
```

### Stricter Rate Limits
```json
{
  "rateLimit": {
    "ai": {
      "maxRequests": 3,
      "windowMs": 60000
    }
  }
}
```

### Larger Images
```json
{
  "image": {
    "maxFileSize": 15728640,
    "maxDimension": 15000
  }
}
```

### More Products Per Page
```json
{
  "pagination": {
    "productsPerPage": 24
  }
}
```

### Aggressive Caching
```json
{
  "cache": {
    "revalidate": {
      "catalog": 7200,
      "search": 600,
      "product": 7200,
      "shopify": 1200
    }
  }
}
```

### Shorter Cookie Expiry (GDPR)
```json
{
  "cookies": {
    "expiryDays": 90
  }
}
```


## Setup Instructions

1. Go to **Shopify Admin** → **Settings** → **Custom data**
2. Create a new metafield:
   - Resource: **Shop**
   - Namespace: `custom`
   - Key: `shop_config`
   - Type: **JSON**
3. Go to **Settings** → **Store details**
4. Find `custom.shop_config` metafield
5. Paste the JSON above
6. Save

## Notes

- All fields are optional - missing fields use defaults
- Partial updates supported - only include fields you want to change
- Changes take effect after Shopify cache refreshes (up to 10 minutes)
- Invalid values fall back to defaults with a warning log
