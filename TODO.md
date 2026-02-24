## High Priority

### 4. Per-variant Gelato product UIDs

- **What:** Remove hardcoded Gelato product UIDs; support per-variant mapping.
- **Where:** `src/domains/orders/services/gelato-fulfillment.service.ts`.
- **How:** Store Gelato product UIDs in Shopify variant metafields or line-item properties. Read from `lineItem.properties` or variant metafield; fall back to env vars if absent.

---

## Medium Priority

### 6. API documentation

- **What:** Document API routes, request/response schemas, and examples.
- **Where:** `docs/api/` or inline in `src/app/api/`.
- **How:** Add OpenAPI/Swagger spec or use Next.js route metadata. Document auth, rate limits, and error formats.

---

## Low Priority

### 10. Component documentation (Storybook)

- **What:** Document UI components, props, and usage.
- **Where:** `src/ui/`, `src/app/` components.
- **How:** Add Storybook. Create stories for shared components. Add visual regression tests.

### 11. Pre-commit hooks

- **What:** Run lint and type-check before commits.
- **Where:** Root `.husky/`, `package.json`.
- **How:** Add Husky + lint-staged. Run `lint`, `type-check`, and optionally `test` on staged files.

### 13. Cache strategy for expensive operations

- **What:** Reduce load from repeated expensive queries.
- **Where:** `src/infra/cache/`, Shopify/GraphQL calls, sitemap.
- **How:** Use existing cache infra. Add Redis for production. Set TTLs for product listings, sitemap, etc.

### 14. Input sanitization for user content

- **What:** Sanitize user-generated content before display or storage.
- **Where:** Form handlers, API routes, display components.
- **How:** Use DOMPurify or similar for HTML. Validate and escape text. Apply to AI prompts and any stored UGC.
