import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import config from '@/core/config';
import seo from '@/core/config/seo';
import { CreationsService } from '@/domains/creations/services/creations.service';
import { CustomerOrdersService } from '@/domains/orders/services/customer-orders.service';
import { getUser } from '@/domains/user/get-user';
import { WishlistService } from '@/domains/wishlist/services/wishlist.service';
import AccountCardCTA from '@/ui/components/account/AccountCardCTA';
import AccountStats from '@/ui/components/account/AccountStats';
import UserFullName from '@/ui/components/account/UserFullName';
import RecentOrdersPreview from '@/ui/components/orders/RecentOrdersPreview';
import CardHeaderPattern from '@/ui/components/shared/CardHeaderPattern';
import { Card, CardContent } from '@/ui/primitives/card';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  description: seo.account.description,
  title: seo.account.title,
};

const Page = async () => {
  const user = await getUser();

  if (!user) {
    redirect(config.routes.login);
  }

  const [ordersResponse, creationsCount, savedPortraitsCount] = await Promise.all([
    CustomerOrdersService.getCustomerOrders({ first: 3 }),
    CreationsService.getCreationsCount(),
    WishlistService.getWishlistCount(),
  ]);

  if (!ordersResponse) {
    redirect(config.routes.login);
  }

  const ordersCount = Number(ordersResponse?.customer?.orders?.totalCount || 0);
  const recentOrders = ordersResponse?.customer?.orders?.edges || [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeaderPattern
          className="w-full"
          title="Dashboard"
          size={3}
          description={
            <>
              Welcome back, <UserFullName />! Here&apos;s an overview of your PetPortrait AI
              account.
            </>
          }
        />
        <CardContent className="space-y-6">
          <AccountStats
            ordersCount={ordersCount}
            creationsCount={creationsCount}
            savedPortraitsCount={savedPortraitsCount}
            memberSince={user.createdAt}
          />

          {recentOrders.length > 0 && (
            <div className="pt-4 border-t">
              <RecentOrdersPreview orders={recentOrders} />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 justify-items-stretch pt-4">
            <AccountCardCTA
              title="My Creations"
              description="View all the AI portraits you've generated and order them"
              buttonText="View Creations"
              buttonLink={config.routes.creations}
            />
            <AccountCardCTA
              title="Saved Portraits"
              description="Your favourite portraits, ready to order whenever you like"
              buttonText="View Favourites"
              buttonLink={config.routes.wishlist}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Page;
