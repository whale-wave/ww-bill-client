import type { Dayjs } from 'dayjs';
import type { ReactNode } from 'react';
import type { numType } from './DetailPage';
import type { RecordOverviewHeaderProps } from '@/entities/record';
import dayjs from 'dayjs';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { RecordMonthPicker } from '@/entities/record';
import { LedgerTitleSwitcher } from '@/features/ledger-switcher';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';
import { DesignIcon } from '@/shared/ui';
import { useVisibleAmount } from '../model/useVisibleAmount';

interface RecordOverviewHeaderAdapterOptions {
  numExpendIncome: numType | [];
  selectTime: Dayjs;
  setSelectTime: (val: Dayjs) => void;
}

function renderAmount(parts: string[] | undefined, isVisible: boolean): ReactNode {
  if (!isVisible)
    return <span className="text-[16px] font-extrabold leading-6">＊＊＊＊＊</span>;

  return (
    <span className="truncate">
      <span>{parts?.[0] ?? '0'}</span>
      <span>{parts?.[1] ? `.${parts[1]}` : '.00'}</span>
    </span>
  );
}

export function useRecordOverviewHeader({
  numExpendIncome,
  selectTime,
  setSelectTime,
}: RecordOverviewHeaderAdapterOptions): RecordOverviewHeaderProps {
  const navigate = useNavigate();
  const { t } = useTranslation('record');
  const {
    visibleAmount,
    visibleAmountSwitch,
    isVisibleAmount,
    onToggleVisibleAmount,
  } = useVisibleAmount();

  const handleChangeTimeDate = (month: Dayjs) => {
    sessionStorage.setItem('timeDate', month.format('YYYY-MM-DD'));
    setSelectTime(month);
  };

  const handleSearch = useCallback(() => {
    navigate('/search-record');
  }, [navigate]);

  const handleCalendar = useCallback(() => {
    const calendarTime = dayjs().isSame(selectTime, 'month') ? dayjs() : selectTime;
    navigate(`/record-calendar?selectTime=${calendarTime.valueOf()}`);
  }, [navigate, selectTime]);

  return {
    actions: (
      <>
        <button
          aria-label={t('search.title')}
          className="border-0 bg-transparent p-0"
          data-testid="record-search-action"
          onClick={handleSearch}
          type="button"
        >
          <DesignIcon name="search" size={16} />
        </button>
        <button
          aria-label={t('calendar.title')}
          className="border-0 bg-transparent p-0"
          data-testid="record-calendar-action"
          onClick={handleCalendar}
          type="button"
        >
          <DesignIcon name="calendar" size={16} />
        </button>
      </>
    ),
    amountToggle: visibleAmountSwitch
      ? {
          content: <DesignIcon name={visibleAmount ? 'amount-visible' : 'amount-hidden'} size={16} />,
          onClick: () => void onToggleVisibleAmount(),
        }
      : undefined,
    metrics: [
      {
        key: 'income',
        label: t('common:amount.income'),
        value: renderAmount(numExpendIncome[1], isVisibleAmount),
      },
      {
        key: 'expense',
        label: t('common:amount.expend'),
        value: renderAmount(numExpendIncome[0], isVisibleAmount),
      },
    ],
    period: {
      label: selectTime.format('YYYY年'),
      testId: 'record-period-control',
      value: (
        <RecordMonthPicker
          month={selectTime}
          monthLabel={t('common:time.month')}
          onChange={handleChangeTimeDate}
          testId="record-month-picker"
        />
      ),
    },
    renderTitle: className => <LedgerTitleSwitcher className={className} />,
    titleIcon: <DesignIcon name="ledger" size={15} />,
    shortcuts: [
      {
        icon: <DesignIcon name="shortcut-bill" size={20} />,
        key: 'bill',
        label: t('bill:title'),
        onClick: () => navigate(ROUTES_PATH.BILL.getPath()),
      },
      {
        icon: <DesignIcon name="shortcut-budget" size={20} />,
        key: 'budget',
        label: t('budget:title'),
        onClick: () => navigate(ROUTES_PATH.BUDGET.getPath()),
      },
      {
        icon: <DesignIcon name="shortcut-asset" size={20} />,
        key: 'asset-steward',
        label: t('common:commonFunctions.assetSteward'),
        onClick: () => navigate(ROUTES_PATH.ASSET.getPath()),
      },
    ],
  };
}
