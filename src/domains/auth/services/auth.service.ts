import { handleCustomerUserErrors, handleUserErrors } from '@/core/utils/form-actions';
import { getUser } from '@/domains/user/get-user';
import { api } from '@/infra/http/api-client';
import { storefrontSdk } from '@/infra/shopify/client';
import { setShopifyToken } from '@/infra/shopify/server';
import type { CustomerAccessToken } from '@/infra/shopify/storefront';

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

  private static async updateCartBuyerIdentity(
    token: CustomerAccessToken['accessToken'],
    user: NonNullable<Awaited<ReturnType<typeof getUser>>>,
    retries = 3,
  ) {
    let lastError: unknown = null;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await api.patch('/api/cart/buyer-identity', {
          customerAccessToken: token,
          user: {
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
          },
        });

        if (this.isSuccessResponse(response)) {
          return;
        }

        lastError = new Error(this.extractErrorMessage(response));
        this.handleFailedAttempt(attempt, retries, lastError, response);

        if (attempt === retries) {
          return;
        }
      } catch (error) {
        lastError = error;
        this.handleFailedAttempt(attempt, retries, error);

        if (attempt === retries) {
          return;
        }
      }

      if (attempt < retries) {
        await this.waitForBackoff(attempt - 1);
      }
    }
  }

  private static isSuccessResponse(response: unknown): response is { data: unknown } {
    return (
      response !== null &&
      response !== undefined &&
      typeof response === 'object' &&
      'data' in response
    );
  }

  private static extractErrorMessage(response: unknown): string {
    if (
      response &&
      typeof response === 'object' &&
      'error' in response &&
      typeof (response as { error: unknown }).error === 'string'
    ) {
      return (response as { error: string }).error;
    }
    return 'Unexpected response format: missing data property';
  }

  private static async waitForBackoff(attempt: number): Promise<void> {
    const delay = Math.min(100 * Math.pow(2, attempt - 1), 1000);
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, delay);
    });
  }

  private static handleFailedAttempt(
    attempt: number,
    retries: number,
    error: unknown,
    response?: unknown,
  ): void {
    const isLastAttempt = attempt === retries;

    const context = isLastAttempt
      ? `AuthService.updateCartBuyerIdentity - failed after ${retries} attempts`
      : `AuthService.updateCartBuyerIdentity - attempt ${attempt}/${retries} failed`;

    if (isLastAttempt || process.env.NODE_ENV === 'development') {
      console.warn(context, response ? { error, response } : error);
    }
  }
}
