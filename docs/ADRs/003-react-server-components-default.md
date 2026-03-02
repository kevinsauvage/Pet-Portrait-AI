# ADR-003: React Server Components by Default

## Status

Accepted

## Context

Next.js 13+ App Router uses React Server Components (RSC) by default. Server Components:
- Run only on the server
- Don't send JavaScript to the client
- Can directly access server-side resources
- Reduce bundle size

## Decision

Use React Server Components by default. Only use Client Components (`"use client"`) when necessary:

- Interactivity (onClick, onChange, etc.)
- Browser APIs (localStorage, window, etc.)
- React hooks (useState, useEffect, etc.)
- Third-party libraries that require client-side

## Consequences

### Positive

- Smaller JavaScript bundles
- Better performance
- Direct access to server resources
- Improved SEO
- Reduced client-side complexity

### Negative

- Learning curve for RSC patterns
- Some libraries don't support RSC
- Need to be careful with client/server boundaries

## Implementation

```typescript
// ✅ Server Component (default)
export default function ProductPage() {
  const product = await getProduct(); // Can use async/await
  return <ProductDetails product={product} />;
}

// ✅ Client Component (when needed)
'use client';

export function AddToCartButton() {
  const [loading, setLoading] = useState(false);
  // ...
}
```

## Related ADRs

- ADR-001: Domain-Driven Design Architecture
- ADR-002: No Barrel Exports
