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
                    className={index > 0 ? 'relative ml-[18px] flex min-h-[88px] items-center border-t border-solid border-[rgba(110,194,220,0.16)] pr-[18px]' : 'flex min-h-[88px] items-center px-[18px]'}
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
                      <div className="w-[42px] shrink-0 font-number text-[17px] font-extrabold text-ww-ink">{item.month}</div>
                      <dl className="grid min-w-0 flex-1 grid-cols-2 gap-x-3 gap-y-1.5">
                        <div>
                          <dt className="text-[10px] font-semibold text-ww-soft">{t('income')}</dt>
                          <dd className="whitespace-nowrap font-number text-[clamp(11px,3.5vw,13px)] font-bold text-finance-income">
                            ¥
                            {formatAmount(item.income)}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-[10px] font-semibold text-ww-soft">{t('expend')}</dt>
                          <dd className="whitespace-nowrap font-number text-[clamp(11px,3.5vw,13px)] font-bold text-finance-expense">
                            ¥
                            {formatAmount(item.expand)}
                          </dd>
                        </div>
                        <div className="col-span-2 flex min-w-0 items-baseline justify-between gap-3 border-t border-[rgba(110,194,220,0.12)] pt-1">
                          <dt className="shrink-0 text-[10px] font-semibold text-ww-soft">{t('balance')}</dt>
                          <dd className="whitespace-nowrap font-number text-[clamp(12px,3.8vw,14px)] font-extrabold text-primary-deep">
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
