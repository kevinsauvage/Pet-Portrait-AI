import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import config from '@/core/config';
import seo from '@/core/config/seo';
import { AddressService } from '@/domains/address/services/address.service';
import { CustomerOrdersService } from '@/domains/orders/services/customer-orders.service';
import { getUser } from '@/domains/user/get-user';
import { WishlistService } from '@/domains/wishlist/services/wishlist.service';
import AccountCardCTA from '@/ui/components/AccountCardCTA';
import AccountStats from '@/ui/components/AccountStats';
import CardHeaderPattern from '@/ui/components/CardHeaderPattern';
import RecentOrdersPreview from '@/ui/components/RecentOrdersPreview';
import { Card, CardContent } from '@/ui/components/ui/card';
import UserFullName from '@/ui/components/UserFullName';

export const dynamic = 'force-dynamic'; // Account data is user-specific

export const metadata: Metadata = {
  description: seo.account.description,
  title: seo.account.title,
};

const Page = async () => {
  const user = await getUser();

  if (!user) {
    redirect(config.routes.login);
  }

  // Fetch stats in parallel
  const [ordersResponse, addressesResponse, wishlist] = await Promise.all([
    CustomerOrdersService.getCustomerOrders({ first: 3 }),
    AddressService.getCustomerAddresses({ first: 1 }),
    WishlistService.getWishlist(),
  ]);

  if (!ordersResponse || !addressesResponse) {
    redirect(config.routes.login);
  }

  const ordersCount = Number(ordersResponse?.customer?.orders?.totalCount || 0);
  const addressesCount = addressesResponse?.customer?.addresses?.edges?.length || 0;
  const wishlistCount = wishlist?.length || 0;

  const recentOrders = ordersResponse?.customer?.orders?.edges || [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeaderPattern
          className="w-full"
          title="Account Overview"
          size={3}
          description={
            <>
              Welcome <UserFullName />, your account dashboard provides access to all of your
              important account information and features.
            </>
          }
        />
        <CardContent className="space-y-6">
          <AccountStats
            ordersCount={ordersCount}
            addressesCount={addressesCount}
            wishlistCount={wishlistCount}
            memberSince={user.createdAt}
          />

          {recentOrders.length > 0 && (
            <div className="pt-4 border-t">
              <RecentOrdersPreview orders={recentOrders} />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 justify-items-stretch pt-4">
            <AccountCardCTA
              title="Personal Information"
              description="Update your personal details and preferences"
              buttonText="Edit Details"
              buttonLink={config.routes.updateAccount}
            />
            <AccountCardCTA
              title="Addresses"
              description="Manage your shipping and billing addresses"
              buttonText="Edit Addresses"
              buttonLink={config.routes.addresses}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Page;
