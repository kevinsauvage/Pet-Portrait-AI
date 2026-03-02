# PetPortrait AI — Custom AI Pet Portrait Ecommerce

A fully automated ecommerce platform that generates and sells custom AI-created pet portraits. Built with **Next.js 16**, **Shopify Storefront & Admin GraphQL APIs**, **OpenAI** for image generation, and **Gelato** for print-on-demand fulfillment.

## Features

- **AI Pet Portrait Generator**
  Upload a pet photo, choose an art style (Pixar, Watercolor, Anime, Royal, Cyberpunk, Renaissance, Pop Art, Minimalist), and receive multiple portrait variations.

- **Shopify Integration**
  Storefront API for products, cart, and checkout.

- **Gelato Print-on-Demand**
  The Gelato Shopify app automatically fulfills physical orders (canvas, poster, apparel) using the `gelato_print_url` line item attribute. No backend fulfillment code required.

- **Modern UI**
  Tailwind CSS v4, Radix UI components, lucide-react icons, dark/light mode.

- **Type-Safe Architecture**
  GraphQL Codegen, Zod validation, strict TypeScript everywhere.

---

## Architecture Overview

```txt
src/
  app/                    # Next.js App Router (pages, layouts, API routes)

  domains/                # Domain logic (actions, services, validation)
    address/              # actions/, services/, validation/
    auth/                 # actions/, services/, validation/
    user/                 # get-user, actions/, services/, validation/
    cart/                 # actions/, services/, mocks/
    ai/                   # actions/, ai-portrait/, repositories/, services/
    contact/              # actions/, validation/
    search/               # actions/
    wishlist/             # client.ts, services/
    orders/               # services/, models/, repositories/
    products/             # services/, models/, repositories/

  infra/                  # Infrastructure (Shopify, upload, email, cache, http, rate-limit)
    shopify/              # client, storefront, admin, helpers, images, tokens
    upload/               # UploadThing router & client
    email/
    cache/
    http/                 # API client (api-client.ts)
    rate-limit/

  core/                   # Config, errors, types, shared utils
  lib/                    # Pure helpers & app infra
  ui/                     # Components, layouts, primitives
  types/                  # FormActionResult, globals.d.ts
  hooks/
  contexts/
```

---

## Data Flow

```
1. User uploads photo      → UploadThing CDN
2. User selects art style  → Frontend only
3. AI generates variants   → OpenAI Images API
4. User selects final art  → Stored on CDN (public, permanent)
5. User picks product      → Shopify Storefront API (products synced by Gelato app)
6. Add to cart             → Shopify cart with gelato_print_url attribute
7. Checkout & order        → Normal Shopify checkout
8. Fulfillment             → Gelato Shopify app reads gelato_print_url, prints & ships
```

See [GELATO_SHOPIFY_INTEGRATION.md](./GELATO_SHOPIFY_INTEGRATION.md) for the full Gelato integration guide.

---

## Tech Stack

| Category   | Technology                                    |
| ---------- | --------------------------------------------- |
| Framework  | Next.js 16, React 19, TypeScript 5            |
| Styling    | Tailwind CSS v4, Radix UI, lucide-react       |
| APIs       | Shopify Storefront GraphQL, Shopify Admin API  |
| AI         | OpenAI API                                     |
| Fulfillment| Gelato Shopify App (automatic)                 |
| Validation | Zod v4                                         |
| GraphQL    | graphql-request, GraphQL Codegen               |
| Uploads    | UploadThing                                    |
| Email      | Nodemailer                                     |
| Monitoring | Sentry                                         |

---

## Getting Started

### Prerequisites

- Node.js 20+
- Yarn or npm
- Shopify store (+ custom app credentials)
- OpenAI API key
- UploadThing account
- Gelato account with Shopify app installed

### Installation

```bash
git clone <repository-url>
cd nextjs-strapi-ecommerce
yarn install
```

### Environment Variables

#### Quick Setup

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Then fill in your values. The application will validate required variables on startup and show clear error messages if anything is missing.

#### Environment Setup Checklist

##### ✅ Required (All Environments)

These variables are required for the application to function:

- **`NEXT_PUBLIC_BASE_URL`** - Your site's base URL (e.g., `https://yourdomain.com`)
- **`NEXT_PUBLIC_SHOPIFY_STOREFRONT_URL`** - Shopify Storefront API GraphQL endpoint
- **`SHOPIFY_STORE_FRONT_ACCESS_TOKEN`** - Shopify Storefront API access token
- **`SHOPIFY_CLIENT_ID`** - Shopify OAuth 2.0 client ID (from Dev Dashboard)
- **`SHOPIFY_CLIENT_SECRET`** - Shopify OAuth 2.0 client secret (from Dev Dashboard)
- **`SHOPIFY_ADMIN_URL`** - Shopify Admin API GraphQL endpoint
- **`OPENAI_API_KEY`** - OpenAI API key for AI portrait generation
- **`UPLOADTHING_TOKEN`** - UploadThing API token
- **`UPLOADTHING_SECRET`** - UploadThing API secret

##### 🔒 Required in Production

These are required when `NODE_ENV=production`:

- **Admin Authentication** (choose one):
  - `ADMIN_BASIC_USER` + `ADMIN_BASIC_PASSWORD` - HTTP Basic auth for `/admin` routes
  - OR `ADMIN_SECRET` - Bearer token for API access

##### ⚠️ Recommended for Production

These are recommended for production deployments:

- **`NEXT_PUBLIC_SENTRY_DSN`** - Sentry DSN for error monitoring
- **`SENTRY_ORG`** - Sentry organization name
- **`SENTRY_PROJECT`** - Sentry project name
- **`RATE_LIMIT_REDIS_URL`** - Redis URL for distributed rate limiting
- **`RATE_LIMIT_REDIS_TOKEN`** - Redis token for rate limiting

##### 🔐 Optional Security

- **`AI_API_SECRET`** - Protects `/api/ai/generate` endpoint
- **`UPLOADTHING_API_SECRET`** - Protects `/api/uploadthing` endpoint
- **`CRON_SECRET`** - Secret for cron job authentication

##### 📊 Optional Features

- **`NEXT_PUBLIC_GTM_ID`** - Google Tag Manager container ID
- **`NEXT_PUBLIC_SITE_NAME`** - Site name (for SEO)
- **`NEXT_PUBLIC_SITE_EMAIL`** - Contact email
- **`NEXT_PUBLIC_SITE_PHONE`** - Contact phone
- **`NEXT_PUBLIC_SITE_LOGO`** - Logo URL
- **`NEXT_PUBLIC_SITE_LOGO_SQUARE`** - Square logo URL
- Social media links (`NEXT_PUBLIC_SITE_FACEBOOK`, `NEXT_PUBLIC_SITE_INSTAGRAM`, etc.)
- AI product variant IDs (`NEXT_PUBLIC_AI_DIGITAL_VARIANT_ID`, etc.)

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
- Admin auth optional (defaults to allowing access)

**Staging:**
- All required variables
- Recommended variables (Sentry, Redis) for testing
- Admin auth recommended

**Production:**
- All required variables
- All production-required variables (admin auth)
- All recommended variables (Sentry, Redis)
- Optional variables as needed

See `.env.example` for detailed descriptions of each variable.

### Development Commands

```bash
yarn dev          # Start development server
yarn codegen      # Generate GraphQL types
yarn build        # Production build
yarn type-check   # TypeScript validation
yarn lint         # ESLint
```

---

## Architecture Rules

1. **Domains own business logic** — Actions, services, validation live inside `domains/<domain>/`.
2. **Infrastructure is technical plumbing only** — Shopify client, upload, email, http client, cache, rate limiting.
3. **No barrel exports** — Always import from concrete file paths to preserve server/client boundaries.
4. **Repositories return domain models** — Services orchestrate repositories and implement business rules.
5. **Validation lives per domain** — Each domain includes its own Zod schemas.
6. **React Server Components by default** — Client Components only where required.
7. **UI has zero business logic** — Components are strictly for presentation.
8. **No direct Gelato API calls** — The Gelato Shopify app handles fulfillment automatically.
