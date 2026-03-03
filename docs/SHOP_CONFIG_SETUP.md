# Shopify Shop Config Setup Guide

This guide will help you set up the `shop_config` metafield in your Shopify admin dashboard.

## Step 1: Create the Metafield

1. Go to your Shopify Admin Dashboard
2. Navigate to **Settings** → **Custom data**
3. Click **Add definition**
4. Select **Shop** as the resource type
5. Fill in the following details:

   - **Name**: `shop_config`
   - **Namespace and key**: 
     - Namespace: `custom`
     - Key: `shop_config`
   - **Type**: **JSON**
   - **Description**: `Configuration for AI generation, rate limits, image validation, and feature flags`

6. Click **Save**

## Step 2: Add the Configuration JSON

1. Go to **Settings** → **Store details**
2. Scroll down to find the **Metafields** section
3. Find the `custom.shop_config` metafield you just created
4. Click **Add value** or edit if it already exists
5. Copy and paste the JSON from `docs/shop-config-example.json` (or see below)

## Example Configuration JSON

Copy this JSON and paste it into the metafield value:

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
    "enableAdminDashboard": true,
    "enableGallery": true
  }
}
```

## Configuration Sections Explained

### `ai` - AI Generation Settings
- **variationsCount**: Number of images to generate (1-10)
- **generationTimeoutSeconds**: Max time for generation (30-600 seconds)
- **apiTimeoutSeconds**: API timeout (30-600 seconds)
- **model**: OpenAI model name (e.g., "gpt-image-1.5")
- **retry**: Retry configuration for failed API calls
- **timeEstimate**: Time estimates shown to users

### `rateLimit` - Rate Limiting
- **ai**: Rate limits for `/api/ai/generate` endpoint
  - **maxRequests**: Max requests per window (default: 5)
  - **windowMs**: Time window in milliseconds (60000 = 1 minute)
- **upload**: Rate limits for `/api/uploadthing` endpoint
  - **maxRequests**: Max requests per window (default: 12)
  - **windowMs**: Time window in milliseconds

### `image` - Image Validation
- **maxFileSize**: Maximum file size in bytes (8388608 = 8MB)
- **minDimension**: Minimum image dimension in pixels (default: 200)
- **maxDimension**: Maximum image dimension in pixels (default: 10000)
- **minAspectRatio**: Minimum aspect ratio (width/height, default: 0.5)
- **maxAspectRatio**: Maximum aspect ratio (default: 2.0)
- **acceptedTypes**: Allowed MIME types

### `features` - Feature Flags
- **enableRegeneration**: Enable regeneration in admin (default: true)
- **enableAdminDashboard**: Enable admin dashboard (default: true)
- **enableGallery**: Enable gallery page (default: true)

## Common Configuration Examples

### High Volume (More Variations)
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

### Fast Generation (Fewer Variations)
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

### Larger Image Support
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

### Aggressive Caching (Longer Cache Times)
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

### Shorter Cookie Expiry (GDPR Compliance)
```json
{
  "cookies": {
    "expiryDays": 90
  }
}
```

## Validation

The configuration is validated against the schema in `docs/shop-config-schema.json`. Invalid values will fall back to defaults and log a warning.

## Testing

After saving the configuration:

1. Wait a few minutes for Shopify cache to update (default: 10 minutes)
2. Test by generating a portrait
3. Check the application logs for "Shop config loaded" messages
4. Verify that your settings are being used (e.g., check variation count)

## Troubleshooting

- **Config not updating**: Wait for Shopify cache to refresh (up to 10 minutes)
- **Invalid JSON**: Check JSON syntax using a JSON validator
- **Defaults being used**: Check application logs for parsing errors
- **Values out of range**: Review schema constraints in `docs/shop-config-schema.json`

## Notes

- All fields are optional - missing fields will use defaults
- Partial updates are supported - only include fields you want to change
- Values are validated against the schema before use
- Invalid values fall back to defaults with a warning log
