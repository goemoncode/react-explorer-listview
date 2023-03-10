import { forwardRef, memo, RefAttributes, useCallback } from 'react';
import { CalculatedColumn, cssClassnames, SortDirection } from './types';
import { useDefaultRenderers } from './hooks/useDefaultRenderers';
import { useColumnResize } from './hooks/useColumnResize';
import { useRowSort } from './hooks/useRowSort';
import { useMergeRefs } from './hooks/useMergeRefs';
import { Chevron } from './Icon';
import clsx from 'clsx';

export type ListViewHeaderCellProps<R> = {
  column: CalculatedColumn<R>;
} & React.HTMLAttributes<HTMLDivElement>;

function HeaderCell<R>(
  { column, className, children, ...props }: ListViewHeaderCellProps<R>,
  ref?: React.Ref<HTMLDivElement>
) {
  const { headerCellClass, headerRenderer = () => column.name } = column;
  const [refTarget, handlePointerDown, handleDoubleClick] = useColumnResize(column);
  const refs = useMergeRefs(ref, refTarget);
  return (
    <div
      ref={refs}
      role="columnheader"
      aria-colindex={column.index + 1} // aria-colindex is 1 based
      className={clsx(cssClassnames.listViewCell, className, headerCellClass)}
      {...props}
    >
      {children ? children : headerRenderer({ column })}
      {column.resizable && (
        <div
          className={cssClassnames.listViewResizeHandle}
          onPointerDown={handlePointerDown}
          onDoubleClick={handleDoubleClick}
        ></div>
      )}
    </div>
  );
}

export const ListViewHeaderCell = memo(forwardRef(HeaderCell)) as <R>(
  props: ListViewHeaderCellProps<R> & RefAttributes<HTMLDivElement>
) => JSX.Element;

function SortableHeaderCell<R>(
  { column, children, ...props }: ListViewHeaderCellProps<R>,
  ref?: React.Ref<HTMLDivElement>
) {
  const { headerRenderer = () => column.name } = column;
  const sortStatus = useDefaultRenderers<R>().sortStatus ?? SortStatus;
  const { sortColumn, onSort } = useRowSort();
  const sortDirection =
    sortColumn && sortColumn.columnKey === column.key ? sortColumn.direction : undefined;
  const handleClick = useCallback(
    (event: React.MouseEvent) => {
      if (event.currentTarget !== event.target) return;
      onSort?.(
        sortDirection === undefined
          ? { columnKey: column.key, direction: 'ASC' }
          : sortDirection === 'ASC'
          ? { columnKey: column.key, direction: 'DESC' }
          : undefined
      );
    },
    [column, sortDirection, onSort]
  );
  return (
    <ListViewHeaderCell
      ref={ref}
      column={column}
      aria-sort={sortDirection ? (sortDirection === 'ASC' ? 'ascending' : 'descending') : undefined}
      {...props}
    >
      <div onClick={column.sortable ? handleClick : undefined}>
        {children ? children : headerRenderer({ column })}
      </div>
      {column.sortable && sortStatus({ sortDirection })}
    </ListViewHeaderCell>
  );
}

export const ListViewSortableHeaderCell = memo(forwardRef(SortableHeaderCell)) as <R>(
  props: ListViewHeaderCellProps<R> & RefAttributes<HTMLDivElement>
) => JSX.Element;

export function defaultHeaderCellRenderer<R>(key: React.Key, props: ListViewHeaderCellProps<R>) {
  return <ListViewSortableHeaderCell key={key} {...props} />;
}

export interface SortStatusProps {
  sortDirection: SortDirection | undefined;
}

export function SortStatus({ sortDirection }: SortStatusProps) {
  return sortDirection === undefined ? null : (
    <Chevron
      className={cssClassnames.listViewSortStatus}
      dir={sortDirection === 'ASC' ? 'up' : 'down'}
    />
  );
}
