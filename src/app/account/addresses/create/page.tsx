import type { Metadata } from 'next';
import Link from 'next/link';

import { createAddressAction } from '@/actions/addressesActions';
import config from '@/core/config';
import seo from '@/data/seo';
import { generateMetadata as generateMetadataUtil } from '@/lib/server/metadata';
import CardHeaderPattern from '@/ui/components/CardHeaderPattern';
import { Button } from '@/ui/components/ui/button';
import { Card, CardContent } from '@/ui/components/ui/card';

import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = generateMetadataUtil({
  title: seo.account.addresses.title,
  description: seo.account.addresses.description,
  url: '/account/addresses/create',
  noindex: true, // Private page, don't index
});

import AddressFormUI from '../_components/AddressForm';

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
