import type { FC, FormEvent } from 'react';
import type { FamilyRecord, GetHouseholdRecordsApiParams } from '@/entities/household';
import { Button, Popup } from 'antd-mobile';
import { useCallback, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FamilyRecordPolicy,
  HouseholdStatus,
  useHouseholdMembersQuery,
  useInfiniteHouseholdRecordsQuery,
  useMyHouseholdQuery,
} from '@/entities/household';
import { RecordSearchPresentation } from '@/entities/record';
import { toHouseholdRecordOverviewGroups } from '@/features/household';
import { useRecordSearchController } from '@/features/record-search';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';

function getFilters(searchParams: URLSearchParams): GetHouseholdRecordsApiParams {
  const type = searchParams.get('type');
  const memberUserId = Number(searchParams.get('memberUserId'));
  const categoryIds = (searchParams.get('categoryIds') ?? '')
    .split(',')
    .map(Number)
    .filter(value => Number.isInteger(value) && value > 0);
  const tagIds = (searchParams.get('tagIds') ?? '').split(',').map(value => value.trim()).filter(Boolean);
  const policy = searchParams.get('policy');
  return {
    ...(categoryIds.length ? { categoryIds } : {}),
    ...(searchParams.get('countedOnly') === 'true' ? { countedOnly: true } : {}),
    ...(searchParams.get('endDate') ? { endDate: searchParams.get('endDate')! } : {}),
    ...((searchParams.get('q') ?? searchParams.get('keyword'))
      ? { keyword: (searchParams.get('q') ?? searchParams.get('keyword'))! }
      : {}),
    ...(searchParams.get('maxAmount') ? { maxAmount: searchParams.get('maxAmount')! } : {}),
    ...(Number.isInteger(memberUserId) && memberUserId > 0 ? { memberUserId } : {}),
    ...(searchParams.get('minAmount') ? { minAmount: searchParams.get('minAmount')! } : {}),
    ...(Object.values(FamilyRecordPolicy).includes(policy as FamilyRecordPolicy)
      ? { policy: policy as FamilyRecordPolicy }
      : {}),
    ...(searchParams.get('startDate') ? { startDate: searchParams.get('startDate')! } : {}),
    ...(type === 'add' || type === 'sub' ? { type } : {}),
    ...(tagIds.length ? { tagIds } : {}),
  };
}

interface AdvancedFiltersProps {
  enabled: boolean;
  householdId: string;
  isVisible: boolean;
  onClose: () => void;
  onReset: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  searchParams: URLSearchParams;
}

const AdvancedFilters: FC<AdvancedFiltersProps> = ({
  enabled,
  householdId,
  isVisible,
  onClose,
  onReset,
  onSubmit,
  searchParams,
}) => {
  const { t } = useTranslation('household');
  const membersQuery = useHouseholdMembersQuery({
    params: { householdId },
    queryOptions: { enabled },
  });

  return (
    <Popup destroyOnClose position="bottom" showCloseButton visible={isVisible} onClose={onClose}>
      <form className="max-h-[75vh] overflow-auto bg-white px-3 pb-4 pt-10" data-testid="household-record-filters" onSubmit={onSubmit}>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <label className="text-xs text-font-gray">
            {t('records.type')}
            <select className="mt-1 h-11 w-full rounded-[5px] border-0 bg-bg-gray px-3 text-sm text-font-black" defaultValue={searchParams.get('type') ?? ''} name="type">
              <option value="">{t('records.all')}</option>
              <option value="add">{t('common.income')}</option>
              <option value="sub">{t('common.expense')}</option>
            </select>
          </label>
          <label className="text-xs text-font-gray">
            {t('records.member')}
            <select className="mt-1 h-11 w-full rounded-[5px] border-0 bg-bg-gray px-3 text-sm text-font-black" defaultValue={searchParams.get('memberUserId') ?? ''} name="memberUserId">
              <option value="">{t('records.all')}</option>
              {membersQuery.data.map(member => (
                <option key={member.id} value={member.user.id}>{member.nickname}</option>
              ))}
            </select>
          </label>
          <label className="text-xs text-font-gray">
            {t('records.startDate')}
            <input className="mt-1 h-11 w-full rounded-[5px] border-0 bg-bg-gray px-2 text-sm" defaultValue={searchParams.get('startDate') ?? ''} name="startDate" type="date" />
          </label>
          <label className="text-xs text-font-gray">
            {t('records.endDate')}
            <input className="mt-1 h-11 w-full rounded-[5px] border-0 bg-bg-gray px-2 text-sm" defaultValue={searchParams.get('endDate') ?? ''} name="endDate" type="date" />
          </label>
          <label className="text-xs text-font-gray">
            {t('records.minAmount')}
            <input className="mt-1 h-11 w-full rounded-[5px] border-0 bg-bg-gray px-3 text-sm" defaultValue={searchParams.get('minAmount') ?? ''} name="minAmount" type="number" />
          </label>
          <label className="text-xs text-font-gray">
            {t('records.maxAmount')}
            <input className="mt-1 h-11 w-full rounded-[5px] border-0 bg-bg-gray px-3 text-sm" defaultValue={searchParams.get('maxAmount') ?? ''} name="maxAmount" type="number" />
          </label>
          <label className="text-xs text-font-gray">
            {t('records.categoryIds')}
            <input className="mt-1 h-11 w-full rounded-[5px] border-0 bg-bg-gray px-3 text-sm" defaultValue={searchParams.get('categoryIds') ?? ''} name="categoryIds" placeholder={t('records.categoryIdsPlaceholder')} />
          </label>
          <label className="text-xs text-font-gray">
            {t('records.tagIds')}
            <input className="mt-1 h-11 w-full rounded-[5px] border-0 bg-bg-gray px-3 text-sm" defaultValue={searchParams.get('tagIds') ?? ''} name="tagIds" placeholder={t('records.tagIdsPlaceholder')} />
          </label>
          <label className="text-xs text-font-gray">
            {t('records.policy')}
            <select className="mt-1 h-11 w-full rounded-[5px] border-0 bg-bg-gray px-3 text-sm" defaultValue={searchParams.get('policy') ?? ''} name="policy">
              <option value="">{t('records.all')}</option>
              {Object.values(FamilyRecordPolicy).map(policy => <option key={policy} value={policy}>{t(`policy.${policy}`)}</option>)}
            </select>
          </label>
          <label className="flex items-center gap-2 self-end py-3 text-xs text-font-black">
            <input defaultChecked={searchParams.get('countedOnly') === 'true'} name="countedOnly" type="checkbox" value="true" />
            {t('records.countedOnly')}
          </label>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Button block onClick={onReset}>{t('records.reset')}</Button>
          <Button block color="primary" type="submit">{t('records.filter')}</Button>
        </div>
      </form>
    </Popup>
  );
};

const SearchContent: FC<{ householdId: string }> = ({ householdId }) => {
  const { i18n, t } = useTranslation('household');
  const navigate = useNavigate();
  const search = useRecordSearchController();
  const { searchParams, setSearchParams } = search;
  const [isFiltersVisible, setIsFiltersVisible] = useState(false);
  const scopeQuery = useMyHouseholdQuery({
    queryOptions: { enabled: Boolean(householdId) },
  });
  const isScopeReady = Boolean(
    householdId
    && scopeQuery.data?.id === householdId
    && scopeQuery.data.status !== HouseholdStatus.DISSOLVED
    && scopeQuery.data.status !== HouseholdStatus.PENDING_PARTNER,
  );
  const filters = getFilters(searchParams);
  const isSearchActive = Object.keys(filters).length > 0;
  const queryFilters = {
    ...filters,
    ...(search.debouncedValue ? { keyword: search.debouncedValue } : {}),
  };
  const query = useInfiniteHouseholdRecordsQuery({
    params: {
      filters: { ...queryFilters, limit: 50, offset: 0 },
      householdId,
    },
    queryOptions: {
      enabled: isScopeReady
        && (Object.keys(queryFilters).length > 0),
    },
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const next = new URLSearchParams();
    const keyword = search.value;
    if (keyword)
      next.set('q', keyword);
    for (const key of [
      'type',
      'memberUserId',
      'startDate',
      'endDate',
      'categoryIds',
      'tagIds',
      'minAmount',
      'maxAmount',
      'policy',
      'countedOnly',
    ]) {
      const value = String(data.get(key) ?? '').trim();
      if (value)
        next.set(key, value);
    }
    setSearchParams(next, { replace: true });
    setIsFiltersVisible(false);
  };

  const handleReset = () => {
    setSearchParams({}, { replace: true });
    setIsFiltersVisible(false);
  };

  const handleSelect = useCallback((record: FamilyRecord) => {
    navigate(ROUTES_PATH.HOUSEHOLD_RECORD_DETAIL.getPath(householdId, record.id));
  }, [householdId, navigate]);

  const groups = useMemo(() => toHouseholdRecordOverviewGroups(query.records, {
    countedLabel: t('records.counted'),
    dailyExpenseLabel: t('records.dailyExpense'),
    dailyIncomeLabel: t('records.dailyIncome'),
    inheritedLabel: t('records.inherited'),
    locale: i18n.resolvedLanguage ?? i18n.language,
    memberLabel: name => t('records.memberAttribution', { name }),
    onSelect: handleSelect,
    privateLabel: t('records.private'),
    uncountedLabel: t('records.uncounted'),
  }), [handleSelect, i18n.language, i18n.resolvedLanguage, query.records, t]);

  return (
    <>
      <RecordSearchPresentation
        action={{
          label: t('records.filter'),
          onClick: () => setIsFiltersVisible(true),
          testId: 'household-record-filter-action',
        }}
        errorDescription={t('common.loadErrorDescription')}
        groups={groups}
        onBack={() => navigate(-1)}
        onKeywordChange={search.setValue}
        onRetry={() => void (isScopeReady ? query.refetch() : scopeQuery.refetch())}
        placeholder={t('records.keywordPlaceholder')}
        retryLabel={t('common.retry')}
        state={scopeQuery.isLoading
          ? 'loading'
          : scopeQuery.isError || !isScopeReady
            ? 'error'
            : !isSearchActive
                ? 'idle'
                : search.isDebouncing || query.isLoading
                  ? 'loading'
                  : query.isError
                    ? 'error'
                    : 'ready'}
        value={search.value}
      />
      <AdvancedFilters
        enabled={isScopeReady && isFiltersVisible}
        householdId={householdId}
        isVisible={isFiltersVisible}
        onClose={() => setIsFiltersVisible(false)}
        onReset={handleReset}
        onSubmit={handleSubmit}
        searchParams={searchParams}
      />
    </>
  );
};

const HouseholdRecordSearchPage: FC = () => {
  const { householdId = '' } = useParams<{ householdId: string }>();
  return <SearchContent householdId={householdId} />;
};

export default HouseholdRecordSearchPage;
