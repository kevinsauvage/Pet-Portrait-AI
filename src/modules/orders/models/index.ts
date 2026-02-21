import { z } from 'zod';

export const OrderLineItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  quantity: z.number().int().positive(),
  price: z.number(),
  imageUrl: z.string().optional(),
  variantTitle: z.string().optional(),
});

export const OrderSchema = z.object({
  id: z.string(),
  orderNumber: z.number(),
  email: z.string().email(),
  totalPrice: z.number(),
  currencyCode: z.string(),
  financialStatus: z.string(),
  fulfillmentStatus: z.string(),
  lineItems: z.array(OrderLineItemSchema),
  createdAt: z.string(),
  shippingAddress: z
    .object({
      address1: z.string(),
      city: z.string(),
      country: z.string(),
      zip: z.string(),
    })
    .optional(),
  trackingNumber: z.string().optional(),
  trackingUrl: z.string().optional(),
});

export type Order = z.infer<typeof OrderSchema>;
export type OrderLineItem = z.infer<typeof OrderLineItemSchema>;
