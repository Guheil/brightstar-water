import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  PASSWORD_RECOVERY_INTENT_TTL_SECONDS,
  createPasswordRecoveryIntent,
  getRecoveryIdentityFromClaims,
  passwordRecoveryRateLimitKey,
  verifyPasswordRecoveryIntent,
} from './passwordRecovery';

const identity = {
  userId: '11111111-1111-4111-8111-111111111111',
  sessionId: '22222222-2222-4222-8222-222222222222',
  accessExpiresAt: new Date('2030-01-01T00:00:00.000Z'),
};

describe('password recovery intent', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('binds a signed, opaque intent to exactly one verified user and session', () => {
    vi.stubEnv('PASSWORD_RECOVERY_INTENT_SECRET', 'a-recovery-intent-test-secret-that-is-long-enough');
    const now = 1_900_000_000_000;
    const intent = createPasswordRecoveryIntent(identity, now);

    expect(intent).not.toContain(identity.userId);
    expect(intent).not.toContain(identity.sessionId);
    expect(verifyPasswordRecoveryIntent(intent, identity, now + 1)).toBe(true);
    expect(verifyPasswordRecoveryIntent(intent, { ...identity, userId: '33333333-3333-4333-8333-333333333333' }, now + 1)).toBe(false);
    expect(verifyPasswordRecoveryIntent(intent, { ...identity, sessionId: '44444444-4444-4444-8444-444444444444' }, now + 1)).toBe(false);
  });

  it('rejects tampered and expired intent values', () => {
    vi.stubEnv('PASSWORD_RECOVERY_INTENT_SECRET', 'a-recovery-intent-test-secret-that-is-long-enough');
    const now = 1_900_000_000_000;
    const intent = createPasswordRecoveryIntent(identity, now);

    expect(verifyPasswordRecoveryIntent(`${intent}tampered`, identity, now + 1)).toBe(false);
    expect(
      verifyPasswordRecoveryIntent(
        intent,
        identity,
        now + PASSWORD_RECOVERY_INTENT_TTL_SECONDS * 1000 + 1,
      ),
    ).toBe(false);
  });

  it('only accepts a complete verified Supabase identity claim set', () => {
    const claims = {
      exp: Math.floor(Date.now() / 1000) + 300,
      session_id: identity.sessionId,
      sub: identity.userId,
    };

    expect(getRecoveryIdentityFromClaims(claims)).toMatchObject({
      sessionId: identity.sessionId,
      userId: identity.userId,
    });
    expect(getRecoveryIdentityFromClaims({ ...claims, session_id: 'not-a-session-id' })).toBeNull();
    expect(getRecoveryIdentityFromClaims({ ...claims, exp: Math.floor(Date.now() / 1000) - 1 })).toBeNull();
  });

  it('uses keyed, non-PII recovery rate-limit identifiers', () => {
    vi.stubEnv('PASSWORD_RECOVERY_INTENT_SECRET', 'a-recovery-intent-test-secret-that-is-long-enough');
    const key = passwordRecoveryRateLimitKey('email', 'person@example.com');

    expect(key).toMatch(/^password-recovery:email:[A-Za-z0-9_-]{43}$/);
    expect(key).not.toContain('person@example.com');
  });
});
