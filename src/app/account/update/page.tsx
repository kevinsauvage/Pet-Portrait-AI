import type { Metadata } from 'next';

import seo from '@/core/config/seo';
import { CreationsService } from '@/domains/creations/creations.service';
import { CustomerOrdersService } from '@/domains/orders/customer-orders.service';
import { getUser } from '@/domains/user/get-user';
import { WishlistService } from '@/domains/wishlist/wishlist.service';
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

  const [ordersResponse, creationsCount, savedPortraitsCount] = await Promise.all([
    CustomerOrdersService.getCustomerOrders({ first: 1 }),
    CreationsService.getCreationsCount(),
    WishlistService.getWishlistCount(),
  ]);

  const ordersCount = Number(ordersResponse?.customer?.orders?.totalCount || 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeaderPattern
          title="My Details"
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
            title="Account Summary"
            size={4}
            description="Overview of your account activity"
          />
          <CardContent>
            <AccountStats
              ordersCount={ordersCount}
              creationsCount={creationsCount}
              savedPortraitsCount={savedPortraitsCount}
              memberSince={user.createdAt}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Page;
