import { RefObject, useMemo } from 'react';
import { useMeasure, usePrevious, useScroll } from 'react-use';
import { useMergeRefs } from './useMergeRefs';
import { range } from '../utils';

export function useViewportRows<R, E1 extends HTMLElement, E2 extends HTMLElement>(
  ref1: RefObject<E1>,
  ref2: RefObject<E2>,
  totalRows: number,
  headerHeight: number,
  focusedRowIndex: number
): [
  refs1: ReturnType<typeof useMergeRefs<E1>>,
  refs2: ReturnType<typeof useMergeRefs<E2>>,
  viewportRows: number[],
  rowsPerPage: number
] {
  const { y: scrollTop } = useScroll(ref1);
  const [measureRef1, { height: clientHeight }] = useMeasure<E1>();
  const [measureRef2, { height: scrollHeight }] = useMeasure<E2>();
  const refs1 = useMergeRefs(ref1, measureRef1);
  const refs2 = useMergeRefs(ref2, measureRef2);
  const viewportHeight = clientHeight - headerHeight;
  const prevFocusedRowIndex = usePrevious(focusedRowIndex) ?? -1;

  const [viewportRows, rowsPerPage] = useMemo(() => {
    if (scrollHeight === 0 || totalRows === 0) return [[], 0];
    function clamp(index: number) {
      return Math.max(0, Math.min(index, totalRows - 1));
    }
    const rowHeight = scrollHeight / totalRows;
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
  }, [focusedRowIndex, prevFocusedRowIndex, totalRows, scrollHeight, scrollTop, viewportHeight]);

  return [refs1, refs2, viewportRows, rowsPerPage];
}
