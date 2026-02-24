import { revalidatePath } from 'next/cache';

import config from '@/core/config';
import { handleCustomerUserErrors } from '@/core/utils/form-actions';
import { logger } from '@/core/utils/logger';
import { storefrontSdk } from '@/infra/shopify/client';
import { adjustPaginationVariables } from '@/infra/shopify/helpers';
import { getShopifyToken } from '@/infra/shopify/server';
import type { GetCustomerAddressesQuery } from '@/infra/shopify/storefront';

type AddressInput = {
  address1: string;
  address2?: string;
  city: string;
  company?: string;
  country: string;
  firstName: string;
  id?: string;
  lastName: string;
  phone?: string;
  province?: string;
  zip: string;
};

type AddressPagination = {
  first?: number;
  after?: string;
  before?: string;
};

export class AddressService {
  private static readonly UNAUTHENTICATED_ERROR = 'User not authenticated';
  private static readonly DEFAULT_ERROR = 'Something went wrong';

  static async getCustomerAddresses(
    pagination: AddressPagination = { first: 6 },
    customerAccessToken?: string,
  ): Promise<GetCustomerAddressesQuery | null> {
    const token = customerAccessToken ?? (await getShopifyToken());
    if (!token) return null;

    return storefrontSdk('no-store').getCustomerAddresses({
      customerAccessToken: token,
      ...adjustPaginationVariables({
        after: pagination.after,
        before: pagination.before,
        first: pagination.first ?? 6,
      }),
    });
  }

  static async createAddress(input: AddressInput) {
    const customerAccessToken = await getShopifyToken();
    if (!customerAccessToken) {
      return { error: this.UNAUTHENTICATED_ERROR };
    }

    const response = await storefrontSdk().customerAddressCreate({
      address: input,
      customerAccessToken,
    });

    const { customerUserErrors, customerAddress } = response?.customerAddressCreate || {};

    if (customerAddress) {
      revalidatePath(config.routes.addresses);
      return { success: true, customerAddress };
    }

    const errorResult = handleCustomerUserErrors(customerUserErrors);
    if (errorResult) return errorResult;

    return { error: this.DEFAULT_ERROR };
  }

  static async updateAddress(input: AddressInput) {
    const customerAccessToken = await getShopifyToken();
    if (!customerAccessToken) {
      return { error: this.UNAUTHENTICATED_ERROR };
    }

    const { id, ...address } = input;
    if (!id) {
      return { error: 'Address ID is required for update' };
    }

    const response = await storefrontSdk().customerAddressUpdate({
      address,
      addressId: id,
      customerAccessToken,
    });

    const { customerUserErrors, customerAddress } = response?.customerAddressUpdate || {};

    const errorResult = handleCustomerUserErrors(customerUserErrors);
    if (errorResult) return errorResult;

    if (customerAddress) {
      revalidatePath(`${config.routes.addresses}/edit`);
      revalidatePath(config.routes.addresses);
      return { success: true, customerAddress };
    }

    return { error: this.DEFAULT_ERROR };
  }

  static async deleteAddress(addressId: string) {
    const customerAccessToken = await getShopifyToken();
    if (!customerAccessToken) {
      return { error: this.UNAUTHENTICATED_ERROR };
    }

    const response = await storefrontSdk().customerAddressDelete({
      addressId,
      customerAccessToken,
    });

    const { customerUserErrors, deletedCustomerAddressId } = response?.customerAddressDelete || {};

    if (deletedCustomerAddressId) {
      revalidatePath(config.routes.addresses);
      return { success: true, deletedCustomerAddressId };
    }

    const errorResult = handleCustomerUserErrors(customerUserErrors);
    if (errorResult) return errorResult;

    return { error: this.DEFAULT_ERROR };
  }

  static async setDefaultAddress(addressId: string) {
    const customerAccessToken = await getShopifyToken();
    if (!customerAccessToken) {
      return { error: this.UNAUTHENTICATED_ERROR };
    }

    let response;
    try {
      response = await storefrontSdk().customerDefaultAddressUpdate({
        addressId,
        customerAccessToken,
      });
    } catch (error) {
      logger.error('AddressService.setDefaultAddress', error);
      return { error: 'Failed to set default address' };
    }

    const { customerUserErrors, customer } = response?.customerDefaultAddressUpdate || {};

    const errorResult = handleCustomerUserErrors(customerUserErrors);
    if (errorResult) return errorResult;

    if (customer) {
      revalidatePath(config.routes.addresses);
      return { success: true, customer };
    }

    return { error: this.DEFAULT_ERROR };
  }
}
