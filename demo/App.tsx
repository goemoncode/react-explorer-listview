import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ListView, {
  CalculatedColumn,
  DefaultRenderers,
  DefaultRenderersProvider,
  ListViewHandle,
  ListViewHeaderRow,
  reorder,
  SortColumn,
} from '../src/';
import { NumberInput, ActionButton, CheckBox } from './components/FormControl';
import {
  DnDKitHeaderCell,
  DnDKitHeaderCellContainer,
  ColumnReorderProvider,
} from './components/ColumnReorder';
import { createRows, DemoRow, createColumns } from './props';
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
import { ReactComponent as Github } from './assets/github.svg';

export default function App() {
  const [rows] = useState(createRows);
  const fileTypes = useMemo(
    () => Array.from(new Set(rows.map((x) => x.fileType)).values()),
    [rows]
  );
  const minFileSize = useMemo(() => Math.min(...rows.map((x) => x.fileSize ?? 0)), [rows]);
  const maxFileSize = useMemo(() => Math.max(...rows.map((x) => x.fileSize ?? 0)), [rows]);
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
            inputRenderer={(ctx) => (
              <InputSizeFilter min={minFileSize} max={maxFileSize} {...ctx} />
            )}
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
  }, [fileTypes, minFileSize, maxFileSize]);
  const initFilter = useMemo<() => RowFilterParams>(
    () => () => ({
      fileName: '',
      fileType: '',
      fileSize: maxFileSize,
    }),
    [maxFileSize]
  );
  const [filterVisible, setFilterVisible] = useState(false);
  const [filterParams, setFilterParams] = useState<RowFilterParams>(initFilter);
  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      return (
        (filterParams.fileName ? r.fileName.includes(filterParams.fileName) : true) &&
        (filterParams.fileType ? r.fileType === filterParams.fileType : true) &&
        (filterParams.fileSize ? r.fileSize <= filterParams.fileSize : true) &&
        (filterParams.createTimeMs ? r.createTimeMs <= filterParams.createTimeMs : true) &&
        (filterParams.updateTimeMs ? r.updateTimeMs <= filterParams.updateTimeMs : true) &&
        (filterParams.directoryPath ? r.directoryPath.includes(filterParams.directoryPath) : true)
      );
    });
  }, [rows, filterParams]);
  const [columnReorderEnabled, setColumnReorderEnabled] = useState(true);
  const [columns, setColumns] = useState(initColumns);
  const [sortColumn, setSortColumn] = useState<SortColumn>();
  const ref = useRef<ListViewHandle>(null);

  const onColumnResize = useCallback((column: CalculatedColumn<DemoRow>, width: number) => {
    setColumns((columns) => columns.map((col, i) => (i == column.index ? { ...col, width } : col)));
  }, []);

  useEffect(() => {
    setColumnReorderEnabled(!filterVisible);
  }, [filterVisible]);

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
      noRowsFallback: (
        <div className="noRows">
          <div>(´・ω・｀)</div>
        </div>
      ),
    };
  }, [columns, contextMenuProps, handleClick, handleContextMenu]);

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
          <RowFilterProvider
            value={{ params: filterParams, visible: filterVisible, onChange: setFilterParams }}
          >
            <ListView
              ref={ref}
              columns={columns}
              rowHeight={26}
              rows={filteredRows}
              rowKey={(row) => row.id}
              sortColumn={sortColumn}
              defaultColumnOptions={{
                sortable: true,
                resizable: true,
                headerCellClass: 'filter-cell',
              }}
              onColumnResize={onColumnResize}
              onSortColumnChange={setSortColumn}
            />
          </RowFilterProvider>
        </ColumnReorderProvider>
      </DefaultRenderersProvider>
    </div>
  );
}
