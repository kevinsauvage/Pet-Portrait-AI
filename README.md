# PetPortrait AI — Custom AI Pet Portrait Ecommerce

A fully automated ecommerce platform that sells AI-generated pet portrait products, built with **Next.js 16**, **Shopify Storefront GraphQL API**, and **OpenAI** image generation.

## Features

- **AI Pet Portrait Generator** — Upload a photo, choose an art style (Pixar, Watercolor, Anime, Royal, Cyberpunk, Renaissance, Pop Art, Minimalist), and get AI-generated portrait variations
- **Shopify Integration** — Products, checkout, and order management via Shopify Storefront & Admin APIs
- **Dynamic Product Creation** — Auto-generate titles, descriptions, tags, and pricing for AI-generated products
- **Order Tracking** — Track order status and fulfillment with email notifications
- **Modern UI** — Tailwind CSS v4 + Radix UI + lucide-react with dark/light mode support
- **Type-Safe** — Full TypeScript with GraphQL Codegen and Zod validation

## Architecture

```
src/
  app/                    # Next.js routes and API endpoints
  core/                   # Shared config, errors, types, utilities
    config/
    errors/
    types/
    utils/
  modules/                # Domain modules (isolated, modular)
    shopify/              # Shopify API, services, repositories, mappers
    products/             # Product domain models and services
    orders/               # Order domain models and tracking
    ai/                   # AI generation services and models
  ui/                     # UI layer (components, layouts, primitives)
    components/
    layouts/
    primitives/
    lib/
  lib/                    # Infrastructure (db, email, cache)
    db/
    email/
    cache/
  components/             # Shared React components
  shopify/                # GraphQL queries, mutations, codegen output
```

## Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | Next.js 16, React 19, TypeScript 5 |
| Styling | Tailwind CSS v4, Radix UI, lucide-react |
| API | Shopify Storefront GraphQL, Shopify Admin API |
| AI | OpenAI API |
| Validation | Zod v4 |
| GraphQL | graphql-request, graphql-codegen |
| File Upload | UploadThing |
| Email | Nodemailer |
| Monitoring | Sentry |

## Getting Started

### Prerequisites

- Node.js 20+
- Yarn or npm
- Shopify store with custom app credentials
- OpenAI API key (for portrait generation)
- UploadThing account (for image uploads)

### Installation

```bash
git clone <repository-url>
cd nextjs-strapi-ecommerce
yarn install
```

### Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required variables:
- `NEXT_PUBLIC_SHOPIFY_STOREFRONT_URL` — Shopify Storefront API endpoint
- `SHOPIFY_CLIENT_ID` / `SHOPIFY_CLIENT_SECRET` — OAuth 2.0 credentials
- `SHOPIFY_ADMIN_URL` — Shopify Admin API endpoint
- `OPENAI_API_KEY` — OpenAI API key for AI generation
- `UPLOADTHING_TOKEN` / `UPLOADTHING_SECRET` — UploadThing credentials

### Development

```bash
yarn dev          # Start development server
yarn codegen      # Generate GraphQL types
yarn build        # Production build
yarn type-check   # TypeScript validation
yarn lint         # ESLint
```

## Architecture Rules

1. **Modules are isolated** — Each module owns its models, repositories, services, and mappers
2. **Repositories** return domain models, never raw API data
3. **Services** implement business logic, orchestrating repositories
4. **Models** are defined with Zod schemas
5. **React Server Components** by default; Client Components only for interactivity
6. **Server Actions** for product creation, checkout, image upload
7. **No business logic in components** — components are pure presentation

## License

MIT
