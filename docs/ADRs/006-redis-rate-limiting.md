# ADR-006: Redis-Based Distributed Rate Limiting

## Status

Accepted

## Context

The application needs rate limiting for expensive operations (AI generation, file uploads). In-memory rate limiting doesn't work across multiple server instances (serverless functions).

## Decision

Use Redis for distributed rate limiting with automatic fallback to in-memory storage:

- Redis for production (distributed, works across instances)
- In-memory fallback if Redis unavailable
- Graceful degradation

## Consequences

### Positive

- Works across serverless function instances
- Distributed rate limiting
- Graceful fallback
- Configurable limits
- Per-endpoint limits

### Negative

- Requires Redis instance
- Additional infrastructure cost
- Slight latency overhead

## Implementation

```typescript
const rateLimit = await checkRateLimit(identifier, {
  prefix: 'ai',
  maxRequests: 5,
  windowMs: 60000,
});

if (!rateLimit.allowed) {
  return createErrorResponse('Too many requests', {
    status: 429,
    message: `Retry after ${rateLimit.retryAfter} seconds`,
  });
}
```

Configuration:
- `REDIS_URL` - Redis connection URL
- `RATE_LIMIT_WINDOW_MS` - Time window (default: 60000ms)
- `RATE_LIMIT_MAX_REQUESTS` - Max requests per window (default: 5)

## Related Documentation

- [Redis Setup](./REDIS_SETUP.md)
