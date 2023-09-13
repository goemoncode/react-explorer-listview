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

export function createRows() {
  const faker = window.faker;
  const rows: DemoRow[] = [];

  for (let id = 1; id <= 100000; id++) {
    rows.push({
      id,
      icon: faker.internet.emoji(),
      fileName: faker.system.commonFileName().split('.')[0],
      fileType: faker.system.commonFileExt(),
      fileSize: faker.number.int({ min: 1e2, max: 1e5 }),
      createTimeMs: faker.date.between({
        from: Date.now() - 864e5 * 90,
        to: Date.now() - 864e5 * 60,
      }),
      updateTimeMs: faker.date.between({ from: Date.now() - 864e5 * 30, to: Date.now() }),
      directoryPath: faker.system.directoryPath(),
    });
  }
  return rows;
}
