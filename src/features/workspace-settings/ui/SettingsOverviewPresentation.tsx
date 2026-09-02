import type { FC, ReactNode } from 'react';
import type {
  SettingsIconKey,
  SettingsOverviewRow,
  SettingsOverviewSection,
} from '../model/types';
import {
  Archive,
  CalendarDays,
  ChevronRight,
  CircleHelp,
  Download,
  FolderOpen,
  Info,
  Languages,
  LockKeyhole,
  MonitorDown,
  Paintbrush,
  ReceiptText,
  SlidersHorizontal,
  Smartphone,
  Tags,
  Trash2,
  UserRound,
  UsersRound,
} from 'lucide-react';
import { LedgerUserAvatar } from '@/entities/ledger';
import { cn } from '@/shared/lib';

const iconMap: Record<SettingsIconKey, typeof Archive> = {
  account: UserRound,
  about: Info,
  appearance: Paintbrush,
  archive: Archive,
  calendar: CalendarDays,
  category: FolderOpen,
  desktop: MonitorDown,
  export: Download,
  help: CircleHelp,
  language: Languages,
  lock: LockKeyhole,
  member: UsersRound,
  record: ReceiptText,
  shortcut: Smartphone,
  storage: Trash2,
  tag: Tags,
};

function AvatarStack({
  avatars,
  overflowCount = 0,
}: Pick<Extract<SettingsOverviewRow, { kind: 'avatarStack' }>, 'avatars' | 'overflowCount'>) {
  return (
    <span className="flex items-center pl-2">
      {avatars.slice(0, 3).map(avatar => (
        <LedgerUserAvatar
          className="-ml-2 border-2 border-solid border-white shadow-none"
          key={avatar.id}
          size={32}
          user={{ avatar: avatar.src, name: avatar.name ?? avatar.alt }}
        />
      ))}
      {overflowCount > 0 && (
        <span className="-ml-2 flex h-8 min-w-8 items-center justify-center rounded-full border-2 border-solid border-white bg-[#e8f6f9] px-1 text-xs text-[#18839b]">
          +
          {overflowCount}
        </span>
      )}
    </span>
  );
}

const SettingsRow: FC<{ isLast: boolean; row: SettingsOverviewRow }> = ({
  isLast,
  row,
}) => {
  const Icon = iconMap[row.icon] ?? SlidersHorizontal;
  const clickable = row.kind === 'link'
    || row.kind === 'avatarStack'
    || row.kind === 'action'
    || row.kind === 'placeholder';
  const trailing: ReactNode = row.kind === 'switch'
    ? (
        <button
          aria-checked={row.checked}
          className={cn(
            'relative h-7 w-12 rounded-full border-0 transition-colors',
            row.checked ? 'bg-primary' : 'bg-[#DADDE1]',
          )}
          disabled={row.disabled}
          onClick={() => row.onChange(!row.checked)}
          role="switch"
          type="button"
        >
          <span className={cn(
            'absolute left-0.5 top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform',
            row.checked ? 'translate-x-5' : 'translate-x-0',
          )}
          />
        </button>
      )
    : row.kind === 'avatarStack'
      ? <AvatarStack avatars={row.avatars} overflowCount={row.overflowCount} />
      : 'value' in row && row.value
        ? <span className="max-w-[45%] truncate text-sm text-font-gray">{row.value}</span>
        : null;
  const onClick = clickable ? row.onClick : undefined;
  const content = (
    <>
      <span className={cn(
        'mr-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-[13px]',
        row.kind === 'action' && row.danger
          ? 'bg-ww-pink-light/60 text-[#b24f71]'
          : 'bg-primary-light/55 text-primary-deep',
      )}
      >
        <Icon size={18} strokeWidth={1.8} />
      </span>
      <span className={cn(
        'flex min-h-[64px] min-w-0 flex-grow items-center border-0',
        !isLast && 'border-b border-solid border-border-primary',
      )}
      >
        <span className="min-w-0 flex-grow py-2">
          <span className={cn(
            'block text-[13px] font-bold leading-5',
            row.kind === 'action' && row.danger ? 'text-red-500' : 'text-font-black',
          )}
          >
            {row.label}
          </span>
          {row.description && (
            <span className="mt-0.5 block text-[10px] leading-4 text-ww-soft">
              {row.description}
            </span>
          )}
        </span>
        {trailing}
        {clickable && (
          <ChevronRight className="ml-2 shrink-0 text-[#C3C6C9]" size={18} />
        )}
      </span>
    </>
  );

  return clickable
    ? (
        <button
          className={cn(
            'flex min-h-[64px] w-full items-center border-0 bg-transparent px-4 text-left',
            row.disabled ? 'opacity-45' : '',
          )}
          data-settings-row={row.id}
          disabled={row.disabled}
          onClick={onClick}
          type="button"
        >
          {content}
        </button>
      )
    : (
        <div
          className={cn(
            'flex min-h-[64px] w-full items-center bg-transparent px-4 text-left',
            row.disabled ? 'opacity-45' : '',
          )}
          data-settings-row={row.id}
        >
          {content}
        </div>
      );
};

export const SettingsOverviewPresentation: FC<{
  sections: SettingsOverviewSection[];
}> = ({ sections }) => (
  <div className="space-y-5 pb-7" data-settings-overview>
    {sections.filter(section => section.rows.length > 0).map(section => (
      <section className="overflow-hidden" data-settings-section={section.id} key={section.id}>
        {section.title && (
          <h2 className="px-1 pb-2 text-[11px] font-extrabold tracking-[0.4px] text-ww-mid">
            {section.title}
          </h2>
        )}
        <div className="overflow-hidden rounded-[var(--ww-radius-card)] border border-border-primary bg-ww-surface shadow-ww backdrop-blur-[var(--ww-card-blur)]">
          {section.rows.map((row, index) => (
            <SettingsRow
              isLast={index === section.rows.length - 1}
              key={row.id}
              row={row}
            />
          ))}
        </div>
      </section>
    ))}
  </div>
);
