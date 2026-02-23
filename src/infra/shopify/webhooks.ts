import { createHmac } from 'crypto';

export const verifyShopifyWebhook = (
  body: string,
  hmacHeader: string | null,
  secret: string | undefined,
): boolean => {
  if (!secret || !hmacHeader) return false;

  const hash = createHmac('sha256', secret).update(body, 'utf8').digest('base64');
  return hash === hmacHeader;
};
