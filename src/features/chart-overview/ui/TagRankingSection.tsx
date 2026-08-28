import type { FC, ReactNode } from 'react';
import type { TagRankingResponse } from '@/entities/chart';

const COLORS = ['#7c78f6', '#19bf8b', '#70b5c9', '#f5ab57', '#e7799d', '#6e9fdb'];

function getPercentage(item: TagRankingResponse['items'][number], total: number) {
  if (total > 0)
    return item.percentage / total * 100;
  return 0;
}

const TagDonut: FC<{ data: TagRankingResponse }> = ({ data }) => {
  const percentageTotal = data.items.reduce((sum, item) => sum + item.percentage, 0);
  let position = 0;
  const segments = data.items.map((item, index) => {
    const start = position;
    position += getPercentage(item, percentageTotal);
    const end = index === data.items.length - 1 ? 100 : position;
    return `${COLORS[index % COLORS.length]} ${start}% ${end}%`;
  });
  return (
    <div aria-label="标签金额占比" className="relative h-[140px] w-[140px] shrink-0 rounded-full" style={{ background: `conic-gradient(${segments.join(', ')})` }}>
      <div className="absolute inset-[27px] flex flex-col items-center justify-center rounded-full bg-white text-center">
        <span className="text-[11px] leading-4 text-ww-soft">总金额</span>
        <span className="font-number text-[17px] font-bold leading-6 text-ww-ink">
          ¥
          {data.totalAmount}
        </span>
      </div>
    </div>
  );
};

const TagLegend: FC<{ data: TagRankingResponse }> = ({ data }) => (
  <div className="min-w-0 flex-1 space-y-2">
    {data.items.slice(0, 4).map((item, index) => (
      <div className="flex min-w-0 items-center gap-1.5 text-[12px] leading-4 text-ww-soft" key={item.key}>
        <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
        <span className="min-w-0 flex-1 truncate">
          #
          {item.name}
        </span>
        <span className="shrink-0 font-number">
          {item.percentage}
          %
        </span>
      </div>
    ))}
  </div>
);

const TagRankingSkeleton: FC = () => (
  <div aria-label="正在加载标签排行" className="space-y-3" data-tag-ranking-loading role="status">
    <div className="flex items-center gap-4 px-1 py-1">
      <div className="relative flex h-[112px] w-[112px] shrink-0 items-center justify-center rounded-full bg-primary-light/45 p-[17px] animate-pulse">
        <div className="h-full w-full rounded-full bg-white/85" />
      </div>
      <div className="min-w-0 flex-1 space-y-3">
        {[0, 1, 2].map(item => (
          <div className="flex items-center gap-2" key={item}>
            <span className="h-2.5 w-2.5 shrink-0 rounded-sm bg-primary-light/80" />
            <span className="h-3 animate-pulse rounded-full bg-primary-light/60" style={{ width: `${76 - item * 12}%` }} />
          </div>
        ))}
      </div>
    </div>
    {[0, 1, 2].map(item => (
      <div className="space-y-2 border-t border-border-primary py-3" key={item}>
        <div className="flex items-center justify-between gap-4">
          <div className="h-3 w-1/3 animate-pulse rounded-full bg-primary-light/60" />
          <div className="h-3 w-1/5 animate-pulse rounded-full bg-primary-light/60" />
        </div>
        <div className="h-1.5 w-full animate-pulse rounded-full bg-primary-light/50" />
      </div>
    ))}
  </div>
);

const TagRankingState: FC<{ children: ReactNode; testId?: string }> = ({ children, testId }) => (
  <section data-tag-ranking-section data-tag-ranking-state={testId}>
    <h2 className="pb-[10px] text-[15px] font-extrabold leading-6 text-ww-ink">标签排行</h2>
    <div className="overflow-hidden rounded-[20px] border border-border-primary bg-white/[0.84] px-4 py-3 shadow-ww backdrop-blur-xl">
      {children}
    </div>
  </section>
);

export const TagRankingSection: FC<{ data?: TagRankingResponse; isError?: boolean; isLoading?: boolean }> = ({ data, isError, isLoading }) => {
  if (isLoading)
    return <TagRankingState testId="loading"><TagRankingSkeleton /></TagRankingState>;
  if (isError)
    return <TagRankingState testId="error"><div className="flex min-h-[108px] items-center justify-center text-sm text-ww-soft">标签排行暂不可用</div></TagRankingState>;
  if (!data || data.items.length === 0)
    return <TagRankingState testId="empty"><div className="flex min-h-[108px] items-center justify-center text-sm text-ww-soft" data-tag-ranking-empty>暂无标签统计</div></TagRankingState>;

  return (
    <section data-tag-ranking-section>
      <h2 className="pb-[10px] text-[15px] font-extrabold leading-6 text-ww-ink">标签排行</h2>
      <div className="overflow-hidden rounded-[20px] border border-border-primary bg-white/[0.84] px-4 py-3 shadow-ww backdrop-blur-xl">
        <div className="flex items-center gap-4 px-1 py-2">
          <TagDonut data={data} />
          <TagLegend data={data} />
        </div>
        {data.items.map((item, index) => (
          <div className="border-t border-border-primary py-3" key={item.key}>
            <div className="flex items-center gap-3">
              <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
              <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-ww-ink">
                #
                {item.name}
              </span>
              <span className="shrink-0 font-number text-[11px] text-ww-soft">
                {item.percentage}
                %
              </span>
              <span className="shrink-0 font-number text-[13px] font-bold text-ww-mid">
                ¥
                {item.amount}
              </span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/5">
              <div className="h-full rounded-full bg-primary-mid" style={{ width: `${Math.min(100, getPercentage(item, 100))}%` }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
