import { generate } from '@graphql-codegen/cli';

import 'dotenv/config'; // should be at the very top

import configAdmin from '../codegen.admin';
import configStorefront from '../codegen.storefront';

const generateSchemas = async () => {
  try {
    const storefrontConfig = await configStorefront;
    await generate(storefrontConfig, true);
    console.info('✅ Storefront Codegen complete');

    const adminConfig = await configAdmin;
    await generate(adminConfig, true);
    console.info('✅ Admin Codegen complete');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (
      message.includes('Failed to load schema') &&
      message.includes('graphql.json')
    ) {
      console.error(
        '❌ Schema could not be loaded. Check SHOPIFY_CLIENT_ID, SHOPIFY_CLIENT_SECRET, SHOPIFY_ADMIN_URL, and NEXT_PUBLIC_SHOPIFY_STOREFRONT_URL. App must be installed on the store.',
      );
    }
    console.error('❌ Codegen failed', error);
    throw error;
  }
};

generateSchemas()
  .then(() => {
    console.info('✅ Codegen complete');
  })
  .catch((error) => {
    console.error('❌ Codegen failed', error);
  });
