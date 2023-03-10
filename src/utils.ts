import { Column, Comparator } from './types';

export function range(from: number, to: number) {
  return Array.from({ length: Math.abs(from - to) + 1 }, (v, k) => Math.min(from, to) + k);
}

export function sortBy<T>(elements: T[], key: keyof T) {
  return [...elements].sort((a, b) => {
    return a[key] === b[key] ? 0 : a[key] > b[key] ? 1 : -1;
  });
}

export function reorder<R>(
  columns: readonly Column<R>[],
  picked: Column<R>['key'],
  over: Column<R>['key']
): Column<R>[] {
  const tmp = sortBy(
    columns.map(({ key, order }, index) => ({ key, order, index })),
    'order'
  );
  const oldPos = tmp.findIndex((x) => x.key == picked);
  const newPos = tmp.findIndex((x) => x.key == over);
  tmp.splice(newPos < 0 ? tmp.length + newPos : newPos, 0, tmp.splice(oldPos, 1)[0]);
  const newOrder = new Map(tmp.map((x, i) => [x.index, i]));
  return columns.map((x, i) => ({ ...x, order: newOrder.get(i) }));
}

export function getDefaultComparator<R>(column: Column<R>): Comparator<R> {
  const { key, valueGetter = (row) => row[key as keyof R] } = column;
  return (a, b) => {
    const value1 = valueGetter(a, column);
    const value2 = valueGetter(b, column);
    if (value1 !== undefined && value2 === undefined) {
      return 1;
    } else if (value1 === undefined && value2 !== undefined) {
      return -1;
    } else {
      return value1 === value2 ? 0 : value1 > value2 ? 1 : -1;
    }
  };
}
