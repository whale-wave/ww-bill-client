import type { FC } from 'react';
import type { ChartCategoryLocationState } from './model/chartCategoryUtils';
import { ErrorBlock, List, SpinLoading } from 'antd-mobile';
import { useMemo } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useGetChartQuery } from '@/entities/chart';
import { RecordListItem } from '@/entities/record';
import { useTranslation } from '@/shared/i18n';
import { cn } from '@/shared/lib';
import { Icon, NavBar } from '@/shared/ui';
import {
  amountTypeName,
  getMatchedRouteState,
  getPeriodFromState,
  getPeriodsFromData,
  getRecordsAmount,
  isAmountType,
  isTimeRangeCategory,
  timeRangeName,

} from './model/chartCategoryUtils';

const ChartCategory: FC = () => {
  const { t } = useTranslation('chart');
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
    return getMatchedRouteState(routeState, { categoryId, type, category, tabKey });
  }, [category, categoryId, routeState, tabKey, type]);

  const { data, isError, isFetching } = useGetChartQuery({
    params: {
      type: isAmountType(type) ? type : 'sub',
      category: isTimeRangeCategory(category) ? category : 'week',
      categoryId: categoryId || undefined,
    },
    options: { enabled: hasRequiredParams },
  });

  const periodsFromData = useMemo(() => {
    if (!isTimeRangeCategory(category))
      return [];
    return getPeriodsFromData(data, category);
  }, [category, data]);

  const periodFromState = useMemo(() => getPeriodFromState(matchedRouteState || null), [matchedRouteState]);
  const selectedPeriod = useMemo(() =>
    periodFromState || periodsFromData.find(item => item.key === tabKey) || periodsFromData.at(-1), [periodFromState, periodsFromData, tabKey]);

  const rankingItem = useMemo(() =>
    matchedRouteState?.rankingItem || selectedPeriod?.ranking?.find(item => String(item.category.id) === categoryId), [categoryId, matchedRouteState?.rankingItem, selectedPeriod]);

  const records = (selectedPeriod?.records || []).filter(record => String(record.category.id) === categoryId);
  const totalAmount = rankingItem?.amount ?? (records.length ? getRecordsAmount(records) : undefined);
  const percentage = rankingItem?.percentage;
  const categoryInfo = rankingItem?.category || records[0]?.category;
  const periodName = matchedRouteState?.tabName || selectedPeriod?.name;
  const currentType = isAmountType(type) ? type : matchedRouteState?.amountType;
  const currentCategory = isTimeRangeCategory(category) ? category : matchedRouteState?.timeRangeCategory;
  const hasMatchedDisplayData = !!rankingItem || records.length > 0;

  const onBack = () => navigate(-1);

  const renderNavBar = (title: string) => (
    <NavBar back={t('common:nav.back')} onBack={onBack}>{title}</NavBar>
  );

  if (!hasRequiredParams) {
    return (
      <div className={cn('min-h-screen bg-[#f7f7f7] flex flex-col')}>
        {renderNavBar(t('categoryDetail'))}
        <div className={cn('flex-grow flex items-center justify-center')}>
          <ErrorBlock status="empty" title={t('missingParams')} description={t('missingParamsHint')} />
        </div>
      </div>
    );
  }

  if (isError && !hasMatchedDisplayData) {
    return (
      <div className={cn('min-h-screen bg-[#f7f7f7] flex flex-col')}>
        {renderNavBar(t('categoryDetail'))}
        <div className={cn('flex-grow flex items-center justify-center')}>
          <ErrorBlock status="default" title={t('loadFail')} description={t('loadFailHint')} />
        </div>
      </div>
    );
  }

  return (
    <div className={cn('min-h-screen bg-[#f7f7f7] flex flex-col')}>
      {renderNavBar(t('categoryDetail'))}

      <div className={cn('flex-grow overflow-y-auto')}>
        <div className={cn('bg-white px-4 pt-5 pb-4 border-0 border-b-[1px] border-[#eee] border-solid')}>
          <div className={cn('flex items-center')}>
            <div className={cn('w-[44px] h-[44px] rounded-full bg-[#f4f4f4] flex items-center justify-center mr-3')}>
              {categoryInfo?.icon ? <Icon name={categoryInfo.icon} className={cn('text-2xl')} /> : null}
            </div>
            <div className={cn('min-w-0 flex-grow')}>
              <div className={cn('text-lg font-medium truncate')}>{categoryInfo?.name || t('categoryStat')}</div>
              <div className={cn('text-sm text-[#969696] mt-1')}>
                {periodName || t('currentPeriod')}
                {currentType ? ` · ${amountTypeName[currentType]}` : null}
                {currentCategory ? ` · ${t('byPeriod', { period: timeRangeName[currentCategory] })}` : null}
              </div>
            </div>
          </div>

          <div className={cn('grid grid-cols-2 gap-3 mt-5')}>
            <div>
              <div className={cn('text-sm text-[#969696]')}>{t('categoryAmount')}</div>
              <div className={cn('text-2xl leading-8 mt-1')}>{totalAmount ?? '--'}</div>
            </div>
            <div>
              <div className={cn('text-sm text-[#969696]')}>{t('percent')}</div>
              <div className={cn('text-2xl leading-8 mt-1')}>{percentage ? `${percentage}%` : '--'}</div>
            </div>
          </div>
        </div>

        <div className={cn('bg-white mt-2 px-4 py-3 text-base')}>
          <div className={cn('flex justify-between py-1')}>
            <span className={cn('text-[#969696]')}>{t('period')}</span>
            <span>{periodName || '--'}</span>
          </div>
          <div className={cn('flex justify-between py-1')}>
            <span className={cn('text-[#969696]')}>{t('periodTotal')}</span>
            <span>{selectedPeriod?.amount ?? '--'}</span>
          </div>
          <div className={cn('flex justify-between py-1')}>
            <span className={cn('text-[#969696]')}>{t('average')}</span>
            <span>{selectedPeriod?.average || '--'}</span>
          </div>
        </div>

        <div className={cn('bg-white mt-2')}>
          <List header={t('recordList')} style={{ '--border-top': '0px', '--border-bottom': '0px' }}>
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
                : <ErrorBlock status="empty" title={t('noRecords')} description={false} />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChartCategory;
