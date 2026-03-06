'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';

import { userFeedback } from '@/core/config/userFeedback';
import { recoverPasswordAction } from '@/domains/auth/actions';
import { useFormStatesEffect } from '@/hooks/useFormStatesEffect';
import type {
  CustomerUserError,
} from '@/infra/shopify/generated/storefront/index';
import Form from '@/ui/components/shared/Form';
import FormFieldError from '@/ui/components/shared/FormFieldError';
import { Button } from '@/ui/primitives/button';
import { Input } from '@/ui/primitives/input';
import { Label } from '@/ui/primitives/label';

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
      error: userFeedback.recover.error,
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
