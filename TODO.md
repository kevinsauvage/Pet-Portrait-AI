# Project TODO List

Tasks classified by priority. Each item includes **what**, **where**, and **how**.

---

## High Priority

### 1. Add test infrastructure
- **What:** Set up unit, integration, and E2E tests.
- **Where:** Root config + `src/**/*.test.ts`, `src/**/*.spec.ts`, `e2e/`.
- **How:** Add Vitest + React Testing Library. Create `vitest.config.ts`, add `test` script. Start with domain services and API routes. Add Playwright for E2E.

### 2. Validate required environment variables at startup
- **What:** Fail fast with clear errors when critical env vars are missing.
- **Where:** `src/core/config/validation.ts`.
- **How:** Extend `validateConfig()` to check `SHOPIFY_CLIENT_ID`, `SHOPIFY_CLIENT_SECRET`, `SHOPIFY_ADMIN_URL`, `NEXT_PUBLIC_SHOPIFY_STOREFRONT_URL`. Add optional validation for AI/UploadThing when those features are used.

### 3. Production-ready rate limiting
- **What:** Replace in-memory rate limiter for multi-instance deployments.
- **Where:** `src/infra/rate-limit/rate-limit.ts`, `src/infra/upload/route-handler.ts`, AI routes.
- **How:** Use Vercel KV or Upstash Redis. Add `RATE_LIMIT_*` env vars. Implement `checkRateLimit` with Redis backend; keep in-memory fallback for dev.

### 4. Per-variant Gelato product UIDs
- **What:** Remove hardcoded Gelato product UIDs; support per-variant mapping.
- **Where:** `src/domains/orders/services/gelato-fulfillment.service.ts`.
- **How:** Store Gelato product UIDs in Shopify variant metafields or line-item properties. Read from `lineItem.properties` or variant metafield; fall back to env vars if absent.

---

## Medium Priority

### 5. Structured error logging
- **What:** Replace `console.error`/`console.warn` with structured logging.
- **Where:** `src/core/`, `src/domains/`, `src/infra/`, error boundaries.
- **How:** Add a small logger utility (e.g. `src/core/utils/logger.ts`) with levels and request context. Use Sentry for server errors; ensure client errors are captured.

### 6. API documentation
- **What:** Document API routes, request/response schemas, and examples.
- **Where:** `docs/api/` or inline in `src/app/api/`.
- **How:** Add OpenAPI/Swagger spec or use Next.js route metadata. Document auth, rate limits, and error formats.

### 7. CSRF protection for forms
- **What:** Protect form submissions from cross-site request forgery.
- **Where:** Form actions, `src/app/`, server actions.
- **How:** Use Next.js built-in CSRF handling or add CSRF tokens for non-GET requests. Validate origin/referer headers.

### 8. Request size limits for API routes
- **What:** Prevent large payloads from exhausting memory.
- **Where:** `src/app/api/`, upload routes.
- **How:** Configure `bodyParser` size limits in Next.js API routes. Add explicit limits for AI and upload endpoints.

### 9. Remove or fix `Xxx` placeholder enum
- **What:** Clean up generated/placeholder enum values.
- **Where:** `src/infra/shopify/storefront/index.ts`, `src/infra/shopify/admin/index.ts`.
- **How:** Regenerate GraphQL types or remove `Xxx = 'XXX'` from enums if it’s a codegen placeholder.

---

## Low Priority

### 10. Component documentation (Storybook)
- **What:** Document UI components, props, and usage.
- **Where:** `src/ui/`, `src/app/` components.
- **How:** Add Storybook. Create stories for shared components. Add visual regression tests.

### 11. Pre-commit hooks
- **What:** Run lint and type-check before commits.
- **Where:** Root `.husky/`, `package.json`.
- **How:** Add Husky + lint-staged. Run `lint`, `type-check`, and optionally `test` on staged files.

### 12. Web Vitals and performance monitoring
- **What:** Track Core Web Vitals and performance metrics.
- **Where:** `src/app/layout.tsx`, `next.config.ts`.
- **How:** Use `@vercel/analytics` or Sentry performance. Report LCP, FID, CLS. Add performance budgets if needed.

### 13. Cache strategy for expensive operations
- **What:** Reduce load from repeated expensive queries.
- **Where:** `src/infra/cache/`, Shopify/GraphQL calls, sitemap.
- **How:** Use existing cache infra. Add Redis or Vercel KV for production. Set TTLs for product listings, sitemap, etc.

### 14. Input sanitization for user content
- **What:** Sanitize user-generated content before display or storage.
- **Where:** Form handlers, API routes, display components.
- **How:** Use DOMPurify or similar for HTML. Validate and escape text. Apply to AI prompts and any stored UGC.

---

## Task Types Legend

- **Code improvement:** Refactors, quality, maintainability
- **Feature improvement:** Enhancements to existing features
- **New feature:** New functionality

| # | Type              |
|---|-------------------|
| 1 | New feature       |
| 2 | Code improvement  |
| 3 | Code improvement  |
| 4 | Feature improvement |
| 5 | Code improvement  |
| 6 | New feature       |
| 7 | Code improvement  |
| 8 | Code improvement  |
| 9 | Code improvement  |
| 10| New feature       |
| 11| Code improvement  |
| 12| New feature       |
| 13| Feature improvement |
| 14| Code improvement  |
