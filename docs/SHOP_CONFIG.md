# Shop Configuration System

The shop configuration system allows you to configure AI generation settings through a Shopify metafield, eliminating the need to redeploy code for configuration changes.

## Setup

### 1. Create Shopify Metafield

Create a metafield on your Shopify shop with the following details:

- **Namespace**: `custom`
- **Key**: `shop_config`
- **Type**: JSON
- **Owner**: Shop

### 2. Configuration Structure

The metafield should contain a JSON object with the following structure:

```json
{
  "ai": {
    "variationsCount": 3,
    "generationTimeoutSeconds": 120,
    "apiTimeoutSeconds": 60,
    "retry": {
      "maxAttempts": 2,
      "baseDelayMs": 2000,
      "maxDelayMs": 6000
    },
    "timeEstimate": {
      "minSeconds": 30,
      "maxSeconds": 60
    }
  }
}
```

### 3. Configuration Fields

#### `ai.variationsCount` (number)
- **Default**: `3`
- **Description**: Number of portrait variations to generate
- **Example**: `3`, `5`, `6`

#### `ai.generationTimeoutSeconds` (number)
- **Default**: `120`
- **Description**: Maximum time allowed for generation in seconds
- **Note**: Used for logging and monitoring. Next.js `maxDuration` is set to 300 seconds as a safe upper bound.

#### `ai.apiTimeoutSeconds` (number)
- **Default**: `60`
- **Description**: API route timeout in seconds
- **Note**: Used for reference. Next.js `maxDuration` is set to 300 seconds as a safe upper bound.

#### `ai.retry.maxAttempts` (number)
- **Default**: `2`
- **Description**: Maximum number of retry attempts for OpenAI API calls
- **Example**: `2`, `3`

#### `ai.retry.baseDelayMs` (number)
- **Default**: `2000`
- **Description**: Base delay in milliseconds before first retry
- **Example**: `2000` (2 seconds)

#### `ai.retry.maxDelayMs` (number)
- **Default**: `6000`
- **Description**: Maximum delay in milliseconds between retries
- **Example**: `6000` (6 seconds)

#### `ai.timeEstimate.minSeconds` (number)
- **Default**: `30`
- **Description**: Minimum estimated time shown to users
- **Example**: `30`, `45`

#### `ai.timeEstimate.maxSeconds` (number)
- **Default**: `60`
- **Description**: Maximum estimated time shown to users
- **Example**: `60`, `90`

#### `ai.model` (string)
- **Default**: `"gpt-image-1.5"`
- **Description**: OpenAI model name to use for image generation
- **Example**: `"gpt-image-1.5"`

#### `rateLimit.ai.maxRequests` (number)
- **Default**: `5`
- **Description**: Maximum requests per window for AI generation endpoint
- **Example**: `5`, `10`

#### `rateLimit.ai.windowMs` (number)
- **Default**: `60000`
- **Description**: Time window in milliseconds (60000 = 1 minute)
- **Example**: `60000`, `120000`

#### `rateLimit.upload.maxRequests` (number)
- **Default**: `12`
- **Description**: Maximum requests per window for upload endpoint
- **Example**: `12`, `20`

#### `rateLimit.upload.windowMs` (number)
- **Default**: `60000`
- **Description**: Time window in milliseconds
- **Example**: `60000`, `120000`

#### `image.maxFileSize` (number)
- **Default**: `8388608` (8MB)
- **Description**: Maximum file size in bytes
- **Example**: `8388608`, `15728640` (15MB)

#### `image.minDimension` (number)
- **Default**: `200`
- **Description**: Minimum image dimension in pixels
- **Example**: `200`, `300`

#### `image.maxDimension` (number)
- **Default**: `10000`
- **Description**: Maximum image dimension in pixels
- **Example**: `10000`, `15000`

#### `image.minAspectRatio` (number)
- **Default**: `0.5`
- **Description**: Minimum aspect ratio (width/height)
- **Example**: `0.5`, `0.75`

#### `image.maxAspectRatio` (number)
- **Default**: `2.0`
- **Description**: Maximum aspect ratio (width/height)
- **Example**: `2.0`, `3.0`

#### `image.acceptedTypes` (array)
- **Default**: `["image/jpeg", "image/png", "image/webp"]`
- **Description**: Allowed MIME types for image uploads
- **Example**: `["image/jpeg", "image/png"]`

#### `features.enableRegeneration` (boolean)
- **Default**: `true`
- **Description**: Enable regeneration feature

#### `features.enableGallery` (boolean)
- **Default**: `true`
- **Description**: Enable gallery page

## Usage in Code

### Server Components

```typescript
import { getShopConfig } from '@/domains/shop/services';

export default async function MyPage() {
  const shopConfig = await getShopConfig();
  const variationsCount = shopConfig.ai.variationsCount;
  // Use config...
}
```

### Services

```typescript
import { getShopConfig } from '@/domains/shop/services';

export async function myService() {
  const shopConfig = await getShopConfig();
  const retryConfig = shopConfig.ai.retry;
  // Use config...
}
```

## Default Values

If the metafield is not set or invalid, the system falls back to default values defined in `src/domains/shop/services/get-shop-config.service.ts`:

```typescript
export const DEFAULT_SHOP_CONFIG = {
  ai: {
    variationsCount: 3,
    generationTimeoutSeconds: 120,
    apiTimeoutSeconds: 60,
    retry: {
      maxAttempts: 2,
      baseDelayMs: 2000,
      maxDelayMs: 6000,
    },
    timeEstimate: {
      minSeconds: 30,
      maxSeconds: 60,
    },
  },
};
```

## Where Configuration is Used

1. **Portrait Generation Service** (`src/domains/ai/services/portrait-generation.service.ts`)
   - `variationsCount`: Controls how many images to generate
   - `retry.*`: Controls retry behavior for OpenAI API calls

2. **UI Components**
   - `src/app/create/generating/loading.tsx`: Shows dynamic variation count and time estimates

3. **API Routes**
   - `src/app/api/ai/generate/route.ts`: Uses config for generation
   - `src/app/api/admin/regenerate/route.ts`: Uses config for regeneration

## Caching

The configuration is fetched from Shopify on each request. Shopify's cache settings (`config.constants.revalidate.shopify`) apply, so changes may take up to 10 minutes to propagate (default Shopify revalidation time).

## Error Handling

- If the metafield is missing: Falls back to defaults
- If the metafield is invalid JSON: Logs a warning and falls back to defaults
- If Shopify API fails: Logs an error and falls back to defaults

## Example Configuration

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

### Aggressive Retries
```json
{
  "ai": {
    "retry": {
      "maxAttempts": 3,
      "baseDelayMs": 1000,
      "maxDelayMs": 10000
    }
  }
}
```
