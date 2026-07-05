import type { StatusTabOption } from './constants';
import type { FixedExpenseEntity } from '@/entities/fixed-expense';
import { Dialog, ErrorBlock, Skeleton, SwipeAction, Toast } from 'antd-mobile';
import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FixedExpenseStatus, useDeleteFixedExpenseMutation, useGetFixedExpenseQuery } from '@/entities/fixed-expense';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';
import { NavBar } from '@/shared/ui';
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

  const { list, summary, isLoading } = useGetFixedExpenseQuery();
  const [deleteMutate] = useDeleteFixedExpenseMutation();

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

  const onDeleteItem = useCallback((item: FixedExpenseEntity) => {
    void Dialog.confirm({
      content: `${t('list.confirmDelete')}"${item.name}"?`,
      onConfirm: async () => {
        await deleteMutate(item.id);
        void Toast.show({ icon: 'success', content: t('common:confirm.deleteSuccess') });
      },
    });
  }, [deleteMutate, t]);

  return (
    <div className="page-new overflow-hidden">
      <NavBar onBack={onBack} back={t('common:nav.back')}>{t('list.title')}</NavBar>

      <div className="flex-grow h-0 overflow-auto bg-bg-gray">
        <div className="px-3 pt-3">
          <SummaryCard
            summary={summary}
            totalCount={list.length}
            activeCount={activeCount}
          />
        </div>

        {summary.nextBillingItems.length > 0 && (
          <div className="px-3 pt-4">
            <UpcomingList items={summary.nextBillingItems} onClickItem={onClickItem} />
          </div>
        )}

        <div className="sticky top-0 z-10 mt-2 bg-bg-gray px-2 pb-1 pt-2">
          <FilterTabs value={statusTab} counts={counts} onChange={setStatusTab} />
        </div>

        <div className="space-y-2 px-3 pb-4">
          {isLoading && list.length === 0
            ? (
                <div className="rounded-lg bg-white p-3">
                  <Skeleton.Title animated />
                  <Skeleton.Paragraph animated lineCount={4} />
                </div>
              )
            : filteredList.length === 0
              ? (
                  <div className="mt-10">
                    <ErrorBlock
                      status="empty"
                      title={t('list.empty')}
                      description={t('list.emptyDescription')}
                    />
                  </div>
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
                          onClick: () => onDeleteItem(item),
                        },
                      ]}
                    >
                      <FixedExpenseItem item={item} onClick={onClickItem} />
                    </SwipeAction>
                  ))
                )}
        </div>
      </div>

      <AddFixedExpenseButton />
    </div>
  );
};

export default FixedExpenses;
