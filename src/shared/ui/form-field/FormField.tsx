import type { InputHTMLAttributes, ReactNode } from 'react';
import { Input } from 'antd-mobile';
import { Eye, EyeOff } from 'lucide-react';
import { useId, useState } from 'react';
import { cn } from '@/shared/lib';
import { FieldFrame } from './FieldFrame';

export interface FormFieldProps {
  autoComplete?: InputHTMLAttributes<HTMLInputElement>['autoComplete'];
  className?: string;
  disabled?: boolean;
  id?: string;
  inputMode?: InputHTMLAttributes<HTMLInputElement>['inputMode'];
  label: ReactNode;
  maxLength?: number;
  onChange?: (value: string) => void;
  onEnterPress?: () => void;
  placeholder?: string;
  prefix?: ReactNode;
  readOnly?: boolean;
  suffix?: ReactNode;
  type?: 'email' | 'password' | 'text';
  value: string;
}

export function FormField({
  autoComplete,
  className,
  disabled,
  id,
  inputMode,
  label,
  maxLength,
  onChange,
  onEnterPress,
  placeholder,
  prefix,
  readOnly,
  suffix,
  type = 'text',
  value,
}: FormFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const inputType = type === 'password' && isPasswordVisible ? 'text' : type;

  return (
    <label className={cn('block min-w-0', className)} htmlFor={inputId}>
      <span className="mb-2 block text-[12px] font-bold leading-[18px] text-ww-mid">{label}</span>
      <FieldFrame disabled={disabled}>
        {prefix && <span className="flex h-5 w-5 shrink-0 items-center justify-center text-primary-deep">{prefix}</span>}
        <Input
          autoComplete={autoComplete}
          className="min-w-0 flex-1 text-[15px] text-ww-ink [--color:var(--ww-theme-text-color)] [--font-size:15px] [--placeholder-color:var(--ww-text-color-soft)]"
          disabled={disabled}
          id={inputId}
          inputMode={inputMode}
          maxLength={maxLength}
          onChange={onChange}
          onEnterPress={onEnterPress}
          placeholder={placeholder}
          readOnly={readOnly}
          type={inputType}
          value={value}
        />
        {type === 'password' && !disabled && (
          <button
            aria-label={isPasswordVisible ? 'hide password' : 'show password'}
            className="flex h-11 w-11 shrink-0 items-center justify-center border-0 bg-transparent p-0 text-ww-soft"
            onClick={() => setIsPasswordVisible(visible => !visible)}
            type="button"
          >
            {isPasswordVisible ? <EyeOff size={18} strokeWidth={1.8} /> : <Eye size={18} strokeWidth={1.8} />}
          </button>
        )}
        {suffix && <span className="shrink-0">{suffix}</span>}
      </FieldFrame>
    </label>
  );
}
