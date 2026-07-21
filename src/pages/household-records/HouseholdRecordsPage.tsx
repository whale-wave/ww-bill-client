import type { FC } from 'react';
import type { FamilyRecord, Household } from '@/entities/household';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  buildMonthRecordRange,
  formatMonthStart,
  HouseholdMonthPicker,
  HouseholdRecordsPanel,
  HouseholdScopeBoundary,
} from '@/features/household';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';
import { NavBar } from '@/shared/ui';

const RecordsContent: FC<{ household: Household }> = ({ household }) => {
  const { t } = useTranslation('household');
  const navigate = useNavigate();
  const [month, setMonth] = useState(() => formatMonthStart(new Date()));
  const handleRecord = (record: FamilyRecord) => {
    navigate(ROUTES_PATH.HOUSEHOLD_RECORD_DETAIL.getPath(household.id, record.id));
  };

  return (
    <>
      <div className="px-3 py-3">
        <HouseholdMonthPicker
          month={month}
          nextLabel={t('common.nextMonth')}
          onChange={setMonth}
          previousLabel={t('common.previousMonth')}
        />
      </div>
      <div className="px-3 pb-4">
        <HouseholdRecordsPanel
          filters={buildMonthRecordRange(month)}
          householdId={household.id}
          onSelect={handleRecord}
        />
      </div>
    </>
  );
};

const HouseholdRecordsPage: FC = () => {
  const { t } = useTranslation('household');
  const navigate = useNavigate();
  const { householdId = '' } = useParams<{ householdId: string }>();
  return (
    <div className="page-new overflow-hidden bg-bg-gray">
      <NavBar
        back={t('common:nav.back')}
        onBack={() => navigate(-1)}
        right={(
          <button className="border-0 bg-transparent text-sm text-font-black" onClick={() => navigate(ROUTES_PATH.HOUSEHOLD_RECORD_SEARCH.getPath(householdId))} type="button">
            {t('home.search')}
          </button>
        )}
      >
        {t('records.title')}
      </NavBar>
      <main className="min-h-0 flex-grow overflow-auto">
        <HouseholdScopeBoundary householdId={householdId}>
          {household => <RecordsContent household={household} />}
        </HouseholdScopeBoundary>
      </main>
    </div>
  );
};

export default HouseholdRecordsPage;
