import { storefrontSdk } from '@/infra/shopify/client';
import {
  type GetCustomerOrdersQuery,
  LanguageCode,
  OrderSortKeys,
} from '@/infra/shopify/generated/storefront/index';
import { adjustPaginationVariables } from '@/infra/shopify/helpers';
import { getShopifyToken } from '@/infra/shopify/server';

type CustomerOrdersInput = {
  customerAccessToken?: string;
  first?: number;
  after?: string;
  before?: string;
  sortKey?: OrderSortKeys;
  language?: LanguageCode;
};

export class CustomerOrdersService {
  static async getCustomerOrders({
    customerAccessToken,
    first = 5,
    after,
    before,
    sortKey = OrderSortKeys.ProcessedAt,
    language = LanguageCode.En,
  }: CustomerOrdersInput = {}): Promise<GetCustomerOrdersQuery | null> {
    const token = customerAccessToken ?? (await getShopifyToken());
    if (!token) return null;

    return storefrontSdk('no-store').getCustomerOrders({
      customerAccessToken: token,
      identifiers: [],
      language,
      sortKey,
      ...adjustPaginationVariables({
        after,
        before,
        first,
      }),
    });
  }
}
