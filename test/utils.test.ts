import { describe, expect, it, test } from 'vitest';
import { Column, getDefaultComparator, range, reorder, sortBy } from '../src';

function createColumns(): Column<unknown>[] {
  return [
    { key: 'colA', name: '5' },
    { key: 'colB', name: '4' },
    { key: 'colC', name: '3' },
    { key: 'colD', name: '2' },
    { key: 'colE', name: '1' },
  ];
}

test('range', () => {
  expect(range(1, 5)).toEqual([1, 2, 3, 4, 5]);
  expect(range(15, 10)).toEqual([10, 11, 12, 13, 14, 15]);
});

test('sortBy', () => {
  const columns = createColumns();
  expect(sortBy(columns, 'name')).toEqual([
    { key: 'colE', name: '1' },
    { key: 'colD', name: '2' },
    { key: 'colC', name: '3' },
    { key: 'colB', name: '4' },
    { key: 'colA', name: '5' },
  ]);
});

test('reorder', () => {
  const columns = createColumns();
  expect(reorder(columns, 'colA', 'colB')).toEqual([
    { key: 'colA', name: '5', order: 1 },
    { key: 'colB', name: '4', order: 0 },
    { key: 'colC', name: '3', order: 2 },
    { key: 'colD', name: '2', order: 3 },
    { key: 'colE', name: '1', order: 4 },
  ]);
  expect(reorder(columns, 'colB', 'colE')).toEqual([
    { key: 'colA', name: '5', order: 0 },
    { key: 'colB', name: '4', order: 4 },
    { key: 'colC', name: '3', order: 1 },
    { key: 'colD', name: '2', order: 2 },
    { key: 'colE', name: '1', order: 3 },
  ]);
});

describe('getDefaultComparator', () => {
  it('string value', () => {
    const comparator = getDefaultComparator({ key: 'col', name: '' });
    expect(comparator({ col: 'abc' }, { col: 'abc' })).toEqual(0);
    expect(comparator({ col: undefined }, { col: undefined })).toEqual(0);
    expect(comparator({ col: '123' }, { col: 'abc' })).toEqual(-1);
    expect(comparator({ col: undefined }, { col: 'abc' })).toEqual(-1);
    expect(comparator({ col: 'abc' }, { col: '123' })).toEqual(1);
    expect(comparator({ col: 'abc' }, { col: undefined })).toEqual(1);
  });
  it('number value', () => {
    const comparator = getDefaultComparator({ key: 'col', name: '' });
    expect(comparator({ col: 1 }, { col: 1 })).toEqual(0);
    expect(comparator({ col: undefined }, { col: undefined })).toEqual(0);
    expect(comparator({ col: 1 }, { col: 2 })).toEqual(-1);
    expect(comparator({ col: undefined }, { col: 1 })).toEqual(-1);
    expect(comparator({ col: 2 }, { col: 1 })).toEqual(1);
    expect(comparator({ col: 1 }, { col: undefined })).toEqual(1);
  });
  it('valueGetter', () => {
    const comparator = getDefaultComparator({
      key: 'colA',
      name: '',
      valueGetter: (row) => row.colB,
    } as Column<{ colA: string; colB: number }>);
    expect(comparator({ colA: '', colB: 1 }, { colA: '', colB: 1 })).toEqual(0);
    expect(comparator({ colA: '', colB: 2 }, { colA: '', colB: 1 })).toEqual(1);
    expect(comparator({ colA: '', colB: 1 }, { colA: '', colB: 2 })).toEqual(-1);
  });
});
