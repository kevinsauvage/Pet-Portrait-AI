# Production Readiness TODO

## P0 - Must Fix Before Production

4. Replace in-memory AI generation logs with durable storage.

## P1 - Strongly Recommended

1. Implement Gelato tracking sync (or disable cleanly).
2. Add durable rate limiting and abuse protection.
3. Wire up observability (Sentry + structured logs).

4. Remove or populate empty `next-sitemap.config.js`.
