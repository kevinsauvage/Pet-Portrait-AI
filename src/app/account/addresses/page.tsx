import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import NoAddressIllustration from '@/assets/NoAddressIllustration.png';
import config from '@/core/config';
import seo from '@/core/config/seo';
import { AddressService } from '@/domains/address/services/address.service';
import { isDefaultAddress, mapAddressEdgesToList } from '@/domains/address/utils/address-utils';
import { getUser } from '@/domains/user/get-user';
import Address from '@/ui/components/account/Address';
import PageInfoPagination from '@/ui/components/catalog/PageInfoPagination';
import BackButton from '@/ui/components/shared/BackButton';
import CardHeaderPattern from '@/ui/components/shared/CardHeaderPattern';
import EmptyState from '@/ui/components/shared/EmptyState';
import { Button } from '@/ui/primitives/button';
import { Card, CardContent } from '@/ui/primitives/card';

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
  const response = await AddressService.getCustomerAddresses({
    after: searchParameters.after || undefined,
    before: searchParameters.before || undefined,
    first: 6,
  });

  if (!response) {
    redirect(config.routes.login);
  }

  const addresses = mapAddressEdgesToList(response?.customer?.addresses);

  const pageInfo = response?.customer?.addresses.pageInfo;
  const user = await getUser();

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
            <Address
              key={item.id}
              address={item}
              isDefault={isDefaultAddress(item, user?.defaultAddress?.id)}
            />
          ))}
        </div>
        <PageInfoPagination pageInfo={pageInfo} searchParameters={searchParameters} />
      </CardContent>
    </Card>
  );
};

export default Addresses;
