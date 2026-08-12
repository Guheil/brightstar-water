import { Fragment } from 'react';
import {
  BodyCell,
  BodyRow,
  DataTable,
  DataTableBody,
  DataTableHead,
  DesktopTableContainer,
  HeadCell,
  HeadRow,
  MobileLabel,
  MobileList,
  MobileRecord,
  MobileValue,
} from './elements';
import type { AdminDataTableProps } from './interface';

export default function AdminDataTable<Row>({
  ariaLabel,
  columns,
  getRowKey,
  rows,
}: AdminDataTableProps<Row>) {
  return (
    <>
      <DesktopTableContainer>
        <DataTable aria-label={ariaLabel}>
          <DataTableHead>
            <HeadRow>
              {columns.map((column) => (
                <HeadCell align={column.align} key={column.key} scope="col">
                  {column.label}
                </HeadCell>
              ))}
            </HeadRow>
          </DataTableHead>
          <DataTableBody>
            {rows.map((row) => (
              <BodyRow key={getRowKey(row)}>
                {columns.map((column) => (
                  <BodyCell align={column.align} key={column.key}>
                    {column.render(row)}
                  </BodyCell>
                ))}
              </BodyRow>
            ))}
          </DataTableBody>
        </DataTable>
      </DesktopTableContainer>

      <MobileList aria-label={`${ariaLabel}, mobile list`} role="list">
        {rows.map((row) => (
          <MobileRecord key={getRowKey(row)} role="listitem">
            {columns.map((column) => (
              <Fragment key={column.key}>
                <MobileLabel>{column.label}</MobileLabel>
                <MobileValue>{column.render(row)}</MobileValue>
              </Fragment>
            ))}
          </MobileRecord>
        ))}
      </MobileList>
    </>
  );
}
