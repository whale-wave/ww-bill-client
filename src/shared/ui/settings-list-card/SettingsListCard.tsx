import type { ReactNode } from 'react';
import { DesignIcon } from '@/shared/ui/design-icon';
import './ios-settings-list.scss';

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
  variant?: 'default' | 'ios';
}

export function SettingsListCard({ items, className = '', density = 'standard', variant = 'default' }: SettingsListCardProps) {
  return (
    <section
      className={`!m-0 overflow-hidden rounded-[var(--ww-radius-card)] border border-border-primary bg-ww-surface py-0.5 shadow-ww backdrop-blur-[var(--ww-card-blur)] ${variant === 'ios' ? 'ww-ios-settings-list' : ''} ${className}`}
    >
      {items.map((item, index) => (
        <div
          className={`!m-0 ${
            index > 0 ? 'border-t border-border-primary' : ''
          }`}
          key={item.key}
        >
          <button className={`flex w-full items-center gap-3 px-[var(--ww-card-padding)] text-left transition active:bg-primary-light/20 disabled:opacity-45 ${density === 'compact' ? 'min-h-[48px]' : 'min-h-[50px]'}`} disabled={item.disabled} onClick={item.onClick} type="button">
            {item.icon && <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-[color:var(--ww-surface-tint-color)] text-base text-primary-deep">{item.icon}</span>}
            <span className="min-w-0 flex-1 truncate text-[13.5px] font-medium leading-[20.25px] text-ww-mid">{item.label}</span>
            <span className="flex shrink-0 items-center gap-2">
              {item.extra && <span className="text-xs text-ww-soft">{item.extra}</span>}
              {item.showArrow !== false && <DesignIcon name="list-chevron" size={16} />}
            </span>
          </button>
        </div>
      ))}
    </section>
  );
}
