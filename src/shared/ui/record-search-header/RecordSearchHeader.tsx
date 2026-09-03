import type { FC, ReactNode } from 'react';
import { ArrowLeft, ChevronDown, Search, SlidersHorizontal } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { cn } from '@/shared/lib';

export interface RecordSearchHeaderProps {
  autoFocus?: boolean;
  backLabel?: string;
  filterActive?: boolean;
  filterExpanded?: boolean;
  filterLabel: ReactNode;
  onBack: () => void;
  onChange: (value: string) => void;
  onFilterClick: () => void;
  placeholder: string;
  title: ReactNode;
  value: string;
}

export const RecordSearchHeader: FC<RecordSearchHeaderProps> = ({
  autoFocus = true,
  backLabel = '返回',
  filterActive = false,
  filterExpanded = false,
  filterLabel,
  onBack,
  onChange,
  onFilterClick,
  placeholder,
  title,
  value,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus)
      inputRef.current?.focus();
  }, [autoFocus]);

  return (
    <header className="relative z-20 shrink-0 px-[18px] pb-3 pt-[max(8px,env(safe-area-inset-top))]" data-record-search-header>
      <div className="relative flex h-11 items-center justify-center px-14">
        <button
          aria-label={backLabel}
          className="absolute left-0 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-solid border-white/70 bg-white/75 p-0 text-primary-dark shadow-ww-xs backdrop-blur-md transition active:scale-95"
          onClick={onBack}
          type="button"
        >
          <ArrowLeft size={20} strokeWidth={2.2} />
        </button>
        <h1 className="max-w-full truncate text-[19px] font-extrabold tracking-[-0.02em] text-ww-ink">{title}</h1>
      </div>
      <div className="mt-2 flex h-[52px] items-center rounded-[18px] border border-solid border-white/80 bg-white/85 px-3 shadow-ww backdrop-blur-md" data-record-search-input>
        <Search className="shrink-0 text-primary-dark" size={20} strokeWidth={2.1} />
        <input
          aria-label={placeholder}
          className="h-full min-w-0 flex-grow border-0 bg-transparent px-3 text-[15px] font-medium text-ww-ink outline-none placeholder:font-normal placeholder:text-ww-soft"
          onChange={event => onChange(event.target.value)}
          placeholder={placeholder}
          ref={inputRef}
          type="search"
          value={value}
        />
        <button
          aria-expanded={filterExpanded}
          className={cn(
            'flex h-11 shrink-0 items-center rounded-xl border border-solid border-primary/15 bg-primary-light/45 px-3 text-[13px] font-bold text-primary-dark transition active:scale-95',
            filterActive && 'border-primary/40 bg-primary text-white shadow-ww-xs',
          )}
          data-testid="record-filter-action"
          onClick={onFilterClick}
          type="button"
        >
          <SlidersHorizontal className="mr-1.5" size={15} />
          <span>{filterLabel}</span>
          <ChevronDown
            className={cn(
              'ml-1 transition-transform duration-150',
              filterExpanded && 'rotate-180',
            )}
            size={15}
          />
        </button>
      </div>
    </header>
  );
};
