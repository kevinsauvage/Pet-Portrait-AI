# ADR-004: Shopify OAuth 2.0 Client Credentials Grant

## Status

Accepted

## Context

As of January 1, 2026, Shopify deprecated Admin-created custom apps. All new apps must use the Dev Dashboard and OAuth 2.0 client credentials grant for Admin API access.

## Decision

Use OAuth 2.0 client credentials grant for Shopify Admin API authentication:

- Tokens expire after 24 hours
- Tokens are automatically refreshed 1 minute before expiry
- No manual token management required
- Works with Dev Dashboard apps only

## Consequences

### Positive

- More secure (tokens expire)
- Automatic token refresh
- No manual token management
- Future-proof (required for new apps)

### Negative

- Tokens expire (requires refresh logic)
- More complex than static tokens
- Requires app installation on store

## Implementation

```typescript
// Automatic token management
const adminClient = adminSdk();
// Token is fetched/refreshed automatically
```

Environment variables:
- `SHOPIFY_CLIENT_ID` - OAuth client ID
- `SHOPIFY_CLIENT_SECRET` - OAuth client secret
- `SHOPIFY_ADMIN_URL` - Admin API endpoint

## Related Documentation

- [Shopify 2026+ Authentication](./SHOPIFY-2026-AUTH.md)
