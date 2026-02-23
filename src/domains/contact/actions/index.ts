'use server';

import type { FormActionResult } from '@/core/types/form-actions';
import { zodErrorsToFormActionResult } from '@/core/utils/form-actions';

import { type ContactInput,contactSchema } from '../validation';

import nodemailer from 'nodemailer';
import { flattenError } from 'zod';

type ContactFieldErrors = {
  email?: string | string[];
  name?: string | string[];
  message?: string | string[];
};

const { EMAIL_ADDRESS, EMAIL_PASSWORD } = process.env;

export async function contactAction(
  input: ContactInput,
): Promise<FormActionResult<ContactFieldErrors> & ContactFieldErrors> {
  const formData = contactSchema.safeParse(input);
  if (!formData.success) {
    const { fieldErrors } = flattenError(formData.error);
    return { ...zodErrorsToFormActionResult(formData.error), ...(fieldErrors as ContactFieldErrors) };
  }

  const { name, email, message } = formData.data;

  const transporter = nodemailer.createTransport({
    auth: { pass: EMAIL_PASSWORD, user: EMAIL_ADDRESS },
    service: 'gmail',
  });

  const mailOptions = {
    from: { address: email, name },
    subject: 'Request ECommerce _ {name shop}',
    text: message,
    to: 'kevinsauvage@outlook.com',
  };

  try {
    await transporter.sendMail(mailOptions);
    return {
      success: 'Email sent successfully',
    };
  } catch {
    return {
      error: 'An error occurred while sending the email',
    };
  }
}
