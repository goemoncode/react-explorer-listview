import { RefObject, useMemo } from 'react';
import { useMeasure, usePrevious, useScroll } from 'react-use';
import { useMergeRefs } from './useMergeRefs';
import { range } from '../utils';

export function useViewportRows<R, E extends HTMLElement>(
  ref: RefObject<E>,
  rows: readonly R[],
  headerHeight: number,
  focusedRowIndex: number
): [refs: ReturnType<typeof useMergeRefs<E>>, viewportRows: number[], rowsPerPage: number] {
  const { y: scrollTop } = useScroll(ref);
  const [measureRef, { height: clientHeight }] = useMeasure<E>();
  const refs = useMergeRefs(ref, measureRef);
  const viewportHeight = clientHeight - headerHeight;
  const prevFocusedRowIndex = usePrevious(focusedRowIndex) ?? -1;

  const [viewportRows, rowsPerPage] = useMemo(() => {
    if (ref.current === null || rows.length === 0) return [[], 0];
    function clamp(index: number) {
      return Math.max(0, Math.min(index, rows.length - 1));
    }
    const rowHeight = ref.current.scrollHeight / rows.length;
    const rowsPerPage = Math.floor(viewportHeight / rowHeight);
    const viewportTopIndex = Math.floor(scrollTop / rowHeight);
    const overscanThreshold = 4;
    const overscanTopIndex = clamp(viewportTopIndex - overscanThreshold);
    const overscanBottomIndex = clamp(viewportTopIndex + rowsPerPage + overscanThreshold);
    const viewportRows = Array.from(
      new Set(
        range(overscanTopIndex, overscanBottomIndex).concat([
          clamp(prevFocusedRowIndex),
          clamp(focusedRowIndex),
        ])
      ).values()
    ).sort();
    return [viewportRows, rowsPerPage];
  }, [ref, rows.length, scrollTop, viewportHeight, prevFocusedRowIndex, focusedRowIndex]);

  return [refs, viewportRows, rowsPerPage];
}
