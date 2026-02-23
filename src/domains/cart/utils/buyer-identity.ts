import type { CartBuyerIdentityInput } from '@/infra/shopify/storefront';

type BuyerIdentitySource = {
  customerAccessToken: string;
  user?: {
    email?: string | null;
    phone?: string | null;
  };
};

export function buildBuyerIdentityInput(source: BuyerIdentitySource): CartBuyerIdentityInput {
  return {
    customerAccessToken: source.customerAccessToken,
    email: source.user?.email ?? undefined,
    phone: source.user?.phone ?? undefined,
  };
}
