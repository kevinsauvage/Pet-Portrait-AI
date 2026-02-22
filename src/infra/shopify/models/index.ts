import { z } from 'zod';

export const ShopifyMoneySchema = z.object({
  amount: z.string(),
  currencyCode: z.string(),
});

export const ShopifyImageSchema = z.object({
  id: z.string().optional(),
  src: z.string().url(),
  altText: z.string().nullable().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
});

export type ShopifyMoney = z.infer<typeof ShopifyMoneySchema>;
export type ShopifyImage = z.infer<typeof ShopifyImageSchema>;
