export const resolveSafeNextPath = (
  candidate: string | null | undefined,
  fallback = '/customer/account',
): string => {
  if (!candidate || !candidate.startsWith('/') || candidate.startsWith('//')) return fallback;
  if (candidate.includes('\\') || /[\u0000-\u001F]/.test(candidate)) return fallback;

  try {
    const parsed = new URL(candidate, 'https://local.invalid');
    if (parsed.origin !== 'https://local.invalid') return fallback;
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
};
