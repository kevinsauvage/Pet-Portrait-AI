'use client';

import Link from 'next/link';

import config from '@/core/config';
import { logger } from '@/core/utils/logger';
import { deleteAddressAction, setDefaultAddressAction } from '@/domains/address/actions';
import type { MailingAddress } from '@/infra/shopify/generated/storefront/index';
import { Badge } from '@/ui/primitives/badge';
import { Button } from '@/ui/primitives/button';
import { Card, CardContent } from '@/ui/primitives/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/ui/primitives/dropdown-menu';

import { Edit, Heart, MoreVerticalIcon, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const Address = ({
  address,
  isDefault,
  displayButton = true,
}: {
  address: MailingAddress;
  isDefault?: boolean;
  displayButton?: boolean;
}) => {
  const { id, address1, address2, name, city, country, province, zip, company, phone } =
    address || {};

  const handleDelete = async (): Promise<void> => {
    if (!id) {
      toast.error('Address ID is missing');
      return;
    }

    const response = await deleteAddressAction(id);

    if (response.error) {
      toast.error(response.error);
      return;
    }
    if (response?.customerUserErrors?.length) {
      response.customerUserErrors.forEach((error) => {
        toast.error(error.message);
      });
      return;
    }
    toast.success('Address deleted successfully');
  };

  const handleSetAsDefault = async (): Promise<void> => {
    if (!id) {
      toast.error('Address ID is missing');
      return;
    }

    const response = await setDefaultAddressAction(id);

    if (response.error) {
      toast.error(response.error);
      return;
    }

    if (response?.customerUserErrors?.length) {
      response.customerUserErrors.forEach((error) => {
        toast.error(error.message);
      });
      return;
    }
    toast.success('Address set as default successfully');
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md py-0">
      <CardContent className="px-4 md:px-6 py-4 md:py-6 flex justify-between gap-4">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-body font-semibold">{name}</p>
            {isDefault && (
              <Badge variant="default" className="text-caption-sm text-primary-foreground">
                Default
              </Badge>
            )}
          </div>
          <div className="space-y-1 text-body-sm text-secondary">
            <p>
              {address1}
              {address2 && `, ${address2}`}
            </p>
            <p>
              {city}, {province} {zip}
            </p>
            <p>{country}</p>
          </div>
          {(company || phone) && (
            <div className="pt-2 space-y-1 border-t">
              {company && (
                <p className="text-body-sm text-secondary">
                  <span className="font-medium">Company:</span> {company}
                </p>
              )}
              {phone && (
                <p className="text-body-sm text-secondary">
                  <span className="font-medium">Phone:</span> {phone}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col items-end justify-start gap-2 shrink-0">
          {displayButton && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex size-9 text-secondary data-[state=open]:bg-muted hover:bg-muted"
                  size="icon"
                  aria-label="Address actions menu"
                >
                  <MoreVerticalIcon size={18} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link
                    href={`${config.routes.editAddress}?id=${id}`}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Edit size={16} />
                    <span>Edit address</span>
                  </Link>
                </DropdownMenuItem>
                {!isDefault && (
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => {
                      handleSetAsDefault().catch((error) => {
                        logger.error('Failed to set default address', { context: 'address.set-default', error });
                      });
                    }}
                  >
                    <Heart size={16} />
                    <span>Set as default</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-destructive focus:text-destructive"
                  onClick={() => {
                    handleDelete().catch((error) => {
                      logger.error('Failed to delete address', { context: 'address.delete', error });
                    });
                  }}
                >
                  <Trash2 size={16} />
                  <span className="whitespace-nowrap">Remove address</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default Address;
