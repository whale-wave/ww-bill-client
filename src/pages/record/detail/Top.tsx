import type { Dayjs } from 'dayjs';
import type { FC } from 'react';
import type { numType } from './DetailPage';
import dayjs from 'dayjs';
import { CalendarDays, Eye, EyeOff, Search } from 'lucide-react';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { LedgerTitleSwitcher } from '@/features/ledger-switcher';
import { RecordMonthPicker, RecordOverviewHeader } from '@/features/record-workspace';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';
import { useVisibleAmount } from '../model/useVisibleAmount';

interface TopProps {
  numExpendIncome: numType | [];
  selectTime: Dayjs;
  setSelectTime: (val: Dayjs) => void;
}

function AmountValue({ amount, isVisible }: { amount?: string[]; isVisible: boolean }) {
  if (!isVisible)
    return <span className="text-lg font-bold leading-[19px]">*******</span>;

  return (
    <>
      <span className="text-lg leading-[19px]">{amount?.[0] || '0'}</span>
      <span className="text-xs">{amount?.[1] ? `.${amount[1]}` : '.00'}</span>
    </>
  );
}

const Top: FC<TopProps> = ({ numExpendIncome, selectTime, setSelectTime }) => {
  const navigate = useNavigate();
  const { t } = useTranslation('record');
  const {
    visibleAmount,
    visibleAmountSwitch,
    isVisibleAmount,
    onToggleVisibleAmount,
  } = useVisibleAmount();
  const handleChangeDate = (time: string) => {
    sessionStorage.setItem('timeDate', time);
    setSelectTime(dayjs(time));
  };

  const handleSearch = useCallback(() => {
    navigate(ROUTES_PATH.SEARCH_RECORD.getPath());
  }, [navigate]);

  const handleCalendar = useCallback(() => {
    const calendarTime = dayjs().isSame(selectTime, 'month')
      ? dayjs().valueOf()
      : selectTime.valueOf();
    navigate(`${ROUTES_PATH.RECORD_CALENDAR.getPath()}?selectTime=${calendarTime}`);
  }, [navigate, selectTime]);

  const shortcuts = [
    {
      iconName: 'bill',
      key: 'bill',
      label: t('bill:title'),
      onClick: () => navigate(ROUTES_PATH.BILL.getPath()),
    },
    {
      iconName: 'budget',
      key: 'budget',
      label: t('budget:title'),
      onClick: () => navigate(ROUTES_PATH.BUDGET.getPath()),
    },
    {
      iconName: 'asset-steward',
      key: 'asset',
      label: t('common:commonFunctions.assetSteward'),
      onClick: () => navigate(ROUTES_PATH.ASSET.getPath()),
    },
  ];

  return (
    <RecordOverviewHeader
      accessory={visibleAmountSwitch
        ? (
            <button
              aria-label={visibleAmount ? t('detail.hideAmount') : t('detail.showAmount')}
              className="flex border-0 bg-transparent p-1 text-[#323334]"
              onClick={onToggleVisibleAmount}
              type="button"
            >
              {!visibleAmount
                ? <EyeOff size={18} strokeWidth={2} />
                : <Eye size={18} strokeWidth={2} />}
            </button>
          )
        : undefined}
      actions={(
        <>
          <button
            aria-label={t('search.title')}
            className="flex border-0 bg-transparent p-0 text-[#323334]"
            data-testid="record-search-action"
            onClick={handleSearch}
            type="button"
          >
            <Search size={18} strokeWidth={2} />
          </button>
          <button
            aria-label={t('calendar.title')}
            className="flex border-0 bg-transparent p-0 text-[#323334]"
            data-testid="record-calendar-action"
            onClick={handleCalendar}
            type="button"
          >
            <CalendarDays size={18} strokeWidth={2} />
          </button>
        </>
      )}
      metrics={[
        {
          content: (
            <RecordMonthPicker
              ariaLabel={t('calendar.selectMonth')}
              monthLabel={t('common:time.month')}
              onChange={value => handleChangeDate(dayjs(value).format('YYYY-MM-DD'))}
              value={selectTime.toDate()}
            />
          ),
          key: 'month',
          label: selectTime.format('YYYY年'),
        },
        {
          content: <AmountValue amount={numExpendIncome[1]} isVisible={isVisibleAmount} />,
          key: 'income',
          label: t('common:amount.income'),
        },
        {
          content: <AmountValue amount={numExpendIncome[0]} isVisible={isVisibleAmount} />,
          key: 'expense',
          label: t('common:amount.expend'),
        },
      ]}
      shortcuts={shortcuts}
      title={<LedgerTitleSwitcher />}
    />
  );
};

export default Top;
