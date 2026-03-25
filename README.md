# PetPortrait AI — Custom AI Pet Portrait Ecommerce

A fully automated ecommerce platform that generates and sells custom AI-created pet portraits. Built with **Next.js 16**, **Shopify Storefront & Admin GraphQL APIs**, **OpenAI** for image generation, and **Printful** for print-on-demand fulfillment.

## Features

- **AI Pet Portrait Generator**
  Upload a pet photo, choose an art style (Pixar, Watercolor, Anime, Royal, Cyberpunk, Renaissance, Pop Art, Minimalist), and receive multiple portrait variations.

- **Shopify Integration**
  Storefront API for products, cart, and checkout.

- **Printful Print-on-Demand**
  The Printful Shopify app automatically fulfills physical orders (canvas, poster, apparel) using the `printful_print_url` line item attribute. No backend fulfillment code required.

- **Modern UI**
  Tailwind CSS v4, Radix UI components, lucide-react icons, dark/light mode.

- **Type-Safe Architecture**
  GraphQL Codegen, Zod validation, strict TypeScript everywhere.

---

## Architecture Overview

High-level layout (see [ARCHITECTURE.md](./ARCHITECTURE.md) for conventions and boundaries):

```txt
src/
  app/                    # Next.js App Router (routes, layouts, API routes)
  env.ts                  # Validated env (@t3-oss/env-nextjs) — server + client schema

  domains/                # Business logic (flat by default: actions, *.service.ts, validation.ts)
    address/ auth/ cart/ collections/ contact/ create-flow/ creations/
    home/ legal/ navigation/ orders/ products/ search/ shop/ user/ creations/
    ai/                     # Portrait generation, ai-portrait/ types & flows
    printful/               # Preview service, artwork URL rules, Printful helpers

  infra/                  # Technical plumbing only (no domain rules)
    shopify/                # Storefront + Admin clients, .graphql, generated SDKs
    upload/                 # UploadThing router & client
    email/ cache/ http/ rate-limit/

  core/                   # Config, errors, shared utils (loggers, form-actions, API responses)
  lib/                    # Pure helpers, cookies, format, TanStack Query, next-safe-action
  ui/                     # Components, layouts, primitives
  types/ hooks/ contexts/
  assets/
```

Committed GraphQL types live under `src/infra/shopify/generated/` so CI and fresh clones can build without Shopify credentials; run `yarn codegen` when the schema changes.

---

## Data Flow

```
1. User uploads photo      → UploadThing CDN
2. User selects art style  → Frontend only
3. AI generates variants   → OpenAI Images API
4. User selects final art  → Stored on CDN (public, permanent)
5. User picks product      → Shopify Storefront API (products synced by Printful app)
6. Add to cart             → Shopify cart with printful_print_url attribute
7. Checkout & order        → Normal Shopify checkout
8. Fulfillment             → Printful Shopify app reads printful_print_url, prints & ships
```

See [Printful Portrait Preview](./docs/PRINTFUL_PORTRAIT_PREVIEW.md) for the Printful integration guide.

---

## Tech Stack

| Category     | Technology |
| ------------ | ---------- |
| Framework    | Next.js 16 (Turbopack: `yarn dev` / `yarn build`), React 19, TypeScript 5 |
| Styling      | Tailwind CSS v4, Radix UI, lucide-react |
| APIs         | Shopify Storefront GraphQL, Shopify Admin API (OAuth 2.0 app on the store) |
| AI           | OpenAI Images API (portrait edits) |
| Fulfillment  | Printful Shopify app (automatic); Mockup API for on-site previews |
| Validation   | Zod v4, `@t3-oss/env-nextjs` (`src/env.ts`) |
| GraphQL      | graphql-request, GraphQL Codegen (`yarn codegen`) |
| Uploads      | UploadThing |
| Email        | Resend (required when `NODE_ENV=production`) |
| Cache / limits | Optional Redis (`REDIS_URL`) for shared rate limits and caching |
| Monitoring   | Sentry (optional DSN) |
| Testing      | Vitest, Playwright (e2e + a11y), Testing Library |
| Git hooks    | Husky + lint-staged (via `yarn install` → `prepare`) |

---

## Getting Started

### Prerequisites

- **Node.js 20+** (matches [CI](.github/workflows/ci.yml))
- **Yarn** (lockfile: `yarn.lock`)
- **Git**
- Accounts / credentials: **Shopify** store with a **custom app** installed, **OpenAI**, **UploadThing**, **Printful** (API token + Shopify app for fulfillment), **Resend** for production email

### Installation

```bash
git clone <repository-url>
cd nextjs-strapi-ecommerce   # or your checkout folder name
yarn install                 # runs Husky `prepare` for git hooks
```

### Environment Variables

#### Quick setup

1. Copy the template and edit locally (never commit secrets):

```bash
cp .env.example .env.local
```

2. Fill **all variables marked required** in `.env.example`. Validation runs when Next loads config via **`src/env.ts`** (`@t3-oss/env-nextjs`). Missing required keys fail fast with explicit errors.

3. **Shopify API URLs** in `.env.example` use the **`2026-01`** API version as the documented minimum; adjust if your app uses another supported version, keeping Storefront and Admin URLs in sync.

4. For **tests** or tooling that should not load full env validation, the repo sets `VITEST=true` in Vitest, or you can use `SKIP_ENV_VALIDATION=1` where appropriate (see `.env.example` header).

#### Environment Setup Checklist

##### ✅ Required (All Environments)

These variables are required for the application to function:

- **`NEXT_PUBLIC_BASE_URL`** - Your site's base URL (e.g., `https://yourdomain.com`). When `NODE_ENV=production` (including `next build`), `src/env.ts` requires the **`https:`** scheme. CI uses an HTTPS placeholder (see `.github/workflows/ci.yml`); local dev may use `http://localhost:3000` while `NODE_ENV` is not `production`.
- **`NEXT_PUBLIC_SHOPIFY_STOREFRONT_URL`** - Storefront GraphQL endpoint (e.g. `https://<store>.myshopify.com/api/2026-01/graphql.json`)
- **`SHOPIFY_STORE_FRONT_ACCESS_TOKEN`** - Storefront access token
- **`SHOPIFY_CLIENT_ID`** / **`SHOPIFY_CLIENT_SECRET`** - Custom app OAuth credentials (Shopify Dev Dashboard)
- **`SHOPIFY_ADMIN_URL`** - Admin GraphQL endpoint (same API version as Storefront)
- **`OPENAI_API_KEY`** - OpenAI API key for AI portrait generation
- **`UPLOADTHING_TOKEN`** - UploadThing API token
- **`UPLOADTHING_SECRET`** - UploadThing API secret
- **`AI_API_SECRET`** - Protects `/api/ai/generate` (session cookie on `/create` or Bearer / `x-api-key`)
- **`UPLOADTHING_API_SECRET`** - Protects `/api/uploadthing` (same pattern)
- **`PRINTFUL_TOKEN`** - Printful API token for mockup previews (`/create/order`)
- **`PRINTFUL_API_SECRET`** - Protects `/api/printful/preview` (same session / header pattern)

##### 🔒 Required in Production

These are required when `NODE_ENV=production`:

- **`RESEND_API_KEY`** - Resend API key for sending transactional emails (contact forms, order confirmations, etc.)

##### ⚠️ Recommended for Production

These are recommended for production deployments:

- **`NEXT_PUBLIC_SENTRY_DSN`** - Sentry DSN for error monitoring
- **`SENTRY_ORG`** - Sentry organization name
- **`SENTRY_PROJECT`** - Sentry project name
- **`REDIS_URL`** - Redis for shared rate limiting and server-side cache (`src/infra/rate-limit/`, `src/infra/cache/`); use a managed URL (e.g. Vercel Redis / Upstash) in multi-instance production

##### 📊 Optional Features

- **`NEXT_PUBLIC_GTM_ID`** — Google Tag Manager container ID
- **`NEXT_PUBLIC_SITE_DOMAIN`** — Cookie/site domain hints where used
- **SEO / branding** — Names, logos, social links, AI variant IDs: see **`.env.example`** and `src/core/config/siteMetadata.ts`
- **Also whitelisted in `src/env.ts`** (optional): `NEXT_PUBLIC_SITE_LOGO_DARK`, `NEXT_PUBLIC_SITE_OG_IMAGE`, `NEXT_PUBLIC_SITE_FACEBOOK_URL`, `NEXT_PUBLIC_SITE_INSTAGRAM_URL`, `NEXT_PUBLIC_SITE_TWITTER_HANDLE`

#### Validation

The application validates environment variables on startup:

- **Errors** (blocking): Missing required variables will prevent the app from starting
- **Warnings** (non-blocking): Missing recommended variables will show warnings but allow startup
- **Production checks**: Additional validations run when `NODE_ENV=production`

To check your configuration status programmatically:

```typescript
import { getConfigStatus } from '@/core/config/validation';

const status = getConfigStatus();
console.log(status);
```

#### Deployment Scenarios

**Development:**

- Only required variables needed

**Staging:**

- All required variables
- Recommended variables (Sentry, Redis) for testing

**Production:**

- All required variables
- All production-required variables (RESEND_API_KEY)
- All recommended variables (Sentry, Redis)
- Optional variables as needed

See `.env.example` for detailed descriptions of each variable.

### Development commands

| Command | Purpose |
| -------- | -------- |
| `yarn dev` | Dev server (Turbopack) |
| `yarn build` | Production build (Turbopack) |
| `yarn start` | Run production server locally (after `yarn build`) |
| `yarn codegen` | Regenerate Shopify GraphQL SDKs → `src/infra/shopify/generated/` |
| `yarn codegen:watch` | Codegen in watch mode |
| `yarn build:with-codegen` | `yarn codegen` then `yarn build` (needs Shopify env) |
| `yarn lint` | ESLint |
| `yarn lint-ts` / `yarn type-check` | `tsc --noEmit` |
| `yarn lint:css` | Stylelint (SCSS/CSS) |
| `yarn test` | Vitest (watch) |
| `yarn coverage` | Vitest with coverage (used in CI) |
| `yarn test:e2e` | Playwright |
| `yarn test:e2e:ui` | Playwright UI mode |
| `yarn test:a11y` | Playwright accessibility spec |
| `yarn knip` | Find unused files/dependencies |

### CI

On pull requests and pushes to `main` / `master`, [`.github/workflows/ci.yml`](.github/workflows/ci.yml) runs: install (`yarn install --frozen-lockfile`), ESLint, TypeScript, Stylelint, Vitest coverage, Shopify codegen (best-effort if secrets present), and a production `yarn build`. End-to-end tests are **not** enabled in that workflow by default (see commented steps in the file). A separate Codacy workflow may run on `main` / `develop` (`.github/workflows/codacy-analysis.yaml`).

---

## Architecture Rules

1. **Domains own business logic** — Actions, services, validation live inside `domains/<domain>/`.
2. **Infrastructure is technical plumbing only** — Shopify client, upload, email, http client, cache, rate limiting.
3. **No barrel exports** — Always import from concrete file paths to preserve server/client boundaries.
4. **Repositories return domain models** — Services orchestrate repositories and implement business rules.
5. **Validation lives per domain** — Each domain includes its own Zod schemas.
6. **React Server Components by default** — Client Components only where required.
7. **UI has zero business logic** — Components are strictly for presentation.
8. **No direct Printful API calls for fulfillment** — The Printful Shopify app handles fulfillment automatically. Printful Mockup Generator API is used only for preview generation.

---

## Security & Hardening Notes

- **Rate limiting identity**: The rate limiter derives client identity from `x-forwarded-for` / `x-real-ip` headers. When running behind a trusted proxy (e.g. Vercel), these headers are treated as authoritative. In stricter environments you may want to rely on the connection IP or a signed header from the proxy to avoid spoofing.
- **Content Security Policy**: The default `script-src` currently relies on `'unsafe-inline'` for certain inline scripts. For stronger XSS protection, prefer nonces or hashes for any inline scripts where supported by Next.js and third‑party libraries. If you keep `'unsafe-inline'`, treat it as an explicit trade‑off between compatibility and security and review regularly.

---

## Documentation

### Getting Started

- [Deployment Guide](./DEPLOYMENT.md) - Complete deployment procedures and environment setup
- [Environment Variables](./README.md#environment-variables) - Complete environment variable reference

### API & Integration

- [API Documentation](./docs/API.md) - API endpoints, authentication, and usage examples
- [Shopify 2026+ Authentication](./docs/SHOPIFY-2026-AUTH.md) - Shopify OAuth 2.0 setup guide
- [Shop configuration](./docs/SHOP_CONFIG.md) - `shop_config` Shopify metafield (AI, rate limits, pagination, cache defaults)
- [Printful Portrait Preview](./docs/PRINTFUL_PORTRAIT_PREVIEW.md) - Print-on-demand preview and fulfillment guide
- [Redis Setup](./docs/REDIS_SETUP.md) - Redis configuration for rate limiting

### Operations

- [Monitoring Guide](./docs/MONITORING.md) - Sentry setup, error tracking, and performance monitoring
- [Troubleshooting Guide](./docs/TROUBLESHOOTING.md) - Common issues and solutions
- [Runbook](./docs/RUNBOOK.md) - Operational procedures and emergency response
- [Rollback Procedures](./docs/ROLLBACK.md) - Step-by-step rollback guide
- [Cost cutting checklist](./docs/COST-CUTTING-TODO.md) - Spend and CI/tooling reduction ideas

### Quality & testing

- [Testing](./docs/TESTING.md) - Vitest, Playwright, and coverage conventions

### Architecture

- [Architecture Overview](./ARCHITECTURE.md) - Codebase structure, boundaries, and conventions (includes integration and ops context)
