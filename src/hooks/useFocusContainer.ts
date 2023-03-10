import { createContext, useContext } from 'react';

const Context = createContext<HTMLElement | null>(null);

export const FocusContainerProvider = Context.Provider;

export function useFocusContainer() {
  return useContext(Context);
}
