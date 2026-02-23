import { z } from 'zod';

const lineItemSchema = z
  .object({
    id: z.number(),
  })
  .passthrough();

const shippingAddressSchema = z
  .object({
    first_name: z.string().min(1, 'First name is required'),
    last_name: z.string().min(1, 'Last name is required'),
    address1: z.string().min(1, 'Address1 is required'),
    address2: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    province: z.string().min(1, 'Province is required'),
    country: z.string().min(1, 'Country is required'),
    zip: z.string().min(1, 'Zip is required'),
  })
  .passthrough();

export const gelatoFulfillmentRequestSchema = z.object({
  orderId: z.string().min(1, 'orderId is required'),
  lineItems: z.array(lineItemSchema).min(1, 'At least one line item is required'),
  shippingAddress: shippingAddressSchema,
});

export type GelatoFulfillmentRequestInput = z.infer<typeof gelatoFulfillmentRequestSchema>;
