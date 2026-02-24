import type { Metadata } from 'next';
import Link from 'next/link';

import config from '@/core/config';
import seo from '@/core/config/seo';
import { generateMetadata as generateMetadataUtil } from '@/core/utils/metadata';
import { createAddressAction } from '@/domains/address/actions';
import AddressFormUI from '@/ui/components/account/AddressForm';
import CardHeaderPattern from '@/ui/components/shared/CardHeaderPattern';
import { Button } from '@/ui/primitives/button';
import { Card, CardContent } from '@/ui/primitives/card';

import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = generateMetadataUtil({
  title: seo.account.addresses.title,
  description: seo.account.addresses.description,
  url: '/account/addresses/create',
  noindex: true, // Private page, don't index
});

const CreateAddresses = () => {
  return (
    <Card>
      <CardHeaderPattern
        title="Addresses"
        size={3}
        descriptionClassName="max-w-md"
        description="Add a new shipping address to your account."
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
        <AddressFormUI address={undefined} action={createAddressAction} buttonText="Add address" />
      </CardContent>
    </Card>
  );
};

export default CreateAddresses;
