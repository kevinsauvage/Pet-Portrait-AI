import { z } from 'zod';

export const ProductSchema = z.object({
  id: z.string(),
  handle: z.string(),
  title: z.string(),
  description: z.string(),
  descriptionHtml: z.string().optional(),
  images: z.array(z.string()),
  price: z.number(),
  compareAtPrice: z.number().optional(),
  currencyCode: z.string().default('USD'),
  availableForSale: z.boolean(),
  tags: z.array(z.string()),
  productType: z.string(),
  vendor: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Product = z.infer<typeof ProductSchema>;

export const PortraitStyleSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  previewImage: z.string(),
  prompt: z.string(),
});

export type PortraitStyle = z.infer<typeof PortraitStyleSchema>;

export const PortraitProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  variantId: z.string(),
  price: z.number(),
  format: z.enum(['digital', 'canvas', 'poster']),
});

export type PortraitProduct = z.infer<typeof PortraitProductSchema>;
