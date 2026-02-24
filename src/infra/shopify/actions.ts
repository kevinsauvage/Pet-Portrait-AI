'use server';

import config from '@/core/config';
import { getSecureCookieOptions } from '@/core/utils/cookie-security';
import { logger } from '@/core/utils/logger';
import { getCookieAction, setCookieAction } from '@/lib/cookies/actions';

import { adminSdk } from './client';

const delegateAccessScope = process.env.SHOPIFY_SCOPE;
const expiresIn = config.constants.delegateTokenExpirySeconds;

export async function setDelegateTokenAction(): Promise<void> {
  const tokenCookie = await getCookieAction(config.cookies.delegateToken);
  if (tokenCookie?.value) return;

  if (!delegateAccessScope) {
    logger.error(
      'setDelegateTokenAction',
      new Error('SHOPIFY_SCOPE environment variable is not set'),
    );
    throw new Error('SHOPIFY_SCOPE environment variable is required for delegate token creation');
  }

  try {
    const responseToken = await adminSdk().delegateAccessTokenCreate({
      input: {
        delegateAccessScope: delegateAccessScope.split(','),
        expiresIn,
      },
    });

    const { delegateAccessToken, userErrors } = responseToken?.delegateAccessTokenCreate || {};

    if (userErrors && userErrors.length > 0) {
      logger.error('setDelegateTokenAction - user errors', userErrors);
    }

    if (delegateAccessToken) {
      await setCookieAction(
        config.cookies.delegateToken,
        delegateAccessToken.accessToken,
        getSecureCookieOptions({ maxAge: expiresIn }),
      );
    }
  } catch (error) {
    logger.error('setDelegateTokenAction', error);
    throw error;
  }
}
