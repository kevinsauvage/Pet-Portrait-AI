# Codebase audit — production readiness TODOs

Prioritized findings from a full-repo review (domains, infra, App Router API routes, Shopify/Printful/OpenAI paths, config, security headers, and tooling). Similar issues are merged.

---

## 🔴 Critical (must fix before production)

~~[API protection when secrets unset]~~ **Done:** `AI_API_SECRET` / `UPLOADTHING_API_SECRET` are required in all environments via `src/env.ts`; `getConfigStatus` lists them as required; tests in `src/core/utils/auth.api-protection.test.ts`.

~~[Unauthenticated Printful preview API]~~ **Done:** `POST /api/printful/preview` uses `requireApiProtection` (`PRINTFUL_API_SECRET` + `pp_printful_session` on `/create`), `checkRateLimit`, and UploadThing hostname allowlist (`src/domains/printful/allowed-artwork-url.ts`). `PRINTFUL_TOKEN` and `PRINTFUL_API_SECRET` required in `src/env.ts`.

[Rate limit bypass and non-distributed fallback]
What: Client identity for limits uses `x-forwarded-for` / `x-real-ip` (`src/core/utils/request-identity.ts`). Without a trusted edge, values are client-controlled. Without `REDIS_URL`, limits use in-memory storage per instance (`src/infra/rate-limit/rate-limit.ts`).
Why: Limits are easy to evade; serverless scale-out multiplies effective quota.
How: Prefer platform-verified IP; document/strip untrusted forwarded headers; require Redis for production multi-instance; add per-user or per-token budgets for expensive routes.

[SSRF depth on user image URLs]
What: `originalPhotoUrl` is only a non-empty string in Zod (`src/domains/ai/ai-portrait/validation.ts`). Validation enforces HTTPS (`validate-image.ts`), but OpenAI path re-fetches the URL (`portrait-generation.service.ts`) without redirect limits or hostname allowlist.
Why: HTTPS-only is not enough against redirect chains or abuse of permitted public hosts—server-side fetch of user URLs remains high-risk.
How: Use `z.string().url()`; allowlist hosts (e.g. UploadThing); use `fetch` with redirect: `'manual'` or capped redirects; optionally block resolved private IPs.

[Sensitive data in logs]
What: AI generation errors log `originalPhotoUrl` (`src/domains/ai/portrait-generation.service.ts`). Shop config parse failures log raw metafield `value` (`src/domains/shop/get-shop-config.service.ts`).
Why: PII and merchant data in logs/APM violates privacy expectations and complicates compliance.
How: Redact URLs (hash or placeholder); log only presence, length, and safe error metadata for metafields.

---

## 🟠 High (important improvements)

[Untyped shop_config metafield]
What: Shop tuning JSON is `JSON.parse` + `as Partial<ShopConfig>` with manual merge; GraphQL `shop` is cast `as any` (`get-shop-config.service.ts`).
Why: Invalid or extreme values (e.g. huge `variationsCount`) directly affect OpenAI cost, timeouts, and UX.
How: Zod schema for parsed + merged config with hard caps; run codegen so `shop` typing drops `any`.

[OpenAI cost and latency — sequential variations]
What: Portrait variations run one-after-another and re-download the source image each time (`src/domains/ai/portrait-generation.service.ts`).
Why: Linear latency and multiplied API/egress cost; risks hitting `maxDuration` under load.
How: Bounded parallelism; cache downloaded bytes per request; enforce max variations in validated config.

[Predictive search abuse surface]
What: `/api/search/predictive` forwards unbounded `q` (`src/app/api/search/predictive/route.ts`) with no local rate limit (only Shopify error handling).
Why: Storefront API throttling and cost; degraded search for real users.
How: Max length + trim on `q`; `checkRateLimit` with `search` prefix; short CDN/cache headers already partial—align with abuse model.

[Create-flow URL storage]
What: `POST /api/create-flow` stores arbitrary string URLs after trim (`src/app/api/create-flow/route.ts`).
Why: Invalid/huge/malicious values in customer metafields; potential redirect issues if clients navigate blindly.
How: Zod: `z.string().url()`, max length, optional path prefix allowlist (`/create/...`).

[CSP and third-party surface]
What: `next.config.ts` allows multiple wildcard `img-src` / `connect-src` hosts for Shopify, UploadThing, analytics, Sentry, etc.
Why: Large allowlist increases impact if any listed pattern is overly broad.
How: Audit real traffic; shrink wildcards; document required hosts per env.

[Strict HTTPS config vs local builds]
What: `src/env.ts` (T3 Env) rejects HTTP `NEXT_PUBLIC_BASE_URL` in production during build/runtime.
Why: Correct for real prod, but surprises CI/local `next build` with `NODE_ENV=production` and `http://localhost`.
How: Document pattern; optional stricter flag only on deploy targets; keep HTTPS mandatory for public staging/prod.

[Codegen packages in runtime dependencies]
What: `@graphql-codegen/*` are under `"dependencies"` in `package.json`.
Why: Bigger prod installs and unnecessary runtime exposure of dev tooling.
How: Move to `devDependencies`; ensure pipeline runs codegen before build.

---

## 🟡 Medium (quality improvements)

[Cross-domain coupling]
What: Domains import each other (e.g. `ai` → `creations`/`user`, `ai-portrait` → `printful` utils) despite “avoid cross-domain imports” in `ARCHITECTURE.md`.
Why: Refactors ripple; boundaries erode over time.
How: Document allowed edges or introduce small shared interfaces / application layer.

[Wishlist JSON shape]
What: Parsed wishlist only guarantees `id` is a string (`src/domains/wishlist/wishlist.service.ts`).
Why: Corrupt metafields cause inconsistent UI or unsafe assumptions on other fields.
How: Zod parse for full `SavedPortrait`; cap list length early.

[Fragile auth error detection]
What: `get-user.ts` clears token when error message contains `Unauthorized` or `401`.
Why: Brittle against API message changes; may miss other failure modes.
How: Classify errors via structured codes from the Shopify client where possible.

[Printful logging inconsistency]
What: `printful-api-client.ts` uses `console.error` instead of `logger`.
Why: Harder to correlate with request context in centralized logging.
How: Switch to `logger.error` + consistent tags.

[Unnecessary OpenAI beta header]
What: `OpenAI-Beta: assistants=v2` on image edits request (`portrait-generation.service.ts`).
Why: Noise and possible future incompatibility.
How: Remove unless officially required for that endpoint.

[Images always unoptimized]
What: `images.unoptimized: true` in `next.config.ts`.
Why: Larger LCP and bandwidth for merchandising pages.
How: Re-enable Next image optimization where URL patterns allow; keep `remotePatterns` accurate.

[Tests use loose typing on API responses]
What: Route tests cast responses/`json()` as `any` (e.g. AI/cart route tests).
Why: Weaker contracts when APIs evolve.
How: Typed helpers or Zod-parse responses in tests.

---

## 🟢 Low (nice-to-have)

[Repo name vs actual stack]
What: Project name suggests Strapi; stack is Next.js + Shopify + Printful.
Why: Onboarding confusion.
How: Rename or clarify stack prominently in `README.md`.

[Boundary file naming / docs]
What: `src/proxy.ts` exists; no `middleware.ts`. Knip lists `proxy` as an entry.
Why: Migrators may not know Next 16 boundary conventions.
How: Document in `README.md` / `DEPLOYMENT.md`; add a smoke check for auth redirect behavior if product requires it.

[Shopify cart/checkout edge coverage]
What: Cart flows depend on cookie cart id and Shopify `userErrors` mapping; complex inventory/discount cases are easy to miss.
Why: Subtle production bugs under race or inventory change.
How: Expand Playwright coverage for stale cart, OOS variant, rejected discount.

[JSON-LD script injection hygiene]
What: JSON-LD uses `dangerouslySetInnerHTML` + `JSON.stringify` on product/layout pages.
Why: Usually safe; edge cases if untyped strings slip into schema objects.
How: Build schemas from typed objects only; consider unicode-safe serialization if targeting legacy browsers.

---

## 📊 Summary

- **Total issues found:** 24 (merged from repeated themes across files)
- **Biggest risks:** Misconfigured or missing API auth on paid integrations; weak distributed rate limiting; user-controlled URL fetch paths; PII in logs; unvalidated shop metafield driving cost-related settings
- **Overall codebase health:** **7 / 10** — Strong structure (domains/infra split, Zod on many routes, sanitization, CSP, Sentry, logging patterns); gaps are concentrated around API abuse, limits, config typing, and operational safety.

---

## 🚀 Top 5 priorities

The **10** most impactful fixes to do first (ordered):

1. ~~Enforce `AI_API_SECRET` / `UPLOADTHING_API_SECRET`~~ **Done** (see `src/env.ts`, `getConfigStatus`).
2. ~~Authenticate and rate-limit `/api/printful/preview`; constrain `artworkUrl` origins~~ **Done**.
3. Fix rate-limit identity (trusted IP) and require Redis for multi-instance.
4. Harden image URL handling (Zod URL, allowlist, redirect policy) for validation + OpenAI fetch.
5. Redact logging of URLs and raw metafield payloads.
6. Zod-validate merged `shop_config` with strict bounds; remove `as any` on `shop` via codegen.
7. Parallelize/cap OpenAI variations; cache source image per request.
8. Bound and rate-limit predictive search queries.
9. Validate create-flow URLs with Zod before metafield write.
10. Move GraphQL codegen packages to `devDependencies`.
