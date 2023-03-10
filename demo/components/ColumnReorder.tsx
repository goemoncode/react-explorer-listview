import { createContext, CSSProperties, useContext, useState } from 'react';
import {
  CalculatedColumn,
  ListViewHeaderCellProps,
  ListViewHeaderCellContainerProps,
  ListViewSortableHeaderCell,
} from '../../src';
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { horizontalListSortingStrategy, SortableContext, useSortable } from '@dnd-kit/sortable';
import { restrictToHorizontalAxis, restrictToParentElement } from '@dnd-kit/modifiers';
import { CSS } from '@dnd-kit/utilities';
import clsx from 'clsx';

const Context = createContext<boolean>(false);
export const ColumnReorderProvider = Context.Provider;

export interface DnDKitHeaderCellContainerProps<R> extends ListViewHeaderCellContainerProps<R> {
  onColumnReorder: (target: keyof R, over: keyof R) => void;
}

export function DnDKitHeaderCellContainer<R>({
  onColumnReorder,
  columns,
  children,
}: DnDKitHeaderCellContainerProps<R>) {
  const sensors = useSensors(
    useSensor(PrimaryButtonSensor, { activationConstraint: { distance: 10 } })
  );
  const [activeColumn, setActiveColumn] = useState<CalculatedColumn<R> | undefined>();

  function handleDragStart(event: DragStartEvent) {
    setActiveColumn(columns.find((col) => col.key == event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id && active.id != null) {
      onColumnReorder(active.id as keyof R, over.id as keyof R);
    }
    setActiveColumn(undefined);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToHorizontalAxis]}
      autoScroll={false}
    >
      <SortableContext
        items={columns.map(({ key }) => key)}
        strategy={horizontalListSortingStrategy}
      >
        {children}
        <DragOverlay modifiers={[restrictToParentElement]} zIndex={0}>
          {activeColumn ? (
            <ListViewSortableHeaderCell className="dragging" column={activeColumn} />
          ) : null}
        </DragOverlay>
      </SortableContext>
    </DndContext>
  );
}

export function DnDKitHeaderCell<R>(props: ListViewHeaderCellProps<R>) {
  const enabled = useContext(Context);
  const { listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: props.column.key,
    disabled: !enabled,
  });
  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1,
  };
  return (
    <ListViewSortableHeaderCell
      ref={setNodeRef}
      className={clsx({ draggable: enabled })}
      style={style}
      {...listeners}
      {...props}
    />
  );
}

class PrimaryButtonSensor extends PointerSensor {
  static activators = [
    {
      eventName: 'onPointerDown' as const,
      handler: ({ nativeEvent: event }: React.PointerEvent): boolean => {
        if (event.pointerType === 'mouse' && event.buttons !== 1) {
          return false;
        }
        return true;
      },
    },
  ];
}
