# API Documentation

Complete reference for all API endpoints, authentication methods, and usage examples.

---

## Table of Contents

- [Authentication](#authentication)
- [API Endpoints](#api-endpoints)
- [Rate Limiting](#rate-limiting)
- [Error Handling](#error-handling)
- [Request/Response Formats](#requestresponse-formats)

---

## Authentication

The API supports multiple authentication methods depending on the endpoint and use case.

### 1. Admin Authentication

Admin routes (`/admin/*`) require authentication via HTTP Basic Auth or Bearer token.

#### HTTP Basic Auth

```bash
curl -u "admin:password" https://yourdomain.com/admin
```

#### Bearer Token

```bash
curl -H "Authorization: Bearer your_admin_secret" https://yourdomain.com/admin
```

### 2. API Endpoint Protection

Protected endpoints (`/api/ai/generate`, `/api/uploadthing`) support two authentication methods:

#### Method 1: Bearer Token / API Key (Server-to-Server)

```bash
# Using Authorization header
curl -X POST https://yourdomain.com/api/ai/generate \
  -H "Authorization: Bearer your_secret" \
  -H "Content-Type: application/json" \
  -d '{"originalPhotoUrl":"...","styleId":"pixar"}'

# Using X-API-Key header
curl -X POST https://yourdomain.com/api/ai/generate \
  -H "X-API-Key: your_secret" \
  -H "Content-Type: application/json" \
  -d '{"originalPhotoUrl":"...","styleId":"pixar"}'
```

**Environment Variables:**

- `AI_API_SECRET` - For `/api/ai/generate`
- `UPLOADTHING_API_SECRET` - For `/api/uploadthing`

#### Method 2: Session-Based (Browser)

When making requests from the same origin (browser), session cookies are automatically used. No headers required.

**How it works:**

1. User visits the site
2. Session cookie is issued automatically
3. Subsequent API calls include the session cookie
4. Server validates the session

**Note:** Cross-origin requests require Bearer token authentication.

### 3. Shopify Authentication

Shopify API authentication is handled automatically:

- **Storefront API**: Uses `SHOPIFY_STORE_FRONT_ACCESS_TOKEN` (static token)
- **Admin API**: Uses OAuth 2.0 client credentials grant with `SHOPIFY_CLIENT_ID` and `SHOPIFY_CLIENT_SECRET`

See [docs/SHOPIFY-2026-AUTH.md](./SHOPIFY-2026-AUTH.md) for details.

---

## API Endpoints

### AI Generation

#### `POST /api/ai/generate`

Generate AI pet portrait variations.

**Authentication:** Required (Bearer token or session)

**Rate Limiting:** Yes (5 requests per minute per IP)

**Request Body:**

```json
{
  "originalPhotoUrl": "https://cdn.example.com/photo.jpg",
  "styleId": "pixar"
}
```

**Style IDs:**

- `pixar` - Pixar-style animation
- `watercolor` - Watercolor painting
- `anime` - Anime style
- `royal` - Royal portrait
- `cyberpunk` - Cyberpunk aesthetic
- `renaissance` - Renaissance painting
- `pop-art` - Pop art style
- `minimalist` - Minimalist design

**Response:**

```json
{
  "success": true,
  "data": {
    "variations": [
      {
        "url": "https://cdn.example.com/generated-1.jpg",
        "styleId": "pixar"
      }
    ],
    "generationId": "gen_123"
  }
}
```

**Error Responses:**

- `400 Bad Request` - Invalid request body or image URL
- `401 Unauthorized` - Missing or invalid authentication
- `403 Forbidden` - Cross-origin request without auth
- `413 Payload Too Large` - Request body exceeds 256KB
- `429 Too Many Requests` - Rate limit exceeded

**Example:**

```bash
curl -X POST https://yourdomain.com/api/ai/generate \
  -H "Authorization: Bearer $AI_API_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "originalPhotoUrl": "https://cdn.example.com/pet.jpg",
    "styleId": "pixar"
  }'
```

---

### Upload

#### `POST /api/uploadthing`

Upload files via UploadThing.

**Authentication:** Required (Bearer token or session)

**Rate Limiting:** Yes (12 requests per minute per IP)

**Request:** Multipart form data (handled by UploadThing SDK)

**Response:** UploadThing response format

**Example:** Use UploadThing SDK on client-side

```typescript
import { uploadFiles } from '@uploadthing/react';

const files = await uploadFiles({
  endpoint: '/api/uploadthing',
  files: [file],
});
```

---

### Cart

#### `GET /api/cart`

Get current cart.

**Authentication:** Not required (uses Shopify cart cookies)

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "gid://shopify/Cart/...",
    "lines": [...],
    "cost": {
      "totalAmount": {...}
    }
  }
}
```

#### `POST /api/cart/lines`

Add items to cart.

**Authentication:** Not required (uses Shopify cart cookies)

**Request Body:**

```json
{
  "lines": [
    {
      "merchandiseId": "gid://shopify/ProductVariant/123",
      "quantity": 1,
      "attributes": [{ "key": "printful_print_url", "value": "https://..." }]
    }
  ]
}
```

#### `PATCH /api/cart/lines`

Update cart line items.

#### `DELETE /api/cart/lines`

Remove items from cart.

---

### Wishlist

#### `GET /api/wishlist`

Get saved AI portraits (favourites). Each item includes artwork URL, original photo, style, generation id, and optional variant/handle for re-ordering.

**Authentication:** Not required (uses Shopify customer cookies)

#### `POST /api/wishlist`

Add a portrait to favourites. **Body (JSON):** `imageUrl`, `originalPhotoUrl`, `styleId`, `generationId`; optional `label`, `variantId`, `productHandle`.

**Authentication:** Required (Shopify customer)

#### `DELETE /api/wishlist/[portraitId]`

Remove a saved portrait by its **saved entry id** (the `id` on each wishlist item), not by Shopify product id.

**Authentication:** Required (Shopify customer)

---

### Search

#### `GET /api/search/predictive`

Predictive search suggestions.

**Query Parameters:**

- `q` - Search query

**Response:**

```json
{
  "success": true,
  "data": {
    "suggestions": [...],
    "products": [...]
  }
}
```

---

### Admin

#### `POST /api/admin/regenerate`

Regenerate AI portrait (admin only).

**Authentication:** Required (Admin auth)

---

### Logout

#### `POST /api/logout`

Clear session and cart cookies.

**Authentication:** Not required

---

## Rate Limiting

Rate limiting is enforced on protected endpoints:

- **AI Generation** (`/api/ai/generate`): 5 requests per minute per IP
- **Upload** (`/api/uploadthing`): 12 requests per minute per IP

**Rate Limit Headers:**

- `X-RateLimit-Limit` - Maximum requests per window
- `X-RateLimit-Remaining` - Remaining requests in current window
- `X-RateLimit-Reset` - Unix timestamp when limit resets
- `Retry-After` - Seconds to wait before retrying (when limit exceeded)

**Rate Limit Response:**

```json
{
  "success": false,
  "error": "Too many requests",
  "message": "Retry after 45 seconds",
  "status": 429
}
```

**Configuration:**

- Uses Redis for distributed rate limiting (if `REDIS_URL` is set)
- Falls back to in-memory storage if Redis unavailable
- Configurable via `RATE_LIMIT_WINDOW_MS` and `RATE_LIMIT_MAX_REQUESTS`

See [docs/REDIS_SETUP.md](./REDIS_SETUP.md) for Redis configuration.

---

## Error Handling

All API endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error type",
  "message": "Human-readable error message",
  "status": 400
}
```

### HTTP Status Codes

- `200 OK` - Success
- `400 Bad Request` - Invalid request
- `401 Unauthorized` - Missing or invalid authentication
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `413 Payload Too Large` - Request body too large
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

### Error Types

Common error messages:

- `INVALID_REQUEST_BODY` - Request body validation failed
- `UNAUTHORIZED` - Authentication required
- `FORBIDDEN` - Access denied
- `TOO_MANY_REQUESTS` - Rate limit exceeded
- `AI_PORTRAIT_GENERATION_FAILED` - AI generation error
- `CART_NOT_FOUND` - Cart not found
- `FAILED_TO_FETCH_CART` - Cart fetch error

---

## Request/Response Formats

### Request Headers

**Common Headers:**

```
Content-Type: application/json
Authorization: Bearer <token>
X-API-Key: <key>
```

### Response Format

**Success Response:**

```json
{
  "success": true,
  "data": {...}
}
```

**Error Response:**

```json
{
  "success": false,
  "error": "Error type",
  "message": "Error message",
  "status": 400
}
```

### Content Types

- **JSON**: `application/json` (default for API endpoints)
- **Form Data**: `multipart/form-data` (for file uploads)
- **Text**: `text/plain` (for simple responses)

---

## Examples

### Complete AI Generation Flow

```bash
# 1. Upload photo
curl -X POST https://yourdomain.com/api/uploadthing \
  -H "Authorization: Bearer $UPLOADTHING_API_SECRET" \
  -F "file=@pet.jpg"

# 2. Generate AI portraits
curl -X POST https://yourdomain.com/api/ai/generate \
  -H "Authorization: Bearer $AI_API_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "originalPhotoUrl": "https://cdn.example.com/pet.jpg",
    "styleId": "pixar"
  }'

# 3. Add to cart (browser session)
# Uses session cookies automatically
fetch('/api/cart/lines', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    lines: [{
      merchandiseId: "gid://shopify/ProductVariant/123",
      quantity: 1,
      attributes: [
        {key: "printful_print_url", value: "https://..."}
      ]
    }]
  })
})
```

---

## Related Documentation

- [Deployment Guide](../DEPLOYMENT.md) - Deployment procedures
- [Monitoring Guide](./MONITORING.md) - Monitoring and alerting
- [Troubleshooting Guide](./TROUBLESHOOTING.md) - Common issues
- [Shopify Authentication](./SHOPIFY-2026-AUTH.md) - Shopify API auth
