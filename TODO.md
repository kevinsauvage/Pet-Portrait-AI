# Backlog — production & quality

Living list aligned with the current codebase. See `ARCHITECTURE.md` and `README.md` for structure and stack.

---

## Resolved (for history)

| Topic | Notes |
|--------|--------|
| AI / Upload API secrets | `src/env.ts`; protected routes. |
| Printful preview | Auth + rate limit; `artworkUrl` allowlist via `trusted-https-image-host.ts`. |
| Rate-limit identity | `request-identity.ts` + `docs/REDIS_SETUP.md`. |
| Redis in prod | One-time warn without `REDIS_URL` (`rate-limit.ts`). |
| AI image URLs (SSRF) | Zod URL + `fetchTrustedHttpsImage`; `ALLOWED_IMAGE_URL_HOSTS`. |
| Sensitive logs | Portrait errors + shop_config parse warnings redacted. |

---

## High

### Untyped `shop_config` metafield

**What:** Shop tuning JSON is still `JSON.parse` + `as Partial<ShopConfig>` with manual merge; GraphQL `shop` is cast `as any` in `get-shop-config.service.ts` until types include `shopConfig`.

**Why:** Invalid or extreme values (e.g. huge `variationsCount`, timeouts) directly affect OpenAI cost, reliability, and UX with no schema-enforced ceiling.

**How:** Add a Zod schema for parsed + merged config with hard caps; run GraphQL codegen so `shop` typing drops `any` and the metafield is part of the generated types.

### OpenAI cost and latency — portrait variations

**What:** In `portrait-generation.service.ts`, variations run one-after-another and the source image is downloaded again for each call to OpenAI.

**Why:** Linear latency and repeated egress/API work; easier to hit `maxDuration` and inflate bills under load.

**How:** Bounded parallelism (pool size + cap); cache downloaded image bytes for the lifetime of one generation request; enforce max variation count only after config is Zod-validated.

### Predictive search abuse surface

**What:** `GET /api/search/predictive` forwards an unbounded `q` from the query string (`src/app/api/search/predictive/route.ts`) with no local rate limit—only Shopify-side throttling / error handling.

**Why:** Storefront API cost and throttling; degraded search for legitimate users if bots or scripts hammer the endpoint.

**How:** Trim `q`, enforce a max length; add `checkRateLimit` with a dedicated prefix (e.g. `search`); align `Cache-Control` with your abuse model.

### Create-flow URL storage

**What:** `POST /api/create-flow` passes a trimmed string into `setCreateFlowUrl` (`create-flow.service.ts`) with no URL or length validation before writing the customer metafield.

**Why:** Invalid, huge, or malicious strings in metafields; unsafe if any client navigates to stored values without checks.

**How:** Zod: `z.string().url()`, max length, optional allowlist (e.g. same origin or path prefix like `/create/...`).

### CSP and third-party surface

**What:** `next.config.ts` allows multiple wildcard `img-src` / `connect-src` entries (Shopify, UploadThing, analytics, Sentry, etc.).

**Why:** A large allowlist increases blast radius if a pattern is broader than needed or a listed host is compromised.

**How:** Audit real traffic and required integrations; shrink wildcards where possible; document required hosts per environment.

### Strict HTTPS for `NEXT_PUBLIC_BASE_URL`

**What:** `src/env.ts` (T3 Env) requires HTTPS for `NEXT_PUBLIC_BASE_URL` when `NODE_ENV=production`.

**Why:** Correct for public prod, but surprising for CI or local `next build` using `http://localhost`.

**How:** Document the pattern in `README` / deployment docs; optional stricter validation only on real deploy targets; keep HTTPS mandatory for staging/prod URLs.

### GraphQL codegen in runtime `dependencies`

**What:** `@graphql-codegen/*` packages live under `"dependencies"` in `package.json`.

**Why:** Larger production installs and dev tooling on the runtime dependency graph.

**How:** Move to `devDependencies` once CI/build always runs `yarn codegen` (or equivalent) before `next build`.

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

- **Open backlog:** ~18 items (7 High, 7 Medium, 4 Low).
- **Largest remaining risks:** unvalidated `shop_config` driving cost; unbounded predictive search; create-flow URL metafields; sequential OpenAI work + repeated image downloads.
- **Health (rough):** **7.5 / 10** — Strong structure and many controls in place; gaps are concentrated in config validation, abuse limits, and operational polish.

---

## Next priorities (suggested order)

1. Zod-validate merged `shop_config` with strict bounds; drop `as any` on `shop` via codegen.
2. Parallelize / cap OpenAI portrait variations; cache source image bytes per request.
3. Bound and rate-limit `GET /api/search/predictive` (`q` + `checkRateLimit`).
4. Validate create-flow URLs (Zod URL + max length) before metafield write.
5. Move `@graphql-codegen/*` to `devDependencies` with a verified CI/build codegen step.
