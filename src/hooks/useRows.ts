import { Key, useMemo } from 'react';

export function useRows<R, K extends Key = Key>(rows: readonly R[], keySelector: (row: R) => K) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const getRowKey = useMemo(() => keySelector, []);
  const [getRow, getRowByIndex, indexOfRow] = useMemo(() => {
    const map = new Map(rows.map((row) => [getRowKey(row), row]));
    function getRow(key: K) {
      return map.get(key);
    }
    function getRowByIndex(index: number) {
      return rows[index];
    }
    function indexOfRow(row: R) {
      return rows.indexOf(row);
    }
    return [getRow, getRowByIndex, indexOfRow];
  }, [getRowKey, rows]);
  return { getRow, getRowKey, getRowByIndex, indexOfRow, totalRows: rows.length };
}
