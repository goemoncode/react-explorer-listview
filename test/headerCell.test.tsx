import { render, screen, renderHook } from '@testing-library/react';
import { StrictMode } from 'react';
import ListView, { Column, cssClassnames, ListViewProps, useRows } from '../src';

function renderListView<R, K extends React.Key>(props: ListViewProps<R, K>) {
  render(
    <StrictMode>
      <ListView {...props} />
    </StrictMode>
  );
  const headerCells = screen.getAllByRole('columnheader');
  return { headerCells };
}

test('header cell rendering', () => {
  function Header() {
    return <>Fancy</>;
  }
  type Row = { id: number; name: string };
  const columns: readonly Column<Row>[] = [
    { key: 'id', name: 'ID', headerCellClass: 'primary' },
    { key: 'name', name: 'Name', headerRenderer: Header },
  ];
  const rows: Row[] = [];
  const { result } = renderHook(() => useRows(rows, (row) => row.id));
  const { headerCells } = renderListView({ ...result.current, columns });
  expect(headerCells).toHaveLength(2);
  expect(headerCells[0]).toHaveClass(cssClassnames.listViewCell);
  expect(headerCells[0]).toHaveClass('primary');
  expect(headerCells[0]).toHaveAttribute('aria-colindex');
  expect(headerCells[0].getAttribute('aria-colindex')).toEqual('1');
  expect(headerCells[0]).toHaveTextContent('ID');
  expect(headerCells[1]).toHaveClass(cssClassnames.listViewCell);
  expect(headerCells[1]).toHaveAttribute('aria-colindex');
  expect(headerCells[1].getAttribute('aria-colindex')).toEqual('2');
  expect(headerCells[1]).toHaveTextContent('Fancy');
});
