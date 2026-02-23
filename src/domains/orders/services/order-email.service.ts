import { sendEmail } from '@/infra/email';

export async function sendOrderConfirmation(
  email: string,
  orderNumber: number,
): Promise<void> {
  await sendEmail({
    to: email,
    subject: `Order #${orderNumber} Confirmed - PetPortrait AI`,
    html: `
      <h1>Thank you for your order!</h1>
      <p>Your order #${orderNumber} has been confirmed and is being processed.</p>
      <p>We'll send you another email when your portrait is ready.</p>
    `,
  });
}
