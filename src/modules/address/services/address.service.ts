import { revalidatePath } from 'next/cache';

import config from '@/core/config';
import { getShopifyToken } from '@/lib/server/shopify-helpers';
import { storefrontSdk } from '@/modules/shopify/api';
import { safeLogError } from '@/utils/api-responses';
import { handleCustomerUserErrors } from '@/utils/form-actions';

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

export class AddressService {
  private static readonly UNAUTHENTICATED_ERROR = 'User not authenticated';
  private static readonly DEFAULT_ERROR = 'Something went wrong';

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

    const { customerUserErrors, deletedCustomerAddressId } =
      response?.customerAddressDelete || {};

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
      safeLogError('AddressService.setDefaultAddress', error);
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
