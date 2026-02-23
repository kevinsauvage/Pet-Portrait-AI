import { storefrontSdk } from '@/infra/shopify/client';
import { getMenuItemsForCollection } from '@/infra/shopify/helpers';
import type { GetMenuByHandleQuery } from '@/infra/shopify/storefront';
import Breadcrumbs from '@/ui/components/Breadcrumbs';
import PageBanner from '@/ui/components/PageBanner';

import CollectionNav from '../../../ui/components/CollectionNav';

const Layout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { collectionSlug: string };
}) => {
  const { collectionSlug } = params;

  const [responseMenu, response] = await Promise.all([
    storefrontSdk().getMenuByHandle({ handle: `main-menu` }),
    storefrontSdk().collection({
      first: 1,
      handle: collectionSlug,
      identifiers: [],
    }),
  ]);

  const { title, description } = response.collection || {};
  const navItems = getMenuItemsForCollection(responseMenu?.menu, collectionSlug);

  return (
    <div>
      <PageBanner title={title || 'Collection'} description={description}>
        <div className="space-y-6">
          <Breadcrumbs />
          <CollectionNav
            collectionSlug={collectionSlug}
            items={{ items: navItems } as GetMenuByHandleQuery['menu']}
          />
        </div>
      </PageBanner>
      {children}
    </div>
  );
};

export default Layout;
