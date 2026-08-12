import type { ReactNode } from 'react';

export interface AdminDataColumn<Row> {
  align?: 'left' | 'center' | 'right';
  key: string;
  label: string;
  render: (row: Row) => ReactNode;
}

export interface AdminDataTableProps<Row> {
  ariaLabel: string;
  columns: readonly AdminDataColumn<Row>[];
  getRowKey: (row: Row) => string;
  rows: readonly Row[];
}
