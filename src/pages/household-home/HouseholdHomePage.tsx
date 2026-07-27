import type { FC } from 'react';
import type { FamilyRecord, Household } from '@/entities/household';
import { CalendarDays, Search, Settings, Target } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useHouseholdCalendarQuery, useInfiniteHouseholdRecordsQuery } from '@/entities/household';
import { RecordOverviewHeader } from '@/entities/record';
import {
  buildMonthRecordRange,
  formatMonthStart,
  HouseholdBottomNav,
  HouseholdMonthPicker,
  HouseholdRecordsPanelContent,
  HouseholdScopeBoundary,
  toMoney,
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
  const [month, setMonth] = useState(() => formatMonthStart(new Date()));
  const navigate = useNavigate();
  const filters = buildMonthRecordRange(month);
  const recordsQuery = useInfiniteHouseholdRecordsQuery({
    params: { filters: { ...filters, limit: 50, offset: 0 }, householdId: household.id },
    queryOptions: { enabled: Boolean(household.id) },
  });
  const calendarQuery = useHouseholdCalendarQuery({
    params: { householdId: household.id, month },
    queryOptions: { enabled: Boolean(household.id) },
  });
  const { t } = useTranslation('household');

  const handleRecord = (record: FamilyRecord) => {
    navigate(ROUTES_PATH.HOUSEHOLD_RECORD_DETAIL.getPath(household.id, record.id));
  };

  return (
    <>
      <RecordOverviewHeader
        actions={(
          <button
            aria-label={t('home.settings')}
            className="flex h-10 w-10 items-center justify-center rounded-full border-0 bg-white/70"
            onClick={() => navigate(ROUTES_PATH.HOUSEHOLD_SETTINGS.getPath(household.id))}
            type="button"
          >
            <Settings size={19} />
          </button>
        )}
        metrics={[
          {
            key: 'income',
            label: t('common.income'),
            testId: 'household-monthly-income',
            value: <span className="truncate text-base font-medium text-emerald-700">{toMoney(recordsQuery.data?.summary.income)}</span>,
          },
          {
            key: 'expense',
            label: t('common.expense'),
            testId: 'household-monthly-expense',
            value: <span className="truncate text-base font-medium text-rose-600">{toMoney(recordsQuery.data?.summary.expense)}</span>,
          },
        ]}
        period={{
          label: t('common.yearLabel', { year: month.slice(0, 4) }),
          value: (
            <HouseholdMonthPicker
              month={month}
              monthLabel={t('common.month')}
              onChange={setMonth}
              variant="detail"
            />
          ),
          valueWidth: 'cell',
        }}
        renderTitle={className => (
          <div className={`${className} min-w-0 text-left`}>
            <h1 className="text-2xl font-semibold">{t('home.title')}</h1>
            <p className="mt-1 text-xs opacity-70">{t('entry.sharedSince', { month: household.sharedStartMonth.slice(0, 7) })}</p>
          </div>
        )}
        shortcuts={MENU_ITEMS.map(({ icon: ShortcutIcon, key, route }) => ({
          icon: <ShortcutIcon size={20} />,
          key,
          label: t(`home.${key}`),
          onClick: () => navigate(route.getPath(household.id)),
          testId: `household-${key}`,
        }))}
        shortcutsTestId="household-shortcuts-card"
        testId="household-home-header"
        titleAlignment="start"
      />
      <main className="min-h-0 flex-grow overflow-auto px-3 pb-[84px] pt-3">
        <HouseholdRecordsPanelContent
          dailyTotals={calendarQuery.days}
          emptyDescription={t('home.emptyDescription')}
          isCompactGrouped
          onSelect={handleRecord}
          query={recordsQuery}
          showSummary={false}
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
