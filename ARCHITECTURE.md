# Architecture

This document describes the `src/` layout after the domains + infra migration.

## Overview

- **domains/** — Domain logic (auth, user, address, cart, ai, collections, contact, home, legal, navigation, search, wishlist, orders, products). Each domain is mostly **flat**: `actions.ts`, `validation.ts`, and `*.service.ts` files at the root; use subfolders only when there are several concerns (e.g. `products/services`, `ai/ai-portrait`).
- **infra/** — Infrastructure: Shopify client (storefront + admin), upload (Uploadthing), email, cache, http (API client), rate-limit. No business logic.
- **core/** — App-wide config, errors, and shared utils (api-responses, form-actions incl. `FormActionResult`, cookie-security).
- **lib/** — Pure helpers and app infra: format, html, debounce, cn, consents, cookies (server actions), client (cookies, analytics), TanStack Query client setup (`query-client.ts`).
- **ui/** — Presentational components, layouts, primitives, and shared app UI building blocks (auth shell/forms, shared sections).
- **app/** — Next.js App Router (pages, layouts, API routes).

---

## Directory layout

```
src/
├── app/                    # Next.js App Router
├── assets/
├── contexts/               # React contexts (Cart, User)
├── core/                   # Config, errors, utils
│   ├── config/
│   ├── errors/
│   └── utils/              # api-responses, form-actions, cookie-security
├── domains/                # Domain modules (flat by default)
│   ├── address/            # actions.ts, types.ts, address.service.ts, address-utils.ts, validation.ts
│   ├── ai/                 # actions.ts, *.service.ts, validation.ts, ai-portrait/
│   ├── auth/               # actions.ts, auth.service.ts, validation.ts
│   ├── cart/               # actions.ts, types.ts, cart.service.ts, cart-pagination.ts, cart-buyer-identity.ts, mocks/
│   ├── collections/        # collections.service.ts, sort-options.ts
│   ├── contact/            # actions.ts, validation.ts
│   ├── create-flow/        # create-flow.service.ts
│   ├── creations/          # creations.service.ts, types.ts
│   ├── home/               # home.service.ts
│   ├── legal/              # policies.service.ts
│   ├── navigation/         # menu.service.ts
│   ├── orders/             # customer-orders.service.ts
│   ├── printful/           # preview.service.ts, types.ts, utils.ts, validation.ts
│   ├── products/           # services/, mappers/, repositories/, images.ts, inventory.ts, validation.ts
│   ├── search/             # actions.ts, types.ts, search.service.ts, sort-options.ts
│   ├── shop/               # get-shop-config.service.ts
│   ├── user/               # actions.ts, user.service.ts, get-user.ts, validation.ts
│   └── wishlist/           # wishlist.service.ts, types.ts, client.ts, validation.ts
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
├── types/                   # globals.d.ts, images.d.ts
└── ui/
```

---

## Domains

Conventions:

- **`actions.ts`** — Server actions (`"use server"`) when the domain exposes them.
- **`validation.ts`** — Zod schemas (when applicable).
- **`*.service.ts`** — Business logic (no framework); tests as `*.service.test.ts` alongside.
- **`types.ts`** — Shared domain types/interfaces (alongside services when they grow beyond one-off literals).
- **Subfolders** — Only when needed: e.g. **`products/services`** (multiple services), **`ai/ai-portrait`** (`types.ts`, create-flow utils), **`cart/mocks`**.

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
- **core/utils** — api-responses, form-actions (incl. `FormActionResult`), cookie-security, metadata (getBaseUrl, generateMetadata), retry, extract-error-message.
