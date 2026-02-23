import config from '@/core/config';
import { storefrontSdk } from '@/infra/shopify/client';
import type { GetMenuByHandleQuery } from '@/infra/shopify/storefront';

type MenuResult = {
  headerMenu: GetMenuByHandleQuery['menu'] | null;
  footerMenu: GetMenuByHandleQuery['menu'] | null;
};

export async function getSiteMenus(): Promise<MenuResult> {
  const [header, footer] = await Promise.all([
    storefrontSdk().getMenuByHandle({ handle: config.constants.menuHandles.main }),
    storefrontSdk().getMenuByHandle({ handle: config.constants.menuHandles.footer }),
  ]);

  return {
    headerMenu: header?.menu ?? null,
    footerMenu: footer?.menu ?? null,
  };
}
