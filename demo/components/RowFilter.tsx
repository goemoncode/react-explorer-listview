import { createContext, useContext } from 'react';
import { ConditionalKeys } from 'type-fest';
import { HeaderCellRendererProps } from '../../src';
import { DemoRow } from '../props';

export type RowFilterParams = Partial<Omit<DemoRow, 'id'>>;

export interface RowFilterContext {
  params: RowFilterParams;
  visible: boolean;
  onChange?: (params: RowFilterParams) => void;
}

const Context = createContext<RowFilterContext>({ params: {}, visible: false });
export const RowFilterProvider = Context.Provider;

export function RowFilterHeader<R>({
  column,
  inputRenderer,
}: HeaderCellRendererProps<R> & {
  inputRenderer: (context: RowFilterContext) => React.ReactNode;
}) {
  const context = useContext(Context);
  return (
    <>
      {column.name}
      {context.visible && <div className="filter-input">{inputRenderer(context)}</div>}
    </>
  );
}

export function InputTextFilter({
  name,
  params,
  onChange,
}: RowFilterContext & { name: ConditionalKeys<RowFilterParams, string | undefined> }) {
  return (
    <input
      type="text"
      value={params[name]}
      onChange={(e) =>
        onChange?.({
          ...params,
          [name]: e.target.value,
        })
      }
    />
  );
}

export function InputDateFilter({
  name,
  params,
  onChange,
}: RowFilterContext & { name: ConditionalKeys<RowFilterParams, Date | undefined> }) {
  return (
    <input
      type="date"
      value={params[name]?.toISOString().split('T')[0] ?? ''}
      onChange={(e) =>
        onChange?.({
          ...params,
          [name]: e.target.valueAsDate,
        })
      }
    />
  );
}

export function SelectTypeFilter({
  options,
  params,
  onChange,
}: RowFilterContext & { options: string[] }) {
  return (
    <select
      value={params.fileType}
      onChange={(e) =>
        onChange?.({
          ...params,
          fileType: e.target.value,
        })
      }
    >
      <option value=""></option>
      {options.map((type) => (
        <option key={type} value={type}>
          {type}
        </option>
      ))}
    </select>
  );
}

export function InputSizeFilter({
  min,
  max,
  params,
  onChange,
}: RowFilterContext & { min: number; max: number }) {
  return (
    <input
      type="range"
      value={params.fileSize}
      min={min}
      max={max}
      onChange={(e) =>
        onChange?.({
          ...params,
          fileSize: e.target.valueAsNumber,
        })
      }
    />
  );
}
