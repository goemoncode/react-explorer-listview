import { forwardRef, memo, RefAttributes } from 'react';
import { CellRendererProps, cssClassnames, CalculatedColumn } from './types';
import clsx from 'clsx';

export type ListViewCellProps<R> = {
  column: CalculatedColumn<R>;
  row: R;
  rowFocused?: boolean;
  rowSelected?: boolean;
} & React.HTMLAttributes<HTMLDivElement>;

function Cell<R>(
  { column, row, rowFocused, rowSelected, className, ...props }: ListViewCellProps<R>,
  ref?: React.Ref<HTMLDivElement>
) {
  const { cellClass, renderer = defaultRenderer } = column;
  return (
    <div
      ref={ref}
      role="cell"
      className={clsx(
        cssClassnames.listViewCell,
        className,
        typeof cellClass === 'function' ? cellClass(row) : cellClass
      )}
      {...props}
    >
      {renderer({ column, row, rowFocused, rowSelected })}
    </div>
  );
}

export const ListViewCell = memo(forwardRef(Cell)) as <R>(
  props: ListViewCellProps<R> & RefAttributes<HTMLDivElement>
) => JSX.Element;

export function defaultCellRenderer<R>(key: React.Key, props: ListViewCellProps<R>) {
  return <ListViewCell key={key} {...props} />;
}

function defaultRenderer<R>({ column, row }: CellRendererProps<R>): React.ReactNode {
  const { key, valueGetter = (row) => row[key as keyof R] } = column;
  return valueGetter(row, column);
}
