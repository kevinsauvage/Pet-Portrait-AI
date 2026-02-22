import { z } from 'zod';

export const addressSchema = z.object({
  address1: z.string().min(1, 'Address is required'),
  address2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  company: z.string().optional(),
  country: z.string().min(1, 'Country is required'),
  firstName: z.string().min(1, 'First name is required'),
  id: z.string().optional(),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
  province: z.string().optional(),
  zip: z.string().min(1, 'Zip is required'),
});

export type AddressInput = z.infer<typeof addressSchema>;
