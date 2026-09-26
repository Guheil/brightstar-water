import type { NextRequest } from 'next/server';

const MAX_JSON_BODY_BYTES = 16 * 1024;

export function hasJsonContentType(request: NextRequest): boolean {
  const contentType = request.headers.get('content-type')?.toLowerCase() ?? '';
  return contentType.startsWith('application/json');
}

export function isRequestBodyWithinLimit(
  request: NextRequest,
  maxBytes = MAX_JSON_BODY_BYTES,
): boolean {
  const rawLength = request.headers.get('content-length');
  if (!rawLength) return true;

  const length = Number(rawLength);
  return Number.isFinite(length) && length >= 0 && length <= maxBytes;
}

export async function readLimitedJson(
  request: NextRequest,
  maxBytes = MAX_JSON_BODY_BYTES,
): Promise<
  | { ok: true; value: unknown }
  | { ok: false; reason: 'invalid' | 'too_large' }
> {
  const raw = await request.text();
  if (new TextEncoder().encode(raw).byteLength > maxBytes) {
    return { ok: false, reason: 'too_large' };
  }

  try {
    return { ok: true, value: JSON.parse(raw) as unknown };
  } catch {
    return { ok: false, reason: 'invalid' };
  }
}

export function isSameOriginMutation(request: NextRequest): boolean {
  const source = request.headers.get('origin') ?? request.headers.get('referer');
  if (!source) return false;

  try {
    return new URL(source).origin === request.nextUrl.origin;
  } catch {
    return false;
  }
}
