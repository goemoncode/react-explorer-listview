import { useCallback, useId, useState } from 'react';

interface InputNumberProps {
  label: string;
  defaultValue: number;
  min: number;
  max: number;
  onEnter: (value: number) => void;
}

export function NumberInput({ label, defaultValue, min, max, onEnter }: InputNumberProps) {
  const htmlId = useId();
  const [value, setValue] = useState(defaultValue);
  const onKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (
        (event.code == 'Enter' || event.code == 'NumpadEnter') &&
        !Number.isNaN(value) &&
        min <= value &&
        value <= max
      ) {
        onEnter(value);
      }
    },
    [onEnter, value, min, max]
  );
  return (
    <>
      <label htmlFor={htmlId}>{label}</label>
      <input
        id={htmlId}
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(event) => setValue(event.target.valueAsNumber)}
        onKeyDown={onKeyDown}
      />
    </>
  );
}

interface ActionButtonProps {
  label: string;
  onClick: () => void;
}

export function ActionButton({ label, onClick }: ActionButtonProps) {
  const htmlId = useId();
  return (
    <>
      <label htmlFor={htmlId}>{label}</label>
      <button id={htmlId} type="button" onClick={onClick}>
        {label}
      </button>
    </>
  );
}

interface CheckBoxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function CheckBox({ label, checked, onChange }: CheckBoxProps) {
  const htmlId = useId();
  return (
    <>
      <label htmlFor={htmlId}>{label}</label>
      <input
        id={htmlId}
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
    </>
  );
}
