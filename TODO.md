# TODO — Production Readiness Audit

## P2 — High Priority

- [ ] **WHAT:** Enable E2E tests in CI.
      **WHY:** `e2e/cart-flow.spec.ts` and `e2e/api-routes.spec.ts` exist but are commented out in `.github/workflows/ci.yml`. Critical flows (cart, API auth) are not validated on every PR.
      **HOW:** Uncomment the Playwright install and E2E test steps in CI. Add `PLAYWRIGHT_TEST_BASE_URL` secret or use `http://localhost:3000` with a dev server. Consider running E2E on a schedule or before merge to main.

## P3 — Medium Priority

- [ ] **WHAT:** Implement full create → cart → checkout E2E test.
      **WHY:** `e2e/cart-flow.spec.ts` has a TODO for the full flow. Current tests only verify navigation and empty cart state. No test validates AI generation → add to cart → checkout.
      **HOW:** Add a test that mocks or bypasses AI generation (e.g., uses a pre-generated image URL), adds to cart, and verifies checkout redirect. Ensure test environment has required Shopify credentials or use a test store.

- [ ] **WHAT:** Ensure Gelato print URLs are permanent.
      **WHY:** `gelato_print_url` is passed to Shopify cart lines. Gelato app fetches the file from this URL. UploadThing URLs may have retention policies; if files are deleted, orders will fail.
      **HOW:** Verify UploadThing file retention policy. Document that generated art files must be kept for at least X days (e.g., order fulfillment period). Consider a dedicated storage for order fulfillment with longer retention.

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

- [ ] **WHAT:** Add `security.txt` route verification.
      **WHY:** `src/app/.well-known/security.txt/route.ts` exists. Verify it returns correct content and is accessible at `/.well-known/security.txt`.
      **HOW:** Add an E2E or smoke test that fetches `/.well-known/security.txt` and asserts expected fields (Contact, Expires, etc.).

- [ ] **WHAT:** Consider adding `Content-Length` validation for uploads.
      **WHY:** `enforceRequestSizeLimit` only checks `request.headers.get('content-length')`. Malicious clients can omit or lie about this header.
      **HOW:** For streaming uploads, consider checking body size during read. For JSON, the 256KB limit for AI is already enforced. Document that `Content-Length` can be spoofed and that UploadThing has its own limits.

- [ ] **WHAT:** Add `priceValidUntil` to product schema.
      **WHY:** `src/core/utils/structured-data.ts` sets `priceValidUntil` to 1 year from now. This is a reasonable default but may not reflect actual pricing.
      **HOW:** If Shopify provides price validity, use it. Otherwise, document the default and consider making it configurable.
