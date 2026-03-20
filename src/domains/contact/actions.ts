'use server';

import { headers } from 'next/headers';

import siteMetadata from '@/core/config/siteMetadata';
import { logger } from '@/core/utils/logger.server';
import { getClientContext } from '@/core/utils/request-identity';
import { env } from '@/env';
import { sendEmail } from '@/infra/email';
import { checkRateLimit } from '@/infra/rate-limit/rate-limit';
import { actionClient } from '@/lib/safe-action';

import { contactSchema } from './validation';

import { z } from 'zod';

const contactFormDataSchema = z
  .custom<FormData>((value) => value instanceof FormData, { message: 'Expected FormData' })
  .transform((fd) => ({
    email: String(fd.get('email') ?? ''),
    message: String(fd.get('message') ?? ''),
    name: String(fd.get('name') ?? ''),
  }))
  .pipe(contactSchema);

export const contactAction = actionClient
  .inputSchema(contactFormDataSchema)
  .stateAction(async ({ parsedInput }) => {
    const headersList = await headers();
    const { ip } = getClientContext(headersList);
    const rateLimit = await checkRateLimit(ip, {
      prefix: 'contact',
      maxRequests: 3,
      windowMs: 10 * 60 * 1000,
    });

    if (!rateLimit.allowed) {
      return {
        error: `Too many requests. Please try again after ${rateLimit.retryAfter} seconds.`,
      };
    }

    const { name, email, message } = parsedInput;
    const recipientEmail = env.CONTACT_EMAIL ?? siteMetadata.email;

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
      logger.error('Error sending email', { context: 'contact-action', error });
      return {
        error: 'An error occurred while sending the email',
      };
    }
  });
