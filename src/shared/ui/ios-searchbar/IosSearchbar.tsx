import type { ReactNode } from 'react';
import { Search, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import './ios-searchbar.scss';

export interface IosSearchbarProps {
  ariaLabel: string;
  autoFocus?: boolean;
  cancelLabel: string;
  clearLabel?: string;
  onChange: (value: string) => void;
  placeholder: string;
  trailing?: ReactNode;
  value: string;
}

/** The same focused search surface is used in the studio and record search pages. */
export function IosSearchbar({ ariaLabel, autoFocus = false, cancelLabel, clearLabel = cancelLabel, onChange, placeholder, trailing, value }: IosSearchbarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus)
      inputRef.current?.focus();
  }, [autoFocus]);

  const isExpanded = isFocused || Boolean(value);
  return (
    <div className="ww-ios-searchbar flex min-w-0 items-center overflow-hidden" data-enabled={isExpanded}>
      <div className="ww-ios-searchbar__surface relative flex h-11 min-w-0 flex-1 items-center rounded-full">
        <Search aria-hidden className="ml-4 shrink-0 text-ww-mid" size={16} />
        <input
          aria-label={ariaLabel}
          className="h-11 min-w-0 flex-1 border-0 bg-transparent pl-2 pr-1 text-[16px] text-ww-ink outline-none placeholder:text-ww-soft"
          onBlur={() => setIsFocused(false)}
          onChange={event => onChange(event.currentTarget.value)}
          onFocus={() => setIsFocused(true)}
          placeholder={placeholder}
          ref={inputRef}
          type="search"
          value={value}
        />
        {value && (
          <button
            aria-label={clearLabel}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-0 bg-transparent text-ww-mid"
            onClick={() => {
              onChange('');
              inputRef.current?.focus();
            }}
            onPointerDown={event => event.preventDefault()}
            type="button"
          >
            <X aria-hidden size={14} />
          </button>
        )}
        {trailing}
      </div>
      <button
        aria-label={cancelLabel}
        aria-hidden={!isExpanded}
        className="ww-ios-searchbar__cancel flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-0 text-ww-ink"
        disabled={!isExpanded}
        onClick={() => {
          onChange('');
          setIsFocused(false);
          inputRef.current?.blur();
        }}
        onPointerDown={event => event.preventDefault()}
        tabIndex={isExpanded ? 0 : -1}
        type="button"
      >
        <X aria-hidden size={18} />
      </button>
    </div>
  );
}
