import {
  forwardRef,
  Key,
  RefAttributes,
  useCallback,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useDebounce } from 'react-use';
import { CalculatedColumn, cssClassnames, ListViewHandle, ListViewProps } from './types';
import { range } from './utils';
import { useDefaultRenderers } from './hooks/useDefaultRenderers';
import { useCalculatedColumns } from './hooks/useCalculatedColumns';
import { useViewportRows } from './hooks/useViewportRows';
import { useSelectedRows } from './hooks/useSelectedRows';
import { RowSortContext, RowSortProvider } from './hooks/useRowSort';
import { ColumnResizeContext, ColumnResizeProvider } from './hooks/useColumnResize';
import { HeaderHeightContext, HeaderHeightProvider } from './hooks/useHeaderHeight';
import { FocusContainerProvider } from './hooks/useFocusContainer';
import { useRowKey } from './hooks/useRowKey';
import { defaultHeaderRowRenderer } from './ListViewHeaderRow';
import { defaultRowRenderer } from './ListViewRow';
import clsx from 'clsx';

function ListView<R, K extends Key = Key>(
  {
    columns: rawColumns,
    rows,
    rowHeight = 26,
    noBorder,
    defaultColumnOptions,
    rowKey,
    focusedRow: propFocusedRow,
    onFocusedRowChange,
    selectedRows: propSelectedRows,
    onSelectedRowsChange,
    sortColumn,
    onSortColumnChange,
    onColumnResize,
    onRowClick,
    onRowDoubleClick,
    onRowContextMenu,
    onRowDragStart,
    className,
    style,
    ...props
  }: ListViewProps<R, K>,
  refHandle: React.Ref<ListViewHandle>
) {
  const defaultRenderers = useDefaultRenderers<R>();
  const headerRowRenderer = defaultRenderers.headerRow ?? defaultHeaderRowRenderer;
  const rowContainer = defaultRenderers.rowContainer ?? defaultRowContainer;
  const rowRenderer = defaultRenderers.row ?? defaultRowRenderer;
  const noRowsFallback = defaultRenderers?.noRowsFallback;
  const { columns, setColumnWidths, gridTemplateColumns } = useCalculatedColumns(
    rawColumns,
    defaultColumnOptions
  );
  const rowSortContext = useMemo<RowSortContext>(
    () => ({ sortColumn, onSort: onSortColumnChange }),
    [onSortColumnChange, sortColumn]
  );
  const { getByRow, getIndexByKey } = useRowKey(rows, rowKey);
  const [focusedRow, setFocusedRow] = useState<K | undefined>(propFocusedRow);
  const focusedRowIndex = getIndexByKey(focusedRow) ?? -1;
  const [selectedRows, setSelectedRows] = useSelectedRows(propSelectedRows);
  const [shiftKeyHeldRow, setShiftKeyHeldRow] = useState<K | undefined>();
  const [headerHeight, setHeaderHeight] = useState(0);
  const headerHeightContext = useMemo<HeaderHeightContext>(
    () => ({
      onHeaderHeightResize: setHeaderHeight,
    }),
    []
  );
  const ref = useRef<HTMLDivElement>(null);
  const [refs, viewportHeight, viewportRows] = useViewportRows(
    ref,
    rows,
    rowHeight,
    headerHeight,
    focusedRowIndex
  );

  useImperativeHandle(
    refHandle,
    () => ({
      element: ref.current,
      scrollToRow: (rowIndex: number) => {
        if (rowIndex >= 0 && rowIndex <= rows.length - 1) {
          setFocusedRow(getByRow(rows[rowIndex]));
        }
      },
    }),
    [ref, rows, getByRow]
  );
  useDebounce(() => onFocusedRowChange?.(focusedRow), 50, [focusedRow]);
  useDebounce(() => onSelectedRowsChange?.(selectedRows), 50, [selectedRows]);

  useLayoutEffect(() => {
    if (focusedRow && focusedRowIndex < 0) {
      setFocusedRow(undefined);
    }
  }, [focusedRow, focusedRowIndex]);
  // useLayoutEffect(() => setFocusedRow(undefined), [rows]);
  useLayoutEffect(() => setFocusedRow(propFocusedRow), [propFocusedRow]);
  // useLayoutEffect(() => setShiftKeyHeldRow(undefined), [rows]);

  const [columnResizeEventArgs, setColumnResizeEventArgs] =
    useState<[CalculatedColumn<R>, number]>();
  const columnResizeContext = useMemo<ColumnResizeContext<R>>(
    () => ({
      onColumnResize(column: CalculatedColumn<R>, width: number) {
        setColumnWidths(column.key, width);
        setColumnResizeEventArgs([column, width]);
      },
    }),
    [setColumnWidths]
  );
  useDebounce(() => columnResizeEventArgs && onColumnResize?.(...columnResizeEventArgs), 500, [
    columnResizeEventArgs,
  ]);

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const { key, code, shiftKey, ctrlKey } = event;
    if (ctrlKey && code == 'KeyA') {
      event.preventDefault();
      setSelectedRows(rows.map(getByRow));
    } else if (code === 'Space') {
      event.preventDefault(); // Spaceキー押下によるスクロール動作を無効化
      if (focusedRow !== undefined) {
        const selected = new Set(selectedRows);
        if (selected.has(focusedRow) && ctrlKey) {
          selected.delete(focusedRow);
        } else {
          selected.add(focusedRow);
        }
        setSelectedRows(Array.from(selected));
        setShiftKeyHeldRow(focusedRow);
      }
    } else {
      const getClampedNext = (index: number) => {
        function clamp(i: number) {
          return Math.min(Math.max(i, 0), rows.length - 1);
        }
        switch (key) {
          case 'ArrowUp':
            return clamp(index - 1);
          case 'ArrowDown':
            return clamp(index + 1);
          case 'Home':
            return 0;
          case 'End':
            return rows.length - 1;
          case 'PageUp': {
            const nextRowY = index * rowHeight + rowHeight - viewportHeight;
            return clamp(Math.floor(nextRowY / rowHeight));
          }
          case 'PageDown': {
            const nextRowY = index * rowHeight + viewportHeight;
            return clamp(Math.floor(nextRowY / rowHeight));
          }
          default:
            return false;
        }
      };
      // ctrlKey + PageUp/PageDown はブラウザのタブ切り替えのショートカットのためアプリケーションではハンドルできない
      const rowIndex = getClampedNext(focusedRowIndex);
      if (rowIndex !== false && rowIndex != focusedRowIndex) {
        event.preventDefault();
        const rowKey = getByRow(rows[rowIndex]);
        setFocusedRow(rowKey);
        if (shiftKey) {
          const selected = range(getIndexByKey(shiftKeyHeldRow) ?? 0, rowIndex).map((i) =>
            getByRow(rows[i])
          );
          setSelectedRows(selected, ctrlKey);
        } else if (!ctrlKey) {
          setSelectedRows([rowKey]);
          setShiftKeyHeldRow(rowKey);
        }
      }
    }
  }

  const handleRowFocus = useCallback(
    (event: React.FocusEvent, row: R) => {
      setFocusedRow(getByRow(row));
    },
    [getByRow]
  );

  const handleRowMouseDown = useCallback(
    (event: React.MouseEvent, row: R) => {
      const { shiftKey, ctrlKey } = event;
      if (!shiftKey && !ctrlKey) {
        const rowKey = getByRow(row);
        if (!new Set(selectedRows).has(rowKey)) {
          setSelectedRows([rowKey]);
          setShiftKeyHeldRow(rowKey);
        }
      }
    },
    [getByRow, selectedRows, setSelectedRows]
  );

  const handleRowMouseUp = useCallback(
    (event: React.MouseEvent, row: R) => {
      const { button, shiftKey, ctrlKey } = event;
      // 0: left button, 1: wheel button, 2: right button
      if (button !== 2) {
        if (shiftKey) {
          const rowIndex = rows.indexOf(row);
          const selected = range(getIndexByKey(shiftKeyHeldRow) ?? 0, rowIndex).map((i) =>
            getByRow(rows[i])
          );
          setSelectedRows(selected, ctrlKey);
        } else {
          const rowKey = getByRow(row);
          const selected = new Set(selectedRows);
          if (ctrlKey) {
            if (selected.has(rowKey)) {
              selected.delete(rowKey);
            } else {
              selected.add(rowKey);
            }
            setSelectedRows(Array.from(selected));
          } else if (selected.size > 1 || !selected.has(rowKey)) {
            setSelectedRows([rowKey]);
          }
          setShiftKeyHeldRow(rowKey);
        }
      }
    },
    [getByRow, getIndexByKey, rows, selectedRows, setSelectedRows, shiftKeyHeldRow]
  );

  const layoutCssVars: Record<string, string> = {
    '--relv-line-height': `${rowHeight}px`,
    '--relv-header-height': `${headerHeight}px`,
    '--relv-grid-template-columns': gridTemplateColumns,
  };
  if (noBorder) {
    layoutCssVars['--relv-border-width'] = 'none';
  }
  const rowGroupCss: Record<string, string> = {};
  if (rows.length > 0) {
    rowGroupCss['gridTemplateRows'] = `repeat(${rows.length || 1}, ${rowHeight}px)`;
  }

  const selectedSet = new Set(selectedRows);
  const refContainer = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={refs}
      role="table"
      aria-rowcount={rows.length + 1}
      aria-multiselectable={true}
      className={clsx(cssClassnames.listView, className)}
      style={{
        ...style,
        ...layoutCssVars,
      }}
      {...props}
    >
      <RowSortProvider value={rowSortContext}>
        <HeaderHeightProvider value={headerHeightContext}>
          <ColumnResizeProvider value={columnResizeContext}>
            <div role="rowgroup" className={cssClassnames.listViewHeader}>
              {headerRowRenderer({ columns })}
            </div>
          </ColumnResizeProvider>
        </HeaderHeightProvider>
      </RowSortProvider>
      <div
        ref={refContainer}
        role="rowgroup"
        className={cssClassnames.listViewBody}
        style={rowGroupCss}
        onKeyDown={handleKeyDown}
      >
        <FocusContainerProvider value={refContainer.current}>
          {rowContainer({
            rows,
            children:
              rows.length === 0
                ? noRowsFallback
                : viewportRows
                    .map((i) => ({ rowIndex: i, row: rows[i], rowKey: getByRow(rows[i]) }))
                    .map(({ rowIndex, row, rowKey }) =>
                      rowRenderer(rowKey, {
                        columns,
                        row,
                        rowIndex,
                        gridRowStart: rowIndex + 1,
                        canTabFocus:
                          focusedRow !== undefined ? focusedRow === rowKey : rowIndex == 0,
                        shouldFocus: focusedRow !== undefined ? focusedRow === rowKey : false,
                        selected: selectedSet.has(rowKey),
                        onRowFocus: handleRowFocus,
                        onRowMouseDown: handleRowMouseDown,
                        onRowMouseUp: handleRowMouseUp,
                        onRowClick: onRowClick,
                        onRowDoubleClick: onRowDoubleClick,
                        onRowContextMenu: onRowContextMenu,
                        onRowDragStart: onRowDragStart,
                      })
                    ),
          })}
        </FocusContainerProvider>
      </div>
    </div>
  );
}

export default forwardRef(ListView) as <R, K extends Key = Key>(
  props: ListViewProps<R, K> & RefAttributes<ListViewHandle>
) => JSX.Element;

export type ListViewRowContainerProps<R> = React.PropsWithChildren<{
  rows: readonly R[];
}>;

function defaultRowContainer<R>({ children }: ListViewRowContainerProps<R>) {
  return <>{children}</>;
}
