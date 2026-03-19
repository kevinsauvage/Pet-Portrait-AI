import { z } from 'zod';

const cartLineUpdateSchema = z.object({
  id: z.string().min(1, 'Line item id is required'),
  quantity: z.number().int().min(0, 'Quantity must be 0 or greater'),
});

const cartLineAttributeSchema = z.object({
  key: z.string().min(1, 'Attribute key is required'),
  value: z.string().min(1, 'Attribute value is required'),
});

const cartLineAddSchema = z.object({
  merchandiseId: z.string().min(1, 'Merchandise id is required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').optional(),
  attributes: z.array(cartLineAttributeSchema).optional(),
});

export const cartLinesOperationSchema = z
  .object({
    operation: z.enum(['update', 'add']).optional(),
    lines: z.array(cartLineUpdateSchema).optional(),
    addLines: z.array(cartLineAddSchema).optional(),
  })
  .superRefine((value, ctx) => {
    if (!value.lines?.length && !value.addLines?.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Request body must include either lines or addLines',
        path: ['lines'],
      });
    }
  });

export type CartLinesOperationInput = z.infer<typeof cartLinesOperationSchema>;
export type CartLineOperation = 'update' | 'add';

export function resolveCartLineOperation(input: CartLinesOperationInput): {
  operation: CartLineOperation;
  lines?: CartLinesOperationInput['lines'];
  addLines?: CartLinesOperationInput['addLines'];
} {
  const operation: CartLineOperation = input.operation ?? (input.addLines ? 'add' : 'update');

  if (operation === 'add') {
    if (!input.addLines?.length) {
      throw new Error('addLines is required when operation is add');
    }
    return { operation, addLines: input.addLines };
  }

  if (!input.lines?.length) {
    throw new Error('lines is required when operation is update');
  }

  return { operation, lines: input.lines };
}

export const cartDiscountCodesSchema = z.object({
  discountCodes: z.array(z.string().min(1, 'Discount code cannot be empty')),
});

export type CartDiscountCodesInput = z.infer<typeof cartDiscountCodesSchema>;

export const cartBuyerIdentitySchema = z.object({
  customerAccessToken: z.string().min(1, 'customerAccessToken is required'),
  user: z
    .object({
      email: z.string().email().optional(),
      phone: z.string().optional(),
    })
    .passthrough(),
  first: z.number().int().nonnegative().optional(),
  last: z.number().int().nonnegative().optional(),
  after: z.string().optional(),
  before: z.string().optional(),
});

export type CartBuyerIdentityInput = z.infer<typeof cartBuyerIdentitySchema>;
