import { revalidatePath } from 'next/cache';

import config from '@/core/config';
import { getShopifyToken, setShopifyToken } from '@/lib/server/shopify-helpers';
import { storefrontSdk } from '@/modules/shopify/api';
import { handleCustomerUserErrors } from '@/utils/form-actions';

type UpdateUserInput = {
  email: string;
  firstName: string;
  lastName: string;
  acceptsMarketing?: string;
  company?: string;
  phone?: string;
};

export class UserService {
  static async updateUser(input: UpdateUserInput) {
    const shopifyToken = await getShopifyToken();

    if (!shopifyToken) {
      return { error: 'User not logged in' };
    }

    const { email, firstName, lastName, acceptsMarketing, company, phone } = input;

    const customerInput = {
      acceptsMarketing: acceptsMarketing === 'true',
      company,
      email,
      firstName,
      lastName,
      phone: phone || undefined,
    };

    const updateResponse = await storefrontSdk().customerUpdate({
      customer: customerInput,
      customerAccessToken: shopifyToken,
    });

    const { customerUserErrors, customer, customerAccessToken } =
      updateResponse?.customerUpdate || {};

    const errorResult = handleCustomerUserErrors(customerUserErrors);
    if (errorResult) return errorResult;

    if (customerAccessToken) {
      await setShopifyToken(customerAccessToken);
    }

    if (customer) {
      revalidatePath(config.routes.updateAccount);
      return { success: 'User updated successfully', customer };
    }

    return { error: 'Failed to update user' };
  }
}
