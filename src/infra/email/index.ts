import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendEmail(options: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  await transporter.sendMail({
    from: process.env.SMTP_FROM ?? 'noreply@petportraitai.com',
    to: options.to,
    subject: options.subject,
    html: options.html,
  });
}

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
