import type { CommandErrorCode, CommandResult } from '@/types';

export const commandSuccess = <T>(value: T): CommandResult<T> => ({
  ok: true,
  value,
});

export const commandFailure = <T = never>(
  code: CommandErrorCode,
  message: string,
  field?: string,
): CommandResult<T> => ({
  ok: false,
  error: { code, message, ...(field ? { field } : {}) },
});

