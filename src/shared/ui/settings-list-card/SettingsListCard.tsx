import type { ReactNode } from 'react';
import { List, ListItem } from 'konsta/react';
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
    <List
      className={`!m-0 overflow-hidden rounded-[var(--ww-radius-card)] border border-border-primary bg-ww-surface py-0.5 shadow-ww backdrop-blur-[var(--ww-card-blur)] ${className}`}
      component="section"
      dividers={false}
      nested
    >
      {items.map((item, index) => (
        <ListItem
          after={(
            <span className="flex shrink-0 items-center gap-2">
              {item.extra && <span className="text-xs text-ww-soft">{item.extra}</span>}
              {item.showArrow !== false && <DesignIcon name="list-chevron" size={16} />}
            </span>
          )}
          className={`!m-0 ${
            index > 0 ? 'border-t border-border-primary' : ''
          }`}
          chevron={false}
          component="div"
          contentClassName="!p-0"
          innerClassName="!min-h-0 !p-0"
          key={item.key}
          link
          linkComponent="button"
          linkProps={{
            className: `flex w-full items-center gap-3 px-[var(--ww-card-padding)] text-left transition active:bg-primary-light/20 disabled:opacity-45 ${density === 'compact' ? 'min-h-[48px]' : 'min-h-[50px]'}`,
            disabled: item.disabled,
            onClick: item.onClick,
            type: 'button',
          }}
          media={item.icon
            ? (
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-[color:var(--ww-surface-tint-color)] text-base text-primary-deep">
                  {item.icon}
                </span>
              )
            : undefined}
          mediaClassName="!m-0"
          title={<span className="min-w-0 truncate text-[13.5px] font-medium leading-[20.25px] text-ww-mid">{item.label}</span>}
          titleWrapClassName="!min-w-0 !flex-1"
        />
      ))}
    </List>
  );
}
