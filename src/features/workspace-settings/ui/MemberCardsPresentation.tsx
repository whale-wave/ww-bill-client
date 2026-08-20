import type { FC, ReactNode } from 'react';
import type { MemberCardItem } from '../model/types';
import { ChevronRight } from 'lucide-react';
import { useTranslation } from '@/shared/i18n';

function MemberCard({ item }: { item: MemberCardItem }) {
  const { t } = useTranslation('ledger');
  return (
    <button
      className="group flex min-h-[92px] w-full items-center border-0 border-b border-solid border-border-primary bg-transparent px-4 py-3.5 text-left transition active:bg-primary-light/25 last:border-b-0"
      data-member-id={item.id}
      onClick={item.onClick}
      type="button"
    >
      {item.avatar
        ? (
            <img
              alt=""
              className="h-12 w-12 shrink-0 rounded-full border-2 border-solid border-white object-cover shadow-ww-xs"
              src={item.avatar}
            />
          )
        : (
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(145deg,#c8eaf6,#e8f6ff)] text-lg font-black text-primary-deep shadow-ww-xs">
              {String(item.name).slice(0, 1)}
            </span>
          )}
      <span className="ml-3 min-w-0 flex-grow">
        <span className="flex items-center gap-2">
          <strong className="truncate text-[15px] font-black text-ww-ink">{item.name}</strong>
          {item.badge && (
            <span className="rounded-full bg-primary-light/65 px-2 py-0.5 text-[10px] font-bold text-primary-deep">
              {item.badge}
            </span>
          )}
          {item.isCurrent && (
            <span className="rounded-full bg-ww-purple-light/65 px-2 py-0.5 text-[10px] font-bold text-[#6755aa]">
              {t('members.me')}
            </span>
          )}
        </span>
        <span className="mt-1 block truncate text-[11px] font-semibold text-ww-soft">
          ID:
          {' '}
          {item.userId}
        </span>
        {item.description && (
          <span className="mt-1 block truncate text-[12px] font-bold text-ww-mid">
            {item.description}
          </span>
        )}
      </span>
      {item.onClick && <ChevronRight className="ml-2 shrink-0 text-[#9eb1bd] transition group-active:translate-x-0.5" size={18} />}
    </button>
  );
}

export const MemberCardsPresentation: FC<{
  current: MemberCardItem;
  currentLabel?: ReactNode;
  others: MemberCardItem[];
  othersLabel: ReactNode;
}> = ({ current, currentLabel, others, othersLabel }) => (
  <div className="space-y-4 pb-2" data-member-cards>
    <section className="overflow-hidden rounded-[20px] border border-border-primary bg-white/[0.84] shadow-ww backdrop-blur-xl">
      {currentLabel && (
        <h2 className="px-4 pb-2 pt-3 text-[11px] font-extrabold tracking-[0.4px] text-ww-mid">
          {currentLabel}
        </h2>
      )}
      <MemberCard item={current} />
    </section>
    {others.length > 0 && (
      <section className="overflow-hidden rounded-[20px] border border-border-primary bg-white/[0.84] shadow-ww backdrop-blur-xl">
        <h2 className="px-4 pb-2 pt-3 text-[11px] font-extrabold tracking-[0.4px] text-ww-mid">
          {othersLabel}
        </h2>
        {others.map(item => <MemberCard item={item} key={item.id} />)}
      </section>
    )}
  </div>
);
