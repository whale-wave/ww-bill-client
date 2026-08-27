import type { FC } from 'react';
import type { TagRankingResponse } from '@/entities/chart';

const COLORS = ['#7c78f6', '#19bf8b', '#70b5c9', '#f5ab57', '#e7799d', '#6e9fdb'];

const TagDonut: FC<{ data: TagRankingResponse }> = ({ data }) => {
  let position = 0;
  const segments = data.items.map((item, index) => {
    const start = position;
    position += item.percentage;
    return `${COLORS[index % COLORS.length]} ${start}% ${position}%`;
  });
  return <div aria-label="标签金额占比" className="h-16 w-16 rounded-full" style={{ background: `conic-gradient(${segments.join(', ')})` }} />;
};

const TagLegend: FC<{ data: TagRankingResponse }> = ({ data }) => (
  <div className="min-w-0 flex-1 space-y-1">
    {data.items.slice(0, 3).map((item, index) => (
      <div className="flex items-center gap-1.5 text-xs text-ww-soft" key={item.key}>
        <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
        <span className="truncate">
          #
          {item.name}
        </span>
        <span className="ml-auto">
          {item.percentage}
          %
        </span>
      </div>
    ))}
  </div>
);

export const TagRankingSection: FC<{ data?: TagRankingResponse; isError?: boolean; isLoading?: boolean }> = ({ data, isError, isLoading }) => {
  if (isLoading)
    return <section className="rounded-[20px] border border-border-primary bg-white/80 p-4 text-sm text-ww-soft">标签排行加载中…</section>;
  if (isError)
    return <section className="rounded-[20px] border border-border-primary bg-white/80 p-4 text-sm text-ww-soft">标签排行暂不可用</section>;
  if (!data || data.items.length === 0)
    return <section className="rounded-[20px] border border-border-primary bg-white/80 p-4 text-sm text-ww-soft" data-tag-ranking-empty>暂无标签统计</section>;
  return (
    <section data-tag-ranking-section>
      <h2 className="pb-[10px] text-[14px] font-bold leading-[21px] text-ww-ink">标签排行</h2>
      <div className="overflow-hidden rounded-[20px] border border-border-primary bg-white/[0.84] px-4 py-2 shadow-ww backdrop-blur-xl">
        <div className="mb-3 flex items-center gap-3">
          <TagDonut data={data} />
          <div>
            <div className="text-xs text-ww-soft">总金额</div>
            <div className="font-number text-lg font-bold">
              ¥
              {data.totalAmount}
            </div>
          </div>
          <TagLegend data={data} />
        </div>
        {data.items.map((item, index) => (
          <div className="flex items-center gap-2 border-t border-border-primary py-2" key={item.key}>
            <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
            <span className="min-w-0 flex-1 truncate text-sm text-ww-ink">
              #
              {item.name}
            </span>
            <span className="text-xs text-ww-soft">
              {item.percentage}
              %
            </span>
            <span className="font-number text-sm font-bold">
              ¥
              {item.amount}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};
