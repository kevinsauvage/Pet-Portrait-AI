'use client';

import { createContext, useCallback, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import config from '@/core/config';
import { logger } from '@/core/utils/logger';
import { addToWishlist, removeFromWishlist } from '@/domains/wishlist/client';
import type { GetCustomerQuery, ProductFieldsFragment } from '@/infra/shopify/storefront';

import { toast } from 'sonner';

export const UserContext = createContext({
  handleSetWishlist: async (_isWishlisted: boolean, _product: ProductFieldsFragment) => {
    // noop
  },
  user: undefined as GetCustomerQuery['customer'] | null,
  userWishlist: [] as Array<ProductFieldsFragment>,
});

export const UserProvider = ({
  children,
  user,
  userWishlist = [],
}: {
  children: React.ReactNode;
  user: GetCustomerQuery['customer'] | null;
  userWishlist: Array<ProductFieldsFragment>;
}) => {
  const router = useRouter();
  const pathname = usePathname();

  const handleSetWishlist = useCallback(
    async (isWishlisted: boolean, product: ProductFieldsFragment) => {
      if (!user) {
        toast.info('You need to login to add products to your wishlist');
        router.push(`${config.routes.login}?redirect=${pathname}`);
        return;
      }

      try {
        const result = isWishlisted
          ? await removeFromWishlist(product.id)
          : await addToWishlist(product.id);

        if (result?.success && result.data) {
          toast.success(result.message);
          router.refresh();
        } else {
          toast.error(result?.message || 'Something went wrong');
        }
      } catch (error) {
        logger.error('Wishlist operation failed', { context: 'wishlist', error });
        toast.error(error instanceof Error ? error.message : 'Something went wrong');
      }
    },
    [pathname, router, user],
  );

  const values = useMemo(
    () => ({ handleSetWishlist, user, userWishlist }),
    [user, userWishlist, handleSetWishlist],
  );

  return <UserContext.Provider value={values}>{children}</UserContext.Provider>;
};
