# Architecture

This document describes the `src/` layout after the domains + infra migration.

## Overview

- **domains/** — Domain logic (auth, user, address, cart, ai, collections, contact, home, legal, navigation, search, wishlist, orders, products). Domains use `actions/`, `services/`, `validation/`, `models/`, `repositories/`, `mappers/` when applicable.
- **infra/** — Infrastructure: Shopify client (storefront + admin), upload (Uploadthing), email, cache, http (API client), rate-limit. No business logic.
- **core/** — App-wide config, errors, types, and shared utils (api-responses, form-actions, cookie-security).
- **lib/** — Pure helpers and app infra: format, html, debounce, cn, consents, cookies (server actions), client (cookies, analytics).
- **ui/** — Presentational components, layouts, primitives, and shared app UI building blocks (auth shell/forms, shared sections).
- **app/** — Next.js App Router (pages, layouts, API routes).

---

## Directory layout

```
src/
├── app/                    # Next.js App Router
├── assets/
├── contexts/               # React contexts (Cart, User)
├── core/                   # Config, errors, types, utils
│   ├── config/
│   ├── errors/
│   ├── types/
│   └── utils/              # api-responses, form-actions, cookie-security
├── domains/                # Domain modules
│   ├── address/            # actions/, services/, validation/, index.ts
│   ├── ai/                  # actions/, services/, models/, repositories/, ai-portrait/, index.ts
│   ├── auth/
│   ├── cart/
│   ├── collections/         # services/
│   ├── contact/
│   ├── home/                # services/
│   ├── legal/               # services/
│   ├── navigation/          # services/
│   ├── orders/             # services/, models/, repositories/
│   ├── products/           # services/, models/, repositories/, mappers/
│   ├── search/
│   ├── user/
│   └── wishlist/           # client.ts, services/, index.ts
├── hooks/
├── infra/                  # Infrastructure
│   ├── shopify/            # storefront, admin, tokens, server (token + url helpers)
│   ├── upload/             # Uploadthing router & client
│   ├── email/
│   ├── cache/
│   ├── http/               # API client (api, apiClient)
│   └── rate-limit/         # checkRateLimit for AI
├── lib/                    # Helpers & app infra
│   ├── cookies/            # Server cookie actions (get/set/delete)
│   ├── client/             # Client cookies, analytics
│   ├── format/             # formatPrice
│   ├── html/               # stripHtmlToText
│   ├── debounce.ts
│   ├── cn.ts
│   └── consents.ts
├── types/                   # FormActionResult, globals.d.ts
├── ui/
└── proxy.ts                # Middleware (delegate token, cookies)
```

---

## Domains

Each domain has:

- **actions/** — Server actions (`"use server"`), re-exported from `index.ts` when present.
- **services/** — Business logic (no framework).
- **validation/** — Zod schemas (when applicable).
- **models/**, **repositories/**, **mappers/** — When the domain has data types, external access, or adapter logic.
- **index.ts** — Public API when the domain chooses to expose one.

Domains import from **infra** (e.g. `@/infra/shopify`), **core** (`@/core/config`, `@/core/utils`), **lib** (`@/lib/cookies`), and **types** — not from other domains when avoidable.

---

## Infra

- **infra/shopify** — Storefront + Admin SDK, token/URL helpers. Used by domains (address, user, auth, cart, wishlist, products, etc.) and app. Product mappers/repositories live in the products domain.
- **infra/upload** — Uploadthing (used by create flow).
- **infra/email** — Email sending (e.g. order confirmation).
- **infra/http** — Shared API client for client-side calls (wishlist, cart context, create wizard).
- **infra/rate-limit** — AI generation rate limiting.

---

## Core

- **core/config** — App config, routes, constants, seo, userFeedback.
- **core/errors** — AppError and domain errors.
- **core/types** — Result, PaginatedResult, Money.
- **core/utils** — api-responses, form-actions, cookie-security, metadata (getBaseUrl, generateMetadata), retry, extract-error-message.

---

## Lib

- **lib/cookies** — Server cookie actions (used by domains and logout).
- **lib/format** — formatPrice.
- **lib/cn** — classnames helper.
- **lib/debounce** — debounce.
- **lib/consents** — Cookie/consent helpers.
- **lib/client** — Client-side cookies/analytics.

---

## TSConfig paths

Explicit path mappings in `tsconfig.json`:

- `@/app/*`, `@/domains/*`, `@/infra/*`, `@/core/*`, `@/ui/*`, `@/lib/*`, `@/hooks/*`, `@/assets/*`
- `@/*` → `./src/*` (fallback for types, contexts, etc.)

---

## Conventions

1. Use `@/domains/...`, `@/infra/...`, `@/core/...`, `@/lib/...` for the new layout.
2. Server actions live in `domains/<name>/actions/` and are re-exported from the domain `index.ts`.
3. Shopify and other external services live under **infra**; domains depend on infra, not the reverse.
4. Shared response/error and form helpers live in **core/utils**; pure helpers (format, cn, debounce) in **lib**.
