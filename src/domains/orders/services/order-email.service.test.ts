import { sendOrderConfirmation } from './order-email.service';

import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/infra/email', () => ({
  sendEmail: vi.fn().mockResolvedValue(undefined),
}));

const { sendEmail } = await import('@/infra/email');

describe('order-email.service', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('sends confirmation email with order number', async () => {
    await sendOrderConfirmation('customer@example.com', 1001);
    expect(sendEmail).toHaveBeenCalledWith({
      to: 'customer@example.com',
      subject: 'Order #1001 Confirmed - PetPortrait AI',
      html: expect.stringContaining('1001'),
    });
  });
});
