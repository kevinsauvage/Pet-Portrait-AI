'use client';

import { createContext, useMemo } from 'react';

import type { GetCustomerQuery } from '@/infra/shopify/storefront';

export const UserContext = createContext({
  user: undefined as GetCustomerQuery['customer'] | null,
});

export const UserProvider = ({
  children,
  user,
}: {
  children: React.ReactNode;
  user: GetCustomerQuery['customer'] | null;
}) => {
  const values = useMemo(() => ({ user }), [user]);

  return <UserContext.Provider value={values}>{children}</UserContext.Provider>;
};
