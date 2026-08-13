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
  month: string;
} & Bill;

interface ContentProps {
  data: DataItem[];
}

const Content: FC<ContentProps> = memo(({ data }) => {
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
              {data.map((item, index) => (
                <li
                  className={index > 0 ? 'relative ml-[18px] flex h-[74px] items-center border-t border-solid border-[rgba(110,194,220,0.16)] pr-[18px]' : 'flex h-[74px] items-center px-[18px]'}
                  key={item.month}
                >
                  <div className="w-[58px] shrink-0 font-number text-[18px] font-extrabold text-ww-ink">{item.month}</div>
                  <dl className="grid min-w-0 flex-1 grid-cols-2 gap-2">
                    <div className="min-w-0">
                      <dt className="text-[10px] font-semibold text-ww-soft">{t('income')}</dt>
                      <dd className="truncate font-number text-[13px] font-bold text-[#2a9460]">
                        ¥
                        {formatAmount(item.income)}
                      </dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-[10px] font-semibold text-ww-soft">{t('expend')}</dt>
                      <dd className="truncate font-number text-[13px] font-bold text-[#c04870]">
                        ¥
                        {formatAmount(item.expand)}
                      </dd>
                    </div>
                  </dl>
                  <div className="ml-2 w-[78px] min-w-0 text-right">
                    <div className="text-[10px] font-semibold text-ww-soft">{t('balance')}</div>
                    <div className="truncate font-number text-[14px] font-extrabold text-primary-deep">
                      ¥
                      {formatAmount(item.balance)}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
    </section>
  );
});

export default Content;
