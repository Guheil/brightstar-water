import 'server-only';

import { createHmac, timingSafeEqual } from 'node:crypto';
import type { NextResponse } from 'next/server';

export const PASSWORD_RECOVERY_INTENT_COOKIE = 'mrje-password-recovery-intent';
export const PASSWORD_RECOVERY_INTENT_TTL_SECONDS = 10 * 60;

export interface RecoveryIdentity {
  userId: string;
  sessionId: string;
  accessExpiresAt: Date;
}

interface RecoveryIntentPayload {
  expiresAt: number;
  sessionHash: string;
  userHash: string;
  version: 1;
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function getPasswordRecoverySecret(): string {
  const secret = process.env.PASSWORD_RECOVERY_INTENT_SECRET?.trim();
  if (!secret || secret.length < 32) {
    throw new Error('PASSWORD_RECOVERY_INTENT_SECRET must contain at least 32 characters.');
  }
  return secret;
}

function digest(label: string, value: string): string {
  return createHmac('sha256', getPasswordRecoverySecret())
    .update(`${label}:${value}`, 'utf8')
    .digest('base64url');
}

function sign(encodedPayload: string): string {
  return digest('password-recovery-intent-v1', encodedPayload);
}

function parsePayload(encodedPayload: string): RecoveryIntentPayload | null {
  try {
    const parsed = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8')) as unknown;
    if (!parsed || typeof parsed !== 'object') return null;
    const value = parsed as Partial<RecoveryIntentPayload>;
    if (
      value.version !== 1 ||
      typeof value.expiresAt !== 'number' ||
      !Number.isSafeInteger(value.expiresAt) ||
      typeof value.userHash !== 'string' ||
      typeof value.sessionHash !== 'string'
    ) {
      return null;
    }
    return value as RecoveryIntentPayload;
  } catch {
    return null;
  }
}

function signaturesMatch(actual: string, expected: string): boolean {
  const actualBuffer = Buffer.from(actual, 'utf8');
  const expectedBuffer = Buffer.from(expected, 'utf8');
  return actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer);
}

export function createPasswordRecoveryIntent(
  identity: RecoveryIdentity,
  now = Date.now(),
): string {
  const payload: RecoveryIntentPayload = {
    version: 1,
    expiresAt: now + PASSWORD_RECOVERY_INTENT_TTL_SECONDS * 1000,
    userHash: digest('password-recovery-user-v1', identity.userId),
    sessionHash: digest('password-recovery-session-v1', identity.sessionId),
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  return `${encodedPayload}.${sign(encodedPayload)}`;
}

export function verifyPasswordRecoveryIntent(
  intent: string | undefined,
  identity: Pick<RecoveryIdentity, 'userId' | 'sessionId'>,
  now = Date.now(),
): boolean {
  if (!intent) return false;
  const [encodedPayload, suppliedSignature, ...extra] = intent.split('.');
  if (!encodedPayload || !suppliedSignature || extra.length > 0) return false;

  const payload = parsePayload(encodedPayload);
  if (!payload || payload.expiresAt <= now || !signaturesMatch(suppliedSignature, sign(encodedPayload))) {
    return false;
  }

  return (
    signaturesMatch(payload.userHash, digest('password-recovery-user-v1', identity.userId)) &&
    signaturesMatch(payload.sessionHash, digest('password-recovery-session-v1', identity.sessionId))
  );
}

export function passwordRecoveryRateLimitKey(kind: 'email' | 'ip' | 'session', value: string): string {
  return `password-recovery:${kind}:${digest(`password-recovery-rate-limit-${kind}-v1`, value)}`;
}

export function getRecoveryIdentityFromClaims(claims: unknown): RecoveryIdentity | null {
  if (!claims || typeof claims !== 'object') return null;
  const record = claims as Record<string, unknown>;
  const userId = record.sub;
  const sessionId = record.session_id;
  const expiresAtSeconds = record.exp;

  if (
    typeof userId !== 'string' ||
    typeof sessionId !== 'string' ||
    !UUID_PATTERN.test(userId) ||
    !UUID_PATTERN.test(sessionId) ||
    typeof expiresAtSeconds !== 'number' ||
    !Number.isFinite(expiresAtSeconds) ||
    expiresAtSeconds * 1000 <= Date.now()
  ) {
    return null;
  }

  return {
    userId,
    sessionId,
    accessExpiresAt: new Date(expiresAtSeconds * 1000),
  };
}

export function setPasswordRecoveryIntent(response: NextResponse, intent: string) {
  response.cookies.set(PASSWORD_RECOVERY_INTENT_COOKIE, intent, {
    httpOnly: true,
    maxAge: PASSWORD_RECOVERY_INTENT_TTL_SECONDS,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
}

export function clearPasswordRecoveryIntent(response: NextResponse) {
  response.cookies.set(PASSWORD_RECOVERY_INTENT_COOKIE, '', {
    httpOnly: true,
    maxAge: 0,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
}
