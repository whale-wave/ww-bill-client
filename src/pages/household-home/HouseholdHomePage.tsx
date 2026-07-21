import type { FC } from 'react';
import type { FamilyRecord, Household } from '@/entities/household';
import { CalendarDays, Search, Settings, Target } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  buildMonthRecordRange,
  formatMonthStart,
  HouseholdBottomNav,
  HouseholdMonthPicker,
  HouseholdRecordsPanel,
  HouseholdScopeBoundary,
} from '@/features/household';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';

const MENU_ITEMS = [
  { icon: Target, key: 'budget', route: ROUTES_PATH.HOUSEHOLD_BUDGETS },
  { icon: Search, key: 'search', route: ROUTES_PATH.HOUSEHOLD_RECORD_SEARCH },
  { icon: CalendarDays, key: 'calendar', route: ROUTES_PATH.HOUSEHOLD_CALENDAR },
  { icon: Settings, key: 'settings', route: ROUTES_PATH.HOUSEHOLD_SETTINGS },
] as const;

const HouseholdHomeContent: FC<{ household: Household }> = ({ household }) => {
  const { t } = useTranslation('household');
  const navigate = useNavigate();
  const [month, setMonth] = useState(() => formatMonthStart(new Date()));
  const filters = buildMonthRecordRange(month);

  const handleRecord = (record: FamilyRecord) => {
    navigate(ROUTES_PATH.HOUSEHOLD_RECORD_DETAIL.getPath(household.id, record.id));
  };

  return (
    <>
      <header className="bg-primary px-3 pb-4 pt-5 text-font-black">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">{t('home.title')}</h1>
            <p className="mt-1 text-xs opacity-70">{t('entry.sharedSince', { month: household.sharedStartMonth.slice(0, 7) })}</p>
          </div>
          <button
            aria-label={t('home.settings')}
            className="flex h-10 w-10 items-center justify-center rounded-full border-0 bg-white/70"
            onClick={() => navigate(ROUTES_PATH.HOUSEHOLD_SETTINGS.getPath(household.id))}
            type="button"
          >
            <Settings size={19} />
          </button>
        </div>
        <div className="mt-4">
          <HouseholdMonthPicker
            month={month}
            nextLabel={t('common.nextMonth')}
            onChange={setMonth}
            previousLabel={t('common.previousMonth')}
          />
        </div>
      </header>
      <main className="min-h-0 flex-grow overflow-auto px-3 pb-[84px] pt-3">
        <section className="card-rounded mb-3 grid grid-cols-4 bg-white py-3">
          {MENU_ITEMS.map(({ icon: Icon, key, route }) => (
            <button
              className="border-0 bg-white text-center text-xs text-font-gray"
              data-testid={`household-${key}`}
              key={key}
              onClick={() => navigate(route.getPath(household.id))}
              type="button"
            >
              <span className="mx-auto mb-1 flex h-9 w-9 items-center justify-center rounded-full bg-bg-gray text-font-black">
                <Icon size={18} />
              </span>
              {t(`home.${key}`)}
            </button>
          ))}
        </section>
        <HouseholdRecordsPanel
          emptyDescription={t('home.emptyDescription')}
          filters={filters}
          householdId={household.id}
          onSelect={handleRecord}
        />
      </main>
      <HouseholdBottomNav
        active="details"
        chartsLabel={t('home.chartsTab')}
        detailsLabel={t('home.detailsTab')}
        onCharts={() => navigate(ROUTES_PATH.HOUSEHOLD_CHARTS.getPath(household.id))}
        onDetails={() => undefined}
      />
    </>
  );
};

const HouseholdHomePage: FC = () => {
  const { householdId = '' } = useParams<{ householdId: string }>();
  return (
    <div className="page-new overflow-hidden bg-bg-gray">
      <HouseholdScopeBoundary householdId={householdId}>
        {household => <HouseholdHomeContent household={household} />}
      </HouseholdScopeBoundary>
    </div>
  );
};

export default HouseholdHomePage;
