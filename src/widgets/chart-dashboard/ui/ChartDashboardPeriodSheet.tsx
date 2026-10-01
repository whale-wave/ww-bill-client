import type { FC } from 'react';
import type { SelectableDashboardPeriod } from '../model/dashboard-period-picker';
import { PeriodSelectionPanel } from '@ww-bill/bill-ui';
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
      <PeriodSelectionPanel
        ariaLabel={t('dashboard.choosePeriod')}
        header={<SheetHeader closeLabel={t('dashboard.close')} onClose={onClose} title={t('dashboard.choosePeriod')} />}
        year={yearLabel}
        previous={<button aria-label={t('dashboard.earlierYear')} className={`bill-period-selection__year-button${viewYear <= 1900 ? ' bill-period-selection__year-button--disabled' : ''}`} disabled={viewYear <= 1900} onClick={() => setViewYear(year => Math.max(1900, year - yearStep))} type="button"><ChevronLeft aria-hidden size={20} /></button>}
        next={<button aria-label={t('dashboard.laterYear')} className={`bill-period-selection__year-button${viewYear >= currentYear ? ' bill-period-selection__year-button--disabled' : ''}`} disabled={viewYear >= currentYear} onClick={() => setViewYear(year => Math.min(currentYear, year + yearStep))} type="button"><ChevronRight aria-hidden size={20} /></button>}
        choices={choices.map(choice => ({ ...choice, title: getDashboardPeriodTitle(period, choice.anchorDate, today, t) }))}
        selectedStart={selectedStart}
        selectedIcon={<Check aria-hidden className="shrink-0" size={18} />}
        onSelect={onSelect}
      />
    </AppSheet>
  );
};
