import type { FC, ReactNode } from 'react';
import { ArrowLeft, ChevronDown, SlidersHorizontal } from 'lucide-react';
import { useTranslation } from '@/shared/i18n';
import { cn } from '@/shared/lib';
import { IosSearchbar } from '@/shared/ui/ios-searchbar';

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
  const { t } = useTranslation('common');

  return (
    <header className="relative z-20 shrink-0 px-[18px] pb-3 pt-[max(8px,var(--ww-safe-area-top))]" data-record-search-header>
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
      <div className="mt-2 min-w-0" data-record-search-input>
        <IosSearchbar
          ariaLabel={placeholder}
          autoFocus={autoFocus}
          cancelLabel={t('nav.cancel')}
          clearLabel={t('action.clearInput')}
          onChange={onChange}
          placeholder={placeholder}
          trailing={(
            <button
              aria-expanded={filterExpanded}
              className={cn(
                'mr-1 flex h-11 shrink-0 items-center rounded-full border border-solid border-primary/15 bg-primary-light/45 px-2 text-[12px] font-bold text-primary-dark transition active:scale-95',
                filterActive && 'border-primary/40 bg-primary text-white shadow-ww-xs',
              )}
              data-testid="record-filter-action"
              onClick={onFilterClick}
              type="button"
            >
              <SlidersHorizontal className="mr-1" size={15} />
              <span>{filterLabel}</span>
              <ChevronDown className={cn('ml-1 transition-transform duration-150', filterExpanded && 'rotate-180')} size={15} />
            </button>
          )}
          value={value}
        />
      </div>
    </header>
  );
};
