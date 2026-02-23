# PetPortrait AI — Custom AI Pet Portrait Ecommerce

A fully automated ecommerce platform that generates and sells custom AI-created pet portraits. Built with **Next.js 16**, **Shopify Storefront & Admin GraphQL APIs**, and **OpenAI** for image generation.

## ✨ Features

- **AI Pet Portrait Generator**
  Upload a pet photo → choose an art style (Pixar, Watercolor, Anime, Royal, Cyberpunk, Renaissance, Pop Art, Minimalist) → receive multiple portrait variations.

- **Shopify Integration**
  Storefront API for products & checkout, Admin API for dynamic product creation and order sync.

- **Automated Product Creation**
  Automatically generates:
  - product titles & descriptions
  - tags
  - pricing
  - AI-created product images

- **Order Tracking & Email Updates**
  Background tasks + webhook synchronization + email notifications.

- **Modern UI**
  Tailwind CSS v4, Radix UI components, lucide-react icons, dark/light mode.

- **Type-Safe Architecture**
  GraphQL Codegen, Zod validation, strict TypeScript everywhere.

---

## 🏛️ Architecture Overview

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
    config/
    errors/
    types/
    utils/                # api-responses, form-actions, cookie-security

  lib/                    # Pure helpers & app infra
    cookies/              # Server cookie actions (actions.ts)
    format/               # formatPrice
    client/               # Client cookies, analytics
    server/               # metadata (getBaseUrl, generateMetadata)
    cn.ts, debounce.ts, consents.ts, …

  ui/                     # Components, layouts, primitives
  types/                  # FormActionResult, globals.d.ts
  hooks/
  contexts/
```

Imports use **direct paths** (e.g. `@/domains/user/get-user`, `@/infra/shopify/client`) to keep server/client boundaries clear (no barrel exports).

---

## Tech Stack

| Category   | Technology                          |
| ---------- | ----------------------------------- |
| Framework  | Next.js 16, React 19, TypeScript 5  |
| Styling   | Tailwind CSS v4, Radix UI, lucide-react |
| APIs      | Shopify Storefront GraphQL, Shopify Admin API |
| AI        | OpenAI API                          |
| Validation| Zod v4                              |
| GraphQL   | graphql-request, GraphQL Codegen    |
| Uploads   | UploadThing                          |
| Email     | Nodemailer                          |
| Monitoring| Sentry                              |

---

## Getting Started

### Prerequisites

- Node.js 20+
- Yarn or npm
- Shopify store (+ custom app credentials)
- OpenAI API key
- UploadThing account

### Installation

```bash
git clone <repository-url>
cd nextjs-strapi-ecommerce
yarn install
```

### Environment Variables

Copy `.env.example`:

```bash
cp .env.example .env
```

**Required:** `NEXT_PUBLIC_SHOPIFY_STOREFRONT_URL`, `SHOPIFY_CLIENT_ID`, `SHOPIFY_CLIENT_SECRET`, `SHOPIFY_ADMIN_URL`, `OPENAI_API_KEY`, `UPLOADTHING_TOKEN`, `UPLOADTHING_SECRET`.

**Admin protection (required in production):**

- Set `ADMIN_BASIC_USER` and `ADMIN_BASIC_PASSWORD` to protect `/admin` and `/api/admin/*` with HTTP Basic auth.
- Or set `ADMIN_SECRET` and send `Authorization: Bearer <token>` for admin access.

**Expensive endpoint protection (optional):**

- `AI_API_SECRET` protects `/api/ai/generate`.
- `UPLOADTHING_API_SECRET` protects `/api/uploadthing`.
- Browser flows receive a signed session cookie from the middleware when visiting `/create` (no header needed).
- Server-to-server calls can send `Authorization: Bearer <token>` or `x-api-key`.

**Internal fulfillment protection (recommended in production):**

- Set `FULFILLMENT_API_SECRET` to protect `/api/fulfillment/gelato`.
- `/api/webhooks/shopify/orders` will send it automatically via `Authorization: Bearer <token>`.

For detailed AI portrait setup (Shopify products, Gelato POD, webhooks), see [README-AI-PET-PORTRAIT.md](./README-AI-PET-PORTRAIT.md).

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
6. **React Server Components by default** — Client Components only where required (e.g. wishlist/client, uploads).
7. **UI has zero business logic** — Components are strictly for presentation.
