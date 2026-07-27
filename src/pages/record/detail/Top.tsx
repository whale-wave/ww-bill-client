import type { Dayjs } from 'dayjs';
import type { FC, ReactNode } from 'react';
import type { numType } from './DetailPage';
import dayjs from 'dayjs';
import { CalendarDays, Eye, EyeOff, Search, Triangle } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RecordOverviewHeader } from '@/entities/record';
import { LedgerTitleSwitcher } from '@/features/ledger-switcher';
import Precision from '@/pages/record/detail/ui';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';
import { cn } from '@/shared/lib';
import { Icon } from '@/shared/ui';
import { useVisibleAmount } from '../model/useVisibleAmount';

interface TopProps {
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

const Top: FC<TopProps> = ({ numExpendIncome, selectTime, setSelectTime }) => {
  const [isMonthPickerVisible, setIsMonthPickerVisible] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation('record');
  const {
    visibleAmount,
    visibleAmountSwitch,
    isVisibleAmount,
    onToggleVisibleAmount,
  } = useVisibleAmount();

  const handleChangeTimeDate = (time: string) => {
    sessionStorage.setItem('timeDate', time);
    setSelectTime(dayjs(time));
  };

  const handleSearch = useCallback(() => {
    navigate('/search-record');
  }, [navigate]);

  const handleCalendar = useCallback(() => {
    const calendarTime = dayjs().isSame(selectTime, 'month') ? dayjs() : selectTime;
    navigate(`/record-calendar?selectTime=${calendarTime.valueOf()}`);
  }, [navigate, selectTime]);

  return (
    <RecordOverviewHeader
      actions={(
        <>
          <button className="border-0 bg-transparent p-0" data-testid="record-search-action" onClick={handleSearch} type="button">
            <Search size={18} strokeWidth={2} />
          </button>
          <button className="border-0 bg-transparent p-0" data-testid="record-calendar-action" onClick={handleCalendar} type="button">
            <CalendarDays size={18} strokeWidth={2} />
          </button>
        </>
      )}
      amountToggle={visibleAmountSwitch
        ? {
            content: !visibleAmount ? <EyeOff size={18} strokeWidth={2} /> : <Eye size={18} strokeWidth={2} />,
            onClick: () => void onToggleVisibleAmount(),
          }
        : undefined}
      metrics={[
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
      ]}
      period={{
        label: selectTime.format('YYYY年'),
        onClick: () => setIsMonthPickerVisible(true),
        testId: 'record-period-control',
        value: (
          <div className="relative flex items-end text-font-black">
            <span className="text-[length:var(--ww-font-size-2xl)] leading-none">{selectTime.format('MM')}</span>
            <span className="ml-1 text-base">{t('common:time.month')}</span>
            <Triangle
              className={cn(
                'mb-[2px] ml-1 transition-transform duration-200 ease-in-out',
                isMonthPickerVisible ? 'rotate-0' : 'rotate-180',
              )}
              fill="currentColor"
              size={10}
              stroke="none"
            />
            <Precision
              change={() => setIsMonthPickerVisible(false)}
              changeTime={handleChangeTimeDate}
              selectTime={selectTime}
              visible1={isMonthPickerVisible}
            />
          </div>
        ),
      }}
      renderTitle={className => <LedgerTitleSwitcher className={className} />}
      shortcuts={[
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
          icon: <Icon name="asset-steward" />,
          key: 'asset-steward',
          label: t('common:commonFunctions.assetSteward'),
          onClick: () => navigate(ROUTES_PATH.ASSET.getPath()),
        },
      ]}
    />
  );
};

export default Top;
