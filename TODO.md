# TODO — Production Readiness Audit

## P2 — High Priority

- [ ] **WHAT:** Document rate limit identifier spoofing risk.
      **WHY:** `getClientContext` uses `x-forwarded-for` and `x-real-ip` for rate limiting. These headers can be spoofed by clients.
      **HOW:** Document in `docs/` or `src/core/utils/request-identity.ts` that when behind a trusted proxy (e.g. Vercel), `x-forwarded-for` is trusted. For stricter setups, consider using connection IP or a signed header from the proxy.

## P3 — Medium Priority

- [ ] **WHAT:** Strengthen CSP by replacing `'unsafe-inline'` for scripts.
      **WHY:** `script-src` includes `'unsafe-inline'` which weakens XSS protection.
      **HOW:** Use nonces or hashes for inline scripts if Next.js and third-party scripts support it. Otherwise document the trade-off.

- [ ] **WHAT:** Improve API client error response parsing.
      **WHY:** `api-client.ts` uses `response.json().catch(() => ({}))` on error responses. Non-JSON error bodies may not be surfaced.
      **HOW:** Log parse failures and optionally rethrow with a clearer message. Preserve original error in `cause`.

- [ ] **WHAT:** Replace TODO placeholder in marketing content.
      **WHY:** `src/ui/content/marketing.ts` line 94 has `TODO: Replace placeholder after images with actual style-specific transformations`.
      **HOW:** Implement or remove the TODO. If deferred, track in a separate ticket.

## P4 — Low Priority

- [ ] **WHAT:** Add E2E tests for create flow.
      **WHY:** E2E covers API routes and accessibility but not the create wizard (upload → style → generate → select → product → cart).
      **HOW:** Add Playwright spec for create flow (mock or stub OpenAI/UploadThing if needed).

- [ ] **WHAT:** Add E2E tests for checkout and cart operations.
      **WHY:** Cart and checkout flows are critical but not covered by E2E.
      **HOW:** Add Playwright specs for add-to-cart, quantity change, discount codes, and checkout redirect (may require Shopify test store).

- [ ] **WHAT:** Add E2E tests for auth flows.
      **WHY:** Login, register, password reset are not E2E tested.
      **HOW:** Add Playwright specs for auth flows (may require Shopify customer account setup).
