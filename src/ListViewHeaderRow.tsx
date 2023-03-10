import { forwardRef, memo, RefAttributes } from 'react';
import { useDefaultRenderers } from './hooks/useDefaultRenderers';
import { useHeaderHeight } from './hooks/useHeaderHeight';
import { useMergeRefs } from './hooks/useMergeRefs';
import { defaultHeaderCellRenderer } from './ListViewHeaderCell';
import { CalculatedColumn, cssClassnames } from './types';
import clsx from 'clsx';

export type ListViewHeaderRowProps<R> = {
  columns: CalculatedColumn<R>[];
} & React.HTMLAttributes<HTMLDivElement>;

function HeaderRow<R>(
  { columns, className, ...props }: ListViewHeaderRowProps<R>,
  ref?: React.Ref<HTMLDivElement>
) {
  const measureRef = useHeaderHeight();
  const refs = useMergeRefs(ref, measureRef);
  const renderers = useDefaultRenderers<R>();
  const headerCell = renderers.headerCell ?? defaultHeaderCellRenderer;
  const headerCellContainer = renderers.headerCellContainer ?? defaultHeaderCellContainer;
  return (
    <div
      ref={refs}
      role="row"
      aria-rowindex={1} // aria-rowindex is 1 based
      className={clsx(cssClassnames.listViewHeaderRow, className)}
      {...props}
    >
      {headerCellContainer({
        columns,
        children: columns.map((column) => headerCell?.(column.key, { column })),
      })}
    </div>
  );
}

export const ListViewHeaderRow = memo(forwardRef(HeaderRow)) as <R>(
  props: ListViewHeaderRowProps<R> & RefAttributes<HTMLDivElement>
) => JSX.Element;

export function defaultHeaderRowRenderer<R>(props: ListViewHeaderRowProps<R>) {
  return <ListViewHeaderRow {...props} />;
}

export type ListViewHeaderCellContainerProps<R> = React.PropsWithChildren<{
  columns: CalculatedColumn<R>[];
}>;

function defaultHeaderCellContainer<R>({ children }: ListViewHeaderCellContainerProps<R>) {
  return <>{children}</>;
}
