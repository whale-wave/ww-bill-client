import type { Dayjs } from 'dayjs';
import type { FC } from 'react';
import type { recordChildren, RecordOverviewListGroup } from '@/entities/record';
import { Toast } from 'antd-mobile';
import dayjs from 'dayjs';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CategoryIcon } from '@/entities/category';
import {
  getRecordListIndicators,
  RecordOverviewPresentation,
  useDeleteRecordMutation,
} from '@/entities/record';
import { useRecordOverviewHeader } from '@/pages/record/detail/Top';
import { getQueryViewState } from '@/shared/api';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';
import { playSound } from '@/shared/lib/play-sound';
import { confirmDangerousAction } from '@/shared/ui';
import { TabBar } from '@/widgets/layout';
import { useRecordList } from '../model/useRecordList';

export type numType = [Array<string>, Array<string>];

const Detail: FC = () => {
  const [selectTime, setSelectTime] = useState<Dayjs>(() => {
    const stored = sessionStorage.getItem('timeDate');
    return stored ? dayjs(stored) : dayjs();
  });
  const navigate = useNavigate();
  const { t } = useTranslation(['record', 'common']);
  const query = useRecordList(selectTime);
  const [deleteRecord, deleteState] = useDeleteRecordMutation();
  const deletingRecordIdRef = useRef<number>();
  const header = useRecordOverviewHeader({
    numExpendIncome: query.amounts,
    selectTime,
    setSelectTime,
  });

  const handleRecord = useCallback((item: recordChildren) => {
    playSound.turnPage();
    navigate(`/editing/${item.id}`, { state: item });
  }, [navigate]);

  const handleDelete = useCallback(async (item: recordChildren) => {
    if (deleteState.isLoading || deletingRecordIdRef.current !== undefined)
      return;
    const confirmed = await confirmDangerousAction({
      cancelText: t('common:nav.cancel'),
      confirmText: t('detail.delete'),
      description: t('detail.deleteWarning'),
      title: t('common:confirm.delete'),
    });
    if (!confirmed)
      return;
    deletingRecordIdRef.current = item.id;
    try {
      const response = await deleteRecord({ id: String(item.id), version: item.version });
      Toast.show({ content: response.message || t('common:confirm.deleteSuccess'), icon: 'success' });
    }
    catch (error) {
      await query.refetch();
      const isConflict = typeof error === 'object' && error !== null && 'statusCode' in error && error.statusCode === 409;
      Toast.show({ content: t(isConflict ? 'bookkeeping.conflict' : 'common:api.requestFailed'), icon: 'fail' });
    }
    finally {
      deletingRecordIdRef.current = undefined;
    }
  }, [deleteRecord, deleteState.isLoading, query, t]);

  const groups = useMemo<RecordOverviewListGroup[]>(() => query.record.map(group => ({
    dateLabel: `${group[0]} ${group[1]}`,
    key: `${group[0]}-${group[1]}`,
    records: group[3].map((item) => {
      const indicators = getRecordListIndicators(item);
      return {
        amount: item.type === 'add' ? item.amount : -Number(item.amount),
        amountTone: item.type === 'add' ? 'income' : 'expense',
        categoryName: item.category.name,
        hasAttachment: indicators.hasAttachment,
        iconName: item.category.icon,
        id: item.id,
        onClick: () => handleRecord(item),
        originalAmount: item.originalAmount ? `-${item.originalAmount}` : undefined,
        overviewSecondary: [indicators.adjustmentSummary, indicators.tagSummary].filter(Boolean).join(' · ') || undefined,
        primary: item.remark,
        rightActions: [{
          color: 'danger',
          key: 'delete',
          onClick: (event) => {
            event.stopPropagation();
            void handleDelete(item);
          },
          text: t('detail.delete'),
        }],
      };
    }),
    summaries: [
      ...(group[5] > 0
        ? [{ key: 'income', label: t('common:amount.income'), value: group[5] }]
        : []),
      { key: 'expense', label: t('common:amount.expend'), value: group[4] },
    ],
  })), [handleDelete, handleRecord, query.record, t]);
  const viewState = getQueryViewState({
    hasData: query.hasData,
    isError: query.isError,
    isFetching: query.isFetching,
    isLoading: query.isLoading,
  });

  return (
    <div className="page-new relative overflow-hidden">
      <RecordOverviewPresentation
        emptyActionLabel={t('detail.emptyAction')}
        emptyDescription={t('detail.emptyDescription')}
        emptyTitle={t('detail.emptyTitle')}
        errorDescription={t('detail.errorDescription')}
        errorTitle={t('detail.errorTitle')}
        groups={groups}
        header={header}
        onEmptyAction={() => navigate(ROUTES_PATH.BOOKKEEPING.getPath())}
        onRetry={() => void query.refetch()}
        retryLabel={t('detail.errorAction')}
        renderCategoryIcon={item => <CategoryIcon categoryName={item.categoryName} iconKey={item.iconName} size={18} />}
        state={viewState.isInitialLoading ? 'loading' : viewState.isBlockingError ? 'error' : 'ready'}
      />
      <TabBar active={0} />
    </div>
  );
};

export default Detail;
