import { useEffect, useState } from 'react';
import { Column, CellRendererProps } from '../src';
import dayjs from 'dayjs';

export interface DemoRow {
  id: number;
  icon: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  createTimeMs: Date;
  updateTimeMs: Date;
  directoryPath: string;
}

export function createColumns(columns: {
  [key in keyof DemoRow]?: Partial<Column<DemoRow>> | undefined;
}): Column<DemoRow>[] {
  return [
    {
      ...columns.fileName,
      name: '名前',
      key: 'fileName',
      width: 250,
      preferredWidth: 250,
      cellClass: 'fileName-cell',
      renderer: FileNameCell,
    },
    { ...columns.fileType, name: '種類', key: 'fileType', width: 80, preferredWidth: 80 },
    {
      ...columns.fileSize,
      name: 'サイズ',
      key: 'fileSize',
      width: 100,
      preferredWidth: 100,
      cellClass: 'align-end',
      renderer: ({ row }) => formatBytes(row.fileSize * 1024),
    },
    {
      ...columns.createTimeMs,
      name: '作成日時',
      key: 'createTimeMs',
      width: 120,
      preferredWidth: 120,
      renderer: ({ row }) => dayjs(row.createTimeMs).format('YYYY/MM/DD HH:mm'),
    },
    {
      ...columns.updateTimeMs,
      name: '更新日時',
      key: 'updateTimeMs',
      width: 120,
      preferredWidth: 120,
      renderer: ({ row }) => dayjs(row.updateTimeMs).format('YYYY/MM/DD HH:mm'),
    },
    {
      ...columns.directoryPath,
      name: '場所',
      key: 'directoryPath',
      width: 120,
      preferredWidth: 120,
    },
  ];
}

function FileNameCell({ row: { icon, fileName } }: CellRendererProps<DemoRow>) {
  return (
    <>
      <span className="fileName-icon">{icon}</span>
      <span className="fileName-text">{fileName}</span>
    </>
  );
}

function formatBytes(bytes: number, decimals = 2) {
  if (bytes == 0) return '';
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return parseFloat((bytes / Math.pow(1024, i)).toFixed(decimals)) + ' ' + sizes[i];
}

function rand(min: number, max: number) {
  return min + Math.floor((max - min) * Math.random());
}

export function createRows() {
  const rows: DemoRow[] = [];
  for (let id = 1; id < 100000; id++) {
    rows.push({
      id,
      icon: '📃',
      fileName: 'test' + ('000000' + id).slice(-5),
      fileType: 'txt',
      fileSize: rand(1e2, 1e5),
      createTimeMs: new Date(rand(Date.now() - 864e5 * 60, Date.now() - 864e5 * 90)),
      updateTimeMs: new Date(rand(Date.now() - 864e5 * 30, Date.now())),
      directoryPath: '/root',
    });
  }
  return rows;
}

export function useDemoRows() {
  // return useState<DemoRow[]>(createRows);
  const useStateReturn = useState<DemoRow[]>([]);
  const [, setRows] = useStateReturn;
  useEffect(() => {
    (async () => {
      const rows = await fetch('demo.json').then<DemoRow[]>((res) => res.json());
      setRows(rows);
    })();
  }, [setRows]);
  return useStateReturn;
}
