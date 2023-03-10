import { useLayoutEffect, useMemo } from 'react';
import { useMap } from 'react-use';
import { CalculatedColumn, Column, DefaultColumnOptions } from '../types';
import { sortBy } from '../utils';

export function useCalculatedColumns<R>(
  rawColumns: readonly Column<R>[],
  defaultColumnOptions?: DefaultColumnOptions<R>
) {
  const {
    width = 100,
    minWidth = 80,
    maxWidth,
    preferredWidth,
    sortable = false,
    resizable = false,
    cellClass,
    headerCellClass,
    valueGetter,
    comparator,
    renderer,
    headerRenderer,
  } = defaultColumnOptions || {};

  const columns = useMemo(() => {
    const calculatedColumns: CalculatedColumn<R>[] = [];
    for (let i = 0; i < rawColumns.length; i++) {
      const col = rawColumns[i];
      if (col.visible ?? true) {
        calculatedColumns.push({
          ...col,
          index: i,
          order: col.order ?? i,
          width: col.width ?? width,
          minWidth: col.minWidth ?? minWidth,
          maxWidth: col.maxWidth ?? maxWidth,
          preferredWidth: col.preferredWidth ?? preferredWidth ?? col.width ?? width,
          sortable: col.sortable ?? sortable,
          resizable: col.resizable ?? resizable,
          cellClass: col.cellClass ?? cellClass,
          headerCellClass: col.headerCellClass ?? headerCellClass,
          valueGetter: col.valueGetter ?? valueGetter,
          comparator: col.comparator ?? comparator,
          renderer: col.renderer ?? renderer,
          headerRenderer: col.headerRenderer ?? headerRenderer,
        });
      }
    }
    return sortBy(calculatedColumns, 'order');
  }, [
    rawColumns,
    width,
    minWidth,
    maxWidth,
    preferredWidth,
    sortable,
    resizable,
    cellClass,
    headerCellClass,
    valueGetter,
    comparator,
    renderer,
    headerRenderer,
  ]);

  const [
    columnWidths,
    { set: setColumnWidths, setAll: setColumnWidthsAll, reset: resetColumnWidths },
  ] = useMap(Object.fromEntries(columns.map(({ key, width }) => [key, width])));

  const gridTemplateColumns = useMemo<string>(
    () => columns.map((col) => columnWidths[col.key] + 'px').join(' '),
    [columns, columnWidths]
  );

  useLayoutEffect(
    () => setColumnWidthsAll(Object.fromEntries(columns.map(({ key, width }) => [key, width]))),
    [columns, setColumnWidthsAll]
  );

  return {
    columns,
    columnWidths,
    setColumnWidths,
    setColumnWidthsAll,
    resetColumnWidths,
    gridTemplateColumns,
  };
}
