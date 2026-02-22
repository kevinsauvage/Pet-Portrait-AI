'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useSearchParams } from 'next/navigation';

import { userFeedback } from '@/core/config/userFeedback';
import { loginAction } from '@/domains/auth/actions';
import { useFormStatesEffect } from '@/hooks/useFormStatesEffect';
import type { CustomerUserError } from '@/infra/shopify/storefront';
import FormFieldError from '@/ui/components/FormFieldError';
import { Button } from '@/ui/components/ui/button';
import { Input } from '@/ui/components/ui/input';
import { Label } from '@/ui/components/ui/label';

import Form from '../../_components/Form';
import PasswordField from '../../_components/PasswordField';

const LoginButton = () => {
  const status = useFormStatus();
  return (
    <Button type="submit" className="w-full md:w-auto" loading={status.pending}>
      Sign in
    </Button>
  );
};

const LoginForm = () => {
  const searchParameters = useSearchParams();

  // Wrapper function to extract FormData and call typed server action
  const handleSubmit = async (_previousState: unknown, formData: FormData) => {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const redirectUrl = searchParameters.get('redirect') || undefined;

    return loginAction({ email, password, redirectUrl });
  };

  const [states, action, isPending] = useActionState<
    {
      email?: string | string[];
      password?: string | string[];
      customerUserErrors?: CustomerUserError[];
      error?: string;
      success?: string;
    },
    FormData
  >(handleSubmit, {
    customerUserErrors: [],
    email: [],
    error: '',
    password: [],
    success: '',
  });

  useFormStatesEffect({
    states,
    userFeedback: {
      error: userFeedback.login.error,
    },
  });

  return (
    <Form action={action} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="email">Email address</Label>
        <Input
          id="email"
          type="email"
          name="email"
          placeholder="name@company.com"
          required={true}
          autoComplete="username"
          disabled={isPending}
          aria-invalid={!!states.email?.at(-1)}
          aria-describedby={states.email?.at(-1) ? 'email-error' : undefined}
        />
        <FormFieldError error={states.email} fieldId="email" />
      </div>
      <PasswordField
        id="password"
        name="password"
        label="Password"
        placeholder="Your password"
        autoComplete="current-password"
        required={true}
        disabled={isPending}
        error={states.password}
      />
      <LoginButton />
    </Form>
  );
};

export default LoginForm;
