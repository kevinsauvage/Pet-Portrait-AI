'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';

import { contactAction } from '@/domains/contact/actions';
import { useFormStatesEffect } from '@/hooks/useFormStatesEffect';
import type { CustomerUserError } from '@/infra/shopify/storefront';
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

const ContactForm = () => {
  const handleSubmit = async (_previousState: unknown, formData: FormData) => {
    const email = formData.get('email') as string;
    const name = formData.get('name') as string;
    const message = formData.get('message') as string;
    return contactAction({ email, message, name });
  };

  const [states, action, isPending] = useActionState<
    {
      email?: string | string[];
      message?: string | string[];
      name?: string | string[];
      customerUserErrors?: CustomerUserError[];
      error?: string;
      success?: string;
    },
    FormData
  >(handleSubmit, {
    email: '',
    message: '',
    name: '',
  });

  useFormStatesEffect({
    states,
    userFeedback: {
      error: 'An error occurred while sending the email.',
      success: 'Email sent successfully',
    },
  });

  return (
    <form
      action={action}
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
