import { createContext, useContext, useLayoutEffect } from 'react';
import { useMeasure } from 'react-use';

export type HeaderHeightContext = {
  onHeaderHeightResize?: (height: number) => void;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Context = createContext<HeaderHeightContext>({});

export const HeaderHeightProvider = Context.Provider;

export function useHeaderHeight<E extends HTMLElement>() {
  const { onHeaderHeightResize } = useContext(Context);
  const [ref, { height }] = useMeasure<E>();
  useLayoutEffect(() => {
    onHeaderHeightResize?.(height);
  }, [height, onHeaderHeightResize]);
  return ref;
}
