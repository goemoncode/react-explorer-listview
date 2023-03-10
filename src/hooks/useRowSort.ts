import { createContext, useContext } from 'react';
import { SortColumn } from '../types';

export type RowSortContext = {
  sortColumn?: SortColumn;
  onSort?: (sortColumn?: SortColumn) => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Context = createContext<RowSortContext>({});

export const RowSortProvider = Context.Provider;

export function useRowSort(): RowSortContext {
  return useContext(Context);
}
