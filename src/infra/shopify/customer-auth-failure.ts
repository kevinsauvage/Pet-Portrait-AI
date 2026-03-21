import { ClientError } from 'graphql-request';

const SHOPIFY_FETCH_UNAUTHORIZED_PREFIX = 'Shopify fetch failed: 401';

function graphqlExtensionCodes(error: ClientError): string[] {
  const { errors } = error.response;
  if (!Array.isArray(errors)) return [];
  return errors.flatMap((entry) => {
    if (!entry || typeof entry !== 'object') return [];
    const ext = (entry as { extensions?: { code?: unknown } }).extensions;
    if (!ext || typeof ext !== 'object') return [];
    const { code } = ext;
    return typeof code === 'string' ? [code] : [];
  });
}

/**
 * True when the Storefront request failed due to an invalid/expired customer token or auth.
 * Uses graphql-request {@link ClientError} status and GraphQL `extensions.code`, not API message text.
 */
export function isShopifyCustomerAuthFailure(error: unknown): boolean {
  if (error instanceof ClientError) {
    if (error.response.status === 401) return true;
    const codes = graphqlExtensionCodes(error);
    if (
      codes.some((c) =>
        ['UNAUTHENTICATED', 'ACCESS_DENIED', 'FORBIDDEN'].includes(c),
      )
    ) {
      return true;
    }
  }

  if (error instanceof Error && error.message.startsWith(SHOPIFY_FETCH_UNAUTHORIZED_PREFIX)) {
    return true;
  }

  return false;
}
