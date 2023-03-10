import { PropsWithChildren, useCallback, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import './contextmenu.scss';

export type ContextMenuProps = {
  isOpen: boolean;
  top?: number;
  left?: number;
  onClose?: () => void;
};

export function ContextMenu({
  isOpen,
  top,
  left,
  onClose,
  children,
}: PropsWithChildren<ContextMenuProps>) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!isOpen) return;
    function onMousedown(event: MouseEvent) {
      if (event.target instanceof Node && ref.current?.contains(event.target)) {
        return;
      }
      onClose?.();
    }
    window.addEventListener('mousedown', onMousedown);
    return () => {
      window.removeEventListener('mousedown', onMousedown);
    };
  }, [isOpen, onClose]);

  return isOpen
    ? createPortal(
        <div ref={ref} className="contextmenu" style={{ top, left }}>
          {children}
        </div>,
        document.body
      )
    : null;
}

export function useContextMenu<E extends HTMLElement>(): [
  handleContextMenu: (event: React.MouseEvent<E>) => void,
  handleClick: (onClick: () => void) => () => void,
  props: ContextMenuProps
] {
  const [props, setProps] = useState<ContextMenuProps>({ isOpen: false });

  const handleContextMenu = useCallback((event: React.MouseEvent<E>) => {
    event.preventDefault();
    setProps({
      isOpen: true,
      left: event.pageX,
      top: event.pageY,
      onClose() {
        setProps({ isOpen: false });
      },
    });
  }, []);

  const handleClick = useCallback((onClick?: () => void) => {
    return () => {
      onClick?.();
      setProps({ isOpen: false });
    };
  }, []);

  return [handleContextMenu, handleClick, props];
}

export function CheckMark(props: React.SVGAttributes<SVGElement>) {
  return (
    <svg viewBox="0 0 5 5" {...props}>
      <path d="m1 4h2v-4" fill="none" stroke="currentColor" transform="rotate(45, 2.5, 2.5)"></path>
    </svg>
  );
}
