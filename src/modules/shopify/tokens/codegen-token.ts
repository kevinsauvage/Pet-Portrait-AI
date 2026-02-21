/**
 * Build-time token helpers for GraphQL codegen.
 * Re-exports runtime token functions — caching is harmless at build time.
 */

export { getAdminAccessToken as getCodegenToken } from './admin-token';
export { getStorefrontAccessToken as getCodegenStorefrontToken } from './storefront-token';
