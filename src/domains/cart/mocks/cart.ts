/* eslint-disable @typescript-eslint/no-explicit-any */
import type { CartFieldsFragment } from '@/infra/shopify/generated/storefront/index';

const USD = 'USD' as const;

const cartMock: CartFieldsFragment = {
  __typename: 'Cart',
  id: '',
  createdAt: '',
  updatedAt: '',
  checkoutUrl: '',
  totalQuantity: 0,
  note: null,
  appliedGiftCards: [],
  lines: {
    __typename: 'BaseCartLineConnection',
    edges: [],
    pageInfo: {
      __typename: 'PageInfo',
      hasNextPage: false,
      hasPreviousPage: false,
      startCursor: null,
      endCursor: null,
    },
  },
  attributes: [],
  cost: {
    __typename: 'CartCost',
    totalAmount: {
      __typename: 'MoneyV2',
      amount: '0.00',
      currencyCode: USD as any,
    },
    subtotalAmount: {
      __typename: 'MoneyV2',
      amount: '0.00',
      currencyCode: USD as any,
    },
    totalTaxAmount: {
      __typename: 'MoneyV2',
      amount: '0.00',
      currencyCode: USD as any,
    },
    totalDutyAmount: {
      __typename: 'MoneyV2',
      amount: '0.00',
      currencyCode: USD as any,
    },
  },
  discountCodes: [],
  buyerIdentity: {
    __typename: 'CartBuyerIdentity',
    email: null,
    phone: null,
    countryCode: null,
    customer: null,
    deliveryAddressPreferences: [],
  },
};

export default cartMock;
