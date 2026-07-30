import type { FC, ReactNode } from 'react';
import { ChevronDown, ChevronLeft, Search } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { cn } from '@/shared/lib';

export interface RecordSearchHeaderProps {
  autoFocus?: boolean;
  capsule?: ReactNode;
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
  capsule,
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
    <header className="relative z-20 shrink-0 bg-primary px-3 pb-3" data-record-search-header>
      <div className="relative flex h-[52px] items-center justify-center px-24">
        <button
          aria-label="返回"
          className="absolute left-[-4px] top-1/2 flex h-10 -translate-y-1/2 items-center border-0 bg-transparent px-0 text-base text-font-black"
          onClick={onBack}
          type="button"
        >
          <ChevronLeft size={24} />
          <span>返回</span>
        </button>
        <h1 className="max-w-full truncate text-lg font-medium text-font-black">{title}</h1>
        {capsule && <div className="absolute right-0 top-1/2 -translate-y-1/2">{capsule}</div>}
      </div>
      <div className="flex h-12 items-center rounded-lg bg-white px-3" data-record-search-input>
        <Search className="shrink-0 text-font-gray" size={20} />
        <button
          aria-expanded={filterExpanded}
          className={cn(
            'ml-2 flex h-8 shrink-0 items-center border-0 bg-transparent px-0 text-sm text-font-black',
            filterActive && 'font-medium text-[#18839b]',
          )}
          data-testid="record-filter-action"
          onClick={onFilterClick}
          type="button"
        >
          <span>{filterLabel}</span>
          <ChevronDown
            className={cn(
              'ml-1 transition-transform duration-150',
              filterExpanded && 'rotate-180',
            )}
            size={15}
          />
        </button>
        <span aria-hidden="true" className="mx-3 h-5 w-px bg-[#D7D7D7]" />
        <input
          aria-label={placeholder}
          className="h-full min-w-0 flex-grow border-0 bg-transparent text-base text-font-black outline-none placeholder:text-font-gray"
          onChange={event => onChange(event.target.value)}
          placeholder={placeholder}
          ref={inputRef}
          type="search"
          value={value}
        />
      </div>
    </header>
  );
};
