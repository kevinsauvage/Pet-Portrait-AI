### 4. Per-variant Gelato product UIDs

- **What:** Remove hardcoded Gelato product UIDs; support per-variant mapping.
- **Where:** `src/domains/orders/services/gelato-fulfillment.service.ts`.
- **How:** Store Gelato product UIDs in Shopify variant metafields or line-item properties. Read from `lineItem.properties` or variant metafield; fall back to env vars if absent.

### 11. Pre-commit hooks

- **What:** Run lint and type-check before commits.
- **Where:** Root `.husky/`, `package.json`.
- **How:** Add Husky + lint-staged. Run `lint`, `type-check`, and optionally `test` on staged files.
