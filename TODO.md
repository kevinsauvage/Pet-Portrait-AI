## High

### Create-flow URL storage

**Done:** `parseCreateFlowStoredUrl` (`validate-create-flow-stored-url.ts`) enforces max length, rejects absolute / protocol-relative URLs, requires pathname under `/create`, blocks `..` / `%2e%2e`, normalizes before metafield write; `getCreateFlowUrl` drops invalid stored values; invalid POST returns 400.

### CSP and third-party surface

**Partial:** `img-src` / `connect-src` entries in `next.config.ts` are documented inline (purpose per integration). Further tightening needs a traffic audit before replacing wildcards (UploadThing subdomains, Shopify, Sentry).

### Strict HTTPS for `NEXT_PUBLIC_BASE_URL`

**Done:** Documented under **Required** env vars in `README.md` (production / `next build` vs local dev; CI placeholder).

---

## Medium

### Cross-domain coupling

**What:** Some domains import others (e.g. AI → creations/user) despite “avoid cross-domain imports” in `ARCHITECTURE.md`.

**Why:** Refactors ripple across modules; boundaries erode and onboarding gets harder.

**How:** Document explicitly allowed import edges, or introduce a thin application/orchestration layer and shared DTOs.

### Wishlist JSON shape

**What:** Parsed wishlist data only guarantees `id` is a string (`wishlist.service.ts`).

**Why:** Corrupt metafields can produce inconsistent UI or unsafe assumptions on other fields.

**How:** Zod-parse the full `SavedPortrait` (or equivalent) shape; cap list length early.

### Fragile auth error detection

**What:** `get-user.ts` clears the token when the error message contains `Unauthorized` or `401`.

**Why:** Brittle if API messages change; other failure modes may be misclassified.

**How:** Prefer structured error codes from the Shopify client (or typed errors) instead of string matching.

### Printful logging inconsistency

**What:** `src/infra/printful/printful-api-client.ts` uses `console.error` in several paths.

**Why:** Harder to correlate with request context in centralized logging / APM.

**How:** Switch to `logger.error` with a stable `context` and tags consistent with the rest of the app.

### Unnecessary OpenAI beta header

**What:** `OpenAI-Beta: assistants=v2` is sent on the image edits request in `portrait-generation.service.ts`.

**Why:** Noise and possible future incompatibility if the images API ignores or changes behavior around beta flags.

**How:** Remove unless OpenAI documents it as required for that endpoint.

### Images always unoptimized

**What:** `images.unoptimized: true` in `next.config.ts`.

**Why:** Larger LCP and bandwidth on merchandising pages versus Next.js image optimization.

**How:** Re-enable optimization where `remotePatterns` and your CDN allow; measure LCP and cache behavior.

### Loose typing in API route tests

**What:** Some route tests cast `Response` / `json()` as `any` (e.g. AI, cart routes).

**Why:** Weaker contracts when APIs evolve; regressions slip through.

**How:** Shared typed test helpers or Zod-parse response bodies in tests.

---

## Low

### Repo / folder name vs stack

**What:** Workspace path may still suggest “Strapi”; the stack is Next.js + Shopify + Printful (`README` and package name `petportrait-ai-ecommerce` are clearer).

**Why:** Onboarding confusion for new contributors.

**How:** Rename the repo folder or add a prominent one-liner in `README` / contributor docs.

### Boundary file naming / docs

**What:** `src/proxy.ts` exists; there is no root `middleware.ts`. Knip may list `proxy` as an entry.

**Why:** People migrating between Next versions may not know current boundary conventions.

**How:** Document in `README.md` / `DEPLOYMENT.md`; add smoke coverage for auth redirect behavior if product-critical.

### Shopify cart / checkout edge coverage

**What:** Cart flows depend on cookie cart id and Shopify `userErrors` mapping; complex inventory/discount cases are easy to miss.

**Why:** Subtle production bugs under races or inventory/discount changes.

**How:** Expand Playwright coverage: stale cart, out-of-stock variant, rejected discount.

### JSON-LD script injection hygiene

**What:** JSON-LD uses `dangerouslySetInnerHTML` + `JSON.stringify` on product/layout pages.

**Why:** Usually safe with trusted objects; edge cases if untyped strings slip into schema payloads.

**How:** Build schemas from typed objects only; consider unicode-safe serialization if legacy browsers matter.

---

## Summary

- **Open backlog:** ~17 items (6 High, 7 Medium, 4 Low).
- **Largest remaining risks:** sequential OpenAI work + repeated image downloads.
- **Health (rough):** **7.5 / 10** — Strong structure and many controls in place; gaps are concentrated in config validation, abuse limits, and operational polish.

---

## Next priorities (suggested order)

1. ~~Zod-validate merged `shop_config` with strict bounds; drop `as any` on `shop` via codegen.~~ Done (`shop-config.schema.ts`, typed `getShop` result).
2. Parallelize / cap OpenAI portrait variations; cache source image bytes per request.
3. ~~Bound and rate-limit `GET /api/search/predictive` (`q` + `checkRateLimit`).~~ Done.
4. ~~Validate create-flow URLs before metafield write.~~ Done (`validate-create-flow-stored-url.ts`).
5. Move `@graphql-codegen/*` to `devDependencies` with a verified CI/build codegen step.
