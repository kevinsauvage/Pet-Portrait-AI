'use server';

import config from '@/core/config';
import { UserService } from '@/modules/user';
import type { FormActionResult } from '@/types/formActions';
import { zodErrorsToFormActionResult } from '@/utils/form-actions';

import { delCookieAction } from './cookiesActions';

import { flattenError } from 'zod';
import { z } from 'zod';

const userSchema = z.object({
  acceptsMarketing: z.string().optional(),
  company: z.string().optional(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  phone: z.string().optional(),
});

type UpdateUserInput = z.infer<typeof userSchema>;

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

export const logoutAction = async () => {
  await delCookieAction(config.cookies.shopifyToken);
  return {
    success: 'Logged out successfully',
  };
};
