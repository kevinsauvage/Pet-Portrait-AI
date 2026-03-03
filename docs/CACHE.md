# Cache Configuration & Strategy

This document describes the caching strategy, TTLs, invalidation patterns, and monitoring for the application.

## Overview

The application uses a Redis-only caching strategy optimized for serverless environments:

1. **Redis Cache** (persistent, distributed) - **Required** - Cache operations require `REDIS_URL` to be configured
2. **Next.js Fetch Cache** - Used for Shopify API responses

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

A general-purpose cache module that supports both Redis and in-memory storage.

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

**Current Usage:**
- Currently only used in tests
- Available for future use cases (e.g., expensive computations, API responses)

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
| General purpose | Configurable | Set per use case based on data freshness requirements |

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

The application uses the same Redis instance for:
- Rate limiting (`src/infra/rate-limit/rate-limit.ts`)
- Application cache (`src/infra/cache/index.ts`)

**Key Prefixes:**
- Rate limiting: `[prefix]:[identifier]` (e.g., `ai:user123`)
- Cache: `cache:[key]` (e.g., `cache:product:123`)

### Redis Requirement

**All Environments:**
- Redis is **required** - `REDIS_URL` must be configured
- Cache operations throw errors if Redis is unavailable
- Fail-fast approach ensures issues are detected immediately

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

The cache module handles errors gracefully:
- Redis errors fall back to in-memory cache
- Errors are logged but don't throw exceptions
- Always check return values (may be `null`)

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

- [Redis Setup](./REDIS_SETUP.md) - Redis configuration guide
- [ADR-006: Redis-Based Distributed Rate Limiting](./ADRs/006-redis-rate-limiting.md) - Rate limiting ADR
- [Configuration](./CONFIG_USAGE_ANALYSIS.md) - Configuration usage analysis
