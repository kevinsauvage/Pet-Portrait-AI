# ADR-001: Domain-Driven Design Architecture

## Status

Accepted

## Context

The codebase needed a clear structure to organize business logic, infrastructure concerns, and presentation logic. The application handles multiple domains (cart, products, AI generation, orders, etc.) and integrates with external services (Shopify, OpenAI, UploadThing).

## Decision

Adopt a Domain-Driven Design (DDD) architecture with clear separation between:

- **Domains** (`src/domains/`) - Business logic organized by domain
- **Infrastructure** (`src/infra/`) - Technical implementations (Shopify, upload, email, cache)
- **Core** (`src/core/`) - Shared utilities, config, errors, types
- **UI** (`src/ui/`) - Presentation components
- **App** (`src/app/`) - Next.js App Router (pages, API routes)

## Consequences

### Positive

- Clear separation of concerns
- Business logic is testable without framework dependencies
- Easy to understand domain boundaries
- Infrastructure can be swapped without changing domain logic
- Scales well as application grows

### Negative

- More files and directories to navigate
- Requires discipline to maintain boundaries
- Can be overkill for very small applications

## Implementation

Each domain follows a consistent structure:

```
domains/
  <domain-name>/
    actions/      # Server actions ("use server")
    services/     # Business logic (framework-agnostic)
    validation/   # Zod schemas
    models/       # Domain models (when needed)
    repositories/ # Data access (when needed)
    index.ts      # Public API
```

Infrastructure modules provide technical implementations:

```
infra/
  shopify/        # Shopify client (storefront + admin)
  upload/         # UploadThing integration
  email/          # Email sending
  cache/          # Caching layer
  rate-limit/     # Rate limiting
```

## Related ADRs

- ADR-002: No Barrel Exports
- ADR-003: React Server Components Default
