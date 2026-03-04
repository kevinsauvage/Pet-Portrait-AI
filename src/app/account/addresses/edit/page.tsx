import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import config from '@/core/config';
import seo from '@/core/config/seo';
import { generateMetadata as generateMetadataUtil } from '@/core/utils/metadata';
import { updateAddressAction } from '@/domains/address/actions';
import { AddressService } from '@/domains/address/services/address.service';
import { findAddressById, mapAddressNodeToFormData } from '@/domains/address/utils/address-utils';
import AddressForm from '@/ui/components/account/AddressForm';
import CardHeaderPattern from '@/ui/components/shared/CardHeaderPattern';
import { Button } from '@/ui/primitives/button';
import { Card, CardContent } from '@/ui/primitives/card';

import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = generateMetadataUtil({
  title: seo.account.addresses.title,
  description: seo.account.addresses.description,
  url: '/account/addresses/edit',
  noindex: true, // Private page, don't index
});

type PageProperties = {
  searchParams: Promise<{
    id: string;
    customer_access_token: string;
  }>;
};

const EditAddress = async ({ searchParams }: PageProperties) => {
  const searchParameters = await searchParams;
  const { id } = searchParameters;

  if (!id) {
    redirect(config.routes.addresses);
  }

  const response = await AddressService.getCustomerAddresses({ first: 100 });
  if (!response) {
    return (
      <Card>
        <CardHeaderPattern
          title="Addresses"
          size={3}
          descriptionClassName="max-w-md"
          description="We couldn't load your addresses. Please try again from your account."
          actions={
            <Button variant="secondary" size="sm" asChild>
              <Link href={config.routes.addresses} className="gap-2">
                <ArrowLeft size={16} />
                Back to addresses
              </Link>
            </Button>
          }
        />
      </Card>
    );
  }

  const addressNode = findAddressById(response?.customer?.addresses, id);
  if (!addressNode) {
    redirect(config.routes.addresses);
  }

  const address = mapAddressNodeToFormData(addressNode);

  return (
    <Card>
      <CardHeaderPattern
        title="Edit Addresses"
        size={3}
        descriptionClassName="max-w-md"
        description="Update your shipping address information."
        actions={
          <Button variant="secondary" size="sm" asChild>
            <Link href={config.routes.addresses} className="gap-2">
              <ArrowLeft size={16} />
              Back to addresses
            </Link>
          </Button>
        }
      />
      <CardContent>
        <AddressForm address={address} action={updateAddressAction} buttonText="Save address" />
      </CardContent>
    </Card>
  );
};

export default EditAddress;
