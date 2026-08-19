import type { ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { useId } from 'react';
import { cn } from '@/shared/lib';

export interface SelectFieldOption { label: string; value: string }

export interface SelectFieldProps {
  className?: string;
  label: ReactNode;
  onChange: (value: string) => void;
  options: SelectFieldOption[];
  placeholder?: string;
  value: string;
}

export function SelectField({ className, label, onChange, options, placeholder, value }: SelectFieldProps) {
  const selectId = useId();
  return (
    <label className={cn('block min-w-0', className)} htmlFor={selectId}>
      <span className="mb-2 block text-[12px] font-bold leading-[18px] text-ww-mid">{label}</span>
      <span className="relative block">
        <select
          className="h-[54px] w-full appearance-none rounded-[16px] border border-solid border-border-primary bg-white/90 px-4 pr-10 text-[14px] font-semibold text-ww-ink shadow-ww-xs outline-none transition focus:border-primary-mid focus:shadow-ww"
          id={selectId}
          onChange={event => onChange(event.target.value)}
          value={value}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
        <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#9eb1bd]" size={18} />
      </span>
    </label>
  );
}
