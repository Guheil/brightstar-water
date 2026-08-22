import 'server-only';

import { randomUUID } from 'node:crypto';
import { isIP } from 'node:net';
import type { NextRequest } from 'next/server';

export interface AuditRequestContext {
  clientIp: string | null;
  requestId: string;
  userAgent: string | null;
}

function cleanHeader(value: string | null, maxLength: number): string | null {
  if (!value) return null;
  const cleaned = value.replace(/[\u0000-\u001F\u007F]/g, '').trim().slice(0, maxLength);
  return cleaned || null;
}

function firstValidIp(value: string | null): string | null {
  if (!value) return null;

  for (const candidate of value.split(',')) {
    const normalized = candidate.trim().replace(/^\[|\]$/g, '');
    if (isIP(normalized)) return normalized;
  }

  return null;
}

export function getAuditRequestContext(request: NextRequest): AuditRequestContext {
  const clientIp =
    firstValidIp(request.headers.get('x-vercel-forwarded-for')) ??
    firstValidIp(request.headers.get('cf-connecting-ip')) ??
    firstValidIp(request.headers.get('x-real-ip')) ??
    firstValidIp(request.headers.get('x-forwarded-for'));

  return {
    clientIp,
    requestId: randomUUID(),
    userAgent: cleanHeader(request.headers.get('user-agent'), 500),
  };
}
