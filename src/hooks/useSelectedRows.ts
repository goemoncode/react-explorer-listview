import { useCallback, useLayoutEffect, useState } from 'react';

export function useSelectedRows<K extends React.Key>(
  propSelectedRows?: K[]
): [rows: K[], set: (rows: K[], merge?: boolean) => void] {
  const [rows, set] = useState<K[]>(propSelectedRows ?? []);

  useLayoutEffect(() => set(propSelectedRows ?? []), [propSelectedRows]);

  const merge = useCallback(
    (selected: K[], merge = false) => {
      set((rows) => (merge ? Array.from(new Set([...rows, ...selected])) : selected));
    },
    [set]
  );

  return [rows, merge];
}
