import type { Metadata } from 'next';

import seo from '@/core/config/seo';
import { AddressService } from '@/domains/address/services/address.service';
import { CustomerOrdersService } from '@/domains/orders/services/customer-orders.service';
import { getUser } from '@/domains/user/get-user';
import { WishlistService } from '@/domains/wishlist/services/wishlist.service';
import AccountStats from '@/ui/components/account/AccountStats';
import UpdateUserForm from '@/ui/components/account/UpdateUserForm';
import BackButton from '@/ui/components/shared/BackButton';
import CardHeaderPattern from '@/ui/components/shared/CardHeaderPattern';
import { Card, CardContent } from '@/ui/primitives/card';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  description: seo.account.update.description,
  title: seo.account.update.title,
};

const Page = async () => {
  const user = await getUser();

  // Fetch stats in parallel
  const [ordersResponse, addressesResponse, wishlist] = await Promise.all([
    CustomerOrdersService.getCustomerOrders({ first: 1 }),
    AddressService.getCustomerAddresses({ first: 1 }),
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
