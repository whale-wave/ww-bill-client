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
  Languages,
  MonitorDown,
  Paintbrush,
  ReceiptText,
  SlidersHorizontal,
  Tags,
  Trash2,
  UserRound,
  UsersRound,
} from 'lucide-react';
import { cn } from '@/shared/lib';

const iconMap: Record<SettingsIconKey, typeof Archive> = {
  account: UserRound,
  appearance: Paintbrush,
  archive: Archive,
  calendar: CalendarDays,
  category: FolderOpen,
  desktop: MonitorDown,
  export: Download,
  help: CircleHelp,
  language: Languages,
  member: UsersRound,
  record: ReceiptText,
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
        avatar.src
          ? (
              <img
                alt={avatar.alt}
                className="-ml-2 h-8 w-8 rounded-full border-2 border-solid border-white object-cover"
                key={avatar.id}
                src={avatar.src}
              />
            )
          : (
              <span
                aria-label={avatar.alt}
                className="-ml-2 flex h-8 w-8 items-center justify-center rounded-full border-2 border-solid border-white bg-bg-gray text-xs text-font-gray"
                key={avatar.id}
              >
                {avatar.alt.slice(0, 1)}
              </span>
            )
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
      <span className="mr-3 flex h-8 w-8 shrink-0 items-center justify-center text-font-black">
        <Icon size={21} strokeWidth={1.7} />
      </span>
      <span className={cn(
        'flex min-h-[58px] min-w-0 flex-grow items-center border-0',
        !isLast && 'border-b border-solid border-[#EBEBEB]',
      )}
      >
        <span className="min-w-0 flex-grow py-2">
          <span className={cn(
            'block text-base',
            row.kind === 'action' && row.danger ? 'text-red-500' : 'text-font-black',
          )}
          >
            {row.label}
          </span>
          {row.description && (
            <span className="mt-0.5 block text-xs leading-4 text-font-gray">
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
            'flex min-h-[58px] w-full items-center border-0 bg-white px-4 text-left',
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
            'flex min-h-[58px] w-full items-center bg-white px-4 text-left',
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
  <div className="space-y-3 pb-6" data-settings-overview>
    {sections.filter(section => section.rows.length > 0).map(section => (
      <section className="overflow-hidden bg-white" data-settings-section={section.id} key={section.id}>
        {section.title && (
          <h2 className="bg-bg-gray px-4 pb-2 pt-3 text-xs font-normal text-font-gray">
            {section.title}
          </h2>
        )}
        {section.rows.map((row, index) => (
          <SettingsRow
            isLast={index === section.rows.length - 1}
            key={row.id}
            row={row}
          />
        ))}
      </section>
    ))}
  </div>
);
