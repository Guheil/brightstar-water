import { NextRequest, NextResponse } from 'next/server';
import { describe, expect, it } from 'vitest';
import { clearRecoveryAuthCookies, RECOVERY_AUTH_COOKIE_NAME } from './recovery';

describe('recovery cookie cleanup', () => {
  it('expires the recovery session and every chunk under their real cookie names', () => {
    const request = new NextRequest('http://localhost:3000/login', {
      headers: {
        cookie: `${RECOVERY_AUTH_COOKIE_NAME}=session; ${RECOVERY_AUTH_COOKIE_NAME}.0=chunk`,
      },
    });
    const response = NextResponse.next();

    clearRecoveryAuthCookies(response, request);

    expect(response.cookies.get(RECOVERY_AUTH_COOKIE_NAME)).toMatchObject({
      name: RECOVERY_AUTH_COOKIE_NAME,
      value: '',
    });
    expect(response.cookies.get(`${RECOVERY_AUTH_COOKIE_NAME}.0`)).toMatchObject({
      name: `${RECOVERY_AUTH_COOKIE_NAME}.0`,
      value: '',
    });
    expect(response.headers.get('set-cookie')).not.toContain('undefined=');
    expect(request.cookies.get(RECOVERY_AUTH_COOKIE_NAME)).toBeUndefined();
    expect(request.cookies.get(`${RECOVERY_AUTH_COOKIE_NAME}.0`)).toBeUndefined();
  });
});
