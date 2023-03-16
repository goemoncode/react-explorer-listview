import { RefObject, useMemo } from 'react';
import { useMeasure, usePrevious, useScroll } from 'react-use';
import { useMergeRefs } from './useMergeRefs';
import { range } from '../utils';

export function useViewportRows<R, E extends HTMLElement>(
  ref: RefObject<E>,
  rows: readonly R[],
  rowHeight: number,
  headerHeight: number,
  focusedRowIndex: number
): [refs: ReturnType<typeof useMergeRefs<E>>, viewportHeight: number, viewportRows: number[]] {
  const { y: scrollTop } = useScroll(ref);
  const [measureRef, { height: clientHeight }] = useMeasure<E>();
  const refs = useMergeRefs(ref, measureRef);
  const viewportHeight = clientHeight - headerHeight;
  const prevFocusedRowIndex = usePrevious(focusedRowIndex) ?? -1;

  const viewportRows = useMemo(() => {
    if (rows.length == 0) return [];
    const clamp = (index: number) => Math.min(Math.max(0, index), rows.length - 1);
    const findRowIdx = (offset: number) => Math.floor(offset / rowHeight);
    const overscanThreshold = 4;
    const viewportTopIndex = findRowIdx(scrollTop);
    const viewportBottomIndex = findRowIdx(scrollTop + viewportHeight);
    const viewportRowsCount = Math.min(rows.length, viewportBottomIndex - viewportTopIndex + 1);
    const overscanBottomIndex = clamp(viewportBottomIndex + overscanThreshold);
    const overscanTopIndex = clamp(overscanBottomIndex - viewportRowsCount - overscanThreshold);
    return Array.from(
      new Set(
        range(overscanTopIndex, overscanBottomIndex).concat([
          clamp(prevFocusedRowIndex),
          clamp(focusedRowIndex),
        ])
      ).values()
    ).sort();
  }, [rows.length, scrollTop, viewportHeight, prevFocusedRowIndex, focusedRowIndex, rowHeight]);

  return [refs, viewportHeight, viewportRows];
}
