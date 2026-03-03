# Configuration Usage Analysis

## Issues Found: Not Using Shop Config

### ❌ Critical: Still using hardcoded values instead of shop config

1. **Search Service** (`src/domains/search/services/search.service.ts`)
   - Currently: `config.constants.pagination.productsPerPage`
   - Should use: `shopConfig.pagination.productsPerPage`

2. **Shopify Client** (`src/infra/shopify/client.ts`)
   - Currently: `config.constants.revalidate.shopify`
   - Should use: `shopConfig.cache.revalidate.shopify`
   - Note: This is tricky because `createStorefrontClient` is called at module level. May need refactoring.

3. **Cookie Banner** (`src/ui/components/consent/CookieBanner.tsx`)
   - Currently: `config.constants.cookieExpiryDays`
   - Should use: `shopConfig.cookies.expiryDays`
   - Note: Client component - needs server component wrapper or context

4. **Image Validation** (`src/domains/ai/ai-portrait/types.ts`, `validation.ts`, `validate-image.ts`)
   - Currently: `IMAGE_CONSTRAINTS` constant
   - Should use: `shopConfig.image.*`
   - Note: These are used in client-side validation (zod schema) and server-side validation

5. **Rate Limiting** (`src/app/api/ai/generate/route.ts`, `src/infra/upload/route-handler.ts`)
   - Currently: Hardcoded values in `checkRateLimit` calls
   - Should use: `shopConfig.rateLimit.*`

### ⚠️ Next.js Static Exports (Cannot Use Shop Config Directly)

These use `export const revalidate` which must be static:
- `src/app/shop/page.tsx` - `revalidate = 3600`
- `src/app/search/page.tsx` - `revalidate = 300`
- `src/app/shop/[collectionSlug]/page.tsx` - `revalidate = 3600`
- `src/app/shop/[collectionSlug]/[productSlug]/page.tsx` - `revalidate = 3600`
- `src/app/page.tsx` - `revalidate = 3600`
- `src/app/sitemap.tsx` - `revalidate = 3600`

**Solution**: Keep static exports but use shop config in data fetching functions where possible.

## Additional Configurable Values Found

### Potential Additions to Shop Config

1. **Request Size Limits** (`src/core/utils/request-size.ts`)
   - Currently hardcoded: `256KB` for AI, `10MB` for uploads
   - Could be configurable

2. **Predictive Search Cache** (`src/app/api/search/predictive/route.ts`)
   - Currently: `s-maxage=60, stale-while-revalidate=300`
   - Could be configurable

3. **Security.txt Cache** (`src/app/.well-known/security.txt/route.ts`)
   - Currently: `max-age=86400, stale-while-revalidate=604800`
   - Probably fine as-is (security standard)

## Recommendations

### High Priority (Business Logic)
1. ✅ Update search service to use shop config pagination - **COMPLETED**
2. ✅ Update rate limiting to use shop config - **COMPLETED**
3. ✅ Update image validation to use shop config - **COMPLETED** (server-side)
4. ✅ Update cookie expiry to use shop config - **COMPLETED**

### Medium Priority (Performance Tuning)
1. ✅ Shopify client cache - **COMPLETED** (fetches config in async fetch function)
2. ⚠️ Page-level revalidate - Next.js limitation, keep static (cannot be changed)

### Low Priority (Nice to Have)
1. Request size limits - could be configurable but less critical
2. Predictive search cache - could be configurable
3. Client-side image constraints - Currently uses `IMAGE_CONSTRAINTS` constant. Note added that it should match shop config. Could be improved by passing constraints as props from server components.

## Summary

All critical configurable values have been migrated to use shop config:
- ✅ Pagination (search service)
- ✅ Rate limiting (AI and upload endpoints)
- ✅ Image validation (server-side)
- ✅ Cookie expiry (via server wrapper component)
- ✅ Shopify client cache revalidation

**Remaining considerations:**
- Client-side image validation still uses `IMAGE_CONSTRAINTS` constant (documented to match shop config)
- Page-level `revalidate` exports remain static (Next.js limitation)
- `UploadIsland` component has hardcoded `maxSize: 8 * 1024 * 1024` (could be improved but less critical)
