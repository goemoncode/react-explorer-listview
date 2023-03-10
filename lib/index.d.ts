/// <reference types="react" />

import { DragEvent as DragEvent_2 } from 'react';
import { HTMLAttributes } from 'react';
import { Key } from 'react';
import { MouseEvent as MouseEvent_2 } from 'react';
import { MouseEventHandler } from 'react';
import { PointerEventHandler } from 'react';
import { Provider } from 'react';
import { RefAttributes } from 'react';
import { RefObject } from 'react';
import { UseMeasureRef } from 'react-use/lib/useMeasure';

export declare interface CalculatedColumn<R> extends Column<R> {
    readonly index: number;
    readonly order: number;
    readonly width: number;
    readonly minWidth: number;
    readonly maxWidth: number | undefined;
    readonly preferredWidth: number;
    readonly resizable: boolean;
    readonly sortable: boolean;
}

export declare type CellRendererProps<R> = {
    column: CalculatedColumn<R>;
    row: R;
    rowFocused?: boolean;
    rowSelected?: boolean;
};

export declare interface Column<R> {
    key: string;
    name: string;
    width?: number;
    order?: number;
    visible?: boolean;
    minWidth?: number;
    maxWidth?: number;
    preferredWidth?: number;
    sortable?: boolean;
    resizable?: boolean;
    cellClass?: string | ((row: R) => string | undefined);
    headerCellClass?: string;
    valueGetter?: (row: R, column: Column<R>) => any;
    comparator?: Comparator<R>;
    renderer?: Renderer<CellRendererProps<R>>;
    headerRenderer?: Renderer<HeaderCellRendererProps<R>>;
}

export declare type ColumnResizeContext<R> = {
    onColumnResize?: (column: CalculatedColumn<R>, width: number) => void;
};

export declare const ColumnResizeProvider: Provider<ColumnResizeContext<any>>;

export declare type Comparator<R> = (a: R, b: R) => number;

export declare const cssClassnames: {
    listView: string;
    listViewHeader: string;
    listViewHeaderRow: string;
    listViewSortStatus: string;
    listViewResizeHandle: string;
    listViewBody: string;
    listViewRow: string;
    listViewRowSelected: string;
    listViewRowFocused: string;
    listViewCell: string;
};

declare const _default: <R, K extends Key = Key>(props: {
    columns: readonly Column<R>[];
    rows: readonly R[];
    rowKey: RowKey<R, K>;
    rowHeight?: number | undefined;
    noBorder?: boolean | undefined;
    defaultColumnOptions?: DefaultColumnOptions<R> | undefined;
    focusedRow?: K | undefined;
    onFocusedRowChange?: ((focusedRow: K | undefined) => void) | undefined;
    selectedRows?: K[] | undefined;
    onSelectedRowsChange?: ((selectedRows: K[]) => void) | undefined;
    sortColumn?: SortColumn | undefined;
    onSortColumnChange?: ((sortColumn?: SortColumn | undefined) => void) | undefined;
    onColumnResize?: ((column: CalculatedColumn<R>, width: number) => void) | undefined;
    onRowClick?: ((event: MouseEvent_2<Element, MouseEvent>, row: R) => void) | undefined;
    onRowDoubleClick?: ((event: MouseEvent_2<Element, MouseEvent>, row: R) => void) | undefined;
    onRowContextMenu?: ((event: MouseEvent_2<Element, MouseEvent>, row: R) => void) | undefined;
    onRowDragStart?: ((event: DragEvent_2<Element>, row: R) => void) | undefined;
} & HTMLAttributes<HTMLDivElement> & RefAttributes<ListViewHandle>) => JSX.Element;
export default _default;

export declare function defaultCellRenderer<R>(key: React.Key, props: ListViewCellProps<R>): JSX.Element;

export declare type DefaultColumnOptions<R> = Omit<Column<R>, 'key' | 'name' | 'order'>;

export declare function defaultHeaderCellRenderer<R>(key: React.Key, props: ListViewHeaderCellProps<R>): JSX.Element;

export declare function defaultHeaderRowRenderer<R>(props: ListViewHeaderRowProps<R>): JSX.Element;

export declare interface DefaultRenderers<R> {
    headerRow?: Renderer<ListViewHeaderRowProps<R>>;
    headerCellContainer?: Renderer<ListViewHeaderCellContainerProps<R>>;
    headerCell?: RendererWithKey<ListViewHeaderCellProps<R>>;
    rowContainer?: Renderer<ListViewRowContainerProps<R>>;
    row?: RendererWithKey<ListViewRowProps<R>>;
    cellContainer?: Renderer<ListViewCellContainerProps<R>>;
    cell?: RendererWithKey<ListViewCellProps<R>>;
    sortStatus?: Renderer<SortStatusProps>;
    noRowsFallback?: React.ReactNode;
}

export declare const DefaultRenderersProvider: Provider<DefaultRenderers<any>>;

export declare function defaultRowRenderer<R>(key: React.Key, props: ListViewRowProps<R>): JSX.Element;

export declare function getDefaultComparator<R>(column: Column<R>): Comparator<R>;

export declare type HeaderCellRendererProps<R> = {
    column: CalculatedColumn<R>;
};

export declare type HeaderHeightContext = {
    onHeaderHeightResize?: (height: number) => void;
};

export declare const HeaderHeightProvider: Provider<HeaderHeightContext>;

export declare const ListViewCell: <R>(props: {
    column: CalculatedColumn<R>;
    row: R;
    rowFocused?: boolean | undefined;
    rowSelected?: boolean | undefined;
} & HTMLAttributes<HTMLDivElement> & RefAttributes<HTMLDivElement>) => JSX.Element;

export declare type ListViewCellContainerProps<R> = React.PropsWithChildren<{
    columns: CalculatedColumn<R>[];
    row: R;
    rowIndex: number;
    focused?: boolean;
    selected?: boolean;
}>;

export declare type ListViewCellProps<R> = {
    column: CalculatedColumn<R>;
    row: R;
    rowFocused?: boolean;
    rowSelected?: boolean;
} & React.HTMLAttributes<HTMLDivElement>;

export declare interface ListViewHandle {
    element: HTMLDivElement | null;
    scrollToRow: (rowIndex: number) => void;
}

export declare const ListViewHeaderCell: <R>(props: {
    column: CalculatedColumn<R>;
} & HTMLAttributes<HTMLDivElement> & RefAttributes<HTMLDivElement>) => JSX.Element;

export declare type ListViewHeaderCellContainerProps<R> = React.PropsWithChildren<{
    columns: CalculatedColumn<R>[];
}>;

export declare type ListViewHeaderCellProps<R> = {
    column: CalculatedColumn<R>;
} & React.HTMLAttributes<HTMLDivElement>;

export declare const ListViewHeaderRow: <R>(props: {
    columns: CalculatedColumn<R>[];
} & HTMLAttributes<HTMLDivElement> & RefAttributes<HTMLDivElement>) => JSX.Element;

export declare type ListViewHeaderRowProps<R> = {
    columns: CalculatedColumn<R>[];
} & React.HTMLAttributes<HTMLDivElement>;

export declare type ListViewProps<R, K extends React.Key = React.Key> = {
    columns: readonly Column<R>[];
    rows: readonly R[];
    rowKey: RowKey<R, K>;
    rowHeight?: number;
    noBorder?: boolean;
    defaultColumnOptions?: DefaultColumnOptions<R>;
    focusedRow?: K;
    onFocusedRowChange?: (focusedRow: K | undefined) => void;
    selectedRows?: K[];
    onSelectedRowsChange?: (selectedRows: K[]) => void;
    sortColumn?: SortColumn;
    onSortColumnChange?: (sortColumn?: SortColumn) => void;
    onColumnResize?: (column: CalculatedColumn<R>, width: number) => void;
    onRowClick?: (event: React.MouseEvent, row: R) => void;
    onRowDoubleClick?: (event: React.MouseEvent, row: R) => void;
    onRowContextMenu?: (event: React.MouseEvent, row: R) => void;
    onRowDragStart?: (event: React.DragEvent, row: R) => void;
} & React.HTMLAttributes<HTMLDivElement>;

export declare const ListViewRow: <R>(props: {
    columns: CalculatedColumn<R>[];
    row: R;
    rowIndex: number;
    gridRowStart: number;
    canTabFocus?: boolean | undefined;
    shouldFocus?: boolean | undefined;
    selected?: boolean | undefined;
    onRowFocus?: ((event: React.FocusEvent, row: R) => void) | undefined;
    onRowMouseDown?: ((event: React.MouseEvent, row: R) => void) | undefined;
    onRowMouseUp?: ((event: React.MouseEvent, row: R) => void) | undefined;
    onRowClick?: ((event: React.MouseEvent, row: R) => void) | undefined;
    onRowDoubleClick?: ((event: React.MouseEvent, row: R) => void) | undefined;
    onRowContextMenu?: ((event: React.MouseEvent, row: R) => void) | undefined;
    onRowDragStart?: ((event: React.DragEvent, row: R) => void) | undefined;
} & HTMLAttributes<HTMLDivElement> & RefAttributes<HTMLDivElement>) => JSX.Element;

export declare type ListViewRowContainerProps<R> = React.PropsWithChildren<{
    rows: readonly R[];
}>;

export declare type ListViewRowProps<R> = {
    columns: CalculatedColumn<R>[];
    row: R;
    rowIndex: number;
    gridRowStart: number;
    canTabFocus?: boolean;
    shouldFocus?: boolean;
    selected?: boolean;
    onRowFocus?: (event: React.FocusEvent, row: R) => void;
    onRowMouseDown?: (event: React.MouseEvent, row: R) => void;
    onRowMouseUp?: (event: React.MouseEvent, row: R) => void;
    onRowClick?: (event: React.MouseEvent, row: R) => void;
    onRowDoubleClick?: (event: React.MouseEvent, row: R) => void;
    onRowContextMenu?: (event: React.MouseEvent, row: R) => void;
    onRowDragStart?: (event: React.DragEvent, row: R) => void;
} & React.HTMLAttributes<HTMLDivElement>;

export declare const ListViewSortableHeaderCell: <R>(props: {
    column: CalculatedColumn<R>;
} & HTMLAttributes<HTMLDivElement> & RefAttributes<HTMLDivElement>) => JSX.Element;

export declare function range(from: number, to: number): number[];

export declare type Renderer<P> = (props: P) => React.ReactNode;

export declare type RendererWithKey<P> = (key: React.Key, props: P) => React.ReactNode;

export declare function reorder<R>(columns: readonly Column<R>[], picked: Column<R>['key'], over: Column<R>['key']): Column<R>[];

export declare type RowKey<R, K> = ((row: R) => K) | (keyof R & string);

export declare type RowSortContext = {
    sortColumn?: SortColumn;
    onSort?: (sortColumn?: SortColumn) => void;
};

export declare const RowSortProvider: Provider<RowSortContext>;

export declare function sortBy<T>(elements: T[], key: keyof T): T[];

export declare interface SortColumn {
    readonly columnKey: string;
    readonly direction: SortDirection;
}

export declare type SortDirection = 'ASC' | 'DESC';

export declare function SortStatus({ sortDirection }: SortStatusProps): JSX.Element | null;

export declare interface SortStatusProps {
    sortDirection: SortDirection | undefined;
}

export declare function useColumnResize<R, Parent extends HTMLElement, Handle extends HTMLElement>(column: CalculatedColumn<R>): [
refTarget: RefObject<Parent>,
onPointerDown: PointerEventHandler<Handle>,
onDoubleClick: MouseEventHandler<Handle>
];

export declare function useDefaultRenderers<R>(): DefaultRenderers<R>;

export declare function useHeaderHeight<E extends HTMLElement>(): UseMeasureRef<E>;

export declare function useRowSort(): RowSortContext;

export { }
