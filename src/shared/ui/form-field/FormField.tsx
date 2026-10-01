import type { InputHTMLAttributes, ReactNode } from 'react';
import { FormFieldVisual } from '@ww-bill/bill-ui';
import { Input } from 'antd-mobile';
import { Eye, EyeOff } from 'lucide-react';
import { useId, useState } from 'react';

export interface FormFieldProps {
  autoComplete?: InputHTMLAttributes<HTMLInputElement>['autoComplete'];
  className?: string;
  disabled?: boolean;
  errorMessage?: ReactNode;
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
  errorMessage,
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
    <FormFieldVisual
      className={className}
      inputId={inputId}
      label={label}
      prefix={prefix}
      disabled={disabled}
      error={errorMessage}
      suffix={(
        <>
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
          {suffix}
        </>
      )}
    >
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
        aria-describedby={errorMessage ? `${inputId}-error` : undefined}
        aria-invalid={errorMessage ? true : undefined}
      />
    </FormFieldVisual>
  );
}
