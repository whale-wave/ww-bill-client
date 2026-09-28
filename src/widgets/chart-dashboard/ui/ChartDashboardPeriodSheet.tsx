import type { FC } from 'react';
import type { SelectableDashboardPeriod } from '../model/dashboard-period-picker';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from '@/shared/i18n';
import { AppSheet, SheetHeader } from '@/shared/ui';
import { getDashboardPeriodChoices, getDashboardPeriodTitle, getDashboardPeriodYear } from '../model/dashboard-period-picker';

interface Props {
  anchorDate: string;
  onClose: () => void;
  onSelect: (anchorDate: string) => void;
  period: SelectableDashboardPeriod;
  selectedStart: string;
  today: string;
  visible: boolean;
}

export const ChartDashboardPeriodSheet: FC<Props> = ({ anchorDate, onClose, onSelect, period, selectedStart, today, visible }) => {
  const { t } = useTranslation('chart');
  const [viewYear, setViewYear] = useState(() => getDashboardPeriodYear(period, anchorDate));
  const currentYear = getDashboardPeriodYear(period, today);
  const yearStep = period === 'year' ? 10 : 1;
  const choices = useMemo(() => getDashboardPeriodChoices(period, viewYear, today), [period, today, viewYear]);
  const yearLabel = period === 'year' ? `${Math.max(1900, viewYear - 9)} — ${viewYear}` : String(viewYear);

  return (
    <AppSheet bodyClassName="max-h-[84dvh] w-full overflow-hidden rounded-t-[28px]" closeOnMaskClick material="opaque" onClose={onClose} visible={visible}>
      <section aria-label={t('dashboard.choosePeriod')} className="flex max-h-[84dvh] flex-col overflow-hidden bg-ww-surface" data-tab-swipe-ignore>
        <SheetHeader closeLabel={t('dashboard.close')} onClose={onClose} title={t('dashboard.choosePeriod')} />
        <div className="flex shrink-0 items-center justify-between border-b border-border-primary px-5 py-1">
          <button
            aria-label={t('dashboard.earlierYear')}
            className="flex h-11 w-11 items-center justify-center rounded-full border-0 text-primary-deep disabled:text-ww-soft"
            disabled={viewYear <= 1900}
            onClick={() => setViewYear(year => Math.max(1900, year - yearStep))}
            type="button"
          >
            <ChevronLeft aria-hidden size={20} />
          </button>
          <span className="font-number text-[14px] font-bold text-ww-ink">{yearLabel}</span>
          <button
            aria-label={t('dashboard.laterYear')}
            className="flex h-11 w-11 items-center justify-center rounded-full border-0 text-primary-deep disabled:text-ww-soft"
            disabled={viewYear >= currentYear}
            onClick={() => setViewYear(year => Math.min(currentYear, year + yearStep))}
            type="button"
          >
            <ChevronRight aria-hidden size={20} />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-3">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {choices.map((choice) => {
              const selected = choice.startDate === selectedStart;
              return (
                <button
                  aria-pressed={selected}
                  className={`flex min-h-14 items-center justify-between gap-3 rounded-2xl border border-solid px-4 py-2 text-left ${selected ? 'border-primary bg-primary-light text-primary-deep' : 'border-border-primary bg-ww-surface-raised text-ww-ink'}`}
                  key={choice.anchorDate}
                  onClick={() => onSelect(choice.anchorDate)}
                  type="button"
                >
                  <span className="min-w-0">
                    <span className="block text-[14px] font-bold">{getDashboardPeriodTitle(period, choice.anchorDate, today, t)}</span>
                    <span className="mt-0.5 block font-number text-[11px] text-ww-mid">
                      {choice.startDate}
                      {' '}
                      —
                      {' '}
                      {choice.endDate}
                    </span>
                  </span>
                  {selected && <Check aria-hidden className="shrink-0" size={18} />}
                </button>
              );
            })}
          </div>
        </div>
      </section>
    </AppSheet>
  );
};
