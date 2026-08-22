import { z } from 'zod';
import { AUDIT_CATEGORIES, AUDIT_RESULTS } from './types';

const optionalQueryText = z.preprocess(
  (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
  z.string().trim().max(80, 'Search is too long.').optional(),
);

const optionalValue = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess(
    (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
    schema.optional(),
  );

const dateOnlySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use a valid date.');

export const auditListQuerySchema = z
  .object({
    actorId: optionalValue(z.string().uuid()),
    category: optionalValue(z.enum(AUDIT_CATEGORIES)),
    cursor: optionalValue(z.string().max(512)),
    from: optionalValue(dateOnlySchema),
    limit: z.preprocess(
      (value) => (value === undefined || value === '' ? 25 : value),
      z.coerce.number().int().min(1).max(50),
    ),
    q: optionalQueryText,
    result: optionalValue(z.enum(AUDIT_RESULTS)),
    to: optionalValue(dateOnlySchema),
  })
  .strict()
  .superRefine((value, context) => {
    if (value.from && value.to && value.from > value.to) {
      context.addIssue({
        code: 'custom',
        message: 'The start date must be before the end date.',
        path: ['from'],
      });
    }
  });

export const auditEventIdSchema = z.string().uuid();

export function readAuditQuery(searchParams: URLSearchParams): Record<string, string | undefined> | null {
  const allowed = new Set(['actorId', 'category', 'cursor', 'from', 'limit', 'q', 'result', 'to']);
  const result: Record<string, string | undefined> = {};

  for (const key of searchParams.keys()) {
    if (!allowed.has(key) || searchParams.getAll(key).length !== 1) return null;
    result[key] = searchParams.get(key) ?? undefined;
  }

  return result;
}
