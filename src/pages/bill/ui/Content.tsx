import type { FC } from 'react';
import type { Bill } from '@/entities/record';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useBillPageStore } from '@/pages/bill/model';
import { BillTabsType } from '@/pages/bill/types';
import { ROUTES_PATH } from '@/shared/config/routes';
import { formatAmount } from '@/shared/lib';
import { DesignIcon, IllustratedEmptyState } from '@/shared/ui';

type DataItem = {
  period: string;
  month: string;
} & Bill;

interface ContentProps {
  data: DataItem[];
  onMonthSelect?: (period: string) => void;
}

const Content: FC<ContentProps> = memo(({ data, onMonthSelect }) => {
  const { t } = useTranslation('bill');
  const navigate = useNavigate();
  const billTabType = useBillPageStore(({ billTabType }) => billTabType);
  const isMonthTabType = billTabType === BillTabsType.MONTH;

  return (
    <section className="pb-4">
      <div className="flex items-center justify-between px-1 pb-[10px]">
        <h2 className="text-[14px] font-bold leading-[21px] text-ww-ink">
          {isMonthTabType ? t('monthlyDetail') : t('yearlyDetail')}
        </h2>
        <span className="font-number text-[12px] font-semibold text-ww-soft">
          {data.length}
          {t('period')}
        </span>
      </div>
      {data.length === 0
        ? (
            <div className="overflow-hidden rounded-[20px] border border-border-primary bg-white/75 shadow-ww-xs backdrop-blur-xl">
              <IllustratedEmptyState
                accentIcon={<DesignIcon name="tab-add" size={20} />}
                actionLabel={t('emptyAction')}
                className="min-h-[300px]"
                description={t('emptyDescription')}
                icon={<DesignIcon name="shortcut-bill" size={46} />}
                onAction={() => navigate(ROUTES_PATH.BOOKKEEPING.getPath())}
                testId="bill-empty-state"
                title={t('emptyTitle')}
              />
            </div>
          )
        : (
            <ul className="overflow-hidden rounded-[20px] border border-border-primary bg-white/85 shadow-ww-xs backdrop-blur-xl">
              {data.map((item, index) => {
                const isClickable = isMonthTabType && Boolean(onMonthSelect);
                return (
                  <li
                    className={index > 0 ? 'relative ml-[14px] flex min-h-[72px] items-center border-t border-solid border-[rgba(110,194,220,0.16)] pr-[14px]' : 'flex min-h-[72px] items-center px-[14px]'}
                    data-testid="bill-period-row"
                    key={item.month}
                  >
                    <button
                      aria-label={isClickable ? `${item.month}${t('detail')}` : undefined}
                      className="flex h-full w-full items-center bg-transparent text-left outline-none transition-colors active:bg-primary-light/25 focus-visible:bg-primary-light/25"
                      data-bill-month={isClickable ? item.period : undefined}
                      disabled={!isClickable}
                      onClick={() => onMonthSelect?.(item.period)}
                      type="button"
                    >
                      <div
                        className={`${isMonthTabType ? 'w-[52px] pr-1' : 'w-[68px] pr-3'} shrink-0 whitespace-nowrap font-number text-[15px] font-extrabold text-ww-ink`}
                      >
                        {item.month}
                      </div>
                      <dl
                        className="grid min-w-0 flex-1 grid-cols-3 items-center gap-x-1"
                        data-testid="bill-period-metrics"
                      >
                        <div className="min-w-0">
                          <dt className="whitespace-nowrap text-[9px] font-semibold leading-4 text-ww-soft">{t('income')}</dt>
                          <dd className="whitespace-nowrap font-number text-[clamp(9px,3vw,12px)] font-bold leading-4 text-finance-income">
                            ¥
                            {formatAmount(item.income)}
                          </dd>
                        </div>
                        <div className="min-w-0 text-center">
                          <dt className="whitespace-nowrap text-[9px] font-semibold leading-4 text-ww-soft">{t('expend')}</dt>
                          <dd className="whitespace-nowrap font-number text-[clamp(9px,3vw,12px)] font-bold leading-4 text-finance-expense">
                            ¥
                            {formatAmount(item.expand)}
                          </dd>
                        </div>
                        <div className="min-w-0 text-right">
                          <dt className="whitespace-nowrap text-[9px] font-semibold leading-4 text-ww-soft">{t('balance')}</dt>
                          <dd className="whitespace-nowrap font-number text-[clamp(9px,3vw,12px)] font-extrabold leading-4 text-primary-deep">
                            ¥
                            {formatAmount(item.balance)}
                          </dd>
                        </div>
                      </dl>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
    </section>
  );
});

export default Content;
