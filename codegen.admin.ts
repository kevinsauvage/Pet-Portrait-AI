import { getCodegenToken } from './src/modules/shopify/tokens/codegen-token';

import type { CodegenConfig } from '@graphql-codegen/cli';

const getAdminSchemaUrl = (): string => {
  const url = process.env.SHOPIFY_ADMIN_URL;

  if (!url) {
    throw new Error(
      'Missing SHOPIFY_ADMIN_URL environment variable. ' +
        'Set it to your Shopify Admin API endpoint (e.g., https://your-store.myshopify.com/admin/api/2025-01/graphql.json)',
    );
  }

  return url;
};

/**
 * Generate Admin API token for codegen using OAuth 2.0 client credentials.
 * This runs at build time for schema introspection.
 */
async function createCodegenConfig(): Promise<CodegenConfig> {
  const adminSchemaUrl = getAdminSchemaUrl();
  const adminToken = await getCodegenToken();

  return {
    config: {
      fragmentMasking: false,
      gqlTagName: 'gql',
    },
    documents: 'src/modules/shopify/admin/**/*.graphql',
    generates: {
      'src/modules/shopify/admin/index.ts': {
        plugins: ['typescript', 'typescript-operations', 'typescript-graphql-request'],
        config: {
          scalars: {
            ARN: 'string',
            BigInt: 'string',
            Color: 'string',
            Date: 'string',
            DateTime: 'string',
            Decimal: 'string',
            FormattedString: 'string',
            HTML: 'string',
            JSON: 'any',
            Money: 'string',
            StorefrontID: 'string',
            URL: 'string',
            UnsignedInt64: 'string',
            UtcOffset: 'string',
          },
        },
      },
    },
    overwrite: true,
    schema: {
      [adminSchemaUrl]: {
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': adminToken,
        },
      },
    },
  };
}

// GraphQL Codegen supports async configs via Promise
export default createCodegenConfig();
