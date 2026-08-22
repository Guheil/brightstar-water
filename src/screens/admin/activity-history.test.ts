import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (relative: string) => fs.readFileSync(path.join(process.cwd(), relative), 'utf8');

const migration = read('supabase/migrations/202608220005_activity_audit_ledger.sql');
const listRoute = read('src/app/api/admin/activity-history/route.ts');
const detailRoute = read('src/app/api/admin/activity-history/[eventId]/route.ts');
const accountRoute = read('src/app/api/admin/accounts/[id]/route.ts');
const onboardingPasswordRoute = read('src/app/api/onboarding/password/route.ts');
const onboardingProfileRoute = read('src/app/api/onboarding/profile/route.ts');
const routeShell = read('src/screens/admin/AdminRouteShell/index.tsx');
const shellIcons = read('src/components/layout/AdminShell/index.tsx');
const screen = read('src/screens/admin/ActivityHistoryScreen/index.tsx');
const elements = read('src/screens/admin/ActivityHistoryScreen/elements.tsx');

const getFunctionBlock = (name: string) => {
  const start = migration.indexOf(`create or replace function ${name}`);
  expect(start).toBeGreaterThanOrEqual(0);
  const next = migration.indexOf('create or replace function ', start + 1);
  return migration.slice(start, next === -1 ? migration.length : next);
};

describe('MRJE Activity History audit architecture', () => {
  it('keeps the business ledger private, append-only, and service-read-only', () => {
    expect(migration).toContain('create table if not exists private.audit_events');
    expect(migration).toContain('before update or delete on private.audit_events');
    expect(migration).toContain("raise exception 'Audit events are append-only'");
    expect(migration).toContain('revoke all privileges on table private.audit_events from public, anon, authenticated');
    expect(migration).toContain('grant execute on function public.list_admin_audit_events');
    expect(migration).toContain('to service_role;');
  });

  it('uses correlation IDs, privacy-minimized field changes, and keyset pagination', () => {
    expect(migration).toContain('request_id uuid not null');
    expect(migration).toContain('private.mask_audit_phone');
    expect(migration).toContain('(e.occurred_at, e.id) < (p_cursor_occurred_at, p_cursor_id)');
    expect(migration).toContain('order by e.occurred_at desc, e.id desc');
    expect(migration).toContain('limit v_limit + 1');
    expect(migration).not.toContain(' offset ');
  });

  it('never writes password, OTP, token, or raw request data into the central audit writer', () => {
    const writer = getFunctionBlock('private.write_audit_event');
    expect(writer).not.toMatch(/password/i);
    expect(writer).not.toMatch(/otp/i);
    expect(writer).not.toMatch(/token/i);
    expect(writer).not.toMatch(/request_body/i);
    expect(writer).not.toMatch(/authorization/i);
  });

  it('protects Activity History reads with Admin checks, rate limiting, bounded validation, and no-store responses', () => {
    for (const source of [listRoute, detailRoute]) {
      expect(source).toContain('getAuthenticatedProfile');
      expect(source).toContain("actor.role !== 'admin'");
      expect(source).toContain("actor.status !== 'active'");
      expect(source).toContain("actor.onboarding_stage !== 'complete'");
      expect(source).toContain('consumeAdminRateLimit');
      expect(source).toContain("'Cache-Control': 'private, no-store'");
    }
    expect(listRoute).toContain('auditListQuerySchema.safeParse');
    expect(detailRoute).toContain('auditEventIdSchema.safeParse');
  });

  it('correlates current account deletion and onboarding operations with one request trace', () => {
    expect(accountRoute).toContain('const auditContext = getAuditRequestContext(request);');
    expect(accountRoute).toContain('p_request_id: auditContext.requestId');
    expect(accountRoute).toContain('record_admin_account_deletion_denied');
    expect(accountRoute).toContain('record_admin_account_deletion_failed');
    expect(onboardingPasswordRoute).toContain('p_request_id: auditContext.requestId');
    expect(onboardingProfileRoute).toContain('p_request_id: auditContext.requestId');
  });

  it('adds a plain-language Activity History destination without generic dashboard decoration', () => {
    expect(routeShell).toContain("label: 'Activity History'");
    expect(routeShell).toContain("href: '/admin/activity-history'");
    expect(shellIcons).toContain('history: History');
    expect(screen).toContain('What happened');
    expect(screen).toContain('Trace reference');
    expect(screen).toContain('Security details');
    expect(screen).not.toContain('dangerouslySetInnerHTML');
    expect(screen).not.toContain('sx=');
    expect(elements).not.toMatch(/gradient/i);
    expect(screen).not.toContain('—');
  });
});
