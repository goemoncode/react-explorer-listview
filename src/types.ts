import { ListViewHeaderCellContainerProps, ListViewHeaderRowProps } from './ListViewHeaderRow';
import { ListViewHeaderCellProps, SortStatusProps } from './ListViewHeaderCell';
import { ListViewCellContainerProps, ListViewRowProps } from './ListViewRow';
import { ListViewCellProps } from './ListViewCell';
import { ListViewRowContainerProps } from './ListView';

export const cssClassnames = {
  listView: 'relv',
  listViewHeader: 'relv__header',
  listViewHeaderRow: 'relv__header-row',
  listViewSortStatus: 'relv__sort-status',
  listViewResizeHandle: 'relv__resize-handle',
  listViewBody: 'relv__body',
  listViewRow: 'relv__row',
  listViewRowSelected: 'relv__row--selected',
  listViewRowFocused: 'relv__row--focused',
  listViewCell: 'relv__cell',
};

export type Renderer<P> = (props: P) => React.ReactNode;
export type RendererWithKey<P> = (key: React.Key, props: P) => React.ReactNode;

export interface Column<R> {
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  valueGetter?: (row: R, column: Column<R>) => any;
  comparator?: Comparator<R>;
  renderer?: Renderer<CellRendererProps<R>>;
  headerRenderer?: Renderer<HeaderCellRendererProps<R>>;
}

export interface CalculatedColumn<R> extends Column<R> {
  readonly index: number;
  readonly order: number;
  readonly width: number;
  readonly minWidth: number;
  readonly maxWidth: number | undefined;
  readonly preferredWidth: number;
  readonly resizable: boolean;
  readonly sortable: boolean;
}

export type DefaultColumnOptions<R> = Omit<Column<R>, 'key' | 'name' | 'order'>;

export type Comparator<R> = (a: R, b: R) => number;

export type SortDirection = 'ASC' | 'DESC';

export interface SortColumn {
  readonly columnKey: string;
  readonly direction: SortDirection;
}

export type CellRendererProps<R> = {
  column: CalculatedColumn<R>;
  row: R;
  rowFocused?: boolean;
  rowSelected?: boolean;
};

export type HeaderCellRendererProps<R> = {
  column: CalculatedColumn<R>;
};

export interface ListViewHandle {
  element: HTMLDivElement | null;
  scrollToRow: (rowIndex: number) => void;
}

export type RowKey<R, K> = ((row: R) => K) | (keyof R & string);

export type ListViewProps<R, K extends React.Key = React.Key> = {
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

export interface DefaultRenderers<R> {
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
