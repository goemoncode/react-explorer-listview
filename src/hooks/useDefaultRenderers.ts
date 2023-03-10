import { createContext, useContext } from 'react';
import { DefaultRenderers } from '../types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Context = createContext<DefaultRenderers<any>>({});

export const DefaultRenderersProvider = Context.Provider;

export function useDefaultRenderers<R>(): DefaultRenderers<R> {
  return useContext<DefaultRenderers<R>>(Context);
}
