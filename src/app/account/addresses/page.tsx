import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import NoAddressIllustration from '@/assets/NoAddressIllustration.png';
import config from '@/core/config';
import seo from '@/core/config/seo';
import { getUser } from '@/domains/user/get-user';
import { storefrontSdk } from '@/infra/shopify/client';
import { adjustPaginationVariables } from '@/infra/shopify/helpers';
import { getShopifyToken } from '@/infra/shopify/server';
import type { MailingAddress } from '@/infra/shopify/storefront';
import CardHeaderPattern from '@/ui/components/CardHeaderPattern';
import EmptyState from '@/ui/components/EmptyState';
import PageInfoPagination from '@/ui/components/PageInfoPagination';
import { Button } from '@/ui/components/ui/button';
import { Card, CardContent } from '@/ui/components/ui/card';

import BackButton from '../_components/BackButton';

import Address from './_components/Address';

import { Plus } from 'lucide-react';

export const dynamic = 'force-dynamic'; // Addresses are user-specific

export const metadata: Metadata = {
  description: seo.account.addresses.description,
  title: seo.account.addresses.title,
};

const Addresses = async ({
  searchParams,
}: {
  searchParams: Promise<{ after?: string; before?: string; sort_key?: string }>;
}) => {
  const searchParameters = await searchParams;
  const customerAccessToken = await getShopifyToken();

  if (!customerAccessToken) {
    redirect(config.routes.login);
  }

  const response = await storefrontSdk('no-store').getCustomerAddresses({
    ...adjustPaginationVariables({
      after: searchParameters.after || undefined,
      before: searchParameters.before || undefined,
      first: 6,
    }),
    customerAccessToken,
  });

  const addresses =
    response?.customer?.addresses?.edges?.map((edge) => ({
      ...edge.node,
    })) || [];

  const pageInfo = response?.customer?.addresses.pageInfo;
  const user = await getUser();

  const isDefault = (address: MailingAddress) =>
    address.id?.split('?')?.[0] === user?.defaultAddress?.id?.split('?')?.[0];

  const hasAddresses = Array.isArray(addresses) && addresses.length > 0;

  if (!hasAddresses) {
    return (
      <Card>
        <CardContent>
          <EmptyState
            variant="addresses"
            image={NoAddressIllustration}
            title="No addresses saved"
            subtitle="Add shipping addresses to speed up checkout. You can save multiple addresses and set a default for faster ordering."
            altText="No Address Yet"
            primaryAction={
              <Link href={config.routes.createAddress}>
                <Button variant="default" className="gap-2">
                  <Plus size={16} />
                  Add new address
                </Button>
              </Link>
            }
          />
        </CardContent>
      </Card>
    );
  }

  if (!pageInfo) {
    return null;
  }

  return (
    <Card>
      <CardHeaderPattern
        title="Addresses"
        size={3}
        actions={
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <BackButton />
            <Button variant="default" asChild>
              <Link href={config.routes.createAddress} className="gap-2">
                Add new address
                <Plus size={16} />
              </Link>
            </Button>
          </div>
        }
        description="Manage your shipping addresses for faster checkout."
      />
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-4">
          {addresses.map((item) => (
            <Address key={item.id} address={item} isDefault={isDefault(item)} />
          ))}
        </div>
        <PageInfoPagination pageInfo={pageInfo} searchParameters={searchParameters} />
      </CardContent>
    </Card>
  );
};

export default Addresses;
