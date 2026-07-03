import type { FC } from 'react';
import type { GetChartApiParamsCategory, GetChartApiResponse, GetChartApiResponseRankingData, RecordEntry } from '@/api';
import type { AmountType, TabItem, TimeRangeCategory } from '@/store/chart';
import { ErrorBlock, List, SpinLoading } from 'antd-mobile';
import { useMemo } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Icon, NavBar, RecordListItem } from '@/components';
import { isMonthData, isWeekData, isYearData, useGetChartQuery } from '@/hooks';
import { cn, math } from '@/shared/lib';

interface ChartCategoryLocationState {
  rankingItem?: GetChartApiResponseRankingData;
  tabKey?: string;
  tabName?: string;
  amountType?: AmountType;
  timeRangeCategory?: TimeRangeCategory;
  curTab?: TabItem;
}

interface PeriodInfo {
  key: string;
  name: string;
  amount: number;
  average?: string;
  ranking?: GetChartApiResponseRankingData[];
  records: RecordEntry[];
}

const amountTypeName: Record<AmountType, string> = {
  sub: '支出',
  add: '收入',
};

const timeRangeName: Record<TimeRangeCategory, string> = {
  week: '周',
  month: '月',
  year: '年',
};

function isAmountType(value: string | null): value is AmountType {
  return value === 'sub' || value === 'add';
}

function isTimeRangeCategory(value: string | null): value is GetChartApiParamsCategory {
  return value === 'week' || value === 'month' || value === 'year';
}

function flattenRecords(data: unknown): RecordEntry[] {
  if (!Array.isArray(data))
    return [];

  return data.flatMap((item) => {
    if (!item || typeof item !== 'object' || !('data' in item))
      return [];

    const itemData = (item as { data?: unknown }).data;
    if (!Array.isArray(itemData))
      return [];

    return itemData.filter((record): record is RecordEntry => {
      return !!record && typeof record === 'object' && 'id' in record && 'category' in record;
    });
  });
}

function getRecordsAmount(records: RecordEntry[]) {
  return records.reduce((sum, record) => math.add(sum, record.amount).toNumber(), 0);
}

function getPeriodsFromData(data: GetChartApiResponse, category: TimeRangeCategory): PeriodInfo[] {
  if (category === 'week' && isWeekData(data)) {
    return data.flatMap(yearItem => yearItem.data.map(weekItem => ({
      key: `${yearItem.value}-${weekItem.value}`,
      name: `${yearItem.value}年第${weekItem.value}周`,
      amount: weekItem.amount,
      average: weekItem.average,
      ranking: weekItem.ranking,
      records: flattenRecords(weekItem.data),
    })));
  }

  if (category === 'month' && isMonthData(data)) {
    return data.flatMap(yearItem => yearItem.data.map(monthItem => ({
      key: `${yearItem.value}-${monthItem.value}`,
      name: `${yearItem.value}年${monthItem.value}月`,
      amount: monthItem.amount,
      average: monthItem.average,
      ranking: monthItem.ranking,
      records: flattenRecords(monthItem.data),
    })));
  }

  if (category === 'year' && isYearData(data)) {
    return data.map(yearItem => ({
      key: `${yearItem.value}`,
      name: `${yearItem.value}年`,
      amount: yearItem.amount,
      average: yearItem.average,
      ranking: yearItem.ranking,
      records: flattenRecords(yearItem.data),
    }));
  }

  return [];
}

function getPeriodFromState(state: ChartCategoryLocationState | null): PeriodInfo | undefined {
  if (!state?.curTab)
    return undefined;

  return {
    key: state.curTab.key,
    name: state.tabName || state.curTab.name,
    amount: state.curTab.amount,
    average: 'average' in state.curTab ? state.curTab.average : undefined,
    ranking: state.curTab.ranking,
    records: flattenRecords(state.curTab.data),
  };
}

function getMatchedRouteState(state: ChartCategoryLocationState | null, context: {
  categoryId: string;
  type: AmountType;
  category: TimeRangeCategory;
  tabKey: string | null;
}) {
  if (!state?.rankingItem)
    return undefined;

  if (String(state.rankingItem.category.id) !== context.categoryId)
    return undefined;

  if (state.amountType && state.amountType !== context.type)
    return undefined;

  if (state.timeRangeCategory && state.timeRangeCategory !== context.category)
    return undefined;

  if (state.tabKey && state.curTab?.key && state.tabKey !== state.curTab.key)
    return undefined;

  const stateTabKey = state.tabKey || state.curTab?.key;
  if (stateTabKey && context.tabKey && stateTabKey !== context.tabKey)
    return undefined;

  return state;
}

const ChartCategory: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const routeState = location.state as ChartCategoryLocationState | null;

  const categoryId = searchParams.get('categoryId');
  const type = searchParams.get('type');
  const category = searchParams.get('category');
  const tabKey = searchParams.get('tabKey');
  const hasRequiredParams = !!categoryId && isAmountType(type) && isTimeRangeCategory(category);
  const matchedRouteState = useMemo(() => {
    if (!categoryId || !isAmountType(type) || !isTimeRangeCategory(category))
      return undefined;

    return getMatchedRouteState(routeState, {
      categoryId,
      type,
      category,
      tabKey,
    });
  }, [category, categoryId, routeState, tabKey, type]);

  const { data, isError, isFetching } = useGetChartQuery({
    params: {
      type: isAmountType(type) ? type : 'sub',
      category: isTimeRangeCategory(category) ? category : 'week',
      categoryId: categoryId || undefined,
    },
    options: {
      enabled: hasRequiredParams,
    },
  });

  const periodsFromData = useMemo(() => {
    if (!isTimeRangeCategory(category))
      return [];
    return getPeriodsFromData(data, category);
  }, [category, data]);

  const periodFromState = useMemo(() => getPeriodFromState(matchedRouteState || null), [matchedRouteState]);
  const selectedPeriod = useMemo(() => {
    return periodFromState || periodsFromData.find(item => item.key === tabKey) || periodsFromData.at(-1);
  }, [periodFromState, periodsFromData, tabKey]);

  const rankingItem = useMemo(() => {
    return matchedRouteState?.rankingItem || selectedPeriod?.ranking?.find(item => String(item.category.id) === categoryId);
  }, [categoryId, matchedRouteState?.rankingItem, selectedPeriod]);

  const records = (selectedPeriod?.records || []).filter(record => String(record.category.id) === categoryId);
  const totalAmount = rankingItem?.amount ?? (records.length ? getRecordsAmount(records) : undefined);
  const percentage = rankingItem?.percentage;
  const categoryInfo = rankingItem?.category || records[0]?.category;
  const periodName = matchedRouteState?.tabName || selectedPeriod?.name;
  const currentType = isAmountType(type) ? type : matchedRouteState?.amountType;
  const currentCategory = isTimeRangeCategory(category) ? category : matchedRouteState?.timeRangeCategory;
  const hasMatchedDisplayData = !!rankingItem || records.length > 0;

  const onBack = () => navigate(-1);

  if (!hasRequiredParams) {
    return (
      <div className={cn('min-h-screen bg-[#f7f7f7] flex flex-col')}>
        <NavBar back="返回" onBack={onBack}>分类详情</NavBar>
        <div className={cn('flex-grow flex items-center justify-center')}>
          <ErrorBlock status="empty" title="缺少分类统计参数" description="请从图表排行榜进入分类详情。" />
        </div>
      </div>
    );
  }

  if (isError && !hasMatchedDisplayData) {
    return (
      <div className={cn('min-h-screen bg-[#f7f7f7] flex flex-col')}>
        <NavBar back="返回" onBack={onBack}>分类详情</NavBar>
        <div className={cn('flex-grow flex items-center justify-center')}>
          <ErrorBlock status="default" title="分类统计加载失败" description="请返回图表页后重试。" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn('min-h-screen bg-[#f7f7f7] flex flex-col')}>
      <NavBar back="返回" onBack={onBack}>分类详情</NavBar>

      <div className={cn('flex-grow overflow-y-auto')}>
        <div className={cn('bg-white px-4 pt-5 pb-4 border-0 border-b-[1px] border-[#eee] border-solid')}>
          <div className={cn('flex items-center')}>
            <div className={cn('w-[44px] h-[44px] rounded-full bg-[#f4f4f4] flex items-center justify-center mr-3')}>
              {categoryInfo?.icon ? <Icon name={categoryInfo.icon} className={cn('text-[24px]')} /> : null}
            </div>
            <div className={cn('min-w-0 flex-grow')}>
              <div className={cn('text-[18px] font-medium truncate')}>{categoryInfo?.name || '分类统计'}</div>
              <div className={cn('text-[12px] text-[#969696] mt-1')}>
                {periodName || '当前周期'}
                {currentType ? ` · ${amountTypeName[currentType]}` : null}
                {currentCategory ? ` · 按${timeRangeName[currentCategory]}统计` : null}
              </div>
            </div>
          </div>

          <div className={cn('grid grid-cols-2 gap-3 mt-5')}>
            <div>
              <div className={cn('text-[12px] text-[#969696]')}>分类金额</div>
              <div className={cn('text-[24px] leading-8 mt-1')}>{totalAmount ?? '--'}</div>
            </div>
            <div>
              <div className={cn('text-[12px] text-[#969696]')}>占比</div>
              <div className={cn('text-[24px] leading-8 mt-1')}>{percentage ? `${percentage}%` : '--'}</div>
            </div>
          </div>
        </div>

        <div className={cn('bg-white mt-2 px-4 py-3 text-[14px]')}>
          <div className={cn('flex justify-between py-1')}>
            <span className={cn('text-[#969696]')}>周期</span>
            <span>{periodName || '--'}</span>
          </div>
          <div className={cn('flex justify-between py-1')}>
            <span className={cn('text-[#969696]')}>周期总额</span>
            <span>{selectedPeriod?.amount ?? '--'}</span>
          </div>
          <div className={cn('flex justify-between py-1')}>
            <span className={cn('text-[#969696]')}>平均值</span>
            <span>{selectedPeriod?.average || '--'}</span>
          </div>
        </div>

        <div className={cn('bg-white mt-2')}>
          <List header="明细记录" style={{ '--border-top': '0px', '--border-bottom': '0px' }}>
            {records.map((record, index) => (
              <RecordListItem
                key={record.id}
                record={record}
                index={index}
                lastIndex={records.length - 1}
                onClick={() => navigate(`/editing/${record.id}`, { state: record })}
              />
            ))}
          </List>

          {!records.length && (
            <div className={cn('py-8 flex justify-center')}>
              {isFetching
                ? <SpinLoading color="default" />
                : <ErrorBlock status="empty" title="暂无明细记录" description={false} />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChartCategory;
