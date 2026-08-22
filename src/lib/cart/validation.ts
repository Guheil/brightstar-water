import { z } from 'zod';

const productIdSchema = z
  .string()
  .min(1)
  .max(80)
  .regex(/^[A-Za-z0-9._:-]+$/, 'Cart product is invalid.');

const cartLineSchema = z.object({
  productId: productIdSchema,
  quantity: z.number().int().min(1).max(100),
}).strict();

export const replaceCustomerCartSchema = z.object({
  items: z.array(cartLineSchema).max(50),
}).strict().superRefine(({ items }, context) => {
  const seen = new Set<string>();
  items.forEach((item, index) => {
    if (seen.has(item.productId)) {
      context.addIssue({
        code: 'custom',
        message: 'Duplicate cart products are not allowed.',
        path: ['items', index, 'productId'],
      });
    }
    seen.add(item.productId);
  });
});
