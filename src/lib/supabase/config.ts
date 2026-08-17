const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const requirePublicEnvironmentValue = (value: string | undefined, name: string): string => {
  const normalized = value?.trim();
  if (!normalized) throw new Error(`Missing required environment variable: ${name}`);
  return normalized;
};

export function getSupabasePublicConfig() {
  const url = requirePublicEnvironmentValue(SUPABASE_URL, 'NEXT_PUBLIC_SUPABASE_URL');
  const publishableKey = requirePublicEnvironmentValue(
    SUPABASE_PUBLISHABLE_KEY,
    'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
  );

  try {
    const parsed = new URL(url);
    const isLocalhost = ['localhost', '127.0.0.1', '::1'].includes(parsed.hostname);
    if (parsed.protocol !== 'https:' && !isLocalhost) {
      throw new Error('Supabase URL must use HTTPS outside local development.');
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('must use HTTPS')) throw error;
    throw new Error('NEXT_PUBLIC_SUPABASE_URL must be a valid URL.');
  }

  return { url, publishableKey } as const;
}
