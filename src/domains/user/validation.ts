import { z } from 'zod';

export const userSchema = z.object({
  acceptsMarketing: z.string().optional(),
  company: z.string().optional(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  phone: z.string().optional(),
});

export type UpdateUserInput = z.infer<typeof userSchema>;
