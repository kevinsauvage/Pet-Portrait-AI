# Configuration Analysis: What Should Be in Shopify Config

## Analysis of `src/core/config/index.ts`

### ✅ SHOULD be moved to Shopify config (business/configurable values)

#### 1. **Pagination**
- `constants.pagination.productsPerPage` (default: 16)
  - **Why**: Business decision - number of products per page
  - **Used in**: Search service
  - **Configurable**: Yes, merchants may want different page sizes

#### 2. **Cache Revalidation Times**
- `constants.revalidate.catalog` (default: 3600 seconds = 1 hour)
- `constants.revalidate.search` (default: 300 seconds = 5 minutes)
- `constants.revalidate.product` (default: 3600 seconds = 1 hour)
- `constants.revalidate.shopify` (default: 600 seconds = 10 minutes)
  - **Why**: Performance tuning - cache refresh rates
  - **Used in**: Shopify client, various pages
  - **Configurable**: Yes, merchants may want different cache strategies

#### 3. **Cookie Expiry**
- `constants.cookieExpiryDays` (default: 182 days = ~6 months)
  - **Why**: Privacy/compliance - cookie retention period
  - **Used in**: Cookie banner
  - **Configurable**: Yes, for GDPR/compliance needs

### ❌ Should NOT be moved (code-level constants)

#### Routes
- All `routes.*` values
- **Why**: Application routing structure, shouldn't change

#### Cookie Names
- All `cookies.*` values
- **Why**: Code-level identifiers, changing breaks existing cookies

#### Local Storage Keys
- All `localStorageKeys.*` values
- **Why**: Code-level identifiers

#### Menu Handles
- `constants.menuHandles.main` and `constants.menuHandles.footer`
- **Why**: Shopify menu handles, shouldn't change

#### Development Domain
- `constants.domains.localhost`
- **Why**: Development-only setting

#### Token Expiry
- `constants.delegateTokenExpirySeconds`
- **Why**: Internal technical setting, not business config

## Recommended Shopify Config Addition

Add these sections to `shop_config`:

```json
{
  "pagination": {
    "productsPerPage": 16
  },
  "cache": {
    "revalidate": {
      "catalog": 3600,
      "search": 300,
      "product": 3600,
      "shopify": 600
    }
  },
  "cookies": {
    "expiryDays": 182
  }
}
```
