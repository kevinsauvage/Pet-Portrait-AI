import config from '@/core/config';
import { handleCustomerUserErrors, handleUserErrors } from '@/core/utils/form-actions';
import { logger } from '@/core/utils/logger';
import { withRetry } from '@/core/utils/retry';
import { getUser } from '@/domains/user/get-user';
import { api } from '@/infra/http/api-client';
import { storefrontSdk } from '@/infra/shopify/client';
import { clearShopifyToken, getShopifyToken, setShopifyToken } from '@/infra/shopify/server';
import type { CustomerAccessToken } from '@/infra/shopify/storefront';
import { delCookieAction } from '@/lib/cookies/actions';

type LoginInput = {
  email: string;
  password: string;
};

type RegisterInput = {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
};

type RecoverInput = {
  email: string;
};

type ResetPasswordInput = {
  password: string;
  resetToken: string;
};

export class AuthService {
  static async register(input: RegisterInput) {
    const { email, password, firstName, lastName } = input;

    const registerResponse = await storefrontSdk().customerCreate({
      input: { email, firstName, lastName, password },
    });

    const { customerUserErrors, userErrors } = registerResponse?.customerCreate || {};

    const customerErrorResult = handleCustomerUserErrors(customerUserErrors);
    if (customerErrorResult) return customerErrorResult;

    const userErrorResult = handleUserErrors(userErrors);
    if (userErrorResult) return userErrorResult;

    const loginResponse = await storefrontSdk().customerAccessTokenCreate({
      input: { email, password },
    });

    const { customerAccessToken, customerUserErrors: loginCustomerErrors } =
      loginResponse?.customerAccessTokenCreate || {};

    const loginErrorResult = handleCustomerUserErrors(loginCustomerErrors);
    if (loginErrorResult) return loginErrorResult;

    if (!customerAccessToken) {
      return { error: 'Failed to create account' };
    }

    await setShopifyToken(customerAccessToken);

    const user = await getUser();
    if (user) {
      await this.updateCartBuyerIdentity(customerAccessToken.accessToken, user);
    }

    return { success: true, customerAccessToken };
  }

  static async login(input: LoginInput) {
    const { email, password } = input;

    const response = await storefrontSdk().customerAccessTokenCreate({
      input: { email, password },
    });

    const { customerUserErrors, customerAccessToken } = response?.customerAccessTokenCreate || {};

    const loginErrorResult = handleCustomerUserErrors(customerUserErrors);
    if (loginErrorResult) return loginErrorResult;

    if (!customerAccessToken) {
      return { error: 'Invalid email or password' };
    }

    await setShopifyToken(customerAccessToken);

    const user = await getUser();
    if (user) {
      await this.updateCartBuyerIdentity(customerAccessToken.accessToken, user);
    }

    return { success: true, customerAccessToken };
  }

  static async recoverPassword(input: RecoverInput) {
    const { email } = input;

    const response = await storefrontSdk().customerRecover({
      email,
    });

    const { customerUserErrors } = response?.customerRecover || {};

    const errorResult = handleCustomerUserErrors(customerUserErrors);
    if (errorResult) return errorResult;

    return { success: true };
  }

  static async resetPassword(input: ResetPasswordInput) {
    const { password, resetToken } = input;

    const response = await storefrontSdk().customerResetByUrl({
      resetUrl: resetToken,
      password,
    });

    const { customerAccessToken, customerUserErrors } = response?.customerResetByUrl || {};

    const errorResult = handleCustomerUserErrors(customerUserErrors);
    if (errorResult) return errorResult;

    if (!customerAccessToken) {
      return { error: 'Failed to reset password' };
    }

    await setShopifyToken(customerAccessToken);

    return { success: true, customerAccessToken };
  }

  static async logout() {
    const token = await getShopifyToken();
    if (token) {
      try {
        await storefrontSdk('no-store').customerAccessTokenDelete({
          customerAccessToken: token,
        });
      } catch (error) {
        logger.error('Failed to delete token during logout', { context: 'AuthService.logout', error });
      }
    }

    await clearShopifyToken();
    await delCookieAction(config.cookies.delegateToken);
  }

  private static async updateCartBuyerIdentity(
    token: CustomerAccessToken['accessToken'],
    user: NonNullable<Awaited<ReturnType<typeof getUser>>>,
  ) {
    await withRetry(
      () =>
        api.patch<{ data?: unknown }>('/api/cart/buyer-identity', {
          customerAccessToken: token,
          user: {
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
          },
        }),
      {
        maxAttempts: 3,
        baseDelayMs: 100,
        maxDelayMs: 1000,
        isSuccess: (response) =>
          response !== null && typeof response === 'object' && 'data' in response,
        onAttemptFailed: (attempt, maxAttempts, error) => {
          const context =
            attempt === maxAttempts
              ? `AuthService.updateCartBuyerIdentity - failed after ${maxAttempts} attempts`
              : `AuthService.updateCartBuyerIdentity - attempt ${attempt}/${maxAttempts} failed`;
          if (attempt === maxAttempts || process.env.NODE_ENV === 'development') {
            logger.warn('Cart buyer identity update attempt failed', { context, error });
          }
        },
      },
    );
  }
}
