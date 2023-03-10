import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { createContext, useContext, useMemo, useLayoutEffect, useState, useCallback, useRef, memo, forwardRef, useImperativeHandle } from "react";
import { useMap, useScroll, useMeasure, useDebounce } from "react-use";
import clsx, { clsx as clsx$1 } from "clsx";
const cssClassnames = {
  listView: "relv",
  listViewHeader: "relv__header",
  listViewHeaderRow: "relv__header-row",
  listViewSortStatus: "relv__sort-status",
  listViewResizeHandle: "relv__resize-handle",
  listViewBody: "relv__body",
  listViewRow: "relv__row",
  listViewRowSelected: "relv__row--selected",
  listViewRowFocused: "relv__row--focused",
  listViewCell: "relv__cell"
};
function range(from, to) {
  return Array.from({ length: Math.abs(from - to) + 1 }, (v, k) => Math.min(from, to) + k);
}
function sortBy(elements, key) {
  return [...elements].sort((a, b) => {
    return a[key] === b[key] ? 0 : a[key] > b[key] ? 1 : -1;
  });
}
function reorder(columns, picked, over) {
  const tmp = sortBy(
    columns.map(({ key, order }, index2) => ({ key, order, index: index2 })),
    "order"
  );
  const oldPos = tmp.findIndex((x) => x.key == picked);
  const newPos = tmp.findIndex((x) => x.key == over);
  tmp.splice(newPos < 0 ? tmp.length + newPos : newPos, 0, tmp.splice(oldPos, 1)[0]);
  const newOrder = new Map(tmp.map((x, i) => [x.index, i]));
  return columns.map((x, i) => ({ ...x, order: newOrder.get(i) }));
}
function getDefaultComparator(column) {
  const { key, valueGetter = (row) => row[key] } = column;
  return (a, b) => {
    const value1 = valueGetter(a, column);
    const value2 = valueGetter(b, column);
    if (value1 !== void 0 && value2 === void 0) {
      return 1;
    } else if (value1 === void 0 && value2 !== void 0) {
      return -1;
    } else {
      return value1 === value2 ? 0 : value1 > value2 ? 1 : -1;
    }
  };
}
const Context$4 = createContext({});
const DefaultRenderersProvider = Context$4.Provider;
function useDefaultRenderers() {
  return useContext(Context$4);
}
function useCalculatedColumns(rawColumns, defaultColumnOptions) {
  const {
    width = 100,
    minWidth = 80,
    maxWidth,
    preferredWidth,
    sortable = false,
    resizable = false,
    cellClass,
    headerCellClass,
    valueGetter,
    comparator,
    renderer,
    headerRenderer
  } = defaultColumnOptions || {};
  const columns = useMemo(() => {
    const calculatedColumns = [];
    for (let i = 0; i < rawColumns.length; i++) {
      const col = rawColumns[i];
      if (col.visible ?? true) {
        calculatedColumns.push({
          ...col,
          index: i,
          order: col.order ?? i,
          width: col.width ?? width,
          minWidth: col.minWidth ?? minWidth,
          maxWidth: col.maxWidth ?? maxWidth,
          preferredWidth: col.preferredWidth ?? preferredWidth ?? col.width ?? width,
          sortable: col.sortable ?? sortable,
          resizable: col.resizable ?? resizable,
          cellClass: col.cellClass ?? cellClass,
          headerCellClass: col.headerCellClass ?? headerCellClass,
          valueGetter: col.valueGetter ?? valueGetter,
          comparator: col.comparator ?? comparator,
          renderer: col.renderer ?? renderer,
          headerRenderer: col.headerRenderer ?? headerRenderer
        });
      }
    }
    return sortBy(calculatedColumns, "order");
  }, [
    rawColumns,
    width,
    minWidth,
    maxWidth,
    preferredWidth,
    sortable,
    resizable,
    cellClass,
    headerCellClass,
    valueGetter,
    comparator,
    renderer,
    headerRenderer
  ]);
  const [
    columnWidths,
    { set: setColumnWidths, setAll: setColumnWidthsAll, reset: resetColumnWidths }
  ] = useMap(Object.fromEntries(columns.map(({ key, width: width2 }) => [key, width2])));
  const gridTemplateColumns = useMemo(
    () => columns.map((col) => columnWidths[col.key] + "px").join(" "),
    [columns, columnWidths]
  );
  useLayoutEffect(
    () => setColumnWidthsAll(Object.fromEntries(columns.map(({ key, width: width2 }) => [key, width2]))),
    [columns, setColumnWidthsAll]
  );
  return {
    columns,
    columnWidths,
    setColumnWidths,
    setColumnWidthsAll,
    resetColumnWidths,
    gridTemplateColumns
  };
}
function setRef(ref, value) {
  if (typeof ref === "function") {
    ref(value);
  } else if (ref !== null && ref !== void 0) {
    ref.current = value;
  }
}
function useMergeRefs(...refs) {
  return useMemo(() => {
    if (refs.every((ref) => ref === null)) {
      return null;
    }
    return (refValue) => {
      for (const ref of refs) {
        setRef(ref, refValue);
      }
    };
  }, [refs]);
}
function useViewportRows(ref, rows, rowHeight, headerHeight, focusedRowIndex) {
  const { y: scrollTop } = useScroll(ref);
  const [measureRef, { height: clientHeight }] = useMeasure();
  const refs = useMergeRefs(ref, measureRef);
  const viewportHeight = clientHeight - headerHeight;
  const viewportRows = useMemo(() => {
    if (rows.length == 0)
      return [];
    const findRowIdx = (offset) => Math.floor(offset / rowHeight);
    const overscanThreshold = 4;
    const viewportTopIndex = findRowIdx(scrollTop);
    const viewportBottomIndex = findRowIdx(scrollTop + viewportHeight);
    const viewportRowsCount = Math.min(rows.length, viewportBottomIndex - viewportTopIndex + 1);
    const overscanBottomIndex = Math.min(rows.length - 1, viewportBottomIndex + overscanThreshold);
    const overscanTopIndex = Math.max(
      0,
      overscanBottomIndex - viewportRowsCount - overscanThreshold
    );
    return Array.from(
      new Set(
        range(overscanTopIndex, overscanBottomIndex).concat([Math.max(0, focusedRowIndex)])
      ).values()
    ).sort();
  }, [rows, rowHeight, scrollTop, focusedRowIndex, viewportHeight]);
  return [refs, viewportHeight, viewportRows];
}
function useSelectedRows(propSelectedRows) {
  const [rows, set] = useState(propSelectedRows ?? []);
  useLayoutEffect(() => set(propSelectedRows ?? []), [propSelectedRows]);
  const merge = useCallback(
    (selected, merge2 = false) => {
      set((rows2) => merge2 ? Array.from(/* @__PURE__ */ new Set([...rows2, ...selected])) : selected);
    },
    [set]
  );
  return [rows, merge];
}
const Context$3 = createContext({});
const ColumnResizeProvider = Context$3.Provider;
function useColumnResize(column) {
  const { onColumnResize } = useContext(Context$3);
  const refTarget = useRef(null);
  const handlePointerDown = useCallback(
    (event) => {
      if (!column.resizable || event.pointerType === "mouse" && event.buttons !== 1 || refTarget.current == null) {
        return;
      }
      event.stopPropagation();
      const { currentTarget, pointerId } = event;
      const { right } = currentTarget.getBoundingClientRect();
      const offset = right - event.clientX;
      function getPreferredWidth(column2, width) {
        return Math.round(
          Math.max(Math.min(width, column2.maxWidth ?? width), column2.minWidth ?? width)
        );
      }
      function onPointerMove(ev) {
        if (!refTarget.current)
          return;
        const { left } = refTarget.current.getBoundingClientRect();
        const width = ev.clientX + offset - left;
        if (width > 0) {
          onColumnResize == null ? void 0 : onColumnResize(column, getPreferredWidth(column, width));
        }
      }
      function onLostPointerCapture() {
        currentTarget.releasePointerCapture(pointerId);
        currentTarget.removeEventListener("pointermove", onPointerMove);
        currentTarget.removeEventListener("lostpointercapture", onLostPointerCapture);
      }
      currentTarget.setPointerCapture(pointerId);
      currentTarget.addEventListener("pointermove", onPointerMove);
      currentTarget.addEventListener("lostpointercapture", onLostPointerCapture);
    },
    [column, onColumnResize]
  );
  const handleDoubleClick = useCallback(() => {
    if (!column.resizable) {
      return;
    }
    onColumnResize == null ? void 0 : onColumnResize(column, column.preferredWidth);
  }, [column, onColumnResize]);
  return [refTarget, handlePointerDown, handleDoubleClick];
}
const Context$2 = createContext({});
const HeaderHeightProvider = Context$2.Provider;
function useHeaderHeight() {
  const { onHeaderHeightResize } = useContext(Context$2);
  const [ref, { height }] = useMeasure();
  useLayoutEffect(() => {
    onHeaderHeightResize == null ? void 0 : onHeaderHeightResize(height);
  }, [height, onHeaderHeightResize]);
  return ref;
}
const Context$1 = createContext(null);
const FocusContainerProvider = Context$1.Provider;
function useFocusContainer() {
  return useContext(Context$1);
}
const Context = createContext({});
const RowSortProvider = Context.Provider;
function useRowSort() {
  return useContext(Context);
}
function useRowKey(rows, rowKey) {
  const getByRow = useCallback(
    (row) => {
      if (typeof rowKey === "function") {
        return rowKey(row);
      } else {
        return row[rowKey];
      }
    },
    [rowKey]
  );
  const getIndexByKey = useMemo(() => {
    const map = new Map(rows.map((row, rowIndex) => [getByRow(row), rowIndex]));
    return (key) => key === void 0 ? void 0 : map.get(key);
  }, [rows, getByRow]);
  return { getByRow, getIndexByKey };
}
function Chevron({ dir, stroke = "currentColor", ...props }) {
  return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 24 24", fill: "none", stroke, ...props, children: [
    dir === "up" && /* @__PURE__ */ jsx("polyline", { points: "6 15 12 9 18 15" }),
    dir === "down" && /* @__PURE__ */ jsx("polyline", { points: "6 9 12 15 18 9" })
  ] });
}
function HeaderCell({ column, className, children, ...props }, ref) {
  const { headerCellClass, headerRenderer = () => column.name } = column;
  const [refTarget, handlePointerDown, handleDoubleClick] = useColumnResize(column);
  const refs = useMergeRefs(ref, refTarget);
  return /* @__PURE__ */ jsxs(
    "div",
    {
      ref: refs,
      role: "columnheader",
      "aria-colindex": column.index + 1,
      className: clsx(cssClassnames.listViewCell, className, headerCellClass),
      ...props,
      children: [
        children ? children : headerRenderer({ column }),
        column.resizable && /* @__PURE__ */ jsx(
          "div",
          {
            className: cssClassnames.listViewResizeHandle,
            onPointerDown: handlePointerDown,
            onDoubleClick: handleDoubleClick
          }
        )
      ]
    }
  );
}
const ListViewHeaderCell = memo(forwardRef(HeaderCell));
function SortableHeaderCell({ column, children, ...props }, ref) {
  const { headerRenderer = () => column.name } = column;
  const sortStatus = useDefaultRenderers().sortStatus ?? SortStatus;
  const { sortColumn, onSort } = useRowSort();
  const sortDirection = sortColumn && sortColumn.columnKey === column.key ? sortColumn.direction : void 0;
  const handleClick = useCallback(
    (event) => {
      if (event.currentTarget !== event.target)
        return;
      onSort == null ? void 0 : onSort(
        sortDirection === void 0 ? { columnKey: column.key, direction: "ASC" } : sortDirection === "ASC" ? { columnKey: column.key, direction: "DESC" } : void 0
      );
    },
    [column, sortDirection, onSort]
  );
  return /* @__PURE__ */ jsxs(
    ListViewHeaderCell,
    {
      ref,
      column,
      "aria-sort": sortDirection ? sortDirection === "ASC" ? "ascending" : "descending" : void 0,
      ...props,
      children: [
        /* @__PURE__ */ jsx("div", { onClick: column.sortable ? handleClick : void 0, children: children ? children : headerRenderer({ column }) }),
        column.sortable && sortStatus({ sortDirection })
      ]
    }
  );
}
const ListViewSortableHeaderCell = memo(forwardRef(SortableHeaderCell));
function defaultHeaderCellRenderer(key, props) {
  return /* @__PURE__ */ jsx(ListViewSortableHeaderCell, { ...props }, key);
}
function SortStatus({ sortDirection }) {
  return sortDirection === void 0 ? null : /* @__PURE__ */ jsx(
    Chevron,
    {
      className: cssClassnames.listViewSortStatus,
      dir: sortDirection === "ASC" ? "up" : "down"
    }
  );
}
function HeaderRow({ columns, className, ...props }, ref) {
  const measureRef = useHeaderHeight();
  const refs = useMergeRefs(ref, measureRef);
  const renderers = useDefaultRenderers();
  const headerCell = renderers.headerCell ?? defaultHeaderCellRenderer;
  const headerCellContainer = renderers.headerCellContainer ?? defaultHeaderCellContainer;
  return /* @__PURE__ */ jsx(
    "div",
    {
      ref: refs,
      role: "row",
      "aria-rowindex": 1,
      className: clsx(cssClassnames.listViewHeaderRow, className),
      ...props,
      children: headerCellContainer({
        columns,
        children: columns.map((column) => headerCell == null ? void 0 : headerCell(column.key, { column }))
      })
    }
  );
}
const ListViewHeaderRow = memo(forwardRef(HeaderRow));
function defaultHeaderRowRenderer(props) {
  return /* @__PURE__ */ jsx(ListViewHeaderRow, { ...props });
}
function defaultHeaderCellContainer({ children }) {
  return /* @__PURE__ */ jsx(Fragment, { children });
}
function Cell({ column, row, rowFocused, rowSelected, className, ...props }, ref) {
  const { cellClass, renderer = defaultRenderer } = column;
  return /* @__PURE__ */ jsx(
    "div",
    {
      ref,
      role: "cell",
      className: clsx(
        cssClassnames.listViewCell,
        className,
        typeof cellClass === "function" ? cellClass(row) : cellClass
      ),
      ...props,
      children: renderer({ column, row, rowFocused, rowSelected })
    }
  );
}
const ListViewCell = memo(forwardRef(Cell));
function defaultCellRenderer(key, props) {
  return /* @__PURE__ */ jsx(ListViewCell, { ...props }, key);
}
function defaultRenderer({ column, row }) {
  const { key, valueGetter = (row2) => row2[key] } = column;
  return /* @__PURE__ */ jsx(Fragment, { children: valueGetter(row, column) });
}
function Row({
  columns,
  row,
  rowIndex,
  gridRowStart,
  canTabFocus,
  shouldFocus,
  selected,
  onRowFocus,
  onRowMouseDown,
  onRowMouseUp,
  onRowClick,
  onRowDoubleClick,
  onRowContextMenu,
  onRowDragStart,
  className,
  ...props
}, ref) {
  const internalRef = useRef(null);
  const refs = useMergeRefs(internalRef, ref);
  const containerElement = useFocusContainer();
  const renderers = useDefaultRenderers();
  const cellContainer = renderers.cellContainer ?? defaultCellContainer;
  const cellRenderer = renderers.cell ?? defaultCellRenderer;
  useLayoutEffect(() => {
    if (shouldFocus) {
      const { current } = internalRef;
      if (current) {
        current.scrollIntoView({ block: "nearest" });
        if (containerElement && containerElement.contains(document.activeElement)) {
          current.focus({ preventScroll: true });
        }
      }
    }
  }, [containerElement, shouldFocus]);
  const dataProps = {
    ["data-is-odd"]: rowIndex % 2 != 0 ? "" : void 0,
    ["data-is-even"]: rowIndex % 2 == 0 ? "" : void 0,
    ["data-is-selected"]: selected ? "" : void 0
  };
  return /* @__PURE__ */ jsx(
    "div",
    {
      ref: refs,
      role: "row",
      "aria-rowindex": rowIndex + 2,
      "aria-selected": selected,
      className: clsx$1(
        cssClassnames.listViewRow,
        {
          [cssClassnames.listViewRowSelected]: selected,
          [cssClassnames.listViewRowFocused]: shouldFocus
        },
        className
      ),
      tabIndex: canTabFocus ? 0 : -1,
      style: { gridRowStart },
      onFocus: (event) => onRowFocus == null ? void 0 : onRowFocus(event, row),
      onMouseDown: (event) => onRowMouseDown == null ? void 0 : onRowMouseDown(event, row),
      onMouseUp: (event) => onRowMouseUp == null ? void 0 : onRowMouseUp(event, row),
      onClick: (event) => onRowClick == null ? void 0 : onRowClick(event, row),
      onDoubleClick: (event) => onRowDoubleClick == null ? void 0 : onRowDoubleClick(event, row),
      onContextMenu: (event) => onRowContextMenu == null ? void 0 : onRowContextMenu(event, row),
      draggable: onRowDragStart ? true : void 0,
      onDragStart: (event) => onRowDragStart == null ? void 0 : onRowDragStart(event, row),
      ...props,
      ...dataProps,
      children: cellContainer({
        columns,
        row,
        rowIndex,
        focused: shouldFocus,
        selected,
        children: columns.map(
          (col) => cellRenderer(col.key, {
            column: col,
            row,
            rowFocused: shouldFocus,
            rowSelected: selected
          })
        )
      })
    }
  );
}
const ListViewRow = memo(forwardRef(Row));
function defaultRowRenderer(key, props) {
  return /* @__PURE__ */ jsx(ListViewRow, { ...props }, key);
}
function defaultCellContainer({ children }) {
  return /* @__PURE__ */ jsx(Fragment, { children });
}
function ListView({
  columns: rawColumns,
  rows: rawRows,
  rowHeight = 26,
  noBorder,
  defaultColumnOptions,
  rowKey,
  focusedRow: propFocusedRow,
  onFocusedRowChange,
  selectedRows: propSelectedRows,
  onSelectedRowsChange,
  sortColumn: propSortColumn,
  onSortColumnChange,
  onColumnResize,
  onRowClick,
  onRowDoubleClick,
  onRowContextMenu,
  onRowDragStart,
  className,
  style,
  ...props
}, refHandle) {
  const defaultRenderers = useDefaultRenderers();
  const headerRowRenderer = defaultRenderers.headerRow ?? defaultHeaderRowRenderer;
  const rowContainer = defaultRenderers.rowContainer ?? defaultRowContainer;
  const rowRenderer = defaultRenderers.row ?? defaultRowRenderer;
  const noRowsFallback = defaultRenderers == null ? void 0 : defaultRenderers.noRowsFallback;
  const { columns, setColumnWidths, gridTemplateColumns } = useCalculatedColumns(
    rawColumns,
    defaultColumnOptions
  );
  const [sortColumn, setSortColumn] = useState(propSortColumn);
  const rows = useMemo(() => {
    if (sortColumn === void 0)
      return rawRows;
    const column = new Map(columns.map((col) => [col.key, col])).get(sortColumn.columnKey);
    if (column === void 0)
      return rawRows;
    return [...rawRows].sort((a, b) => {
      const comparator = column.comparator ?? getDefaultComparator(column);
      const result = comparator(a, b);
      if (result !== 0) {
        return sortColumn.direction === "ASC" ? result : -result;
      }
      return 0;
    });
  }, [rawRows, columns, sortColumn]);
  const { getByRow, getIndexByKey } = useRowKey(rows, rowKey);
  const [focusedRow, setFocusedRow] = useState(propFocusedRow);
  const focusedRowIndex = getIndexByKey(focusedRow) ?? -1;
  const [selectedRows, setSelectedRows] = useSelectedRows(propSelectedRows);
  const [shiftKeyHeldRow, setShiftKeyHeldRow] = useState();
  const [headerHeight, setHeaderHeight] = useState(0);
  const ref = useRef(null);
  const [refs, viewportHeight, viewportRows] = useViewportRows(
    ref,
    rows,
    rowHeight,
    headerHeight,
    focusedRowIndex
  );
  useImperativeHandle(
    refHandle,
    () => ({
      element: ref.current,
      scrollToRow: (rowIndex) => {
        if (rowIndex >= 0 && rowIndex <= rows.length - 1) {
          setFocusedRow(getByRow(rows[rowIndex]));
        }
      }
    }),
    [ref, rows, getByRow]
  );
  useDebounce(() => onFocusedRowChange == null ? void 0 : onFocusedRowChange(focusedRow), 50, [focusedRow]);
  useDebounce(() => onSelectedRowsChange == null ? void 0 : onSelectedRowsChange(selectedRows), 50, [selectedRows]);
  useLayoutEffect(() => {
    if (focusedRow && focusedRowIndex < 0) {
      setFocusedRow(void 0);
    }
  }, [focusedRow, focusedRowIndex]);
  useLayoutEffect(() => setFocusedRow(propFocusedRow), [propFocusedRow]);
  useLayoutEffect(() => setSortColumn(propSortColumn), [propSortColumn]);
  useLayoutEffect(() => setShiftKeyHeldRow(void 0), [rows]);
  const [columnResizeEventArgs, setColumnResizeEventArgs] = useState();
  const handleColumnResize = useCallback(
    (column, width) => {
      setColumnWidths(column.key, width);
      setColumnResizeEventArgs([column, width]);
    },
    [setColumnWidths]
  );
  useDebounce(() => columnResizeEventArgs && (onColumnResize == null ? void 0 : onColumnResize(...columnResizeEventArgs)), 500, [
    columnResizeEventArgs
  ]);
  function handleKeyDown(event) {
    const { key, code, shiftKey, ctrlKey } = event;
    if (ctrlKey && code == "KeyA") {
      event.preventDefault();
      setSelectedRows(rows.map(getByRow));
    } else if (code === "Space") {
      event.preventDefault();
      if (focusedRow !== void 0) {
        const selected = new Set(selectedRows);
        if (selected.has(focusedRow) && ctrlKey) {
          selected.delete(focusedRow);
        } else {
          selected.add(focusedRow);
        }
        setSelectedRows(Array.from(selected));
        setShiftKeyHeldRow(focusedRow);
      }
    } else {
      const getClampedNext = (index2) => {
        function clamp(i) {
          return Math.min(Math.max(i, 0), rows.length - 1);
        }
        switch (key) {
          case "ArrowUp":
            return clamp(index2 - 1);
          case "ArrowDown":
            return clamp(index2 + 1);
          case "Home":
            return 0;
          case "End":
            return rows.length - 1;
          case "PageUp": {
            const nextRowY = index2 * rowHeight + rowHeight - viewportHeight;
            return clamp(Math.floor(nextRowY / rowHeight));
          }
          case "PageDown": {
            const nextRowY = index2 * rowHeight + viewportHeight;
            return clamp(Math.floor(nextRowY / rowHeight));
          }
          default:
            return false;
        }
      };
      const rowIndex = getClampedNext(focusedRowIndex);
      if (rowIndex !== false && rowIndex != focusedRowIndex) {
        event.preventDefault();
        const rowKey2 = getByRow(rows[rowIndex]);
        setFocusedRow(rowKey2);
        if (shiftKey) {
          const selected = range(getIndexByKey(shiftKeyHeldRow) ?? 0, rowIndex).map(
            (i) => getByRow(rows[i])
          );
          setSelectedRows(selected, ctrlKey);
        } else if (!ctrlKey) {
          setSelectedRows([rowKey2]);
          setShiftKeyHeldRow(rowKey2);
        }
      }
    }
  }
  const handleRowFocus = useCallback(
    (event, row) => {
      setFocusedRow(getByRow(row));
    },
    [getByRow]
  );
  const handleRowMouseDown = useCallback(
    (event, row) => {
      const { shiftKey, ctrlKey } = event;
      if (!shiftKey && !ctrlKey) {
        const rowKey2 = getByRow(row);
        if (!new Set(selectedRows).has(rowKey2)) {
          setSelectedRows([rowKey2]);
          setShiftKeyHeldRow(rowKey2);
        }
      }
    },
    [getByRow, selectedRows, setSelectedRows]
  );
  const handleRowMouseUp = useCallback(
    (event, row) => {
      const { button, shiftKey, ctrlKey } = event;
      if (button !== 2) {
        if (shiftKey) {
          const rowIndex = rows.indexOf(row);
          const selected = range(getIndexByKey(shiftKeyHeldRow) ?? 0, rowIndex).map(
            (i) => getByRow(rows[i])
          );
          setSelectedRows(selected, ctrlKey);
        } else {
          const rowKey2 = getByRow(row);
          const selected = new Set(selectedRows);
          if (ctrlKey) {
            if (selected.has(rowKey2)) {
              selected.delete(rowKey2);
            } else {
              selected.add(rowKey2);
            }
            setSelectedRows(Array.from(selected));
          } else if (selected.size > 1 || !selected.has(rowKey2)) {
            setSelectedRows([rowKey2]);
          }
          setShiftKeyHeldRow(rowKey2);
        }
      }
    },
    [getByRow, getIndexByKey, rows, selectedRows, setSelectedRows, shiftKeyHeldRow]
  );
  const layoutCssVars = {
    "--relv-line-height": `${rowHeight}px`,
    "--relv-header-height": `${headerHeight}px`,
    "--relv-grid-template-columns": gridTemplateColumns
  };
  if (noBorder) {
    layoutCssVars["--relv-border-width"] = "none";
  }
  const rowGroupCss = {};
  if (rows.length > 0) {
    rowGroupCss["gridTemplateRows"] = `repeat(${rows.length || 1}, ${rowHeight}px)`;
  }
  const selectedSet = new Set(selectedRows);
  const refContainer = useRef(null);
  return /* @__PURE__ */ jsxs(
    "div",
    {
      ref: refs,
      role: "table",
      "aria-rowcount": rows.length + 1,
      "aria-multiselectable": true,
      className: clsx(cssClassnames.listView, className),
      style: {
        ...style,
        ...layoutCssVars
      },
      ...props,
      children: [
        /* @__PURE__ */ jsx(
          RowSortProvider,
          {
            value: {
              sortColumn,
              onSort: (sortColumn2) => {
                setSortColumn(sortColumn2);
                onSortColumnChange == null ? void 0 : onSortColumnChange(sortColumn2);
              }
            },
            children: /* @__PURE__ */ jsx(HeaderHeightProvider, { value: { onHeaderHeightResize: setHeaderHeight }, children: /* @__PURE__ */ jsx(ColumnResizeProvider, { value: { onColumnResize: handleColumnResize }, children: /* @__PURE__ */ jsx("div", { role: "rowgroup", className: cssClassnames.listViewHeader, children: headerRowRenderer({ columns }) }) }) })
          }
        ),
        /* @__PURE__ */ jsx(
          "div",
          {
            ref: refContainer,
            role: "rowgroup",
            className: cssClassnames.listViewBody,
            style: rowGroupCss,
            onKeyDown: handleKeyDown,
            children: /* @__PURE__ */ jsx(FocusContainerProvider, { value: refContainer.current, children: rowContainer({
              rows,
              children: rows.length === 0 ? noRowsFallback : viewportRows.map((i) => ({ rowIndex: i, row: rows[i], rowKey: getByRow(rows[i]) })).map(
                ({ rowIndex, row, rowKey: rowKey2 }) => rowRenderer(rowKey2, {
                  columns,
                  row,
                  rowIndex,
                  gridRowStart: rowIndex + 1,
                  canTabFocus: focusedRow !== void 0 ? focusedRow === rowKey2 : rowIndex == 0,
                  shouldFocus: focusedRow !== void 0 ? focusedRow === rowKey2 : false,
                  selected: selectedSet.has(rowKey2),
                  onRowFocus: handleRowFocus,
                  onRowMouseDown: handleRowMouseDown,
                  onRowMouseUp: handleRowMouseUp,
                  onRowClick,
                  onRowDoubleClick,
                  onRowContextMenu,
                  onRowDragStart
                })
              )
            }) })
          }
        )
      ]
    }
  );
}
const ListView$1 = forwardRef(ListView);
function defaultRowContainer({ children }) {
  return /* @__PURE__ */ jsx(Fragment, { children });
}
const index = "";
export {
  ColumnResizeProvider,
  DefaultRenderersProvider,
  HeaderHeightProvider,
  ListViewCell,
  ListViewHeaderCell,
  ListViewHeaderRow,
  ListViewRow,
  ListViewSortableHeaderCell,
  RowSortProvider,
  SortStatus,
  cssClassnames,
  ListView$1 as default,
  defaultCellRenderer,
  defaultHeaderCellRenderer,
  defaultHeaderRowRenderer,
  defaultRowRenderer,
  getDefaultComparator,
  range,
  reorder,
  sortBy,
  useColumnResize,
  useDefaultRenderers,
  useHeaderHeight,
  useRowSort
};
//# sourceMappingURL=index.js.map
