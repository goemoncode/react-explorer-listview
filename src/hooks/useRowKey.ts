import { Key, useCallback, useMemo } from 'react';
import { RowKey } from '../types';

export function useRowKey<R, K extends Key = Key>(rows: readonly R[], rowKey: RowKey<R, K>) {
  const getByRow = useCallback(
    (row: R) => {
      if (typeof rowKey === 'function') {
        return rowKey(row);
      } else {
        return row[rowKey] as K;
      }
    },
    [rowKey]
  );
  const getIndexByKey = useMemo(() => {
    const map = new Map(rows.map((row, rowIndex) => [getByRow(row), rowIndex]));
    return (key: K | undefined) => (key === undefined ? undefined : map.get(key));
  }, [rows, getByRow]);
  return { getByRow, getIndexByKey };
}
