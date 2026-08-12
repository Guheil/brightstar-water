export type EntityId = string;
export type ISODateString = string;
export type MoneyCentavos = number;

export type CommandErrorCode =
  | 'not_found'
  | 'invalid_input'
  | 'invalid_transition'
  | 'insufficient_stock'
  | 'outside_service_area'
  | 'not_allowed'
  | 'conflict';

export interface CommandError {
  code: CommandErrorCode;
  message: string;
  field?: string;
}

export type CommandResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: CommandError };

export interface AuditStamp {
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

