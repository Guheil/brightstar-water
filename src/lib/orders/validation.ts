import { z } from 'zod';

const plainText = (max: number, min = 1) =>
  z.string().trim().min(min).max(max).refine((value) => !/[<>\u0000-\u001f\u007f]/.test(value), 'Use plain text only.');

export const entityUuidSchema = z.string().uuid();

export const orderScheduleSchema = z.object({
  date: z.string().regex(/^20\d{2}-\d{2}-\d{2}$/),
  windowLabel: plainText(80, 2),
  mode: z.enum(['earliest_available', 'preferred']).optional(),
  estimatedDate: z.string().regex(/^20\d{2}-\d{2}-\d{2}$/).optional(),
  estimatedWindowLabel: plainText(80, 2).optional(),
  preferredDate: z.string().regex(/^20\d{2}-\d{2}-\d{2}$/).optional(),
  preferredWindowLabel: plainText(80, 2).optional(),
}).strict();

export const placeOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.string().trim().min(4).max(120).regex(/^[A-Za-z0-9-]+$/),
    quantity: z.number().int().min(1).max(100),
  }).strict()).min(1).max(50).superRefine((items, ctx) => {
    const ids = new Set<string>();
    for (const item of items) {
      if (ids.has(item.productId)) {
        ctx.addIssue({ code: 'custom', message: 'Duplicate products are not allowed.' });
        return;
      }
      ids.add(item.productId);
    }
  }),
  deliveryAddressId: entityUuidSchema,
  deliverySchedule: orderScheduleSchema,
  paymentMethod: z.enum(['cod', 'gcash']),
  customerNote: plainText(500).optional(),
  idempotencyKey: entityUuidSchema,
}).strict();

export const cancellationRequestSchema = z.object({ reason: plainText(500, 4) }).strict();
export const assignmentSchema = z.object({ delivererId: entityUuidSchema }).strict();
export const paymentVerificationSchema = z.object({ reference: plainText(120, 2).optional() }).strict();
export const cancellationResolutionSchema = z.object({
  decision: z.enum(['approve', 'reject']),
  note: plainText(500).optional(),
}).strict();
export const refundUpdateSchema = z.object({
  status: z.enum(['pending', 'processing', 'refunded', 'rejected']),
  note: plainText(500).optional(),
}).strict();
export const deliveryFailureSchema = z.object({
  reason: z.enum(['customer_unavailable','incorrect_address','customer_requested_reschedule','payment_issue','other']),
  note: plainText(500).optional(),
}).strict();
export const deliveryCompletionSchema = z.object({
  cashReceivedCentavos: z.number().int().min(0).max(1_000_000_000).optional(),
  note: plainText(500).optional(),
}).strict();

export const loyaltyAdjustmentSchema = z.object({ customerId: entityUuidSchema, pointsDelta: z.number().int().min(-100000).max(100000).refine((value) => value !== 0), reason: plainText(500, 4) }).strict();
