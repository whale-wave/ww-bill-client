import type { ReactNode } from 'react';
import { DesignIcon } from '@/shared/ui/design-icon';

export interface SettingsListItem {
  key: string;
  label: ReactNode;
  icon?: ReactNode;
  extra?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  showArrow?: boolean;
}

export interface SettingsListCardProps {
  items: SettingsListItem[];
  className?: string;
  density?: 'compact' | 'standard';
}

export function SettingsListCard({ items, className = '', density = 'standard' }: SettingsListCardProps) {
  return (
    <section
      className={`overflow-hidden rounded-[var(--ww-radius-card)] border border-border-primary bg-ww-surface py-0.5 shadow-ww backdrop-blur-[var(--ww-card-blur)] ${className}`}
    >
      {items.map((item, index) => (
        <button
          className={`flex w-full items-center gap-3 px-[var(--ww-card-padding)] text-left transition active:bg-primary-light/20 disabled:opacity-45 ${density === 'compact' ? 'min-h-[48px]' : 'min-h-[50px]'} ${
            index > 0 ? 'border-t border-border-primary' : ''
          }`}
          disabled={item.disabled}
          key={item.key}
          onClick={item.onClick}
          type="button"
        >
          {item.icon && (
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-[color:var(--ww-surface-tint-color)] text-base text-primary-deep">
              {item.icon}
            </span>
          )}
          <span className="min-w-0 flex-1 truncate text-[13.5px] font-medium leading-[20.25px] text-ww-mid">{item.label}</span>
          {item.extra && <span className="shrink-0 text-xs text-ww-soft">{item.extra}</span>}
          {item.showArrow !== false && <DesignIcon className="shrink-0" name="list-chevron" size={16} />}
        </button>
      ))}
    </section>
  );
}
