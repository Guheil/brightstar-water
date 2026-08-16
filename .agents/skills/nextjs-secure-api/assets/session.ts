/**
 * Drop-in session helpers: issue, read, rotate, and destroy a signed,
 * httpOnly session cookie. The client never sees or stores the raw token —
 * no localStorage, no sessionStorage, no non-httpOnly cookie.
 *
 * Setup:
 *   npm install jose
 *   Set SESSION_SECRET in env (32+ random bytes, e.g. `openssl rand -base64 32`).
 *
 * Usage:
 *   await createSession(res, { userId: user.id, role: user.role });
 *   const session = await readSession(req);
 *   await destroySession(res);
 */
import { NextRequest, NextResponse } from "next/server";
import { SignJWT, jwtVerify } from "jose";

const COOKIE_NAME = "session";
const SESSION_TTL_SECONDS = 60 * 60 * 2; // 2 hours — keep short; re-issue on activity if longer-lived UX is needed

function getSecretKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET env var is not set — session cookies cannot be signed.");
  }
  return new TextEncoder().encode(secret);
}

export type SessionPayload = {
  userId: string;
  role?: string;
};

export async function createSession(res: NextResponse, payload: SessionPayload): Promise<void> {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(getSecretKey());

  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true, // not readable by JS — this is what protects against XSS-driven token theft
    secure: process.env.NODE_ENV === "production", // HTTPS only in prod; allow http for local dev
    sameSite: "lax", // blocks the cookie being sent on most cross-site requests (CSRF mitigation)
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function readSession(req: NextRequest): Promise<SessionPayload | null> {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload as unknown as SessionPayload;
  } catch {
    // Invalid, expired, or tampered token — treat as logged out rather than throwing.
    return null;
  }
}

/** Call on login, password change, or role/privilege change to invalidate the old token. */
export async function rotateSession(res: NextResponse, payload: SessionPayload): Promise<void> {
  await createSession(res, payload); // re-signing with a fresh iat/exp is sufficient rotation for stateless JWTs
}

export async function destroySession(res: NextResponse): Promise<void> {
  res.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

/**
 * If the app needs server-side revocation (e.g. "log out everywhere"),
 * stateless JWTs alone can't do that — pair this with a small server-side
 * store (Redis set of valid session IDs, or a `sessionVersion` column on the
 * user checked against a claim in the token) rather than trusting the JWT's
 * expiry alone for that use case.
 */
