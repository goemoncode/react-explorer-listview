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
import { defaultHeaderRowRenderer } from './ListViewHeaderRow';
import { defaultRowRenderer } from './ListViewRow';
import clsx from 'clsx';

function ListView<R, K extends Key = Key>(
  {
    columns: rawColumns,
    getRow,
    getRowKey,
    getRowByIndex,
    indexOfRow,
    totalRows,
    rowHeight,
    noBorder,
    defaultColumnOptions,
    focusedRow: propFocusedRow,
    onFocusedRowChange,
    selectedRows: propSelectedRows,
    onSelectedRowsChange,
    sortColumn,
    onSortColumnChange,
    onColumnResize,
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
  const getIndexByKey = useCallback(
    (rowKey: K | undefined) => {
      const row = rowKey == null ? undefined : getRow(rowKey);
      return row == null ? undefined : indexOfRow(row);
    },
    [getRow, indexOfRow]
  );

  const [focusedRow, setFocusedRow] = useState<K | undefined>(propFocusedRow);
  const focusedRowIndex = getIndexByKey(focusedRow) ?? -1;
  useDebounce(() => onFocusedRowChange?.(focusedRow), 50, [focusedRow]);
  useLayoutEffect(() => setFocusedRow(propFocusedRow), [propFocusedRow]);
  useLayoutEffect(() => {
    if (focusedRow && focusedRowIndex < 0) {
      setFocusedRow(undefined);
    }
  }, [focusedRow, focusedRowIndex]);

  const [selectedRows, setSelectedRows] = useSelectedRows(propSelectedRows);
  useDebounce(() => onSelectedRowsChange?.(selectedRows), 50, [selectedRows]);

  const [shiftKeyHeldRow, setShiftKeyHeldRow] = useState<K | undefined>();
  const [headerHeight, setHeaderHeight] = useState(0);
  const headerHeightContext = useMemo<HeaderHeightContext>(
    () => ({ onHeaderHeightResize: setHeaderHeight }),
    []
  );
  const ref = useRef<HTMLDivElement>(null);
  const refContainer = useRef<HTMLDivElement>(null);
  const [refs1, refs2, viewportRows, rowsPerPage] = useViewportRows(
    ref,
    refContainer,
    totalRows,
    headerHeight,
    focusedRowIndex
  );

  useImperativeHandle(
    refHandle,
    () => ({
      element: ref.current,
      containerElement: refContainer.current,
      scrollToRow: (rowIndex: number) => {
        setFocusedRow(getRowKey(getRowByIndex(rowIndex)));
      },
    }),
    [getRowKey, getRowByIndex]
  );

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
    if (totalRows === 0) return;
    const { key, code, shiftKey, ctrlKey } = event;
    if (ctrlKey && code == 'KeyA') {
      event.preventDefault();
      setSelectedRows(
        range(0, totalRows - 1)
          .map(getRowByIndex)
          .map(getRowKey)
      );
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
        function clamp(index: number) {
          return Math.max(0, Math.min(index, totalRows - 1));
        }
        switch (key) {
          case 'ArrowUp':
            return clamp(index - 1);
          case 'ArrowDown':
            return clamp(index + 1);
          case 'Home':
            return 0;
          case 'End':
            return totalRows - 1;
          case 'PageUp':
            return clamp(index - (rowsPerPage - 1));
          case 'PageDown':
            return clamp(index + (rowsPerPage - 1));
          default:
            return false;
        }
      };
      // ctrlKey + PageUp/PageDown はブラウザのタブ切り替えのショートカットのためアプリケーションではハンドルできない
      const rowIndex = getClampedNext(focusedRowIndex);
      if (rowIndex !== false && rowIndex != focusedRowIndex) {
        event.preventDefault();
        const rowKey = getRowKey(getRowByIndex(rowIndex));
        setFocusedRow(rowKey);
        if (shiftKey) {
          const selected = range(getIndexByKey(shiftKeyHeldRow) ?? 0, rowIndex).map((i) =>
            getRowKey(getRowByIndex(i))
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
      setFocusedRow(getRowKey(row));
    },
    [getRowKey]
  );

  const handleRowMouseDown = useCallback(
    (event: React.MouseEvent, row: R) => {
      const { shiftKey, ctrlKey } = event;
      if (!shiftKey && !ctrlKey) {
        const rowKey = getRowKey(row);
        if (!new Set(selectedRows).has(rowKey)) {
          setSelectedRows([rowKey]);
          setShiftKeyHeldRow(rowKey);
        }
      }
    },
    [getRowKey, selectedRows, setSelectedRows]
  );

  const handleRowMouseUp = useCallback(
    (event: React.MouseEvent, row: R) => {
      const { button, shiftKey, ctrlKey } = event;
      // 0: left button, 1: wheel button, 2: right button
      if (button !== 2) {
        if (shiftKey) {
          const rowIndex = indexOfRow(row);
          const selected = range(getIndexByKey(shiftKeyHeldRow) ?? 0, rowIndex).map((i) =>
            getRowKey(getRowByIndex(i))
          );
          setSelectedRows(selected, ctrlKey);
        } else {
          const rowKey = getRowKey(row);
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
    [
      getRowKey,
      getIndexByKey,
      getRowByIndex,
      indexOfRow,
      selectedRows,
      setSelectedRows,
      shiftKeyHeldRow,
    ]
  );

  function getCssVar(value: string | number | undefined) {
    return value ? (typeof value === 'string' ? value : `${value}px`) : undefined;
  }
  const layoutCssVars: Record<string, string | number | undefined> = {
    '--relv-row-height': getCssVar(rowHeight),
    '--relv-row-count': totalRows || 1,
    '--relv-border-width': noBorder ? 'none' : undefined,
    '--relv-header-height': `${headerHeight}px`,
    '--relv-grid-template-columns': gridTemplateColumns,
  };

  const selectedSet = new Set(selectedRows);

  return (
    <div
      ref={refs1}
      role="table"
      aria-rowcount={totalRows + 1}
      aria-multiselectable={true}
      className={clsx(cssClassnames.listView, className)}
      style={{ ...style, ...layoutCssVars }}
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
        ref={refs2}
        role="rowgroup"
        className={cssClassnames.listViewBody}
        onKeyDown={handleKeyDown}
      >
        <FocusContainerProvider value={refContainer.current}>
          {rowContainer({
            viewportRows,
            children:
              totalRows === 0
                ? noRowsFallback
                : viewportRows
                    .map((i) => {
                      const row = getRowByIndex(i);
                      return { rowIndex: i, row, rowKey: getRowKey(row) };
                    })
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

export type ListViewRowContainerProps = React.PropsWithChildren<{
  viewportRows: number[];
}>;

function defaultRowContainer({ children }: ListViewRowContainerProps) {
  return <>{children}</>;
}
