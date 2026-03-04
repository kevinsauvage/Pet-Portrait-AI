# TODO — Production Readiness Audit

## P1 — Critical (Launch Blockers)

- [x] **WHAT:** Wire Next.js middleware to protect `/create` routes.
      **WHY:** `src/proxy.ts` exports a `proxy` function that redirects unauthenticated users to `/login`, but Next.js requires `middleware.ts` at the project root with a default export. Without it, the proxy never runs and `/create` is fully accessible to anyone.
      **HOW:** Created `middleware.ts` at project root that delegates to the proxy function. Proxy now handles all routes, protecting `/create/*` (Shopify auth) and `/admin/*` (admin auth). Matcher config runs for all routes except static assets.

- [x] **WHAT:** Protect admin pages (`/admin/*`) with authentication.
      **WHY:** Admin layout (`src/app/admin/layout.tsx`) calls `getAdminGenerationSnapshot()` and renders admin UI without any auth check. Only API routes (`/api/admin/*`) use `requireAdminAuth`. Anyone can view generation logs, orders, and admin dashboard.
      **HOW:** Added admin auth check in proxy function for `/admin/*` routes. Also added defense-in-depth check in admin layout using `isAdminAuthorized(headers())` that redirects to login if unauthorized.

- [ ] **WHAT:** Issue API session cookies when users visit `/create`.
      **WHY:** `issueApiSessionCookie` exists in `src/core/utils/auth.ts` but is never called. When `AI_API_SECRET` or `UPLOADTHING_API_SECRET` are set in production, browser users must have a valid session cookie to call `/api/ai/generate` and `/api/uploadthing`. Without issuing the cookie, the create flow is broken for authenticated users.
      **HOW:** Add a route handler or middleware that runs when users visit `/create` (or `/create/*`), calls `issueApiSessionCookie(response, request, 'ai')` and `issueApiSessionCookie(response, request, 'upload')`, and returns the response with the cookie set. Alternatively, integrate into the create layout or a dedicated API route that the create page calls on mount.

- [ ] **WHAT:** Document SMTP environment variables in `.env.example`.
      **WHY:** `src/infra/email/index.ts` uses `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` for order confirmation emails. These are not listed in `.env.example`. Order emails will fail or behave unexpectedly if SMTP is not configured.
      **HOW:** Add a section to `.env.example` under "Required" or "Production" with `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, and optionally `SMTP_SECURE`. Add validation in `src/core/config/validation.ts` if order emails are required for production.

- [ ] **WHAT:** Remove debug `console.log` from auth service.
      **WHY:** `src/domains/auth/services/auth.service.ts` lines 95–96 log `customerAccessToken` and `customerUserErrors` on every login. This can leak sensitive data in production logs.
      **HOW:** Remove the two `console.log` calls. Use `logger.debug` with redacted context if debug logging is needed in development.

- [x] **WHAT:** Add `requireAdminAuth` check before fetching admin data in admin layout.
      **WHY:** Admin layout fetches `getAdminGenerationSnapshot()` on every render. If middleware is added later, the layout still needs to guard against direct access. Defense in depth: layout should not render admin data without auth.
      **HOW:** Added `isAdminAuthorized(await headers())` check in admin layout that redirects to login if unauthorized. This provides defense in depth alongside the proxy middleware protection.

## P2 — High Priority

- [ ] **WHAT:** Enforce auth on account sub-pages (wishlist, creations, update).
      **WHY:** `src/app/account/page.tsx`, `addresses`, `orders`, `edit` redirect to login when user is missing. `wishlist`, `creations`, and `update` do not. Unauthenticated users can view these pages (empty state for wishlist/creations). Update page shows a form that returns "User not found" on submit.
      **HOW:** Add `const user = await getUser(); if (!user) redirect(config.routes.login);` at the top of `src/app/account/wishlist/page.tsx`, `creations/page.tsx`, and `update/page.tsx` for consistency with other account pages.

- [ ] **WHAT:** Sanitize HTML in `CreateProductRow` and `LegalContent` before `dangerouslySetInnerHTML`.
      **WHY:** `CreateProductRow` (`src/ui/components/create/islands/CreateProductRow.tsx`) uses `product.description` from Shopify without sanitization. `LegalContent` (`src/ui/components/legal/LegalContent.tsx`) uses policy HTML from Shopify. While both are "trusted" sources, defense in depth prevents XSS if Shopify data is ever compromised or misconfigured.
      **HOW:** Import `sanitizeHtml` from `@/core/utils/sanitize` and wrap `product.description` and `html` in `LegalContent` before passing to `dangerouslySetInnerHTML`.

- [ ] **WHAT:** Persist generation logs for admin dashboard.
      **WHY:** `src/domains/ai/repositories/generation-log.repository.ts` uses an in-memory array. Data is lost on server restart. Admin dashboard cannot show historical trends or failures across deployments.
      **HOW:** Replace in-memory store with Redis (using existing `src/infra/cache`) or a database. Add `getCached`/`setCached` patterns or a dedicated key schema for generation logs. Ensure TTL and max entries are configurable.

- [ ] **WHAT:** Enable E2E tests in CI.
      **WHY:** `e2e/cart-flow.spec.ts` and `e2e/api-routes.spec.ts` exist but are commented out in `.github/workflows/ci.yml`. Critical flows (cart, API auth) are not validated on every PR.
      **HOW:** Uncomment the Playwright install and E2E test steps in CI. Add `PLAYWRIGHT_TEST_BASE_URL` secret or use `http://localhost:3000` with a dev server. Consider running E2E on a schedule or before merge to main.

- [ ] **WHAT:** Re-enable Next.js image optimization.
      **WHY:** `next.config.ts` has `images.unoptimized: true`. This disables automatic WebP/AVIF, resizing, and lazy loading. Images are served at full size, increasing bandwidth and hurting LCP.
      **HOW:** Set `images.unoptimized: false` (or remove the line). Ensure all image domains are in `remotePatterns`. If Vercel/Image Optimization is used, verify no conflicts with external domains.

- [ ] **WHAT:** Add rate limiting for contact form submission.
      **WHY:** Contact form has no rate limit. Malicious actors can spam the contact endpoint.
      **HOW:** Apply `checkRateLimit` from `src/infra/rate-limit/rate-limit.ts` in the contact form action or API route. Use a prefix like `contact` and a reasonable window (e.g., 3 submissions per 10 minutes per IP).

- [ ] **WHAT:** Document Redis requirement for rate limiting in production.
      **WHY:** `src/infra/rate-limit/rate-limit.ts` falls back to in-memory storage when `REDIS_URL` is not set. In serverless/edge, each instance has its own memory; rate limits are not shared across instances.
      **HOW:** Update `.env.example` and `DEPLOYMENT.md` to state that `REDIS_URL` is required for production when using multiple instances. Add a startup warning if `NODE_ENV=production` and `REDIS_URL` is missing.

## P3 — Medium Priority

- [ ] **WHAT:** Implement full create → cart → checkout E2E test.
      **WHY:** `e2e/cart-flow.spec.ts` has a TODO for the full flow. Current tests only verify navigation and empty cart state. No test validates AI generation → add to cart → checkout.
      **HOW:** Add a test that mocks or bypasses AI generation (e.g., uses a pre-generated image URL), adds to cart, and verifies checkout redirect. Ensure test environment has required Shopify credentials or use a test store.

- [ ] **WHAT:** Add Shopify webhook handlers if needed.
      **WHY:** `src/infra/shopify/webhooks.ts` exports `verifyShopifyWebhook` but no webhook route handlers exist. Docs state Gelato app handles fulfillment and no webhooks are needed for current flow. If order confirmation or inventory sync is required later, handlers are missing.
      **HOW:** Create `/api/webhooks/shopify/product-update` (or similar) route that verifies HMAC and processes events. Document in `docs/` when webhooks are needed. If not needed, add a comment in `webhooks.ts` explaining the design decision.

- [ ] **WHAT:** Update robots.txt to disallow cart route.
      **WHY:** `src/core/config/robots.ts` disallows `/cart` but the actual cart/order page is `/create/order`. Search engines may still index the cart page.
      **HOW:** Add `/create/order` to the `disallow` array in `ROBOTS_RULES`. Consider disallowing `/create/*` if the create flow is user-specific and not useful for SEO.

- [ ] **WHAT:** Redirect unauthenticated users from account update page.
      **WHY:** `src/app/account/update/page.tsx` does not redirect when `user` is null. It renders `UpdateUserForm` which uses `useUserContext`; submitting without user returns "User not found". Poor UX and confusing state.
      **HOW:** Add `if (!user) redirect(config.routes.login);` at the top of the page, consistent with other account pages.

- [ ] **WHAT:** Validate image URL scheme before fetching in AI generation.
      **WHY:** `validateImageFromUrl` in `src/domains/ai/ai-portrait/validate-image.ts` fetches any URL. Malicious URLs (e.g., `file://`, `http://internal-service`) could be used for SSRF.
      **HOW:** Add a whitelist: only allow `https://` URLs from known domains (e.g., `utfs.io`, `*.ufs.sh`, `cdn.shopify.com`, `res.cloudinary.com`). Reject `file://`, `http://internal`, and non-whitelisted hosts before fetching.

- [ ] **WHAT:** Add error boundary for create flow steps.
      **WHY:** Create flow has multiple steps (upload, style, generating, select, collections, order). Errors in one step can leave the user stuck without clear recovery.
      **HOW:** Add `error.tsx` in `src/app/create/` that catches errors and offers "Start over" and "Go home" actions. Ensure the error state is user-friendly and logs to Sentry.

- [ ] **WHAT:** Ensure Gelato print URLs are permanent.
      **WHY:** `gelato_print_url` is passed to Shopify cart lines. Gelato app fetches the file from this URL. UploadThing URLs may have retention policies; if files are deleted, orders will fail.
      **HOW:** Verify UploadThing file retention policy. Document that generated art files must be kept for at least X days (e.g., order fulfillment period). Consider a dedicated storage for order fulfillment with longer retention.

- [ ] **WHAT:** Add `NEXT_PUBLIC_BASE_URL` validation for HTTP in production.
      **WHY:** `src/core/config/validation.ts` warns when `NEXT_PUBLIC_BASE_URL` uses HTTP in production but does not block. Mixed content or insecure cookies can occur.
      **HOW:** Consider making HTTP a hard error in production (not just a warning). Add a check in `validateConfig` that throws when `isProduction && url.protocol === 'http:'`.

## P4 — Low Priority

- [ ] **WHAT:** Replace placeholder in marketing content.
      **WHY:** `src/ui/content/marketing.ts` line 94 has a TODO: "Replace placeholder after images with actual style-specific transformations."
      **HOW:** Implement the style-specific placeholder images or remove the TODO if not needed.

- [ ] **WHAT:** Add Open Graph image for dynamic product pages.
      **WHY:** `generateMetadata` in product pages uses `seo.image` from product data. Product schema and metadata are set. Verify that social previews show correct product images on share.
      **HOW:** Ensure `image` in product metadata is an absolute URL. Test with Facebook Debugger and Twitter Card Validator. Add fallback to site logo if product image is missing.

- [ ] **WHAT:** Audit Tailwind consistency.
      **WHY:** Multiple components use Tailwind. Ensure consistent spacing, typography, and color tokens.
      **HOW:** Run a design audit. Use `tailwind.config` or CSS variables for consistency. Document design tokens in a style guide.

- [ ] **WHAT:** Add `aria-live` for dynamic cart updates.
      **WHY:** When items are added to cart, screen readers may not announce the change.
      **HOW:** Wrap cart count or status in an `aria-live="polite"` region. Ensure toast notifications from `sonner` are announced (already handled by `sonner` in many cases).

- [ ] **WHAT:** Document Redis cache usage.
      **WHY:** `src/infra/cache/index.ts` provides Redis caching but it is not used in the application (only in tests and docs). Rate limiting uses Redis separately.
      **HOW:** Either: (a) integrate Redis cache for product/collection data to reduce Shopify API calls, or (b) document that cache is available for future use and remove from deployment requirements if not needed.

- [ ] **WHAT:** Add `security.txt` route verification.
      **WHY:** `src/app/.well-known/security.txt/route.ts` exists. Verify it returns correct content and is accessible at `/.well-known/security.txt`.
      **HOW:** Add an E2E or smoke test that fetches `/.well-known/security.txt` and asserts expected fields (Contact, Expires, etc.).

- [ ] **WHAT:** Consider adding `Content-Length` validation for uploads.
      **WHY:** `enforceRequestSizeLimit` only checks `request.headers.get('content-length')`. Malicious clients can omit or lie about this header.
      **HOW:** For streaming uploads, consider checking body size during read. For JSON, the 256KB limit for AI is already enforced. Document that `Content-Length` can be spoofed and that UploadThing has its own limits.

- [ ] **WHAT:** Add `priceValidUntil` to product schema.
      **WHY:** `src/core/utils/structured-data.ts` sets `priceValidUntil` to 1 year from now. This is a reasonable default but may not reflect actual pricing.
      **HOW:** If Shopify provides price validity, use it. Otherwise, document the default and consider making it configurable.

- [ ] **WHAT:** Wire order confirmation email to order flow.
      **WHY:** `sendOrderConfirmation` in `src/domains/orders/services/order-email.service.ts` exists but is never called. Shopify sends its own order confirmation; this service may be intended for custom or additional emails.
      **HOW:** If custom order emails are required, add a Shopify order webhook handler that calls `sendOrderConfirmation` after verifying the webhook. Ensure SMTP is configured. If not needed, remove or document that Shopify handles order emails.
