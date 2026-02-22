# Production Readiness TODO

## P0 - Must Fix Before Production

3. Secure Gelato fulfillment endpoint.
4. Replace in-memory AI generation logs with durable storage.
5. Enforce environment validation on startup.
6. Ensure `NEXT_PUBLIC_BASE_URL` is set in production.

## P1 - Strongly Recommended

1. Implement Gelato tracking sync (or disable cleanly).
2. Tighten CSP for production.
3. Add durable rate limiting and abuse protection.
4. Wire up observability (Sentry + structured logs).

## P2 - Quality/Performance/SEO

1. Enable Next/Image optimization if hosting supports it.
2. Add CI for lint/typecheck/build/tests.
3. Verify sitemap and robots in production.

## P3 - Cleanup

1. Remove or populate empty `next-sitemap.config.js`.

## Notes (Key Files)

1. `/Users/ksauvage/Documents/Perso/nextjs-strapi-ecommerce/src/app/admin/page.tsx`
2. `/Users/ksauvage/Documents/Perso/nextjs-strapi-ecommerce/src/app/api/admin/generations/route.ts`
3. `/Users/ksauvage/Documents/Perso/nextjs-strapi-ecommerce/src/app/api/admin/regenerate/route.ts`
4. `/Users/ksauvage/Documents/Perso/nextjs-strapi-ecommerce/src/app/api/ai/generate/route.ts`
5. `/Users/ksauvage/Documents/Perso/nextjs-strapi-ecommerce/src/infra/rate-limit/rate-limit.ts`
6. `/Users/ksauvage/Documents/Perso/nextjs-strapi-ecommerce/src/infra/upload/core.ts`
7. `/Users/ksauvage/Documents/Perso/nextjs-strapi-ecommerce/src/app/api/uploadthing/route.ts`
8. `/Users/ksauvage/Documents/Perso/nextjs-strapi-ecommerce/src/app/api/fulfillment/gelato/route.ts`
9. `/Users/ksauvage/Documents/Perso/nextjs-strapi-ecommerce/src/app/api/webhooks/shopify/orders/route.ts`
10. `/Users/ksauvage/Documents/Perso/nextjs-strapi-ecommerce/src/domains/ai/generation-store.ts`
11. `/Users/ksauvage/Documents/Perso/nextjs-strapi-ecommerce/src/core/config/validation.ts`
12. `/Users/ksauvage/Documents/Perso/nextjs-strapi-ecommerce/next.config.ts`
13. `/Users/ksauvage/Documents/Perso/nextjs-strapi-ecommerce/src/app/api/cron/sync-gelato-tracking/route.ts`
14. `/Users/ksauvage/Documents/Perso/nextjs-strapi-ecommerce/src/app/sitemap.tsx`
15. `/Users/ksauvage/Documents/Perso/nextjs-strapi-ecommerce/src/app/robots.ts`
16. `/Users/ksauvage/Documents/Perso/nextjs-strapi-ecommerce/next-sitemap.config.js`
