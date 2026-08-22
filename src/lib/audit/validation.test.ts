import { describe, expect, it } from 'vitest';
import { auditEventIdSchema, auditListQuerySchema, readAuditQuery } from './validation';

describe('activity-history validation', () => {
  it('accepts bounded filters and rejects unknown or duplicated query parameters', () => {
    const params = new URLSearchParams('category=accounts&result=success&limit=25&q=Maria');
    const input = readAuditQuery(params);
    expect(input).not.toBeNull();
    expect(auditListQuerySchema.safeParse(input).success).toBe(true);

    expect(readAuditQuery(new URLSearchParams('category=accounts&category=security'))).toBeNull();
    expect(readAuditQuery(new URLSearchParams('debug=true'))).toBeNull();
  });

  it('rejects oversized pages and reversed date ranges', () => {
    expect(auditListQuerySchema.safeParse({ limit: '500' }).success).toBe(false);
    expect(
      auditListQuerySchema.safeParse({ from: '2026-08-22', to: '2026-08-20', limit: '25' }).success,
    ).toBe(false);
  });

  it('requires UUID event identifiers', () => {
    expect(auditEventIdSchema.safeParse('not-an-id').success).toBe(false);
    expect(auditEventIdSchema.safeParse('123e4567-e89b-12d3-a456-426614174000').success).toBe(true);
  });
});
