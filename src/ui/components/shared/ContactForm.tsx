'use client';

import { useActionState, useMemo } from 'react';
import { useFormStatus } from 'react-dom';

import { contactAction } from '@/domains/contact/actions';
import { useFormStatesEffect } from '@/hooks/useFormStatesEffect';
import type {
  CustomerUserError,
} from '@/infra/shopify/generated/storefront/index';
import FormFieldError from '@/ui/components/shared/FormFieldError';
import { Button } from '@/ui/primitives/button';
import { Input } from '@/ui/primitives/input';
import { Label } from '@/ui/primitives/label';
import { Textarea } from '@/ui/primitives/textarea';

const SubmitButton = () => {
  const status = useFormStatus();
  return (
    <Button type="submit" className="h-11 w-full font-semibold sm:w-auto" loading={status.pending}>
      Send message
    </Button>
  );
};

type ContactFormState = {
  email?: string | string[];
  message?: string | string[];
  name?: string | string[];
  customerUserErrors?: CustomerUserError[];
  error?: string;
  success?: string;
};

function mapContactSafeActionState(raw: unknown): ContactFormState {
  if (!raw || typeof raw !== 'object') {
    return {};
  }

  const record = raw as Record<string, unknown>;
  const {validationErrors} = record;
  const fieldErrors =
    validationErrors &&
    typeof validationErrors === 'object' &&
    validationErrors !== null &&
    'fieldErrors' in validationErrors
      ? (validationErrors as { fieldErrors: Record<string, string[] | undefined> }).fieldErrors
      : undefined;

  const data =
    record.data && typeof record.data === 'object' && record.data !== null
      ? (record.data as Record<string, unknown>)
      : undefined;

  return {
    email: fieldErrors?.email,
    message: fieldErrors?.message,
    name: fieldErrors?.name,
    error:
      typeof record.serverError === 'string'
        ? record.serverError
        : typeof data?.error === 'string'
          ? data.error
          : undefined,
    success: typeof data?.success === 'string' ? data.success : undefined,
    customerUserErrors: record.customerUserErrors as CustomerUserError[] | undefined,
  };
}

const ContactForm = () => {
  const [rawState, formAction, isPending] = useActionState(contactAction, {});
  const states = useMemo(() => mapContactSafeActionState(rawState), [rawState]);

  useFormStatesEffect({
    states,
    userFeedback: {
      error: 'An error occurred while sending the email.',
      success: 'Email sent successfully',
    },
  });

  return (
    <form
      action={formAction}
      title="Contact Us"
      className="mx-auto w-full max-w-md space-y-5 px-4 py-8 md:px-6 md:py-12"
    >
      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-body-sm font-medium">
          Email address
        </Label>
        <Input
          id="email"
          name="email"
          placeholder="name@company.com"
          required={true}
          disabled={isPending}
          className="h-11"
          aria-invalid={!!states.email?.at(-1)}
          aria-describedby={states.email?.at(-1) ? 'email-error' : undefined}
        />
        <FormFieldError error={states.email} fieldId="email" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="name" className="text-body-sm font-medium">
          Name
        </Label>
        <Input
          placeholder="Your name"
          name="name"
          id="name"
          required={true}
          disabled={isPending}
          className="h-11"
          aria-invalid={!!states.name?.at(-1)}
          aria-describedby={states.name?.at(-1) ? 'name-error' : undefined}
        />
        <FormFieldError error={states.name} fieldId="name" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="message" className="text-body-sm font-medium">
          Message
        </Label>
        <Textarea
          placeholder="Your message"
          name="message"
          id="message"
          required={true}
          disabled={isPending}
          className="min-h-[120px] resize-none"
          aria-invalid={!!states.message?.at(-1)}
          aria-describedby={states.message?.at(-1) ? 'message-error' : undefined}
        />
        <FormFieldError error={states.message} fieldId="message" />
      </div>
      <SubmitButton />
    </form>
  );
};

export default ContactForm;
