'use server';

import { redirect } from 'next/navigation';

import config from '@/core/config';
import { userFeedback } from '@/data/userFeedback';
import { AuthService } from '@/modules/auth';
import type { FormActionResult } from '@/types/formActions';
import { zodErrorsToFormActionResult } from '@/utils/form-actions';

import { flattenError } from 'zod';
import { z } from 'zod';

const registerSchema = z
  .object({
    email: z.string().email(),
    firstName: z.string(),
    lastName: z.string(),
    password: z.string().min(6),
    passwordConfirm: z.string().min(6),
    redirectUrl: z.string().optional(),
  })
  .superRefine(({ passwordConfirm, password }, context) => {
    if (passwordConfirm !== password) {
      context.addIssue({
        code: 'custom',
        message: userFeedback.passwordDifferent,
        path: ['passwordConfirm'],
      });
    }
  });

type RegisterInput = z.infer<typeof registerSchema>;

type RegisterFieldErrors = {
  email?: string | string[];
  firstName?: string | string[];
  lastName?: string | string[];
  password?: string | string[];
  passwordConfirm?: string | string[];
};

export async function registerAction(
  input: RegisterInput,
): Promise<FormActionResult<RegisterFieldErrors> & RegisterFieldErrors> {
  const result = registerSchema.safeParse(input);
  if (!result?.success) {
    const { fieldErrors } = flattenError(result.error);
    return { ...zodErrorsToFormActionResult(result.error), ...(fieldErrors as RegisterFieldErrors) };
  }

  const { email, password, firstName, lastName } = result.data;

  const serviceResult = await AuthService.register({
    email,
    password,
    firstName,
    lastName,
  });

  if ('error' in serviceResult) {
    return serviceResult;
  }

  redirect(config.routes.account);
}

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  redirectUrl: z.string().optional(),
});

type LoginInput = z.infer<typeof loginSchema>;

type LoginFieldErrors = {
  email?: string | string[];
  password?: string | string[];
};

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

  if ('error' in serviceResult) {
    return serviceResult;
  }

  redirect(redirectUrl || config.routes.account);
}

const recoverSchema = z.object({
  email: z.string().email(),
});

type RecoverPasswordInput = z.infer<typeof recoverSchema>;

type RecoverFieldErrors = {
  email?: string | string[];
};

export const recoverPasswordAction = async (
  input: RecoverPasswordInput,
): Promise<FormActionResult<RecoverFieldErrors> & RecoverFieldErrors> => {
  const result = recoverSchema.safeParse(input);
  if (!result.success) {
    const { fieldErrors } = flattenError(result.error);
    return { ...zodErrorsToFormActionResult(result.error), ...(fieldErrors as RecoverFieldErrors) };
  }

  const { email } = result.data;

  const serviceResult = await AuthService.recoverPassword({ email });

  if ('error' in serviceResult) {
    return serviceResult;
  }

  return { success: userFeedback.sendRecoverEmail.success };
};

const resetSchema = z.object({
  password: z.string().min(8, { message: userFeedback.passwordLength }),
  resetUrl: z.string(),
});

type ResetPasswordInput = z.infer<typeof resetSchema>;

type ResetFieldErrors = {
  password?: string | string[];
};

export const resetPasswordAction = async (
  input: ResetPasswordInput,
): Promise<FormActionResult<ResetFieldErrors> & ResetFieldErrors> => {
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

  if ('error' in serviceResult) {
    const errorMessage = serviceResult.error || userFeedback.resetPassword.error;
    return { error: errorMessage };
  }

  redirect(config.routes.account);
};

