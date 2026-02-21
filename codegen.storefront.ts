import { getCodegenStorefrontToken } from './src/modules/shopify/tokens/codegen-token';

import type { CodegenConfig } from '@graphql-codegen/cli';

function getStorefrontSchemaUrl(): string {
  const url = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_URL;
  if (!url) {
    throw new Error(
      'Missing NEXT_PUBLIC_SHOPIFY_STOREFRONT_URL. ' +
        'Set it to your Storefront API endpoint (e.g., https://your-store.myshopify.com/api/2025-01/graphql.json)',
    );
  }
  return url;
}

async function createStorefrontCodegenConfig(): Promise<CodegenConfig> {
  const storefrontSchemaUrl = getStorefrontSchemaUrl();
  const accessToken = await getCodegenStorefrontToken();
  return {
    documents: 'src/modules/shopify/storefront/**/*.graphql',
    generates: {
      'src/modules/shopify/storefront/index.ts': {
        config: {
          scalars: {
            Color: 'string',
            DateTime: 'string',
            Decimal: 'string',
            HTML: 'string',
            ISO8601DateTime: 'string',
            JSON: 'any',
            URL: 'string',
            UnsignedInt64: 'string',
          },
        },
        plugins: ['typescript', 'typescript-operations', 'typescript-graphql-request'],
      },
    },
    hooks: { afterAllFileWrite: ['prettier --write'] },
    schema: {
      [storefrontSchemaUrl]: {
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': accessToken,
        },
      },
    },
  };
}

export default createStorefrontCodegenConfig();
