import { Key, useMemo } from 'react';

export function useRows<R, K extends Key = Key>(rows: readonly R[], keySelector: (row: R) => K) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const getRowKey = useMemo(() => keySelector, []);
  const [getRow, getRowByIndex, indexOfRow] = useMemo(() => {
    const map = new Map(rows.map((row) => [getRowKey(row), row]));
    return [
      (key: K) => map.get(key),
      (index: number) => rows[index],
      (row: R) => rows.indexOf(row),
    ];
  }, [getRowKey, rows]);
  return { getRow, getRowKey, getRowByIndex, indexOfRow, totalRows: rows.length };
}
