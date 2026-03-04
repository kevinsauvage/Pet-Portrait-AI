import type { Metadata } from 'next';
import Link from 'next/link';

import seo from '@/core/config/seo';
import { CustomerOrdersService } from '@/domains/orders/services/customer-orders.service';
import PageInfoPagination from '@/ui/components/catalog/PageInfoPagination';
import Orders from '@/ui/components/orders/Orders';
import BackButton from '@/ui/components/shared/BackButton';
import CardHeaderPattern from '@/ui/components/shared/CardHeaderPattern';
import EmptyState from '@/ui/components/shared/EmptyState';
import { Button } from '@/ui/primitives/button';
import { Card, CardContent } from '@/ui/primitives/card';

export const dynamic = 'force-dynamic'; // Orders are user-specific

export const metadata: Metadata = {
  description: seo.account.orders.description,
  title: seo.account.orders.title,
};

const Page = async ({
  searchParams,
}: {
  searchParams: Promise<{ after?: string; before?: string; sort_key?: string }>;
}) => {
  const searchParameters = await searchParams;

  const response = await CustomerOrdersService.getCustomerOrders({
    first: 5,
    after: searchParameters.after || undefined,
    before: searchParameters.before || undefined,
  });

  if (!response || response?.customer?.orders === undefined) {
    return (
      <EmptyState
        variant="orders"
        title="No orders yet"
        subtitle="When you place an order, it will appear here. Start shopping to see your order history."
        altText="Order List is Empty"
        primaryAction={
          <Button variant="default" asChild>
            <Link href="/">Start Shopping</Link>
          </Button>
        }
        secondaryAction={
          <Link href="/shop" className="link">
            Browse collections
          </Link>
        }
      />
    );
  }

  const { edges, pageInfo } = response.customer.orders || {};

  if (!edges?.length) {
    return (
      <Card>
        <CardContent>
          <EmptyState
            variant="orders"
            title="No orders found"
            subtitle="When you place an order, it will appear here. Start shopping to see your order history."
            altText="No Orders Found"
            primaryAction={
              <Button variant="default" asChild>
                <Link href="/">Start Shopping</Link>
              </Button>
            }
            secondaryAction={
              <Link href="/shop" className="link">
                Browse collections
              </Link>
            }
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeaderPattern
        title={`Your Orders (${response.customer?.orders?.totalCount})`}
        size={3}
        actions={<BackButton />}
        description="View and manage your order history."
      />
      <CardContent>
        <Orders orders={response.customer} />
        <PageInfoPagination pageInfo={pageInfo} searchParameters={searchParameters} />
      </CardContent>
    </Card>
  );
};

export default Page;
