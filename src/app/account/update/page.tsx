import type { Metadata } from 'next';

import seo from '@/core/config/seo';
import { getUser } from '@/domains/user/get-user';
import { WishlistService } from '@/domains/wishlist/services/wishlist.service';
import { storefrontSdk } from '@/infra/shopify/client';
import { getShopifyToken } from '@/infra/shopify/server';
import { LanguageCode, OrderSortKeys } from '@/infra/shopify/storefront';
import AccountStats from '@/ui/components/AccountStats';
import BackButton from '@/ui/components/BackButton';
import CardHeaderPattern from '@/ui/components/CardHeaderPattern';
import { Card, CardContent } from '@/ui/components/ui/card';

import UpdateUserForm from '../../../ui/components/UpdateUserForm';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  description: seo.account.update.description,
  title: seo.account.update.title,
};

const Page = async () => {
  const shopifyToken = await getShopifyToken();
  const user = await getUser();

  // Fetch stats in parallel
  const [ordersResponse, addressesResponse, wishlist] = await Promise.all([
    shopifyToken
      ? storefrontSdk('no-store').getCustomerOrders({
          customerAccessToken: shopifyToken,
          first: 1,
          identifiers: [],
          language: LanguageCode.En,
          sortKey: OrderSortKeys.ProcessedAt,
        })
      : Promise.resolve(null),
    shopifyToken
      ? storefrontSdk('no-store').getCustomerAddresses({
          customerAccessToken: shopifyToken,
          first: 1,
        })
      : Promise.resolve(null),
    WishlistService.getWishlist(),
  ]);

  const ordersCount = Number(ordersResponse?.customer?.orders?.totalCount || 0);
  const addressesCount = addressesResponse?.customer?.addresses?.edges?.length || 0;
  const wishlistCount = wishlist?.length || 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeaderPattern
          title="Update Account"
          size={3}
          actions={<BackButton />}
          description="Update your account information and preferences."
        />
        <CardContent className="space-y-6">
          <UpdateUserForm />
        </CardContent>
      </Card>

      {user && (
        <Card>
          <CardHeaderPattern
            title="Account Statistics"
            size={4}
            description="Overview of your account activity"
          />
          <CardContent>
            <AccountStats
              ordersCount={ordersCount}
              addressesCount={addressesCount}
              wishlistCount={wishlistCount}
              memberSince={user.createdAt}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Page;
