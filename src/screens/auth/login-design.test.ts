import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const loginSource = fs.readFileSync(path.join(__dirname, 'LoginScreen', 'index.tsx'), 'utf8');
const scaffoldSource = fs.readFileSync(path.join(__dirname, 'AuthScaffold', 'index.tsx'), 'utf8');

 describe('Professional login contract', () => {
  it('starts with empty credentials and keeps role selection out of authentication', () => {
    expect(loginSource).toContain("defaultValues: { email: '', password: '' }");
    expect(loginSource).not.toContain('role selector');
  });

  it('keeps password-manager semantics and a password visibility control', () => {
    expect(loginSource).toContain('autoComplete="username"');
    expect(loginSource).toContain('autoComplete="current-password"');
    expect(loginSource).toContain('Show password');
    expect(loginSource).toContain('Hide password');
  });

  it('uses Supabase authentication without exposing local demo passwords', () => {
    expect(loginSource).toContain('signInWithPassword');
    expect(loginSource).toContain('loadCurrentAppSession');
    expect(loginSource).not.toContain('AUTH_ACCOUNTS');
    expect(loginSource).not.toContain('applyDemoAccount');
    expect(scaffoldSource).toContain('Two storefronts. One operations platform.');
  });
});
