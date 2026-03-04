'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { useSearchParams } from 'next/navigation';

import { userFeedback } from '@/core/config/userFeedback';
import { registerAction } from '@/domains/auth/actions';
import { useFormStatesEffect } from '@/hooks/useFormStatesEffect';
import type { CustomerUserError } from '@/infra/shopify/storefront';
import PasswordField from '@/ui/components/auth/PasswordField';
import Form from '@/ui/components/shared/Form';
import FormFieldError from '@/ui/components/shared/FormFieldError';
import { Button } from '@/ui/primitives/button';
import { Input } from '@/ui/primitives/input';
import { Label } from '@/ui/primitives/label';

const SubmitButton = () => {
  const status = useFormStatus();
  return (
    <Button type="submit" loading={status.pending}>
      Create account
    </Button>
  );
};

const RegisterForm = () => {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') ?? undefined;

  const handleSubmit = async (_previousState: unknown, formData_: FormData) => {
    const email = formData_.get('email') as string;
    const firstName = formData_.get('firstName') as string;
    const lastName = formData_.get('lastName') as string;
    const password = formData_.get('password') as string;
    const passwordConfirm = formData_.get('passwordConfirm') as string;

    return registerAction({ email, firstName, lastName, password, passwordConfirm, redirectUrl });
  };
  const initialStates = {
    email: '',
    firstName: '',
    lastName: '',
    name: '',
    password: '',
    passwordConfirm: '',
  };
  const [formData, setFormData] = useState(initialStates);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value || '' }));
  };

  const [states, action, isPending] = useActionState<
    {
      email?: string | string[];
      firstName?: string | string[];
      lastName?: string | string[];
      name?: string | string[];
      password?: string | string[];
      passwordConfirm?: string | string[];
      error?: string;
      username?: string | string[];
      company?: string | string[];
      customerUserErrors?: CustomerUserError[];
      userErrors?: Array<{ message: string }>;
    },
    FormData
  >(handleSubmit, initialStates);

  useFormStatesEffect({
    states,
    userFeedback: {
      error: userFeedback.register.error,
    },
  });

  return (
    <Form action={action} autoComplete="off" className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="email">Email address</Label>
        <Input
          id="email"
          type="email"
          name="email"
          autoComplete="off"
          placeholder="name@company.com"
          required={true}
          onChange={handleChange}
          value={formData.email}
          disabled={isPending}
          aria-invalid={!!states.email?.at(-1)}
          aria-describedby={states.email?.at(-1) ? 'email-error' : undefined}
        />
        <FormFieldError error={states.email} fieldId="email" />
      </div>
      <div className="space-y-2">
        <PasswordField
          id="password"
          name="password"
          label="Password"
          placeholder="Create a password"
          autoComplete="new-password"
          required={true}
          onChange={handleChange}
          value={formData.password}
          disabled={isPending}
          error={states.password}
        />
      </div>

      <div className="space-y-2">
        <PasswordField
          id="passwordConfirm"
          name="passwordConfirm"
          label="Confirm password"
          placeholder="Repeat your password"
          autoComplete="new-password"
          required={true}
          onChange={handleChange}
          value={formData.passwordConfirm}
          disabled={isPending}
          error={states.passwordConfirm}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="firstName">First name</Label>
        <Input
          placeholder="John"
          type="text"
          name="firstName"
          id="firstName"
          autoComplete="off"
          onChange={handleChange}
          value={formData.firstName}
          disabled={isPending}
          aria-invalid={!!states.firstName?.at(-1)}
          aria-describedby={states.firstName?.at(-1) ? 'firstName-error' : undefined}
        />
        <FormFieldError error={states.firstName} fieldId="firstName" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="lastName">Last name</Label>
        <Input
          placeholder="Doe"
          type="text"
          name="lastName"
          id="lastName"
          autoComplete="off"
          onChange={handleChange}
          value={formData.lastName}
          disabled={isPending}
          aria-invalid={!!states.lastName?.at(-1)}
          aria-describedby={states.lastName?.at(-1) ? 'lastName-error' : undefined}
        />
        <FormFieldError error={states.lastName} fieldId="lastName" />
      </div>
      <SubmitButton />
    </Form>
  );
};

export default RegisterForm;
