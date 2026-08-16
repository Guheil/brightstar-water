/**
 * Drop-in rate limiter for Next.js route handlers.
 *
 * Serverless functions don't share memory across invocations/instances, so
 * the real limiter needs a shared store. This uses Upstash Redis (works on
 * any host, including Vercel's edge/serverless runtime) with an in-memory
 * fallback that ONLY works correctly in local single-process dev — it will
 * silently under-count in any multi-instance deployment, so don't rely on it
 * in production.
 *
 * Setup:
 *   npm install @upstash/ratelimit @upstash/redis
 *   Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in env.
 *
 * Usage in a route handler:
 *   const { success, retryAfter } = await checkRateLimit(`login:${ip}`, { limit: 5, windowSeconds: 60 });
 *   if (!success) return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: { "Retry-After": String(retryAfter) } });
 */

type RateLimitOptions = {
  limit: number;
  windowSeconds: number;
};

type RateLimitResult = {
  success: boolean;
  remaining: number;
  retryAfter: number; // seconds
};

const hasUpstashConfig = Boolean(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
);

// ---- In-memory fallback (dev only — see warning above) ----
const memoryStore = new Map<string, { count: number; resetAt: number }>();

function checkRateLimitInMemory(key: string, { limit, windowSeconds }: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  const entry = memoryStore.get(key);

  if (!entry || entry.resetAt <= now) {
    memoryStore.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return { success: true, remaining: limit - 1, retryAfter: 0 };
  }

  if (entry.count >= limit) {
    return { success: false, remaining: 0, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }

  entry.count += 1;
  return { success: true, remaining: limit - entry.count, retryAfter: 0 };
}

// ---- Upstash-backed implementation (production) ----
let upstashLimiterCache = new Map<string, unknown>();

async function checkRateLimitUpstash(
  key: string,
  { limit, windowSeconds }: RateLimitOptions
): Promise<RateLimitResult> {
  // Imported lazily so projects that haven't installed the package yet don't
  // fail to build — remove the dynamic import once the dependency is added.
  const { Ratelimit } = await import("@upstash/ratelimit");
  const { Redis } = await import("@upstash/redis");

  const cacheKey = `${limit}:${windowSeconds}`;
  let ratelimit = upstashLimiterCache.get(cacheKey) as InstanceType<typeof Ratelimit> | undefined;

  if (!ratelimit) {
    ratelimit = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(limit, `${windowSeconds} s`),
    });
    upstashLimiterCache.set(cacheKey, ratelimit);
  }

  const { success, remaining, reset } = await ratelimit.limit(key);
  return {
    success,
    remaining,
    retryAfter: success ? 0 : Math.max(0, Math.ceil((reset - Date.now()) / 1000)),
  };
}

export async function checkRateLimit(key: string, options: RateLimitOptions): Promise<RateLimitResult> {
  if (hasUpstashConfig) {
    return checkRateLimitUpstash(key, options);
  }

  if (process.env.NODE_ENV === "production") {
    console.warn(
      "[rateLimiter] UPSTASH_REDIS_REST_URL/TOKEN not set in production — falling back to in-memory " +
        "limiting, which does not work correctly across multiple instances. Configure Upstash before shipping."
    );
  }

  return checkRateLimitInMemory(key, options);
}
