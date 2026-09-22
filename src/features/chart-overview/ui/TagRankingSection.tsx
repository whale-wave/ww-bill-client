import type { FC, ReactNode } from 'react';
import type { TagRankingResponse } from '@/entities/chart';
import { math } from '@/shared/lib';
import { readAppearanceChartColors, useAppearanceRevision } from '@/shared/lib/appearance-tokens';

interface TagRankingFallbackRecord {
  amount: number | string;
  tags?: readonly unknown[];
}

function getUntaggedRankingFallback(records: readonly TagRankingFallbackRecord[] | undefined): TagRankingResponse | undefined {
  if (!records?.length || records.some(record => record.tags?.length))
    return;

  const total = records.reduce((sum, record) => math.add(sum, record.amount), math.add(0, 0));
  if (!total.isFinite())
    return;

  return {
    items: [{
      amount: total.toFixed(2),
      key: 'aggregate:untagged',
      name: '无标签',
      percentage: 100,
      tagId: null,
    }],
    totalAmount: total.toFixed(2),
  };
}

const TagRankingSkeleton: FC = () => (
  <div aria-label="正在加载标签排行" className="space-y-3" data-tag-ranking-loading role="status">
    <div className="space-y-3 px-1 py-2">
      <div className="h-5 w-1/2 animate-pulse rounded-full bg-primary-light/60" />
      <div className="h-3 w-4/5 animate-pulse rounded-full bg-primary-light/45" />
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

export const TagRankingSection: FC<{
  data?: TagRankingResponse;
  fallbackRecords?: readonly TagRankingFallbackRecord[];
  isError?: boolean;
  isLoading?: boolean;
}> = ({ data, fallbackRecords, isError, isLoading }) => {
  const appearanceRevision = useAppearanceRevision();
  const colors = readAppearanceChartColors();
  void appearanceRevision;
  if (isLoading)
    return <TagRankingState testId="loading"><TagRankingSkeleton /></TagRankingState>;
  if (isError)
    return <TagRankingState testId="error"><div className="flex min-h-[108px] items-center justify-center text-sm text-ww-soft">标签排行暂不可用</div></TagRankingState>;
  const ranking = data?.items.length ? data : getUntaggedRankingFallback(fallbackRecords);
  if (!ranking)
    return <TagRankingState testId="empty"><div className="flex min-h-[108px] items-center justify-center text-sm text-ww-soft" data-tag-ranking-empty>暂无标签统计</div></TagRankingState>;

  return (
    <section data-tag-ranking-section>
      <h2 className="pb-[10px] text-[15px] font-extrabold leading-6 text-ww-ink">标签排行</h2>
      <div className="overflow-hidden rounded-[20px] border border-border-primary bg-white/[0.84] px-4 py-3 shadow-ww backdrop-blur-xl">
        <div className="px-1 py-2">
          <p className="text-sm font-bold text-ww-ink">
            去重总金额 ¥
            {ranking.totalAmount}
          </p>
          <p className="mt-2 text-xs leading-5 text-ww-soft">同一笔账可计入多个标签，金额不可相加。</p>
        </div>
        <div data-tag-ranking-rows>
          {ranking.items.map((item, index) => (
            <div className="border-t border-border-primary py-3" key={item.key}>
              <div className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ backgroundColor: colors[index % colors.length] }} />
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
                <div className="h-full rounded-full bg-primary-mid" style={{ width: `${Math.min(100, Math.max(0, item.percentage))}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
