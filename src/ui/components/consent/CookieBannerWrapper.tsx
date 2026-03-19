import { getShopConfig } from '@/domains/shop/get-shop-config.service';

import CookieBanner from './CookieBanner';

export default async function CookieBannerWrapper() {
  const shopConfig = await getShopConfig();
  return <CookieBanner cookieExpiryDays={shopConfig.cookies.expiryDays} />;
}
