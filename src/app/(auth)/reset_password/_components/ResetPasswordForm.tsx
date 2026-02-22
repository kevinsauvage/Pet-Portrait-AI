'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';

import { userFeedback } from '@/core/config/userFeedback';
import { resetPasswordAction } from '@/domains/auth/actions';
import { useFormStatesEffect } from '@/hooks/useFormStatesEffect';
import { Button } from '@/ui/components/ui/button';

import Form from '../../_components/Form';
import PasswordField from '../../_components/PasswordField';

const initialStates = {
  password: '',
};

const ResetButton = () => {
  const status = useFormStatus();
  return (
    <Button type="submit" loading={status.pending}>
      Reset password
    </Button>
  );
};

const ResetForm = ({ resetUrl }: { resetUrl: string }) => {
  const [formData, setFormData] = useState(initialStates);

  const handleSubmit = async (_previousState: unknown, formData_: FormData) => {
    const password = formData_.get('password') as string;
    return resetPasswordAction({ password, resetUrl });
  };

  const [states, action, isPending] = useActionState<
    {
      password?: string | string[];
      resetUrl?: string | string[];
      customerUserErrors?: { message?: string }[];
      error?: string;
    },
    FormData
  >(handleSubmit, initialStates);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value || '' }));
  };

  useFormStatesEffect({
    states,
    userFeedback: {
      error: userFeedback.resetPassword.error,
    },
  });

  return (
    <Form action={action} autoComplete="off" className="space-y-5">
      <PasswordField
        id="password"
        name="password"
        label="New password"
        placeholder="Create a new password"
        autoComplete="new-password"
        required={true}
        onChange={handleChange}
        value={formData.password}
        disabled={isPending}
        error={states.password}
      />
      <p className="text-body-sm text-secondary">
        Use at least 8 characters. Consider mixing letters, numbers, and symbols.
      </p>
      <ResetButton />
    </Form>
  );
};

export default ResetForm;
