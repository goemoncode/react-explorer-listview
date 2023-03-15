import { useMemo } from 'react';
import { Column, SortColumn } from '../types';
import { getDefaultComparator } from '../utils';

export function useDefaultRowSort<R>(
  rows: readonly R[],
  columns: Column<R>[],
  sortColumn?: SortColumn
): readonly R[] {
  const sortedRows = useMemo((): readonly R[] => {
    if (sortColumn === undefined) return rows;
    const column = new Map(columns.map((col) => [col.key, col])).get(sortColumn.columnKey);
    if (column === undefined) return rows;
    return [...rows].sort((a, b) => {
      const comparator = column.comparator ?? getDefaultComparator(column);
      const result = comparator(a, b);
      return result === 0 ? 0 : sortColumn.direction === 'ASC' ? result : -result;
    });
  }, [rows, columns, sortColumn]);
  return sortedRows;
}
