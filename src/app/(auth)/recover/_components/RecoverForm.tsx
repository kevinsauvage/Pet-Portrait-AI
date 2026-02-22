'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';

import { recoverPasswordAction } from '@/domains/auth/actions';
import { useFormStatesEffect } from '@/hooks/useFormStatesEffect';
import type { CustomerUserError } from '@/infra/shopify/storefront';
import FormFieldError from '@/ui/components/FormFieldError';
import { Button } from '@/ui/components/ui/button';
import { Input } from '@/ui/components/ui/input';
import { Label } from '@/ui/components/ui/label';

import Form from '@/ui/components/Form';

const SubmitButton = () => {
  const status = useFormStatus();
  return (
    <Button type="submit" loading={status.pending}>
      Send reset link
    </Button>
  );
};

const RecoverForm = () => {
  const handleSubmit = async (_previousState: unknown, formData: FormData) => {
    const email = formData.get('email') as string;
    return recoverPasswordAction({ email });
  };

  const [states, action, isPending] = useActionState<
    {
      email?: string | string[];
      error?: string;
      customerUserErrors?: CustomerUserError[];
      success?: string;
    },
    FormData
  >(handleSubmit, {
    email: '',
  });

  useFormStatesEffect({
    states,
    userFeedback: {
      error: 'An error occurred while recovering the password.',
    },
  });

  return (
    <Form action={action} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="email">Email address</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="name@company.com"
          required={true}
          disabled={isPending}
          aria-invalid={!!states.email?.at(-1)}
          aria-describedby={states.email?.at(-1) ? 'email-error' : undefined}
        />
        <p className="text-body-sm text-secondary">
          We&apos;ll email you a secure link to reset your password.
        </p>
        <FormFieldError error={states.email} fieldId="email" />
      </div>

      <SubmitButton />
    </Form>
  );
};

export default RecoverForm;
