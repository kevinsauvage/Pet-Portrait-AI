'use server';

import { headers } from 'next/headers';

import siteMetadata from '@/core/config/siteMetadata';
import type { FormActionResult } from '@/core/types/form-actions';
import { zodErrorsToFormActionResult } from '@/core/utils/form-actions';
import { getClientContext } from '@/core/utils/request-identity';
import { sendEmail } from '@/infra/email';
import { checkRateLimit } from '@/infra/rate-limit/rate-limit';

import { type ContactInput, contactSchema } from '../validation';

import { logger } from '@sentry/nextjs';
import { flattenError } from 'zod';

type ContactFieldErrors = {
  email?: string | string[];
  name?: string | string[];
  message?: string | string[];
};

export async function contactAction(
  input: ContactInput,
): Promise<FormActionResult<ContactFieldErrors> & ContactFieldErrors> {
  const formData = contactSchema.safeParse(input);
  if (!formData.success) {
    const { fieldErrors } = flattenError(formData.error);
    return {
      ...zodErrorsToFormActionResult(formData.error),
      ...(fieldErrors as ContactFieldErrors),
    };
  }

  // Rate limit check
  const headersList = await headers();
  const { ip } = getClientContext(headersList);
  const rateLimit = await checkRateLimit(ip, {
    prefix: 'contact',
    maxRequests: 3,
    windowMs: 10 * 60 * 1000, // 10 minutes
  });

  if (!rateLimit.allowed) {
    return {
      error: `Too many requests. Please try again after ${rateLimit.retryAfter} seconds.`,
    };
  }

  const { name, email, message } = formData.data;

  // Use CONTACT_EMAIL env var if set, otherwise fall back to siteMetadata.email
  const recipientEmail = process.env.CONTACT_EMAIL || siteMetadata.email;

  const subject = `Contact Request from ${name} - ${siteMetadata.companyName}`;

  const htmlContent = `
    <h2>New Contact Form Submission</h2>
    <p><strong>From:</strong> ${name} (${email})</p>
    <p><strong>Message:</strong></p>
    <p>${message.replace(/\n/g, '<br>')}</p>
  `;

  const textContent = `
New Contact Form Submission

From: ${name} (${email})

Message:
${message}
  `;

  try {
    await sendEmail({
      to: recipientEmail,
      subject,
      html: htmlContent,
      text: textContent,
      replyTo: email,
    });
    return {
      success: 'Email sent successfully',
    };
  } catch (error) {
    logger.error('Error sending email', { error, context: 'contact-action' });
    return {
      error: 'An error occurred while sending the email',
    };
  }
}
