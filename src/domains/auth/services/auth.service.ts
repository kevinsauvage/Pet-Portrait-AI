import config from '@/core/config';
import { userFeedback } from '@/core/config/userFeedback';
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

const normalizeCustomerErrors = <T extends { message?: string }>(
  errors: T[] | null | undefined,
  fallbackMessage: string,
): T[] | undefined => {
  if (!errors?.length) return errors ?? undefined;
  return errors.map((error) => ({
    ...error,
    message: fallbackMessage,
  }));
};

export class AuthService {
  static async register(input: RegisterInput) {
    const { email, password, firstName, lastName } = input;

    const registerResponse = await storefrontSdk().customerCreate({
      input: { email, firstName, lastName, password },
    });

    const { customerUserErrors, userErrors } = registerResponse?.customerCreate || {};

    const normalizedCustomerErrors = normalizeCustomerErrors(
      customerUserErrors,
      userFeedback.register.error,
    );
    const customerErrorResult = handleCustomerUserErrors(normalizedCustomerErrors);
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

    // Map Shopify login errors to a friendly, consistent message
    const normalizedCustomerErrors = normalizeCustomerErrors(
      customerUserErrors,
      userFeedback.login.error,
    );
    const loginErrorResult = handleCustomerUserErrors(normalizedCustomerErrors);
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

    const normalizedCustomerErrors = normalizeCustomerErrors(
      customerUserErrors,
      userFeedback.recover.error,
    );
    const errorResult = handleCustomerUserErrors(normalizedCustomerErrors);
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

    const normalizedCustomerErrors = normalizeCustomerErrors(
      customerUserErrors,
      userFeedback.resetPassword.error,
    );
    const errorResult = handleCustomerUserErrors(normalizedCustomerErrors);
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
        logger.error('Failed to delete token during logout', {
          context: 'AuthService.logout',
          error,
        });
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
