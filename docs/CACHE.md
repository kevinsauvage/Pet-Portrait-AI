# Cache Configuration & Strategy

This document describes the caching strategy, TTLs, invalidation patterns, and monitoring for the application.

## ✅ Current Status

**Important:** The Redis cache module (`src/infra/cache/index.ts`) is **now integrated and actively used in production**. It provides:
- ✅ **Integrated**: Used in application code to cache Shopify API responses
- ✅ **Production-ready**: Fully implemented and tested
- ✅ **Performance**: Reduces Shopify API calls by caching frequently accessed data

**Redis is required for both rate limiting and caching**. Both use the same `REDIS_URL` environment variable but maintain separate Redis client instances.

## Overview

The application uses a multi-layer caching strategy optimized for serverless environments:

1. **Redis Cache** (persistent, distributed) - **Active** - Caches Shopify product/collection data and shop configuration
2. **Next.js Fetch Cache** - Used for Shopify API responses (complements Redis cache)
3. **React Cache** - Request-level deduplication for same-request data fetching

### Redis-Only Design

**Important:** The cache module uses Redis exclusively. There is no in-memory fallback:

- ✅ **Redis Required**: All cache operations require `REDIS_URL` environment variable
- ✅ **Serverless Optimized**: Works perfectly in serverless environments (Vercel, AWS Lambda, etc.)
- ✅ **Persistent**: Cache persists across function invocations and deployments
- ✅ **Distributed**: Shared cache across all serverless instances

**Why Redis-only?**
- In serverless, in-memory cache doesn't persist between invocations
- Redis provides persistent, distributed caching
- Simpler codebase without dual-write complexity
- Production-ready from the start

## Cache Layers

### 1. Application Cache (`src/infra/cache/index.ts`)

A general-purpose cache module that supports Redis-based caching. **Now actively used in production.**

**Status:**
- ✅ **Implemented**: Fully functional Redis cache module
- ✅ **Tested**: Comprehensive test suite in `src/infra/cache/cache.test.ts`
- ✅ **Integrated**: Used in application code to cache Shopify data
- ✅ **Production**: Reduces Shopify API calls and improves response times

**Current Usage:**
- **Shop Configuration** (`getShopConfig`) - Cached for 10 minutes
- **Product Data** (`ShopifyProductRepository`) - Cached for 1 hour
- **Product Details** (`getProductDetails`, `getProductSeo`) - Cached for 1 hour
- **Product Recommendations** - Cached for 1 hour
- **Collection Data** (`getCollectionPageData`, `getCollectionSeo`) - Cached for 1 hour
- **All Collections** (`getAllCollections`) - Cached for 1 hour

**Features:**
- Redis-only (requires `REDIS_URL` environment variable)
- TTL-based expiration
- Cache metrics (hits, misses, sets, invalidations, errors)
- Key-based invalidation
- Serverless-optimized
- Throws errors if Redis is unavailable (fail-fast approach)

**Usage:**
```typescript
import { getCached, setCached, invalidateCache } from '@/infra/cache';

// Get cached value
const value = await getCached<MyType>('my-key');

// Set cached value with TTL (in milliseconds)
await setCached('my-key', myValue, 60000); // 60 seconds

// Invalidate a specific key
await invalidateCache('my-key');

// Clear all cache
await clearCache();
```

**Cache Wrapper Utility:**
The `withCache` utility (`src/infra/cache/cache-wrapper.ts`) provides a simple way to add caching to any async function:

```typescript
import { withCache } from '@/infra/cache';

const cachedFunction = withCache(
  async (param: string) => {
    // Expensive operation
    return await fetchData(param);
  },
  {
    prefix: 'my-cache',
    ttlMs: 3600000, // 1 hour
  }
);
```

**Future Integration Opportunities:**
- Cache expensive computations or AI generation results
- Cache user sessions or frequently accessed data
- Cache search results with shorter TTL

### 2. Shopify API Cache (`src/infra/shopify/client.ts`)

Uses Next.js fetch caching with revalidation times.

**Configuration:**
```typescript
// From src/core/config/index.ts
constants: {
  revalidate: {
    catalog: 3600,      // 1 hour
    search: 300,        // 5 minutes
    product: 3600,      // 1 hour
    shopify: 600,       // 10 minutes (default for Shopify API)
  }
}
```

**Cache Invalidation:**
- Time-based revalidation (ISR - Incremental Static Regeneration)
- Manual invalidation via `cacheOption: 'no-store'` parameter
- Next.js automatically handles cache invalidation on deployments

**Usage:**
```typescript
import { storefrontSdk } from '@/infra/shopify/client';

// Use default cache (10 minutes revalidation)
const sdk = storefrontSdk();

// Bypass cache
const sdkNoCache = storefrontSdk('no-store');
```

## Cache TTLs

### Application Cache TTLs

| Use Case | TTL | Reason |
|----------|-----|--------|
| Shop Configuration | 10 minutes (600s) | Matches Shopify API revalidation time |
| Product Data | 1 hour (3600s) | Product details change infrequently |
| Product Recommendations | 1 hour (3600s) | Recommendations are relatively stable |
| Collection Data | 1 hour (3600s) | Collection data changes infrequently |
| Collection SEO | 1 hour (3600s) | SEO metadata changes infrequently |

### Shopify API Cache TTLs

| Resource | TTL | Reason |
|----------|-----|--------|
| Catalog/Collections | 3600s (1h) | Product catalogs change infrequently |
| Products | 3600s (1h) | Product details change infrequently |
| Search | 300s (5m) | Search results may change more frequently |
| Shopify API (default) | 600s (10m) | Balance between freshness and performance |

## Cache Invalidation Patterns

### 1. Time-Based Invalidation (TTL)

**Application Cache:**
- Automatic expiration based on TTL
- Expired entries are removed on access

**Shopify API Cache:**
- Next.js ISR revalidation
- Stale-while-revalidate pattern

### 2. Manual Invalidation

**Application Cache:**
```typescript
// Invalidate specific key
await invalidateCache('product:123');

// Clear all cache
await clearCache();
```

**Shopify API Cache:**
```typescript
// Bypass cache for specific request
const sdk = storefrontSdk('no-store');
```

### 3. Deployment-Based Invalidation

- Next.js automatically invalidates fetch cache on deployments
- Application cache (Redis) persists across deployments
- In-memory cache is cleared on server restart

## Cache Monitoring & Metrics

### Available Metrics

The cache module provides metrics via `getCacheMetrics()`:

```typescript
import { getCacheMetrics } from '@/infra/cache';

const metrics = getCacheMetrics();
// {
//   hits: number,        // Cache hits
//   misses: number,      // Cache misses
//   sets: number,        // Cache sets
//   invalidations: number, // Cache invalidations
//   errors: number       // Cache errors
// }
```

### Monitoring Recommendations

1. **Track hit rate**: `hits / (hits + misses)`
   - Target: > 80% for frequently accessed data
   - Low hit rate may indicate TTLs are too short or keys are too specific

2. **Monitor errors**: Track `errors` metric
   - High error rate may indicate Redis connectivity issues
   - System automatically falls back to in-memory cache

3. **Track invalidation rate**: Monitor `invalidations`
   - High invalidation rate may indicate cache churn
   - Consider adjusting TTLs or invalidation strategy

### Integration with Monitoring Tools

**Example: Export metrics to monitoring service:**

```typescript
import { getCacheMetrics } from '@/infra/cache';

// In your monitoring endpoint or middleware
export async function GET() {
  const metrics = getCacheMetrics();
  
  // Send to monitoring service (e.g., Sentry, DataDog, etc.)
  logger.info('Cache metrics', {
    context: 'cache',
    metrics: {
      hitRate: metrics.hits / (metrics.hits + metrics.misses || 1),
      ...metrics,
    },
  });
  
  return Response.json(metrics);
}
```

## Redis Configuration

### Setup

Redis is configured via the `REDIS_URL` environment variable:

```env
REDIS_URL=redis://default:password@redis.example.com:6379
```

### Shared Redis Instance

The application uses the same Redis instance (`REDIS_URL`) for:
- ✅ **Rate limiting** (`src/infra/rate-limit/rate-limit.ts`) - **Active in production**
- ✅ **Application cache** (`src/infra/cache/index.ts`) - **Active in production**

**Note:** While both modules use the same `REDIS_URL`, they maintain separate Redis client instances and key namespaces.

**Key Prefixes:**
- Rate limiting: `[prefix]:[identifier]` (e.g., `ai:user123`)
- Cache: `cache:[key]` (e.g., `cache:products:all:8:undefined`, `cache:shop-config:`)

### Redis Requirement

**Redis is required for both rate limiting and caching**:

- ✅ **Rate limiting**: Requires `REDIS_URL` - falls back to in-memory if unavailable
- ✅ **Application cache**: Requires `REDIS_URL` - falls back to direct API calls if unavailable (graceful degradation)

**Deployment Requirements:**
- `REDIS_URL` must be configured for rate limiting to work in multi-instance deployments (e.g., Vercel, serverless)
- Cache module is optional - if not used, Redis is only needed for rate limiting

**Why Redis-only?**
- ✅ **Serverless**: In-memory cache doesn't persist between invocations
- ✅ **Simplicity**: Single caching layer, easier to reason about
- ✅ **Production-ready**: No development shortcuts that don't work in production
- ✅ **Distributed**: Shared cache across all server instances
- ✅ **Persistent**: Cache survives deployments and restarts

**For Development:**
- Use a local Redis instance or Redis Docker container
- Or use a cloud Redis service (Upstash, Redis Cloud) with a free tier
- See [Redis Setup Guide](./REDIS_SETUP.md) for local development setup

## Best Practices

### 1. Cache Key Naming

Use consistent, hierarchical key naming:

```typescript
// Good
await setCached('product:123', product, 3600000);
await setCached('collection:summer', collection, 3600000);
await setCached('user:session:abc123', session, 1800000);

// Bad
await setCached('prod123', product, 3600000);
await setCached('summer-collection', collection, 3600000);
```

### 2. TTL Selection

- **Short TTL (seconds to minutes)**: Frequently changing data, user-specific data
- **Medium TTL (minutes to hours)**: Product catalogs, collections
- **Long TTL (hours to days)**: Static content, configuration

### 3. Cache Invalidation

- Invalidate cache when data changes (e.g., product updates)
- Use pattern-based invalidation for related data
- Consider cache warming after invalidation

### 4. Error Handling

The cache wrapper (`withCache`) uses graceful degradation:
- Redis errors fall back to direct function calls
- Errors are logged but don't block requests
- Cache misses automatically trigger function execution
- Always check return values (may be `null`)

**Note:** The cache wrapper gracefully handles Redis unavailability by falling back to direct API calls. This ensures the application continues to work even if Redis is temporarily unavailable.

## Future Improvements

### Potential Enhancements

1. **Cache Warming**: Pre-populate cache with frequently accessed data
2. **Pattern-Based Invalidation**: Invalidate keys matching a pattern (e.g., `product:*`)
3. **Cache Compression**: Compress large values before storing
4. **Cache Analytics Dashboard**: Visualize cache metrics and performance
5. **Webhook-Based Invalidation**: Invalidate cache when Shopify data changes
6. **Multi-Region Cache**: Support for distributed cache across regions

### Shopify Webhook Integration

Consider implementing Shopify webhooks for cache invalidation:

```typescript
// Example: Invalidate cache on product update
app.post('/api/webhooks/shopify/product-update', async (req) => {
  const { id, handle } = req.body;
  await invalidateCache(`product:${handle}`);
  await invalidateCache(`product:${id}`);
  // Invalidate related caches (collections, search, etc.)
});
```

## Troubleshooting

### Cache Not Working

1. **Check Redis connection**: Verify `REDIS_URL` is set correctly
2. **Check logs**: Look for Redis connection errors
3. **Verify fallback**: System should fall back to in-memory cache

### High Cache Miss Rate

1. **Review TTLs**: May be too short for your use case
2. **Check key consistency**: Ensure same keys are used for get/set
3. **Monitor invalidation**: High invalidation rate may cause misses

### Redis Connection Issues

1. **Check network**: Verify Redis instance is accessible
2. **Check credentials**: Verify `REDIS_URL` format and credentials
3. **Monitor errors**: Check `getCacheMetrics().errors`
4. **Fallback**: System automatically falls back to in-memory cache

## Related Documentation

- [Redis Setup](./REDIS_SETUP.md) — Redis configuration for distributed cache / rate limiting
- [Shop configuration](./SHOP_CONFIG.md) — `shop_config` metafield and cache-related defaults
