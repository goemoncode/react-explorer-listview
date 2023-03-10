/**
 * useMergeRefs
 * 
 * Copyright (c) 2018 react-hooks-org
 * Released under the MIT license
 * https://github.com/imbhargav5/rooks/blob/main/LICENSE
 */
import { MutableRefObject, Ref, RefCallback, useMemo } from 'react';
export type PossibleRef<T> = Ref<T> | undefined;

function setRef<T>(ref: PossibleRef<T>, value: T) {
  if (typeof ref === 'function') {
    ref(value);
  } else if (ref !== null && ref !== undefined) {
    (ref as MutableRefObject<T>).current = value;
  }
}

export function useMergeRefs<T>(...refs: Array<PossibleRef<T>>): RefCallback<T> | null {
  return useMemo(() => {
    if (refs.every((ref) => ref === null)) {
      return null;
    }

    return (refValue: T) => {
      for (const ref of refs) {
        setRef<T>(ref, refValue);
      }
    };
  }, [refs]);
}
