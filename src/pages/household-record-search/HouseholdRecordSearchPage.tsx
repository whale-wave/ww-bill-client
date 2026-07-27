import type { FC, FormEvent } from 'react';
import type { FamilyRecord, GetHouseholdRecordsApiParams } from '@/entities/household';
import { Button, Popup } from 'antd-mobile';
import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { FamilyRecordPolicy, useHouseholdMembersQuery } from '@/entities/household';
import { HouseholdRecordsPanel, HouseholdScopeBoundary } from '@/features/household';
import { ROUTES_PATH } from '@/shared/config/routes';
import { useTranslation } from '@/shared/i18n';
import { RecordSearchHeader } from '@/shared/ui';

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
    ...(searchParams.get('keyword') ? { keyword: searchParams.get('keyword')! } : {}),
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
  householdId: string;
  isVisible: boolean;
  onClose: () => void;
  onReset: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  searchParams: URLSearchParams;
}

const AdvancedFilters: FC<AdvancedFiltersProps> = ({
  householdId,
  isVisible,
  onClose,
  onReset,
  onSubmit,
  searchParams,
}) => {
  const { t } = useTranslation('household');
  const membersQuery = useHouseholdMembersQuery({ params: { householdId } });

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
  const { t } = useTranslation('household');
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isFiltersVisible, setIsFiltersVisible] = useState(false);
  const filters = getFilters(searchParams);

  const handleKeywordChange = (keyword: string) => {
    const next = new URLSearchParams(searchParams);
    if (keyword)
      next.set('keyword', keyword);
    else
      next.delete('keyword');
    setSearchParams(next, { replace: true });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const next = new URLSearchParams();
    const keyword = searchParams.get('keyword');
    if (keyword)
      next.set('keyword', keyword);
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

  const handleSelect = (record: FamilyRecord) => {
    navigate(ROUTES_PATH.HOUSEHOLD_RECORD_DETAIL.getPath(householdId, record.id));
  };

  return (
    <>
      <RecordSearchHeader
        action={<button className="shrink-0 border-0 bg-transparent px-2 text-sm text-font-black" data-testid="household-record-filter-action" onClick={() => setIsFiltersVisible(true)} type="button">{t('records.filter')}</button>}
        value={searchParams.get('keyword') ?? ''}
        placeholder={t('records.keywordPlaceholder')}
        onBack={() => navigate(-1)}
        onChange={handleKeywordChange}
      />
      <main className="min-h-0 flex-grow overflow-auto bg-bg-gray pt-[48px]">
        <HouseholdScopeBoundary householdId={householdId}>
          {() => (
            <>
              <HouseholdRecordsPanel
                filters={filters}
                householdId={householdId}
                isCompactGrouped
                onSelect={handleSelect}
                showSummary={false}
              />
              <AdvancedFilters
                householdId={householdId}
                isVisible={isFiltersVisible}
                onClose={() => setIsFiltersVisible(false)}
                onReset={handleReset}
                onSubmit={handleSubmit}
                searchParams={searchParams}
              />
            </>
          )}
        </HouseholdScopeBoundary>
      </main>
    </>
  );
};

const HouseholdRecordSearchPage: FC = () => {
  const { householdId = '' } = useParams<{ householdId: string }>();
  return (
    <div className="page-new overflow-hidden bg-bg-gray">
      <SearchContent householdId={householdId} />
    </div>
  );
};

export default HouseholdRecordSearchPage;
