/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StrictMode, useState } from 'react';
import ListView, { Column, SortColumn, useRows } from '../src';

type Row = { id: number; colA: string; colB: string; colC: string; colD: string };
const columns: readonly Column<Row>[] = [
  { key: 'colA', name: 'colA' },
  { key: 'colB', name: 'colB' },
  { key: 'colC', name: 'colC' },
  { key: 'colD', name: 'colD', sortable: false },
];

function TestListView() {
  const rows: Row[] = [];
  const rowsProps = useRows(rows, (row) => row.id);
  const [sortColumn, setSortColumn] = useState<SortColumn>();
  return (
    <>
      <ListView
        {...rowsProps}
        columns={columns}
        defaultColumnOptions={{ sortable: true }}
        sortColumn={sortColumn}
        onSortColumnChange={setSortColumn}
      />
      <div data-testid="sortColumnValue">{JSON.stringify(sortColumn)}</div>
    </>
  );
}

function renderListView() {
  render(
    <StrictMode>
      <TestListView />
    </StrictMode>
  );
  const headerCells = screen.getAllByRole('columnheader');
  const sortColumnValue = screen.getByTestId('sortColumnValue');
  return {
    headerCells,
    sortColumnValue,
    expectSortColumn(expectedValue?: SortColumn) {
      if (expectedValue) {
        expect(JSON.parse(sortColumnValue.textContent!)).toStrictEqual(expectedValue);
      } else {
        expect(sortColumnValue).toBeEmptyDOMElement();
      }
    },
  };
}

test('should not sort if sortable is false', async () => {
  const { headerCells, expectSortColumn } = renderListView();
  const index = columns.findIndex((col) => !col.sortable);
  const headerCell = headerCells[index];
  await userEvent.click(headerCell);
  expect(headerCell).not.toHaveAttribute('aria-sort');
  expectSortColumn(undefined);
});

test('column sort', async () => {
  const { headerCells, expectSortColumn } = renderListView();
  const headerCell = headerCells[0];
  await userEvent.click(headerCell.firstElementChild!);
  expect(headerCell).toHaveAttribute('aria-sort', 'ascending');
  expectSortColumn({ columnKey: columns[0].key, direction: 'ASC' });
  await userEvent.click(headerCell.firstElementChild!);
  expect(headerCell).toHaveAttribute('aria-sort', 'descending');
  expectSortColumn({ columnKey: columns[0].key, direction: 'DESC' });
  await userEvent.click(headerCell.firstElementChild!);
  expect(headerCell).not.toHaveAttribute('aria-sort');
  expectSortColumn(undefined);
});
