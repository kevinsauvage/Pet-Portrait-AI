# ADR-007: Sentry for Error Monitoring and Performance

## Status

Accepted

## Context

Production applications need error tracking and performance monitoring. Sentry provides comprehensive error tracking, performance monitoring, and release tracking for Next.js applications.

## Decision

Use Sentry for:
- Error tracking (client, server, edge)
- Performance monitoring (traces)
- Release tracking
- Source maps

## Consequences

### Positive

- Comprehensive error tracking
- Performance insights
- Release tracking
- Source maps support
- Easy integration with Next.js
- Good developer experience

### Negative

- Additional service dependency
- Cost (free tier available)
- Requires configuration
- Source maps upload adds to build time

## Implementation

Configuration files:
- `sentry.client.config.ts` - Client-side errors
- `sentry.server.config.ts` - Server-side errors
- `sentry.edge.config.ts` - Edge runtime errors
- `next.config.ts` - Source maps upload

Environment variables:
- `NEXT_PUBLIC_SENTRY_DSN` - Sentry DSN
- `SENTRY_ORG` - Organization name
- `SENTRY_PROJECT` - Project name

Sampling:
- Errors: 100% (capture all)
- Traces: 10% (performance sampling)

## Related Documentation

- [Monitoring Guide](./MONITORING.md)
