# TODO — Production Readiness Audit

## P1 — Critical (Launch Blockers)

- [ ] **WHAT:** Implement API session cookie issuance for `/create` flows.
      **WHY:** `.env.example` states "Browser flows receive a signed session cookie from middleware when visiting /create", but no middleware sets `pp_ai_session` or `pp_upload_session`. When `AI_API_SECRET` or `UPLOADTHING_API_SECRET` is set, same-origin requests will fail `isApiSessionValid` and return 401.
      **HOW:** Add middleware that, when visiting `/create` (or `/create/*`), sets session cookies via `auth.ts` helpers (or create `setApiSessionCookie`). Ensure cookies are HttpOnly, Secure, SameSite, and have appropriate expiry.

## P2 — High Priority

- [ ] **WHAT:** Document rate limit identifier spoofing risk.
      **WHY:** `getClientContext` uses `x-forwarded-for` and `x-real-ip` for rate limiting. These headers can be spoofed by clients.
      **HOW:** Document in `docs/` or `src/core/utils/request-identity.ts` that when behind a trusted proxy (e.g. Vercel), `x-forwarded-for` is trusted. For stricter setups, consider using connection IP or a signed header from the proxy.

- [ ] **WHAT:** Consolidate or clearly document duplicate order pages.
      **WHY:** `src/app/order/page.tsx` and `src/app/create/order/page.tsx` are nearly identical. Risk of divergence and maintenance burden.
      **HOW:** Either: (a) extract shared layout/content into a component and reuse; (b) redirect one to the other; or (c) document the intended difference (e.g. `/order` for direct cart, `/create/order` for create flow) and ensure they stay in sync.

- [ ] **WHAT:** Ensure production config validation does not block contact form.
      **WHY:** `validateProductionRequirements` requires SMTP for "order emails". Contact form uses different vars. If contact is required for production, validation should align.
      **HOW:** Clarify in validation whether contact form is required. If yes, add contact-specific vars (SMTP or EMAIL\_\*) to production requirements.

## P3 — Medium Priority

- [ ] **WHAT:** Strengthen CSP by replacing `'unsafe-inline'` for scripts.
      **WHY:** `script-src` includes `'unsafe-inline'` which weakens XSS protection.
      **HOW:** Use nonces or hashes for inline scripts if Next.js and third-party scripts support it. Otherwise document the trade-off.

- [ ] **WHAT:** Add sitemap failure alerting or monitoring.
      **WHY:** `sitemap.ts` falls back to `baseSitemap` on Shopify failure. Products and collections are missing from sitemap without visibility.
      **HOW:** Log with Sentry.

- [ ] **WHAT:** Improve API client error response parsing.
      **WHY:** `api-client.ts` uses `response.json().catch(() => ({}))` on error responses. Non-JSON error bodies may not be surfaced.
      **HOW:** Log parse failures and optionally rethrow with a clearer message. Preserve original error in `cause`.

- [ ] **WHAT:** Add deployment configuration (Dockerfile or vercel.json).
      **WHY:** No Dockerfile or vercel.json found. Deployment may be unclear for new environments.
      **HOW:** Add `vercel.json` if deploying to Vercel (e.g. `maxDuration`, `buildCommand`). Add `Dockerfile` if deploying to Docker/containers. Document in README.

- [ ] **WHAT:** Ensure tests pass with required env vars.
      **WHY:** Config validation runs at import time. Tests may fail if `validateConfig()` throws due to missing env.
      **HOW:** Ensure `vitest.setup.ts` or test env mocks required vars. Consider skipping validation in test mode or using a test-specific env file.

- [ ] **WHAT:** Replace TODO placeholder in marketing content.
      **WHY:** `src/ui/content/marketing.ts` line 94 has `TODO: Replace placeholder after images with actual style-specific transformations`.
      **HOW:** Implement or remove the TODO. If deferred, track in a separate ticket.

## P4 — Low Priority

- [ ] **WHAT:** Document cache behavior without Redis.
      **WHY:** `getCached` throws if `REDIS_URL` is missing. `withCache` catches and falls back to direct call. Behavior is implicit.
      **HOW:** Document in `docs/CACHE.md` that without Redis, `withCache` effectively bypasses cache and calls the underlying function. Rate limit uses in-memory fallback when Redis is absent.

- [ ] **WHAT:** Add E2E tests for create flow.
      **WHY:** E2E covers API routes and accessibility but not the create wizard (upload → style → generate → select → product → cart).
      **HOW:** Add Playwright spec for create flow (mock or stub OpenAI/UploadThing if needed).

- [ ] **WHAT:** Add E2E tests for checkout and cart operations.
      **WHY:** Cart and checkout flows are critical but not covered by E2E.
      **HOW:** Add Playwright specs for add-to-cart, quantity change, discount codes, and checkout redirect (may require Shopify test store).

- [ ] **WHAT:** Add E2E tests for auth flows.
      **WHY:** Login, register, password reset are not E2E tested.
      **HOW:** Add Playwright specs for auth flows (may require Shopify customer account setup).

- [ ] **WHAT:** Add health or readiness endpoint for production.
      **WHY:** Useful for load balancers, Kubernetes, and monitoring.
      **HOW:** Add `/api/health` or `/api/ready` that checks critical dependencies (Shopify connectivity, optional Redis) and returns 200/503.

- [ ] **WHAT:** Review and align duplicate route paths.
      **WHY:** `config.routes.cart` is `/order` while create order is `/create/order`. May confuse users and SEO.
      **HOW:** Consider canonical URLs and redirects. Document routing strategy.
