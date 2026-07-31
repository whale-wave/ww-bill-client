import type { Dayjs } from 'dayjs';
import type { ReactNode } from 'react';
import type { numType } from './DetailPage';
import type { RecordOverviewHeaderProps } from '@/entities/record';
import dayjs from 'dayjs';
import { CalendarDays, Eye, EyeOff, Search, Settings } from 'lucide-react';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { RecordMonthPicker } from '@/entities/record';
import config from '@/shared/config';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';
import { Icon } from '@/shared/ui';
import { useVisibleAmount } from '../model/useVisibleAmount';

interface RecordOverviewHeaderAdapterOptions {
  numExpendIncome: numType | [];
  selectTime: Dayjs;
  setSelectTime: (val: Dayjs) => void;
}

function renderAmount(parts: string[] | undefined, isVisible: boolean): ReactNode {
  if (!isVisible)
    return <span className="text-lg font-bold leading-[19px]">*******</span>;

  return (
    <span className="truncate">
      <span className="text-lg leading-[19px]">{parts?.[0] ?? '0'}</span>
      <span className="text-xs">{parts?.[1] ? `.${parts[1]}` : '.00'}</span>
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
    amountToggle: visibleAmountSwitch
      ? {
          content: !visibleAmount ? <EyeOff size={18} strokeWidth={2} /> : <Eye size={18} strokeWidth={2} />,
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
    renderTitle: className => <h1 className={className}>{config.appName}</h1>,
    shortcuts: [
      {
        icon: <Icon name="bill" />,
        key: 'bill',
        label: t('bill:title'),
        onClick: () => navigate(ROUTES_PATH.BILL.getPath()),
      },
      {
        icon: <Icon name="budget" />,
        key: 'budget',
        label: t('budget:title'),
        onClick: () => navigate(ROUTES_PATH.BUDGET.getPath()),
      },
      {
        icon: <Search size={20} />,
        key: 'search',
        label: t('search.title'),
        onClick: handleSearch,
        testId: 'record-search-action',
      },
      {
        icon: <CalendarDays size={20} />,
        key: 'calendar',
        label: t('calendar.title'),
        onClick: handleCalendar,
        testId: 'record-calendar-action',
      },
      {
        icon: <Settings size={20} />,
        key: 'settings',
        label: t('settings:title'),
        onClick: () => navigate(ROUTES_PATH.SETTINGS.getPath()),
      },
    ],
    titleAlignment: 'start',
  };
}
