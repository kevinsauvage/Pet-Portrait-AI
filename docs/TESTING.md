# Testing Guide

This document describes the testing strategy and how to run tests for this project.

## Test Types

### Unit Tests (Vitest)

Unit tests test individual functions and components in isolation.

**Location:** `src/**/*.test.ts`, `src/**/*.test.tsx`

**Run tests:**
```bash
yarn test              # Run in watch mode
yarn test run          # Run once
yarn coverage          # Run with coverage report
```

**Coverage Thresholds:**
- Lines: 80%
- Functions: 80%
- Branches: 75%
- Statements: 80%

### Integration Tests (Vitest)

Integration tests test API routes and service interactions.

**Location:** `src/app/api/**/*.test.ts`

**Coverage:**
- Cart API routes (`/api/cart`, `/api/cart/lines`, `/api/cart/discount-codes`, `/api/cart/buyer-identity`)
- AI generation API (`/api/ai/generate`)

### E2E Tests (Playwright)

End-to-end tests verify complete user flows in a real browser environment.

**Location:** `e2e/**/*.spec.ts`

**Run tests:**
```bash
yarn test:e2e          # Run E2E tests
yarn test:e2e:ui        # Run with Playwright UI
yarn test:e2e:headed    # Run in headed mode (see browser)
```

**Current E2E Tests:**
- Cart flow navigation
- API route responses
- Empty cart state

**TODO:** Add full flow test (create portrait → add to cart → checkout)

## Test Coverage

### Critical Domains (>80% coverage target)

1. **Cart Service** (`src/domains/cart/services/cart.service.ts`)
   - ✅ Cart creation and retrieval
   - ✅ Adding/updating/removing lines
   - ✅ Discount codes
   - ✅ Buyer identity updates

2. **API Routes** (`src/app/api/**`)
   - ✅ Cart routes
   - ✅ AI generation route
   - ⚠️ Search routes (needs tests)
   - ⚠️ Admin routes (needs tests)

3. **AI Services** (`src/domains/ai/services/**`)
   - ✅ Portrait generation validation
   - ⚠️ Full generation flow (needs integration tests)

## Running Tests in CI

Tests run automatically on:
- Pull requests
- Pushes to `main`/`master` branches

**CI Pipeline:**
1. Lint (ESLint, TypeScript, Stylelint)
2. Unit & Integration tests with coverage
3. Coverage report uploaded to Codecov (if token configured)

## Writing New Tests

### Unit Test Example

```typescript
import { describe, expect, it, vi } from 'vitest';
import { MyService } from './my-service';

describe('MyService', () => {
  it('should do something', () => {
    const result = MyService.doSomething();
    expect(result).toBeDefined();
  });
});
```

### API Route Test Example

```typescript
import type { NextRequest } from 'next/server';
import { GET } from './route';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/domains/my/service', () => ({
  MyService: {
    getData: vi.fn(),
  },
}));

describe('/api/my-route', () => {
  it('GET returns data successfully', async () => {
    const response = await GET();
    expect(response.status).toBe(200);
  });
});
```

### E2E Test Example

```typescript
import { expect, test } from '@playwright/test';

test('should navigate to page', async ({ page }) => {
  await page.goto('/my-page');
  await expect(page).toHaveURL(/\/my-page/);
});
```

## Test Data & Mocks

- **Shopify API:** Mocked using Vitest mocks
- **OpenAI API:** Mocked in tests (requires `AI_API_SECRET` for integration tests)
- **UploadThing:** Mocked in tests

## Debugging Tests

### Unit Tests
```bash
yarn test --reporter=verbose  # More detailed output
yarn test --ui                  # Open Vitest UI
```

### E2E Tests
```bash
yarn test:e2e:headed           # See browser
yarn test:e2e:ui               # Use Playwright UI
yarn test:e2e --debug          # Debug mode
```

## Coverage Reports

After running `yarn coverage`:
- Text report in terminal
- HTML report in `coverage/index.html`
- LCOV report in `coverage/lcov.info` (for CI)

## Best Practices

1. **Test critical paths first:** Cart, checkout, AI generation
2. **Test error handling:** Network errors, validation errors, API errors
3. **Keep tests isolated:** Each test should be independent
4. **Use descriptive test names:** `it('should return 404 when cart not found')`
5. **Mock external dependencies:** Shopify, OpenAI, UploadThing
6. **Test edge cases:** Empty states, invalid inputs, rate limits

## Future Improvements

- [ ] Add E2E test for full flow (create → cart → checkout)
- [ ] Add visual regression tests
- [ ] Add performance tests
- [ ] Add accessibility tests
- [ ] Increase coverage for search and admin routes
- [ ] Add tests for error boundaries
- [ ] Add tests for rate limiting
