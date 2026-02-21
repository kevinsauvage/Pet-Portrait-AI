'use server';

import type { FormActionResult } from '@/types/formActions';
import { zodErrorsToFormActionResult } from '@/utils/form-actions';

import nodemailer from 'nodemailer';
import { flattenError } from 'zod';
import { z } from 'zod';

const { EMAIL_ADDRESS, EMAIL_PASSWORD } = process.env;

const contactSchema = z.object({
  email: z.string().email(),
  message: z
    .string()
    .min(3, {
      message: 'Message must be at least 3 characters long',
    })
    .max(255, {
      message: 'Message must be at most 255 characters long',
    }),
  name: z
    .string()
    .min(3, {
      message: 'Name must be at least 3 characters long',
    })
    .max(255, {
      message: 'Name must be at most 255 characters long',
    }),
});

type ContactInput = z.infer<typeof contactSchema>;

type ContactFieldErrors = {
  email?: string | string[];
  name?: string | string[];
  message?: string | string[];
};

export const contactAction = async (
  input: ContactInput,
): Promise<FormActionResult<ContactFieldErrors> & ContactFieldErrors> => {
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
};
