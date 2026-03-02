# Shopify 2026+ Authentication

As of January 1, 2026, Shopify no longer displays static API tokens in the Dev Dashboard. **All new apps must use Dev Dashboard** and OAuth 2.0 client credentials grant.

> **Note**: Admin-created custom apps (created in Shopify Admin) are deprecated. New apps must be created via [Dev Dashboard](https://dev.shopify.com/dashboard/).

## Admin API: Client Credentials Grant

The app uses the OAuth 2.0 **client credentials grant** to obtain Admin API access tokens.

### Setup

1. Create an app in the [Shopify Dev Dashboard](https://dev.shopify.com/dashboard/).
2. **Install the app on your store** (must be in the same organization):
   - In Dev Dashboard, select your app
   - Click "Install on store" or "Add store"
   - Select your store from the list
   - **This step is required** - OAuth will fail with "app_not_installed" error if skipped
3. Copy **Client ID** and **Client Secret** from Settings > API credentials.
4. Add to `.env.local`:

```env
SHOPIFY_CLIENT_ID=your_client_id
SHOPIFY_CLIENT_SECRET=your_client_secret
SHOPIFY_ADMIN_URL=https://your-store.myshopify.com/admin/api/2025-01/graphql.json
```

The shop domain is derived from `NEXT_PUBLIC_SHOPIFY_STOREFRONT_URL` or `SHOPIFY_ADMIN_URL`.

### How it works

- Tokens are requested from `https://{shop}.myshopify.com/admin/oauth/access_token`
- Tokens expire after 24 hours (86399 seconds)
- The app caches tokens and refreshes them 1 minute before expiry
- No code changes needed—`adminSdk()` and `adminClient` use the dynamic token automatically

### Differences from Admin-Created Custom Apps

**Dev Dashboard Apps (2026+)**:
- Created in Dev Dashboard
- Use OAuth 2.0 client credentials grant
- Tokens expire after 24 hours and auto-refresh
- Can be distributed to multiple stores

**Admin-Created Custom Apps (Legacy)**:
- Created in Shopify Admin
- Generate static tokens when installed
- Tokens don't expire
- Cannot rotate credentials (must delete/recreate app)
- Deprecated for new apps as of Jan 1, 2026

## Storefront API

The Storefront API requires a separate access token that must be set directly in your environment variables.

### Setup

1. Create a Storefront access token in Shopify:
   - **Option 1 (Dev Dashboard)**: Go to [Shopify Dev Dashboard](https://dev.shopify.com/dashboard/) > [Your app] > Settings > API credentials > Storefront API
   - **Option 2 (Shopify Admin)**: Go to Shopify Admin > Settings > Apps and sales channels > Develop apps > [Your app] > API credentials > Storefront API
2. Copy the Storefront access token
3. Add to `.env.local`:

```env
SHOPIFY_STORE_FRONT_ACCESS_TOKEN=your_storefront_token
```

The app uses this token directly for all Storefront API requests. No token derivation or caching is needed.

## Troubleshooting

### `shop_not_permitted` error

**Cause**: The app and store are not in the same organization.

**Fix**: Client credentials only works when the app is installed on a store you own. For multi-merchant apps, use [Shopify CLI](https://shopify.dev/docs/apps/build/cli-for-apps) and OAuth.

### "Invalid API key or access token"

**Cause**: Sending `client_id` or `client_secret` directly to the GraphQL API.

**Fix**: Exchange credentials for an `access_token` first. The app does this automatically via `getAdminAccessToken()`.

### "app_not_installed" error

**Cause**: The app is not installed on the store.

**Fix**: 
1. Go to [Shopify Dev Dashboard](https://dev.shopify.com/dashboard/)
2. Select your app
3. Click "Install on store" or "Add store"
4. Select your store
5. Ensure the app and store are in the same organization

**Note**: Client credentials grant only works when the app is installed on a store you own.
