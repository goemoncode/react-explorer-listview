import {
  createContext,
  MouseEventHandler,
  PointerEventHandler,
  RefObject,
  useCallback,
  useContext,
  useRef,
} from 'react';
import type { CalculatedColumn } from '../types';

export type ColumnResizeContext<R> = {
  onColumnResize?: (column: CalculatedColumn<R>, width: number) => void;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Context = createContext<ColumnResizeContext<any>>({});

export const ColumnResizeProvider = Context.Provider;

export function useColumnResize<R, Parent extends HTMLElement, Handle extends HTMLElement>(
  column: CalculatedColumn<R>
): [
  refTarget: RefObject<Parent>,
  onPointerDown: PointerEventHandler<Handle>,
  onDoubleClick: MouseEventHandler<Handle>
] {
  const { onColumnResize } = useContext(Context);
  const refTarget = useRef<Parent>(null);

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<Handle>) => {
      if (
        !column.resizable ||
        (event.pointerType === 'mouse' && event.buttons !== 1) ||
        refTarget.current == null
      ) {
        return;
      }
      event.stopPropagation();

      const { currentTarget, pointerId } = event;
      const { right } = currentTarget.getBoundingClientRect();
      const offset = right - event.clientX;

      function getPreferredWidth<R>(column: CalculatedColumn<R>, width: number) {
        return Math.round(
          Math.max(Math.min(width, column.maxWidth ?? width), column.minWidth ?? width)
        );
      }

      function onPointerMove(ev: PointerEvent) {
        if (!refTarget.current) return;
        const { left } = refTarget.current.getBoundingClientRect();
        const width = ev.clientX + offset - left;
        if (width > 0) {
          onColumnResize?.(column, getPreferredWidth(column, width));
        }
      }

      function onLostPointerCapture() {
        currentTarget.releasePointerCapture(pointerId);
        currentTarget.removeEventListener('pointermove', onPointerMove);
        currentTarget.removeEventListener('lostpointercapture', onLostPointerCapture);
      }

      currentTarget.setPointerCapture(pointerId);
      currentTarget.addEventListener('pointermove', onPointerMove);
      currentTarget.addEventListener('lostpointercapture', onLostPointerCapture);
    },
    [column, onColumnResize]
  );

  const handleDoubleClick = useCallback(() => {
    if (!column.resizable) {
      return;
    }
    onColumnResize?.(column, column.preferredWidth);
  }, [column, onColumnResize]);

  return [refTarget, handlePointerDown, handleDoubleClick];
}
