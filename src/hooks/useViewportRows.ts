import { RefObject, useLayoutEffect, useMemo, useState } from 'react';
import { useMeasure, usePrevious, useScroll } from 'react-use';
import { useMergeRefs } from './useMergeRefs';
import { range } from '../utils';

export function useViewportRows<R, E1 extends HTMLElement, E2 extends HTMLElement>(
  ref1: RefObject<E1>, // ref of ListView
  ref2: RefObject<E2>, // ref of ListViewBody
  totalRows: number,
  headerHeight: number,
  focusedRowIndex: number
): [
  refs1: ReturnType<typeof useMergeRefs<E1>>,
  refs2: ReturnType<typeof useMergeRefs<E2>>,
  viewportRows: number[],
  rowsPerPage: number,
] {
  const [rowHeight, setRowHeight] = useState(0);
  const { y: scrollTop } = useScroll(ref1);
  const [measureRef1, { height: clientHeight }] = useMeasure<E1>();
  const [measureRef2, { height: scrollHeight }] = useMeasure<E2>();
  const refs1 = useMergeRefs(ref1, measureRef1);
  const refs2 = useMergeRefs(ref2, measureRef2, (instance: E2 | null) => {
    if (instance !== null && rowHeight === 0) {
      // console.log(instance.scrollHeight);
      setRowHeight(instance.scrollHeight / (totalRows || 1));
    }
  });
  const viewportHeight = clientHeight - headerHeight;
  const prevFocusedRowIndex = usePrevious(focusedRowIndex) ?? -1;

  useLayoutEffect(() => {
    if (
      totalRows > 0 &&
      scrollHeight > rowHeight &&
      Math.abs(rowHeight - scrollHeight / totalRows) < 0.01
    ) {
      // マウント時に totalRows が 0 で行高がデフォルトの 2em の場合、rowHeight は 24 で得られるが、
      // レンダリングされる scrollHeight を totalRows で分割すると 23.991477.. のように僅かに小さい。
      // この誤差があるとビューポート内に表示すべき行のインデックスがずれるためここで正確な行高を得る。
      setRowHeight(scrollHeight / totalRows);
    }
  }, [rowHeight, scrollHeight, totalRows]);

  const [viewportRows, rowsPerPage] = useMemo(() => {
    if (rowHeight === 0 || totalRows === 0) return [[], 0];
    function clamp(index: number) {
      return Math.max(0, Math.min(index, totalRows - 1));
    }
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
  }, [focusedRowIndex, prevFocusedRowIndex, totalRows, rowHeight, scrollTop, viewportHeight]);

  return [refs1, refs2, viewportRows, rowsPerPage];
}
