import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDebounce } from 'react-use';
import ListView, {
  CalculatedColumn,
  DefaultRenderers,
  DefaultRenderersProvider,
  ListViewHandle,
  ListViewHeaderRow,
  ListViewRow,
  reorder,
  SortColumn,
  useDefaultRowSort,
  useRows,
} from '../src/';
import { NumberInput, ActionButton, CheckBox } from './components/FormControl';
import {
  DnDKitHeaderCell,
  DnDKitHeaderCellContainer,
  ColumnReorderProvider,
} from './components/ColumnReorder';
import { DemoRow, createColumns, useDemoRows } from './props';
import {
  InputTextFilter,
  InputSizeFilter,
  RowFilterHeader,
  RowFilterParams,
  RowFilterProvider,
  SelectTypeFilter,
  InputDateFilter,
} from './components/RowFilter';
import { CheckMark, ContextMenu, useContextMenu } from './components/ContextMenu';
import clsx from 'clsx';
import Github from './assets/github.svg?react';

export default function App() {
  const [rows, setRows] = useDemoRows();
  const fileTypes = useMemo(
    () => Array.from(new Set(rows.map((x) => x.fileType)).values()),
    [rows]
  );
  const initColumns = useMemo(() => {
    return createColumns({
      fileName: {
        headerRenderer: (props) => (
          <RowFilterHeader
            {...props}
            inputRenderer={(ctx) => <InputTextFilter name="fileName" {...ctx} />}
          />
        ),
      },
      fileType: {
        headerRenderer: (props) => (
          <RowFilterHeader
            {...props}
            inputRenderer={(ctx) => <SelectTypeFilter options={fileTypes} {...ctx} />}
          />
        ),
      },
      fileSize: {
        headerRenderer: (props) => (
          <RowFilterHeader
            {...props}
            inputRenderer={(ctx) => <InputSizeFilter min={0} max={1e5} {...ctx} />}
          />
        ),
      },
      createTimeMs: {
        headerRenderer: (props) => (
          <RowFilterHeader
            {...props}
            inputRenderer={(ctx) => <InputDateFilter name="createTimeMs" {...ctx} />}
          />
        ),
      },
      updateTimeMs: {
        headerRenderer: (props) => (
          <RowFilterHeader
            {...props}
            inputRenderer={(ctx) => <InputDateFilter name="updateTimeMs" {...ctx} />}
          />
        ),
      },
      directoryPath: {
        headerRenderer: (props) => (
          <RowFilterHeader
            {...props}
            inputRenderer={(ctx) => <InputTextFilter name="directoryPath" {...ctx} />}
          />
        ),
      },
    });
  }, [fileTypes]);
  const [columnReorderEnabled, setColumnReorderEnabled] = useState(true);
  const [columns, setColumns] = useState(initColumns);
  const [sortColumn, setSortColumn] = useState<SortColumn>();
  const sortedRows = useDefaultRowSort(rows, initColumns, sortColumn);
  const initFilter = useMemo<() => RowFilterParams>(
    () => () => ({
      fileName: '',
      fileType: '',
      fileSize: 1e5,
    }),
    []
  );
  const [filterVisible, setFilterVisible] = useState(false);
  const [filterParams, setFilterParams] = useState<RowFilterParams>(initFilter);
  const [filteredRows, setFilteredRows] = useState<DemoRow[]>(rows);
  useDebounce(
    () => {
      const rows = sortedRows.filter((r) => {
        return (
          (filterParams.fileName ? r.fileName.includes(filterParams.fileName) : true) &&
          (filterParams.fileType ? r.fileType === filterParams.fileType : true) &&
          (filterParams.fileSize ? r.fileSize <= filterParams.fileSize : true) &&
          (filterParams.createTimeMs ? r.createTimeMs <= filterParams.createTimeMs : true) &&
          (filterParams.updateTimeMs ? r.updateTimeMs <= filterParams.updateTimeMs : true) &&
          (filterParams.directoryPath ? r.directoryPath.includes(filterParams.directoryPath) : true)
        );
      });
      setFilteredRows(rows);
    },
    50,
    [sortedRows, filterParams]
  );

  const ref = useRef<ListViewHandle>(null);

  const onColumnResize = useCallback((column: CalculatedColumn<DemoRow>, width: number) => {
    setColumns((columns) => columns.map((col, i) => (i == column.index ? { ...col, width } : col)));
  }, []);

  useEffect(() => {
    setColumnReorderEnabled(!filterVisible);
  }, [filterVisible]);

  useEffect(() => {
    setColumns(initColumns);
  }, [initColumns]);

  const onReset = useCallback(() => {
    setColumns(initColumns);
    setSortColumn(undefined);
    setFilterVisible(false);
    setFilterParams(initFilter);
  }, [initColumns, initFilter]);

  const [handleContextMenu, handleClick, contextMenuProps] = useContextMenu<HTMLDivElement>();

  const renderers = useMemo<DefaultRenderers<DemoRow>>(() => {
    function onColumnReorder(picked: keyof DemoRow, over: keyof DemoRow) {
      setColumns((columns) => reorder(columns, picked, over));
    }
    return {
      headerRow: (props) => (
        <>
          <ListViewHeaderRow {...props} onContextMenu={handleContextMenu} />
          <ContextMenu {...contextMenuProps}>
            {columns.map(({ key, name, visible = true }) => (
              <div
                key={key}
                className={clsx('contextmenu--item', {
                  checked: visible,
                  disabled: key === 'fileName',
                })}
                onClick={handleClick(() => {
                  setColumns((columns) =>
                    columns.map((col) => (col.key === key ? { ...col, visible: !visible } : col))
                  );
                })}
              >
                <CheckMark className="contextmenu--icon" />
                {name}
              </div>
            ))}
          </ContextMenu>
        </>
      ),
      headerCellContainer: (props) => (
        <DnDKitHeaderCellContainer onColumnReorder={onColumnReorder} {...props} />
      ),
      headerCell: (key, props) => <DnDKitHeaderCell key={key} {...props} />,
      row(key, { row, ...props }) {
        return (
          <ListViewRow
            key={key}
            row={row}
            {...props}
            onClick={() => console.log(`[click] id=${row.id}`)}
            onDoubleClick={() => console.log(`[doubleclick] id=${row.id}`)}
            onContextMenu={() => console.log(`[contextmenu] id=${row.id}`)}
          />
        );
      },
      noRowsFallback: (
        <div className="noRows">
          <div>(´・ω・｀)</div>
        </div>
      ),
    };
  }, [columns, contextMenuProps, handleClick, handleContextMenu]);

  const [focusedRow, setFocusedRow] = useState<number>();
  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'Delete') {
      const set = new Set(selectedRows);
      let rowid = sortedRows.find((row) => !set.has(row.id))?.id;
      const map = new Map(
        sortedRows.map((row) => {
          if (!set.has(row.id)) rowid = row.id;
          return [row.id, rowid];
        })
      );
      setFocusedRow((rowid) => (rowid ? map.get(rowid) : undefined));
      setTimeout(() => {
        setRows((rows) => rows.filter((row) => !set.has(row.id)));
      });
    }
  }

  const rowsProps = useRows(filteredRows, (row) => row.id);

  const rowFilterContextValue = useMemo(
    () => ({
      params: filterParams,
      visible: filterVisible,
      onChange: setFilterParams,
    }),
    [filterParams, filterVisible]
  );

  return (
    <div className="demo app">
      <div className="side">
        <h1>React Explorer ListView</h1>
        <fieldset>
          <NumberInput
            defaultValue={5000}
            min={1}
            max={rows.length}
            label="行ジャンプ"
            onEnter={(value) => ref.current?.scrollToRow(value - 1)}
          />
          <CheckBox label="行フィルタ" checked={filterVisible} onChange={setFilterVisible} />
          <ActionButton label="リセット" onClick={onReset} />
        </fieldset>
        <div className="link">
          <a
            href="https://github.com/goemoncode/react-explorer-listview"
            target="_blank"
            rel="noreferrer"
          >
            <Github className="github" />
          </a>
        </div>
      </div>
      <DefaultRenderersProvider value={renderers}>
        <ColumnReorderProvider value={columnReorderEnabled}>
          <RowFilterProvider value={rowFilterContextValue}>
            <ListView
              ref={ref}
              {...rowsProps}
              columns={columns}
              defaultColumnOptions={{
                sortable: true,
                resizable: true,
                headerCellClass: 'filter-cell',
              }}
              sortColumn={sortColumn}
              onColumnResize={onColumnResize}
              onSortColumnChange={setSortColumn}
              focusedRow={focusedRow}
              onFocusedRowChange={setFocusedRow}
              selectedRows={selectedRows}
              onSelectedRowsChange={setSelectedRows}
              onKeyDown={handleKeyDown}
            />
          </RowFilterProvider>
        </ColumnReorderProvider>
      </DefaultRenderersProvider>
    </div>
  );
}
