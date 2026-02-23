'use server';

import config from '@/core/config';
import type { FormActionResult } from '@/core/types/form-actions';
import { zodErrorsToFormActionResult } from '@/core/utils/form-actions';
import { delCookieAction } from '@/lib/cookies/actions';

import { UserService } from '../services/user.service';
import { type UpdateUserInput,userSchema } from '../validation';

import { flattenError } from 'zod';

type UpdateUserFieldErrors = {
  email?: string | string[];
  firstName?: string | string[];
  lastName?: string | string[];
  phone?: string | string[];
  company?: string | string[];
  acceptsMarketing?: string | string[];
};

export async function updateUserAction(
  input: UpdateUserInput,
): Promise<FormActionResult<UpdateUserFieldErrors> & UpdateUserFieldErrors> {
  const result = userSchema.safeParse(input);

  if (!result?.success) {
    const { fieldErrors } = flattenError(result.error);
    return { ...zodErrorsToFormActionResult(result.error), ...(fieldErrors as UpdateUserFieldErrors) };
  }

  const { email, firstName, lastName, acceptsMarketing, company, phone } = result.data;

  const serviceResult = await UserService.updateUser({
    email,
    firstName,
    lastName,
    acceptsMarketing,
    company,
    phone,
  });

  if ('error' in serviceResult) {
    return serviceResult;
  }

  return {
    success: serviceResult.success || 'User updated successfully',
  };
}

export async function logoutAction() {
  await delCookieAction(config.cookies.shopifyToken);
  return {
    success: 'Logged out successfully',
  };
}
