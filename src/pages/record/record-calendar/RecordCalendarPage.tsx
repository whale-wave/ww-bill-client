import dayjs from 'dayjs';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { CategoryIcon } from '@/entities/category';
import {
  RecordCalendarPresentation,
  toRecordSearchGroups,
} from '@/entities/record';
import { getQueryViewState } from '@/shared/api';
import { useTranslation } from '@/shared/i18n';
import { playSound } from '@/shared/lib/play-sound';
import { useRecordCalendar } from '../model/useRecordCalendar';

function RecordCalendar() {
  const { t } = useTranslation('record');
  const navigate = useNavigate();
  const {
    selectMonthValue,
    selectDateValue,
    dateMap,
    list,
    onBack,
    onMonthChange,
    onChangeDate,
    onToToday,
    onFixedPinClick,
    isError,
    hasData,
    isFetching,
    isLoading,
    refetch,
  } = useRecordCalendar();
  const viewState = getQueryViewState({ hasData, isError, isFetching, isLoading });

  const days = useMemo(() => Array.from(dateMap, ([timestamp, value]) => ({
    date: dayjs(timestamp).format('YYYY-MM-DD'),
    expense: value.expend || undefined,
    income: value.income || undefined,
  })), [dateMap]);
  const groups = useMemo(() => toRecordSearchGroups(list.data, {
    expenseLabel: t('common:amount.expend'),
    incomeLabel: t('common:amount.income'),
    onRecordClick: (record) => {
      playSound.turnPage();
      navigate(`/editing/${record.id}`, { state: record });
    },
  }), [list.data, navigate, t]);

  return (
    <RecordCalendarPresentation
      backLabel={t('common:nav.back')}
      days={days}
      emptyDescription={t('calendar.emptyDescription')}
      emptyLabel={t('common:empty')}
      errorDescription={t('common:error.loadFail')}
      groups={groups}
      month={selectMonthValue}
      onBack={onBack}
      onCreate={onFixedPinClick}
      onDateChange={date => onChangeDate(date.toDate())}
      onMonthChange={onMonthChange}
      onRetry={() => void refetch()}
      onToday={onToToday}
      retryLabel={t('common:retry')}
      renderCategoryIcon={item => <CategoryIcon categoryName={item.categoryName} iconKey={item.iconName} size={18} />}
      selectedDayLabel={t('calendar.selectedDay')}
      selectedDate={selectDateValue}
      state={viewState.isInitialLoading ? 'loading' : viewState.isBlockingError ? 'error' : 'ready'}
      todayLabel={t('common:time.today')}
    />
  );
}

export default RecordCalendar;
