import type { StatusTabOption } from './constants';
import type { FixedExpenseEntity } from '@/entities/fixed-expense';
import { Skeleton, SwipeAction, Toast } from 'antd-mobile';
import { CalendarClock, Plus, Trash2 } from 'lucide-react';
import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FixedExpenseStatus, useDeleteFixedExpenseMutation, useGetFixedExpenseQuery } from '@/entities/fixed-expense';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';
import { confirmAppAction, IllustratedEmptyState, PageHeader, Surface } from '@/shared/ui';
import {
  AddFixedExpenseButton,
  FilterTabs,
  FixedExpenseItem,
  SummaryCard,
  UpcomingList,
} from './ui';

const FixedExpenses: React.FC = () => {
  const { t } = useTranslation('fixed-expense');
  const navigate = useNavigate();
  const [statusTab, setStatusTab] = useState<StatusTabOption['key']>('all');

  const query = useGetFixedExpenseQuery();
  const { list, summary } = query;
  const [deleteMutate, deleteState] = useDeleteFixedExpenseMutation();

  const counts = useMemo(() => {
    const acc: Partial<Record<StatusTabOption['key'], number>> = {
      all: list.length,
      [FixedExpenseStatus.ACTIVE]: 0,
      [FixedExpenseStatus.PAUSED]: 0,
      [FixedExpenseStatus.EXPIRED]: 0,
    };
    for (const item of list) {
      if (acc[item.status] !== undefined)
        acc[item.status] = (acc[item.status] ?? 0) + 1;
    }
    return acc;
  }, [list]);

  const activeCount = useMemo(
    () => list.filter(item => item.status === FixedExpenseStatus.ACTIVE).length,
    [list],
  );

  const filteredList = useMemo(() => {
    if (statusTab === 'all')
      return list;
    return list.filter(item => item.status === statusTab);
  }, [list, statusTab]);

  const onBack = useCallback(() => navigate(-1), [navigate]);

  const onClickItem = useCallback((item: FixedExpenseEntity) => {
    navigate(ROUTES_PATH.FIXED_EXPENSES_DETAIL.getPath(item.id));
  }, [navigate]);

  const onEditItem = useCallback((item: FixedExpenseEntity) => {
    navigate(ROUTES_PATH.FIXED_EXPENSES_EDIT.getPath(item.id));
  }, [navigate]);

  const onDeleteItem = useCallback(async (item: FixedExpenseEntity) => {
    if (deleteState.isLoading)
      return;
    const confirmed = await confirmAppAction({
      cancelText: t('common:nav.cancel'),
      confirmText: t('common:action.delete'),
      description: t('deleteDescription'),
      icon: <Trash2 size={22} strokeWidth={1.8} />,
      title: t('deleteTitle'),
      tone: 'danger',
    });
    if (!confirmed)
      return;
    try {
      await deleteMutate(item.id);
      Toast.show({ icon: 'success', content: t('common:confirm.deleteSuccess') });
    }
    catch {
      Toast.show({ icon: 'fail', content: t('deleteFailed') });
    }
  }, [deleteMutate, deleteState.isLoading, t]);

  return (
    <div className="page-new relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute -right-20 top-16 h-56 w-56 rounded-full bg-primary-light/40 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 bottom-24 h-48 w-48 rounded-full bg-ww-pink/15 blur-3xl" />
      <PageHeader backLabel={t('common:nav.back')} onBack={onBack} subtitle={t('subtitle')} title={t('list.title')} />

      <main className="relative z-[1] min-h-0 flex-grow overflow-y-auto px-[18px] pb-5 pt-2">
        <div className="mx-auto w-full max-w-[520px]">
          <SummaryCard
            summary={summary}
            totalCount={list.length}
            activeCount={activeCount}
          />

          {summary.nextBillingItems.length > 0 && (
            <div className="pt-4">
              <UpcomingList items={summary.nextBillingItems} onClickItem={onClickItem} />
            </div>
          )}

          <div className="sticky top-0 z-10 -mx-1 mt-3 bg-bg-gray/90 px-1 py-2 backdrop-blur-xl">
            <FilterTabs value={statusTab} counts={counts} onChange={setStatusTab} />
          </div>

          <div className="space-y-3 pb-4">
            {query.isLoading && list.length === 0
              ? (
                  <Surface className="p-4" material="content">
                    <Skeleton.Title animated />
                    <Skeleton.Paragraph animated lineCount={4} />
                  </Surface>
                )
              : query.isError
                ? (
                    <Surface material="content">
                      <IllustratedEmptyState
                        actionLabel={t('retry')}
                        description={t('loadErrorDescription')}
                        icon={<CalendarClock className="text-primary-deep" size={40} strokeWidth={1.6} />}
                        onAction={() => void query.refetch()}
                        title={t('loadError')}
                      />
                    </Surface>
                  )
                : filteredList.length === 0
                  ? (
                      <Surface material="content">
                        <IllustratedEmptyState
                          accentIcon={<Plus size={19} />}
                          actionLabel={t('list.addFixedExpense')}
                          description={t('list.emptyDescription')}
                          icon={<CalendarClock className="text-primary-deep" size={42} strokeWidth={1.6} />}
                          onAction={() => navigate(ROUTES_PATH.FIXED_EXPENSES_CREATE.getPath())}
                          title={t('list.empty')}
                        />
                      </Surface>
                    )
                  : (
                      filteredList.map(item => (
                        <SwipeAction
                          key={item.id}
                          rightActions={[
                            {
                              key: 'edit',
                              text: t('common:action.edit'),
                              color: 'primary',
                              onClick: () => onEditItem(item),
                            },
                            {
                              key: 'delete',
                              text: t('common:action.delete'),
                              color: 'danger',
                              onClick: () => void onDeleteItem(item),
                            },
                          ]}
                        >
                          <FixedExpenseItem item={item} onClick={onClickItem} />
                        </SwipeAction>
                      ))
                    )}
          </div>
        </div>
      </main>

      <AddFixedExpenseButton />
    </div>
  );
};

export default FixedExpenses;
