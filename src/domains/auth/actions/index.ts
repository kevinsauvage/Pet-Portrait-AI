'use server';

import { redirect } from 'next/navigation';

import config from '@/core/config';
import { userFeedback } from '@/core/config/userFeedback';
import type { FormActionResult } from '@/core/types/form-actions';
import { zodErrorsToFormActionResult } from '@/core/utils/form-actions';

import { AuthService } from '../services/auth.service';
import {
  type LoginInput,
  loginSchema,
  type RecoverPasswordInput,
  recoverSchema,
  type RegisterInput,
  registerSchema,
  type ResetPasswordInput,
  resetSchema,
} from '../validation';

import { flattenError } from 'zod';

type RegisterFieldErrors = {
  email?: string | string[];
  firstName?: string | string[];
  lastName?: string | string[];
  password?: string | string[];
  passwordConfirm?: string | string[];
};

type LoginFieldErrors = {
  email?: string | string[];
  password?: string | string[];
};

type RecoverFieldErrors = {
  email?: string | string[];
};

type ResetFieldErrors = {
  password?: string | string[];
};

export async function registerAction(
  input: RegisterInput,
): Promise<FormActionResult<RegisterFieldErrors> & RegisterFieldErrors> {
  const result = registerSchema.safeParse(input);
  if (!result?.success) {
    const { fieldErrors } = flattenError(result.error);
    return {
      ...zodErrorsToFormActionResult(result.error),
      ...(fieldErrors as RegisterFieldErrors),
    };
  }

  const { email, password, firstName, lastName, redirectUrl } = result.data;

  const serviceResult = await AuthService.register({
    email,
    password,
    firstName,
    lastName,
  });

  if (
    'error' in serviceResult ||
    'customerUserErrors' in serviceResult ||
    'userErrors' in serviceResult
  ) {
    return serviceResult;
  }

  redirect(redirectUrl || config.routes.account);
}

export async function loginAction(
  input: LoginInput,
): Promise<FormActionResult<LoginFieldErrors> & LoginFieldErrors> {
  const result = loginSchema.safeParse(input);
  if (!result?.success) {
    const { fieldErrors } = flattenError(result.error);
    const loginFieldErrors = fieldErrors as LoginFieldErrors;
    return { ...zodErrorsToFormActionResult(result.error), ...loginFieldErrors };
  }

  const { email, password, redirectUrl } = result.data;

  const serviceResult = await AuthService.login({ email, password });

  if (
    'error' in serviceResult ||
    'customerUserErrors' in serviceResult ||
    'userErrors' in serviceResult
  ) {
    return serviceResult;
  }

  redirect(redirectUrl || config.routes.account);
}

export async function recoverPasswordAction(
  input: RecoverPasswordInput,
): Promise<FormActionResult<RecoverFieldErrors> & RecoverFieldErrors> {
  const result = recoverSchema.safeParse(input);
  if (!result.success) {
    const { fieldErrors } = flattenError(result.error);
    return { ...zodErrorsToFormActionResult(result.error), ...(fieldErrors as RecoverFieldErrors) };
  }

  const { email } = result.data;

  const serviceResult = await AuthService.recoverPassword({ email });

  if (
    'error' in serviceResult ||
    'customerUserErrors' in serviceResult ||
    'userErrors' in serviceResult
  ) {
    return serviceResult;
  }

  return { success: userFeedback.sendRecoverEmail.success };
}

export async function resetPasswordAction(
  input: ResetPasswordInput,
): Promise<FormActionResult<ResetFieldErrors> & ResetFieldErrors> {
  const result = resetSchema.safeParse(input);
  if (!result.success) {
    const { fieldErrors } = flattenError(result.error);
    return { ...zodErrorsToFormActionResult(result.error), ...(fieldErrors as ResetFieldErrors) };
  }

  const { password, resetUrl } = result.data;

  const serviceResult = await AuthService.resetPassword({
    password,
    resetToken: resetUrl,
  });

  if (
    'error' in serviceResult ||
    'customerUserErrors' in serviceResult ||
    'userErrors' in serviceResult
  ) {
    const errorMessage = serviceResult.error || userFeedback.resetPassword.error;
    return { ...(serviceResult as ResetFieldErrors), error: errorMessage };
  }

  redirect(config.routes.account);
}
