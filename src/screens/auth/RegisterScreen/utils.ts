export const REGISTRATION_OTP_LENGTH = 6;

export function createEmptyOtpDigits(): string[] {
  return Array.from({ length: REGISTRATION_OTP_LENGTH }, () => '');
}

export function sanitizeOtpDigits(value: string, limit = REGISTRATION_OTP_LENGTH): string {
  return value.replace(/\D/g, '').slice(0, limit);
}

export function applyOtpDigits(
  current: readonly string[],
  startIndex: number,
  rawValue: string,
): string[] {
  const next = [...current];
  const safeStart = Math.max(0, Math.min(startIndex, REGISTRATION_OTP_LENGTH - 1));
  const digits = sanitizeOtpDigits(rawValue, REGISTRATION_OTP_LENGTH - safeStart);

  if (!digits) {
    next[safeStart] = '';
    return next;
  }

  digits.split('').forEach((digit, offset) => {
    next[safeStart + offset] = digit;
  });

  return next;
}

export function replaceOtpFromPaste(rawValue: string): string[] {
  const digits = sanitizeOtpDigits(rawValue);
  return createEmptyOtpDigits().map((_, index) => digits[index] ?? '');
}
