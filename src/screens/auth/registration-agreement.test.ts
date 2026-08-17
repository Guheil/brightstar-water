import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { PRIVACY_VERSION, TERMS_VERSION } from '@/config';

const read = (relativePath: string) =>
  readFileSync(join(process.cwd(), relativePath), 'utf8');

describe('registration legal agreement', () => {
  it('places legal review before Supabase account creation', () => {
    const register = read('src/screens/auth/RegisterScreen/index.tsx');

    expect(register).toContain("{ id: 'agreement', label: 'Agreement' }");
    expect(register).toContain("if (valid) setStage('agreement')");
    expect(register).toContain('<RegistrationAgreementDialog');
    expect(register).toContain('const createAccount = async () =>');
    expect(register.indexOf("setStage('agreement')")).toBeLessThan(register.indexOf('supabase.auth.signUp'));
  });

  it('submits only the current legal versions with explicit agreement metadata', () => {
    const register = read('src/screens/auth/RegisterScreen/index.tsx');

    expect(register).toContain('terms_accepted: true');
    expect(register).toContain('privacy_acknowledged: true');
    expect(register).toContain('terms_version: TERMS_VERSION');
    expect(register).toContain('privacy_version: PRIVACY_VERSION');
    expect(TERMS_VERSION).toBe('1.0');
    expect(PRIVACY_VERSION).toBe('1.0');
  });

  it('keeps agreement controls disabled until both documents reach their end', () => {
    const dialog = read('src/components/legal/RegistrationAgreementDialog/index.tsx');

    expect(dialog).toContain('const allDocumentsRead = termsRead && privacyRead');
    expect(dialog).toContain('element.scrollTop + element.clientHeight >= element.scrollHeight');
    expect(dialog).toContain('disabled={!allDocumentsRead || working}');
    expect(dialog).toContain('allDocumentsRead && termsAccepted && privacyAcknowledged');
  });

  it('uses an append-only database-owned acceptance record', () => {
    const migration = read('supabase/migrations/202608170002_registration_legal_agreement.sql');

    expect(migration).toContain('create table public.legal_acceptances');
    expect(migration).toContain('alter table public.legal_acceptances enable row level security');
    expect(migration).toContain('revoke all privileges on table public.legal_acceptances from anon, authenticated');
    expect(migration).toContain("submitted_terms_version <> '1.0'");
    expect(migration).toContain("submitted_privacy_version <> '1.0'");
    expect(migration).toContain('accepted_at timestamptz not null default now()');
    expect(migration).not.toContain("new.raw_user_meta_data ->> 'accepted_at'");
  });
});
