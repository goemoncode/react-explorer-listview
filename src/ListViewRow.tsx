import { forwardRef, memo, RefAttributes, useLayoutEffect, useRef } from 'react';
import { useDefaultRenderers } from './hooks/useDefaultRenderers';
import { useFocusContainer } from './hooks/useFocusContainer';
import { useMergeRefs } from './hooks/useMergeRefs';
import { defaultCellRenderer } from './ListViewCell';
import { CalculatedColumn, cssClassnames } from './types';
import { clsx } from 'clsx';

export type ListViewRowProps<R> = {
  columns: CalculatedColumn<R>[];
  row: R;
  rowIndex: number;
  gridRowStart: number;
  canTabFocus?: boolean;
  shouldFocus?: boolean;
  selected?: boolean;
  onRowFocus?: (event: React.FocusEvent, row: R) => void;
  onRowMouseDown?: (event: React.MouseEvent, row: R) => void;
  onRowMouseUp?: (event: React.MouseEvent, row: R) => void;
} & React.HTMLAttributes<HTMLDivElement>;

function Row<R>(
  {
    columns,
    row,
    rowIndex,
    gridRowStart,
    canTabFocus,
    shouldFocus,
    selected,
    onRowFocus,
    onRowMouseDown,
    onRowMouseUp,
    className,
    style,
    onFocus,
    onMouseDown,
    onMouseUp,
    ...props
  }: ListViewRowProps<R>,
  ref?: React.Ref<HTMLDivElement>
) {
  const internalRef = useRef<HTMLDivElement>(null);
  const refs = useMergeRefs(internalRef, ref);
  const containerElement = useFocusContainer();
  const renderers = useDefaultRenderers<R>();
  const cellContainer = renderers.cellContainer ?? defaultCellContainer;
  const cellRenderer = renderers.cell ?? defaultCellRenderer;

  useLayoutEffect(() => {
    if (shouldFocus) {
      const { current } = internalRef;
      if (current) {
        current.scrollIntoView({ block: 'nearest' });
        if (containerElement && containerElement.contains(document.activeElement)) {
          current.focus({ preventScroll: true });
        }
      }
    }
  }, [containerElement, shouldFocus]);

  const dataProps: Record<string, string | undefined> = {
    ['data-is-odd']: rowIndex % 2 != 0 ? '' : undefined,
    ['data-is-even']: rowIndex % 2 == 0 ? '' : undefined,
    ['data-is-selected']: selected ? '' : undefined,
  };

  return (
    <div
      ref={refs}
      role="row"
      aria-rowindex={rowIndex + 2}
      aria-selected={selected}
      className={clsx(
        cssClassnames.listViewRow,
        {
          [cssClassnames.listViewRowSelected]: selected,
          [cssClassnames.listViewRowFocused]: shouldFocus,
        },
        className
      )}
      tabIndex={canTabFocus ? 0 : -1}
      style={{ ...style, gridRowStart }}
      onFocus={(event) => {
        onRowFocus?.(event, row);
        onFocus?.(event);
      }}
      onMouseDown={(event) => {
        onRowMouseDown?.(event, row);
        onMouseDown?.(event);
      }}
      onMouseUp={(event) => {
        onRowMouseUp?.(event, row);
        onMouseUp?.(event);
      }}
      {...props}
      {...dataProps}
    >
      {cellContainer({
        columns,
        row,
        rowIndex,
        focused: shouldFocus,
        selected,
        children: columns.map((col) =>
          cellRenderer(col.key, {
            column: col,
            row,
            rowFocused: shouldFocus,
            rowSelected: selected,
          })
        ),
      })}
    </div>
  );
}

export const ListViewRow = memo(forwardRef(Row)) as <R>(
  props: ListViewRowProps<R> & RefAttributes<HTMLDivElement>
) => JSX.Element;

export function defaultRowRenderer<R>(key: React.Key, props: ListViewRowProps<R>) {
  return <ListViewRow key={key} {...props} />;
}

export type ListViewCellContainerProps<R> = React.PropsWithChildren<{
  columns: CalculatedColumn<R>[];
  row: R;
  rowIndex: number;
  focused?: boolean;
  selected?: boolean;
}>;

function defaultCellContainer<R>({ children }: ListViewCellContainerProps<R>) {
  return <>{children}</>;
}
