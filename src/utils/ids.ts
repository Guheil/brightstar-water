export const createSequenceId = (prefix: string, sequence: number): string =>
  `${prefix}-${String(sequence).padStart(4, '0')}`;

export const createOrderReference = (sequence: number): string =>
  `MRJE-DEMO-${String(sequence).padStart(4, '0')}`;

