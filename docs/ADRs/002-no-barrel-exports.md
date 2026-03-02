# ADR-002: No Barrel Exports

## Status

Accepted

## Context

Next.js has strict server/client boundaries. Barrel exports (index files that re-export everything) can cause issues with:
- Server/client component boundaries
- Code splitting
- Tree shaking
- Type checking

## Decision

Avoid barrel exports. Always import from concrete file paths:

```typescript
// ✅ Good
import { CartService } from '@/domains/cart/services/cart.service';
import { generatePetPortraitVariations } from '@/domains/ai/services';

// ❌ Bad
import { CartService, generatePetPortraitVariations } from '@/domains';
```

## Consequences

### Positive

- Clear server/client boundaries
- Better code splitting
- Improved tree shaking
- Better IDE autocomplete
- Easier to identify where code is used

### Negative

- Longer import paths
- More verbose imports
- Requires discipline to maintain

## Implementation

- No `index.ts` files that re-export everything
- Domains can have `index.ts` for their public API, but only re-export specific items
- Always use concrete file paths in imports

## Related ADRs

- ADR-001: Domain-Driven Design Architecture
