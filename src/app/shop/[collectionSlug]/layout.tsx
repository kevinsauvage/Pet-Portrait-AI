import { storefrontSdk } from '@/infra/shopify/client';
import type { GetMenuByHandleQuery } from '@/infra/shopify/storefront';
import Breadcrumbs from '@/ui/components/Breadcrumbs';
import PageBanner from '@/ui/components/PageBanner';

import CollectionNav from '../_components/CollectionNav';

const findRecursiveMenuItem = (
  items: GetMenuByHandleQuery['menu'] | null | undefined,
  collectionSlug: string,
) => {
  if (!items?.items) return false;

  for (const item of items.items) {
    if (
      typeof item?.url === 'string' &&
      item.url.toLowerCase().includes(collectionSlug.toLowerCase())
    ) {
      return true;
    } else if (item?.items?.length) {
      const foundItem = findRecursiveMenuItem(
        { items: item.items } as GetMenuByHandleQuery['menu'],
        collectionSlug,
      );
      if (foundItem) {
        return true;
      }
    }
  }
  return false;
};

const Layout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ collectionSlug: string }>;
}) => {
  const { collectionSlug } = await params;

  const [responseMenu, response] = await Promise.all([
    storefrontSdk().getMenuByHandle({ handle: `main-menu` }),
    storefrontSdk().collection({
      first: 1,
      handle: collectionSlug,
      identifiers: [],
    }),
  ]);

  const { title, description } = response.collection || {};

  const findNavItems = () => {
    if (!responseMenu?.menu?.items) return [];

    const foundItem = responseMenu.menu.items.find((item) => {
      if (typeof item?.url === 'string') {
        return findRecursiveMenuItem(
          { items: item.items || [] } as GetMenuByHandleQuery['menu'],
          collectionSlug,
        );
      }
      return false;
    });

    return foundItem?.items || [];
  };

  return (
    <div>
      <PageBanner title={title || 'Collection'} description={description}>
        <Breadcrumbs />
        <CollectionNav
          collectionSlug={collectionSlug}
          items={{ items: findNavItems() } as GetMenuByHandleQuery['menu']}
        />
      </PageBanner>
      <div className="container mx-auto px-4">{children}</div>
    </div>
  );
};

export default Layout;
