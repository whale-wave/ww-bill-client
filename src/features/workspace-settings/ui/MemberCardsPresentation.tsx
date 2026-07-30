import type { FC } from 'react';
import type { MemberCardItem } from '../model/types';
import { ChevronRight } from 'lucide-react';

function MemberCard({ item }: { item: MemberCardItem }) {
  return (
    <button
      className="flex min-h-[82px] w-full items-center border-0 border-b border-solid border-[#EBEBEB] bg-white px-4 py-3 text-left last:border-b-0"
      data-member-id={item.id}
      onClick={item.onClick}
      type="button"
    >
      {item.avatar
        ? (
            <img
              alt=""
              className="h-12 w-12 shrink-0 rounded-full object-cover"
              src={item.avatar}
            />
          )
        : (
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-bg-gray text-lg text-font-gray">
              {String(item.name).slice(0, 1)}
            </span>
          )}
      <span className="ml-3 min-w-0 flex-grow">
        <span className="flex items-center gap-2">
          <strong className="truncate text-base font-medium text-font-black">{item.name}</strong>
          {item.badge && (
            <span className="rounded-full bg-[#e8f6f9] px-2 py-0.5 text-[11px] text-[#18839b]">
              {item.badge}
            </span>
          )}
          {item.isCurrent && (
            <span className="rounded-full bg-bg-gray px-2 py-0.5 text-[11px] text-font-gray">
              我
            </span>
          )}
        </span>
        <span className="mt-1 block truncate text-sm text-font-gray">
          ID:
          {' '}
          {item.userId}
        </span>
        {item.description && (
          <span className="mt-0.5 block truncate text-xs text-font-gray">
            {item.description}
          </span>
        )}
      </span>
      {item.onClick && <ChevronRight className="ml-2 shrink-0 text-[#C3C6C9]" size={18} />}
    </button>
  );
}

export const MemberCardsPresentation: FC<{
  current: MemberCardItem;
  others: MemberCardItem[];
  othersLabel: string;
}> = ({ current, others, othersLabel }) => (
  <div className="space-y-3 pb-6" data-member-cards>
    <section className="overflow-hidden bg-white">
      <MemberCard item={current} />
    </section>
    {others.length > 0 && (
      <section className="overflow-hidden bg-white">
        <h2 className="bg-bg-gray px-4 pb-2 pt-3 text-xs font-normal text-font-gray">
          {othersLabel}
        </h2>
        {others.map(item => <MemberCard item={item} key={item.id} />)}
      </section>
    )}
  </div>
);
